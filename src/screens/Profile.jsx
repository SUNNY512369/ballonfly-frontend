import { useEffect, useState } from "react";
import { BadgeCheck, Pencil, MoreVertical, ListVideo } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";
import Logo from "../components/Logo.jsx";
import AvatarPicker from "../components/AvatarPicker.jsx";
import banner from "../assets/art/chan_banner.png";

const TABS = [["home", "Home"], ["videos", "Videos"], ["shorts", "Shorts"], ["live", "Live"], ["playlists", "Playlists"], ["community", "Community"]];
export default function Profile({ go, tab: t0 = "home" }) {
  const [p, setP] = useState(null); const [vids, setVids] = useState([]); const [tab, setTab] = useState(t0);
  useEffect(() => { api("/users/me/profile").then((d) => setP(d.profile)).catch(() => setP({})); api("/videos/mine").then((d) => setVids(d.videos || [])).catch(() => {}); }, []);
  if (!p) return <p className="empty">Loading...</p>;
  const lists = {}; vids.forEach((v) => (lists[v.category] = lists[v.category] || []).push(v));
  const pls = Object.entries(lists);
  const PL = ({ c, a }) => (<div className="plc" onClick={() => go("watch", { id: a[0]._id })}><div className="thumb">{a[0].thumbnailUrl && <img src={a[0].thumbnailUrl} alt="" />}<span className="plb"><ListVideo size={14} /> {a.length}</span></div><div className="plt"><b>{c}</b><small className="dim">{a.length} videos</small></div><MoreVertical size={16} /></div>);
  return (<>
    <img className="cbanimg" src={banner} alt="" />
    <div className="chrow"><AvatarPicker name={p.channelName} src={p.avatarUrl} size={84} onChange={(u) => setP({ ...p, avatarUrl: u })} />
      <div><h2 style={{ margin: 0 }}>{p.channelName} <BadgeCheck size={22} color="#00e5ff" /></h2><p className="dim" style={{ margin: "2px 0" }}>@{p.username}</p><p className="dim" style={{ margin: 0 }}>{vids.length} videos • {views(vids.reduce((a, v) => a + (v.views || 0), 0))} views</p></div></div>
    <p>{p.bio}</p>
    <div className="wiz-nav" style={{ margin: "6px 0 12px" }}><button className="pill main" style={{ flex: 1 }} onClick={() => setTab("videos")}>Manage videos</button><button className="pill" style={{ marginLeft: 10 }} aria-label="Edit channel" onClick={() => go("settings")}><Pencil size={18} /></button></div>
    <div className="chips tabsr">{TABS.map(([k, l]) => <button key={k} className={k === tab ? "on" : ""} onClick={() => k === "shorts" ? go("shorts") : setTab(k)}>{l}</button>)}</div>
    {tab === "home" && (<>{pls.length > 0 && <><div className="chead"><h2>Created Playlists</h2><button className="ghost" style={{ color: "var(--cyan)" }} onClick={() => setTab("playlists")}>See all ›</button></div><div className="plrow">{pls.map(([c, a]) => <PL key={c} c={c} a={a} />)}</div></>}
      <div className="chead"><h2>Videos</h2><button className="ghost" style={{ color: "var(--cyan)" }} onClick={() => setTab("videos")}>See all ›</button></div>
      {vids.length ? vids.slice(0, 5).map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Abhi koi video nahi.</p>}</>)}
    {tab === "videos" && (vids.length ? vids.map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Abhi koi video nahi.</p>)}
    {tab === "playlists" && (pls.length ? <div className="grid2">{pls.map(([c, a]) => <PL key={c} c={c} a={a} />)}</div> : <p className="empty">Playlists aap ke videos ki category se banti hain.</p>)}
    {(tab === "live" || tab === "community") && <p className="empty">Ye hissa abhi tayyar nahi.</p>}
  </>);
}
