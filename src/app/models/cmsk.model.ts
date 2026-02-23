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
        const [h1, h2] = murmurHash128(key);

        for (let i = 0; i < this.d; i++) {
            const col = this.getDoubleHash(h1, h2, i);
            this.table[i][col]++;
            hits.push({ row: i, col });
        }
        return hits;
    }

    public estimate(key: string): number {
        let min = Infinity;
        const [h1, h2] = murmurHash128(key);

        for (let i = 0; i < this.d; i++) {
            const col = this.getDoubleHash(h1, h2, i);
            min = Math.min(min, this.table[i][col]);
        }
        return min === Infinity ? 0 : min;
    }

    public getTable(): number[][] {
        return this.table.map(row => [...row]);
    }

    private getDoubleHash(h1: number, h2: number, i: number): number {
        // Double hashing formula: (h1 + i * h2) % w
        // h1 and h2 are already unsigned 32-bit integers from murmurHash128
        return ((h1 + Math.imul(i, h2)) >>> 0) % this.w;
    }
}
