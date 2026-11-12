import { useEffect, useState } from "react";
import { Check, MonitorPlay } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Subscriptions({ go }) {
  const [vids, setVids] = useState(null);
  const [off, setOff] = useState({});
  const [tab, setTab] = useState("All");
  useEffect(() => { Promise.all([api("/users/me/following"), api("/videos")]).then(([f, v]) => setVids(v.videos.filter((x) => x.author && f.following.includes(String(x.author._id))))).catch(() => setVids([])); }, []);
  const ch = vids ? [...new Map(vids.map((v) => [v.author._id, v.author])).values()] : [];
  const toggle = async (a) => { try { await api("/users/" + a._id + "/follow", { method: "POST" }); setOff({ ...off, [a._id]: !off[a._id] }); } catch (e) { alert(e.message); } };
  const pick = (t) => { if (t === "Shorts") return go("shorts"); setTab(t); };
  return (<>
    <div className="subhead"><span className="subico"><MonitorPlay size={26} /></span><div><h1 className="wt" style={{ margin: 0 }}>Subscriptions</h1><p className="dim" style={{ margin: 0 }}>Stay updated with your favorite creators</p></div></div>
    <div className="chips">{["All", "Channels", "Shorts", "Live"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => pick(t)}>{t}</button>)}</div>
    {vids === null ? <p className="empty">Loading...</p> : (<>
      {ch.length > 0 && (tab === "All" || tab === "Channels") && <div className="subch">{ch.map((a) => (
        <div key={a._id}><span className="ring"><i>{(a.name || a.username || "?")[0]}</i></span><b>{a.name || a.username}</b><small className="dim">{views(a.subscribersCount || 0)} subscribers</small>
          <button className={"subd" + (off[a._id] ? " off" : "")} onClick={() => toggle(a)}>{off[a._id] ? "Subscribe" : <>Subscribed <Check size={14} /></>}</button></div>))}</div>}
      {tab === "Live" ? <p className="empty">Abhi koi Live nahi chal raha.</p> : tab !== "Channels" && (<>
        <h2 className="h">Latest Videos from Your Subscriptions</h2>
        {vids.length ? <div className="feedgrid">{vids.map((v) => <VideoCard key={v._id} v={v} go={go} />)}</div> : <p className="empty">Kisi channel ko Subscribe karein, un ke videos yahan aayenge.</p>}</>)}
    </>)}
  </>);
}
