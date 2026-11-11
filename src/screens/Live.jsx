import { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Gift, Gamepad2, Music, Mic2, Star, UserPlus, MonitorUp, Settings as Cog, Radio, Eye, Heart, Trophy } from "lucide-react";
import { Head, Panel, Demo, Stat } from "../components/Ui.jsx";
import { useCoins } from "./Coins.jsx";

export function PK() {
  const [a, setA] = useState(238500), [b, setB] = useState(241700), [t, setT] = useState(88), [c, setC] = useCoins(), [nx, setNx] = useState(765);
  useEffect(() => { const i = setInterval(() => { setT((x) => (x > 0 ? x - 1 : 0)); setNx((x) => (x > 0 ? x - 1 : 0)); setA((x) => x + Math.floor(Math.random() * 400)); setB((x) => x + Math.floor(Math.random() * 400)); }, 1000); return () => clearInterval(i); }, []);
  const gift = (side) => { if (c.coins < 50) return alert("Coins kam hain"); setC({ ...c, coins: c.coins - 50 }); side ? setB(b + 5000) : setA(a + 5000); };
  const pa = Math.round((a / (a + b)) * 100), z = (n) => String(n).padStart(2, "0");
  return (<><Head icon={Trophy} title="Live PK Battle" sub="Go head-to-head, win gifts and earn more!" />
    <div className="nextb"><small>Next Battle Starts In:</small><b>{z(Math.floor(nx / 3600))} : {z(Math.floor((nx % 3600) / 60))} : {z(nx % 60)}</b><small>Hrs &nbsp;&nbsp; Min &nbsp;&nbsp; Sec</small></div>
    <div className="pk"><span className="livetag">● LIVE</span>
      <div className="pkh"><div className="pka"><span className="crwn">👑</span><i className="pkav">S</i><b>Sarah Queen</b><h2>🔥 {a.toLocaleString()}</h2></div><span className="vs">VS</span><div className="pka"><span className="crwn">👑</span><i className="pkav g">G</i><b>GamingPro</b><h2>🔥 {b.toLocaleString()}</h2></div></div>
      <div className="pkbar"><i style={{ width: pa + "%" }} /><em>{pa}% &nbsp;&nbsp;&nbsp;&nbsp; {100 - pa}%</em></div>
      <p className="dim" style={{ textAlign: "center" }}>Battle Time <b style={{ color: "#fff", fontSize: 22 }}>{Math.floor(t / 60)}:{z(t % 60)}</b></p>
      <div className="wiz-nav"><button className="pill main" onClick={() => gift(0)}><Gift size={18} /> Gift Sarah</button><button className="pill main" style={{ background: "linear-gradient(90deg,#ff2e7e,#c45bff)", color: "#fff" }} onClick={() => gift(1)}><Gift size={18} /> Gift Gaming</button></div></div>
    <Panel icon={Trophy} title="Daily Rank">{[["DreamerKing", "12.5M"], ["Sarah Queen", "10.8M"], ["GamingPro", "9.7M"], ["TechMaster", "8.3M"], ["PrincessLive", "7.9M"]].map((r, i) => <div key={r[0]} className="brow"><span>{i < 3 ? "👑" : i + 1 + "."} {r[0]}</span><b>🎁 {r[1]}</b></div>)}</Panel>
    <Panel title="PK Statistics"><div className="stats"><Stat icon={Trophy} label="Total Battles" value="1,248" /><Stat icon={Star} tone="amber" label="Total Winners" value="642" /><Stat icon={Gift} tone="purple" label="Total Gifts" value="18.5M" /><Stat icon={Star} tone="green" label="Total Earnings" value="$12,430" /></div></Panel>
    <Panel title="Battle Categories"><div className="grid4 cats">{[[Gamepad2, "Gaming PK", "#2563eb"], [Music, "Music PK", "#8a42ff"], [Mic2, "Talk PK", "#5b3df5"], [Star, "Talent PK", "#b8860b"]].map(([I, n, c]) => <div key={n} style={{ background: c }}><I size={30} /><b>{n}</b></div>)}</div></Panel><Demo /></>);
}

export function MultiGuest() {
  const [g, setG] = useState(["Sarah Queen", "GamingPro", "TechMaster", "PrincessLive", "DreamerKing"].map((n) => ({ n, mic: true, cam: true })));
  const [live, setLive] = useState(true), [sec, setSec] = useState(5057), [msgs, setM] = useState([["DreamerGirl", "This is amazing! 🔥"], ["TechLover", "Love this multi live! ❤️"], ["GamingFan", "Can more guests join?"]]), [t, setT] = useState("");
  useEffect(() => { if (!live) return; const i = setInterval(() => setSec((x) => x + 1), 1000); return () => clearInterval(i); }, [live]);
  const tg = (i, k) => setG(g.map((x, j) => (j === i ? { ...x, [k]: !x[k] } : x))), z = (n) => String(n).padStart(2, "0");
  const me = g[0], ctl = [[me.mic ? Mic : MicOff, me.mic ? "Mute" : "Unmute", () => tg(0, "mic")], [me.cam ? Video : VideoOff, me.cam ? "Stop Video" : "Start Video", () => tg(0, "cam")], [UserPlus, "Invite Guest", () => g.length < 6 && setG([...g, { n: "Guest" + (g.length + 1), mic: true, cam: true }])], [MonitorUp, "Share Screen", () => {}], [Cog, "Settings", () => {}]];
  return (<><div className="livebar"><span className="livetag">● {live ? "LIVE" : "ENDED"}</span><span><Eye size={16} /> 12.5K</span><button className="pill" style={{ height: 38, marginLeft: "auto", color: "#ff6b81" }} onClick={() => setLive(false)}>End Live</button></div>
    <Head title="Multi-Guest Live" sub="Invite up to 6 guests for an amazing live session!" />
    <div className="mg"><div className="tile host"><i className="pkav">{me.n[0]}</i><b>👑 Host • {me.n}</b></div>{g.slice(1).map((x, i) => <div key={x.n} className="tile"><i className="pkav g">{x.n[0]}</i><b>{x.mic ? <Mic size={13} /> : <MicOff size={13} color="#ff6b81" />} {x.n}</b></div>)}</div>
    <div className="ctls">{ctl.map(([I, l, f]) => <button key={l} onClick={f}><I size={24} /><span>{l}</span></button>)}<button className="golive" onClick={() => setLive(true)}><Radio size={20} /> Go Live</button></div>
    <Panel title="Live Statistics"><div className="stats"><Stat icon={Eye} label="Viewers" value="12.5K" /><Stat icon={Heart} tone="purple" label="Likes" value="245.8K" /><Stat icon={Gift} tone="amber" label="Gifts" value="98.7K" /><Stat icon={Eye} tone="green" label="Duration" value={z(Math.floor(sec / 3600)) + ":" + z(Math.floor((sec % 3600) / 60)) + ":" + z(sec % 60)} /></div></Panel>
    <Panel title={"Guest List (" + g.length + "/6)"}><div className="guests">{g.map((x) => <span key={x.n}><i className="pkav g sm">{x.n[0]}</i><small>{x.n}</small></span>)}</div></Panel>
    <Panel title="Live Chat">{msgs.map((m, i) => <p key={i}><b>{m[0]}</b> {m[1]}</p>)}<div className="cbox"><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message..." /><button onClick={() => { if (t.trim()) { setM([...msgs, ["You", t]]); setT(""); } }}>Send</button></div></Panel><Demo /></>);
}
