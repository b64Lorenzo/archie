use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum FileType {
    Documents,
    Code,
    Media,
    Archives,
    Other,
}

impl FileType {
    pub fn from_extension(ext: &str) -> Self {
        match ext {
            "pdf" | "doc" | "docx" | "txt" | "rtf" | "odt" | "xls" | "xlsx" | "ppt" | "pptx" | "csv" => FileType::Documents,
            "jsx" | "tsx" | "mjs" | "cjs" | "vue" | "svelte" | "psm1" | "psd1" | "cmd" | "bash" | "zsh" | "fish" | "hpp" | "hxx" | "cc" | "cxx" | "m" | "mm" | "lua" | "pl" | "pm" | "r" | "rmd" | "dart" | "ex" | "exs" | "erl" | "hrl" | "clj" | "cljs" | "hs" | "fs" | "fsx" | "vb" | "vbs" | "groovy" | "gradle" | "toml" | "xml" | "scss" | "sass" | "less" | "cmake" | "make" | "zig" | "nim" | "jl" | "d" | "f90" | "pas" | "asm" | "s" | "sol" | "proto" | "tf" | "tfvars" | "lock" | "py" | "js" | "ts" | "java" | "c" | "cpp" | "h" | "cs" | "php" | "rb" | "go" | "rs" | "swift" | "kt" | "scala" | "html" | "css" | "sql" | "sh" | "bat" | "ps1" | "ipynb" | "tex" | "json" | "yaml" | "yml" => FileType::Code,
            "jpg" | "jpeg" | "png" | "gif" | "bmp" | "svg" | "webp" | "mp4" | "mp3" | "wav" | "avi" | "mov" | "mkv" | "flac" | "ogg" | "m4a" => FileType::Media,
            "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" | "xz" | "iso" => FileType::Archives,
            _ => FileType::Other,
        }
    }
}

impl std::fmt::Display for FileType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileType::Documents => write!(f, "Documents"),
            FileType::Code => write!(f, "Code"),
            FileType::Media => write!(f, "Media"),
            FileType::Archives => write!(f, "Archives"),
            FileType::Other => write!(f, "Other"),
        }
    }
}

pub fn format_size(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }
    let k = 1024;
    let sizes = ["B", "KB", "MB", "GB", "TB"];
    let i = (bytes as f64).log(k as f64).floor() as usize;
    let size = bytes as f64 / (k as f64).powi(i as i32);
    format!("{:.1} {}", size, sizes[i])
}

pub fn should_skip_dir(name: &std::path::Path) -> bool {
    let name_str = name.file_name().unwrap_or_default().to_string_lossy().to_lowercase();
    matches!(name_str.as_str(), 
        ".git" | ".svn" | ".hg" | "__pycache__" | "node_modules" | "venv" | ".venv" |
        "env" | ".env" | "virtualenv" | "site-packages" | "dist" | "build" |
        ".idea" | ".vscode" | ".vs" | "bin" | "obj" | ".next" | ".nuxt" | "vendor" |
        "pods" | "deriveddata" | ".gradle" | ".cache" | "temp" | "tmp" | "logs"
    )
}

pub fn should_skip_file(name: &str, extension: &str) -> bool {
    let ext = extension.to_lowercase();
    matches!(ext.as_str(), 
        "pyc" | "pyo" | "pyd" | "so" | "dll" | "exe" | "bin" | "dat" |
        "class" | "jar" | "o" | "obj" | "lib" | "a" | "ds_store" | "pyi"
    ) || name.starts_with('.')
}
