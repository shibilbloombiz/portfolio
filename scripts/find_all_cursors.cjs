const fs = require("fs");
const css = fs.readFileSync("reference_dump/css/site.css", "utf8");

// Search for any cursor property in CSS
const matches = [...css.matchAll(/([^{}]*\{[^}]*cursor:[^}]+})/gi)];
console.log("Count of cursor in CSS:", matches.length);
matches.forEach(m => console.log(m[1].trim()));
