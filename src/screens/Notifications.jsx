import { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { api } from "../lib/api.js";
import { ago } from "../lib/fmt.js";

const ICON = { like: Heart, comment: MessageCircle, follow: UserPlus };
export default function Notifications() {
  const [list, setList] = useState(null);
  useEffect(() => { api("/notifications").then((d) => { setList(d.notifications || (Array.isArray(d) ? d : [])); api("/notifications/read-all", { method: "POST" }).catch(() => {}); }).catch(() => setList([])); }, []);
  if (!list) return <p className="empty">Loading...</p>;
  if (!list.length) return <p className="empty">Abhi koi notification nahi.</p>;
  return list.map((n) => { const I = ICON[n.type] || Heart; const who = (n.actor && (n.actor.displayName || n.actor.username)) || "Someone";
    return (<div key={n._id} className={"note-row" + (n.read ? "" : " unread")}><I size={22} color="#00e5ff" /><div><b>{who}</b> {n.type === "like" ? "ne aap ki cheez ko like kiya" : n.type === "comment" ? "ne comment kiya: " + (n.text || "") : "ne aap ko follow kiya"}<p className="dim">{ago(n.createdAt)}</p></div></div>); });
}
