import { useEffect, useState } from "react";
import { Search as S, Mic, Zap, TrendingUp, ArrowUpLeft, Play } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";

const TREND = ["Motivational Video", "Success Mindset", "Business Growth", "Life Lessons", "Financial Freedom", "AI Tools", "Dream Big", "Self Improvement", "Never Give Up"];
const SUG = ["Ballonfly motivation", "Success mindset", "How to be successful", "Self improvement tips", "Business ideas", "Financial freedom", "Life lessons"];
export default function Search({ go }) {
  const [q, setQ] = useState(""); const [all, setAll] = useState([]); const [sh, setSh] = useState([]);
  useEffect(() => { api("/videos").then((d) => setAll(d.videos)).catch(() => {}); api("/shorts").then((d) => setSh((d.shorts || []).slice(0, 4))).catch(() => {}); }, []);
  const t = q.trim().toLowerCase();
  const res = t ? all.filter((v) => (v.title + " " + (v.hashtags || []).join(" ") + " " + ((v.author || {}).name || "")).toLowerCase().includes(t)) : [];
  const sug = SUG.filter((x) => !t || x.toLowerCase().includes(t));
  return (<>
    <div className="searchbar glow"><S size={22} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across your channel..." /><Mic size={22} /></div>
    <div className="tabs2"><button className="on"><S size={20} /> Search</button><button onClick={() => go("shorts")}><Zap size={20} /> Shorts</button></div>
    {t && (res.length ? res.map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Kuch nahi mila.</p>)}
    <div className="chead"><h2>🔥 Trending Searches</h2></div>
    <div className="chips wrap">{TREND.map((x) => <button key={x} onClick={() => setQ(x)}><TrendingUp size={16} color="#00e5ff" /> {x}</button>)}</div>
    <div className="chead"><h2><S size={20} /> Search Suggestions</h2></div>
    <div className="sugs">{sug.map((x) => <button key={x} onClick={() => setQ(x)}><S size={18} /><span>{x}</span><ArrowUpLeft size={20} /></button>)}</div>
    {sh.length > 0 && (<><div className="chead"><h2><Zap size={22} color="#00e5ff" /> Shorts</h2><button className="ghost" style={{ color: "var(--cyan)" }} onClick={() => go("shorts")}>See all ›</button></div>
      <div className="mshorts">{sh.map((s) => (<div key={s._id} onClick={() => go("shorts")}><video src={s.videoUrl + "#t=0.5"} muted playsInline preload="metadata" /><span className="vw"><Play size={11} fill="#fff" /> {views(s.views ?? s.viewsCount ?? 0)}</span><p>{s.caption || s.title || ""}</p></div>))}</div></>)}
  </>);
}
