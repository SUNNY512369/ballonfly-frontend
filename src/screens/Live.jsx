import { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Gift } from "lucide-react";
import { Head, Panel, Demo } from "../components/Ui.jsx";
import { useCoins } from "./Coins.jsx";

export function PK() {
  const [a, setA] = useState(238500), [b, setB] = useState(241700), [t, setT] = useState(88), [c, setC] = useCoins();
  useEffect(() => { const i = setInterval(() => { setT((x) => (x > 0 ? x - 1 : 0)); setA((x) => x + Math.floor(Math.random() * 400)); setB((x) => x + Math.floor(Math.random() * 400)); }, 1000); return () => clearInterval(i); }, []);
  const gift = (side) => { if (c.coins < 50) return alert("Coins kam hain"); setC({ ...c, coins: c.coins - 50 }); side ? setB(b + 5000) : setA(a + 5000); };
  const pa = Math.round((a / (a + b)) * 100);
  return (<><Head title="Live PK Battle" sub="Go head-to-head, win gifts and earn more!" />
    <div className="pk"><div className="pkh"><div><b>Sarah Queen</b><h2>🔥 {a.toLocaleString()}</h2></div><span className="vs">VS</span><div style={{ textAlign: "right" }}><b>GamingPro</b><h2>🔥 {b.toLocaleString()}</h2></div></div>
      <div className="pkbar"><i style={{ width: pa + "%" }} /><em>{pa}%</em></div><p className="dim" style={{ textAlign: "center" }}>Battle Time {Math.floor(t / 60)}:{String(t % 60).padStart(2, "0")}</p>
      <div className="wiz-nav"><button className="pill main" onClick={() => gift(0)}><Gift size={18} /> Gift Sarah (50🪙)</button><button className="pill main" onClick={() => gift(1)}><Gift size={18} /> Gift Gaming (50🪙)</button></div></div>
    <Panel title="Daily Rank">{[["DreamerKing", "12.5M"], ["Sarah Queen", "10.8M"], ["GamingPro", "9.7M"], ["TechMaster", "8.3M"]].map((r, i) => <div key={r[0]} className="brow"><span>{i + 1}. {r[0]}</span><b>🎁 {r[1]}</b></div>)}</Panel><Demo /></>);
}

export function MultiGuest() {
  const [g, setG] = useState(["Sarah Queen", "GamingPro", "TechMaster", "PrincessLive", "DreamerKing"].map((n) => ({ n, mic: true, cam: true })));
  const [msgs, setM] = useState([["DreamerGirl", "This is amazing! 🔥"], ["TechLover", "Love this multi live! ❤️"]]); const [t, setT] = useState("");
  const tg = (i, k) => setG(g.map((x, j) => (j === i ? { ...x, [k]: !x[k] } : x)));
  return (<><Head title="Multi-Guest Live" sub="Invite up to 6 guests for an amazing live session!" />
    <div className="grid2">{g.map((x, i) => (<div key={x.n} className="guest"><div className="av big">{x.n[0]}</div><b>{x.n}{i === 0 && " 👑"}</b>
      <div><button className="ghost" onClick={() => tg(i, "mic")}>{x.mic ? <Mic size={18} /> : <MicOff size={18} color="#ff3b5c" />}</button><button className="ghost" onClick={() => tg(i, "cam")}>{x.cam ? <Video size={18} /> : <VideoOff size={18} color="#ff3b5c" />}</button></div></div>))}</div>
    {g.length < 6 && <button className="pill wide" onClick={() => setG([...g, { n: "Guest" + (g.length + 1), mic: true, cam: true }])}>+ Invite Guest ({g.length}/6)</button>}
    <Panel title="Live Chat">{msgs.map((m, i) => <p key={i}><b>{m[0]}</b> {m[1]}</p>)}<div className="cbox"><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message..." /><button onClick={() => { if (t.trim()) { setM([...msgs, ["You", t]]); setT(""); } }}>Send</button></div></Panel><Demo /></>);
}
