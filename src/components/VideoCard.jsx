import { useState } from "react";
import { MoreVertical, BadgeCheck, Flame, Share2, Bookmark, Play } from "lucide-react";
import { api } from "../lib/api.js";
import { views, ago, dur } from "../lib/fmt.js";
import Avatar from "./Avatar.jsx";

export default function VideoCard({ v, go, row, badge }) {
  const a = v.author || {}, nm = a.name || a.username || "?";
  const open = () => go("watch", { id: v._id });
  const [km, setKm] = useState(false), [note, setNote] = useState("");
  const link = location.origin + "/#" + v._id;
  const share = () => { setKm(false); if (navigator.share) navigator.share({ title: v.title, url: link }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => setNote("Link copy ho gaya")); };
  const save = async () => { setKm(false); try { const r = await api("/videos/" + v._id + "/save", { method: "POST" }); setNote(r.saved ? "Library mein save ho gayi" : "Save hatai gayi"); } catch (e) { setNote(e.message); } };
  const kebab = (sz) => (<span className="kwrap"><button className="kebab" aria-label="More" onClick={() => { setNote(""); setKm(!km); }}><MoreVertical size={sz} /></button>{km && <div className="kmenu"><button onClick={() => { setKm(false); open(); }}><Play size={15} /> Open</button><button onClick={share}><Share2 size={15} /> Share</button><button onClick={save}><Bookmark size={15} /> Save</button></div>}{note && <small className="knote" onClick={() => setNote("")}>{note}</small>}</span>);
  const thumb = (
    <div className="thumb" onClick={open}>
      {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" loading="lazy" /> : <div className="noimg" />}
      {badge && <span className="badge"><Flame size={14} color="#ff7a1a" /> {badge}</span>}
      <b>{dur(v.duration)}</b>
    </div>
  );
  if (row) return (
    <article className="vcard row">{thumb}
      <div className="meta" onClick={open}><h3>{v.title}</h3><p className="chn">{nm} <BadgeCheck size={13} /></p><p>{views(v.views)} views • {ago(v.createdAt)}</p></div>
      {kebab(18)}
    </article>
  );
  return (
    <article className="vcard feed">{thumb}
      <div className="frow">
        <Avatar name={nm} src={a.avatarUrl} size={44} className="ringc" onClick={open} />
        <div className="meta" onClick={open}><h3>{v.title}</h3><p className="chn">{nm} <BadgeCheck size={14} /></p><p>{views(v.views)} views • {ago(v.createdAt)}</p></div>
        {kebab(20)}
      </div>
    </article>
  );
}
