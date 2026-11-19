const fs = require("fs");
const css = fs.readFileSync("src/styles/main.css", "utf8");

const rules = [...css.matchAll(/([^{}]*(?:underlay-nav__logo|brand-logo|logo_wrap|brand-2)[^{}]*\{[^}]+\})/gi)];
rules.forEach(r => console.log(r[1].trim()));
