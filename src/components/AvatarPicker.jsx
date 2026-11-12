import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Avatar from "./Avatar.jsx";
import { uploadAvatar } from "../lib/avatar.js";

export default function AvatarPicker({ name, src, onChange, size = 84 }) {
  const ref = useRef(); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const pick = async (e) => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; setBusy(true); setErr(""); try { onChange(await uploadAvatar(f)); } catch (x) { setErr(x.message); } finally { setBusy(false); } };
  return (<div className="apick"><div style={{ position: "relative" }}><Avatar name={name} src={src} size={size} className="ringc" /><button type="button" className="cam" aria-label="Change photo" onClick={() => ref.current.click()}>{busy ? "…" : <Camera size={16} />}</button></div>
    <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />{err && <small style={{ color: "#ff6b81" }}>{err}</small>}</div>);
}
