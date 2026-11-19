const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");

// Search for hoverTag definition
const tagIdx = js.indexOf('hoverTag={');
if (tagIdx !== -1) {
  console.log(js.substring(tagIdx - 1500, tagIdx + 1000));
} else {
  // Search for .hover-tag in js
  const tag2 = js.indexOf('hover-tag');
  console.log(js.substring(tag2 - 200, tag2 + 1500));
}
