import { isPublicAddress } from './public-address';

describe('isPublicAddress', () => {
  describe('IPv4', () => {
    it.each([
      '8.8.8.8',
      '1.1.1.1',
      '93.184.216.34',
      '100.63.255.255',
      '100.128.0.0',
      '172.15.255.255',
      '172.32.0.0',
      '192.0.1.1',
      '192.167.255.255',
      '192.169.0.0',
      '198.17.255.255',
      '198.20.0.0',
      '223.255.255.255',
    ])('allows the public address %s', (address) => {
      expect(isPublicAddress(address)).toBe(true);
    });

    it.each([
      '0.0.0.0',
      '0.255.255.255',
      '10.0.0.1',
      '10.255.255.255',
      '100.64.0.1',
      '100.127.255.255',
      '127.0.0.1',
      '127.255.255.254',
      '169.254.0.1',
      '169.254.169.254',
      '172.16.0.1',
      '172.31.255.255',
      '192.0.0.1',
      '192.0.2.5',
      '192.88.99.1',
      '192.168.0.1',
      '192.168.255.255',
      '198.18.0.1',
      '198.19.255.255',
      '198.51.100.7',
      '203.0.113.9',
      '224.0.0.1',
      '239.255.255.255',
      '240.0.0.1',
      '255.255.255.254',
      '255.255.255.255',
    ])('refuses the reserved address %s', (address) => {
      expect(isPublicAddress(address)).toBe(false);
    });
  });

  describe('IPv6', () => {
    it.each([
      '2606:4700:4700::1111',
      '2001:4860:4860::8888',
      '2a00:1450:4001:81b::200e',
      '2001:200::1',
      '2001:2000::1',
    ])('allows the global unicast address %s', (address) => {
      expect(isPublicAddress(address)).toBe(true);
    });

    it.each([
      ['unspecified', '::'],
      ['loopback', '::1'],
      ['loopback, long form', '0:0:0:0:0:0:0:1'],
      ['IPv4-mapped loopback', '::ffff:127.0.0.1'],
      ['IPv4-mapped loopback, hex', '::ffff:7f00:1'],
      ['IPv4-mapped metadata', '::ffff:169.254.169.254'],
      ['IPv4-mapped private', '::ffff:10.0.0.1'],
      ['IPv4-mapped public', '::ffff:8.8.8.8'],
      ['IPv4-compatible loopback', '::127.0.0.1'],
      ['IPv4-compatible public', '::8.8.8.8'],
      ['NAT64', '64:ff9b::7f00:1'],
      ['NAT64 dotted', '64:ff9b::10.0.0.1'],
      ['local-use NAT64', '64:ff9b:1::1'],
      ['6to4', '2002:7f00:1::'],
      ['6to4 public', '2002:808:808::1'],
      ['Teredo', '2001:0:4136:e378:8000:63bf:3fff:fdd2'],
      ['IETF protocol assignments', '2001:1::1'],
      ['ORCHID', '2001:10::1'],
      ['ORCHIDv2', '2001:20::1'],
      ['documentation', '2001:db8::1'],
      ['documentation 3fff', '3fff::1'],
      ['discard-only', '100::1'],
      ['unique-local fc00', 'fc00::1'],
      ['unique-local fd', 'fd12:3456::1'],
      ['EC2 metadata', 'fd00:ec2::254'],
      ['link-local', 'fe80::1'],
      ['link-local with zone', 'fe80::1%eth0'],
      ['site-local', 'fec0::1'],
      ['multicast', 'ff02::1'],
      ['SRv6', '5f00::1'],
      ['not an address', 'example.com'],
      ['empty', ''],
    ])('refuses %s (%s)', (_name, address) => {
      expect(isPublicAddress(address)).toBe(false);
    });
  });

  it('refuses malformed IPv4 forms', () => {
    for (const address of [
      '1.2.3',
      '1.2.3.4.5',
      '256.1.1.1',
      '08.1.1.1',
      '1.2.3.-4',
    ]) {
      expect(isPublicAddress(address)).toBe(false);
    }
  });
});
