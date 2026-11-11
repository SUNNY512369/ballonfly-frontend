import { useState, useCallback } from "react";
import Splash from "./screens/Splash.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import Auth from "./screens/Auth.jsx";
import Upload from "./screens/Upload.jsx";
import Notifications from "./screens/Notifications.jsx";
import Profile from "./screens/Profile.jsx";
import Settings from "./screens/Settings.jsx";
import { Analytics, Monetization, Wallet, Processing } from "./screens/Studio.jsx";
import Coins from "./screens/Coins.jsx";
import { PK, MultiGuest } from "./screens/Live.jsx";
import { Dashboard, Users, Reports } from "./screens/Admin.jsx";
import Editor from "./screens/Editor.jsx";
import Shell from "./components/Shell.jsx";
import Home from "./screens/Home.jsx";
import Search from "./screens/Search.jsx";
import Watch from "./screens/Watch.jsx";
import Shorts from "./screens/Shorts.jsx";
import Library from "./screens/Library.jsx";
import Subscriptions from "./screens/Subscriptions.jsx";
import { getSession, setSession } from "./lib/api.js";
import "./styles/screens.css";

const seen = () => { try { return localStorage.getItem("bf_onboarded") === "1"; } catch { return false; } };

export default function App() {
  const [session, setS] = useState(getSession());
  const [step, setStep] = useState("splash");
  const [view, setView] = useState({ name: "home" });
  const go = (name, extra = {}) => setView({ name, ...extra });
  const afterSplash = useCallback(() => setStep(session ? "home" : seen() ? "auth" : "onboarding"), [session]);

  if (step === "splash") return <Splash onDone={afterSplash} />;
  if (step === "onboarding") return <Onboarding onDone={() => { try { localStorage.setItem("bf_onboarded", "1"); } catch {} setStep("auth"); }} />;
  if (step === "auth") return <Auth onAuthed={(s, remember) => { if (remember) setSession(s); setS(s); setStep("home"); }} />;
  const logout = () => { setSession(null); setS(null); setStep("auth"); };
  const SCREENS = { home: Home, search: Search, watch: Watch, shorts: Shorts, library: Library, subs: Subscriptions, upload: Upload, notifications: Notifications, profile: Profile, settings: Settings, analytics: Analytics, monetization: Monetization, wallet: Wallet, processing: Processing, coins: Coins, pk: PK, multi: MultiGuest, admin: Dashboard, users: Users, reports: Reports, editor: Editor };
  const Screen = SCREENS[view.name];
  return (
    <Shell view={view.name === "watch" ? "home" : view.name} go={go} session={session} onLogout={logout}>
      {Screen ? <Screen key={view.name + (view.id || "") + (view.tab || "")} {...view} go={go} session={session} /> : <p className="empty">Ye screen agle step mein aa rahi hai.</p>}
    </Shell>
  );
}
