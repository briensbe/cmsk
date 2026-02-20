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
        for (let i = 0; i < this.d; i++) {
            const col = this.hash(key, i);
            this.table[i][col]++;
            hits.push({ row: i, col });
        }
        return hits;
    }

    public estimate(key: string): number {
        let min = Infinity;
        for (let i = 0; i < this.d; i++) {
            const col = this.hash(key, i);
            min = Math.min(min, this.table[i][col]);
        }
        return min === Infinity ? 0 : min;
    }

    public getTable(): number[][] {
        return this.table.map(row => [...row]);
    }

    private hash(key: string, seed: number): number {
        let h = 0;
        // Simple hash function with seed to make it "different" per row
        const str = `${key}_${seed}`;
        for (let i = 0; i < str.length; i++) {
            h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
        }
        return Math.abs(h) % this.w;
    }
}
