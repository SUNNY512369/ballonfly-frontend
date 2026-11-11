import { MoreVertical, BadgeCheck, Flame } from "lucide-react";
import { views, ago, dur } from "../lib/fmt.js";

export default function VideoCard({ v, go, row, badge }) {
  const a = v.author || {}, nm = a.name || a.username || "?";
  const open = () => go("watch", { id: v._id });
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
      <button className="kebab" aria-label="More"><MoreVertical size={18} /></button>
    </article>
  );
  return (
    <article className="vcard feed">{thumb}
      <div className="frow">
        <div className="av" onClick={open}>{nm[0]}</div>
        <div className="meta" onClick={open}><h3>{v.title}</h3><p className="chn">{nm} <BadgeCheck size={14} /></p><p>{views(v.views)} views • {ago(v.createdAt)}</p></div>
        <button className="kebab" aria-label="More"><MoreVertical size={20} /></button>
      </div>
    </article>
  );
}
