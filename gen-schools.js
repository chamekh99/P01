// generate-schools: extract unique (ecole, wilaya-id) pairs from all wilaya files
// run: node gen-schools.js
// output: data-concours25/schools.json

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, 'data-concours25');
const OUT  = path.join(DATA, 'schools.json');

const seen = new Map(); // "ecole|wid" -> {e, w}

fs.readdirSync(DATA)
  .filter(f => /^wilaya-\d+\.json$/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0]);
    const nb = parseInt(b.match(/\d+/)[0]);
    return na - nb;
  })
  .forEach(fname => {
    const wid = fname.replace('.json', '');
    const d = JSON.parse(fs.readFileSync(path.join(DATA, fname), 'utf8'));
    (d.students || []).forEach(s => {
      if (!s.ecole) return;
      const key = s.ecole + '|' + wid;
      if (!seen.has(key)) seen.set(key, { e: s.ecole, w: wid });
    });
  });

const schools = [...seen.values()].sort((a, b) =>
  a.e.localeCompare(b.e, 'ar')
);

fs.writeFileSync(OUT, JSON.stringify({ schools }));
console.log(`✓ ${schools.length} schools → ${OUT}`);
console.log(`  size: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB raw`);
