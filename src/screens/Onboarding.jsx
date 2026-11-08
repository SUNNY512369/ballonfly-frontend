import { useState } from "react";
import { PlayCircle, Mic, Gift, ArrowRight } from "lucide-react";

const PAGES = [
  { icon: PlayCircle, a: "Discover", b: "Amazing Videos", t: "Explore a world of entertainment from creators around the globe." },
  { icon: Mic, a: "Create & Grow", b: "Your Channel", t: "Upload, edit and share your content with the world." },
  { icon: Gift, a: "Enjoy More", b: "With Ballonfly", t: "Go Live, get gifts, join PK battles and enjoy exclusive rewards." },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const p = PAGES[i], Icon = p.icon, last = i === PAGES.length - 1;
  return (
    <main className="dark-screen ob">
      <button className="skip" onClick={onDone}>Skip</button>
      <div className="orb"><Icon size={86} color="#00e5ff" strokeWidth={1.5} /></div>
      <h1>{p.a}<em>{p.b}</em></h1>
      <p>{p.t}</p>
      <div className="dots">{PAGES.map((_, n) => <i key={n} className={n === i ? "on" : ""} />)}</div>
      <button className="btn-main" onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? "Get Started" : "Next"} <ArrowRight size={18} style={{ verticalAlign: "-3px" }} />
      </button>
    </main>
  );
}
