import { useState, useEffect } from "react";
import { Home, Zap, Plus, MonitorPlay, Library, Search, Bell, ChevronDown, Menu, ArrowLeft } from "lucide-react";
import { api } from "../lib/api.js";
import Logo from "./Logo.jsx";

const TABS = [["home", Home, "Home"], ["shorts", Zap, "Shorts"], ["upload", Plus, ""], ["subs", MonitorPlay, "Subscriptions"], ["library", Library, "Library"]];
const MENU = [["Account", [["profile", "Profile"], ["playlists", "Playlists"], ["settings", "Settings"]]], ["Studio", [["analytics", "Analytics"], ["monetization", "Monetization"], ["wallet", "Creator Wallet"], ["processing", "Video Processing"], ["editor", "Video Editing"]]], ["Coins & Live", [["coins", "Coin Purchase & Gifts"], ["pk", "Live PK Battle"], ["multi", "Multi-Guest Live"]]], ["Admin", [["admin", "Dashboard"], ["users", "User Management"], ["reports", "Reports & Moderation"]]]];

export default function Shell({ view, go, session, onLogout, children }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  useEffect(() => { api("/notifications").then((d) => setUnread(((d.notifications || (Array.isArray(d) ? d : [])).filter((n) => !n.read)).length)).catch(() => {}); }, [view]);
  const home = view === "home";
  return (
    <div className="shell">
      <header className="top">
        {home ? <button className="ghost" aria-label="Menu" onClick={() => setOpen(true)}><Menu size={28} /></button>
          : <button className="ghost" aria-label="Back" onClick={() => go("home")}><ArrowLeft size={28} /></button>}
        <button className="ghost" onClick={() => go("home")}><Logo height={38} /></button>
        {home ? <button className="spill" onClick={() => go("search")}><span>Search videos, channels...</span><Search size={20} /></button> : <div style={{ flex: 1 }} />}
        {!home && <button className="ghost" aria-label="Search" onClick={() => go("search")}><Search size={24} /></button>}
        <button className="ghost" aria-label="Notifications" onClick={() => go("notifications")}><Bell size={25} />{unread > 0 && <em className="dot">{unread > 9 ? "9+" : unread}</em>}</button>
        <button className="avatar" title="Menu" onClick={() => setOpen(!open)}>{(session.user.displayName || "U")[0].toUpperCase()}</button><ChevronDown size={16} color="#cfe0ff" />
      </header>
      {open && (<div className="menu" onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()}>
        <p className="who">{session.user.displayName}</p>
        {MENU.map(([g, items]) => (<div key={g}><small>{g}</small>{items.map(([k, l]) => <button key={k} onClick={() => { go(k === "playlists" ? "profile" : k, k === "playlists" ? { tab: "playlists" } : {}); setOpen(false); }}>{l}</button>)}</div>))}
        <button className="out" onClick={onLogout}>Log Out</button></div></div>)}
      <section className="body">{children}</section>
      <nav className="bottom">
        {TABS.map(([k, Icon, label]) => (
          <button key={k} className={(view === k ? "on " : "") + (k === "upload" ? "plus" : "")} onClick={() => go(k)} aria-label={label || "Create"}>
            <Icon size={k === "upload" ? 32 : 26} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
