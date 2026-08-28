import { env } from 'cloudflare:workers';
import {
  contentEntriesPublishedIndex,
  contentEntriesSchema,
  contentEntriesUniqueIndex,
  contentHistoryEntryIndex,
  contentHistorySchema,
} from '@/db/schema';

export type ContentStatus = 'draft' | 'published' | 'hidden';
export type ContentType = 'site_notice' | 'work_note';

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
