use crate::utils::should_skip_file;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateFile {
    pub path: String,
    pub name: String,
    pub size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateGroup {
    pub name: String,
    pub files: Vec<DuplicateFile>,
    pub count: usize,
    pub total_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DuplicateResult {
    pub duplicates: Vec<DuplicateGroup>,
    pub total_groups: usize,
    pub total_files: usize,
}

pub struct DuplicateFinder;
// Keep discoveries for this session, including after a refresh/deletion. The lock
// spans preflight and removal so two IPC deletions cannot both delete the last copy.
static PROTECTED: std::sync::Mutex<Vec<Vec<String>>> = std::sync::Mutex::new(Vec::new());

impl DuplicateFinder {
    pub fn find_duplicates(path: &str) -> Result<DuplicateResult, String> {
        let canonical = std::fs::canonicalize(path).map_err(|e| e.to_string())?;
        let root = canonical.as_path();
        if !root.exists() || !root.is_dir() {
            return Err("Invalid directory".to_string());
        }

        // Phase 1: size buckets
        let mut size_map: HashMap<u64, Vec<DuplicateFile>> = HashMap::new();

        for entry in walkdir::WalkDir::new(root)
            .into_iter()
            .filter_entry(|e| e.depth() == 0 || !e.file_type().is_dir() || !crate::utils::should_skip_dir(e.path()))
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
        {
            let entry_path = entry.path();
            let name = entry_path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            let extension = entry_path
                .extension()
                .unwrap_or_default()
                .to_string_lossy()
                .to_lowercase();

            if should_skip_file(&name, &extension)
                || crate::utils::FileType::from_extension(&extension) == crate::utils::FileType::Code
                || matches!(name.to_lowercase().as_str(), "dockerfile" | "makefile" | "gnumakefile" | "cmakelists.txt" | "jenkinsfile" | "rakefile" | "gemfile") {
                continue;
            }

            if let Ok(metadata) = entry_path.metadata() {
                let size = metadata.len();
                if size > 0 {
                    size_map
                        .entry(size)
                        .or_default()
                        .push(DuplicateFile {
                            path: entry_path.to_string_lossy().to_string(),
                            name,
                            size,
                        });
                }
            }
        }

        // Phase 2: hash files with matching sizes
        let mut hash_map: HashMap<String, Vec<DuplicateFile>> = HashMap::new();

        for (_, files) in size_map {
            if files.len() < 2 {
                continue;
            }

            for file in files {
                match Self::compute_md5(&file.path) {
                    Ok(hash) => {
                        hash_map
                            .entry(hash)
                            .or_default()
                            .push(file);
                    }
                    Err(_) => {
                        // Skip files that can't be hashed (e.g., cloud-only placeholders)
                    }
                }
            }
        }

        // Compile results
        let mut duplicates = Vec::new();
        for (_, mut file_list) in hash_map {
            file_list.sort_by(|a,b| a.path.cmp(&b.path));
            // A hash is a candidate filter, never proof of byte identity.
            let mut exact: Vec<Vec<DuplicateFile>> = Vec::new();
            for file in file_list {
                if let Some(group) = exact.iter_mut().find(|g| Self::same_content(&g[0].path, &file.path).unwrap_or(false)) {
                    group.push(file);
                } else { exact.push(vec![file]); }
            }
            for files in exact.into_iter().filter(|g| g.len() > 1) {
                duplicates.push(DuplicateGroup {
                    name: files[0].name.clone(), count: files.len(),
                    total_size: files.iter().map(|f| f.size).sum(), files,
                });
            }
        }
        duplicates.sort_by(|a,b| a.files[0].path.cmp(&b.files[0].path));

        let total_groups = duplicates.len();
        let total_files = duplicates.iter().map(|d| d.count).sum();

        let mut protected = PROTECTED.lock().map_err(|e| e.to_string())?;
        for group in &duplicates {
            let paths: Vec<_> = group.files.iter().map(|f| f.path.clone()).collect();
            if !protected.contains(&paths) { protected.push(paths); }
        }
        Ok(DuplicateResult {
            duplicates,
            total_groups,
            total_files,
        })
    }

    pub fn rename_preserving_duplicates(old: &Path, new: &Path) -> Result<(), String> {
        let old = std::fs::canonicalize(old).map_err(|e| e.to_string())?;
        let new = old.parent().ok_or("Cannot rename filesystem root")?.join(new.file_name().ok_or("Invalid name")?);
        let mut protected = PROTECTED.lock().map_err(|e| e.to_string())?;
        if new.exists() { return Err("Destination already exists".into()); }
        std::fs::rename(&old, &new).map_err(|e| format!("Failed to rename: {}", e))?;
        for group in protected.iter_mut() {
            for path in group {
                if let Ok(relative) = Path::new(path).strip_prefix(&old) {
                    *path = if relative.as_os_str().is_empty() { new.clone() } else { new.join(relative) }.to_string_lossy().into_owned();
                }
            }
        }
        Ok(())
    }

    pub fn delete_preserving_duplicates(path: &Path) -> Result<(), String> {
        let canonical = std::fs::canonicalize(path).map_err(|e| e.to_string())?;
        let key = canonical.to_string_lossy().into_owned();
        let protected = PROTECTED.lock().map_err(|e| e.to_string())?;
        for group in protected.iter().filter(|g| g.contains(&key)) {
            if !group.iter().any(|peer| peer != &key && Self::same_content(&key, peer).unwrap_or(false)) {
                return Err("Cannot delete the last verified copy of a discovered duplicate group".into());
            }
        }
        std::fs::remove_file(path).map_err(|e| format!("Failed to delete: {}", e))
    }

    fn same_content(a: &str, b: &str) -> Result<bool, String> {
        use std::io::Read;
        let mut a = std::fs::File::open(a).map_err(|e| e.to_string())?;
        let mut b = std::fs::File::open(b).map_err(|e| e.to_string())?;
        let len = a.metadata().map_err(|e| e.to_string())?.len();
        if len != b.metadata().map_err(|e| e.to_string())?.len() { return Ok(false); }
        let mut left = [0u8; 65536]; let mut right = [0u8; 65536];
        let mut remaining = len;
        while remaining > 0 {
            let n = remaining.min(left.len() as u64) as usize;
            a.read_exact(&mut left[..n]).map_err(|e| e.to_string())?;
            b.read_exact(&mut right[..n]).map_err(|e| e.to_string())?;
            if left[..n] != right[..n] { return Ok(false); }
            remaining -= n as u64;
        }
        Ok(a.read(&mut left[..1]).map_err(|e| e.to_string())? == 0 && b.read(&mut right[..1]).map_err(|e| e.to_string())? == 0)
    }

    fn compute_md5(path: &str) -> Result<String, String> {
        use std::io::Read;
        let mut file = std::fs::File::open(path).map_err(|e| e.to_string())?;
        let mut buf = [0u8; 65536];
        let mut context = md5::Context::new();
        loop {
            let n = file.read(&mut buf).map_err(|e| e.to_string())?;
            if n == 0 { break; }
            context.consume(&buf[..n]);
        }
        let result = context.compute();
        Ok(format!("{:x}", result))
    }
}
