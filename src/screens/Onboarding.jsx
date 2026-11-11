import { useState } from "react";
import { Play, Heart, BarChart3, Mic, Coins, Gift, Radio, ArrowRight } from "lucide-react";

function Art({ i }) {
  if (i === 0) return (<div className="art"><div className="phone"><div className="playc"><Play size={34} fill="#fff" /></div><div className="rail"><Heart size={16} /><Heart size={16} /></div></div><span className="fl a"><Play size={26} fill="#00e5ff" color="#00e5ff" /></span><span className="fl b"><Heart size={20} fill="#ff4d79" color="#ff4d79" /></span></div>);
  if (i === 1) return (<div className="art"><div className="bubble"><BarChart3 size={26} color="#00e5ff" /> <span>Grow<br /><b>Your Channel</b></span></div><div className="host"><Mic size={64} color="#00e5ff" strokeWidth={1.4} /></div></div>);
  return (<div className="art"><span className="tagx live">▶ LIVE</span><span className="tagx pkx">PK</span><div className="gift">🎁</div><span className="coin c1">🪙</span><span className="coin c2">🪙</span><span className="coin c3">🪙</span></div>);
}

const PAGES = [
  { a: "Discover", b: "Amazing Videos", t: "Explore a world of entertainment from creators around the globe." },
  { a: "Create & Grow", b: "Your Channel", t: "Upload, edit and share your content with the world." },
  { a: "Enjoy More", b: "With Ballonfly", t: "Go Live, get gifts, join PK battles and enjoy exclusive rewards." },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const p = PAGES[i], last = i === PAGES.length - 1;
  return (
    <main className="dark-screen ob">
      <button className="skip" onClick={onDone}>Skip</button>
      <Art i={i} />
      {last && <div className="icons3"><span><i><Coins size={26} /></i>Coins</span><span><i><Gift size={26} /></i>Gifts</span><span><i><Radio size={26} /></i>Live PK</span></div>}
      <h1>{p.a}<em>{p.b}</em></h1>
      <p>{p.t}</p>
      <div className="dots">{PAGES.map((_, n) => <i key={n} className={n === i ? "on" : ""} />)}</div>
      <button className="btn-main" onClick={() => (last ? onDone() : setI(i + 1))}>{last ? "Get Started" : "Next"} <ArrowRight size={18} style={{ verticalAlign: "-3px" }} /></button>
    </main>
  );
}
