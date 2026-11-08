import { useState } from "react";
import { Head, Panel, Demo } from "../components/Ui.jsx";

const PACKS = [[5000, 4.99], [10000, 9.99], [25000, 19.99], [50000, 34.99], [100000, 59.99], [200000, 99.99]];
const GIFTS = [["Rose", 10, "🌹"], ["Star", 50, "⭐"], ["Crown", 100, "👑"], ["Rocket", 200, "🚀"], ["Panda", 500, "🐼"], ["Sports Car", 1000, "🏎️"], ["Castle", 2000, "🏰"], ["Diamond", 5000, "💎"]];
const load = () => { try { return JSON.parse(localStorage.getItem("bf_coins")) || { coins: 2850, log: [] }; } catch { return { coins: 2850, log: [] }; } };
export const useCoins = () => { const [s, set] = useState(load); const up = (n) => { set(n); try { localStorage.setItem("bf_coins", JSON.stringify(n)); } catch {} }; return [s, up]; };

export default function Coins() {
  const [s, up] = useCoins(); const [pick, setPick] = useState(null); const [msg, setMsg] = useState("");
  const buy = ([c, p]) => up({ coins: s.coins + c, log: [["Purchased", "+" + c, "$" + p], ...s.log].slice(0, 20) });
  const send = () => { if (!pick) return setMsg("Gift chunein"); if (s.coins < pick[1]) return setMsg("Coins kam hain"); up({ coins: s.coins - pick[1], log: [["Sent " + pick[0], "-" + pick[1], ""], ...s.log].slice(0, 20) }); setMsg(pick[2] + " bhej diya!"); };
  return (<><Head title="Coin Purchase & Gifts" sub="Buy coins, send gifts and support your favorite creators!" />
    <div className="stats"><div className="stat blue"><small>Your Coin Balance</small><b>{s.coins.toLocaleString()} 🪙</b></div></div>
    <Panel title="Buy Coins">
      <div className="grid2">{PACKS.map((p) => <button key={p[0]} className="pack" onClick={() => buy(p)}><b>🪙 {p[0].toLocaleString()}</b><span>${p[1]}</span></button>)}</div>
      <p className="note">Payment abhi demo hai: asli paise nahi kate.</p></Panel>
    <Panel title="Send Gifts"><div className="grid4">{GIFTS.map((g) => <button key={g[0]} className={"gift" + (pick && pick[0] === g[0] ? " sel" : "")} onClick={() => setPick(g)}><span>{g[2]}</span><b>{g[0]}</b><small>🪙 {g[1]}</small></button>)}</div>
      <button className="pill main wide" onClick={send}>Send Gift Now</button>{msg && <p style={{ color: "var(--cyan)" }}>{msg}</p>}</Panel>
    <Panel title="Recent Coin Transactions">{s.log.length ? s.log.map((l, i) => <div key={i} className="brow"><span>{l[0]}</span><b>{l[1]}</b></div>) : <p className="note">Abhi koi transaction nahi.</p>}</Panel><Demo /></>);
}
