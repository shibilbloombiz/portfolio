const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");
const vendor = fs.readFileSync("reference_dump/js/vendor.js", "utf8");

function scanForCursor(content, name) {
  console.log(`=== Scanning ${name} ===`);
  const matches = [...content.matchAll(/cursor/gi)];
  console.log("Count of 'cursor':", matches.length);
  matches.forEach(m => {
    const start = Math.max(0, m.index - 50);
    const end = Math.min(content.length, m.index + 50);
    console.log("  ", content.substring(start, end).replace(/\n/g, " "));
  });
}

scanForCursor(js, "site.js");
scanForCursor(vendor, "vendor.js");
