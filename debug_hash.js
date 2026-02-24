const crypto = require('crypto');

function murmurHash128(key, seed = 0) {
  const bytes = Buffer.from(key, 'utf8');
  const len = bytes.length;
  const nblocks = len >> 4;

  let h1 = seed | 0;
  let h2 = seed | 0;
  let h3 = seed | 0;
  let h4 = seed | 0;

  const c1 = 0x239b961b;
  const c2 = 0xab0e9789;
  const c3 = 0x38b34ae5;
  const c4 = 0xa1e38b93;

  for (let i = 0; i < nblocks; i++) {
    const offset = i << 4;
    let k1 =
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24) |
      0;
    let k2 =
      bytes[offset + 4] |
      (bytes[offset + 5] << 8) |
      (bytes[offset + 6] << 16) |
      (bytes[offset + 7] << 24) |
      0;
    let k3 =
      bytes[offset + 8] |
      (bytes[offset + 9] << 8) |
      (bytes[offset + 10] << 16) |
      (bytes[offset + 11] << 24) |
      0;
    let k4 =
      bytes[offset + 12] |
      (bytes[offset + 13] << 8) |
      (bytes[offset + 14] << 16) |
      (bytes[offset + 15] << 24) |
      0;

    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;

    h1 = (h1 << 19) | (h1 >>> 13);
    h1 = (h1 + h2) | 0;
    h1 = (Math.imul(h1, 5) + 0x561ccd1b) | 0;

    k2 = Math.imul(k2, c2);
    k2 = (k2 << 16) | (k2 >>> 16);
    k2 = Math.imul(k2, c3);
    h2 ^= k2;

    h2 = (h2 << 17) | (h2 >>> 15);
    h2 = (h2 + h3) | 0;
    h2 = (Math.imul(h2, 5) + 0x0b67422f) | 0;

    k3 = Math.imul(k3, c3);
    k3 = (k3 << 17) | (k3 >>> 15);
    k3 = Math.imul(k3, c4);
    h3 ^= k3;

    h3 = (h3 << 15) | (h3 >>> 17);
    h3 = (h3 + h4) | 0;
    h3 = (Math.imul(h3, 5) + 0x39109b17) | 0;

    k4 = Math.imul(k4, c4);
    k4 = (k4 << 18) | (k4 >>> 14);
    k4 = Math.imul(k4, c1);
    h4 ^= k4;

    h4 = (h4 << 13) | (h4 >>> 19);
    h4 = (h4 + h1) | 0;
    h4 = (Math.imul(h4, 5) + 0x1f67b143) | 0;
  }

  const offset = nblocks << 4;
  let k1 = 0,
    k2 = 0,
    k3 = 0,
    k4 = 0;
  const tailLen = len & 15;

  if (tailLen >= 15) k4 ^= bytes[offset + 14] << 16;
  if (tailLen >= 14) k4 ^= bytes[offset + 13] << 8;
  if (tailLen >= 13) {
    k4 ^= bytes[offset + 12];
    k4 = Math.imul(k4, c4);
    k4 = (k4 << 18) | (k4 >>> 14);
    k4 = Math.imul(k4, c1);
    h4 ^= k4;
  }
  if (tailLen >= 12) k3 ^= bytes[offset + 11] << 24;
  if (tailLen >= 11) k3 ^= bytes[offset + 10] << 16;
  if (tailLen >= 10) k3 ^= bytes[offset + 9] << 8;
  if (tailLen >= 9) {
    k3 ^= bytes[offset + 8];
    k3 = Math.imul(k3, c3);
    k3 = (k3 << 17) | (k3 >>> 15);
    k3 = Math.imul(k3, c4);
    h3 ^= k3;
  }
  if (tailLen >= 8) k2 ^= bytes[offset + 7] << 24;
  if (tailLen >= 7) k2 ^= bytes[offset + 6] << 16;
  if (tailLen >= 6) k2 ^= bytes[offset + 5] << 8;
  if (tailLen >= 5) {
    k2 ^= bytes[offset + 4];
    k2 = Math.imul(k2, c2);
    k2 = (k2 << 16) | (k2 >>> 16);
    k2 = Math.imul(k2, c3);
    h2 ^= k2;
  }
  if (tailLen >= 4) k1 ^= bytes[offset + 3] << 24;
  if (tailLen >= 3) k1 ^= bytes[offset + 2] << 16;
  if (tailLen >= 2) k1 ^= bytes[offset + 1] << 8;
  if (tailLen >= 1) {
    k1 ^= bytes[offset];
    k1 = Math.imul(k1, c1);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
  }

  h1 ^= len;
  h2 ^= len;
  h3 ^= len;
  h4 ^= len;
  h1 = (h1 + h2) | 0;
  h1 = (h1 + h3) | 0;
  h1 = (h1 + h4) | 0;
  h2 = (h2 + h1) | 0;
  h3 = (h3 + h1) | 0;
  h4 = (h4 + h1) | 0;

  const fmix = (h) => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h;
  };

  h1 = fmix(h1);
  h2 = fmix(h2);
  h3 = fmix(h3);
  h4 = fmix(h4);
  h1 = (h1 + h2) | 0;
  h1 = (h1 + h3) | 0;
  h1 = (h1 + h4) | 0;
  h2 = (h2 + h1) | 0;
  h3 = (h3 + h1) | 0;
  h4 = (h4 + h1) | 0;

  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

const w = 16; // puissance de 2 ou nb premier ? 13 ou 31 -> je choisis 16
const d = 4;

function getHashForService(hashes, i) {
  const h1 = hashes[0];
  const h2 = hashes[1];
  const h3 = hashes[2];

  const hash = (h1 + Math.imul(i, h2) + Math.imul(Math.imul(i, i), h3)) >>> 0;
  return hash % w;
}

function getHashes(isin) {
  const hashes = murmurHash128(isin);
  const result = [];
  for (let i = 0; i < d; i++) {
    result.push(getHashForService(hashes, i));
  }
  return result;
}

const sanofi = 'FR0000120578';
const stgobain = 'FR0000125007';

const res1 = getHashes(sanofi);
const res2 = getHashes(stgobain);

console.log(`Sanofi (${sanofi}): hashes=[${res1}]`);
console.log(`St Gobain (${stgobain}): hashes=[${res2}]`);

const allSame = res1.every((h, i) => h === res2[i]);
console.log(`Are all 4 hashes the same? ${allSame}`);

const countCollisions = res1.reduce((acc, h, i) => acc + (h === res2[i] ? 1 : 0), 0);
console.log(`Number of collisions between Sanofi and ST Gobain: ${countCollisions} / 4`);

// Total collisions check
const products = [
  'FR0000120271',
  'FR0000120578',
  'FR0000125007',
  'FR0000120628',
  'FR0000120644',
  'FR0000121014',
  'FR0000121121',
  'FR0000121261',
  'FR0000121329',
  'FR0000121485',
  'FR0000131104',
  'FR0000133308',
  'FR0000051732',
  'FR0000035081',
  'FR0010208488',
  'FR0000121667',
  'FR0000121972',
  'FR0000120073',
  'FR0000121709',
  'FR0000121501',
];

const allHashes = products.map((p) => ({ isin: p, hashes: getHashes(p).join(',') }));
const collisions = {};
allHashes.forEach((h) => {
  collisions[h.hashes] = collisions[h.hashes] || [];
  collisions[h.hashes].push(h.isin);
});

console.log('\nFull collisions found for first 20 products (hashes identical on all 4 rows):');
const fullCollisions = Object.entries(collisions).filter((e) => e[1].length > 1);
if (fullCollisions.length === 0) {
  console.log('None! All products have unique hash signatures.');
} else {
  fullCollisions.forEach(([h, list]) => {
    console.log(`Hashes [${h}] shared by: ${list.join(', ')}`);
  });
}
