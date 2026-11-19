const fs = require("fs");
const css = fs.readFileSync("src/styles/main.css", "utf8");

function showRule(name) {
  const matches = [...css.matchAll(new RegExp(`([^{}]*${name}[^{}]*\\{[^}]+\\})`, "gi"))];
  console.log(`=== Rule for ${name} (${matches.length}) ===`);
  matches.forEach(m => console.log(m[1].trim()));
}

showRule("reveal-word");
showRule("progressive-blur");
showRule("scroll-meter");
showRule("hover-tag");
