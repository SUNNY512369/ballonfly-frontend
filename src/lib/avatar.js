import { api } from "./api.js";
// Tasveer Cloudinary par jati hai, phir link profile mein save hota hai.
export async function uploadAvatar(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Sirf tasveer (image) chunein");
  if (file.size > 5 * 1048576) throw new Error("Tasveer 5 MB se choti honi chahiye");
  const sign = await api("/videos/sign", { method: "POST" });
  const form = new FormData();
  form.append("file", file); form.append("api_key", sign.apiKey); form.append("timestamp", sign.timestamp); form.append("signature", sign.signature); form.append("folder", sign.folder);
  const res = await fetch("https://api.cloudinary.com/v1_1/" + sign.cloudName + "/image/upload", { method: "POST", body: form });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.secure_url) throw new Error((d.error && d.error.message) || "Upload fail ho gaya");
  await api("/users/me", { method: "PATCH", body: { avatarUrl: d.secure_url } });
  window.dispatchEvent(new CustomEvent("bf-avatar", { detail: d.secure_url }));
  return d.secure_url;
}
