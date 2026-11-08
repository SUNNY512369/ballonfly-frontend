import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Bookmark, Share2, BadgeCheck } from "lucide-react";
import { api } from "../lib/api.js";
import { views, ago } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Watch({ id, go, session }) {
  const [d, setD] = useState(null);
  const [cm, setCm] = useState([]);
  const [text, setText] = useState("");
  const [next, setNext] = useState([]);
  const load = () => api("/videos/" + id).then(setD).catch(() => setD({ error: true }));
  const loadC = () => api("/videos/" + id + "/comments").then((r) => setCm(r.comments || [])).catch(() => {});
  useEffect(() => { setD(null); load(); loadC(); api("/videos").then((r) => setNext(r.videos.filter((v) => v._id !== id))).catch(() => {}); window.scrollTo(0, 0); }, [id]);
  if (!d) return <p className="empty">Loading...</p>;
  if (d.error) return <p className="empty">Video nahi mila.</p>;
  const v = d.video, a = v.author || {};
  const act = async (path, patch) => { try { const r = await api("/videos/" + id + path, { method: "POST" }); setD({ ...d, ...patch(r) }); } catch (e) { alert(e.message); } };
  const sub = async () => { try { const r = await api("/users/" + a._id + "/follow", { method: "POST" }); setD({ ...d, subscribed: r.following, subscribersCount: r.followersCount }); } catch (e) { alert(e.message); } };
  const send = async () => { if (!text.trim()) return; try { await api("/videos/" + id + "/comments", { method: "POST", body: { text } }); setText(""); loadC(); } catch (e) { alert(e.message); } };
  return (
    <>
      <video className="player" src={v.videoUrl} poster={v.thumbnailUrl} controls playsInline />
      <h1 className="vt">{v.title}</h1>
      <p className="dim">{views(v.views)} views • {ago(v.createdAt)} {(v.hashtags || []).map((h) => <span key={h} className="tagc"> #{h.replace("#", "")}</span>)}</p>
      <div className="chan">
        <div className="av">{(a.name || "?")[0]}</div>
        <div style={{ flex: 1 }}><b>{a.name} <BadgeCheck size={14} color="#00e5ff" /></b><p className="dim">{views(d.subscribersCount)} subscribers</p></div>
        <button className={"sub" + (d.subscribed ? " on" : "")} onClick={sub}>{d.subscribed ? "Subscribed" : "Subscribe"}</button>
      </div>
      <div className="acts">
        <button className={d.liked ? "on" : ""} onClick={() => act("/like", (r) => ({ liked: r.liked, disliked: false, video: { ...v, likesCount: r.likesCount ?? v.likesCount } }))}><ThumbsUp size={18} /> {views(v.likesCount)}</button>
        <button className={d.disliked ? "on" : ""} onClick={() => act("/dislike", (r) => ({ disliked: r.disliked, liked: false }))}><ThumbsDown size={18} /></button>
        <button onClick={() => { navigator.share ? navigator.share({ title: v.title, url: location.href }).catch(() => {}) : navigator.clipboard && navigator.clipboard.writeText(location.href); }}><Share2 size={18} /> Share</button>
        <button className={d.saved ? "on" : ""} onClick={() => act("/save", (r) => ({ saved: r.saved }))}><Bookmark size={18} /> {d.saved ? "Saved" : "Save"}</button>
      </div>
      <p className="desc">{v.description}</p>
      <h2 className="h">Comments ({cm.length})</h2>
      {v.allowComments === false ? <p className="dim">Comments band hain.</p> : (
        <div className="cbox"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Add a comment..." /><button onClick={send}>Post</button></div>
      )}
      {cm.map((c) => (<div className="cm" key={c._id}><div className="av sm">{((c.author && (c.author.displayName || c.author.username)) || "?")[0]}</div><div><b>{(c.author && (c.author.displayName || c.author.username)) || "User"}</b> <span className="dim">{ago(c.createdAt)}</span><p>{c.text}</p></div></div>))}
      <h2 className="h">Up Next</h2>
      {next.slice(0, 8).map((x) => <VideoCard key={x._id} v={x} go={go} row />)}
    </>
  );
}
