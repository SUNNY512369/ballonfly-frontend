import { useEffect, useState } from "react";
import { Eye, Clock, Users, DollarSign, ThumbsUp, MessageCircle, Wallet as WalletIcon, BarChart3, Video, RefreshCw, CheckCircle2, Lightbulb, Rocket, Building2, Gift, Trophy } from "lucide-react";
import { api } from "../lib/api.js";
import { views, dur } from "../lib/fmt.js";
import { Head, Stat, Panel, Demo, Chart, Donut, Spark } from "../components/Ui.jsx";

const useMine = () => { const [v, setV] = useState(null); useEffect(() => { api("/videos/mine").then((d) => setV(d.videos || [])).catch(() => setV([])); }, []); return v; };
const sum = (v, k) => v.reduce((a, x) => a + (x[k] || 0), 0);

export function Analytics() {
  const v = useMine(); const [tab, setTab] = useState("Overview"); if (!v) return <p className="empty">Loading...</p>;
  const ord = [...v].reverse(), key = { Overview: "views", Reach: "views", Engagement: "likesCount", Audience: "commentsCount", Revenue: "views" }[tab];
  const data = ord.map((x) => (x[key] || 0) * (tab === "Revenue" ? 0.0012 : 1)), tv = sum(v, "views");
  const hrs = Math.round(v.reduce((a, x) => a + (x.views || 0) * (x.duration || 0), 0) / 3600);
  const max = Math.max(1, ...v.map((x) => x.views || 0));
  return (<><Head icon={BarChart3} title="Analytics" sub="Track your performance and grow your audience" />
    <div className="chips">{["Overview", "Reach", "Engagement", "Audience", "Revenue"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="stats"><Stat icon={Eye} label="Views" value={views(tv)} trend="12.5%" /><Stat icon={Clock} tone="purple" label="Watch Time (hours)" value={views(hrs)} trend="20.1%" /><Stat icon={ThumbsUp} tone="green" label="Likes" value={views(sum(v, "likesCount"))} trend="18.7%" /><Stat icon={DollarSign} tone="amber" label="Est. Revenue" value={"$" + (tv * 0.0012).toFixed(2)} trend="16.4%" /></div>
    <Panel icon={BarChart3} title={tab === "Overview" ? "Views Over Time" : tab + " Over Time"}><Chart data={data} color={tab === "Revenue" ? "#ffb020" : "#00e5ff"} /></Panel>
    <Panel icon={Trophy} title="Top Videos">{[...v].sort((a, b) => b.views - a.views).slice(0, 3).map((x, i) => (<div key={x._id} className="trow"><b className="rank">{i + 1}</b><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{views(x.views)} views</small></span><div style={{ width: 70 }}><Spark data={[1, 3, 2, 5, 4, 7, 6 + (x.views || 0) / max * 4]} color="#22d36b" /></div></div>))}</Panel>
    <p className="note">Revenue aur watch hours andaza hain, asli ad-system connected nahi.</p></>);
}

export function Monetization() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  const tv = sum(v, "views"), hrs = Math.round(v.reduce((a, x) => a + (x.views || 0) * (x.duration || 0), 0) / 3600), ok = tv >= 1000000 && hrs >= 4000;
  const Bar = ({ icon: I, l, a, b, c }) => (<div className="elig"><I size={26} color={c} /><div style={{ flex: 1 }}><div className="brow" style={{ border: 0, padding: 0 }}><b>{views(a)} / {views(b)}</b><small className="dim">{l}</small></div><div className="bar"><i style={{ width: Math.min(100, (a / b) * 100) + "%", background: c }} /></div></div>{a >= b && <CheckCircle2 color="#22d36b" />}</div>);
  return (<><div className="hero"><div><small style={{ color: "#00e5ff", fontWeight: 700 }}>Ballonfly</small><h1>Monetization</h1><p>Turn Your Passion Into Real Earnings</p><button className="pill main">Enable Monetization</button></div><span className="crown">👑</span></div>
    <Panel icon={BarChart3} title="Your Earnings"><b style={{ fontSize: 34 }}>${(tv * 0.0012).toFixed(2)}</b> <i className="trend">↑ andaza</i><div className="stats"><Stat icon={Eye} label="Total Views" value={views(tv)} /><Stat icon={Clock} tone="purple" label="Watch Time (hrs)" value={views(hrs)} /></div></Panel>
    <Panel title="Monetization Status"><p style={{ fontSize: 26, fontWeight: 800, color: ok ? "#22d36b" : "#ffb020", margin: 0 }}>{ok ? "You’re In!" : "Not eligible yet"}</p><p className="dim">{ok ? "Your channel is approved for monetization." : "Pehle neeche wali shartein poori karein."}</p></Panel>
    <Panel title="Eligibility Progress"><Bar icon={Video} l="Total Views" a={tv} b={1000000} c="#00e5ff" /><Bar icon={Clock} l="Watch Hours (andaza)" a={hrs} b={4000} c="#c45bff" /></Panel>
    <Panel icon={WalletIcon} title="Payout Information"><div className="brow" style={{ border: 0 }}><span className="dim">Current Balance<br /><b style={{ fontSize: 26, color: "#fff" }}>${(tv * 0.0012).toFixed(2)}</b></span><button className="pill main">Withdraw</button></div><p className="note">Min. Payout: $100. Earnings 7 se 15 business days mein bheji jati hain.</p></Panel></>);
}

export function Wallet() {
  const tx = [["Nov 24, 2026", "Ad Revenue", "+$523.75", "Completed"], ["Nov 22, 2026", "Super Chat", "+$180.00", "Completed"], ["Nov 20, 2026", "Payout Request", "-$3,000.00", "Processed"], ["Nov 18, 2026", "Membership Fee", "+$299.00", "Completed"]];
  const pay = [["PayPal", 50, "#1d4ed8"], ["Bank Transfer", 100, "#7c3aed"], ["Gift Card", 25, "#15803d"]];
  return (<><Head icon={WalletIcon} title="Creator Wallet & Earnings" sub="Manage earnings, payouts and creator revenue" />
    <div className="stats"><Stat icon={BarChart3} label="Total Earnings" value="$12,480.75" trend="18.5%" /><Stat icon={WalletIcon} tone="green" label="Available Balance" value="$8,320.50" trend="12.3%" /><Stat icon={Clock} tone="purple" label="Pending Amount" value="$3,160.25" trend="8.7%" /><Stat icon={DollarSign} tone="amber" label="Total Payouts" value="$24,780.00" trend="20.1%" /></div>
    <Panel icon={BarChart3} title="Earnings Overview"><Chart data={[6, 8, 7, 11, 9, 13, 12, 16, 15, 20]} /></Panel>
    <Panel icon={Building2} title="Payout Options"><div className="grid3">{pay.map(([n, m, c]) => <div key={n} className="payc" style={{ background: c }}><b>{n}</b><small>Min: ${m}</small><button>Request Payout</button></div>)}</div><p className="note">Next Payout: Nov 30, 2026 • Estimated Amount: $3,160.25</p></Panel>
    <Panel title="Recent Transactions">{tx.map((t) => <div key={t[0] + t[1]} className="trow"><span><b>{t[1]}</b><small className="dim">{t[0]}</small></span><b style={{ color: t[2][0] === "+" ? "#22d36b" : "#ff6b81" }}>{t[2]}</b><em className="okb">{t[3]}</em></div>)}</Panel>
    <Panel title="Earnings Breakdown"><div className="brk"><Donut label="$12.5K" parts={[{ n: "a", v: 62.5, c: "#00b4ff" }, { n: "b", v: 20, c: "#c45bff" }, { n: "c", v: 12.5, c: "#22d36b" }, { n: "d", v: 5, c: "#ffb020" }]} /><div>{[["Ad Revenue", "62.5%", "#00b4ff"], ["Super Chats", "20.0%", "#c45bff"], ["Memberships", "12.5%", "#22d36b"], ["Other Income", "5.0%", "#ffb020"]].map((r) => <p key={r[0]} className="lg"><i style={{ background: r[2] }} />{r[0]} <b>{r[1]}</b></p>)}</div></div></Panel><Demo /></>);
}

export function Processing() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  return (<><Head icon={RefreshCw} title="Video Processing" sub="Your videos are being processed. This may take a few minutes." />
    <div className="stats"><Stat icon={Video} label="Total Uploads" value={v.length} /><Stat icon={RefreshCw} tone="purple" label="Processing Now" value="0" /><Stat icon={CheckCircle2} tone="green" label="Completed" value={v.length} /><Stat icon={Clock} tone="amber" label="Avg Processing Time" value="~1.8 min" /></div>
    <Panel icon={RefreshCw} title={"Processing Queue (0)"}><p className="note">Abhi koi video process nahi ho rahi. Naya upload yahan nazar aayega.</p></Panel>
    <Panel title="Processed Videos">{v.length ? v.map((x) => <div key={x._id} className="trow"><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{dur(x.duration)}</small></span><em className="okb">Done</em></div>) : <p className="empty">Abhi video nahi.</p>}</Panel>
    <Panel icon={Lightbulb} title="Tips for Faster Processing"><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Use supported video formats (MP4, MOV)</p><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Keep file size under 2GB</p><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Ensure good internet connection</p></Panel></>);
}
