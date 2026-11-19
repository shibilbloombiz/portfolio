const fs = require("fs");
const path = require("path");

const js = fs.readFileSync(path.join("reference_dump", "js", "site.js"), "utf8");
const css = fs.readFileSync(path.join("reference_dump", "css", "site.css"), "utf8");
const html = fs.readFileSync(path.join("reference_dump", "html", "home.html"), "utf8");

console.log("=== 1. IMAGE REVEAL IN SITE.JS & CSS ===");
// Search for image animation, clip-path, case-fig, home-card__image, parallax
const imgKeywords = ["home-card__image", "case-fig", "clip-path", "clipPath", "parallax", "data-frame"];
imgKeywords.forEach(kw => {
  const matches = [...js.matchAll(new RegExp(`.{0,40}${kw}.{0,80}`, "gi"))];
  console.log(`Keyword '${kw}' in JS count:`, matches.length);
  matches.slice(0, 3).forEach(m => console.log("   ->", m[0].trim()));
});

// Check CSS rules for image reveals
console.log("\n=== CSS FOR IMAGE REVEAL ===");
const imgCss = [...css.matchAll(/([^{}]*(?:home-card__image|case-fig|case-imgs)[^{}]*\{[^}]+\})/gi)];
imgCss.slice(0, 5).forEach(m => console.log(m[1].trim()));

console.log("\n=== 2. MENU BACKGROUND IN HTML & CSS & JS ===");
// Search menu background, underlay-nav, shapes
const menuHtmlMatches = [...html.matchAll(/<[^>]*class="[^"]*menu[^"]*"[^>]*>/gi)];
menuHtmlMatches.slice(0, 10).forEach(m => console.log("HTML menu tag:", m[0]));

const underlayMatches = [...html.matchAll(/<[^>]*class="[^"]*underlay[^"]*"[^>]*>/gi)];
underlayMatches.forEach(m => console.log("HTML underlay tag:", m[0]));

// Search menu in CSS
console.log("\n=== CSS FOR MENU BACKGROUND ===");
const menuBgCss = [...css.matchAll(/([^{}]*(?:underlay-nav|\.menu\b|\.menu_wrap|\.menu__bg)[^{}]*\{[^}]+\})/gi)];
menuBgCss.slice(0, 10).forEach(m => console.log(m[1].trim()));

console.log("\n=== 3. PAGE REVEAL / TRANSITIONS IN JS ===");
// Search transition-cols, barba, page transition in JS
const transIdx = js.indexOf("data-transition-cols");
if (transIdx !== -1) {
  console.log(js.substring(transIdx - 200, transIdx + 1500));
}
