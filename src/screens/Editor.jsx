import { useRef, useState } from "react";
import { Head, Panel } from "../components/Ui.jsx";

const FILTERS = [["Original", "none"], ["Glow", "brightness(1.15) saturate(1.3)"], ["Vintage", "sepia(.6) contrast(.9)"], ["Black & White", "grayscale(1)"], ["Cool Tone", "hue-rotate(30deg) saturate(1.2)"], ["Warm", "sepia(.3) saturate(1.4)"]];
export default function Editor() {
  const [src, setSrc] = useState(""); const [fi, setFi] = useState(0); const [sp, setSp] = useState(1); const ref = useRef();
  return (<><Head title="Video Editing" sub="Create stunning videos with powerful editing tools." />
    <input type="file" accept="video/*" className="in" onChange={(e) => e.target.files[0] && setSrc(URL.createObjectURL(e.target.files[0]))} />
    {src && <video ref={ref} className="player" style={{ filter: FILTERS[fi][1], marginTop: 12 }} src={src} controls playsInline />}
    <Panel title="Effects & Filters"><div className="chips wrap">{FILTERS.map((f, i) => <button key={f[0]} className={i === fi ? "on" : ""} onClick={() => setFi(i)}>{f[0]}</button>)}</div></Panel>
    <Panel title="Speed"><div className="chips">{[0.5, 1, 1.5, 2].map((x) => <button key={x} className={x === sp ? "on" : ""} onClick={() => { setSp(x); if (ref.current) ref.current.playbackRate = x; }}>{x}x</button>)}</div></Panel>
    <Panel title="Export Settings">{[["Resolution", ["480p", "720p", "1080p (Full HD)", "1440p (2K)", "2160p (4K)"]], ["Format", ["MP4", "MOV"]], ["Quality", ["High Quality", "Medium", "Low"]], ["Frame Rate", ["30 FPS", "60 FPS"]]].map(([l, o]) => <div key={l}><label className="lbl">{l}</label><select className="in" defaultValue={o[Math.min(2, o.length - 1)]}>{o.map((x) => <option key={x}>{x}</option>)}</select></div>)}<button className="pill main wide" onClick={() => alert("Export abhi nahi hota: ye sirf preview hai.")}>Export Now</button></Panel>
    <Panel title="Timeline">{[["Video", "#2563eb", 95], ["Audio", "#00b8d4", 80], ["Text", "#8a42ff", 55], ["Overlay", "#c45bff", 40]].map(([n, c, w]) => <div key={n} className="brow"><span style={{ flex: "none", width: 60 }}>{n}</span><div className="bar" style={{ flex: 1 }}><i style={{ width: w + "%", background: c }} /></div></div>)}</Panel>
    <p className="note">Ye sirf preview hai: export abhi nahi hota.</p></>);
}
