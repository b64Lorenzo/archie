use archive_manager::{commands, scanner::Scanner, duplicates::DuplicateFinder, utils::FileType};
use std::{path::PathBuf, sync::atomic::{AtomicUsize, Ordering}};
static NEXT: AtomicUsize = AtomicUsize::new(0);
struct Fixture(PathBuf);
impl Fixture {
    fn new() -> Self {
        let base = std::env::var_os("TMPDIR").map(PathBuf::from).unwrap_or_else(std::env::temp_dir);
        let path = base.join(format!("archive-test-{}-{}", std::process::id(), NEXT.fetch_add(1, Ordering::Relaxed)));
        std::fs::create_dir_all(&path).unwrap(); Self(path)
    }
    fn path(&self) -> String { self.0.to_string_lossy().into_owned() }
    fn put(&self, name: &str, data: &[u8]) { let p=self.0.join(name); std::fs::create_dir_all(p.parent().unwrap()).unwrap(); std::fs::write(p,data).unwrap(); }
}
impl Drop for Fixture { fn drop(&mut self) { let _=std::fs::remove_dir_all(&self.0); } }
#[test]
fn renamed_duplicates_remain_protected() {
    let f=Fixture::new(); f.put("a.txt",b"same"); f.put("b.txt",b"same");
    DuplicateFinder::find_duplicates(&f.path()).unwrap();
    commands::rename_file(f.0.join("a.txt").to_string_lossy().into_owned(),"renamed.txt".into()).unwrap();
    commands::delete_file(f.0.join("b.txt").to_string_lossy().into_owned()).unwrap();
    assert!(commands::delete_file(f.0.join("renamed.txt").to_string_lossy().into_owned()).is_err());
}
#[test]
fn zero_search_limit_returns_no_results() {
    let f=Fixture::new(); f.put("search-me.txt",b"x"); Scanner::scan_directory(&f.path(),true).unwrap();
    assert!(commands::search_files("search-me".into(),Some(0)).unwrap().is_empty());
}
#[test]
fn md5_collision_is_not_a_duplicate() {
    // Wang/Yu collision pair reproduced by Peter Selinger, MD5 Collision Demo.
    let a="d131dd02c5e6eec4693d9a0698aff95c2fcab58712467eab4004583eb8fb7f8955ad340609f4b30283e488832571415a085125e8f7cdc99fd91dbdf280373c5bd8823e3156348f5bae6dacd436c919c6dd53e2b487da03fd02396306d248cda0e99f33420f577ee8ce54b67080a80d1ec69821bcb6a8839396f9652b6ff72a70";
    let b="d131dd02c5e6eec4693d9a0698aff95c2fcab50712467eab4004583eb8fb7f8955ad340609f4b30283e4888325f1415a085125e8f7cdc99fd91dbd7280373c5bd8823e3156348f5bae6dacd436c919c6dd53e23487da03fd02396306d248cda0e99f33420f577ee8ce54b67080280d1ec69821bcb6a8839396f965ab6ff72a70";
    let decode=|s: &str| (0..s.len()).step_by(2).map(|i|u8::from_str_radix(&s[i..i+2],16).unwrap()).collect::<Vec<_>>();
    let (a,b)=(decode(a),decode(b)); assert_eq!(md5::compute(&a),md5::compute(&b)); assert_ne!(a,b);
    let f=Fixture::new(); f.put("a.pdf",&a); f.put("b.pdf",&b);
    assert_eq!(DuplicateFinder::find_duplicates(&f.path()).unwrap().total_groups,0);
}
#[test]
fn deletion_preserves_last_discovered_duplicate_and_invalidates_scan() {
    let f=Fixture::new(); f.put("a.txt",b"same"); f.put("b.txt",b"same");
    Scanner::scan_directory(&f.path(),true).unwrap();
    let duplicates=DuplicateFinder::find_duplicates(&f.path()).unwrap();
    let files=&duplicates.duplicates[0].files;
    commands::delete_file(files[0].path.clone()).unwrap();
    assert!(commands::delete_file(files[1].path.clone()).is_err());
    assert_eq!(Scanner::scan_directory(&f.path(),false).unwrap().files.len(),1);
}
#[test]
fn rename_rejects_traversal_and_existing_targets() {
    let f=Fixture::new(); f.put("a.txt",b"a"); f.put("b.txt",b"b"); std::fs::create_dir(f.0.join("nested")).unwrap();
    assert!(commands::rename_file(f.0.join("a.txt").to_string_lossy().into_owned(),"nested/moved.txt".into()).is_err());
    assert!(commands::rename_file(f.0.join("a.txt").to_string_lossy().into_owned(),"b.txt".into()).is_err());
    assert_eq!(std::fs::read(f.0.join("b.txt")).unwrap(),b"b");
}
#[test]
fn duplicates_exclude_code_and_ignored_trees_and_compare_contents() {
    let f=Fixture::new(); f.put("a.txt",b"same"); f.put("nested/b.txt",b"same"); f.put("different.txt",b"nope");
    for name in ["a.rs","b.tsx","c.vue","d.psm1","node_modules/copy.txt","Dockerfile"] { f.put(name,b"same"); }
    let result=DuplicateFinder::find_duplicates(&f.path()).unwrap();
    assert_eq!(result.total_groups,1); assert_eq!(result.total_files,2); assert_eq!(result.duplicates[0].total_size,8);
}
#[test]
fn create_file_and_folder_commands() {
    let f=Fixture::new();
    commands::create_folder(f.0.join("sub").to_string_lossy().into_owned()).unwrap();
    commands::create_file(f.0.join("sub/new.txt").to_string_lossy().into_owned(), Some("hello".into())).unwrap();
    assert!(f.0.join("sub").exists());
    assert!(f.0.join("sub/new.txt").exists());
    assert_eq!(std::fs::read(f.0.join("sub/new.txt")).unwrap(), b"hello");
    assert!(commands::create_file(f.0.join("sub/new.txt").to_string_lossy().into_owned(), None).is_err());
}
#[test]
fn file_type_serializes_as_frontend_label() {
    assert_eq!(serde_json::to_value(FileType::Documents).unwrap(),"Documents");
}
#[test]
fn refresh_replaces_filename_index_and_normalizes_cache_keys() {
    Scanner::invalidate_cache();
    let f=Fixture::new(); f.put("cache-unique.txt", b"a");
    Scanner::scan_directory(&f.path(),true).unwrap();
    Scanner::scan_directory(&f.path(),true).unwrap();
    let cached=commands::get_cached_filenames().unwrap();
    assert_eq!(cached.iter().filter(|e| e.name=="cache-unique.txt").count(),1);
    std::fs::remove_file(f.0.join("cache-unique.txt")).unwrap();
    assert_eq!(Scanner::scan_directory(&format!("{}/./",f.path()),false).unwrap().files.len(),1);
    assert!(Scanner::scan_directory(&f.path(),true).unwrap().files.is_empty());
    assert!(!commands::get_cached_filenames().unwrap().iter().any(|e| e.name=="cache-unique.txt"));
}
#[test]
fn scan_prunes_ignored_subtrees_and_counts_skips() {
    let f=Fixture::new(); f.put("node_modules/deep/ignored.txt",b"ignore"); f.put("ok.txt",b"yes"); f.put("compiled.pyc",b"no");
    let scan=Scanner::scan_directory(&f.path(),true).unwrap();
    assert_eq!(scan.files.len(),1); assert_eq!(scan.stats.skipped_dirs,1); assert_eq!(scan.stats.skipped_files,1);
}
#[test]
fn tree_contains_nested_files_and_empty_folders() {
    let f=Fixture::new(); f.put("a/b/report.txt", b"report"); std::fs::create_dir(f.0.join("empty")).unwrap();
    let tree=Scanner::get_tree(&format!("{}/./",f.path())).unwrap();
    let children=tree["children"].as_array().unwrap();
    assert_eq!(children.len(),2);
    let a=children.iter().find(|n| n["name"]=="a").unwrap();
    assert_eq!(a["children"][0]["children"][0]["name"],"report.txt");
}
