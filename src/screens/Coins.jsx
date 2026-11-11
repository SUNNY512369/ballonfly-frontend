import { useState } from "react";
import { Gift, ShieldCheck, Coins as CoinsI } from "lucide-react";
import { Head, Panel, Demo } from "../components/Ui.jsx";

const PACKS = [[5000, 4.99, "Best Deal"], [10000, 9.99, ""], [25000, 19.99, "Popular"], [50000, 34.99, ""], [100000, 59.99, ""], [200000, 99.99, ""]];
const GIFTS = [["Rose", 10, "🌹"], ["Star", 50, "⭐"], ["Crown", 100, "👑"], ["Rocket", 200, "🚀"], ["Panda", 500, "🐼"], ["Sports Car", 1000, "🏎️"], ["Castle", 2000, "🏰"], ["Diamond", 5000, "💎"]];
const load = () => { try { return JSON.parse(localStorage.getItem("bf_coins")) || { coins: 2850, log: [], sent: 0 }; } catch { return { coins: 2850, log: [], sent: 0 }; } };
export const useCoins = () => { const [s, set] = useState(load); const up = (n) => { set(n); try { localStorage.setItem("bf_coins", JSON.stringify(n)); } catch {} }; return [s, up]; };

export default function Coins() {
  const [s, up] = useCoins(); const [pick, setPick] = useState(null); const [msg, setMsg] = useState(""); const [tab, setTab] = useState("All");
  const buy = ([c, p]) => up({ ...s, coins: s.coins + c, log: [["Purchased", "+" + c, "$" + p], ...s.log].slice(0, 20) });
  const send = () => { if (!pick) return setMsg("Gift chunein"); if (s.coins < pick[1]) return setMsg("Coins kam hain"); up({ ...s, coins: s.coins - pick[1], sent: (s.sent || 0) + 1, log: [["Sent " + pick[0] + " (" + pick[2] + ")", "-" + pick[1], ""], ...s.log].slice(0, 20) }); setMsg(pick[2] + " bhej diya!"); };
  return (<><Head icon={Gift} title="Coin Purchase & Gifts" sub="Buy coins, send gifts and support your favorite creators!" />
    <div className="balcard"><span className="coinpile">🪙</span><div><small>Your Coin Balance</small><h2>{s.coins.toLocaleString()} 🪙</h2></div><button className="pill">Add Coins +</button></div>
    <div className="balcard pk2"><span className="coinpile">🎁</span><div><small>Total Gifts Sent</small><h2>{(s.sent || 0).toLocaleString()} 🎁</h2></div></div>
    <Panel title="Buy Coins"><p className="dim" style={{ marginTop: -6 }}>Choose a package to get more coins</p>
      <div className="grid2">{PACKS.map((p) => <button key={p[0]} className="pack" onClick={() => buy(p)}>{p[2] && <em className={"ptag" + (p[2] === "Popular" ? " r" : "")}>{p[2]}</em>}<span style={{ fontSize: 30 }}>🪙</span><b>{p[0].toLocaleString()}</b><span className="pprice">${p[1]}</span></button>)}</div>
      <p className="note"><ShieldCheck size={14} color="#22d36b" /> Secure & trusted payments (PayPal, Visa, Mastercard, Apple Pay, Google Pay). Abhi demo hai, paise nahi kat te.</p></Panel>
    <Panel title="Send Gifts"><div className="chips">{["All", "Animated", "Special", "Premium"].map((t) => <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}</div>
      <div className="grid4">{GIFTS.map((g) => <button key={g[0]} className={"gift" + (pick && pick[0] === g[0] ? " sel" : "")} onClick={() => setPick(g)}><span>{g[2]}</span><b>{g[0]}</b><small>🪙 {g[1]}</small></button>)}</div>
      <button className="pill main wide" onClick={send}><Gift size={18} /> Send Gift Now</button>{msg && <p style={{ color: "var(--cyan)" }}>{msg}</p>}</Panel>
    <Panel title="Recent Coin Transactions">{s.log.length ? s.log.map((l, i) => <div key={i} className="brow"><span>{l[0]}</span><b style={{ color: l[1][0] === "+" ? "#22d36b" : "#ffb6c1" }}>{l[1]}</b><em className="okb">Completed</em></div>) : <p className="note">Abhi koi transaction nahi.</p>}</Panel>
    <Panel title="Gift Activity">{[["Sarah Johnson", "a Rocket", "@Dreamer", "2m ago"], ["Mike Davis", "a Crown", "@GamingPro", "5m ago"], ["Emily Carter", "a Star", "@Creator123", "8m ago"]].map((a) => <div key={a[0]} className="brow"><span>{a[0]} sent {a[1]} to {a[2]}</span><small className="dim">{a[3]}</small></div>)}</Panel><Demo /></>);
}
