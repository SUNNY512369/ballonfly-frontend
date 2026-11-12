import { useState } from "react";
import ob1 from "../assets/art/ob1.png";
import ob2 from "../assets/art/ob2.png";
import ob3 from "../assets/art/ob3.png";
import { Play, Heart, BarChart3, Mic, Coins, Gift, Radio, ArrowRight } from "lucide-react";

function Art({ i }) { return <img className="obart" src={[ob1, ob2, ob3][i]} alt="" />; }

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
