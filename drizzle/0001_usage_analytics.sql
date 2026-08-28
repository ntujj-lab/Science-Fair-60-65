CREATE TABLE IF NOT EXISTS usage_daily (
  day TEXT PRIMARY KEY,
  site_views INTEGER NOT NULL DEFAULT 0,
  works_views INTEGER NOT NULL DEFAULT 0,
  patterns_views INTEGER NOT NULL DEFAULT 0,
  taoyuan_views INTEGER NOT NULL DEFAULT 0,
  admin_opens INTEGER NOT NULL DEFAULT 0,
  report_exports INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('site_view', 'works_view', 'patterns_view', 'taoyuan_view', 'admin_open', 'report_export')),
  page TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_events_type_created
ON usage_events(event_type, created_at DESC);
