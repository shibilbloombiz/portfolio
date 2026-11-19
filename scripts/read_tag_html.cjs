const fs = require("fs");
const html = fs.readFileSync("reference_dump/html/home.html", "utf8");
const match = html.match(/<[^>]*data-hover-tag[^>]*>[\s\S]{0,500}<\/[^>]*>/);
if (match) {
  console.log("Found in home.html:\n", match[0]);
} else {
  const idx = html.indexOf("hover-tag");
  console.log("Raw match in HTML:\n", html.substring(idx - 50, idx + 250));
}
