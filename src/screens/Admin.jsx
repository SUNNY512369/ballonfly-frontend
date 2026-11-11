import { useEffect, useState } from "react";
import { Users as UsersI, Video, Eye, DollarSign, ShieldCheck, Flag, Check, Ban, Trash2, EyeOff, AlertTriangle, MessageSquare, BarChart3, Download, Plus } from "lucide-react";
import { api } from "../lib/api.js";
import { views } from "../lib/fmt.js";
import { Head, Stat, Panel, Demo, Chart } from "../components/Ui.jsx";

export function Dashboard({ go }) {
  const [v, setV] = useState([]); useEffect(() => { api("/videos").then((d) => setV(d.videos || [])).catch(() => {}); }, []);
  const tv = v.reduce((a, x) => a + (x.views || 0), 0);
  return (<><Head icon={ShieldCheck} title="Admin Dashboard" sub="Welcome back, Admin! 👋" />
    <div className="stats"><Stat icon={UsersI} label="Total Users" value="2.4M" trend="12.5%" /><Stat icon={Video} tone="purple" label="Total Videos" value={v.length} trend="14.2%" /><Stat icon={Eye} tone="green" label="Total Views" value={views(tv)} trend="16.8%" /><Stat icon={DollarSign} tone="amber" label="Total Revenue" value="$421.5K" trend="20.3%" /></div>
    <Panel icon={BarChart3} title="Platform Analytics"><Chart data={[...v].reverse().map((x) => x.views || 0)} /></Panel>
    <Panel title="Top Content">{[...v].sort((a, b) => b.views - a.views).slice(0, 5).map((x, i) => <div key={x._id} className="trow" onClick={() => go("watch", { id: x._id })}><b className="rank">{i + 1}</b><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{views(x.views)} views</small></span></div>)}</Panel>
    <Panel title="Quick Actions"><div className="grid2 qa">{[["Manage Videos", "#2563eb", "library"], ["Moderate Comments", "#8a42ff", "reports"], ["Check Reports", "#15803d", "reports"], ["Manage Monetization", "#d97706", "monetization"]].map(([n, c, to]) => <button key={n} style={{ background: c }} onClick={() => go(to)}>{n}</button>)}</div></Panel>
    <p className="sysok">● System Status: All Systems Operational ✓</p><Demo /></>);
}

const U = [["Sarah Queen", "Active", "Creator", 245, "412K"], ["GamingPro", "Active", "Creator", 182, "287K"], ["PrincessLive", "Active", "Creator", 320, "620K"], ["PandaFun", "Suspended", "User", 76, "94K"], ["TechMaster", "Active", "User", 123, "176K"], ["DreamerGirl", "Blocked", "User", 54, "71K"]];
export function Users() {
  const [u, setU] = useState(U.map((x) => ({ n: x[0], s: x[1], r: x[2], vd: x[3], f: x[4], sel: false }))); const [q, setQ] = useState("");
  const set = (n, s) => setU(u.map((x) => (x.n === n ? { ...x, s } : x))), bulk = (s) => setU(u.map((x) => (x.sel ? { ...x, s, sel: false } : x)));
  const col = { Active: "#22d36b", Suspended: "#ffb020", Blocked: "#ff3b5c" }, cnt = (s) => u.filter((x) => x.s === s).length;
  return (<><Head icon={UsersI} title="User Management" sub="Manage your community members, and keep your platform safe." />
    <div className="stats"><Stat icon={UsersI} label="Total Users" value={u.length} /><Stat icon={Check} tone="green" label="Active Users" value={cnt("Active")} /><Stat icon={AlertTriangle} tone="amber" label="Suspended Users" value={cnt("Suspended")} /><Stat icon={Ban} tone="purple" label="Blocked Users" value={cnt("Blocked")} /></div>
    <div className="wiz-nav" style={{ margin: "0 0 10px" }}><button className="pill"><Download size={16} /> Export Users</button><button className="pill main"><Plus size={16} /> Add User</button></div>
    <input className="in" placeholder="Search by username, email or ID..." value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
    <Panel title="Users">{u.filter((x) => x.n.toLowerCase().includes(q.toLowerCase())).map((x) => (<div key={x.n} className="urow"><input type="checkbox" checked={x.sel} onChange={() => setU(u.map((y) => (y.n === x.n ? { ...y, sel: !y.sel } : y)))} /><i className="pkav sm">{x.n[0]}</i><span><b>{x.n}</b><small className="dim">{x.vd} videos • {x.f} followers</small></span><em className="stb" style={{ color: col[x.s], borderColor: col[x.s] }}>{x.s}</em><small className="rolb">{x.r}</small><span className="uact"><button onClick={() => set(x.n, "Active")}><Check size={16} /></button><button onClick={() => set(x.n, "Suspended")}><AlertTriangle size={16} /></button><button onClick={() => set(x.n, "Blocked")}><Ban size={16} /></button></span></div>))}</Panel>
    <div className="bulk"><b>Bulk Actions</b><button style={{ background: "#2563eb" }} onClick={() => bulk("Active")}>Activate</button><button style={{ background: "#d97706" }} onClick={() => bulk("Suspended")}>Suspend</button><button style={{ background: "#dc2626" }} onClick={() => bulk("Blocked")}>Block</button></div><Demo /></>);
}

export function Reports() {
  const [r, setR] = useState([["Scary Monster in Forest", "Violence / Graphic Content", "#ff3b5c", "User123"], ["Sad Story", "Hate Speech", "#ff3b5c", "Viewer456"], ["Epic Gaming Moments", "Copyright Infringement", "#ffb020", "Gamer789"], ["Fake News Alert", "Misinformation", "#ff3b5c", "TruthSeeker"], ["Cute Cat Video", "Other", "#22d36b", "PetLover"]]);
  const [log, setL] = useState([]), [sel, setSel] = useState(0); const done = (i, a) => { setL([a + ": " + r[i][0], ...log]); setR(r.filter((_, j) => j !== i)); setSel(0); };
  const acts = [["Approve Content", Check, "#15803d", "Approved"], ["Remove Content", Trash2, "#b91c1c", "Removed"], ["Block User", Ban, "#d97706", "User blocked"], ["Hide Content", EyeOff, "#6d28d9", "Hidden"], ["Warn User", AlertTriangle, "#1d4ed8", "Warned"], ["Ban User", Ban, "#0f766e", "User banned"]];
  return (<><Head icon={ShieldCheck} title="Reports & Moderation" sub="Review reports, keep the community safe and positive." />
    <div className="stats"><Stat icon={Flag} tone="purple" label="Total Reports" value={r.length + log.length} trend="12%" /><Stat icon={Check} tone="green" label="Resolved" value={log.length} trend="8%" /><Stat icon={AlertTriangle} tone="amber" label="Pending" value={r.length} trend="14%" /></div>
    <div className="chips">{["Report Queue (" + r.length + ")", "Moderation Tools", "Blocked Users", "Content Filters", "Activity Log"].map((t, i) => <button key={t} className={i === 0 ? "on" : ""}>{t}</button>)}</div>
    <Panel icon={AlertTriangle} title="Reported Content">{r.length ? r.map((x, i) => (<div key={x[0]} className={"rrow" + (sel === i ? " sel" : "")} onClick={() => setSel(i)}><div className="mini bad" /><span><b>{x[0]}</b><small style={{ color: x[2] }}>● {x[1]}</small><small className="dim">Reported by: {x[3]}</small></span><button className="pill" style={{ height: 34 }} onClick={() => done(i, "Approved")}>Review</button><button className="pill" style={{ height: 34, color: "#ff6b81" }} onClick={() => done(i, "Removed")}>Remove</button></div>)) : <p className="empty">Koi report baqi nahi.</p>}</Panel>
    <Panel title="Moderation Actions"><div className="grid3 macts">{acts.map(([n, I, c, a]) => <button key={n} style={{ background: c }} onClick={() => r.length && done(sel, a)}><I size={24} /><span>{n}</span></button>)}</div></Panel>
    <Panel title="Recent Activity">{log.length ? log.map((l) => <p key={l} className="note">✓ {l}</p>) : <p className="note">Abhi koi activity nahi.</p>}</Panel><Demo /></>);
}
