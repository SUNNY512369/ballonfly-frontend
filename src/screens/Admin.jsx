import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import { Head, Stat, Panel, Demo } from "../components/Ui.jsx";

export function Dashboard({ go }) {
  const [v, setV] = useState([]); useEffect(() => { api("/videos").then((d) => setV(d.videos || [])).catch(() => {}); }, []);
  return (<><Head title="Admin Dashboard" sub="Welcome back, Admin!" />
    <div className="stats"><Stat label="Total Videos" value={v.length} tone="purple" /><Stat label="Total Views" value={views(v.reduce((a, x) => a + (x.views || 0), 0))} tone="green" /></div>
    <Panel title="Top Content">{[...v].sort((a, b) => b.views - a.views).slice(0, 5).map((x, i) => <div key={x._id} className="brow" onClick={() => go("watch", { id: x._id })}><span>{i + 1}. {x.title}</span><b>{views(x.views)}</b></div>)}</Panel>
    <Panel title="Quick Actions"><div className="grid2"><button className="pill" onClick={() => go("users")}>User Management</button><button className="pill" onClick={() => go("reports")}>Reports & Moderation</button></div></Panel></>);
}

const U = [["Sarah Queen", "Active", "Creator"], ["GamingPro", "Active", "Creator"], ["PandaFun", "Suspended", "User"], ["TechMaster", "Active", "User"], ["DreamerGirl", "Blocked", "User"]];
export function Users() {
  const [u, setU] = useState(U.map((x) => ({ n: x[0], s: x[1], r: x[2] }))); const [q, setQ] = useState("");
  const set = (n, s) => setU(u.map((x) => (x.n === n ? { ...x, s } : x)));
  return (<><Head title="User Management" sub="Manage your community members, and keep your platform safe." />
    <div className="stats"><Stat label="Total" value={u.length} /><Stat label="Active" value={u.filter((x) => x.s === "Active").length} tone="green" /><Stat label="Suspended" value={u.filter((x) => x.s === "Suspended").length} tone="amber" /><Stat label="Blocked" value={u.filter((x) => x.s === "Blocked").length} tone="purple" /></div>
    <input className="in" placeholder="Search by username..." value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
    {u.filter((x) => x.n.toLowerCase().includes(q.toLowerCase())).map((x) => (<div key={x.n} className="brow"><span><b>{x.n}</b> • {x.r} • {x.s}</span><span><button className="pill" style={{ height: 34 }} onClick={() => set(x.n, "Active")}>Activate</button> <button className="pill" style={{ height: 34 }} onClick={() => set(x.n, "Suspended")}>Suspend</button> <button className="pill" style={{ height: 34 }} onClick={() => set(x.n, "Blocked")}>Block</button></span></div>))}<Demo /></>);
}

export function Reports() {
  const [r, setR] = useState([["Scary Monster in Forest", "Violence / Graphic Content"], ["Sad Story", "Hate Speech"], ["Epic Gaming Moments", "Copyright Infringement"], ["Fake News Alert", "Misinformation"], ["Cute Cat Video", "Other"]]);
  const [log, setL] = useState([]); const done = (i, a) => { setL([a + ": " + r[i][0], ...log]); setR(r.filter((_, j) => j !== i)); };
  return (<><Head title="Reports & Moderation" sub="Review reports, keep the community safe and positive." />
    <div className="stats"><Stat label="Pending" value={r.length} tone="amber" /><Stat label="Resolved" value={log.length} tone="green" /></div>
    <Panel title="Reported Content">{r.length ? r.map((x, i) => (<div key={x[0]} className="brow"><span><b>{x[0]}</b><br /><small className="dim">{x[1]}</small></span><span><button className="pill" style={{ height: 34 }} onClick={() => done(i, "Approved")}>Approve</button> <button className="pill" style={{ height: 34, color: "#ff6b81" }} onClick={() => done(i, "Removed")}>Remove</button></span></div>)) : <p className="empty">Koi report baqi nahi.</p>}</Panel>
    <Panel title="Recent Activity">{log.map((l) => <p key={l} className="note">{l}</p>)}</Panel><Demo /></>);
}
