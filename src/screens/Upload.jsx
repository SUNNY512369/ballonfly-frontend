import { useEffect, useRef, useState } from "react";
import { UploadCloud, FolderOpen, Globe, Lock, Link2, ArrowLeft, ArrowRight, Check, X, Baby, Users } from "lucide-react";
import { api, API_BASE, getSession } from "../lib/api.js";
import upCloud from "../assets/art/up_cloud.png";
import upClap from "../assets/art/up_clap.png";

const STEPS = ["Upload", "Details", "Visibility", "Audience", "Language", "Publish"];
const VIS = [["Public", Globe, "Anyone can search for and watch your video."], ["Private", Lock, "Only you and people you choose can watch your video."], ["Unlisted", Link2, "Anyone with the link can watch your video."]];
const LANGS = ["English (US)", "Urdu", "Hindi", "Arabic", "Spanish"];

function sendToCloud(file, sign, onProgress) {
  const form = new FormData();
  form.append("file", file); form.append("api_key", sign.apiKey); form.append("timestamp", sign.timestamp);
  form.append("signature", sign.signature); form.append("folder", sign.folder);
  return new Promise((ok, bad) => {
    const x = new XMLHttpRequest();
    x.open("POST", "https://api.cloudinary.com/v1_1/" + sign.cloudName + "/video/upload");
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100), e.loaded);
    x.onload = () => { let d = {}; try { d = JSON.parse(x.responseText); } catch {} x.status < 300 && d.secure_url ? ok(d) : bad(new Error((d.error && d.error.message) || "Upload fail ho gaya")); };
    x.onerror = () => bad(new Error("Internet ka masla, dobara try karein"));
    x.send(form);
  });
}

export default function Upload({ go }) {
  const [s, setS] = useState(0);
  const [file, setFile] = useState(null);
  const [f, setF] = useState({ title: "", description: "", tags: [], tagInput: "", category: "", community: "", visibility: "Public", allowComments: true, kids: "no", lang: LANGS[0] });
  const [meta, setMeta] = useState({ categories: [], communities: [] });
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState("");
  const [err, setErr] = useState("");
  const input = useRef();
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  useEffect(() => { api("/videos/meta").then((m) => { setMeta(m); setF((o) => ({ ...o, category: m.categories[0] || "", community: m.communities[0] || "" })); }).catch(() => {}); }, []);

  const next = () => {
    setErr("");
    if (s === 0 && !file) return setErr("Pehle video select karein");
    if (s === 1 && (!f.title.trim() || !f.description.trim())) return setErr("Title aur description zaroori hain");
    setS(s + 1);
  };
  const addTag = () => { const t = f.tagInput.trim().replace(/^#/, ""); if (t && !f.tags.includes(t)) setF({ ...f, tags: [...f.tags, t], tagInput: "" }); else set("tagInput", ""); };

  async function publish() {
    setErr(""); setS(5); setPhase("uploading"); setPct(0);
    try {
      const sign = await api("/videos/sign", { method: "POST" });
      const up = await sendToCloud(file, sign, (p) => setPct(p));
      setPhase("processing");
      await api("/videos", { method: "POST", body: { videoUrl: up.secure_url, duration: up.duration || 0, title: f.title.trim(), description: f.description.trim(), hashtags: f.tags, category: f.category, community: f.community, visibility: f.visibility, allowComments: f.allowComments } });
      setPhase("done");
    } catch (e) { setErr(e.message); setPhase("failed"); }
  }

  const nav = s > 0 && s < 5 && (
    <div className="wiz-nav">
      <button className="pill ghostb" onClick={() => setS(s - 1)}><ArrowLeft size={18} /> Back</button>
      <button className="pill main" onClick={s === 4 ? publish : next}>{s === 4 ? "Publish" : "Next"} <ArrowRight size={18} /></button>
    </div>
  );

  return (
    <div className="wiz">
      <div className="steps">{STEPS.map((n, i) => <i key={n} className={i <= s ? "on" : ""} title={n} />)}</div>
      <h1 className="wt">{s === 0 ? "Upload Video" : STEPS[s] === "Language" ? "Language & Region" : STEPS[s] === "Publish" ? "Upload Progress" : STEPS[s] === "Details" ? "Video Details" : STEPS[s]}</h1>
      <p className="dim">{s === 0 ? "Share your story with the Ballonfly community" : s === 1 ? "Add details about your video" : s === 2 ? "Choose who can see your video" : s === 3 ? "Select whether your video is made for kids" : s === 4 ? "Set your language, region and content preferences" : "Track your video upload and processing status"}</p>

      {s === 0 && (<>
        <div className="drop" onClick={() => input.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}>
          <img className="upimg" src={upCloud} alt="" />
          <h3>{file ? file.name : "Drag and Drop Your Video Here"}</h3>
          <p className="dim">{file ? (file.size / 1048576).toFixed(1) + " MB" : "or click to browse"}</p>
          <p style={{ color: "var(--cyan)" }}>MP4, MOV, AVI, MKV up to 2GB</p>
          <input ref={input} type="file" accept="video/*" hidden onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button className="pill main wide" onClick={() => input.current.click()}><FolderOpen size={18} /> Select File</button>
        <div className="tipbox"><img className="tipimg" src={upClap} alt="" /><b>Upload Tips:</b><p><Check size={14} color="#22d36b" /> Use high-quality video (1080p is best)</p><p><Check size={14} color="#22d36b" /> Keep your video family-friendly</p><p><Check size={14} color="#22d36b" /> Add an attractive thumbnail</p></div>
        <p className="note">Your video will be reviewed for community guidelines before it goes live.</p>
        <button className="pill main wide" onClick={next}>Next <ArrowRight size={18} /></button>
      </>)}

      {s === 1 && (<>
        <label className="lbl">Title * <span>{f.title.length}/100</span></label>
        <input className="in" maxLength={100} value={f.title} onChange={(e) => set("title", e.target.value)} />
        <label className="lbl">Description * <span>{f.description.length}/400</span></label>
        <textarea className="in" rows={5} maxLength={400} value={f.description} onChange={(e) => set("description", e.target.value)} />
        <label className="lbl">Hashtags</label>
        <div className="chips wrap">{f.tags.map((t) => <button key={t} className="on" onClick={() => setF({ ...f, tags: f.tags.filter((x) => x !== t) })}>#{t} <X size={12} /></button>)}</div>
        <input className="in" placeholder="Add hashtag and press Enter" value={f.tagInput} onChange={(e) => set("tagInput", e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
        <label className="lbl">Category</label>
        <select className="in" value={f.category} onChange={(e) => set("category", e.target.value)}>{meta.categories.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="lbl">Community</label>
        <select className="in" value={f.community} onChange={(e) => set("community", e.target.value)}>{meta.communities.map((c) => <option key={c}>{c}</option>)}</select>
        <label className="tog"><span>Allow Comments</span><input type="checkbox" checked={f.allowComments} onChange={(e) => set("allowComments", e.target.checked)} /></label>
        <p className="note">Thumbnail video se khud ban jata hai.</p>
      </>)}

      {s === 2 && VIS.map(([k, Icon, t]) => (
        <div key={k} className={"opt" + (f.visibility === k ? " sel" : "")} onClick={() => set("visibility", k)}><Icon size={30} /><div><b>{k}</b>{k === "Public" && <em> Recommended</em>}<p className="dim">{t}</p></div></div>))}

      {s === 3 && [["yes", Baby, "Made for Kids", "This video is made for kids under 13. Features like personalized ads and notifications will be limited."], ["no", Users, "Not Made for Kids", "You can use all features, including personalized ads, comments, and notifications."]].map(([k, Icon, h, t]) => (
        <div key={k} className={"opt" + (f.kids === k ? " sel" : "")} onClick={() => set("kids", k)}><Icon size={30} /><div><b>{h}</b>{k === "yes" && <em> Recommended</em>}<p className="dim">{t}</p></div></div>))}

      {s === 4 && (<><label className="lbl">Language</label>
        <select className="in" value={f.lang} onChange={(e) => set("lang", e.target.value)}>{LANGS.map((l) => <option key={l}>{l}</option>)}</select>
        <p className="note">Audience aur Language abhi sirf aap ke liye hain; backend mein save hone ke liye server par fields chahiye.</p></>)}

      {s === 5 && (<div className="prog">
        <h3>{file && file.name}</h3>
        <div className="bar"><i style={{ width: (phase === "uploading" ? pct : 100) + "%" }} /></div>
        <p className="dim">{phase === "uploading" ? "Uploading... " + pct + "% (page band na karein)" : phase === "processing" ? "Processing... video save ho rahi hai" : phase === "done" ? "Video publish ho gayi!" : ""}</p>
        {err && <p className="err" style={{ color: "#ff6b81" }}>{err}</p>}
        {phase === "done" && <button className="pill main wide" onClick={() => go("library")}>View Your Videos</button>}
        {phase === "failed" && <button className="pill main wide" onClick={publish}>Try Again</button>}
      </div>)}

      {s >= 2 && s <= 4 && (<div className="prevc"><div className="mini big">🎬</div><div><b>{f.title || (file && file.name)}</b><small className="dim">by you</small></div></div>)}
      {s === 2 && <p className="infob">Public videos may appear in search, Home, and other places on Ballonfly.</p>}
      {s === 3 && <p className="infob">Regardless of your audience setting, you’re required to comply with the Children’s Online Privacy Protection Act (COPPA) and other laws.</p>}
      {err && s < 5 && <p style={{ color: "#ff6b81" }}>{err}</p>}
      {nav}
    </div>
  );
}
