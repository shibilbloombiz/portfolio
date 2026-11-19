const fs = require("fs");
const css = fs.readFileSync("reference_dump/css/site.css", "utf8");
const html = fs.readFileSync("reference_dump/html/home.html", "utf8");

// Search HTML for transition
const htmlMatches = [...html.matchAll(/.{0,50}transition.{0,50}/gi)];
console.log("HTML transition matches:", htmlMatches.length);
htmlMatches.forEach(m => console.log("   ->", m[0].trim()));

// Search CSS for transition classes
const cssClasses = [...css.matchAll(/\.[a-z0-9_-]*trans[a-z0-9_-]*/gi)];
console.log("CSS trans classes:", [...new Set(cssClasses.map(m => m[0]))]);
