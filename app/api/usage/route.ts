import { NextResponse } from 'next/server';
import { recordUsageEvent, type UsageEventType } from '@/app/lib/content-db';

export const dynamic = 'force-dynamic';

const validEvents = new Set<UsageEventType>(['site_view', 'works_view', 'patterns_view', 'taoyuan_view', 'admin_open', 'report_export']);

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { eventType?: unknown; page?: unknown } | null;
  const eventType = typeof payload?.eventType === 'string' ? payload.eventType as UsageEventType : null;
  const page = typeof payload?.page === 'string' ? payload.page.trim().slice(0, 32) : '';
  if (!eventType || !validEvents.has(eventType) || !page || !/^[a-z0-9_-]+$/i.test(page)) {
    return NextResponse.json({ error: '使用統計事件格式不正確。' }, { status: 400 });
  }
  try {
    await recordUsageEvent(eventType, page);
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: '使用統計暫時無法寫入。' }, { status: 503 });
  }
}
