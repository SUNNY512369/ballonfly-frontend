// src/parts/ ke tukron ko jod kar src/App.jsx banata hai (phone se bari file upload kat jati hai, isliye tukre).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const dir = path.join("src", "parts");
const fail = (m) => { console.error("\n❌ App.jsx nahi ban saki: " + m + "\n   src/parts folder ki saari files dobara upload karein.\n"); process.exit(1); };

if (!fs.existsSync(path.join(dir, "manifest.json"))) fail("src/parts/manifest.json nahi mili");
const man = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
const chunks = [];
for (const p of man.parts) {
  const f = path.join(dir, p.name);
  if (!fs.existsSync(f)) fail(p.name + " upload nahi hui");
  const buf = fs.readFileSync(f);
  if (buf.length !== p.bytes) fail(p.name + " adhoori hai (" + buf.length + " bytes mili, " + p.bytes + " chahiye)");
  if (crypto.createHash("sha256").update(buf).digest("hex") !== p.sha256) fail(p.name + " kharab hai (checksum match nahi hua)");
  chunks.push(buf);
}
const all = Buffer.concat(chunks);
fs.writeFileSync(man.target, all);
const lines = all.toString("utf8").split("\n").length - 1;
console.log("✅ " + man.target + " ban gayi: " + all.length + " bytes, " + lines + " lines");
