import * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import {
  createPageFetcher,
  PAGE_FETCHER_USER_AGENT,
  PageFetchError,
  STRICT_PAGE_FETCHER_OPTIONS,
  type PageFetcherOptions,
} from './page-fetcher';

type Handler = (req: http.IncomingMessage, res: http.ServerResponse) => void;

const HTML = '<html><body>Hello</body></html>';
const html: Handler = (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(HTML);
};
const redirect =
  (location: string, status = 302): Handler =>
  (_req, res) => {
    res.statusCode = status;
    res.setHeader('Location', location);
    res.end();
  };

describe('page fetcher', () => {
  let server: http.Server;
  let port: number;
  let routes: Record<string, Handler>;
  let seen: http.IncomingMessage[];
  let lookups: string[];

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      seen.push(req);
      (routes[req.url ?? ''] ?? ((_q, r) => r.writeHead(404).end()))(req, res);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    port = (server.address() as AddressInfo).port;
  });
  afterAll(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  beforeEach(() => {
    routes = {};
    seen = [];
    lookups = [];
  });

  /** A fetcher whose DNS maps every name to the local server and whose policy lets 127.0.0.1 through. */
  const testFetcher = (overrides: Partial<PageFetcherOptions> = {}) =>
    createPageFetcher({
      ...STRICT_PAGE_FETCHER_OPTIONS,
      lookup: (hostname) => {
        lookups.push(hostname);
        return Promise.resolve([{ address: '127.0.0.1', family: 4 }]);
      },
      isAddressAllowed: (address) => address === '127.0.0.1',
      isPortAllowed: () => true,
      timeoutMs: 2000,
      maxBytes: 4096,
      ...overrides,
    });
  const base = () => `http://recipes.example.test:${port}`;

  const kindOf = async (promise: Promise<unknown>) => {
    const error: unknown = await promise.then(
      () => null,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(PageFetchError);
    return (error as PageFetchError).kind;
  };

  describe('reading a page', () => {
    it('returns the final URL and the HTML, sending a descriptive User-Agent', async () => {
      routes['/r'] = html;
      const page = await testFetcher().fetchPage(`${base()}/r`);
      expect(page).toEqual({ finalUrl: `${base()}/r`, html: HTML });
      expect(seen[0].headers['user-agent']).toBe(PAGE_FETCHER_USER_AGENT);
      expect(PAGE_FETCHER_USER_AGENT).toMatch(/PocketPantry/);
      expect(seen[0].headers.host).toBe(`recipes.example.test:${port}`);
      expect(seen[0].headers.accept).toBe('text/html,application/xhtml+xml');
      expect(seen[0].headers['accept-encoding']).toBe('identity');
    });

    it('sends the query string', async () => {
      routes['/r?a=1&b=2'] = html;
      await expect(
        testFetcher().fetchPage(`${base()}/r?a=1&b=2`),
      ).resolves.toMatchObject({ html: HTML });
    });

    it.each([
      'text/html',
      'TEXT/HTML; charset=UTF-8',
      'application/xhtml+xml',
      'application/xhtml+xml;charset=utf-8',
    ])('accepts the content type %s', async (type) => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', type);
        res.end(HTML);
      };
      await expect(
        testFetcher().fetchPage(`${base()}/r`),
      ).resolves.toMatchObject({ html: HTML });
    });

    it('honours a known charset and falls back to UTF-8 for an unknown one', async () => {
      routes['/latin'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=iso-8859-1');
        res.end(Buffer.from([0x63, 0x61, 0x66, 0xe9]));
      };
      routes['/odd'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=nonsense');
        res.end('café');
      };
      const fetcher = testFetcher();
      expect((await fetcher.fetchPage(`${base()}/latin`)).html).toBe('café');
      expect((await fetcher.fetchPage(`${base()}/odd`)).html).toBe('café');
    });
  });

  describe('refusing the link', () => {
    const fetcher = createPageFetcher();

    it.each([
      'file:///etc/passwd',
      'ftp://example.com/x',
      'data:text/html,<p>x</p>',
      'javascript:alert(1)',
      'gopher://example.com/',
      'ws://example.com/',
      'not a url',
      '',
      '//example.com/x',
    ])('refuses %s as invalid', async (link) => {
      expect(await kindOf(fetcher.fetchPage(link))).toBe('invalid');
    });

    it.each([
      'http://user:pass@example.com/',
      'https://user@example.com/',
      'https://:pass@example.com/',
    ])('refuses credentials in %s', async (link) => {
      expect(await kindOf(fetcher.fetchPage(link))).toBe('invalid');
    });

    it.each([
      'http://example.com:8080/',
      'https://example.com:8443/',
      'http://example.com:22/',
      'https://example.com:80/',
      'http://example.com:443/',
    ])(
      'refuses the non-default port in %s with the production policy',
      async (link) => {
        expect(await kindOf(fetcher.fetchPage(link))).toBe('invalid');
      },
    );

    it.each([
      'http://127.0.0.1/',
      'http://127.0.0.1:80/',
      'http://10.0.0.1/',
      'http://192.168.1.1/',
      'http://172.16.0.1/',
      'http://169.254.169.254/latest/meta-data/',
      'http://100.64.0.1/',
      'http://0.0.0.0/',
      'http://255.255.255.255/',
      'http://224.0.0.1/',
      'http://[::1]/',
      'http://[::]/',
      'http://[::ffff:127.0.0.1]/',
      'http://[::ffff:7f00:1]/',
      'http://[::ffff:169.254.169.254]/',
      'http://[::127.0.0.1]/',
      'http://[64:ff9b::7f00:1]/',
      'http://[2002:7f00:1::]/',
      'http://[2001:0:4136:e378:8000:63bf:3fff:fdd2]/',
      'http://[fd00:ec2::254]/',
      'http://[fe80::1]/',
      'http://[ff02::1]/',
      'http://2130706433/',
      'http://0x7f.1/',
      'http://0177.0.0.1/',
      'http://127.1/',
      'http://0x7f000001/',
      'http://017700000001/',
      'http://0/',
    ])('refuses the address in %s without a lookup', async (link) => {
      const lookup = jest.fn();
      const strict = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup,
      });
      const kind = await kindOf(strict.fetchPage(link));
      // `localhost` is a name: it is resolved (by the real resolver) and refused as loopback.
      expect(kind).toBe('invalid');
      if (!link.includes('localhost')) expect(lookup).not.toHaveBeenCalled();
    });

    it('refuses localhost by name, resolved to loopback', async () => {
      const strict = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () =>
          Promise.resolve([
            { address: '::1', family: 6 },
            { address: '127.0.0.1', family: 4 },
          ]),
      });
      expect(await kindOf(strict.fetchPage('http://localhost/'))).toBe(
        'invalid',
      );
    });

    it('refuses a name that resolves to a private address', async () => {
      const strict = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () => Promise.resolve([{ address: '10.0.0.1', family: 4 }]),
      });
      expect(
        await kindOf(strict.fetchPage('https://internal.example.test/')),
      ).toBe('invalid');
    });

    it('refuses a name when ANY of its addresses is not public', async () => {
      const strict = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () =>
          Promise.resolve([
            { address: '93.184.216.34', family: 4 },
            { address: 'fd00:ec2::254', family: 6 },
          ]),
      });
      expect(
        await kindOf(strict.fetchPage('https://mixed.example.test/')),
      ).toBe('invalid');
    });

    it('treats a failed or empty DNS answer as unreadable', async () => {
      const failing = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () => Promise.reject(new Error('ENOTFOUND')),
      });
      const empty = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () => Promise.resolve([]),
      });
      expect(
        await kindOf(failing.fetchPage('https://nope.example.test/')),
      ).toBe('unreadable');
      expect(await kindOf(empty.fetchPage('https://nope.example.test/'))).toBe(
        'unreadable',
      );
    });

    it('refuses the address policy of the production defaults even for the local server', async () => {
      routes['/r'] = html;
      const strict = createPageFetcher({
        ...STRICT_PAGE_FETCHER_OPTIONS,
        lookup: () => Promise.resolve([{ address: '127.0.0.1', family: 4 }]),
      });
      expect(
        await kindOf(strict.fetchPage(`http://recipes.example.test/r`)),
      ).toBe('invalid');
      expect(seen).toHaveLength(0);
    });
  });

  describe('connecting to the checked address', () => {
    it('looks the host up once and connects to that answer even if DNS would now answer differently (rebinding)', async () => {
      routes['/r'] = html;
      const answers = [
        [{ address: '127.0.0.1', family: 4 }],
        [{ address: '10.0.0.1', family: 4 }],
      ];
      const lookup = jest.fn(() => Promise.resolve(answers.shift() ?? []));
      const page = await testFetcher({ lookup }).fetchPage(`${base()}/r`);
      expect(page.html).toBe(HTML);
      expect(lookup).toHaveBeenCalledTimes(1);
    });

    it('looks up once per hop', async () => {
      routes['/a'] = redirect(`http://other.example.test:${port}/b`);
      routes['/b'] = html;
      await testFetcher().fetchPage(`${base()}/a`);
      expect(lookups).toEqual(['recipes.example.test', 'other.example.test']);
    });
  });

  describe('redirects', () => {
    it.each([301, 302, 303, 307, 308])(
      'follows a %s and returns the final URL',
      async (status) => {
        routes['/a'] = redirect('/b', status);
        routes['/b'] = html;
        const page = await testFetcher().fetchPage(`${base()}/a`);
        expect(page).toEqual({ finalUrl: `${base()}/b`, html: HTML });
      },
    );

    it('resolves a relative Location against the current URL', async () => {
      routes['/dir/a'] = redirect('b?x=1');
      routes['/dir/b?x=1'] = redirect('../c');
      routes['/c'] = html;
      const page = await testFetcher().fetchPage(`${base()}/dir/a`);
      expect(page.finalUrl).toBe(`${base()}/c`);
    });

    it('follows 5 redirects and refuses the 6th', async () => {
      for (let i = 0; i < 7; i += 1) routes[`/h${i}`] = redirect(`/h${i + 1}`);
      routes['/h5'] = html;
      expect((await testFetcher().fetchPage(`${base()}/h0`)).finalUrl).toBe(
        `${base()}/h5`,
      );
      routes['/h5'] = redirect('/h6');
      routes['/h6'] = html;
      expect(await kindOf(testFetcher().fetchPage(`${base()}/h0`))).toBe(
        'unreadable',
      );
    });

    it('stops a redirect loop', async () => {
      routes['/loop'] = redirect('/loop');
      expect(await kindOf(testFetcher().fetchPage(`${base()}/loop`))).toBe(
        'unreadable',
      );
    });

    it('refuses a public host that redirects to a private address, before connecting to it', async () => {
      routes['/a'] = redirect('http://10.0.0.1/secret');
      expect(await kindOf(testFetcher().fetchPage(`${base()}/a`))).toBe(
        'invalid',
      );
    });

    it.each([
      'http://169.254.169.254/latest/meta-data/',
      'http://[::1]/',
      'http://[::ffff:10.0.0.1]/',
    ])('refuses a redirect to %s', async (location) => {
      routes['/a'] = redirect(location);
      expect(await kindOf(testFetcher().fetchPage(`${base()}/a`))).toBe(
        'invalid',
      );
    });

    it('refuses a redirect to a name that resolves to a private address', async () => {
      routes['/a'] = redirect(`http://internal.example.test:${port}/b`);
      routes['/b'] = html;
      const fetcher = testFetcher({
        lookup: (hostname) =>
          Promise.resolve([
            {
              address:
                hostname === 'internal.example.test' ? '10.0.0.1' : '127.0.0.1',
              family: 4,
            },
          ]),
      });
      expect(await kindOf(fetcher.fetchPage(`${base()}/a`))).toBe('invalid');
    });

    it.each([
      'file:///etc/passwd',
      'ftp://example.com/',
      'javascript:alert(1)',
      'data:text/html,x',
    ])('refuses a redirect to %s', async (location) => {
      routes['/a'] = redirect(location);
      expect(await kindOf(testFetcher().fetchPage(`${base()}/a`))).toBe(
        'invalid',
      );
    });

    it('re-checks credentials and the port policy on a redirect', async () => {
      routes['/a'] = redirect(`http://user:pw@recipes.example.test:${port}/b`);
      expect(await kindOf(testFetcher().fetchPage(`${base()}/a`))).toBe(
        'invalid',
      );
      routes['/c'] = redirect(`http://recipes.example.test:${port}/b`);
      const fetcher = testFetcher({ isPortAllowed: (p) => p === '' });
      expect(await kindOf(fetcher.fetchPage(`${base()}/c`))).toBe('invalid');
    });

    it('treats a redirect without Location as unreadable', async () => {
      routes['/a'] = (_req, res) => res.writeHead(302).end();
      expect(await kindOf(testFetcher().fetchPage(`${base()}/a`))).toBe(
        'unreadable',
      );
    });
  });

  describe('failures', () => {
    it.each([403, 404, 500, 503])(
      'treats a %s answer as unreadable',
      async (status) => {
        routes['/r'] = (_req, res) => {
          res.setHeader('Content-Type', 'text/html');
          res.writeHead(status).end('nope');
        };
        expect(await kindOf(testFetcher().fetchPage(`${base()}/r`))).toBe(
          'unreadable',
        );
      },
    );

    it('treats a refused connection as unreadable', async () => {
      const closed = http.createServer();
      await new Promise<void>((resolve) =>
        closed.listen(0, '127.0.0.1', resolve),
      );
      const closedPort = (closed.address() as AddressInfo).port;
      await new Promise((resolve) => closed.close(resolve));
      expect(
        await kindOf(
          testFetcher().fetchPage(`http://recipes.example.test:${closedPort}/`),
        ),
      ).toBe('unreadable');
    });

    it.each([
      ['application/json', '{}'],
      ['image/png', 'x'],
      ['application/pdf', 'x'],
      ['text/plain', 'hello'],
      ['text/htmlx', 'x'],
      ['application/xml', '<a/>'],
    ])('refuses the content type %s', async (type, body) => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', type);
        res.end(body);
      };
      expect(await kindOf(testFetcher().fetchPage(`${base()}/r`))).toBe(
        'unreadable',
      );
    });

    it('refuses a missing content type', async () => {
      routes['/r'] = (_req, res) => {
        res.removeHeader('Content-Type');
        res.end(HTML);
      };
      expect(await kindOf(testFetcher().fetchPage(`${base()}/r`))).toBe(
        'unreadable',
      );
    });

    it('refuses a compressed body it did not ask for', async () => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Encoding', 'gzip');
        res.end(Buffer.from([0x1f, 0x8b]));
      };
      expect(await kindOf(testFetcher().fetchPage(`${base()}/r`))).toBe(
        'unreadable',
      );
    });
  });

  describe('size cap', () => {
    it('accepts a body exactly at the cap', async () => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end('a'.repeat(4096));
      };
      expect((await testFetcher().fetchPage(`${base()}/r`)).html).toHaveLength(
        4096,
      );
    });

    it('refuses an over-cap Content-Length without reading the body', async () => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.end('a'.repeat(4097));
      };
      expect(await kindOf(testFetcher().fetchPage(`${base()}/r`))).toBe(
        'unreadable',
      );
    });

    it('cuts off a chunked body with no Content-Length once over the cap', async () => {
      let aborted = false;
      routes['/r'] = (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        req.socket.on('close', () => (aborted = true));
        const timer = setInterval(() => res.write('a'.repeat(1024)), 5);
        res.on('close', () => clearInterval(timer));
      };
      expect(
        await kindOf(testFetcher({ timeoutMs: 5000 }).fetchPage(`${base()}/r`)),
      ).toBe('unreadable');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(aborted).toBe(true);
    });
  });

  describe('timeout', () => {
    it('times out a server that never sends headers', async () => {
      routes['/r'] = () => undefined;
      const started = Date.now();
      expect(
        await kindOf(testFetcher({ timeoutMs: 200 }).fetchPage(`${base()}/r`)),
      ).toBe('unreadable');
      expect(Date.now() - started).toBeLessThan(1500);
    });

    it('times out a slow-drip body', async () => {
      routes['/r'] = (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.writeHead(200);
        const timer = setInterval(() => res.write('a'), 50);
        res.on('close', () => clearInterval(timer));
      };
      const started = Date.now();
      expect(
        await kindOf(testFetcher({ timeoutMs: 300 }).fetchPage(`${base()}/r`)),
      ).toBe('unreadable');
      expect(Date.now() - started).toBeLessThan(1500);
    });

    it('times out a slow DNS lookup', async () => {
      const fetcher = testFetcher({
        timeoutMs: 100,
        lookup: () => new Promise(() => undefined),
      });
      expect(await kindOf(fetcher.fetchPage(`${base()}/r`))).toBe('unreadable');
    });

    it('shares one deadline across redirect hops', async () => {
      for (let i = 0; i < 4; i += 1) {
        routes[`/s${i}`] = (_req, res) => {
          setTimeout(() => redirect(`/s${i + 1}`)(_req, res), 120);
        };
      }
      routes['/s4'] = html;
      expect(
        await kindOf(testFetcher({ timeoutMs: 300 }).fetchPage(`${base()}/s0`)),
      ).toBe('unreadable');
    });
  });

  describe('production defaults', () => {
    it('are the strict ones', () => {
      expect(STRICT_PAGE_FETCHER_OPTIONS).toMatchObject({
        timeoutMs: 10_000,
        maxBytes: 3 * 1024 * 1024,
        maxRedirects: 5,
      });
      expect(STRICT_PAGE_FETCHER_OPTIONS.isPortAllowed('')).toBe(true);
      expect(STRICT_PAGE_FETCHER_OPTIONS.isPortAllowed('8080')).toBe(false);
      expect(STRICT_PAGE_FETCHER_OPTIONS.isAddressAllowed('127.0.0.1')).toBe(
        false,
      );
    });
  });
});
