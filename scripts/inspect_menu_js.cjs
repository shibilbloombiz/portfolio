const fs = require("fs");
const js = fs.readFileSync("reference_dump/js/site.js", "utf8");

const menuIdx = js.indexOf('MZ.feature("menu"');
if (menuIdx !== -1) {
  console.log("=== MENU IN SITE.JS ===");
  console.log(js.substring(menuIdx, menuIdx + 2000));
} else {
  const m2 = js.indexOf('[data-menu]');
  console.log("[data-menu] at:", m2);
  console.log(js.substring(m2 - 100, m2 + 1500));
}
