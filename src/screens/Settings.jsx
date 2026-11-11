import { useEffect, useState } from "react";
import { Settings as Cog, Check, Upload, Globe, Megaphone, ExternalLink } from "lucide-react";
import { api } from "../lib/api.js";
import { Head, Panel } from "../components/Ui.jsx";

const lget = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export default function Settings() {
  const [f, setF] = useState(null); const [cs, setCs] = useState([]); const [pw, setPw] = useState({ currentPassword: "", newPassword: "" }); const [msg, setMsg] = useState("");
  const [loc, setLoc] = useState(() => lget("bf_settings", { privacy: "Public", autotags: true, lang: "English (United States)", ads: true }));
  useEffect(() => { api("/users/me/profile").then((d) => setF(d.profile)).catch(() => setF({})); api("/countries").then((d) => setCs(d.countries || (Array.isArray(d) ? d : []))).catch(() => {}); }, []);
  if (!f) return <p className="empty">Loading...</p>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => { try { await api("/users/me", { method: "PATCH", body: { channelName: f.channelName, firstName: f.firstName, lastName: f.lastName, bio: f.bio, country: f.country } }); try { localStorage.setItem("bf_settings", JSON.stringify(loc)); } catch {} setMsg("Save ho gaya ✓"); } catch (e) { setMsg(e.message); } };
  const chPw = async () => { try { await api("/users/me/password", { method: "POST", body: pw }); setPw({ currentPassword: "", newPassword: "" }); setMsg("Password badal gaya ✓"); } catch (e) { setMsg(e.message); } };
  return (<><Head icon={Cog} title="Settings" sub="Manage your channel preferences and settings" />
    <button className="pill main wide" onClick={save}>Save Changes <Check size={18} /></button>{msg && <p style={{ color: "var(--cyan)", margin: 0 }}>{msg}</p>}
    <Panel icon={Cog} title="General Settings">
      <label className="lbl">Channel Name</label><input className="in" value={f.channelName || ""} onChange={set("channelName")} /><small className="dim">This name will appear on your channel.</small>
      <label className="lbl">Channel Handle</label><div className="in handle"><span>@</span><b>{f.username}</b><Check size={18} color="#22d36b" /></div>
      <label className="lbl">First Name</label><input className="in" value={f.firstName || ""} onChange={set("firstName")} />
      <label className="lbl">Last Name</label><input className="in" value={f.lastName || ""} onChange={set("lastName")} /></Panel>
    <Panel title="Channel Description"><textarea className="in" rows={3} maxLength={200} value={f.bio || ""} onChange={set("bio")} /><small className="dim" style={{ float: "right" }}>{(f.bio || "").length}/200</small></Panel>
    <Panel icon={Upload} title="Default Upload Settings"><label className="lbl">Default Privacy</label><select className="in" value={loc.privacy} onChange={(e) => setLoc({ ...loc, privacy: e.target.value })}><option>Public</option><option>Private</option><option>Unlisted</option></select>
      <label className="tog"><span>Add Tags Automatically</span><input type="checkbox" checked={loc.autotags} onChange={(e) => setLoc({ ...loc, autotags: e.target.checked })} /></label></Panel>
    <Panel icon={Globe} title="Language & Location"><label className="lbl">Channel Language</label><select className="in" value={loc.lang} onChange={(e) => setLoc({ ...loc, lang: e.target.value })}><option>English (United States)</option><option>Urdu</option><option>Hindi</option><option>Arabic</option></select>
      <label className="lbl">Channel Location</label><select className="in" value={f.country || ""} onChange={set("country")}><option value="">-</option>{cs.map((c) => <option key={c.code || c.cca2} value={c.code || c.cca2}>{c.name}</option>)}</select></Panel>
    <Panel icon={Megaphone} title="Advertisements"><label className="tog"><span>Allow Advertisements<br /><small className="dim">Monetize your videos with ads.</small></span><input type="checkbox" checked={loc.ads} onChange={(e) => setLoc({ ...loc, ads: e.target.checked })} /></label></Panel>
    <Panel title="Change Password"><input className="in" type="password" placeholder="Current password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /><input className="in" style={{ marginTop: 10 }} type="password" placeholder="New password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /><button className="pill wide" onClick={chPw}>Update Password</button></Panel>
    <p className="note">Privacy, Language aur Ads ki choices abhi sirf is phone mein save hoti hain.</p></>);
}
