import fs from "node:fs";
import crypto from "node:crypto";

const PAIRS = [["{(view === \"feed\" || view === \"communities\") && (\n          <div className=\"home-tabs\">", "{false && (\n          <div className=\"home-tabs\">"], ["extraChips={[\n              { label: t(\"tabs.posts\"), onClick: () => setView(\"feed\") },\n              { label: t(\"tabs.countries\"), onClick: () => setView(\"communities\") },\n            ]}", "extraChips={[]}"], ["          <div className=\"vf-meta\">\n            <strong>{v.title}</strong>", "          <span className=\"vf-chav\">{authorName(v).slice(0, 1).toUpperCase()}</span>\n          <div className=\"vf-meta\">\n            <strong>{v.title}</strong>"], ["        .vf-card {\n          display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: left; padding: 0; margin-bottom: 14px;\n          cursor: pointer; background: none; border: 0; border-radius: 0; overflow: visible; color: var(--text);\n        }", "        .vf-card {\n          display: grid; grid-template-columns: 40px 1fr auto; column-gap: 12px; row-gap: 10px; align-items: start; width: 100%; text-align: left; padding: 0; margin-bottom: 22px;\n          cursor: pointer; background: none; border: 0; border-radius: 0; overflow: visible; color: var(--text);\n        }\n        .vf-chav { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 16px; color: var(--on-accent); background: linear-gradient(135deg, #00CFFF, #8A42FF); }"], ["        .vf-thumb { position: relative; flex: 0 0 min(42%, 178px); aspect-ratio: 240 / 99; background: var(--surface); overflow: hidden; border-radius: 10px; }", "        .vf-thumb { position: relative; grid-column: 1 / -1; width: 100%; aspect-ratio: 16 / 9; background: var(--surface); overflow: hidden; border-radius: 14px; }"], ["{(view === \"feed\" || view === \"videos\" || view === \"communities\") && (\n          <AppHeader", "{(view === \"feed\" || view === \"videos\" || view === \"communities\" || view === \"profile\") && (\n          <AppHeader"], ["        .profile-posts-error { display: flex; align-items: center; justify-content: center; gap: 10px; }", "        .profile-posts-error { display: flex; align-items: center; justify-content: center; gap: 10px; }\n        /* Ballonfly profile look */\n        .profile-cover { height: 100px !important; background: linear-gradient(120deg, #00223D, #0a3a5c 55%, #00223D) !important; border: 1px solid var(--card-border); }\n        .profile-header .avatar { box-shadow: 0 0 0 3px #000F1D, 0 0 0 6px var(--accent); }\n        .profile-meta h2 { font-size: 22px; font-weight: 600; }\n        .pc-stats div { background: var(--surface); border: 1px solid var(--card-border); border-radius: 16px; }\n        .pc-actions button { height: 46px; border-radius: 999px !important; font-weight: 600; background: var(--surface); border: 1px solid var(--card-border); color: var(--text); }\n        .pc-actions button:first-child { background: var(--gradient-cta); color: var(--on-accent); border-color: transparent; font-weight: 700; }\n        .pc-toggle { border-radius: 999px !important; background: var(--surface) !important; border: 1px solid var(--card-border) !important; }\n        .profile-tabs { gap: 10px; border-bottom: 0; padding: 4px 12px 8px; }\n        .profile-tabs button { padding: 0 22px; height: 38px; border-radius: 999px; background: var(--surface); border: 1px solid var(--card-border); color: var(--text); font-size: 14px; }\n        .profile-tabs button.active { background: var(--gradient-cta); color: var(--on-accent); border-color: transparent; font-weight: 700; }\n        .profile-tabs button.active::after { display: none; }\n        .grid-thumb { border-radius: 12px; }\n        .post-detail-modal { border-radius: 22px; background: #00182c; border: 1px solid var(--card-border); }"]];

let s = fs.readFileSync("src/App.jsx", "utf8");
if (s.length < 200000 || !s.includes("function App(")) {
  console.error("❌ src/App.jsx poori nahi hai (" + s.length + " bytes). Pehle chalayein:  node scripts/join-app.mjs   phir ye patch dobara.");
  process.exit(1);
}
let done = 0, skipped = 0;
PAIRS.forEach(([a, b], i) => {
  if (s.includes(b)) { skipped++; return; }
  const n = s.split(a).length - 1;
  if (n === 1) { s = s.replace(a, () => b); done++; }
  else { console.error("❌ patch #" + (i + 1) + " ke liye jagah nahi mili (" + n + ")"); process.exit(1); }
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
console.log("✅ Patch ho gaya (" + done + " naye, " + skipped + " pehle se). App.jsx: " + all.length + " bytes, " + man.totalLines + " lines.");
