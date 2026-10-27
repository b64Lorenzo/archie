# Archie

**Version 1.0.3**

A modular, high-performance desktop application for file management, duplicate detection, and topic-based organization. Built with Tauri (Rust + TypeScript) for native performance and low resource usage.

## Features

- **File Scanning**: Fast parallel scanning of directories with configurable exclusions
- **Tree View**: Interactive hierarchical view of all scanned directories
- **Duplicate Detection**: Identify duplicate files with size comparison and bulk actions
- **Topic Detection**: Automatic categorization of files by topic (Work, Study, Finance, etc.)
- **Search & Filter**: Real-time search with type filtering (Documents, Code, Media, Archives)
- **File Operations**: Open files/folders, rename, delete with context menu
- **Pagination**: Efficient handling of large file sets
- **Dark Theme**: MacPaw-inspired dark UI with proper contrast
- **Context Menus**: Right-click actions for files and duplicates
- **Cache**: 10-minute scan cache for improved performance

## Tech Stack

- **Backend**: Rust with Tauri 2.0
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Libraries**:
  - walkdir / ignore: Fast directory traversal
  - rayon: Parallel processing
  - serde: Serialization
  - md5: File hashing for duplicates

## Project Structure

```
file-dashboard/
├── Cargo.toml                 # Root Rust dependencies
├── src-tauri/
│   ├── Cargo.toml             # Tauri backend dependencies
│   ├── build.rs               # Build script
│   ├── tauri.conf.json        # Tauri configuration
│   └── src/
│       ├── main.rs            # Application entry point
│       ├── lib.rs             # Module declarations
│       ├── scanner.rs         # File scanner (FileEntry, FolderEntry, ScanResult)
│       ├── duplicates.rs      # Duplicate finder
│       ├── topics.rs          # Topic detector
│       └── utils.rs           # Utilities (formatting, filters)
└── src/
    ├── index.html             # Main UI
    ├── styles.css             # Dark theme styles
    └── app.js                 # Frontend logic
```

## Building

### Prerequisites
- Node.js 16+
- Rust 1.70+
- Tauri CLI: `npm install -g @tauri-apps/cli`

### Development
```bash
npm run tauri dev
```

### Production Build

#### Windows (NSIS installer)
```bash
npm run tauri build
```
Output: `src-tauri/target/release/archie.exe` and installer in `src-tauri/target/release/bundle/nsis/`

#### macOS (DMG + App bundle)
On macOS, run:
```bash
npm run tauri build -- --target dmg
```
Or for app bundle:
```bash
npm run tauri build -- --target app
```
Output: `src-tauri/target/release/archie.app` and DMG in `src-tauri/target/release/bundle/dmg/`

#### Linux (AppImage, DEB, RPM)
On Linux, run:
```bash
# AppImage
npm run tauri build -- --target appimage

# DEB package (Debian/Ubuntu)
npm run tauri build -- --target deb

# RPM package (Fedora/RHEL)
npm run tauri build -- --target rpm
```
Output binaries are in `src-tauri/target/release/bundle/` under the respective format directory.

## License

Copyright (c) 2026 Lorenzo Zambelli
All rights reserved.

## Author

Lorenzo Zambelli

## AI Assistance

Part of this codebase was written with the assistance of AI (Hermes Agent by Nous Research). AI was used for code generation, debugging, and implementation of features.
