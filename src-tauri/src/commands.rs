use crate::scanner::Scanner;
use crate::duplicates::DuplicateFinder;
use crate::topics::TopicDetector;
use serde::Serialize;
use std::path::Path;

use super::scanner::ScanResult;

// Tauri 2.x commands with individual parameters
#[tauri::command]
pub fn scan_directory(path: String, force_refresh: Option<bool>) -> Result<ScanResult, String> {
    let force = force_refresh.unwrap_or(false);
    Scanner::scan_directory(&path, force)
}

#[tauri::command]
pub fn get_tree(path: String) -> Result<serde_json::Value, String> {
    Scanner::get_tree(&path)
}

#[tauri::command]
pub fn find_duplicates(path: String) -> Result<crate::duplicates::DuplicateResult, String> {
    DuplicateFinder::find_duplicates(&path)
}

#[tauri::command]
pub fn get_topics(path: String) -> Result<crate::topics::TopicResult, String> {
    let result = Scanner::scan_directory(&path, false)?;
    Ok(TopicDetector::detect_topics(&result.files))
}

#[tauri::command]
pub fn get_cached_filenames() -> Result<Vec<crate::scanner::FileEntry>, String> {
    match Scanner::get_cached_filenames() {
        Some(map) => {
            let mut all: Vec<_> = Vec::new();
            for (_, entries) in map {
                all.extend(entries);
            }
            Ok(all)
        }
        None => Ok(Vec::new()),
    }
}

#[tauri::command]
pub fn search_files(query: String, limit: Option<usize>) -> Result<Vec<crate::scanner::FileEntry>, String> {
    let query = query.to_lowercase();
    let limit = limit.unwrap_or(500);
    if limit == 0 { return Ok(Vec::new()); }
    
    let mut results = Vec::new();
    
    // Try cached filenames first for instant results
    if let Ok(cached) = get_cached_filenames() {
        for file in cached {
            if file.name.to_lowercase().contains(&query) 
                || file.path.to_lowercase().contains(&query) {
                results.push(file);
                if results.len() >= limit {
                    break;
                }
            }
        }
    }
    
    Ok(results)
}

#[tauri::command]
pub fn open_file(path: String) -> Result<(), String> {
    open::that(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    let folder = if path.is_file() {
        path.parent().unwrap_or(path)
    } else {
        path
    };
    open::that(folder).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_file(old_path: String, new_name: String) -> Result<(), String> {
    let old_path = Path::new(&old_path);
    if !old_path.exists() {
        return Err("File not found".to_string());
    }
    
    if new_name.trim().is_empty() || new_name == "." || new_name == ".."
        || new_name.ends_with(['.', ' '])
        || new_name.chars().any(|c| c.is_control() || "<>:\"/\\|?*".contains(c)) {
        return Err("New name must be a single valid file name".into());
    }
    let new_path = old_path.parent()
        .unwrap_or(Path::new(""))
        .join(&new_name);
    if new_path == old_path { return Ok(()); }
    if new_path.exists() { return Err("Destination already exists".into()); }
    DuplicateFinder::rename_preserving_duplicates(old_path, &new_path)?;
    Scanner::invalidate_cache();
    Ok(())
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        return Err("File not found".to_string());
    }
    
    DuplicateFinder::delete_preserving_duplicates(path)?;
    Scanner::invalidate_cache();
    Ok(())
}

#[tauri::command]
pub fn create_file(path: String, content: Option<String>) -> Result<(), String> {
    let path = Path::new(&path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err("Parent directory does not exist".to_string());
        }
    }
    if path.exists() {
        return Err("File already exists".to_string());
    }
    std::fs::write(path, content.unwrap_or_default()).map_err(|e| e.to_string())?;
    Scanner::invalidate_cache();
    Ok(())
}

#[tauri::command]
pub fn create_folder(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if path.exists() {
        return Err("Folder already exists".to_string());
    }
    std::fs::create_dir_all(path).map_err(|e| e.to_string())?;
    Scanner::invalidate_cache();
    Ok(())
}

#[tauri::command]
pub fn get_app_info() -> AppInfo {
    AppInfo {
        name: "Archie".to_string(),
        version: "1.0.2".to_string(),
        author: "Lorenzo Zambelli".to_string(),
        license: "MIT".to_string(),
    }
}

#[tauri::command]
pub fn pick_folder() -> Result<Option<String>, String> {
    use rfd::FileDialog;
    let path = FileDialog::new()
        .set_title("Select Folder")
        .pick_folder();
    Ok(path.map(|p| p.to_string_lossy().to_string()))
}

#[derive(Debug, Serialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub author: String,
    pub license: String,
}
