import { isAdminEmail, parseAdminEmails } from './admin-emails';

describe('admin email allow-list', () => {
  it('parses a comma-separated list, ignoring blanks and case', () => {
    expect(parseAdminEmails(' A@x.com, ,b@X.com ')).toEqual([
      'a@x.com',
      'b@x.com',
    ]);
    expect(parseAdminEmails(undefined)).toEqual([]);
  });

  it('matches case-insensitively and never matches an empty list', () => {
    const list = parseAdminEmails('chef@example.com');
    expect(isAdminEmail('Chef@Example.com', list)).toBe(true);
    expect(isAdminEmail('other@example.com', list)).toBe(false);
    expect(isAdminEmail('chef@example.com', [])).toBe(false);
  });
});
