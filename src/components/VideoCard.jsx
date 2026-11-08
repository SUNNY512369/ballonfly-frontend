import { views, ago, dur } from "../lib/fmt.js";
import { BadgeCheck } from "lucide-react";

export default function VideoCard({ v, go, row }) {
  const a = v.author || {};
  return (
    <article className={"vcard" + (row ? " row" : "")} onClick={() => go("watch", { id: v._id })}>
      <div className="thumb">
        {v.thumbnailUrl ? <img src={v.thumbnailUrl} alt="" loading="lazy" /> : <div className="noimg" />}
        <b>{dur(v.duration)}</b>
      </div>
      <div className="meta">
        <h3>{v.title}</h3>
        <p>{a.name || a.username} <BadgeCheck size={13} color="#00e5ff" style={{ verticalAlign: "-2px" }} /></p>
        <p>{views(v.views)} views • {ago(v.createdAt)}</p>
      </div>
    </article>
  );
}
