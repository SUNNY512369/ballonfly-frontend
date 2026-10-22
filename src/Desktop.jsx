import { useEffect, useMemo, useState } from "react";
import {
  Menu, Search, PlusSquare, Bell, ChevronDown, ChevronLeft, ChevronRight, Home, PlayCircle,
  Sparkles, Compass, Tv, Send, Image as ImageIcon, User, ThumbsUp, Clock, Bookmark,
  Settings, LogOut, History, Plus, ArrowRight, Flame, TrendingUp, Heart, Play, X,
} from "lucide-react";
import VideoWatchPage from "./VideoWatchPage.jsx";

const SAVED_KEY = "tolvify_saved_videos";
const DESKTOP_QUERY = "(min-width: 1024px)";

export function isDesktopNow() {
  try { return window.matchMedia(DESKTOP_QUERY).matches; } catch (e) { return false; }
}

export function useIsDesktop() {
  const [on, setOn] = useState(isDesktopNow);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const fn = () => setOn(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return on;
}

/* ---------- helpers ---------- */
function clock(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? h + ":" + String(m).padStart(2, "0") + ":" + ss : m + ":" + ss;
}
function ago(d) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, secs] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return n + " " + name + (n > 1 ? "s" : "") + " ago";
  }
  return "just now";
}
function short(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}
// Cloudinary video url -> still frame
function frameOf(url) {
  return String(url || "")
    .replace("/video/upload/", "/video/upload/so_1,w_360,h_640,c_fill/")
    .replace(/\.[a-z0-9]+$/i, ".jpg");
}

function Face({ name, url, size = 36, ring = false }) {
  return (
    <span className={"dk-face" + (ring ? " ring" : "")} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>
      {url ? <img src={url} alt="" /> : (name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ---------- header ---------- */
export function DesktopHeader({ user, token, apiBase, query, onQuery, onToggle, onHome, onCreate, onBell, unread, onProfile }) {
  const [avatar, setAvatar] = useState("");
  useEffect(() => {
    if (!token) return;
    let off = false;
    fetch(apiBase + "/users/me/profile", { headers: { Authorization: "Bearer " + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && d.profile) setAvatar(d.profile.avatarUrl || ""); })
      .catch(() => {});
    return () => { off = true; };
  }, [token]);

  return (
    <header className="dk-head">
      <button type="button" className="dk-ic" onClick={onToggle} aria-label="Toggle menu"><Menu size={24} /></button>
      <button type="button" className="dk-logo" onClick={onHome} aria-label="Tolvify home">
        <svg width="34" height="34" viewBox="0 0 30 30" aria-hidden="true">
          <defs><linearGradient id="dkg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2be4ff" /><stop offset="1" stopColor="#0096e0" /></linearGradient></defs>
          <rect x="2" y="2" width="26" height="26" rx="8" fill="url(#dkg)" />
          <path d="M11.5 8.8 21.5 15l-10 6.2z" fill="#06141f" />
        </svg>
        <b>Tolvify</b>
      </button>
      <label className="dk-search">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search videos, creators, hashtags..."
          aria-label="Search"
        />
        {query ? (
          <button type="button" onClick={() => onQuery("")} aria-label="Clear search"><X size={18} /></button>
        ) : (
          <Search size={19} />
        )}
      </label>
      <span className="dk-spacer" />
      <button type="button" className="dk-ic" onClick={onCreate} aria-label="Create"><PlusSquare size={26} /></button>
      <button type="button" className="dk-ic dk-bell" onClick={onBell} aria-label="Notifications">
        <Bell size={25} />
        {unread > 0 && <i>{unread > 9 ? "9+" : unread}</i>}
      </button>
      <button type="button" className="dk-me" onClick={onProfile} aria-label="Your channel">
        <Face name={user && user.name} url={avatar} size={40} ring />
        <ChevronDown size={16} />
      </button>
    </header>
  );
}

/* ---------- sidebar ---------- */
export function DesktopSidebar({ view, profileTab, onNav, collapsed, msgBadge, apiBase, onLogout }) {
  const [places, setPlaces] = useState([]);
  useEffect(() => {
    let off = false;
    fetch(apiBase + "/countries")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && Array.isArray(d.countries)) setPlaces(d.countries.slice(0, 4)); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  const main = [
    { key: "home", icon: Home, label: "Home" },
    { key: "shorts", icon: PlayCircle, label: "Shorts" },
    { key: "sparks", icon: Sparkles, label: "Sparks" },
    { key: "communities", icon: Compass, label: "Explore" },
    { key: "subs", icon: Tv, label: "Subscriptions" },
    { key: "feed", icon: ImageIcon, label: "Posts" },
    { key: "messages", icon: Send, label: "Messages", badge: msgBadge },
  ];
  const you = [
    { key: "profile", icon: User, label: "Your Channel" },
    { key: "history", icon: History, label: "History" },
    { key: "liked", icon: ThumbsUp, label: "Liked Videos" },
    { key: "later", icon: Clock, label: "Watch Later" },
    { key: "saved", icon: Bookmark, label: "Saved" },
  ];
  const isActive = (k) => {
    if (k === "saved") return view === "profile" && profileTab === "saved";
    if (k === "profile") return view === "profile" && profileTab !== "saved";
    return view === k;
  };
  const row = (it) => (
    <button key={it.key} type="button" className={"dk-nav" + (isActive(it.key) ? " on" : "")} onClick={() => onNav(it.key)} title={it.label}>
      <it.icon size={21} />
      <span>{it.label}</span>
      {!!it.badge && <em>{it.badge}</em>}
    </button>
  );

  return (
    <nav className={"dk-side" + (collapsed ? " mini" : "")} aria-label="Main">
      {main.map(row)}
      <hr />
      <p className="dk-sec">You</p>
      {you.map(row)}
      <hr />
      <p className="dk-sec">Communities</p>
      {places.map((c) => (
        <button key={c.code} type="button" className="dk-nav" onClick={() => onNav("communities")} title={c.name}>
          <span className="dk-code">{c.code}</span>
          <span>{c.name}</span>
          {c.membersCount > 0 && <i className="dk-dot" />}
        </button>
      ))}
      <button type="button" className="dk-nav" onClick={() => onNav("communities")} title="Discover more">
        <Plus size={21} /><span>Discover More</span>
      </button>
      <hr />
      <button type="button" className={"dk-nav" + (view === "settings" ? " on" : "")} onClick={() => onNav("settings")} title="Settings">
        <Settings size={21} /><span>Settings</span>
      </button>
      <button type="button" className="dk-nav" onClick={onLogout} title="Log out">
        <LogOut size={21} /><span>Log Out</span>
      </button>
    </nav>
  );
}

/* ---------- shared bits ---------- */
function VideoCard({ v, onOpen }) {
  const by = v.author ? v.author.name : "Unknown";
  return (
    <div className="dk-card">
      <button type="button" className="dk-thumb" onClick={() => onOpen(v)} aria-label={"Play " + v.title}>
        <img src={v.thumbnailUrl} alt="" loading="lazy" />
        <em>{clock(v.duration)}</em>
      </button>
      <div className="dk-card-info">
        <Face name={by} url={v.author ? v.author.avatarUrl : ""} size={38} />
        <button type="button" className="dk-card-txt" onClick={() => onOpen(v)}>
          <strong>{v.title}</strong>
          <span>{by}</span>
          <span>{short(v.views)} views <b>•</b> {ago(v.createdAt)}</span>
        </button>
      </div>
    </div>
  );
}

function matches(v, q) {
  const needle = q.trim().toLowerCase().replace(/^#/, "");
  if (!needle) return true;
  return (
    String(v.title).toLowerCase().includes(needle) ||
    String(v.author ? v.author.name : "").toLowerCase().includes(needle) ||
    (v.hashtags || []).some((t) => t.includes(needle))
  );
}

/* ---------- home ---------- */
export function DesktopHome({ apiBase, token, userId, shorts, followingIds, onFollow, query, onOpenShorts, onCreate }) {
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [cats, setCats] = useState(["All"]);
  const [cat, setCat] = useState("All");
  const [slide, setSlide] = useState(0);
  const [all, setAll] = useState(false);
  const [active, setActive] = useState(null);
  const [subCounts, setSubCounts] = useState({});

  useEffect(() => {
    let off = false;
    setLoading(true); setError("");
    fetch(apiBase + "/videos")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => { if (!off) setPool(Array.isArray(d.videos) ? d.videos : []); })
      .catch(() => { if (!off) setError("Could not load videos"); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [retry]);

  useEffect(() => {
    fetch(apiBase + "/videos/meta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && Array.isArray(d.categories)) setCats(["All"].concat(d.categories)); })
      .catch(() => {});
  }, []);

  const visible = useMemo(
    () => pool.filter((v) => (cat === "All" || v.category === cat) && matches(v, query)),
    [pool, cat, query]
  );
  const trending = useMemo(() => pool.slice().sort((a, b) => b.views - a.views).slice(0, 5), [pool]);
  const hero = useMemo(() => pool.slice().sort((a, b) => b.views - a.views).slice(0, 3), [pool]);
  const channels = useMemo(() => {
    const seen = {};
    const list = [];
    pool.forEach((v) => {
      const a = v.author;
      if (!a || seen[a._id] || String(a._id) === String(userId)) return;
      seen[a._id] = true;
      list.push(a);
    });
    list.sort((a, b) => Number(followingIds.has(b._id)) - Number(followingIds.has(a._id)));
    return list.slice(0, 5);
  }, [pool, followingIds, userId]);

  useEffect(() => {
    channels.forEach((c) => {
      if (subCounts[c._id] !== undefined) return;
      fetch(apiBase + "/users/" + c._id)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d) setSubCounts((m) => ({ ...m, [c._id]: d.followersCount || 0 })); })
        .catch(() => {});
    });
  }, [channels]);

  const feat = hero.length ? hero[slide % hero.length] : null;
  const shown = all ? visible : visible.slice(0, 8);
  const searching = query.trim().length > 0;

  return (
    <div className="dk-home">
      <div className="dk-center">
        <div className="dk-chips" role="tablist">
          {cats.map((c) => (
            <button key={c} type="button" role="tab" aria-selected={c === cat} className={c === cat ? "on" : ""} onClick={() => { setCat(c); setAll(false); }}>{c}</button>
          ))}
        </div>

        {!searching && cat === "All" && (
          <section className="dk-hero" style={feat ? { backgroundImage: "linear-gradient(90deg, rgba(7,18,29,0.92) 0%, rgba(7,18,29,0.55) 55%, rgba(7,18,29,0.15) 100%), url(" + JSON.stringify(feat.thumbnailUrl) + ")" } : undefined}>
            <h1>Better Videos<br /><span>Bigger Dreams</span></h1>
            <p>Create <b>•</b> Share <b>•</b> Be Real</p>
            {feat ? (
              <button type="button" className="dk-cta" onClick={() => setActive(feat)}><Play size={16} /> Watch Now</button>
            ) : (
              <button type="button" className="dk-cta" onClick={onCreate}><Plus size={16} /> Upload a video</button>
            )}
            {hero.length > 1 && (
              <div className="dk-hero-nav">
                {hero.map((h, i) => (
                  <button key={h._id} type="button" className={"dk-pip" + (i === slide % hero.length ? " on" : "")} onClick={() => setSlide(i)} aria-label={"Slide " + (i + 1)} />
                ))}
                <button type="button" className="dk-arrow" onClick={() => setSlide((s) => (s + hero.length - 1) % hero.length)} aria-label="Previous"><ChevronLeft size={18} /></button>
                <button type="button" className="dk-arrow" onClick={() => setSlide((s) => (s + 1) % hero.length)} aria-label="Next"><ChevronRight size={18} /></button>
              </div>
            )}
          </section>
        )}

        <section>
          <div className="dk-sh">
            <h2><Flame size={22} /> {searching ? "Results for “" + query.trim() + "”" : "Recommended for You"}</h2>
            {visible.length > 8 && (
              <button type="button" onClick={() => setAll((a) => !a)}>{all ? "Show less" : "See All"} <ArrowRight size={15} /></button>
            )}
          </div>
          {loading && pool.length === 0 && (
            <div className="dk-grid">
              {[0, 1, 2, 3].map((i) => <div key={i} className="dk-card dk-skel"><div className="dk-thumb" /><div className="dk-card-info"><span className="dk-face" style={{ width: 38, height: 38 }} /></div></div>)}
            </div>
          )}
          {error && (
            <p className="dk-note" role="alert">{error} <button type="button" onClick={() => setRetry((n) => n + 1)}>Retry</button></p>
          )}
          {!loading && !error && visible.length === 0 && (
            <p className="dk-note">
              {searching || cat !== "All" ? "No videos match this search." : "No videos yet."}{" "}
              {!searching && cat === "All" && <button type="button" onClick={onCreate}>Upload the first one</button>}
            </p>
          )}
          <div className="dk-grid">
            {shown.map((v) => <VideoCard key={v._id} v={v} onOpen={setActive} />)}
          </div>
        </section>

        {!searching && cat === "All" && shorts.length > 0 && (
          <section>
            <div className="dk-sh">
              <h2><PlayCircle size={22} /> Shorts</h2>
              <button type="button" onClick={onOpenShorts}>See All <ArrowRight size={15} /></button>
            </div>
            <div className="dk-shorts">
              {shorts.slice(0, 7).map((s) => (
                <button key={s.id} type="button" className="dk-short" onClick={onOpenShorts} aria-label={"Open short: " + (s.caption || s.user)}>
                  <img src={frameOf(s.mediaUrl)} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
                  <span><Heart size={14} fill="currentColor" /> {short(s.likes)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="dk-rail">
        <section className="dk-box">
          <h3><TrendingUp size={19} /> Trending Today</h3>
          {trending.length === 0 && <p className="dk-note">Nothing trending yet.</p>}
          {trending.map((v, i) => (
            <button key={v._id} type="button" className="dk-trend" onClick={() => setActive(v)}>
              <b>{i + 1}</b>
              <span>
                <strong>{v.title}</strong>
                <small>{short(v.views)} views <i>•</i> {ago(v.createdAt)}</small>
              </span>
              <img src={v.thumbnailUrl} alt="" loading="lazy" />
            </button>
          ))}
        </section>

        <section className="dk-box">
          <h3>Your Subscriptions</h3>
          {channels.length === 0 && <p className="dk-note">Channels you can follow will show up here.</p>}
          {channels.map((c) => {
            const on = followingIds.has(c._id);
            return (
              <div key={c._id} className="dk-chan">
                <Face name={c.name} url={c.avatarUrl} size={44} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{subCounts[c._id] !== undefined ? short(subCounts[c._id]) + " subscribers" : " "}</small>
                </span>
                <button type="button" className={on ? "on" : ""} onClick={() => onFollow(c._id)}>{on ? "Subscribed" : "Subscribe"}</button>
              </div>
            );
          })}
        </section>
      </aside>

      {active && (
        <VideoWatchPage
          key={active._id}
          video={active}
          apiBase={apiBase}
          token={token}
          userId={userId}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}

/* ---------- Subscriptions / Liked / Watch later ---------- */
const LIST_COPY = {
  subs: { title: "Subscriptions", empty: "Videos from channels you subscribe to will appear here." },
  liked: { title: "Liked Videos", empty: "Videos you like will appear here." },
  history: { title: "History", empty: "Videos you watch will appear here." },
  later: { title: "Watch Later", empty: "Tap Save on a video to keep it here." },
};

export function DesktopVideoList({ mode, apiBase, token, userId, followingIds }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const followKey = mode === "subs" ? Array.from(followingIds).sort().join(",") : "";

  useEffect(() => {
    let off = false;
    setLoading(true); setError("");
    let url = apiBase + "/videos";
    let opts;
    if (mode === "liked" || mode === "history") {
      url = apiBase + "/videos/" + mode;
      opts = { headers: { Authorization: "Bearer " + token } };
    } else if (mode === "later") {
      let ids = [];
      try { ids = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch (e) {}
      url = apiBase + "/videos/by-ids?ids=" + encodeURIComponent(ids.join(","));
    }
    fetch(url, opts)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (off) return;
        let list = Array.isArray(d.videos) ? d.videos : [];
        if (mode === "subs") list = list.filter((v) => v.author && followingIds.has(v.author._id));
        setVideos(list);
      })
      .catch(() => { if (!off) setError("Could not load videos"); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [mode, token, followKey]);

  const clearHistory = () => {
    fetch(apiBase + "/videos/history", { method: "DELETE", headers: { Authorization: "Bearer " + token } })
      .then((r) => { if (r.ok) setVideos([]); })
      .catch(() => {});
  };

  const copy = LIST_COPY[mode];
  return (
    <div className="dk-list">
      <div className="dk-sh">
        <h2>{copy.title}</h2>
        {mode === "history" && videos.length > 0 && (
          <button type="button" onClick={clearHistory}>Clear history</button>
        )}
      </div>
      {loading && <p className="dk-note">Loading...</p>}
      {error && <p className="dk-note" role="alert">{error}</p>}
      {!loading && !error && videos.length === 0 && <p className="dk-note">{copy.empty}</p>}
      <div className="dk-grid">
        {videos.map((v) => <VideoCard key={v._id} v={v} onOpen={setActive} />)}
      </div>
      {active && (
        <VideoWatchPage
          key={active._id}
          video={active}
          apiBase={apiBase}
          token={token}
          userId={userId}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}

/* ---------- styles (desktop only) ---------- */
export const DESKTOP_CSS = `
@media (min-width: 1024px) {
  .app-root.desk {
    --bg: #07121d; --surface: #0e2033; --surface-2: #132b42; --border: #1b3752;
    --text: #f1f6fa; --text-muted: #8aa5bb; --accent: #22d6f4; --accent-2: #00a9e8;
    display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: 68px minmax(0, 1fr);
    min-height: 100vh;
  }
  .desk .sidebar, .desk .bottom-nav, .desk .home-tabs, .desk .top-search { display: none; }
  .desk .main { grid-column: 2; grid-row: 2; max-width: 760px; padding: 24px 24px 60px; }
  .desk .main.main-wide { max-width: none; padding: 0; margin: 0; }
  .desk .main.main-sparks { height: calc(100vh - 68px); }
  .desk .shorts-scroller:not(.sparks-scroller) { height: calc(100vh - 100px); }
  .desk .shorts-scroller:not(.sparks-scroller) .short-card { height: calc(100vh - 100px); }

  .dk-head {
    grid-column: 1 / -1; grid-row: 1; position: sticky; top: 0; z-index: 40; display: flex; align-items: center;
    gap: 10px; padding: 0 20px 0 14px; background: var(--bg); border-bottom: 1px solid var(--border);
  }
  .dk-spacer { flex: 1; }
  .dk-ic {
    position: relative; width: 44px; height: 44px; display: inline-grid; place-items: center; border-radius: 50%;
    background: none; border: none; color: var(--text); cursor: pointer;
  }
  .dk-ic:hover, .dk-me:hover { background: var(--surface); }
  .dk-logo { display: flex; align-items: center; gap: 10px; background: none; border: none; cursor: pointer; font-size: 28px; letter-spacing: -0.5px; padding: 0 8px; }
  .dk-logo b { font-weight: 700; color: var(--accent); font-family: inherit; }
  .dk-search {
    flex: 0 1 640px; margin-left: 40px; display: flex; align-items: center; gap: 10px; padding: 0 20px;
    height: 46px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
  }
  .dk-search:focus-within { border-color: var(--accent); }
  .dk-search input { flex: 1; min-width: 0; background: none; border: none; outline: none; color: var(--text); font-size: 15px; }
  .dk-search button { background: none; border: none; color: var(--text-muted); cursor: pointer; display: grid; place-items: center; padding: 0; }
  .dk-bell i {
    position: absolute; top: 3px; right: 2px; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px;
    background: #ff3d57; color: #fff; font-style: normal; font-size: 11px; font-weight: 700; display: grid; place-items: center;
  }
  .dk-me { display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--text); cursor: pointer; padding: 4px 6px; border-radius: 999px; }

  .dk-face {
    flex: 0 0 auto; border-radius: 50%; overflow: hidden; display: inline-grid; place-items: center;
    background: linear-gradient(135deg, #1c6f8e, #0b3a57); color: #dff7ff; font-weight: 700;
  }
  .dk-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dk-face.ring { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--accent); }

  .dk-side {
    grid-column: 1; grid-row: 2; position: sticky; top: 68px; align-self: start; width: 252px;
    height: calc(100vh - 68px); overflow-y: auto; padding: 16px 12px 24px; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 2px; scrollbar-width: thin;
  }
  .dk-side.mini { width: 76px; }
  .dk-side hr { border: none; border-top: 1px solid var(--border); margin: 12px 4px; width: calc(100% - 8px); }
  .dk-sec { margin: 4px 14px 6px; font-size: 14px; color: var(--text-muted); }
  .dk-side.mini .dk-sec, .dk-side.mini .dk-nav span:not(.dk-code), .dk-side.mini .dk-nav em, .dk-side.mini .dk-dot { display: none; }
  .dk-side.mini .dk-nav { justify-content: center; padding: 12px 0; }
  .dk-nav {
    position: relative; display: flex; align-items: center; gap: 16px; width: 100%; padding: 12px 14px; border-radius: 12px;
    background: none; border: none; color: var(--text); font-size: 15.5px; text-align: left; cursor: pointer;
  }
  .dk-nav:hover { background: var(--surface); }
  .dk-nav.on { background: linear-gradient(135deg, #2be8ff, #00a9ee); color: #03141f; font-weight: 700; }
  .dk-nav svg { flex: 0 0 auto; color: var(--accent); }
  .dk-nav.on svg { color: #03141f; }
  .dk-nav em {
    margin-left: auto; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #ff3d57; color: #fff;
    font-style: normal; font-size: 11.5px; font-weight: 700; display: grid; place-items: center;
  }
  .dk-code {
    flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-size: 11px;
    font-weight: 700; background: var(--surface-2); color: var(--accent); border: 1px solid var(--border);
  }
  .dk-dot { margin-left: auto; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }

  .dk-home { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; padding: 20px 24px 60px; }
  .dk-center { min-width: 0; display: flex; flex-direction: column; gap: 26px; }
  .dk-chips { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .dk-chips::-webkit-scrollbar { display: none; }
  .dk-chips button, .dk-note button {
    flex: 0 0 auto; padding: 10px 20px; border-radius: 999px; font-size: 15px; cursor: pointer;
    background: var(--surface); border: 1px solid var(--border); color: var(--text);
  }
  .dk-chips button:hover { border-color: var(--accent); }
  .dk-chips button.on { background: linear-gradient(135deg, #2be8ff, #00b4ec); border-color: transparent; color: #03141f; font-weight: 700; }

  .dk-hero {
    position: relative; min-height: 254px; padding: 34px 40px; border-radius: 20px; overflow: hidden; border: 1px solid var(--border);
    background: linear-gradient(120deg, #0b2a42, #07121d); background-size: cover; background-position: center;
    display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 12px;
  }
  .dk-hero h1 { margin: 0; font-size: 44px; line-height: 1.08; letter-spacing: -1px; font-weight: 800; }
  .dk-hero h1 span { color: var(--accent); }
  .dk-hero p { margin: 0; font-size: 18px; color: #d6e6f2; }
  .dk-hero p b, .dk-card-txt b { opacity: 0.6; margin: 0 6px; font-weight: 400; }
  .dk-cta {
    display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; padding: 14px 26px; border-radius: 999px; border: none;
    font-size: 16px; font-weight: 700; cursor: pointer; color: #03141f; background: linear-gradient(135deg, #2be8ff, #00b4ec);
  }
  .dk-hero-nav { position: absolute; right: 22px; bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .dk-pip { width: 9px; height: 9px; padding: 0; border-radius: 50%; border: none; background: rgba(255, 255, 255, 0.4); cursor: pointer; }
  .dk-pip.on { background: var(--accent); }
  .dk-arrow {
    width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
    background: rgba(7, 18, 29, 0.7); border: 1px solid var(--border); color: var(--text); margin-left: 4px;
  }

  .dk-sh { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .dk-sh h2 { margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px; font-family: inherit; }
  .dk-sh h2 svg { color: #ff6a3d; }
  .dk-sh button { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: var(--accent); font-size: 15px; cursor: pointer; }
  .dk-note { color: var(--text-muted); font-size: 15px; margin: 8px 0; }
  .dk-note button { padding: 6px 14px; margin-left: 6px; font-size: 14px; color: var(--accent); }

  .dk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 22px 16px; }
  .dk-card { min-width: 0; display: flex; flex-direction: column; gap: 12px; }
  .dk-thumb {
    position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: 14px; overflow: hidden; padding: 0;
    border: none; background: var(--surface); cursor: pointer;
  }
  .dk-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.25s; }
  .dk-thumb:hover img { transform: scale(1.04); }
  .dk-thumb em { position: absolute; right: 8px; bottom: 8px; padding: 2px 7px; border-radius: 6px; font-style: normal; font-size: 13px; background: rgba(0, 0, 0, 0.78); }
  .dk-card-info { display: flex; gap: 12px; align-items: flex-start; }
  .dk-card-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; text-align: left; background: none; border: none; color: var(--text); cursor: pointer; padding: 0; }
  .dk-card-txt strong {
    font-size: 15.5px; line-height: 1.3; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .dk-card-txt span { font-size: 13.5px; color: var(--text-muted); }
  .dk-skel .dk-thumb, .dk-skel .dk-face { background: linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 50%, var(--surface) 75%); background-size: 200% 100%; animation: dk-sh 1.3s infinite; }
  @keyframes dk-sh { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .dk-shorts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
  .dk-short { position: relative; aspect-ratio: 9 / 16; border-radius: 14px; overflow: hidden; padding: 0; border: none; background: var(--surface); cursor: pointer; }
  .dk-short img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .dk-short span {
    position: absolute; left: 8px; bottom: 8px; display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 999px;
    font-size: 13px; background: rgba(7, 18, 29, 0.78);
  }

  .dk-rail { display: none; min-width: 0; flex-direction: column; gap: 20px; }
  .dk-box { padding: 18px; border-radius: 18px; background: var(--surface); border: 1px solid var(--border); }
  .dk-box h3 { margin: 0 0 14px; font-size: 18px; display: flex; align-items: center; gap: 10px; font-family: inherit; }
  .dk-box h3 svg { color: var(--accent); }
  .dk-trend { display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 0; background: none; border: none; color: var(--text); text-align: left; cursor: pointer; }
  .dk-trend b { width: 22px; font-size: 18px; font-weight: 500; color: var(--text-muted); text-align: center; }
  .dk-trend > span { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .dk-trend strong { font-size: 15px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dk-trend small { color: var(--text-muted); font-size: 13px; }
  .dk-trend img { width: 80px; height: 56px; object-fit: cover; border-radius: 9px; flex: 0 0 auto; }
  .dk-trend i, .dk-card-txt i { font-style: normal; opacity: 0.6; margin: 0 3px; }
  .dk-chan { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
  .dk-chan > span:not(.dk-face) { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .dk-chan strong { font-size: 15px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dk-chan small { color: var(--text-muted); font-size: 13px; min-height: 16px; }
  .dk-chan button {
    flex: 0 0 auto; padding: 9px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; cursor: pointer;
    background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
  }
  .dk-chan button.on { background: none; border-color: var(--accent); color: var(--accent); }

  .dk-list { padding: 20px 24px 60px; }
}
@media (min-width: 1360px) {
  .dk-home { grid-template-columns: minmax(0, 1fr) 360px; }
  .dk-rail { display: flex; }
}
`;

