const assert = require('assert');
const { parseImpact } = require('./impact.js');

const csv = [
    'date,case',
    '2026-07-31,P-001',
    '2026-08-10,P-002',
    '2026-08-31,P-002',
    '2026-09-16,',
    '2026-09-16,',
    '2026-09-16,',
    '2026-09-16,',
    '2026-09-16,',
    '2026-09-17,',
    '2026-09-17,',
    '2026-09-21,P-003'
].join('\n');

const { dogs, grants } = parseImpact(csv);
assert.deepStrictEqual(dogs, ['2026-07-31', '2026-08-10', '2026-09-21']);
assert.deepStrictEqual(grants, ['2026-07-31', '2026-08-10', '2026-08-31', '2026-09-16', '2026-09-17', '2026-09-21']);

// Column order and extra columns must not matter.
const reordered = parseImpact('Note,Ärende-id,Datum\nx,P-001,2026-07-31\nx,,2026-07-31');
assert.deepStrictEqual(reordered, { dogs: ['2026-07-31'], grants: ['2026-07-31'] });

assert.deepStrictEqual(parseImpact('date,case\n,\n'), { dogs: [], grants: [] });
assert.throws(() => parseImpact('name,amount\na,1'), /needs a "date" and a "case" column/);

// The committed file must parse, so a bad export is caught before it ships.
const fs = require('fs');
const real = parseImpact(fs.readFileSync('impact.csv', 'utf8'));
assert(real.grants.length, 'impact.csv has no dated rows');

console.log(`ok — impact.csv: ${real.dogs.length} dogs, ${real.grants.length} occasions, first ${real.grants[0]}`);
