import { useEffect, useState } from "react";
import { Video, Eye, ShieldCheck, Flag, BadgeCheck, Users as UsersI, MessageCircle } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import { Head, Stat, Panel, Chart } from "../components/Ui.jsx";
import Avatar from "../components/Avatar.jsx";

function Guard({ children }) {
  const [ok, setOk] = useState(null);
  useEffect(() => { api("/users/me/profile").then((d) => setOk(!!(d.profile && d.profile.isAdmin))).catch(() => setOk(false)); }, []);
  if (ok === null) return <p className="empty">Loading...</p>;
  if (!ok) return <p className="empty">Ye hissa sirf site admin ke liye hai.</p>;
  return children;
}
const useVids = () => { const [v, setV] = useState(null); useEffect(() => { api("/videos").then((d) => setV(d.videos || [])).catch(() => setV([])); }, []); return v; };

function DashboardInner({ go }) {
  const v = useVids(); const [sh, setSh] = useState(0);
  useEffect(() => { api("/shorts").then((d) => setSh((d.shorts || []).length)).catch(() => {}); }, []);
  if (!v) return <p className="empty">Loading...</p>;
  const tv = v.reduce((a, x) => a + (x.views || 0), 0), ch = new Set(v.map((x) => x.author && x.author._id)).size;
  return (<><Head icon={ShieldCheck} title="Admin Dashboard" sub="Aap ki site ke asli numbers" />
    <div className="stats"><Stat icon={Video} tone="purple" label="Total Videos" value={v.length} /><Stat icon={Eye} tone="green" label="Total Views" value={views(tv)} /><Stat icon={UsersI} label="Channels (videos wale)" value={ch} /><Stat icon={Video} tone="amber" label="Total Shorts" value={sh} /></div>
    <Panel title="Views per video"><Chart data={[...v].reverse().map((x) => x.views || 0)} /></Panel>
    <Panel title="Top Content">{v.length ? [...v].sort((a, b) => b.views - a.views).slice(0, 5).map((x, i) => <div key={x._id} className="trow" onClick={() => go("watch", { id: x._id })}><b className="rank">{i + 1}</b><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{views(x.views)} views</small></span></div>) : <p className="note">Abhi koi video nahi.</p>}</Panel>
    <Panel title="Quick Actions"><div className="grid2 qa">{[["Users", "#2563eb", "users"], ["Reports", "#8a42ff", "reports"], ["Videos dekhein", "#15803d", "home"], ["Monetization", "#d97706", "monetization"]].map(([n, c, to]) => <button key={n} style={{ background: c }} onClick={() => go(to)}>{n}</button>)}</div></Panel></>);
}

function UsersInner() {
  const v = useVids(); const [st, setSt] = useState({}); const [msg, setMsg] = useState("");
  if (!v) return <p className="empty">Loading...</p>;
  const map = new Map(); v.forEach((x) => { const a = x.author; if (!a) return; const o = map.get(a._id) || { a, vd: 0, vw: 0 }; o.vd++; o.vw += x.views || 0; map.set(a._id, o); });
  const list = [...map.values()];
  const tick = async (a) => { try { const r = await api("/users/" + a._id + "/verify", { method: "POST" }); setSt({ ...st, [a._id]: r.verified ?? !(st[a._id] ?? a.verified) }); setMsg(""); } catch (e) { setMsg(e.message); } };
  return (<><Head icon={UsersI} title="User Management" sub="Un channels ki list jinhon ne video dali hai" />
    <div className="stats"><Stat icon={UsersI} label="Channels" value={list.length} /></div>
    {msg && <p style={{ color: "#ff6b81" }}>{msg}</p>}
    <Panel title="Channels">{list.length ? list.map(({ a, vd, vw }) => { const ver = st[a._id] ?? a.verified; return (<div key={a._id} className="urow"><Avatar name={a.name} src={a.avatarUrl} size={40} /><span><b>{a.name} {ver && <BadgeCheck size={15} color="#00e5ff" />}</b><small className="dim">{vd} videos • {views(vw)} views</small></span><button className="pill" style={{ height: 36 }} onClick={() => tick(a)}>{ver ? "Remove tick" : "Blue tick"}</button></div>); }) : <p className="note">Abhi kisi ne video nahi dali.</p>}</Panel>
    <p className="note">Suspend ya Block ke liye server par alag system chahiye, wo abhi nahi bana.</p></>);
}

function ReportsInner() {
  return (<><Head icon={ShieldCheck} title="Reports & Moderation" sub="Review reports, keep the community safe and positive." />
    <div className="stats"><Stat icon={Flag} tone="purple" label="Total Reports" value="0" /><Stat icon={MessageCircle} tone="amber" label="Pending" value="0" /></div>
    <Panel icon={Flag} title="Reported Content"><p className="empty">Abhi koi report nahi. Report karne ka system server par alag se banana hoga.</p></Panel></>);
}
export const Dashboard = (p) => <Guard><DashboardInner {...p} /></Guard>;
export const Users = (p) => <Guard><UsersInner {...p} /></Guard>;
export const Reports = (p) => <Guard><ReportsInner {...p} /></Guard>;
