export const views = (n = 0) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + "K" : String(n));
export const ago = (d) => {
  const m = Math.max(1, Math.floor((Date.now() - new Date(d)) / 60000));
  if (m < 60) return m + " min ago"; const h = Math.floor(m / 60);
  if (h < 24) return h + " hr ago"; const dd = Math.floor(h / 24);
  return dd < 30 ? dd + " days ago" : Math.floor(dd / 30) + " mo ago";
};
export const dur = (s = 0) => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
