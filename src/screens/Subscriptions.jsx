import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Subscriptions({ go }) {
  const [vids, setVids] = useState(null);
  useEffect(() => {
    Promise.all([api("/users/me/following"), api("/videos")]).then(([f, v]) => setVids(v.videos.filter((x) => x.author && f.following.includes(String(x.author._id))))).catch(() => setVids([]));
  }, []);
  const ch = vids ? [...new Map(vids.map((v) => [v.author._id, v.author])).values()] : [];
  return (
    <>
      {ch.length > 0 && <div className="chips">{ch.map((a) => <button key={a._id} className="on">{a.name || a.username}</button>)}</div>}
      <h2 className="h">Latest from your subscriptions</h2>
      {vids === null ? <p className="empty">Loading...</p> : vids.length ? vids.map((v) => <VideoCard key={v._id} v={v} go={go} />) : <p className="empty">Kisi channel ko Subscribe karein, un ke videos yahan aayenge.</p>}
    </>
  );
}
