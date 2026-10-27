// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod duplicates;
mod scanner;
mod topics;
mod utils;

use commands::*;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            get_tree,
            find_duplicates,
            get_topics,
            search_files,
            get_cached_filenames,
            open_file,
            open_folder,
            rename_file,
            delete_file,
            create_file,
            create_folder,
            get_app_info,
            pick_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
