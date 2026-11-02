import fs from "node:fs";
import crypto from "node:crypto";

const PAIRS = [["{(view === \"feed\" || view === \"communities\") && (\n          <div className=\"home-tabs\">", "{false && (\n          <div className=\"home-tabs\">"], ["extraChips={[\n              { label: t(\"tabs.posts\"), onClick: () => setView(\"feed\") },\n              { label: t(\"tabs.countries\"), onClick: () => setView(\"communities\") },\n            ]}", "extraChips={[]}"], ["          <div className=\"vf-meta\">\n            <strong>{v.title}</strong>", "          <span className=\"vf-chav\">{authorName(v).slice(0, 1).toUpperCase()}</span>\n          <div className=\"vf-meta\">\n            <strong>{v.title}</strong>"], ["        .vf-card {\n          display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: left; padding: 0; margin-bottom: 14px;\n          cursor: pointer; background: none; border: 0; border-radius: 0; overflow: visible; color: var(--text);\n        }", "        .vf-card {\n          display: grid; grid-template-columns: 40px 1fr auto; column-gap: 12px; row-gap: 10px; align-items: start; width: 100%; text-align: left; padding: 0; margin-bottom: 22px;\n          cursor: pointer; background: none; border: 0; border-radius: 0; overflow: visible; color: var(--text);\n        }\n        .vf-chav { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 16px; color: var(--on-accent); background: linear-gradient(135deg, #00CFFF, #8A42FF); }"], ["        .vf-thumb { position: relative; flex: 0 0 min(42%, 178px); aspect-ratio: 240 / 99; background: var(--surface); overflow: hidden; border-radius: 10px; }", "        .vf-thumb { position: relative; grid-column: 1 / -1; width: 100%; aspect-ratio: 16 / 9; background: var(--surface); overflow: hidden; border-radius: 14px; }"]];

const buf = fs.readFileSync("src/App.jsx");
let s = buf.toString("utf8");
if (s.includes("vf-chav")) { console.log("Ye patch pehle hi lag chuka hai."); process.exit(0); }
if (buf.length !== 210893) {
  console.error("❌ src/App.jsx poori nahi hai (" + buf.length + " bytes). Pehle chalayein:  node scripts/join-app.mjs   phir ye patch dobara.");
  process.exit(1);
}
PAIRS.forEach(([a, b], i) => {
  const n = s.split(a).length - 1;
  if (n !== 1) { console.error("❌ patch #" + (i + 1) + " ke liye jagah nahi mili (" + n + ")"); process.exit(1); }
  s = s.replace(a, () => b);
});
fs.writeFileSync("src/App.jsx", s);

const all = Buffer.from(s, "utf8");
const lines = [];
let start = 0;
for (let i = 0; i < all.length; i++) if (all[i] === 10) { lines.push(all.subarray(start, i + 1)); start = i + 1; }
if (start < all.length) lines.push(all.subarray(start));
const target = Math.ceil(all.length / 4) + 1;
const parts = []; let cur = []; let size = 0;
for (const l of lines) {
  if (size + l.length > target && parts.length < 3) { parts.push(Buffer.concat(cur)); cur = []; size = 0; }
  cur.push(l); size += l.length;
}
parts.push(Buffer.concat(cur));
const man = { target: "src/App.jsx", totalBytes: all.length, totalLines: all.filter((c) => c === 10).length, parts: [] };
parts.forEach((p, k) => {
  const name = "app.part" + (k + 1) + ".txt";
  fs.writeFileSync("src/parts/" + name, p);
  man.parts.push({ name, bytes: p.length, sha256: crypto.createHash("sha256").update(p).digest("hex") });
});
fs.writeFileSync("src/parts/manifest.json", JSON.stringify(man, null, 1));
console.log("✅ UI patch lag gaya. App.jsx: " + all.length + " bytes, " + man.totalLines + " lines.");
