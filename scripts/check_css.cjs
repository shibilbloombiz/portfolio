const fs = require("fs");
const css = fs.readFileSync("src/styles/main.css", "utf8");
console.log("main.css length:", css.length);
console.log("has progressive-blur:", css.includes("progressive-blur"));
console.log("has hover-tag:", css.includes("hover-tag"));
console.log("has scroll-meter:", css.includes("scroll-meter"));
console.log("has reveal-word:", css.includes("reveal-word"));
console.log("has data-reveal:", css.includes("data-reveal"));
