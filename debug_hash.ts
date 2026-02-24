import { murmurHash128 } from './src/app/utils/hash.utils';

const w = 13;
const d = 4;

function getHashes(isin: string) {
    const [h1, h2] = murmurHash128(isin);
    const hashes = [];
    for (let i = 0; i < d; i++) {
        hashes.push(((h1 + i * h2) >>> 0) % w);
    }
    return { h1, h2, hashes };
}

const sanofi = "FR0000120578";
const stgobain = "FR0000125007";

const res1 = getHashes(sanofi);
const res2 = getHashes(stgobain);

console.log(`Sanofi (${sanofi}): h1=${res1.h1}, h2=${res1.h2}, hashes=${res1.hashes}`);
console.log(`St Gobain (${stgobain}): h1=${res2.h1}, h2=${res2.h2}, hashes=${res2.hashes}`);

const allSame = res1.hashes.every((h, i) => h === res2.hashes[i]);
console.log(`Are all 4 hashes the same? ${allSame}`);
