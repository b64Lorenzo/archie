use crate::utils::FileType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopicFile {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub file_type: FileType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopicGroup {
    pub topic: String,
    pub files: Vec<TopicFile>,
    pub count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopicResult {
    pub topics: Vec<TopicGroup>,
    pub total_files: usize,
}

pub struct TopicDetector;

impl TopicDetector {
    pub fn detect_topics(files: &[crate::scanner::FileEntry]) -> TopicResult {
        let topic_keywords: HashMap<&str, Vec<&str>> = HashMap::from([
            ("Work", vec!["cv", "resume", "cover", "job", "application", "interview", "career"]),
            ("Study", vec!["university", "college", "thesis", "exam", "homework", "study", "course", "lecture", "assignment", "research", "paper"]),
            ("Finance", vec!["invoice", "receipt", "budget", "tax", "bank", "payment", "salary", "finance", "accounting"]),
            ("Personal", vec!["personal", "diary", "journal", "memo", "note", "letter", "family", "vacation"]),
            ("Projects", vec!["project", "repo", "repository", "source", "src", "app", "website"]),
            ("Documents", vec!["doc", "document", "contract", "agreement", "policy", "report", "proposal"]),
            ("Media", vec!["video", "audio", "music", "movie", "photo", "image", "screenshot"]),
            ("Archives", vec!["archive", "backup", "old", "historical", "legacy"]),
        ]);

        let mut topic_files: HashMap<String, Vec<TopicFile>> = HashMap::new();

        for file in files {
            let text = format!("{} {} {}", file.name, file.path, file.extension).to_lowercase();

            for (topic, keywords) in &topic_keywords {
                if keywords.iter().any(|kw| text.contains(kw)) {
                    topic_files
                        .entry(topic.to_string())
                        .or_default()
                        .push(TopicFile {
                            name: file.name.clone(),
                            path: file.path.clone(),
                            size: file.size,
                            file_type: file.file_type.clone(),
                        });
                }
            }
        }

        let mut topics: Vec<TopicGroup> = topic_files
            .into_iter()
            .map(|(topic, files)| TopicGroup {
                topic,
                count: files.len(),
                files,
            })
            .collect();

        topics.sort_by(|a, b| b.count.cmp(&a.count));

        let total_files = topics.iter().map(|t| t.count).sum();

        TopicResult { topics, total_files }
    }
}
