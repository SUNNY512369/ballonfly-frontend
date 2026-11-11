import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Plus, ArrowLeft, Check } from "lucide-react";
import Logo from "../components/Logo.jsx";
import { api } from "../lib/api.js";

function Field({ icon: Icon, type = "text", value, onChange, placeholder, secret }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <Icon size={20} />
      <input type={secret && !show ? "password" : type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      {secret && <button type="button" onClick={() => setShow(!show)} aria-label="show password">{show ? <EyeOff size={20} /> : <Eye size={20} />}</button>}
    </div>
  );
}

export default function Auth({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (v) => setF({ ...f, [k]: v });
  const signup = mode === "signup";

  async function submit() {
    setErr("");
    if (!f.email.trim() || !f.password) return setErr("Email aur password likhein");
    if (signup) {
      if (!f.name.trim()) return setErr("Full name likhein");
      if (f.password.length < 6) return setErr("Password kam az kam 6 huroof ka ho");
      if (f.password !== f.confirm) return setErr("Dono password aik jaise nahi hain");
      if (!agree) return setErr("Terms se ittefaq karna zaroori hai");
    }
    setBusy(true);
    try {
      const body = signup
        ? { displayName: f.name.trim(), username: f.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14) + Math.floor(Math.random() * 900 + 100), email: f.email.trim(), password: f.password }
        : { email: f.email.trim(), password: f.password };
      const data = await api(signup ? "/auth/signup" : "/auth/login", { method: "POST", body });
      onAuthed({ token: data.token, user: data.user }, remember);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <main className="auth-bg">
      <form className="auth-card" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="logo"><Logo variant="light" height={signup ? 135 : 150} /></div>
        <h2>{signup ? "Create Account" : "Welcome Back"}</h2>
        <p className="auth-sub">{signup ? "Sign up to get started with Ballonfly" : "Login to continue your journey"}</p>
        {signup && <Field icon={User} value={f.name} onChange={set("name")} placeholder="Full Name" />}
        <Field icon={Mail} type="email" value={f.email} onChange={set("email")} placeholder="Email Address" />
        <Field icon={Lock} secret value={f.password} onChange={set("password")} placeholder="Password" />
        {signup && <Field icon={Lock} secret value={f.confirm} onChange={set("confirm")} placeholder="Confirm Password" />}
        {signup ? (
          <div className="row"><label><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the Terms</label></div>
        ) : (
          <div className="row">
            <label><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
            <button type="button" className="link" onClick={() => setErr("Password reset jaldi aa raha hai")}>Forgot Password?</button>
          </div>
        )}
        {err && <p className="err">{err}</p>}
        <button className="neu-btn" disabled={busy}>{busy ? "Please wait..." : signup ? "Sign Up" : "Login"}</button>
        <div className="swap">
          <span>{signup ? "Already have an account?" : "Don't have an account?"}</span>
          <button type="button" className="round" aria-label={signup ? "Back to login" : "Create account"} onClick={() => { setErr(""); setMode(signup ? "login" : "signup"); }}>
            {signup ? <ArrowLeft size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </form>
    </main>
  );
}
