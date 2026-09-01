const fs = require("fs");
const path = require("path");
const root = "/workspace/netcheck";
const list = process.argv.slice(2);
const files = list.map((rel) => ({
  path: rel,
  content: fs.readFileSync(path.join(root, rel), "utf8"),
}));
fs.writeFileSync(path.join(root, "pack-out.json"), JSON.stringify(files));
console.log("packed", files.length, "files", Buffer.byteLength(JSON.stringify(files)));
