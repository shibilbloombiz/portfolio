const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");
const css = fs.readFileSync(path.join("reference_dump", "css", "site.css"), "utf8");
const html = fs.readFileSync(path.join("reference_dump", "html", "home.html"), "utf8");

// Search for hover-tag in site.css
console.log("=== HOVER-TAG IN CSS ===");
const tagCss = [...css.matchAll(/([^{}]*hover-tag[^{}]*\{[^}]+\})/gi)];
tagCss.forEach(m => console.log(m[1].trim()));

// Search for hover-tag in home.html
console.log("\n=== HOVER-TAG IN HTML ===");
const tagHtml = [...html.matchAll(/.{0,50}hover-tag.{0,100}/gi)];
tagHtml.forEach(m => console.log(m[0].trim()));

// Where is MZ.once("hover-tag" or similar in site.js?
console.log("\n=== HOVER-TAG IN JS ===");
const idx = js.indexOf('"hover-tag"');
const idx2 = js.indexOf('hover-tag');
console.log("Indices:", idx, idx2);
if (idx2 !== -1) {
  console.log(js.substring(idx2 - 100, idx2 + 1000));
}
