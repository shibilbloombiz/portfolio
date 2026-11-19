const fs = require("fs");
const css = fs.readFileSync("reference_dump/css/site.css", "utf8");
const html = fs.readFileSync("reference_dump/html/home.html", "utf8");

// Extract full menu element from home.html
const menuIdx = html.indexOf('<nav class="menu"');
if (menuIdx !== -1) {
  const menuEnd = html.indexOf('</nav>', menuIdx);
  console.log("=== FULL MENU HTML ===");
  console.log(html.substring(menuIdx, menuEnd + 6));
}

// Extract CSS for .menu and all subelements
console.log("\n=== CSS FOR MENU ===");
const menuRules = [...css.matchAll(/([^{}]*(?:\.menu\b|\.menu__)[^{}]*\{[^}]+\})/gi)];
menuRules.forEach(m => console.log(m[1].trim()));
