import { useEffect, useRef, useState } from "react";
import { ThumbsUp, ThumbsDown, Bookmark, Share2, Download, BadgeCheck, ChevronDown, ListFilter, Smile, Play, Pause, Volume2, VolumeX, Maximize, MoreHorizontal } from "lucide-react";
import { api } from "../lib/api.js";
import { views, ago, dur } from "../lib/fmt.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Watch({ id, go }) {
  const [d, setD] = useState(null);
  const [cm, setCm] = useState([]);
  const [text, setText] = useState("");
  const [next, setNext] = useState([]);
  const [more, setMore] = useState(false);
  const [newest, setNewest] = useState(true);
  const [auto, setAuto] = useState(() => { try { return localStorage.getItem("bf_autoplay") !== "0"; } catch { return true; } });
  const vref = useRef(); const [pl, setPl] = useState(false); const [tm, setTm] = useState(0); const [du, setDu] = useState(0); const [mu, setMu] = useState(false);
  const nextRef = useRef([]); nextRef.current = next;
  const load = () => api("/videos/" + id).then(setD).catch(() => setD({ error: true }));
  const loadC = () => api("/videos/" + id + "/comments").then((r) => setCm(r.comments || [])).catch(() => {});
  useEffect(() => { setD(null); setMore(false); load(); loadC(); api("/videos").then((r) => setNext(r.videos.filter((v) => v._id !== id))).catch(() => {}); window.scrollTo(0, 0); }, [id]);
  if (!d) return <p className="empty">Loading...</p>;
  if (d.error) return <p className="empty">Video nahi mila.</p>;
  const v = d.video, a = v.author || {};
  const act = async (path, patch) => { try { const r = await api("/videos/" + id + path, { method: "POST" }); setD({ ...d, ...patch(r) }); } catch (e) { alert(e.message); } };
  const sub = async () => { try { const r = await api("/users/" + a._id + "/follow", { method: "POST" }); setD({ ...d, subscribed: r.following, subscribersCount: r.followersCount }); } catch (e) { alert(e.message); } };
  const send = async () => { if (!text.trim()) return; try { await api("/videos/" + id + "/comments", { method: "POST", body: { text } }); setText(""); loadC(); } catch (e) { alert(e.message); } };
  const toggleAuto = () => { const n = !auto; setAuto(n); try { localStorage.setItem("bf_autoplay", n ? "1" : "0"); } catch {} };
  const toggle = () => { const e = vref.current; if (e) (e.paused ? e.play() : e.pause()); };
  const fs = () => { const e = vref.current; if (e && e.requestFullscreen) e.requestFullscreen(); else if (e && e.webkitEnterFullscreen) e.webkitEnterFullscreen(); };
  const sorted = [...cm].sort((x, y) => (newest ? 1 : -1) * (new Date(y.createdAt) - new Date(x.createdAt)));
  const nm = (c) => (c.author && (c.author.displayName || c.author.username)) || "User";
  return (<>
    <div className="pwrap">
      <video ref={vref} className="player" src={v.videoUrl} poster={v.thumbnailUrl} playsInline onClick={toggle} onPlay={() => setPl(true)} onPause={() => setPl(false)} onTimeUpdate={(e) => setTm(e.target.currentTime)} onLoadedMetadata={(e) => setDu(e.target.duration)} onEnded={() => auto && nextRef.current[0] && go("watch", { id: nextRef.current[0]._id })} />
      <div className="pctl">
        <button onClick={toggle} aria-label="Play or pause">{pl ? <Pause size={26} fill="#fff" /> : <Play size={26} fill="#fff" />}</button>
        <span>{dur(tm)} / {dur(du)}</span>
        <input type="range" min="0" max={du || 0} step="0.1" value={tm} onChange={(e) => { if (vref.current) vref.current.currentTime = +e.target.value; }} />
        <button onClick={() => { if (vref.current) { vref.current.muted = !mu; setMu(!mu); } }} aria-label="Mute">{mu ? <VolumeX size={24} /> : <Volume2 size={24} />}</button>
        <button onClick={fs} aria-label="Fullscreen"><Maximize size={24} /></button>
      </div>
      {v.category && <span className="pbadge l">{v.category}</span>}
      <span className="pbadge r">1080P</span>
    </div>
    <h1 className="vt">{v.title}</h1>
    <p className="dim">{views(v.views)} views • {ago(v.createdAt)} {(v.hashtags || []).map((h) => <span key={h} className="tagc"> #{h.replace("#", "")}</span>)}</p>
    <div className="chan">
      <div className="av">{(a.name || "?")[0]}</div>
      <div style={{ flex: 1 }}><b>{a.name} <BadgeCheck size={15} color="#00e5ff" /></b><p className="dim">{views(d.subscribersCount)} subscribers</p></div>
      <button className={"sub" + (d.subscribed ? " on" : "")} onClick={sub}>{d.subscribed ? "Subscribed" : "Subscribe"}</button>
    </div>
    <div className="acts">
      <button className={d.liked ? "on" : ""} onClick={() => act("/like", (r) => ({ liked: r.liked, disliked: false, video: { ...v, likesCount: r.likesCount ?? v.likesCount } }))}><ThumbsUp size={18} /> {views(v.likesCount)}</button>
      <button className={d.disliked ? "on" : ""} onClick={() => act("/dislike", (r) => ({ disliked: r.disliked, liked: false }))}><ThumbsDown size={18} /></button>
      <button onClick={() => { navigator.share ? navigator.share({ title: v.title, url: location.href }).catch(() => {}) : navigator.clipboard && navigator.clipboard.writeText(location.href); }}><Share2 size={18} /> Share</button>
      <button onClick={() => window.open(v.videoUrl, "_blank")}><Download size={18} /> Download</button>
      <button className={d.saved ? "on" : ""} onClick={() => act("/save", (r) => ({ saved: r.saved }))}><Bookmark size={18} /> {d.saved ? "Saved" : "Save"}</button>
      <button aria-label="More"><MoreHorizontal size={20} /></button>
    </div>
    <div className="descbox" onClick={() => setMore(!more)}>
      <p className={more ? "" : "clamp"}>{v.description}</p>
      <span className="showmore">{more ? "Show less" : "Show more"} <ChevronDown size={18} style={{ transform: more ? "rotate(180deg)" : "none" }} /></span>
    </div>
    <div className="chead"><h2>Comments <span>({cm.length})</span></h2><button className="ghost" onClick={() => setNewest(!newest)}><ListFilter size={18} /> {newest ? "Newest" : "Oldest"}</button></div>
    {v.allowComments === false ? <p className="dim">Comments band hain.</p> : (
      <div className="cbox"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Add a comment..." /><Smile size={20} color="#9db4d9" /><button onClick={send}>Post</button></div>
    )}
    {sorted.map((c) => (<div className="cm" key={c._id}><div className="av sm">{nm(c)[0]}</div><div><b>{nm(c)}</b> <span className="dim">{ago(c.createdAt)}</span><p>{c.text}</p><button className="rep" onClick={() => setText("@" + nm(c) + " ")}>Reply</button></div></div>))}
    <div className="chead"><h2>Up Next</h2><label className="auto">Autoplay <input type="checkbox" checked={auto} onChange={toggleAuto} /><i /></label></div>
    {next.slice(0, 8).map((x) => <VideoCard key={x._id} v={x} go={go} row />)}
  </>);
}
