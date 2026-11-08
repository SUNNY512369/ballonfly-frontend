import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";
import { Stat } from "../components/Ui.jsx";

export default function Profile({ go, tab: t0 = "videos" }) {
  const [p, setP] = useState(null);
  const [vids, setVids] = useState([]);
  const [tab, setTab] = useState(t0);
  useEffect(() => { api("/users/me/profile").then((d) => setP(d.profile)).catch(() => setP({})); api("/videos/mine").then((d) => setVids(d.videos || [])).catch(() => {}); }, []);
  if (!p) return <p className="empty">Loading...</p>;
  const lists = {}; vids.forEach((v) => (lists[v.category] = lists[v.category] || []).push(v));
  const total = vids.reduce((a, v) => a + (v.views || 0), 0);
  return (<>
    <div className="banner"><div className="av big">{(p.channelName || "?")[0]}</div>
      <div><h2 style={{ margin: 0 }}>{p.channelName} <BadgeCheck size={20} color="#00e5ff" /></h2><p className="dim">@{p.username} • {vids.length} videos</p><p>{p.bio}</p></div></div>
    <div className="stats"><Stat label="Videos" value={vids.length} /><Stat label="Total Views" value={views(total)} tone="purple" /></div>
    <div className="chips">{[["videos", "Videos"], ["playlists", "Playlists"], ["about", "About"]].map(([k, l]) => <button key={k} className={k === tab ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === "videos" && (vids.length ? vids.map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Abhi koi video nahi.</p>)}
    {tab === "playlists" && (Object.keys(lists).length ? <div className="grid2">{Object.entries(lists).map(([c, a]) => (<div key={c} className="pl" onClick={() => go("watch", { id: a[0]._id })}><div className="thumb">{a[0].thumbnailUrl && <img src={a[0].thumbnailUrl} alt="" />}<b>{a.length} videos</b></div><h4>{c}</h4></div>))}</div> : <p className="empty">Playlists aap ke videos ki category se banti hain.</p>)}
    {tab === "about" && <div className="panel"><p>Email: {p.email}</p><p>Country: {p.country || "-"}</p><p>Bio: {p.bio || "-"}</p></div>}
  </>);
}
