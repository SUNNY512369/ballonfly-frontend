import { useEffect, useState } from "react";
import { Heart, MessageCircle, UserPlus, Bell, Mail, Video, Settings as Cog } from "lucide-react";
import { api } from "../lib/api.js";
import { ago } from "../lib/fmt.js";
import { Head, Panel } from "../components/Ui.jsx";

const ICON = { like: Heart, comment: MessageCircle, follow: UserPlus };
const DEF = { e1: 1, e2: 1, e3: 1, e4: 1, e5: 0, p1: 1, p2: 1, p3: 1, p4: 0, a1: 1, a2: 1, send: "All", pause: "None" };
const T = ({ k, s, set, label }) => (<label className="tog"><span>{label}</span><input type="checkbox" checked={!!s[k]} onChange={(e) => set({ ...s, [k]: e.target.checked ? 1 : 0 })} /></label>);

export default function Notifications() {
  const [tab, setTab] = useState("Activity"); const [list, setList] = useState(null);
  const [s, setS] = useState(() => { try { return { ...DEF, ...JSON.parse(localStorage.getItem("bf_notif")) }; } catch { return DEF; } });
  const set = (n) => { setS(n); try { localStorage.setItem("bf_notif", JSON.stringify(n)); } catch {} };
  useEffect(() => { api("/notifications").then((d) => { setList(d.notifications || (Array.isArray(d) ? d : [])); api("/notifications/read-all", { method: "POST" }).catch(() => {}); }).catch(() => setList([])); }, []);
  return (<><Head icon={Bell} title="Notifications" sub="Choose what you want to be notified about" />
    <div className="chips">{["Activity", "Channel", "Comments & Mentions", "Live", "Updates"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    {tab === "Activity" ? (!list ? <p className="empty">Loading...</p> : !list.length ? <p className="empty">Abhi koi notification nahi.</p> : list.map((n) => { const I = ICON[n.type] || Heart; const who = (n.actor && (n.actor.displayName || n.actor.username)) || "Someone";
      return (<div key={n._id} className={"note-row" + (n.read ? "" : " unread")}><I size={22} color="#00e5ff" /><div><b>{who}</b> {n.type === "like" ? "ne aap ki cheez ko like kiya" : n.type === "comment" ? "ne comment kiya: " + (n.text || "") : "ne aap ko follow kiya"}<p className="dim">{ago(n.createdAt)}</p></div></div>); }))
    : (<>
      <Panel icon={Mail} title="Email Notifications"><T s={s} set={set} k="e1" label="Channel activity (new comments, mentions)" /><T s={s} set={set} k="e2" label="New subscribers" /><T s={s} set={set} k="e3" label="Monetization updates" /><T s={s} set={set} k="e4" label="Policy updates" /><T s={s} set={set} k="e5" label="Ballonfly news and tips" /></Panel>
      <Panel icon={Bell} title="Push Notifications"><T s={s} set={set} k="p1" label="New comments on your videos" /><T s={s} set={set} k="p2" label="New followers" /><T s={s} set={set} k="p3" label="Live stream reminders" /><T s={s} set={set} k="p4" label="Important updates from Ballonfly" /></Panel>
      <Panel icon={Video} title="Activity Alerts"><T s={s} set={set} k="a1" label="New video performance available" /><T s={s} set={set} k="a2" label="Subscribers gain milestone (e.g. 1K, 100K)" /></Panel>
      <Panel icon={Cog} title="Advanced Notifications"><label className="lbl">Send me notifications</label><select className="in" value={s.send} onChange={(e) => set({ ...s, send: e.target.value })}><option>All</option><option>Important only</option><option>None</option></select><label className="lbl">Pause notifications</label><select className="in" value={s.pause} onChange={(e) => set({ ...s, pause: e.target.value })}><option>None</option><option>1 hour</option><option>8 hours</option><option>1 day</option></select></Panel>
      <p className="note">Ye choices sirf is phone mein save hoti hain, server par nahi.</p></>)}
  </>);
}
