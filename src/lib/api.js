// Backend URL: Vercel/Replit mein VITE_API_BASE set karein (jaise https://mera-backend.com/api).
export const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE) ||
  "https://73f66bd3-8cea-466c-bb50-f674376c52b5-00-258qwqohl8u35.pike.replit.dev/api";

const KEY = "ballonfly_session";

export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
export function setSession(s) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch { /* storage band ho to bhi app chale */ }
}

export async function api(path, { method = "GET", body, token } = {}) {
  const t = token || (getSession() && getSession().token);
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(t ? { Authorization: "Bearer " + t } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Request fail ho gayi");
  return data;
}
