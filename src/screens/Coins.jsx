import { useState } from "react";
import { Gift, ShieldCheck, Coins as CoinsI } from "lucide-react";
import { Head, Panel, Demo } from "../components/Ui.jsx";
import g_rose from "../assets/art/g_rose.png";
import g_star from "../assets/art/g_star.png";
import g_crown from "../assets/art/g_crown.png";
import g_rocket from "../assets/art/g_rocket.png";
import g_panda from "../assets/art/g_panda.png";
import g_car from "../assets/art/g_car.png";
import g_castle from "../assets/art/g_castle.png";
import g_diamond from "../assets/art/g_diamond.png";
import p1 from "../assets/art/p1.png";
import p2 from "../assets/art/p2.png";
import p3 from "../assets/art/p3.png";
import p4 from "../assets/art/p4.png";
import p5 from "../assets/art/p5.png";
import p6 from "../assets/art/p6.png";
import coinHead from "../assets/art/coin_head.png";
const PIMG = [p1, p2, p3, p4, p5, p6];

const PACKS = [[5000, 4.99, "Best Deal"], [10000, 9.99, ""], [25000, 19.99, "Popular"], [50000, 34.99, ""], [100000, 59.99, ""], [200000, 99.99, ""]];
const GIFTS = [["Rose", 10, g_rose], ["Star", 50, g_star], ["Crown", 100, g_crown], ["Rocket", 200, g_rocket], ["Panda", 500, g_panda], ["Sports Car", 1000, g_car], ["Castle", 2000, g_castle], ["Diamond", 5000, g_diamond]];
const load = () => { try { return JSON.parse(localStorage.getItem("bf_coins")) || { coins: 0, log: [], sent: 0 }; } catch { return { coins: 0, log: [], sent: 0 }; } };
export const useCoins = () => { const [s, set] = useState(load); const up = (n) => { set(n); try { localStorage.setItem("bf_coins", JSON.stringify(n)); } catch {} }; return [s, up]; };

export default function Coins() {
  const [s, up] = useCoins(); const [pick, setPick] = useState(null); const [msg, setMsg] = useState(""); const [tab, setTab] = useState("All");
  const buy = ([c, p]) => up({ ...s, coins: s.coins + c, log: [["Purchased", "+" + c, "$" + p], ...s.log].slice(0, 20) });
  const send = () => { if (!pick) return setMsg("Gift chunein"); if (s.coins < pick[1]) return setMsg("Coins kam hain"); up({ ...s, coins: s.coins - pick[1], sent: (s.sent || 0) + 1, log: [["Sent " + pick[0], "-" + pick[1], ""], ...s.log].slice(0, 20) }); setMsg(pick[0] + " bhej diya!"); };
  return (<><Head icon={Gift} title="Coin Purchase & Gifts" sub="Buy coins, send gifts and support your favorite creators!" />
    <div className="balcard"><img className="coinpile" src={p2} alt="" /><div><small>Your Test Coin Balance</small><h2>{s.coins.toLocaleString()} 🪙</h2></div><button className="pill" onClick={() => { const e = document.querySelector(".pack"); if (e) e.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Add Coins +</button></div>
    <div className="balcard pk2"><img className="coinpile" src={coinHead} alt="" /><div><small>Total Gifts Sent</small><h2>{(s.sent || 0).toLocaleString()} 🎁</h2></div></div>
    <Panel title="Buy Coins"><p className="dim" style={{ marginTop: -6 }}>Choose a package to get more coins</p>
      <div className="grid2">{PACKS.map((p) => <button key={p[0]} className="pack" onClick={() => buy(p)}>{p[2] && <em className={"ptag" + (p[2] === "Popular" ? " r" : "")}>{p[2]}</em>}<img className="packimg" src={PIMG[PACKS.indexOf(p)]} alt="" /><b>{p[0].toLocaleString()}</b><span className="pprice">${p[1]}</span></button>)}</div>
      <p className="note"><ShieldCheck size={14} color="#22d36b" /> Test mode: payment system abhi jura nahi, is liye ye test coins hain (asli paise nahi kat te).</p></Panel>
    <Panel title="Send Gifts"><div className="chips">{["All", "Animated", "Special", "Premium"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="grid4">{GIFTS.map((g) => <button key={g[0]} className={"gift" + (pick && pick[0] === g[0] ? " sel" : "")} onClick={() => setPick(g)}><img src={g[2]} alt="" /><b>{g[0]}</b><small>🪙 {g[1]}</small></button>)}</div>
      <button className="pill main wide" onClick={send}><Gift size={18} /> Send Gift Now</button>{msg && <p style={{ color: "var(--cyan)" }}>{msg}</p>}</Panel>
    <Panel title="Recent Coin Transactions">{s.log.length ? s.log.map((l, i) => <div key={i} className="brow"><span>{l[0]}</span><b style={{ color: l[1][0] === "+" ? "#22d36b" : "#ffb6c1" }}>{l[1]}</b><em className="okb">Completed</em></div>) : <p className="note">Abhi koi transaction nahi.</p>}</Panel>
</>);
}
