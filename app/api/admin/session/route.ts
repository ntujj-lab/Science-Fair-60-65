import { NextResponse } from 'next/server';
import { getAdminEmail } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const email = getAdminEmail(request);
  return NextResponse.json({ allowed: Boolean(email), email });
}
