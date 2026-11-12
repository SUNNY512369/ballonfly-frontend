import { useEffect, useState } from "react";
import { Eye, Clock, Users, DollarSign, ThumbsUp, MessageCircle, Wallet as WalletIcon, BarChart3, Video, RefreshCw, CheckCircle2, Lightbulb, Rocket, Building2, Gift, Trophy } from "lucide-react";
import { api } from "../lib/api.js";
import monHero from "../assets/art/mon_hero.png";
import monCrown from "../assets/art/mon_crown.png";
import { views, dur } from "../lib/fmt.js";
import { Head, Stat, Panel, Demo, Chart, Donut, Spark } from "../components/Ui.jsx";

const useMine = () => { const [v, setV] = useState(null); useEffect(() => { api("/videos/mine").then((d) => setV(d.videos || [])).catch(() => setV([])); }, []); return v; };
const sum = (v, k) => v.reduce((a, x) => a + (x[k] || 0), 0);

export function Analytics() {
  const v = useMine(); const [tab, setTab] = useState("Overview"); if (!v) return <p className="empty">Loading...</p>;
  const ord = [...v].reverse(), key = { Overview: "views", Reach: "views", Engagement: "likesCount", Audience: "commentsCount", Revenue: "views" }[tab];
  const data = ord.map((x) => (x[key] || 0) * (1)), tv = sum(v, "views");
  const hrs = Math.round(v.reduce((a, x) => a + (x.views || 0) * (x.duration || 0), 0) / 3600);
  const max = Math.max(1, ...v.map((x) => x.views || 0));
  return (<><Head icon={BarChart3} title="Analytics" sub="Track your performance and grow your audience" />
    <div className="chips">{["Overview", "Reach", "Engagement", "Audience", "Revenue"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
    <div className="stats"><Stat icon={Eye} label="Views" value={views(tv)} /><Stat icon={Clock} tone="purple" label="Watch Time (hours)" value={views(hrs)} /><Stat icon={ThumbsUp} tone="green" label="Likes" value={views(sum(v, "likesCount"))} /><Stat icon={MessageCircle} tone="amber" label="Comments" value={views(sum(v, "commentsCount"))} /></div>
    <Panel icon={BarChart3} title={tab === "Overview" ? "Views Over Time" : tab + " Over Time"}><Chart data={data} /></Panel>
    <Panel icon={Trophy} title="Top Videos">{[...v].sort((a, b) => b.views - a.views).slice(0, 3).map((x, i) => (<div key={x._id} className="trow"><b className="rank">{i + 1}</b><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{views(x.views)} views</small></span><div style={{ width: 70 }}><b>{views(x.views)}</b></div></div>))}</Panel>
    <p className="note">Revenue tab abhi views dikhata hai: kamai ka system jura nahi.</p></>);
}

export function Monetization() {
  const v = useMine(); const [mmsg, setMmsg] = useState(""); if (!v) return <p className="empty">Loading...</p>;
  const tv = sum(v, "views"), hrs = Math.round(v.reduce((a, x) => a + (x.views || 0) * (x.duration || 0), 0) / 3600), ok = tv >= 1000000 && hrs >= 4000;
  const Bar = ({ icon: I, l, a, b, c }) => (<div className="elig"><I size={26} color={c} /><div style={{ flex: 1 }}><div className="brow" style={{ border: 0, padding: 0 }}><b>{views(a)} / {views(b)}</b><small className="dim">{l}</small></div><div className="bar"><i style={{ width: Math.min(100, (a / b) * 100) + "%", background: c }} /></div></div>{a >= b && <CheckCircle2 color="#22d36b" />}</div>);
  return (<><div className="hero"><div><small style={{ color: "#00e5ff", fontWeight: 700 }}>Ballonfly</small><h1>Monetization</h1><p>Turn Your Passion Into Real Earnings</p><button className="pill main" onClick={() => setMmsg(ok ? "Aap eligible hain, lekin kamai ka system server par abhi jura nahi." : "Abhi eligible nahi: 1M views aur 4,000 watch hours chahiye.")}>Enable Monetization</button></div><img className="crownimg" src={monHero} alt="" /></div>
    {mmsg && <p className="note" style={{ color: "var(--cyan)" }}>{mmsg}</p>}
    <Panel icon={BarChart3} title="Your Earnings"><b style={{ fontSize: 34 }}>$0.00</b> <small className="dim">Monetization abhi on nahi</small><div className="stats"><Stat icon={Eye} label="Total Views" value={views(tv)} /><Stat icon={Clock} tone="purple" label="Watch Time (hrs)" value={views(hrs)} /></div></Panel>
    <Panel title="Monetization Status"><img className="statuscrown" src={monCrown} alt="" /><p style={{ fontSize: 26, fontWeight: 800, color: ok ? "#22d36b" : "#ffb020", margin: 0 }}>{ok ? "You’re In!" : "Not eligible yet"}</p><p className="dim">{ok ? "Your channel is approved for monetization." : "Pehle neeche wali shartein poori karein."}</p></Panel>
    <Panel title="Eligibility Progress"><Bar icon={Video} l="Total Views" a={tv} b={1000000} c="#00e5ff" /><Bar icon={Clock} l="Watch Hours (andaza)" a={hrs} b={4000} c="#c45bff" /></Panel>
    <Panel icon={WalletIcon} title="Payout Information"><div className="brow" style={{ border: 0 }}><span className="dim">Current Balance<br /><b style={{ fontSize: 26, color: "#fff" }}>$0.00</b></span><button className="pill main" onClick={() => setMmsg("Balance $0.00 hai. Minimum payout $100 hai.")}>Withdraw</button></div><p className="note">Min. Payout: $100. Earnings 7 se 15 business days mein bheji jati hain.</p></Panel></>);
}

export function Wallet() {
  return (<><Head icon={WalletIcon} title="Creator Wallet & Earnings" sub="Manage earnings, payouts and creator revenue" />
    <div className="stats"><Stat icon={BarChart3} label="Total Earnings" value="$0.00" /><Stat icon={WalletIcon} tone="green" label="Available Balance" value="$0.00" /><Stat icon={Clock} tone="purple" label="Pending Amount" value="$0.00" /><Stat icon={DollarSign} tone="amber" label="Total Payouts" value="$0.00" /></div>
    <Panel icon={Building2} title="Payout Options"><div className="grid3">{[["PayPal", 50, "#1d4ed8"], ["Bank Transfer", 100, "#7c3aed"], ["Gift Card", 25, "#15803d"]].map(([n, m, c]) => <div key={n} className="payc" style={{ background: c }}><b>{n}</b><small>Min: ${m}</small><button onClick={() => alert("Balance $" + m + " se kam hai.")}>Request Payout</button></div>)}</div></Panel>
    <Panel title="Recent Transactions"><p className="note">Abhi koi transaction nahi. Kamai ka system server par jurna baqi hai.</p></Panel></>);
}

export function Processing() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  return (<><Head icon={RefreshCw} title="Video Processing" sub="Your videos are being processed. This may take a few minutes." />
    <div className="stats"><Stat icon={Video} label="Total Uploads" value={v.length} /><Stat icon={RefreshCw} tone="purple" label="Processing Now" value="0" /><Stat icon={CheckCircle2} tone="green" label="Completed" value={v.length} /></div>
    <Panel icon={RefreshCw} title={"Processing Queue (0)"}><p className="note">Abhi koi video process nahi ho rahi. Naya upload yahan nazar aayega.</p></Panel>
    <Panel title="Processed Videos">{v.length ? v.map((x) => <div key={x._id} className="trow"><div className="mini">{x.thumbnailUrl && <img src={x.thumbnailUrl} alt="" />}</div><span><b>{x.title}</b><small className="dim">{dur(x.duration)}</small></span><em className="okb">Done</em></div>) : <p className="empty">Abhi video nahi.</p>}</Panel>
    <Panel icon={Lightbulb} title="Tips for Faster Processing"><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Use supported video formats (MP4, MOV)</p><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Keep file size under 2GB</p><p className="lg"><CheckCircle2 size={16} color="#22d36b" /> Ensure good internet connection</p></Panel></>);
}
