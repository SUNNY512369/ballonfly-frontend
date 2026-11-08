import { useEffect, useState } from "react";
import { Search as S } from "lucide-react";
import { api } from "../lib/api.js";
import VideoCard from "../components/VideoCard.jsx";

const TRENDING = ["Motivational Video", "Success Mindset", "Travel", "Gaming", "Music", "Life Lessons"];
export default function Search({ go }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState([]);
  useEffect(() => { api("/videos").then((d) => setAll(d.videos)).catch(() => {}); }, []);
  const t = q.trim().toLowerCase();
  const res = t ? all.filter((v) => (v.title + " " + (v.hashtags || []).join(" ") + " " + ((v.author || {}).name || "")).toLowerCase().includes(t)) : [];
  return (
    <>
      <div className="searchbar"><S size={20} /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos, channels..." /></div>
      {!t ? (<><h2 className="h">Trending Searches</h2><div className="chips wrap">{TRENDING.map((x) => <button key={x} onClick={() => setQ(x)}>{x}</button>)}</div></>)
        : res.length ? res.map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Kuch nahi mila.</p>}
    </>
  );
}
