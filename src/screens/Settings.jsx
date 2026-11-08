import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Head, Panel } from "../components/Ui.jsx";

export default function Settings() {
  const [f, setF] = useState(null);
  const [cs, setCs] = useState([]);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  useEffect(() => { api("/users/me/profile").then((d) => setF(d.profile)).catch(() => setF({})); api("/countries").then((d) => setCs(d.countries || (Array.isArray(d) ? d : []))).catch(() => {}); }, []);
  if (!f) return <p className="empty">Loading...</p>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => { try { await api("/users/me", { method: "PATCH", body: { channelName: f.channelName, firstName: f.firstName, lastName: f.lastName, bio: f.bio, country: f.country } }); setMsg("Save ho gaya"); } catch (e) { setMsg(e.message); } };
  const chPw = async () => { try { await api("/users/me/password", { method: "POST", body: pw }); setPw({ currentPassword: "", newPassword: "" }); setMsg("Password badal gaya"); } catch (e) { setMsg(e.message); } };
  return (<>
    <Head title="Settings" sub="Manage your channel preferences and settings" />
    <Panel title="General Settings">
      <label className="lbl">Channel Name</label><input className="in" value={f.channelName || ""} onChange={set("channelName")} />
      <label className="lbl">First Name</label><input className="in" value={f.firstName || ""} onChange={set("firstName")} />
      <label className="lbl">Last Name</label><input className="in" value={f.lastName || ""} onChange={set("lastName")} />
      <label className="lbl">Channel Description <span>{(f.bio || "").length}/200</span></label><textarea className="in" rows={3} maxLength={200} value={f.bio || ""} onChange={set("bio")} />
      <label className="lbl">Channel Location</label>
      <select className="in" value={f.country || ""} onChange={set("country")}><option value="">-</option>{cs.map((c) => <option key={c.code || c.cca2} value={c.code || c.cca2}>{c.name}</option>)}</select>
      <button className="pill main wide" onClick={save}>Save Changes</button>
    </Panel>
    <Panel title="Change Password">
      <input className="in" type="password" placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
      <input className="in" style={{ marginTop: 10 }} type="password" placeholder="New password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
      <button className="pill wide" onClick={chPw}>Update Password</button>
    </Panel>
    {msg && <p style={{ color: "var(--cyan)" }}>{msg}</p>}
  </>);
}
