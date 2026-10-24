import { isIPv4, isIPv6 } from 'node:net';

/** An IPv4 range as [first address, prefix length]. */
type V4Range = readonly [string, number];

/**
 * Everything in IPv4 space that is not public unicast: "this" network, private,
 * shared (CGNAT), loopback, link-local (incl. cloud metadata 169.254.169.254),
 * IETF/documentation/benchmark ranges, multicast, and reserved (incl. broadcast).
 */
const BLOCKED_V4: readonly V4Range[] = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function parseV4(address: string): number | null {
  if (!isIPv4(address)) return null;
  const octets = address.split('.').map(Number);
  return octets.reduce((acc, octet) => acc * 256 + octet, 0);
}

const inV4Range = (value: number, [base, prefix]: V4Range): boolean => {
  const start = parseV4(base) as number;
  const size = 2 ** (32 - prefix);
  return value >= start && value < start + size;
};

/** Eight 16-bit groups of an IPv6 address, or null when it is not one. */
function parseV6(address: string): number[] | null {
  if (address.includes('%') || !isIPv6(address)) return null;
  let text = address;
  const lastColon = text.lastIndexOf(':');
  const tail = text.slice(lastColon + 1);
  if (tail.includes('.')) {
    const v4 = parseV4(tail);
    if (v4 === null) return null;
    text = `${text.slice(0, lastColon + 1)}${(v4 >>> 16).toString(16)}:${(v4 & 0xffff).toString(16)}`;
  }
  const [head, rest, ...extra] = text.split('::');
  if (extra.length > 0) return null;
  const groups = (part: string | undefined) =>
    part ? part.split(':').map((group) => parseInt(group, 16)) : [];
  const first = groups(head);
  if (rest === undefined) return first.length === 8 ? first : null;
  const last = groups(rest);
  const fill = 8 - first.length - last.length;
  if (fill < 1) return null;
  return [...first, ...new Array<number>(fill).fill(0), ...last];
}

/**
 * IPv6 prefixes inside 2000::/3 that are still not public unicast. Each is
 * [first group value, prefix length in bits] over the first 32 bits (two groups).
 */
const BLOCKED_V6: readonly (readonly [number, number])[] = [
  [0x20010000, 23], // 2001::/23: IETF protocol assignments, Teredo 2001::/32, ORCHID 2001:10::/28 and 2001:20::/28
  [0x20010db8, 32], // 2001:db8::/32 documentation
  [0x20020000, 16], // 2002::/16 6to4 (embeds an IPv4 address)
  [0x3fff0000, 20], // 3fff::/20 documentation
  [0x5f000000, 16], // 5f00::/16 segment routing SIDs
];

/**
 * True only for an address that is global unicast on the public internet.
 * IPv6 is allowed only within 2000::/3 minus the blocked prefixes above, which
 * refuses by default `::`, `::1`, IPv4-mapped (`::ffff:0:0/96`, even when the
 * embedded address is public), IPv4-compatible, NAT64 (`64:ff9b::/96`,
 * `64:ff9b:1::/48`), `100::/64`, unique-local (`fc00::/7`, incl. the EC2
 * metadata address), link-local, site-local and multicast. Anything that is not
 * a plain IP literal (hostnames, zone ids, malformed text) is refused.
 */
export function isPublicAddress(address: string): boolean {
  const v4 = parseV4(address);
  if (v4 !== null) return !BLOCKED_V4.some((range) => inV4Range(v4, range));
  const groups = parseV6(address);
  if (groups === null) return false;
  if ((groups[0] & 0xe000) !== 0x2000) return false;
  const top32 = groups[0] * 0x10000 + groups[1];
  return !BLOCKED_V6.some(
    ([base, prefix]) =>
      Math.floor(top32 / 2 ** (32 - prefix)) ===
      Math.floor(base / 2 ** (32 - prefix)),
  );
}
