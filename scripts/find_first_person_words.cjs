const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'node_modules' && e.name !== 'dist' && e.name !== '.git' && e.name !== 'reference_dump') {
        files = files.concat(walk(f));
      }
    } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.html')) {
      files.push(f);
    }
  });
  return files;
}

const files = walk('src').concat(['index.html']);
// Words to flag: I, my, I'm, I'll, myself, mine, me, Moiséz, Moisés
const patterns = [
  /\bI\b/,
  /\bmy\b/i,
  /\bI'm\b/i,
  /\bI'll\b/i,
  /\bmyself\b/i,
  /\bmine\b/i,
  /\bmoisez\b/i,
  /\bmoises\b/i
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Ignore imports, comments or code syntax like 'i++' or variable 'i'
    if (line.trim().startsWith('//') || line.trim().startsWith('import ') || line.trim().startsWith('*')) return;
    for (const pat of patterns) {
      if (pat.test(line)) {
        console.log(`${file}:${idx + 1}: ${line.trim()}`);
        break;
      }
    }
  });
});
