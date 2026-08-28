import { env } from 'cloudflare:workers';
import {
  contentEntriesPublishedIndex,
  contentEntriesSchema,
  contentEntriesUniqueIndex,
  contentHistoryEntryIndex,
  contentHistorySchema,
  usageDailySchema,
  usageEventsDayIndex,
  usageEventsSchema,
} from '@/db/schema';

export type ContentStatus = 'draft' | 'published' | 'hidden';
export type ContentType = 'site_notice' | 'work_note';
export type UsageEventType = 'site_view' | 'works_view' | 'patterns_view' | 'taoyuan_view' | 'admin_open' | 'report_export';

export type UsageSummary = {
  totals: {
    siteViews: number;
    worksViews: number;
    patternsViews: number;
    taoyuanViews: number;
    adminOpens: number;
    reportExports: number;
  };
  recent: Array<{
    day: string;
    siteViews: number;
    worksViews: number;
    patternsViews: number;
    taoyuanViews: number;
    adminOpens: number;
    reportExports: number;
  }>;
};

export type ContentEntry = {
  id: string;
  contentType: ContentType;
  workKey: string;
  subject: string;
  title: string;
  summary: string;
  researchFramework: string;
  teacherPrompt: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

type ContentRow = {
  id: string;
  content_type: ContentType;
  work_key: string;
  subject: string;
  title: string;
  summary: string;
  research_framework: string;
  teacher_prompt: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  updated_by: string;
};

type UsageDailyRow = {
  day: string;
  site_views: number;
  works_views: number;
  patterns_views: number;
  taoyuan_views: number;
  admin_opens: number;
  report_exports: number;
};

function db(): D1Database {
  if (!env.DB) throw new Error('內容資料庫尚未設定');
  return env.DB;
}

function rowToEntry(row: ContentRow): ContentEntry {
  return {
    id: row.id,
    contentType: row.content_type,
    workKey: row.work_key,
    subject: row.subject,
    title: row.title,
    summary: row.summary,
    researchFramework: row.research_framework,
    teacherPrompt: row.teacher_prompt,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

let schemaReady: Promise<void> | undefined;

export function ensureContentSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = db().batch([
      db().prepare(contentEntriesSchema),
      db().prepare(contentHistorySchema),
      db().prepare(contentEntriesUniqueIndex),
      db().prepare(contentEntriesPublishedIndex),
      db().prepare(contentHistoryEntryIndex),
      db().prepare(usageDailySchema),
      db().prepare(usageEventsSchema),
      db().prepare(usageEventsDayIndex),
      db().prepare('PRAGMA optimize'),
    ]).then(() => undefined);
  }
  return schemaReady;
}

export async function listContentEntries(publishedOnly = false): Promise<ContentEntry[]> {
  await ensureContentSchema();
  const statement = publishedOnly
    ? db().prepare('SELECT * FROM content_entries WHERE status = ? ORDER BY updated_at DESC').bind('published')
    : db().prepare('SELECT * FROM content_entries ORDER BY updated_at DESC');
  const result = await statement.all<ContentRow>();
  return result.results.map(rowToEntry);
}

export async function saveContentEntry(entry: Omit<ContentEntry, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'> & { id?: string }, editorEmail: string): Promise<ContentEntry> {
  await ensureContentSchema();
  const now = new Date().toISOString();
  const id = entry.id || crypto.randomUUID();
  const existing = await db().prepare('SELECT created_at FROM content_entries WHERE content_type = ? AND work_key = ?').bind(entry.contentType, entry.workKey).first<{ created_at: string }>();
  const createdAt = existing?.created_at || now;
  await db().prepare(`
    INSERT INTO content_entries (
      id, content_type, work_key, subject, title, summary, research_framework,
      teacher_prompt, status, created_at, updated_at, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(content_type, work_key) DO UPDATE SET
      subject = excluded.subject,
      title = excluded.title,
      summary = excluded.summary,
      research_framework = excluded.research_framework,
      teacher_prompt = excluded.teacher_prompt,
      status = excluded.status,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).bind(
    id, entry.contentType, entry.workKey, entry.subject, entry.title, entry.summary,
    entry.researchFramework, entry.teacherPrompt, entry.status, createdAt, now, editorEmail,
  ).run();
  const saved = await db().prepare('SELECT * FROM content_entries WHERE content_type = ? AND work_key = ?').bind(entry.contentType, entry.workKey).first<ContentRow>();
  if (!saved) throw new Error('內容儲存後無法讀取');
  await db().prepare('INSERT INTO content_history (entry_id, action, snapshot, editor_email, created_at) VALUES (?, ?, ?, ?, ?)').bind(saved.id, existing ? 'updated' : 'created', JSON.stringify(rowToEntry(saved)), editorEmail, now).run();
  return rowToEntry(saved);
}

export async function deleteContentEntry(id: string, editorEmail: string): Promise<void> {
  await ensureContentSchema();
  const current = await db().prepare('SELECT * FROM content_entries WHERE id = ?').bind(id).first<ContentRow>();
  if (!current) return;
  const now = new Date().toISOString();
  await db().batch([
    db().prepare('INSERT INTO content_history (entry_id, action, snapshot, editor_email, created_at) VALUES (?, ?, ?, ?, ?)').bind(current.id, 'deleted', JSON.stringify(rowToEntry(current)), editorEmail, now),
    db().prepare('DELETE FROM content_entries WHERE id = ?').bind(id),
  ]);
}

const usageColumns: Record<UsageEventType, keyof UsageDailyRow> = {
  site_view: 'site_views',
  works_view: 'works_views',
  patterns_view: 'patterns_views',
  taoyuan_view: 'taoyuan_views',
  admin_open: 'admin_opens',
  report_export: 'report_exports',
};

function taipeiDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find(part => part.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function usageRow(row: UsageDailyRow): UsageSummary['recent'][number] {
  return {
    day: row.day,
    siteViews: Number(row.site_views || 0),
    worksViews: Number(row.works_views || 0),
    patternsViews: Number(row.patterns_views || 0),
    taoyuanViews: Number(row.taoyuan_views || 0),
    adminOpens: Number(row.admin_opens || 0),
    reportExports: Number(row.report_exports || 0),
  };
}

export async function recordUsageEvent(eventType: UsageEventType, page: string): Promise<void> {
  await ensureContentSchema();
  const now = new Date().toISOString();
  const column = usageColumns[eventType];
  const day = taipeiDay();
  await db().batch([
    db().prepare('INSERT INTO usage_events (id, event_type, page, created_at) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), eventType, page, now),
    db().prepare(`
      INSERT INTO usage_daily (day, ${column}, updated_at) VALUES (?, 1, ?)
      ON CONFLICT(day) DO UPDATE SET ${column} = ${column} + 1, updated_at = excluded.updated_at
    `).bind(day, now),
  ]);
}

export async function getUsageSummary(): Promise<UsageSummary> {
  await ensureContentSchema();
  const aggregate = await db().prepare(`
    SELECT
      COALESCE(SUM(site_views), 0) AS site_views,
      COALESCE(SUM(works_views), 0) AS works_views,
      COALESCE(SUM(patterns_views), 0) AS patterns_views,
      COALESCE(SUM(taoyuan_views), 0) AS taoyuan_views,
      COALESCE(SUM(admin_opens), 0) AS admin_opens,
      COALESCE(SUM(report_exports), 0) AS report_exports
    FROM usage_daily
  `).first<UsageDailyRow>();
  const recentResult = await db().prepare(`
    SELECT day, site_views, works_views, patterns_views, taoyuan_views, admin_opens, report_exports
    FROM usage_daily
    ORDER BY day DESC
    LIMIT 30
  `).all<UsageDailyRow>();
  const row = usageRow(aggregate || {
    day: '', site_views: 0, works_views: 0, patterns_views: 0, taoyuan_views: 0, admin_opens: 0, report_exports: 0,
  });
  return {
    totals: {
      siteViews: row.siteViews,
      worksViews: row.worksViews,
      patternsViews: row.patternsViews,
      taoyuanViews: row.taoyuanViews,
      adminOpens: row.adminOpens,
      reportExports: row.reportExports,
    },
    recent: recentResult.results.map(usageRow).reverse(),
  };
}
