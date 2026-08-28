import { NextResponse } from 'next/server';
import { getAdminEmail } from '@/app/lib/admin-auth';
import { deleteContentEntry, listContentEntries, saveContentEntry, type ContentStatus, type ContentType } from '@/app/lib/content-db';

export const dynamic = 'force-dynamic';

const validStatuses = new Set<ContentStatus>(['draft', 'published', 'hidden']);
const validTypes = new Set<ContentType>(['site_notice', 'work_note']);

function text(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseEntry(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const input = payload as Record<string, unknown>;
  const contentType = text(input.contentType, 32) as ContentType;
  const status = text(input.status, 16) as ContentStatus;
  if (!validTypes.has(contentType) || !validStatuses.has(status)) return null;
  const workKey = contentType === 'site_notice' ? 'site-notice' : text(input.workKey, 24);
  if (contentType === 'work_note' && !/^\d{2}-\d{6}$/.test(workKey)) return null;
  const title = text(input.title, 120);
  if (!title) return null;
  return {
    id: text(input.id, 80) || undefined,
    contentType,
    workKey,
    subject: text(input.subject, 40),
    title,
    summary: text(input.summary, 1800),
    researchFramework: text(input.researchFramework, 1800),
    teacherPrompt: text(input.teacherPrompt, 1000),
    status,
  };
}

function forbidden() {
  return NextResponse.json({ error: '僅限網站管理者使用。' }, { status: 403 });
}

export async function GET(request: Request) {
  if (!getAdminEmail(request)) return forbidden();
  try {
    return NextResponse.json({ entries: await listContentEntries() });
  } catch {
    return NextResponse.json({ error: '資料庫暫時無法讀取。' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const email = getAdminEmail(request);
  if (!email) return forbidden();
  const entry = parseEntry(await request.json().catch(() => null));
  if (!entry) return NextResponse.json({ error: '欄位格式不正確，請確認作品與內容資料。' }, { status: 400 });
  try {
    return NextResponse.json({ entry: await saveContentEntry(entry, email) });
  } catch {
    return NextResponse.json({ error: '內容儲存失敗，請稍後再試。' }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const email = getAdminEmail(request);
  if (!email) return forbidden();
  const id = new URL(request.url).searchParams.get('id')?.trim();
  if (!id || id.length > 80) return NextResponse.json({ error: '找不到要刪除的內容。' }, { status: 400 });
  try {
    await deleteContentEntry(id, email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '內容刪除失敗，請稍後再試。' }, { status: 503 });
  }
}
