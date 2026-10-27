use chrono::{DateTime, Utc};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::sync::Mutex;
use walkdir::WalkDir;

use crate::utils::{format_size, FileType};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub extension: String,
    pub size: u64,
    pub modified: String,
    pub parent: String,
    pub file_type: FileType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FolderEntry {
    pub name: String,
    pub path: String,
    pub relative: String,
    pub modified: String,
    pub parent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanResult {
    pub files: Vec<FileEntry>,
    pub folders: Vec<FolderEntry>,
    pub stats: ScanStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanStats {
    pub total_files: usize,
    pub total_folders: usize,
    pub total_size: u64,
    pub total_size_human: String,
    pub duplicate_groups: usize,
    pub code_files: usize,
    pub skipped_dirs: usize,
    pub skipped_files: usize,
}

static SCAN_CACHE: Mutex<Option<HashMap<String, (u64, ScanResult)>>> = Mutex::new(None);


const CACHE_TTL_SECONDS: u64 = 600;

pub struct Scanner;

impl Scanner {
    pub fn scan_directory(path: &str, force_refresh: bool) -> Result<ScanResult, String> {
        let canonical = std::fs::canonicalize(path).map_err(|e| e.to_string())?;
        let path = canonical.as_path();
        let path_str = normalize_path(path);
        let path = Path::new(&path_str);
        if !path.exists() || !path.is_dir() {
            return Err("Invalid directory".to_string());
        }

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Check cache
        {
            let mut cache = SCAN_CACHE.lock().unwrap();
            if cache.is_none() {
                *cache = Some(HashMap::new());
            }
            if !force_refresh {
                if let Some((ref ts, ref result)) = cache.as_ref().unwrap().get(&path_str) {
                    if now.saturating_sub(*ts) < CACHE_TTL_SECONDS {
                        return Ok(result.clone());
                    }
                }
            }
        }

        let mut files = Vec::new();
        let mut folders = Vec::new();
        let mut skipped_dirs = 0usize;
        let mut skipped_files = 0usize;

        // Collect entries first
        let entries: Vec<_> = WalkDir::new(path)
            .into_iter()
            .filter_entry(|e| {
                let skip = e.depth() > 0 && e.file_type().is_dir() && crate::utils::should_skip_dir(e.path());
                if skip { skipped_dirs += 1; }
                !skip
            })
            .filter_map(|e| e.ok())
            .filter(|e| {
                let skip = e.file_type().is_file() && crate::utils::should_skip_file(
                    &e.file_name().to_string_lossy(),
                    &e.path().extension().unwrap_or_default().to_string_lossy());
                if skip { skipped_files += 1; }
                !skip
            })
            .collect();

        // Process in parallel with rayon
        let results: Vec<_> = entries
            .par_iter()
            .map(|entry| process_entry(entry, path))
            .collect();

        for (file_opt, folder_opt) in results {
            if let Some(f) = file_opt {
                files.push(f);
            }
            if let Some(folder) = folder_opt {
                folders.push(folder);
            }
        }

        // Calculate stats
        let total_size = files.iter().map(|f| f.size).sum();
        let code_files = files
            .iter()
            .filter(|f| matches!(f.file_type, FileType::Code))
            .count();

        let stats = ScanStats {
            total_files: files.len(),
            total_folders: folders.len(),
            total_size,
            total_size_human: format_size(total_size),
            duplicate_groups: 0,
            code_files,
            skipped_dirs,
            skipped_files,
        };

        let result = ScanResult { files, folders, stats };

        // Cache scan result
        {
            let mut cache = SCAN_CACHE.lock().unwrap();
            if cache.is_none() {
                *cache = Some(HashMap::new());
            }
            let entries = cache.as_mut().unwrap();
            entries.retain(|key, (ts, _)| now.saturating_sub(*ts) < CACHE_TTL_SECONDS && !(Path::new(key).starts_with(path) || path.starts_with(key)));
            entries.insert(path_str.clone(), (now, result.clone()));
        }

        Ok(result)
    }

    pub fn get_cached_filenames() -> Option<HashMap<String, Vec<FileEntry>>> {
        let cache = SCAN_CACHE.lock().unwrap();
        let mut by_path = HashMap::new();
        let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_secs();
        for (ts, result) in cache.as_ref()?.values() {
            if now.saturating_sub(*ts) >= CACHE_TTL_SECONDS { continue; }
            for file in &result.files { by_path.insert(file.path.clone(), file.clone()); }
        }
        let mut names: HashMap<String, Vec<FileEntry>> = HashMap::new();
        for file in by_path.into_values() { names.entry(file.name.clone()).or_default().push(file); }
        Some(names)
    }

    pub fn invalidate_cache() {
        *SCAN_CACHE.lock().unwrap() = None;
    }

    pub fn get_tree(path: &str) -> Result<serde_json::Value, String> {
        let root = std::fs::canonicalize(path).map_err(|e| e.to_string())?;
        let root = normalize_path(&root);
        let result = Self::scan_directory(&root, false)?;
        let mut children: HashMap<String, Vec<serde_json::Value>> = HashMap::new();
        for file in &result.files {
            children.entry(file.parent.clone()).or_default().push(serde_json::json!({
                "name": file.name, "path": file.path, "type": "file",
                "size": file.size, "extension": file.extension
            }));
        }
        // Assemble bottom-up; cloning nodes before attaching descendants loses them.
        let mut folders = result.folders;
        folders.sort_by_key(|f| std::cmp::Reverse(Path::new(&f.path).components().count()));
        for folder in folders {
            if folder.path == root { continue; }
            let mut nested = children.remove(&folder.path).unwrap_or_default();
            sort_nodes(&mut nested);
            children.entry(folder.parent).or_default().push(serde_json::json!({
                "name": folder.name, "path": folder.path, "type": "folder", "children": nested
            }));
        }
        let mut nested = children.remove(&root).unwrap_or_default();
        sort_nodes(&mut nested);
        Ok(serde_json::json!({
            "name": Path::new(&root).file_name().and_then(|s| s.to_str()).unwrap_or("root"),
            "path": root, "type": "folder", "children": nested
        }))
    }
}

fn normalize_path(p: &Path) -> String {
    p.to_string_lossy()
        .replace("\\\\?\\", "")
        .replace('\\', "/")
        .to_string()
}

fn process_entry(entry: &walkdir::DirEntry, path: &Path) -> (Option<FileEntry>, Option<FolderEntry>) {
    let entry_path = entry.path();
    if entry.file_type().is_dir() {
        let modified = entry_path.metadata().ok().and_then(|m| m.modified().ok())
            .map(|t| { let dt: DateTime<Utc> = t.into(); dt.format("%Y-%m-%d %H:%M:%S").to_string() })
            .unwrap_or_else(|| "unknown".into());
        return (None, Some(FolderEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: normalize_path(entry_path),
            relative: entry_path.strip_prefix(path).unwrap_or(entry_path).to_string_lossy().into_owned(),
            parent: normalize_path(entry_path.parent().unwrap_or(path)),
            modified,
        }));
    } else if entry.file_type().is_file() {
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

        if crate::utils::should_skip_file(&name, &extension) {
            return (None, None);
        }

        let (size, modified_str, parent) = match entry_path.metadata() {
            Ok(metadata) => {
                let size = metadata.len();
                let modified_str = metadata
                    .modified()
                    .ok()
                    .map(|t| {
                        let dt: DateTime<Utc> = t.into();
                        dt.format("%Y-%m-%d %H:%M:%S").to_string()
                    })
                    .unwrap_or_else(|| "unknown".to_string());
                let parent = normalize_path(entry_path.parent().unwrap_or(Path::new("")));
                (size, modified_str, parent)
            }
            Err(_) => {
                (0, "unknown".to_string(), normalize_path(entry_path.parent().unwrap_or(Path::new(""))))
            }
        };

        let file_type = FileType::from_extension(&extension);

        return (
            Some(FileEntry {
                name: name.clone(),
                path: normalize_path(entry_path),
                extension,
                size,
                modified: modified_str,
                parent,
                file_type,
            }),
            None,
        );
    }
    (None, None)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn metadata_failure_keeps_discovered_files_and_folders() {
        let root = std::path::PathBuf::from(std::env::var_os("TMPDIR").unwrap_or_else(|| std::env::temp_dir().into_os_string()))
            .join(format!("archive-metadata-{}",std::process::id()));
        std::fs::create_dir_all(root.join("folder")).unwrap();
        std::fs::write(root.join("file.txt"),b"x").unwrap();
        let entries: Vec<_> = WalkDir::new(&root).into_iter().map(Result::unwrap).collect();
        std::fs::remove_dir_all(&root).unwrap();
        for entry in entries {
            let (file,folder)=process_entry(&entry,&root);
            if entry.file_type().is_file() { let file=file.expect("metadata failure must not hide files"); assert_eq!(file.size,0); assert_eq!(file.modified,"unknown"); }
            else { assert_eq!(folder.expect("metadata failure must not hide folders").modified,"unknown"); }
        }
    }
}

fn sort_nodes(nodes: &mut [serde_json::Value]) {
    nodes.sort_by_key(|n| (n["type"] != "folder", n["name"].as_str().unwrap_or("").to_lowercase()));
}

