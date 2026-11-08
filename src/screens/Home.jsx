import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import VideoCard from "../components/VideoCard.jsx";

export default function Home({ go }) {
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState("");
  const [list, setList] = useState(null);
  useEffect(() => { api("/videos/meta").then((d) => setCats(d.categories || [])).catch(() => {}); }, []);
  useEffect(() => {
    setList(null);
    api("/videos" + (cat ? "?category=" + encodeURIComponent(cat) : "")).then((d) => setList(d.videos)).catch(() => setList([]));
  }, [cat]);
  return (
    <>
      <div className="chips">{["", ...cats].map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c || "All"}</button>)}</div>
      {list === null ? <p className="empty">Loading...</p> : list.length === 0 ? <p className="empty">Abhi koi video nahi. + dabakar pehla video upload karein.</p> : list.map((v) => <VideoCard key={v._id} v={v} go={go} />)}
    </>
  );
}
