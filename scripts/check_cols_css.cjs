const fs = require("fs");
const css = fs.readFileSync("src/styles/main.css", "utf8");

const matches = [...css.matchAll(/([^{}]*(?:\.transition__cols|\.menu__cols)[^{}]*\{[^}]+\})/gi)];
matches.forEach(m => console.log(m[1].trim()));
