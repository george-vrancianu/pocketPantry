import { normaliseSourceLink } from './source-link';

describe('normaliseSourceLink', () => {
  it('lower-cases the host and drops the fragment', () => {
    expect(normaliseSourceLink(' HTTPS://Example.COM/Soup?x=1#top ')).toBe(
      'https://example.com/Soup?x=1',
    );
  });

  it.each(['ftp://example.com/a', 'javascript:alert(1)', 'not a url', ''])(
    'refuses %j',
    (raw) => {
      expect(normaliseSourceLink(raw)).toBeNull();
    },
  );

  it('refuses a link over the length limit', () => {
    expect(
      normaliseSourceLink(`https://example.com/${'a'.repeat(2100)}`),
    ).toBeNull();
  });
});
