const fs = require("fs");
const path = require("path");

const files = [
  "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_ae0c86f7.png",
  "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026099_e5ae833b.png",
  "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_8dc257ab.png"
];

files.forEach((f, idx) => {
  if (fs.existsSync(f)) {
    const stat = fs.statSync(f);
    console.log(`File ${idx + 1}: ${path.basename(f)} size=${stat.size} bytes`);
  } else {
    console.log(`File not found: ${f}`);
  }
});
