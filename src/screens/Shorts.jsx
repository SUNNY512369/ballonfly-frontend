import { useEffect, useState } from "react";
import { Heart, X, Search, Zap, Play } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";

const CATS = ["All", "Adventure", "Motivation", "Nature", "Gaming", "Funny"];
export default function Shorts({ go }) {
  const [list, setList] = useState(null);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(-1);
  useEffect(() => { api("/shorts").then((d) => setList(d.shorts)).catch(() => setList([])); }, []);
  const like = async (s) => { try { const r = await api("/shorts/" + s._id + "/like", { method: "POST" }); setList(list.map((x) => (x._id === s._id ? { ...x, ...r } : x))); } catch (e) { alert(e.message); } };
  if (!list) return <p className="empty">Loading...</p>;
  const shown = list.filter((s) => cat === "All" || ((s.caption || "") + " " + (s.title || "")).toLowerCase().includes(cat.toLowerCase()));
  const vw = (s) => views(s.views ?? s.viewsCount ?? 0);
  return (<>
    <div className="tabs2"><button onClick={() => go("search")}><Search size={20} /> Search</button><button className="on"><Zap size={20} /> Shorts</button></div>
    <div className="chips">{CATS.map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}</div>
    {!shown.length ? <p className="empty">Is category mein abhi koi Short nahi.</p> : (
      <div className="sgrid">{shown.map((s) => (
        <div className="scard" key={s._id} onClick={() => setOpen(list.indexOf(s))}>
          <video src={s.videoUrl + "#t=0.5"} muted playsInline preload="metadata" />
          <span className="vw"><Play size={12} fill="#fff" /> {vw(s)} views</span>
          <p>{s.caption || s.title || ""}</p>
        </div>))}
      </div>)}
    {open >= 0 && (
      <div className="viewer">
        <button className="close" onClick={() => setOpen(-1)} aria-label="Close"><X size={26} /></button>
        <div className="vscroll">{list.slice(open).concat(list.slice(0, open)).map((s, n) => (
          <div className="reel full" key={s._id}>
            <video src={s.videoUrl} loop playsInline controls autoPlay={n === 0} onPlay={() => api("/shorts/" + s._id + "/view", { method: "POST" }).catch(() => {})} />
            <div className="cap"><b>@{(s.user && s.user.username) || "user"}</b><p>{s.caption || s.title || ""}</p></div>
            <button className="lk" onClick={() => like(s)}><Heart size={28} /><span>{views((s.likes && s.likes.length) || s.likesCount || 0)}</span></button>
          </div>))}
        </div>
      </div>)}
  </>);
}
