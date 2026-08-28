const ADMIN_EMAIL = 'ntujj@ms.tyc.edu.tw';

export function getAdminEmail(request: Request): string | null {
  const email = request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
  return email === ADMIN_EMAIL ? email : null;
}
