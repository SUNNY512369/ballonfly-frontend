import { useEffect } from "react";
import Logo from "../components/Logo.jsx";

export default function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <main className="dark-screen">
      <Logo height={170} />
      <p className="tag">Watch • Create • Share</p>
      <div className="spin" />
      <small style={{ color: "var(--muted)" }}>Loading amazing content...</small>
    </main>
  );
}
