export const ADMIN_EMAIL = 'ntujj@ms.tyc.edu.tw';

export function getAuthenticatedEmail(headers: Headers): string | null {
  const email = headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  return email || null;
}

export function isAdminEmail(email: string | null): boolean {
  return email === ADMIN_EMAIL;
}

export function getAdminEmail(request: Request): string | null {
  const email = getAuthenticatedEmail(request.headers);
  return isAdminEmail(email) ? email : null;
}
