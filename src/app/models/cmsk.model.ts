import { murmurHash128 } from '../utils/hash.utils';

export class CountMinSketch {
    private table: number[][];
    private d: number; // rows
    private w: number; // columns

    constructor(d: number = 4, w: number = 10) {
        this.d = d;
        this.w = w;
        this.table = Array.from({ length: d }, () => Array(w).fill(0));
    }

    public increment(key: string): { row: number, col: number }[] {
        const hits: { row: number, col: number }[] = [];
        const hashes = murmurHash128(key);

        for (let i = 0; i < this.d; i++) {
            const col = this.getHashForService(hashes, i);
            this.table[i][col]++;
            hits.push({ row: i, col });
        }
        return hits;
    }

    public estimate(key: string): number {
        let min = Infinity;
        const hashes = murmurHash128(key);

        for (let i = 0; i < this.d; i++) {
            const col = this.getHashForService(hashes, i);
            min = Math.min(min, this.table[i][col]);
        }
        return min === Infinity ? 0 : min;
    }

    public getTable(): number[][] {
        return this.table.map(row => [...row]);
    }

    private getHashForService(hashes: Uint32Array, i: number): number {
        // Use different combinations of the 4 32-bit words from MurmurHash3
        // to minimize collision propagation across rows.
        // Formula: (h1 + i * h2 + i*i * h3) % w
        const h1 = hashes[0];
        const h2 = hashes[1];
        const h3 = hashes[2];

        const hash = (h1 + Math.imul(i, h2) + Math.imul(Math.imul(i, i), h3)) >>> 0;
        return hash % this.w;
    }
}
