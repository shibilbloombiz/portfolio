const fs = require("fs");
const path = require("path");

function searchInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== "node_modules" && f !== ".git" && f !== "dist" && f !== "reference_dump") {
        searchInDir(full);
      }
    } else if (f.endsWith(".tsx") || f.endsWith(".ts") || f.endsWith(".html") || f.endsWith(".css")) {
      const content = fs.readFileSync(full, "utf8");
      const matches = [...content.matchAll(/(moisez[^"'\s<>]*|brand-logo|underlay-nav__logo)/gi)];
      if (matches.length > 0) {
        console.log(`\nIn ${full}:`);
        [...new Set(matches.map(m => m[0]))].forEach(m => console.log("  ->", m));
      }
    }
  }
}

searchInDir(".");
