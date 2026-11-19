const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join("reference_dump", "css", "site.css"), "utf8");
const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");
const html = fs.readFileSync(path.join("reference_dump", "html", "home.html"), "utf8");

console.log("Analyzing reference CSS, JS, HTML...");

// 1. Cursor search
console.log("\n--- CURSOR IN CSS ---");
const cursorRules = [...css.matchAll(/([^{}]*cursor[^{}]*\{[^}]+\})/gi)];
cursorRules.slice(0, 10).forEach(m => console.log(m[1].trim()));

console.log("\n--- CURSOR IN JS ---");
const cursorJs = [...js.matchAll(/.{0,50}cursor.{0,50}/gi)];
cursorJs.slice(0, 10).forEach(m => console.log(m[0].trim()));

// 2. Blur / Backdrop-filter search
console.log("\n--- BLUR / BACKDROP IN CSS ---");
const blurRules = [...css.matchAll(/([^{}]*(?:backdrop|blur)[^{}]*\{[^}]+\})/gi)];
blurRules.forEach(m => console.log(m[1].trim()));

// 3. Fixed / sticky bottom elements
console.log("\n--- FIXED/STICKY BOTTOM IN CSS ---");
const bottomRules = [...css.matchAll(/([^{}]*(?:fixed|sticky)[^{}]*\{[^}]*bottom[^}]+\})/gi)];
bottomRules.forEach(m => console.log(m[1].trim()));

// 4. Reveal / Scroll animation in CSS & JS
console.log("\n--- REVEAL / SCROLL ANIMATION IN JS ---");
const scrollKeywords = ["ScrollTrigger", "reveal", "splitText", "SplitType", "IntersectionObserver", "inview", "is-inview", "data-scroll", "animate"];
scrollKeywords.forEach(kw => {
  const matches = [...js.matchAll(new RegExp(`.{0,40}${kw}.{0,60}`, "gi"))];
  console.log(`Keyword '${kw}' count in JS: ${matches.length}`);
  if (matches.length > 0) {
    matches.slice(0, 5).forEach(m => console.log("   ->", m[0].trim()));
  }
});

console.log("\n--- REVEAL / INVIEW IN HTML ---");
const htmlMatches = [...html.matchAll(/(data-[a-z0-9_-]+="[^"]*")/gi)];
const uniqueDataAttrs = new Set(htmlMatches.map(m => m[1]));
console.log("Data attributes found:", Array.from(uniqueDataAttrs).slice(0, 20));
