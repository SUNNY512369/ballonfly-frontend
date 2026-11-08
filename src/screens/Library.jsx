import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import VideoCard from "../components/VideoCard.jsx";

const TABS = [["history", "History", "/videos/history"], ["liked", "Liked", "/videos/liked"], ["saved", "Saved", "/videos/saved"], ["mine", "Your Videos", "/videos/mine"]];
export default function Library({ go }) {
  const [t, setT] = useState("history");
  const [list, setList] = useState(null);
  useEffect(() => { setList(null); api(TABS.find((x) => x[0] === t)[2]).then((d) => setList(d.videos || [])).catch(() => setList([])); }, [t]);
  return (
    <>
      <div className="chips">{TABS.map(([k, l]) => <button key={k} className={k === t ? "on" : ""} onClick={() => setT(k)}>{l}</button>)}</div>
      {list === null ? <p className="empty">Loading...</p> : list.length ? list.map((v) => <VideoCard key={v._id} v={v} go={go} row />) : <p className="empty">Yahan abhi kuch nahi.</p>}
    </>
  );
}
