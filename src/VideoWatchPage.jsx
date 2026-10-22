import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Share2, Download, Bookmark, ChevronDown, Play, Pause,
  Volume2, VolumeX, Settings, Maximize, Minimize, MoreVertical, ListFilter, Trash2,
} from "lucide-react";

const SAVED_KEY = "tolvify_saved_videos";
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function clock(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
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

function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch (e) { return []; }
}

function Face({ name, url, size = 40, ring = false }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return (
    <span className={"wp-face" + (ring ? " wp-ring" : "")} style={style}>
      {url ? <img src={url} alt="" /> : (name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ---------- Player ---------- */
function WatchPlayer({ video }) {
  const wrapRef = useRef(null);
  const vidRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef(false);
  const hideTimer = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [menu, setMenu] = useState(false);
  const [shown, setShown] = useState(true);
  const [full, setFull] = useState(false);

  const poke = () => {
    setShown(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (vidRef.current && !vidRef.current.paused) { setShown(false); setMenu(false); }
    }, 2800);
  };

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const onFs = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggle = () => {
    const v = vidRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
    poke();
  };

  const seekTo = (e) => {
    const v = vidRef.current;
    const t = trackRef.current;
    if (!v || !t || !v.duration) return;
    const r = t.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v.currentTime = p * v.duration;
    setTime(v.currentTime);
  };

  const onDown = (e) => {
    dragRef.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    seekTo(e);
  };
  const onMove = (e) => { if (dragRef.current) seekTo(e); };
  const onUp = (e) => {
    dragRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const toggleMute = () => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const pickSpeed = (s) => {
    if (vidRef.current) vidRef.current.playbackRate = s;
    setSpeed(s);
    setMenu(false);
  };

  const toggleFull = () => {
    const wrap = wrapRef.current;
    const v = vidRef.current;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (wrap && wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    else if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const controlsOn = shown || !playing;

  return (
    <div
      ref={wrapRef}
      className={"wp-player" + (controlsOn ? " on" : "")}
      onPointerMove={poke}
      onClick={toggle}
    >
      <video
        ref={vidRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        autoPlay
        playsInline
        preload="metadata"
        onPlay={() => { setPlaying(true); poke(); }}
        onPause={() => { setPlaying(false); setShown(true); }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || video.duration || 0)}
        onTimeUpdate={(e) => { if (!dragRef.current) setTime(e.currentTarget.currentTime); }}
      />

      <span className="wp-chip">{video.category || "Video"}</span>

      {!playing && (
        <span className="wp-bigplay" aria-hidden="true"><Play size={30} fill="currentColor" /></span>
      )}

      <div className="wp-bar" onClick={(e) => e.stopPropagation()}>
        <div className="wp-bar-row">
          <button type="button" className="wp-ic" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <span className="wp-time">{clock(time)} / {clock(duration)}</span>
          <span className="wp-spacer" />
          <button type="button" className="wp-ic" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
          <div className="wp-menu-wrap">
            <button type="button" className="wp-ic" onClick={() => setMenu((m) => !m)} aria-label="Playback speed">
              <Settings size={22} />
            </button>
            {menu && (
              <div className="wp-menu" role="menu">
                <p>Speed</p>
                {SPEEDS.map((s) => (
                  <button key={s} type="button" className={s === speed ? "sel" : ""} onClick={() => pickSpeed(s)}>
                    {s === 1 ? "Normal" : s + "x"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="wp-ic" onClick={toggleFull} aria-label="Fullscreen">
            {full ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>
        </div>
        <div
          className="wp-seek"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <div ref={trackRef} className="wp-track">
            <div className="wp-fill" style={{ width: pct + "%" }} />
            <div className="wp-knob" style={{ left: pct + "%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function VideoWatchPage({ video: first, apiBase, token, userId, onClose }) {
  const [video, setVideo] = useState({ ...first, liked: false, disliked: false });
  const [me, setMe] = useState(null);
  const [chan, setChan] = useState({ followers: 0, following: false });
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(() => readSaved().indexOf(first._id) !== -1);
  const [toast, setToast] = useState("");
  const [pool, setPool] = useState([]);
  const [tab, setTab] = useState("next");

  const [comments, setComments] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cText, setCText] = useState("");
  const [posting, setPosting] = useState(false);
  const [cErr, setCErr] = useState("");
  const [sort, setSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [openRow, setOpenRow] = useState("");
  const pageRef = useRef(null);

  const auth = token ? { Authorization: "Bearer " + token } : {};
  const authorId = video.author ? video.author._id : "";
  const authorName = video.author && video.author.name ? video.author.name : "Unknown";
  const isOwn = Boolean(userId) && String(authorId) === String(userId);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  // Escape closes the page
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // my profile (avatar for the header + comment box)
  useEffect(() => {
    if (!token) return;
    let off = false;
    fetch(apiBase + "/users/me/profile", { headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && d.profile) setMe(d.profile); })
      .catch(() => {});
    return () => { off = true; };
  }, [token]);

  // suggestions pool
  useEffect(() => {
    let off = false;
    fetch(apiBase + "/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && Array.isArray(d.videos)) setPool(d.videos); })
      .catch(() => {});
    return () => { off = true; };
  }, []);

  // everything that depends on which video is open
  useEffect(() => {
    const id = video._id;
    let off = false;
    setComments([]); setCText(""); setCErr(""); setExpanded(false); setOpenRow("");
    setSaved(readSaved().indexOf(id) !== -1);
    if (pageRef.current) pageRef.current.scrollTo({ top: 0 });

    // counts a view + tells us if I already liked it
    fetch(apiBase + "/videos/" + id, { headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (off || !d || !d.video) return;
        setVideo((v) => (v._id === id ? { ...v, views: d.video.views, liked: Boolean(d.liked), disliked: Boolean(d.disliked) } : v));
      })
      .catch(() => {});

    setCLoading(true);
    fetch(apiBase + "/videos/" + id + "/comments", { headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (off || !d) return;
        setComments(Array.isArray(d.comments) ? d.comments : []);
        setOwnerId(d.owner ? String(d.owner) : "");
      })
      .catch(() => {})
      .finally(() => { if (!off) setCLoading(false); });

    return () => { off = true; };
  }, [video._id]);

  // channel info (followers + am I following)
  useEffect(() => {
    if (!authorId) return;
    let off = false;
    setChan({ followers: 0, following: false });
    fetch(apiBase + "/users/" + authorId, { headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!off && d) setChan({ followers: d.followersCount || 0, following: Boolean(d.isFollowing) });
      })
      .catch(() => {});
    return () => { off = true; };
  }, [authorId]);

  const like = () => {
    if (!token) { flash("Login to like videos"); return; }
    fetch(apiBase + "/videos/" + video._id + "/like", { method: "POST", headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setVideo((v) => ({ ...v, liked: d.liked, disliked: Boolean(d.disliked), likesCount: d.likesCount })); })
      .catch(() => {});
  };

  const dislike = () => {
    if (!token) { flash("Login to react to videos"); return; }
    fetch(apiBase + "/videos/" + video._id + "/dislike", { method: "POST", headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setVideo((v) => ({ ...v, disliked: d.disliked, liked: d.liked, likesCount: d.likesCount })); })
      .catch(() => {});
  };

  const likeComment = (id) => {
    if (!token) { flash("Login to like comments"); return; }
    fetch(apiBase + "/videos/" + video._id + "/comments/" + id + "/like", { method: "POST", headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setComments((list) => list.map((c) => (c._id === id ? { ...c, liked: d.liked, likesCount: d.likesCount } : c)));
      })
      .catch(() => {});
  };

  const follow = () => {
    if (!token) { flash("Login to subscribe"); return; }
    fetch(apiBase + "/users/" + authorId + "/follow", { method: "POST", headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setChan({ followers: d.followersCount, following: d.following }); })
      .catch(() => {});
  };

  const share = async () => {
    const data = { title: video.title, text: video.title, url: video.videoUrl };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(video.videoUrl);
      flash("Link copied");
    } catch (e) { /* share sheet dismissed */ }
  };

  const download = () => {
    const url = String(video.videoUrl).replace("/video/upload/", "/video/upload/fl_attachment/");
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.download = "";
    document.body.appendChild(a); a.click(); a.remove();
  };

  const toggleSave = () => {
    const list = readSaved();
    const i = list.indexOf(video._id);
    if (i === -1) list.push(video._id); else list.splice(i, 1);
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (e) {}
    setSaved(i === -1);
    flash(i === -1 ? "Saved" : "Removed from saved");
  };

  const postComment = () => {
    const text = cText.trim();
    if (!text || posting || !token) return;
    setPosting(true); setCErr("");
    fetch(apiBase + "/videos/" + video._id + "/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ text }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then((res) => {
        if (!res.ok) { setCErr(res.d.error || "Could not post comment"); return; }
        setComments((c) => [res.d.comment].concat(c));
        setCText("");
        setVideo((v) => ({ ...v, commentsCount: res.d.commentsCount }));
      })
      .catch(() => setCErr("No connection. Try again."))
      .finally(() => setPosting(false));
  };

  const removeComment = (id) => {
    setOpenRow("");
    fetch(apiBase + "/videos/" + video._id + "/comments/" + id, { method: "DELETE", headers: auth })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setComments((c) => c.filter((x) => x._id !== id));
        setVideo((v) => ({ ...v, commentsCount: d.commentsCount }));
      })
      .catch(() => {});
  };

  // suggestions
  const others = pool.filter((v) => v._id !== video._id);
  const tags = video.hashtags || [];
  const tabs = [
    { key: "next", label: "Up Next", list: others },
    { key: "related", label: "Related", list: others.filter((v) => v.category === video.category || (v.hashtags || []).some((t) => tags.indexOf(t) !== -1)) },
  ];
  if (authorId) tabs.push({ key: "author", label: "From " + authorName, list: others.filter((v) => v.author && v.author._id === authorId) });
  if (video.category) tabs.push({ key: "cat", label: video.category, list: others.filter((v) => v.category === video.category) });
  if (video.community && video.community !== video.category) tabs.push({ key: "comm", label: video.community, list: others.filter((v) => v.community === video.community) });
  const current = tabs.find((t) => t.key === tab) || tabs[0];

  const shownComments = comments.slice().sort((a, b) => {
    const d = new Date(a.createdAt) - new Date(b.createdAt);
    return sort === "newest" ? -d : d;
  });
  const total = comments.length;
  const myName = me ? me.channelName : "";

  return (
    <div className="wp" ref={pageRef}>
      <style>{WATCH_CSS}</style>

      <header className="wp-top">
        <button type="button" className="wp-ic" onClick={onClose} aria-label="Back"><ArrowLeft size={24} /></button>
        <span className="wp-logo">
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <defs>
              <linearGradient id="wpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2be4ff" /><stop offset="1" stopColor="#0096e0" /></linearGradient>
            </defs>
            <rect x="2" y="2" width="26" height="26" rx="8" fill="url(#wpg)" />
            <path d="M11.5 8.8 21.5 15l-10 6.2z" fill="#06141f" />
          </svg>
          <b>Tolvify</b>
        </span>
        <span className="wp-spacer" />
        {token && <Face name={myName} url={me ? me.avatarUrl : ""} size={34} ring />}
      </header>

      <div className="wp-body">
      <div className="wp-main">
      <WatchPlayer key={video._id} video={video} />

      <section className="wp-pad">
        <div className="wp-title-row">
          <h1>{video.title}</h1>
          <button type="button" className={"wp-ic wp-chev" + (expanded ? " up" : "")} onClick={() => setExpanded((x) => !x)} aria-label="Show details">
            <ChevronDown size={22} />
          </button>
        </div>
        <p className="wp-meta">
          <span className="wp-nw">{short(video.views)} views <i>•</i> {ago(video.createdAt)}</span>
          {tags.map((t) => <span key={t} className="wp-tag">#{t}</span>)}
        </p>

        <div className="wp-chan">
          <Face name={authorName} url={video.author ? video.author.avatarUrl : ""} size={48} ring />
          <div className="wp-chan-txt">
            <strong>{authorName}</strong>
            <span>{short(chan.followers)} subscribers</span>
          </div>
          {!isOwn && authorId && (
            <button type="button" className={"wp-sub" + (chan.following ? " done" : "")} onClick={follow}>
              {chan.following ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>

        <div className="wp-actions">
          <button type="button" className={"wp-pill" + (video.liked ? " lit" : "")} onClick={like}>
            <ThumbsUp size={19} fill={video.liked ? "currentColor" : "none"} /> {short(video.likesCount)}
          </button>
          <button type="button" className={"wp-pill wp-icon-only" + (video.disliked ? " lit" : "")} onClick={dislike} aria-label="Dislike">
            <ThumbsDown size={19} fill={video.disliked ? "currentColor" : "none"} />
          </button>
          <button type="button" className="wp-pill" onClick={share}><Share2 size={19} /> Share</button>
          <button type="button" className="wp-pill" onClick={download}><Download size={19} /> Download</button>
          <button type="button" className={"wp-pill" + (saved ? " lit" : "")} onClick={toggleSave}>
            <Bookmark size={19} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
        </div>

        <div className="wp-desc">
          <p className={expanded ? "open" : ""}>{video.description}</p>
          <button type="button" onClick={() => setExpanded((x) => !x)}>{expanded ? "Show less" : "Show more"}</button>
        </div>
      </section>

      <section className="wp-pad wp-comments">
        <div className="wp-ch">
          <h2>Comments <span>({short(video.commentsCount != null ? video.commentsCount : total)})</span></h2>
          <div className="wp-menu-wrap">
            <button type="button" className="wp-sort" onClick={() => setSortOpen((o) => !o)}>
              <ListFilter size={18} /> Sort by
            </button>
            {sortOpen && (
              <div className="wp-menu wp-menu-r" role="menu">
                <button type="button" className={sort === "newest" ? "sel" : ""} onClick={() => { setSort("newest"); setSortOpen(false); }}>Newest first</button>
                <button type="button" className={sort === "oldest" ? "sel" : ""} onClick={() => { setSort("oldest"); setSortOpen(false); }}>Oldest first</button>
              </div>
            )}
          </div>
        </div>

        {video.allowComments === false ? (
          <p className="wp-note">Comments are turned off for this video.</p>
        ) : token ? (
          <div className="wp-cform">
            <Face name={myName} url={me ? me.avatarUrl : ""} size={38} />
            <input
              value={cText}
              onChange={(e) => setCText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") postComment(); }}
              placeholder="Add a comment..."
              maxLength={500}
            />
            {cText.trim() && (
              <button type="button" onClick={postComment} disabled={posting}>{posting ? "..." : "Post"}</button>
            )}
          </div>
        ) : (
          <p className="wp-note">Log in to join the conversation.</p>
        )}
        {cErr && <p className="wp-err" role="alert">{cErr}</p>}
        {cLoading && <p className="wp-note">Loading comments...</p>}
        {!cLoading && total === 0 && video.allowComments !== false && (
          <p className="wp-note">No comments yet. Be the first to comment.</p>
        )}

        {shownComments.map((c) => {
          const canDelete = Boolean(userId) && (c.author._id === userId || ownerId === userId);
          return (
            <div key={c._id} className="wp-comment">
              <Face name={c.author.name} url={c.author.avatarUrl} size={40} />
              <div className="wp-ctext">
                <strong>{c.author.name} <em>{ago(c.createdAt)}</em></strong>
                <span>{c.text}</span>
                <button type="button" className={"wp-clike" + (c.liked ? " lit" : "")} onClick={() => likeComment(c._id)} aria-label="Like comment">
                  <ThumbsUp size={15} fill={c.liked ? "currentColor" : "none"} /> {c.likesCount > 0 ? short(c.likesCount) : "Like"}
                </button>
              </div>
              {canDelete && (
                <div className="wp-menu-wrap">
                  <button type="button" className="wp-ic" onClick={() => setOpenRow(openRow === c._id ? "" : c._id)} aria-label="Comment options">
                    <MoreVertical size={20} />
                  </button>
                  {openRow === c._id && (
                    <div className="wp-menu wp-menu-r" role="menu">
                      <button type="button" onClick={() => removeComment(c._id)}><Trash2 size={15} /> Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      </div>

      <aside className="wp-side">
      <section className="wp-next">
        <div className="wp-tabs" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === current.key} className={t.key === current.key ? "on" : ""} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {current.list.length === 0 && <p className="wp-note wp-pad">No videos here yet.</p>}
        {current.list.map((v) => (
          <button key={v._id} type="button" className="wp-row" onClick={() => setVideo({ ...v, liked: false, disliked: false })}>
            <span className="wp-thumb">
              <img src={v.thumbnailUrl} alt="" loading="lazy" />
              <em>{clock(v.duration)}</em>
            </span>
            <span className="wp-row-txt">
              <strong>{v.title}</strong>
              <span className="wp-row-by">{v.author ? v.author.name : "Unknown"}</span>
              <span className="wp-row-sub">{short(v.views)} views <i>•</i> {ago(v.createdAt)}</span>
            </span>
          </button>
        ))}
      </section>
      </aside>
      </div>

      {toast && <div className="wp-toast" role="status">{toast}</div>}
    </div>
  );
}

const WATCH_CSS = `
.wp {
  --bg: #07121d; --panel: #0e2033; --panel-2: #132b42; --line: #1b3752;
  --cyan: #22d6f4; --cyan-2: #00a9e8; --text: #f1f6fa; --muted: #8aa5bb;
  position: fixed; inset: 0; z-index: 1000; overflow-y: auto; overflow-x: hidden;
  background: var(--bg); color: var(--text);
  font-family: Inter, -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
  max-width: 720px; margin: 0 auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  -webkit-tap-highlight-color: transparent;
}
.wp button { font-family: inherit; color: inherit; }
.wp *:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
.wp i { font-style: normal; opacity: 0.7; margin: 0 4px; }

.wp-top {
  position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 10px;
  padding: calc(8px + env(safe-area-inset-top, 0px)) 14px 8px 8px; background: var(--bg);
}
.wp-spacer { flex: 1; }
.wp-logo { display: flex; align-items: center; gap: 8px; font-size: 22px; letter-spacing: -0.3px; }
.wp-logo b { font-weight: 700; color: var(--cyan); }
.wp-ic {
  background: transparent; border: none; cursor: pointer; width: 40px; height: 40px;
  display: inline-grid; place-items: center; border-radius: 50%; flex: 0 0 auto;
}

.wp-face {
  flex: 0 0 auto; border-radius: 50%; overflow: hidden; display: inline-grid; place-items: center;
  background: linear-gradient(135deg, #1c6f8e, #0b3a57); color: #dff7ff; font-weight: 700;
}
.wp-face img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp-ring { box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--cyan); }

.wp-player { position: relative; aspect-ratio: 16 / 9; background: #000; overflow: hidden; cursor: pointer; }
.wp-player:fullscreen { aspect-ratio: auto; width: 100%; height: 100%; }
.wp-player video { width: 100%; height: 100%; object-fit: contain; display: block; }
.wp-chip {
  position: absolute; top: 12px; left: 12px; padding: 6px 14px; border-radius: 999px; font-size: 14px;
  background: rgba(7, 18, 29, 0.72); backdrop-filter: blur(6px); pointer-events: none;
}
.wp-bigplay {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 68px; height: 68px;
  border-radius: 50%; display: grid; place-items: center; background: rgba(7, 18, 29, 0.66);
  backdrop-filter: blur(6px); color: #fff; pointer-events: none; padding-left: 4px;
}
.wp-bar {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 10px 6px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.75)); opacity: 0; transition: opacity 0.2s;
  cursor: default;
}
.wp-player.on .wp-bar { opacity: 1; }
.wp-bar-row { display: flex; align-items: center; gap: 2px; }
.wp-time { font-size: 13.5px; margin-left: 4px; font-variant-numeric: tabular-nums; }
.wp-seek { height: 26px; display: flex; align-items: center; touch-action: none; cursor: pointer; padding: 0 4px; }
.wp-track { position: relative; width: 100%; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, 0.28); }
.wp-fill { height: 100%; border-radius: 2px; background: var(--cyan); }
.wp-knob {
  position: absolute; top: 50%; width: 16px; height: 16px; border-radius: 50%; background: var(--cyan);
  transform: translate(-50%, -50%); box-shadow: 0 0 0 4px rgba(34, 214, 244, 0.25);
}

.wp-menu-wrap { position: relative; display: inline-flex; }
.wp-menu {
  position: absolute; bottom: 46px; right: 0; z-index: 8; min-width: 150px; padding: 6px;
  background: var(--panel-2); border: 1px solid var(--line); border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}
.wp-menu-r { bottom: auto; top: 44px; }
.wp-menu p { margin: 4px 10px 6px; font-size: 12px; color: var(--muted); }
.wp-menu button {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; background: transparent;
  border: none; padding: 10px; border-radius: 9px; font-size: 14px; cursor: pointer;
}
.wp-menu button:hover { background: var(--panel); }
.wp-menu button.sel { color: var(--cyan); font-weight: 600; }

.wp-pad { padding-left: 14px; padding-right: 14px; }
.wp-title-row { display: flex; align-items: flex-start; gap: 6px; margin-top: 14px; }
.wp-title-row h1 { flex: 1; margin: 0; font-size: 22px; line-height: 1.25; font-weight: 700; letter-spacing: -0.3px; }
.wp-chev { margin: -4px -8px 0 0; }
.wp-chev svg { transition: transform 0.2s; }
.wp-chev.up svg { transform: rotate(180deg); }
.wp-meta { margin: 6px 0 0; color: var(--muted); font-size: 14.5px; line-height: 1.6; }
.wp-nw { white-space: nowrap; }
.wp-tag { color: var(--cyan); margin-left: 10px; white-space: nowrap; }

.wp-chan { display: flex; align-items: center; gap: 14px; margin-top: 16px; }
.wp-chan-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.wp-chan-txt strong { font-size: 17px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wp-chan-txt span { color: var(--muted); font-size: 14.5px; }
.wp-sub {
  border: none; cursor: pointer; padding: 13px 26px; border-radius: 999px; font-size: 16px; font-weight: 700;
  color: #03141f; background: linear-gradient(135deg, #2be8ff, #00b4ec);
}
.wp-sub.done { background: var(--panel-2); color: var(--text); border: 1px solid var(--line); }

.wp-actions { display: flex; gap: 10px; margin: 16px -14px 0; padding: 0 14px 4px; overflow-x: auto; scrollbar-width: none; }
.wp-actions::-webkit-scrollbar { display: none; }
.wp-pill {
  flex: 0 0 auto; display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 999px;
  background: var(--panel); border: 1px solid var(--line); font-size: 15px; font-weight: 500; cursor: pointer;
}
.wp-icon-only { padding: 11px 15px; }
.wp-clike { align-self: flex-start; display: inline-flex; align-items: center; gap: 6px; margin-top: 4px; padding: 4px 0; background: none; border: none; color: var(--muted); font-size: 13.5px; cursor: pointer; }
.wp-clike.lit { color: var(--cyan); }
.wp-pill.lit { color: var(--cyan); border-color: rgba(34, 214, 244, 0.5); }

.wp-desc { margin-top: 14px; padding: 14px 16px; border-radius: 16px; background: var(--panel); border: 1px solid var(--line); }
.wp-desc p {
  margin: 0; font-size: 15.5px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wp-desc p.open { display: block; -webkit-line-clamp: unset; }
.wp-desc button { margin-top: 8px; padding: 0; background: none; border: none; color: var(--cyan); font-size: 15.5px; cursor: pointer; }

.wp-comments { margin-top: 20px; }
.wp-ch { display: flex; align-items: center; justify-content: space-between; }
.wp-ch h2 { margin: 0; font-size: 20px; font-weight: 700; }
.wp-ch h2 span { color: var(--cyan); font-weight: 500; }
.wp-sort { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; font-size: 15px; cursor: pointer; padding: 8px 0 8px 8px; }
.wp-cform { display: flex; align-items: center; gap: 12px; margin: 14px 0; }
.wp-cform input {
  flex: 1; min-width: 0; padding: 13px 18px; border-radius: 999px; font-size: 15.5px; outline: none;
  background: var(--panel); border: 1px solid var(--line); color: var(--text);
}
.wp-cform input::placeholder { color: #6f93ad; }
.wp-cform input:focus { border-color: var(--cyan); }
.wp-cform button {
  border: none; cursor: pointer; padding: 11px 18px; border-radius: 999px; font-weight: 700; font-size: 14px;
  color: #03141f; background: linear-gradient(135deg, #2be8ff, #00b4ec);
}
.wp-cform button:disabled { opacity: 0.5; }
.wp-note { color: var(--muted); font-size: 14.5px; margin: 12px 0; }
.wp-err { color: #ff8a9b; font-size: 13.5px; margin: 8px 0; }
.wp-comment { display: flex; gap: 12px; align-items: flex-start; margin: 16px 0; }
.wp-ctext { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.wp-ctext strong { font-size: 15.5px; }
.wp-ctext em { font-style: normal; font-weight: 400; color: var(--muted); font-size: 13.5px; margin-left: 6px; }
.wp-ctext span { font-size: 15px; line-height: 1.45; word-break: break-word; }

.wp-next { margin-top: 10px; border-top: 1px solid var(--line); padding-bottom: 40px; }
.wp-tabs { display: flex; gap: 10px; padding: 14px; overflow-x: auto; scrollbar-width: none; }
.wp-tabs::-webkit-scrollbar { display: none; }
.wp-tabs button {
  flex: 0 0 auto; padding: 10px 18px; border-radius: 999px; font-size: 15px; font-weight: 500; cursor: pointer;
  background: var(--panel); border: 1px solid transparent;
}
.wp-tabs button.on { background: linear-gradient(135deg, #2be8ff, #00b4ec); color: #03141f; font-weight: 700; }
.wp-row { display: flex; gap: 12px; width: 100%; text-align: left; padding: 8px 14px; background: none; border: none; cursor: pointer; }
.wp-thumb { position: relative; flex: 0 0 158px; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; background: var(--panel); }
.wp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp-thumb em {
  position: absolute; right: 6px; bottom: 6px; padding: 2px 6px; border-radius: 6px; font-style: normal;
  font-size: 12.5px; background: rgba(0, 0, 0, 0.78);
}
.wp-row-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.wp-row-txt strong {
  font-size: 15.5px; line-height: 1.3; font-weight: 600;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wp-row-by { color: var(--cyan); font-size: 14px; }
.wp-row-sub { color: var(--muted); font-size: 13.5px; }

.wp-toast {
  position: fixed; left: 50%; bottom: calc(24px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
  padding: 11px 20px; border-radius: 999px; background: var(--panel-2); border: 1px solid var(--line);
  font-size: 14.5px; z-index: 20; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
/* desktop: player + info on the left, Up Next on the right */
@media (min-width: 1024px) {
  .wp { max-width: none; }
  .wp-top { padding: 10px 24px; }
  .wp-body { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 28px; padding: 8px 28px 40px; align-items: start; }
  .wp-main { min-width: 0; }
  .wp-player { border-radius: 16px; }
  .wp-pad { padding-left: 0; padding-right: 0; }
  .wp-actions { margin-left: 0; margin-right: 0; padding-left: 0; }
  .wp-next { margin-top: 0; border-top: none; }
  .wp-tabs { padding: 0 0 14px; flex-wrap: wrap; }
  .wp-row { padding: 8px 0; }
}
@media (prefers-reduced-motion: reduce) { .wp * { transition: none !important; } }
`;


