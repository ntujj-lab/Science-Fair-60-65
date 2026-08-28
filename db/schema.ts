export const contentEntriesSchema = `
CREATE TABLE IF NOT EXISTS content_entries (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('site_notice', 'work_note')),
  work_key TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  research_framework TEXT NOT NULL DEFAULT '',
  teacher_prompt TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
)
`;

export const contentHistorySchema = `
CREATE TABLE IF NOT EXISTS content_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  snapshot TEXT NOT NULL,
  editor_email TEXT NOT NULL,
  created_at TEXT NOT NULL
)
`;

export const contentEntriesUniqueIndex = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_entries_type_work
ON content_entries(content_type, work_key)
`;

export const contentEntriesPublishedIndex = `
CREATE INDEX IF NOT EXISTS idx_content_entries_status_type
ON content_entries(status, content_type)
`;

export const contentHistoryEntryIndex = `
CREATE INDEX IF NOT EXISTS idx_content_history_entry_created
ON content_history(entry_id, created_at DESC)
`;
