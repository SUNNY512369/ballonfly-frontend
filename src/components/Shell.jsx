import { useState } from "react";
import { Home, Zap, Plus, MonitorPlay, Library, Search, Bell, LogOut } from "lucide-react";
import Logo from "./Logo.jsx";

const TABS = [["home", Home, "Home"], ["shorts", Zap, "Shorts"], ["upload", Plus, ""], ["subs", MonitorPlay, "Subscriptions"], ["library", Library, "Library"]];

const MENU = [["Account", [["profile", "Profile"], ["playlists", "Playlists"], ["settings", "Settings"]]], ["Studio", [["analytics", "Analytics"], ["monetization", "Monetization"], ["wallet", "Creator Wallet"], ["processing", "Video Processing"], ["editor", "Video Editing"]]], ["Coins & Live", [["coins", "Coin Purchase & Gifts"], ["pk", "Live PK Battle"], ["multi", "Multi-Guest Live"]]], ["Admin", [["admin", "Dashboard"], ["users", "User Management"], ["reports", "Reports & Moderation"]]]];

export default function Shell({ view, go, session, onLogout, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <header className="top">
        <button className="ghost" onClick={() => go("home")}><Logo height={34} /></button>
        <div style={{ flex: 1 }} />
        <button className="ghost" aria-label="Search" onClick={() => go("search")}><Search size={22} /></button>
        <button className="ghost" aria-label="Notifications" onClick={() => go("notifications")}><Bell size={22} /></button>
        <button className="avatar" title="Menu" onClick={() => setOpen(!open)}>{(session.user.displayName || "U")[0].toUpperCase()}</button>
      </header>
      {open && (<div className="menu" onClick={() => setOpen(false)}><div onClick={(e) => e.stopPropagation()}>
        <p className="who">{session.user.displayName}</p>
        {MENU.map(([g, items]) => (<div key={g}><small>{g}</small>{items.map(([k, l]) => <button key={k} onClick={() => { go(k === "playlists" ? "profile" : k, k === "playlists" ? { tab: "playlists" } : {}); setOpen(false); }}>{l}</button>)}</div>))}
        <button className="out" onClick={onLogout}>Log Out</button></div></div>)}
      <section className="body">{children}</section>
      <nav className="bottom">
        {TABS.map(([k, Icon, label]) => (
          <button key={k} className={(view === k ? "on " : "") + (k === "upload" ? "plus" : "")} onClick={() => go(k)} aria-label={label || "Create"}>
            <Icon size={k === "upload" ? 30 : 24} /><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
