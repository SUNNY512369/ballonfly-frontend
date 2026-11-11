import { useEffect, useState } from "react";
import { Plus, ChevronRight, SlidersHorizontal } from "lucide-react";
import { api } from "../lib/api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Home({ go }) {
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState("");
  const [list, setList] = useState(null);
  const [who, setWho] = useState("");
  const [popular, setPopular] = useState(false);
  useEffect(() => { api("/videos/meta").then((d) => setCats(d.categories || [])).catch(() => {}); }, []);
  useEffect(() => { setList(null); api("/videos" + (cat ? "?category=" + encodeURIComponent(cat) : "")).then((d) => setList(d.videos)).catch(() => setList([])); }, [cat]);
  const authors = list ? [...new Map(list.filter((v) => v.author).map((v) => [v.author._id, v.author])).values()].slice(0, 8) : [];
  let shown = list ? list.filter((v) => !who || (v.author && v.author._id === who)) : null;
  if (shown && popular) shown = [...shown].sort((a, b) => (b.views || 0) - (a.views || 0));
  const badgeOf = (v, i) => (i % 3 === 0 ? "Trending" : i % 3 === 1 ? ((v.views || 0) + " Views") : "Popular");
  return (<>
    <div className="stories">
      <button onClick={() => go("upload")}><span className="ring plusring"><Plus size={34} /></span><small>Create</small></button>
      {authors.map((a) => (<button key={a._id} onClick={() => setWho(who === a._id ? "" : a._id)}><span className={"ring" + (who === a._id ? " act" : "")}><i>{(a.name || a.username || "?")[0]}</i></span><small>{a.name || a.username}</small></button>))}
      {authors.length > 5 && <span className="more"><ChevronRight size={22} /></span>}
    </div>
    <div className="chips">
      {["", ...cats].map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c || "All"}</button>)}
      <button className={"filt" + (popular ? " on" : "")} aria-label="Sort by popular" onClick={() => setPopular(!popular)}><SlidersHorizontal size={18} /></button>
    </div>
    {shown === null ? <p className="empty">Loading...</p> : shown.length === 0 ? <p className="empty">Abhi koi video nahi. + dabakar pehla video upload karein.</p> : shown.map((v, i) => <VideoCard key={v._id} v={v} go={go} badge={badgeOf(v, i)} />)}
  </>);
}
