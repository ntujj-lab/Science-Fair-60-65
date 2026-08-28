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

export const usageDailySchema = `
CREATE TABLE IF NOT EXISTS usage_daily (
  day TEXT PRIMARY KEY,
  site_views INTEGER NOT NULL DEFAULT 0,
  works_views INTEGER NOT NULL DEFAULT 0,
  patterns_views INTEGER NOT NULL DEFAULT 0,
  taoyuan_views INTEGER NOT NULL DEFAULT 0,
  admin_opens INTEGER NOT NULL DEFAULT 0,
  report_exports INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
)
`;

export const usageEventsSchema = `
CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('site_view', 'works_view', 'patterns_view', 'taoyuan_view', 'admin_open', 'report_export')),
  page TEXT NOT NULL,
  created_at TEXT NOT NULL
)
`;

export const usageEventsDayIndex = `
CREATE INDEX IF NOT EXISTS idx_usage_events_type_created
ON usage_events(event_type, created_at DESC)
`;
