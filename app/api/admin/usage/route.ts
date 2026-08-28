import { NextResponse } from 'next/server';
import { getAdminEmail } from '@/app/lib/admin-auth';
import { getUsageSummary } from '@/app/lib/content-db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!getAdminEmail(request)) return NextResponse.json({ error: '僅限網站管理者使用。' }, { status: 403 });
  try {
    return NextResponse.json({ usage: await getUsageSummary() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: '使用統計暫時無法讀取。' }, { status: 503 });
  }
}
