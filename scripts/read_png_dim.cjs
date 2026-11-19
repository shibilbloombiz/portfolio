const fs = require("fs");

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

const f1 = "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_ae0c86f7.png";
const f3 = "C:/Users/user/.gemini/antigravity/brain/639ed076-d171-407f-a875-248cdbadb908/.user_uploaded/media_1795074026100_8dc257ab.png";

console.log("Logo dimensions:", getPngDimensions(f1));
console.log("Icon dimensions:", getPngDimensions(f3));
