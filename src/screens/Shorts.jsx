import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";

export default function Shorts() {
  const [list, setList] = useState(null);
  useEffect(() => { api("/shorts").then((d) => setList(d.shorts)).catch(() => setList([])); }, []);
  const like = async (s) => { try { const r = await api("/shorts/" + s._id + "/like", { method: "POST" }); setList(list.map((x) => (x._id === s._id ? { ...x, ...r } : x))); } catch (e) { alert(e.message); } };
  if (!list) return <p className="empty">Loading...</p>;
  if (!list.length) return <p className="empty">Abhi koi Short nahi.</p>;
  return (
    <div className="reels">{list.map((s) => (
      <div className="reel" key={s._id}>
        <video src={s.videoUrl} loop playsInline controls onPlay={() => api("/shorts/" + s._id + "/view", { method: "POST" }).catch(() => {})} />
        <div className="cap"><b>@{(s.user && s.user.username) || "user"}</b><p>{s.caption || s.title || ""}</p></div>
        <button className="lk" onClick={() => like(s)}><Heart size={28} /><span>{views((s.likes && s.likes.length) || s.likesCount || 0)}</span></button>
      </div>))}
    </div>
  );
}
