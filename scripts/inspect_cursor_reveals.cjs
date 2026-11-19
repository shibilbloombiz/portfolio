const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");
const css = fs.readFileSync(path.join("reference_dump", "css", "site.css"), "utf8");

// Search hoverTag, hover-case, cursor, etc.
console.log("=== HOVER TAG / HOVER CASE ===");
const tagIdx = js.indexOf("hoverTag");
if (tagIdx !== -1) {
  console.log(js.substring(tagIdx - 300, tagIdx + 800));
}

// Search cursor or pointer in css
console.log("=== POINTER / CURSOR IN CSS ===");
const pointerCss = [...css.matchAll(/([^{}]*(?:cursor|pointer)[^{}]*\{[^}]+\})/gi)];
pointerCss.forEach(m => console.log(m[1].trim()));

// Check scroll-meter in CSS and JS
console.log("\n=== SCROLL METER IN CSS & JS ===");
const meterCss = [...css.matchAll(/([^{}]*scroll-meter[^{}]*\{[^}]+\})/gi)];
meterCss.forEach(m => console.log(m[1].trim()));

const meterIdx = js.indexOf("scroll-meter");
if (meterIdx !== -1) {
  console.log(js.substring(meterIdx - 50, meterIdx + 800));
}

// Let's inspect the entire reveals section in site.js
console.log("\n=== REVEALS DETAILED IN SITE.JS ===");
const revealStart = js.indexOf('MZ.feature("reveals"');
if (revealStart !== -1) {
  console.log(js.substring(revealStart, revealStart + 2500));
}
