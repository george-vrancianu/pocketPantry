/** Parses the comma-separated ADMIN_EMAILS allow-list into normalised addresses. */
export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(email: string, allowList: string[]): boolean {
  return allowList.includes(email.trim().toLowerCase());
}
