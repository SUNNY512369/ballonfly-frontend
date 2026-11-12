import { useState, useEffect } from "react";
import { Home, Zap, Plus, MonitorPlay, Library, Search, Bell, Menu, ArrowLeft } from "lucide-react";
import { api } from "../lib/api.js";
import Logo from "./Logo.jsx";
import Avatar from "./Avatar.jsx";

const TABS = [["home", Home, "Home"], ["shorts", Zap, "Shorts"], ["upload", Plus, ""], ["subs", MonitorPlay, "Subscriptions"], ["library", Library, "Library"]];
const MENU = [["Account", [["profile", "Profile"], ["playlists", "Playlists"], ["settings", "Settings"]]], ["Studio", [["analytics", "Analytics"], ["monetization", "Monetization"], ["wallet", "Creator Wallet"], ["processing", "Video Processing"], ["editor", "Video Editing"]]], ["Coins & Live", [["coins", "Coin Purchase & Gifts"], ["pk", "Live PK Battle"], ["multi", "Multi-Guest Live"]]], ["Admin", [["admin", "Dashboard"], ["users", "User Management"], ["reports", "Reports & Moderation"]]]];

export default function Shell({ view, go, session, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [me, setMe] = useState({});
  useEffect(() => {
    api("/users/me/profile").then((d) => setMe(d.profile || {})).catch(() => {});
    const f = (e) => setMe((m) => ({ ...m, avatarUrl: e.detail }));
    window.addEventListener("bf-avatar", f); return () => window.removeEventListener("bf-avatar", f);
  }, []);
  useEffect(() => { api("/notifications").then((d) => setUnread(((d.notifications || (Array.isArray(d) ? d : [])).filter((n) => !n.read)).length)).catch(() => {}); }, [view]);
  const home = view === "home";
  return (
    <div className="shell">
      <header className="top">
        <button className="ghost" aria-label="Menu" onClick={() => setOpen(true)}><Menu size={26} /></button>
        {!home && <button className="ghost" aria-label="Back" onClick={() => go("home")}><ArrowLeft size={24} /></button>}
        <button className="ghost" onClick={() => go("home")}><Logo height={34} /></button>
        {home ? <button className="spill" onClick={() => go("search")}><span>Search videos, channels...</span><Search size={18} /></button> : <div style={{ flex: 1 }} />}
        {!home && <button className="ghost" aria-label="Search" onClick={() => go("search")}><Search size={22} /></button>}
        <button className="ghost" aria-label="Notifications" onClick={() => go("notifications")}><Bell size={23} />{unread > 0 && <em className="dot">{unread > 9 ? "9+" : unread}</em>}</button>
        <button className="ghost" aria-label="Profile" onClick={() => go("profile")}><Avatar name={session.user.displayName} src={me.avatarUrl} size={34} className="ringc" /></button>
      </header>
      {open && (<div className="menu" onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()}>
        <p className="who">{session.user.displayName}</p>
        {MENU.filter(([g]) => g !== "Admin" || me.isAdmin).map(([g, items]) => (<div key={g}><small>{g}</small>{items.map(([k, l]) => <button key={k} onClick={() => { go(k === "playlists" ? "profile" : k, k === "playlists" ? { tab: "playlists" } : {}); setOpen(false); }}>{l}</button>)}</div>))}
        <button className="out" onClick={onLogout}>Log Out</button></div></div>)}
      <section className="body">{children}</section>
      <nav className="bottom">
        {TABS.map(([k, Icon, label]) => (
          <button key={k} className={(view === k ? "on " : "") + (k === "upload" ? "plus" : "")} onClick={() => go(k)} aria-label={label || "Create"}>
            <Icon size={k === "upload" ? 26 : 21} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
