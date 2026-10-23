import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const publicFile = (name: string) =>
  resolve(root, 'public', name.replace(/^\//, ''));

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

const manifest = JSON.parse(
  readFileSync(publicFile('manifest.webmanifest'), 'utf8'),
) as { icons: ManifestIcon[] };
const html = readFileSync(resolve(root, 'index.html'), 'utf8');

function pngSize(path: string) {
  const bytes = readFileSync(path);
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

describe('app icons', () => {
  it('lists 192, 512 and maskable 512 icons that exist at their declared size', () => {
    const listed = manifest.icons.map((i) => `${i.sizes} ${i.purpose}`);
    expect(listed).toEqual(['192x192 any', '512x512 any', '512x512 maskable']);
    for (const icon of manifest.icons) {
      expect(icon.type).toBe('image/png');
      expect(pngSize(publicFile(icon.src))).toBe(icon.sizes);
    }
  });

  it('links the favicon and a 180x180 apple-touch icon from index.html', () => {
    for (const href of ['/favicon.svg', '/favicon-48.png', '/favicon-32.png']) {
      expect(html).toMatch(new RegExp(`<link rel="icon"[^>]*href="${href}"`));
      expect(() => readFileSync(publicFile(href))).not.toThrow();
    }
    expect(html).toContain('rel="apple-touch-icon"');
    expect(pngSize(publicFile('apple-touch-icon.png'))).toBe('180x180');
  });
});
