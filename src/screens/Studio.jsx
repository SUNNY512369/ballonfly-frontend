import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { views, dur } from "../lib/fmt.js";
import { Head, Stat, Panel, Demo } from "../components/Ui.jsx";
import VideoCard from "../components/VideoCard.jsx";

const useMine = () => { const [v, setV] = useState(null); useEffect(() => { api("/videos/mine").then((d) => setV(d.videos || [])).catch(() => setV([])); }, []); return v; };

export function Analytics() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  const sum = (k) => v.reduce((a, x) => a + (x[k] || 0), 0), max = Math.max(1, ...v.map((x) => x.views || 0));
  return (<><Head title="Analytics" sub="Track your performance and grow your audience" />
    <div className="stats"><Stat label="Views" value={views(sum("views"))} /><Stat label="Likes" value={views(sum("likesCount"))} tone="green" /><Stat label="Comments" value={views(sum("commentsCount"))} tone="purple" /></div>
    <Panel title="Views per video">{v.length ? v.map((x) => (<div key={x._id} className="brow"><span>{x.title}</span><div className="bar"><i style={{ width: ((x.views || 0) / max) * 100 + "%" }} /></div><b>{views(x.views)}</b></div>)) : <p className="empty">Abhi video nahi.</p>}</Panel>
    <Panel title="Top Videos">{[...v].sort((a, b) => b.views - a.views).slice(0, 3).map((x) => <VideoCard key={x._id} v={x} go={() => {}} row />)}</Panel></>);
}

export function Monetization() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  const tv = v.reduce((a, x) => a + (x.views || 0), 0), hrs = Math.round(v.reduce((a, x) => a + (x.views || 0) * (x.duration || 0), 0) / 3600);
  const Bar = ({ l, a, b }) => (<div className="brow"><span>{l}</span><div className="bar"><i style={{ width: Math.min(100, (a / b) * 100) + "%" }} /></div><b>{views(a)} / {views(b)}</b></div>);
  return (<><Head title="Monetization" sub="Turn your passion into real earnings" />
    <Panel title="Eligibility Progress"><Bar l="Total Views" a={tv} b={1000000} /><Bar l="Watch Hours (andaza)" a={hrs} b={4000} />
      <p className="note">{tv >= 1000000 && hrs >= 4000 ? "Aap eligible hain!" : "Eligible hone ke liye 1M views aur 4,000 watch hours chahiye."}</p></Panel>
    <Panel title="Payout Information"><p className="note">Min. payout: $100. Earnings ka system abhi connect nahi.</p></Panel></>);
}

export function Wallet() {
  const tx = [["Nov 24", "Ad Revenue", "+$523.75"], ["Nov 22", "Super Chat", "+$180.00"], ["Nov 20", "Payout Request", "-$3,000.00"], ["Nov 18", "Membership Fee", "+$299.00"]];
  return (<><Head title="Creator Wallet & Earnings" sub="Manage earnings, payouts and creator revenue" />
    <div className="stats"><Stat label="Total Earnings" value="$12,480.75" /><Stat label="Available Balance" value="$8,320.50" tone="green" /><Stat label="Pending" value="$3,160.25" tone="purple" /><Stat label="Total Payouts" value="$24,780.00" tone="amber" /></div>
    <Panel title="Payout Options">{[["PayPal", 50], ["Bank Transfer", 100], ["Gift Card", 25]].map(([n, m]) => <div key={n} className="brow"><span>{n} (Min: ${m})</span><button className="pill" style={{ height: 38 }}>Request Payout</button></div>)}</Panel>
    <Panel title="Recent Transactions">{tx.map((t) => <div key={t[0] + t[1]} className="brow"><span>{t[0]} • {t[1]}</span><b style={{ color: t[2][0] === "+" ? "var(--green)" : "var(--red)" }}>{t[2]}</b></div>)}</Panel><Demo /></>);
}

export function Processing() {
  const v = useMine(); if (!v) return <p className="empty">Loading...</p>;
  return (<><Head title="Video Processing" sub="Your videos are being processed. This may take a few minutes." />
    <div className="stats"><Stat label="Total Uploads" value={v.length} /><Stat label="Completed" value={v.length} tone="green" /><Stat label="Processing Now" value="0" tone="purple" /></div>
    <Panel title="Processed Videos">{v.length ? v.map((x) => <div key={x._id} className="brow"><span>{x.title} ({dur(x.duration)})</span><b style={{ color: "var(--green)" }}>Done</b></div>) : <p className="empty">Abhi video nahi.</p>}</Panel></>);
}
