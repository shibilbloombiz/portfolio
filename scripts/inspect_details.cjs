const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");
const vendor = fs.readFileSync(path.join("reference_dump", "js", "vendor.js"), "utf8");
const css = fs.readFileSync(path.join("reference_dump", "css", "site.css"), "utf8");
const html = fs.readFileSync(path.join("reference_dump", "html", "home.html"), "utf8");

// Search reveals in site.js
console.log("=== REVEALS IN SITE.JS ===");
const revealIndex = js.indexOf('MZ.feature("reveals"');
if (revealIndex !== -1) {
  console.log(js.substring(revealIndex - 100, revealIndex + 1200));
} else {
  const r2 = js.indexOf('reveals');
  console.log("reveals at:", r2);
}

// Search bottom blur in site.js
console.log("\n=== BOTTOM BLUR IN SITE.JS ===");
const blurIndex = js.indexOf('bottom-blur');
if (blurIndex !== -1) {
  console.log(js.substring(blurIndex - 100, blurIndex + 800));
}

// Search bottom blur HTML in home.html
console.log("\n=== BOTTOM BLUR IN HOME.HTML ===");
const htmlBlur = html.indexOf('data-bottom-blur');
if (htmlBlur !== -1) {
  console.log(html.substring(htmlBlur - 100, htmlBlur + 600));
}

// Search cursor in vendor or site.js or css
console.log("\n=== CURSOR SEARCH ===");
const cursorMatches = [
  ...js.matchAll(/pointer|cursor|mouse/gi)
];
console.log("Matches in site.js for cursor/mouse/pointer:", cursorMatches.length);
[...js.matchAll(/.{0,60}(?:cursor|pointer-events|follow|mouse).{0,60}/gi)].slice(0, 15).forEach(m => {
  console.log("  ->", m[0].trim());
});

// Let's check if there is custom cursor in CSS or HTML
const cursorClass = [...css.matchAll(/.{0,40}\.cursor.{0,60}/gi)];
console.log("Cursor classes in CSS:", cursorClass.map(m => m[0]));

// Let's check HTML for cursor
const htmlCursor = [...html.matchAll(/.{0,50}cursor.{0,50}/gi)];
console.log("Cursor in HTML:", htmlCursor.map(m => m[0]));
