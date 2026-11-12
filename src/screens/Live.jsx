import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Gift, Gamepad2, Music, Mic2, Star, UserPlus, MonitorUp, Radio, Eye, Heart, Trophy } from "lucide-react";
import { Head, Panel, Stat } from "../components/Ui.jsx";
import { useCoins } from "./Coins.jsx";
import pkTrophy from "../assets/art/pk_trophy.png";
import pkVs from "../assets/art/pk_vs.png";

const z = (n) => String(n).padStart(2, "0");
export function PK() {
  const [a, setA] = useState(0), [b, setB] = useState(0), [t, setT] = useState(0), [run, setRun] = useState(false), [cat, setCat] = useState("Gaming PK"), [c, setC] = useCoins(), [done, setDone] = useState(false);
  useEffect(() => { if (!run) return; const i = setInterval(() => setT((x) => { if (x <= 1) { setRun(false); setDone(true); return 0; } return x - 1; }), 1000); return () => clearInterval(i); }, [run]);
  const start = () => { setA(0); setB(0); setT(90); setDone(false); setRun(true); };
  const gift = (side) => { if (!run) return; if (c.coins < 50) return alert("Coins kam hain. Coin screen se test coins lein."); setC({ ...c, coins: c.coins - 50 }); side ? setB(b + 50) : setA(a + 50); };
  const pa = a + b ? Math.round((a / (a + b)) * 100) : 50;
  return (<><Head icon={Trophy} title="Live PK Battle" sub="Practice mode: dono taraf aap khud gift bhej kar khelte hain" />
    <img className="pktrophy" src={pkTrophy} alt="" />
    <div className="chips">{["Gaming PK", "Music PK", "Talk PK", "Talent PK"].map((x) => <button key={x} className={x === cat ? "on" : ""} onClick={() => !run && setCat(x)}>{x}</button>)}</div>
    <div className="pk"><span className="livetag">{run ? "● LIVE" : done ? "FINISHED" : "READY"}</span>
      <div className="pkh"><div className="pka"><span className="crwn">{done && a > b ? "👑" : ""}</span><i className="pkav">Y</i><b>You</b><h2>🔥 {a}</h2></div><img className="vsimg" src={pkVs} alt="VS" /><div className="pka"><span className="crwn">{done && b > a ? "👑" : ""}</span><i className="pkav g">O</i><b>Opponent</b><h2>🔥 {b}</h2></div></div>
      <div className="pkbar"><i style={{ width: pa + "%" }} /><em>{pa}% &nbsp;&nbsp;&nbsp; {100 - pa}%</em></div>
      <p className="dim" style={{ textAlign: "center" }}>{cat} • Battle Time <b style={{ color: "#fff", fontSize: 22 }}>{Math.floor(t / 60)}:{z(t % 60)}</b></p>
      {run ? <div className="wiz-nav"><button className="pill main" onClick={() => gift(0)}><Gift size={18} /> Gift You</button><button className="pill main" style={{ background: "linear-gradient(90deg,#ff2e7e,#c45bff)", color: "#fff" }} onClick={() => gift(1)}><Gift size={18} /> Gift Opponent</button></div> : <button className="pill main wide" onClick={start}>{done ? "Dobara Battle" : "Start Battle"}</button>}
      {done && <p style={{ textAlign: "center" }}>{a === b ? "Barabar rahi!" : a > b ? "Aap jeet gaye 🎉" : "Opponent jeet gaya"}</p>}</div>
    <p className="note">Har gift 50 test coins leta hai. Asli multi-user PK ke liye live streaming server chahiye.</p></>);
}

export function MultiGuest() {
  const vref = useRef(), sref = useRef(null);
  const [live, setLive] = useState(false), [mic, setMic] = useState(true), [cam, setCam] = useState(true), [sec, setSec] = useState(0), [err, setErr] = useState(""), [msgs, setM] = useState([]), [t, setT] = useState(""), [note, setNote] = useState("");
  const stop = () => { if (sref.current) { sref.current.getTracks().forEach((x) => x.stop()); sref.current = null; } if (vref.current) vref.current.srcObject = null; };
  useEffect(() => { if (!live) return; const i = setInterval(() => setSec((x) => x + 1), 1000); return () => clearInterval(i); }, [live]);
  useEffect(() => () => stop(), []);
  const start = async () => { setErr(""); try { const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); sref.current = s; vref.current.srcObject = s; setLive(true); setSec(0); setMic(true); setCam(true); } catch { setErr("Camera ya mic ki ijazat nahi mili, ya device nahi mila."); } };
  const end = () => { stop(); setLive(false); };
  const tgl = (kind, set, val) => { const s = sref.current; if (!s) return; (kind === "a" ? s.getAudioTracks() : s.getVideoTracks()).forEach((x) => (x.enabled = !val)); set(!val); };
  const share = async () => { try { const d = await navigator.mediaDevices.getDisplayMedia({ video: true }); if (vref.current) vref.current.srcObject = d; d.getVideoTracks()[0].onended = () => { if (vref.current && sref.current) vref.current.srcObject = sref.current; }; } catch {} };
  const invite = () => { const url = location.origin; if (navigator.share) navigator.share({ title: "Ballonfly Live", url }).catch(() => {}); else if (navigator.clipboard) navigator.clipboard.writeText(url); setNote("Link share ho gaya. Asli guests ko jodne ke liye live server chahiye."); };
  const ctl = [[mic ? Mic : MicOff, mic ? "Mute" : "Unmute", () => tgl("a", setMic, mic)], [cam ? Video : VideoOff, cam ? "Stop Video" : "Start Video", () => tgl("v", setCam, cam)], [UserPlus, "Invite Guest", invite], [MonitorUp, "Share Screen", share]];
  return (<><div className="livebar"><span className="livetag">● {live ? "LIVE" : "OFFLINE"}</span>{live && <span>{z(Math.floor(sec / 60))}:{z(sec % 60)}</span>}</div>
    <Head title="Multi-Guest Live" sub="Apna camera aur mic chala kar live ho jayein" />
    <div className="tile host" style={{ aspectRatio: "16/9", display: "block" }}><video ref={vref} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: live ? "block" : "none" }} />{!live && <div style={{ display: "grid", placeItems: "center", height: "100%" }}><span className="dim">Camera band hai</span></div>}</div>
    {err && <p style={{ color: "#ff6b81" }}>{err}</p>}
    <div className="ctls">{live && ctl.map(([I, l, f]) => <button key={l} onClick={f}><I size={22} /><span>{l}</span></button>)}{live ? <button className="golive" style={{ background: "#dc2626" }} onClick={end}><Radio size={18} /> End Live</button> : <button className="golive" onClick={start}><Radio size={18} /> Go Live</button>}</div>
    {note && <p className="note">{note}</p>}
    <Panel title="Live Statistics"><div className="stats"><Stat icon={Eye} label="Viewers" value="0" /><Stat icon={Heart} tone="purple" label="Likes" value="0" /><Stat icon={Gift} tone="amber" label="Gifts" value="0" /><Stat icon={Radio} tone="green" label="Duration" value={z(Math.floor(sec / 3600)) + ":" + z(Math.floor((sec % 3600) / 60)) + ":" + z(sec % 60)} /></div></Panel>
    <Panel title="Live Chat (sirf aap ke liye)">{msgs.map((m, i) => <p key={i}><b>You</b> {m}</p>)}<div className="cbox"><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Type a message..." /><button onClick={() => { if (t.trim()) { setM([...msgs, t]); setT(""); } }}>Send</button></div></Panel></>);
}
