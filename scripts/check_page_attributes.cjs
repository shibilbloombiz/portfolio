const fs = require("fs");

["home.html", "work.html", "about.html", "contact.html"].forEach(file => {
  const html = fs.readFileSync(`reference_dump/html/${file}`, "utf8");
  console.log(`\n=================== ${file} ===================`);
  
  // Find all elements with data-reveal, data-hover-case, etc.
  const regex = /<([a-z0-9]+)[^>]*?(data-reveal[^>]*?|data-hover-case[^>]*?|data-portrait[^>]*?|data-about-sun[^>]*?)>/gi;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null && count < 15) {
    console.log(match[0].slice(0, 150));
    count++;
  }
});
