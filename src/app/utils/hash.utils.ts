/**
 * MurmurHash3 x86 128-bit implementation in TypeScript.
 * Based on the original C++ implementation by Austin Appleby.
 * Returns an array of four 32-bit unsigned integers.
 */
export function murmurHash128(key: string, seed: number = 0): Uint32Array {
    const bytes = new TextEncoder().encode(key);
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

    // Body
    for (let i = 0; i < nblocks; i++) {
        const offset = i << 4;
        let k1 = (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) | 0;
        let k2 = (bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24)) | 0;
        let k3 = (bytes[offset + 8] | (bytes[offset + 9] << 8) | (bytes[offset + 10] << 16) | (bytes[offset + 11] << 24)) | 0;
        let k4 = (bytes[offset + 12] | (bytes[offset + 13] << 8) | (bytes[offset + 14] << 16) | (bytes[offset + 15] << 24)) | 0;

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

    // Tail
    const offset = nblocks << 4;
    let k1 = 0;
    let k2 = 0;
    let k3 = 0;
    let k4 = 0;

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

    // Finalization
    h1 ^= len; h2 ^= len; h3 ^= len; h4 ^= len;

    h1 = (h1 + h2) | 0; h1 = (h1 + h3) | 0; h1 = (h1 + h4) | 0;
    h2 = (h2 + h1) | 0; h3 = (h3 + h1) | 0; h4 = (h4 + h1) | 0;

    const fmix = (h: number): number => {
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

    h1 = (h1 + h2) | 0; h1 = (h1 + h3) | 0; h1 = (h1 + h4) | 0;
    h2 = (h2 + h1) | 0; h3 = (h3 + h1) | 0; h4 = (h4 + h1) | 0;

    return new Uint32Array([h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]);
}
