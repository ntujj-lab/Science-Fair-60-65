import { NextResponse } from 'next/server';
import { listContentEntries } from '@/app/lib/content-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ entries: await listContentEntries(true) });
  } catch {
    return NextResponse.json({ entries: [], unavailable: true });
  }
}
