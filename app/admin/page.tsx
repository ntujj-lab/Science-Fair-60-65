import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedEmail, isAdminEmail } from '@/app/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminEntryPage() {
  const requestHeaders = await headers();
  const email = getAuthenticatedEmail(requestHeaders);

  if (!email) {
    redirect('/signin-with-chatgpt?return_to=%2Fadmin');
  }

  if (!isAdminEmail(email)) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f5f7f3', color: '#183b4d', fontFamily: '"Noto Sans TC", "Microsoft JhengHei", sans-serif' }}><section style={{ width: 'min(100%, 560px)', padding: '32px', borderRadius: '18px', background: '#fff', boxShadow: '0 14px 34px rgba(24,59,77,.12)' }}><p style={{ margin: 0, color: '#66746f', fontSize: '13px', letterSpacing: '.08em', textTransform: 'uppercase' }}>Content admin</p><h1 style={{ margin: '10px 0 12px', fontSize: '28px' }}>此帳號沒有內容後台權限</h1><p style={{ margin: '0 0 20px', lineHeight: 1.7 }}>目前登入的是 {email}。請改用已授權的管理帳號，或返回公開網站。</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}><a href="/signout-with-chatgpt?return_to=%2Fadmin" style={{ padding: '10px 15px', borderRadius: '9px', background: '#205b4b', color: '#fff', textDecoration: 'none' }}>改用其他帳號登入</a><a href="/" style={{ padding: '10px 15px', borderRadius: '9px', border: '1px solid #cddbd3', color: '#205b4b', textDecoration: 'none' }}>返回公開網站</a></div></section></main>;
  }

  redirect('/?admin=1');
}
