import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Search, Bell, ThumbsUp, ThumbsDown, Share2, Download, Bookmark,
  MoreHorizontal, MoreVertical, ChevronDown, ChevronUp, Play, Pause, Volume2, VolumeX,
  Settings, Maximize, Minimize, Trash2, X,
} from "lucide-react";
import butterflyImg from "./assets/ballonfly-butterfly.png";
import wordmarkImg from "./assets/ballonfly-wordmark.png";

/* ---------- small helpers ---------- */
function count(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
}
function ago(d) {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, sec] of units) {
    if (s >= sec) {
      const v = Math.floor(s / sec);
      return v + " " + name + (v > 1 ? "s" : "") + " ago";
    }
  }
  return "just now";
}
function clock(sec) {
  sec = Math.max(0, Math.floor(Number(sec) || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return (h ? h + ":" : "") + mm + ":" + String(s).padStart(2, "0");
}

export function Logo() {
  return (
    <>
      <img className="wp-logo-bf" src={butterflyImg} alt="" draggable="false" />
      <img className="wp-logo-wm" src={wordmarkImg} alt="Ballonfly" draggable="false" />
    </>
  );
}

function Avatar({ name, url, size = 40, ring }) {
  const dim = "max(" + (size * 0.55).toFixed(1) + "px, calc(var(--u) * " + size + "))";
  const style = { width: dim, height: dim, fontSize: "calc(" + dim + " * 0.42)" };
  return (
    <span className={"wp-av" + (ring ? " wp-av-ring" : "")} style={style}>
      {url ? <img src={url} alt="" /> : String(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 6h18M3 12h12M3 18h7" />
    </svg>
  );
}

function Verified({ className }) {
  return (
    <svg className={"wp-tick" + (className ? " " + className : "")} viewBox="0 0 24 24" aria-label="Verified" role="img">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path d="M7.2 12.4l3.2 3.2 6.4-6.6" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- custom video player ---------- */
const LEVELS = [1080, 720, 480, 360, 240, 144];
const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Cloudinary makes the smaller versions on the fly from the original upload
function qualityUrl(url, h) {
  const tag = "/video/upload/";
  if (!url || url.indexOf(tag) === -1) return url;
  return url.replace(tag, tag + "h_" + h + ",c_limit,q_auto/");
}

function Player({ src, poster, chip, toast, api, videoId, token, isOwn }) {
  const wrap = useRef(null);
  const vid = useRef(null);
  const bar = useRef(null);
  const hideT = useRef(null);
  const resume = useRef(null);
  const fileRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [muted, setMuted] = useState(false);
  const [ui, setUi] = useState(true);
  const [menu, setMenu] = useState("");
  const [rate, setRate] = useState(1);
  const [fs, setFs] = useState(false);
  const [quality, setQuality] = useState("auto");
  const [origH, setOrigH] = useState(0);
  const [tracks, setTracks] = useState([]);
  const [ccId, setCcId] = useState("");
  const [portrait, setPortrait] = useState(false);
  const [cues, setCues] = useState([]);

  const canQuality = src && src.indexOf("/video/upload/") > -1;
  const curSrc = quality === "auto" || !canQuality ? src : qualityUrl(src, quality);
  const levels = LEVELS.filter((h) => !origH || h <= origH);
  const chipRes = quality === "auto" ? (origH ? origH + "P" : "") : quality + "P";
  const authH = token ? { Authorization: "Bearer " + token } : {};

  const poke = () => {
    setUi(true);
    clearTimeout(hideT.current);
    const v = vid.current;
    if (v && !v.paused) {
      hideT.current = setTimeout(() => { setUi(false); setMenu(""); }, 3500);
    }
  };
  useEffect(() => () => clearTimeout(hideT.current), []);

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const loadTracks = () => {
    fetch(api + "/videos/" + videoId + "/subtitles")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && Array.isArray(d.tracks)) setTracks(d.tracks); })
      .catch(() => {});
  };
  useEffect(loadTracks, [videoId]);

  const toggle = () => {
    const v = vid.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seekTo = (e) => {
    const v = vid.current;
    const b = bar.current;
    if (!v || !b || !v.duration) return;
    const r = b.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    v.currentTime = ratio * v.duration;
    setCur(v.currentTime);
  };
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e);
    poke();
  };
  const onMove = (e) => { if (e.buttons) seekTo(e); };

  const fullscreen = () => {
    const w = wrap.current;
    const v = vid.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (w && w.requestFullscreen) w.requestFullscreen().catch(() => {});
    else if (v && v.webkitEnterFullscreen) v.webkitEnterFullscreen();
  };

  const pickQuality = (q) => {
    const v = vid.current;
    if (v) resume.current = { t: v.currentTime, play: !v.paused };
    setQuality(q);
    setMenu("");
  };
  const pickRate = (r) => {
    if (vid.current) vid.current.playbackRate = r;
    setRate(r);
    setMenu("");
  };
  const pickTrack = (id) => {
    setMenu("");
    if (!id) { setCcId(""); setCues([]); return; }
    fetch(api + "/videos/" + videoId + "/subtitles/" + id)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return toast("Subtitles load nahi hue");
        setCues(d.cues || []);
        setCcId(id);
      })
      .catch(() => toast("Internet ka masla"));
  };
  const onCcButton = () => {
    if (tracks.length === 0 && !isOwn) { toast("Is video ke subtitles available nahi hain"); return; }
    setMenu(menu === "cc" ? "" : "cc");
  };

  const addSubs = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const label = window.prompt("Subtitle ki language ka naam likhein (jaise English, Urdu)", "English");
    if (!label || !label.trim()) return;
    f.text()
      .then((text) => fetch(api + "/videos/" + videoId + "/subtitles", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH },
        body: JSON.stringify({ label: label.trim(), text }),
      }))
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) return toast(d.error || "Subtitles add nahi hue");
        toast("Subtitles add ho gaye");
        loadTracks();
        setMenu("");
      })
      .catch(() => toast("File read nahi ho saki"));
  };
  const delTrack = (id) => {
    fetch(api + "/videos/" + videoId + "/subtitles/" + id, { method: "DELETE", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        if (ccId === id) { setCcId(""); setCues([]); }
        loadTracks();
      })
      .catch(() => {});
  };

  let line = "";
  if (ccId && cues.length) {
    for (let i = 0; i < cues.length; i++) {
      if (cur >= cues[i].start && cur <= cues[i].end) { line = cues[i].text; break; }
    }
  }
  const ccName = ccId ? ((tracks.find((t) => t._id === ccId) || {}).label || "On") : "Off";
  const pct = dur ? (cur / dur) * 100 : 0;

  return (
    <div className={"wp-player" + (ui || !playing ? " ui" : "") + (portrait ? " portrait" : "")} ref={wrap} onMouseMove={poke}>
      <video
        ref={vid}
        src={curSrc}
        poster={poster}
        autoPlay
        playsInline
        onClick={() => { if (!ui && playing) poke(); else toggle(); poke(); }}
        onPlay={() => { setPlaying(true); poke(); }}
        onPause={() => { setPlaying(false); setUi(true); }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          setDur(v.duration || 0);
          if (quality === "auto" && v.videoHeight) setOrigH(v.videoHeight);
          setPortrait(v.videoHeight > v.videoWidth);
          v.playbackRate = rate;
          if (resume.current) {
            v.currentTime = resume.current.t;
            if (resume.current.play) v.play().catch(() => {});
            resume.current = null;
          }
        }}
      />
      {line && <div className="wp-sub-text"><span>{line}</span></div>}
      <div className="wp-ptop">
        {chip ? <span className="wp-chip">{chip}</span> : <span />}
        <div className="wp-ptop-r">
          {chipRes && <span className="wp-chip">{chipRes}</span>}
          <button type="button" className="wp-pbtn" onClick={fullscreen} aria-label="Fullscreen">
            {fs ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
      <div className="wp-pbot" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="wp-pbtn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
        <span className="wp-time">{clock(cur)} / {clock(dur)}</span>
        <div className="wp-seek" ref={bar} onPointerDown={onDown} onPointerMove={onMove}>
          <div className="wp-seek-fill" style={{ width: pct + "%" }} />
          <div className="wp-seek-dot" style={{ left: pct + "%" }} />
        </div>
        <button
          type="button"
          className="wp-pbtn"
          onClick={() => { const v = vid.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }}
          aria-label="Mute"
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button type="button" className={"wp-pbtn wp-cc" + (ccId ? " on" : "")} onClick={onCcButton} aria-label="Subtitles">CC</button>
        <button type="button" className="wp-pbtn" onClick={() => setMenu(menu === "main" ? "" : "main")} aria-label="Settings">
          <Settings size={20} />
        </button>
        <button type="button" className="wp-pbtn" onClick={fullscreen} aria-label="Fullscreen">
          {fs ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {menu && (
          <div className="wp-menu">
            {menu === "main" && (
              <>
                <button type="button" onClick={() => setMenu("quality")}><span>Quality</span><em>{quality === "auto" ? "Auto" + (origH ? " (" + origH + "P)" : "") : quality + "P"}</em></button>
                <button type="button" onClick={() => setMenu("speed")}><span>Speed</span><em>{rate === 1 ? "Normal" : rate + "x"}</em></button>
                <button type="button" onClick={() => setMenu("cc")}><span>Subtitles</span><em>{ccName}</em></button>
              </>
            )}
            {menu === "quality" && (
              <>
                <strong onClick={() => setMenu("main")}>‹ Quality</strong>
                <button type="button" className={quality === "auto" ? "on" : ""} onClick={() => pickQuality("auto")}>
                  <span>Auto{origH ? " (" + origH + "P)" : ""}</span>
                </button>
                {canQuality && levels.map((h) => (
                  <button key={h} type="button" className={quality === h ? "on" : ""} onClick={() => pickQuality(h)}>
                    <span>{h}P</span>{h >= 1080 ? <em>HD</em> : null}
                  </button>
                ))}
              </>
            )}
            {menu === "speed" && (
              <>
                <strong onClick={() => setMenu("main")}>‹ Speed</strong>
                {RATES.map((r) => (
                  <button key={r} type="button" className={r === rate ? "on" : ""} onClick={() => pickRate(r)}>
                    <span>{r === 1 ? "Normal" : r + "x"}</span>
                  </button>
                ))}
              </>
            )}
            {menu === "cc" && (
              <>
                <strong onClick={() => setMenu("main")}>‹ Subtitles</strong>
                <button type="button" className={!ccId ? "on" : ""} onClick={() => pickTrack("")}><span>Off</span></button>
                {tracks.map((t) => (
                  <div key={t._id} className="wp-menu-row">
                    <button type="button" className={ccId === t._id ? "on" : ""} onClick={() => pickTrack(t._id)}><span>{t.label}</span></button>
                    {isOwn && <button type="button" className="wp-menu-x" onClick={() => delTrack(t._id)} aria-label="Delete subtitles"><X size={14} /></button>}
                  </div>
                ))}
                {tracks.length === 0 && <p>Abhi koi subtitles nahi.</p>}
                {isOwn && (
                  <button type="button" className="wp-menu-add" onClick={() => fileRef.current && fileRef.current.click()}>
                    + Add subtitles (.srt / .vtt)
                  </button>
                )}
              </>
            )}
          </div>
        )}
        <input ref={fileRef} type="file" accept=".srt,.vtt,text/vtt" hidden onChange={addSubs} />
      </div>
    </div>
  );
}

/* ---------- the watch page ---------- */
export default function WatchPage({ api, token, userId, initial, categories, onClose, onOpen }) {
  const [video, setVideo] = useState(initial);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subs, setSubs] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [cLoading, setCLoading] = useState(true);
  const [sort, setSort] = useState("new");
  const [sortOpen, setSortOpen] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [cErr, setCErr] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [replyText, setReplyText] = useState("");
  const [shown, setShown] = useState({});
  const [cMenu, setCMenu] = useState("");
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("next");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const [me, setMe] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastT = useRef(null);
  const rootRef = useRef(null);

  const id = initial._id;
  const authH = token ? { Authorization: "Bearer " + token } : {};
  const jsonH = { "Content-Type": "application/json", ...authH };

  const toast = (m) => {
    setToastMsg(m);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToastMsg(""), 2200);
  };
  useEffect(() => () => clearTimeout(toastT.current), []);

  const needLogin = () => {
    if (token) return false;
    toast("Pehle login karein");
    return true;
  };

  // video details
  useEffect(() => {
    let off = false;
    fetch(api + "/videos/" + id, { headers: authH })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (off || !d.video) return;
        setVideo(d.video);
        setLiked(Boolean(d.liked));
        setDisliked(Boolean(d.disliked));
        setSaved(Boolean(d.saved));
        setSubscribed(Boolean(d.subscribed));
        setSubs(d.subscribersCount || 0);
      })
      .catch(() => { if (!off) { toast("Video load nahi ho saka"); setTimeout(onClose, 900); } });
    return () => { off = true; };
    // eslint-disable-next-line
  }, [id]);

  // comments
  useEffect(() => {
    let off = false;
    setCLoading(true);
    fetch(api + "/videos/" + id + "/comments", { headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (off || !d) return;
        setComments(Array.isArray(d.comments) ? d.comments : []);
        setOwnerId(d.owner ? String(d.owner) : "");
      })
      .catch(() => {})
      .finally(() => { if (!off) setCLoading(false); });
    return () => { off = true; };
    // eslint-disable-next-line
  }, [id]);

  // side list
  useEffect(() => {
    let off = false;
    fetch(api + "/videos")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && Array.isArray(d.videos)) setList(d.videos); })
      .catch(() => {});
    return () => { off = true; };
    // eslint-disable-next-line
  }, []);

  // header: bell count + my avatar
  useEffect(() => {
    if (!token) return undefined;
    let off = false;
    fetch(api + "/notifications/unread-count", { headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d) setUnread(d.count || 0); })
      .catch(() => {});
    fetch(api + "/auth/me", { headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!off && d && d.user) setMe(d.user); })
      .catch(() => {});
    return () => { off = true; };
    // eslint-disable-next-line
  }, [token]);

  const author = video.author || {};
  const isOwn = userId && author._id && String(author._id) === String(userId);
  const ready = Boolean(video.videoUrl);
  const link = window.location.origin + window.location.pathname + "?v=" + id;

  /* ----- actions ----- */
  const doLike = () => {
    if (needLogin()) return;
    fetch(api + "/videos/" + id + "/like", { method: "POST", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setLiked(d.liked);
        setDisliked(false);
        setVideo((v) => ({ ...v, likesCount: d.likesCount }));
      })
      .catch(() => {});
  };
  const doDislike = () => {
    if (needLogin()) return;
    fetch(api + "/videos/" + id + "/dislike", { method: "POST", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setDisliked(d.disliked);
        setLiked(false);
        setVideo((v) => ({ ...v, likesCount: d.likesCount }));
      })
      .catch(() => {});
  };
  const doSave = () => {
    if (needLogin()) return;
    fetch(api + "/videos/" + id + "/save", { method: "POST", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSaved(d.saved);
        toast(d.saved ? "Video save ho gayi" : "Save hatai gayi");
      })
      .catch(() => {});
  };
  const doSubscribe = () => {
    if (needLogin() || !author._id) return;
    fetch(api + "/users/" + author._id + "/follow", { method: "POST", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSubscribed(d.following);
        setSubs(d.followersCount);
      })
      .catch(() => {});
  };
  const copyLink = () => {
    setMoreOpen(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => toast("Link copy ho gaya")).catch(() => toast(link));
    } else {
      toast(link);
    }
  };
  const copyText = (t) => {
    setCMenu("");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(() => toast("Comment copy ho gaya")).catch(() => {});
    }
  };
  const doShare = () => {
    if (navigator.share) {
      navigator.share({ title: video.title, text: video.title + " - Ballonfly", url: link }).catch(() => {});
    } else {
      copyLink();
    }
  };
  const doDownload = () => {
    if (!video.videoUrl) return;
    const u = video.videoUrl.indexOf("/upload/") > -1
      ? video.videoUrl.replace("/upload/", "/upload/fl_attachment/")
      : video.videoUrl;
    const a = document.createElement("a");
    a.href = u;
    a.download = (video.title || "video") + ".mp4";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Download shuru ho raha hai");
  };

  /* ----- comments ----- */
  const postComment = () => {
    const t = text.trim();
    if (!t || posting || needLogin()) return;
    setPosting(true);
    setCErr("");
    fetch(api + "/videos/" + id + "/comments", { method: "POST", headers: jsonH, body: JSON.stringify({ text: t }) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) return setCErr(d.error || "Comment nahi ho saka");
        setComments((c) => [d.comment].concat(c));
        setVideo((v) => ({ ...v, commentsCount: d.commentsCount }));
        setText("");
      })
      .catch(() => setCErr("Internet ka masla, dobara try karein"))
      .finally(() => setPosting(false));
  };
  const updateComment = (cid, patch) =>
    setComments((cs) => cs.map((c) => (c._id === cid ? { ...c, ...patch } : c)));

  const likeComment = (cid, kind) => {
    if (needLogin()) return;
    fetch(api + "/videos/" + id + "/comments/" + cid + "/" + kind, { method: "POST", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) updateComment(cid, { liked: d.liked, disliked: d.disliked, likesCount: d.likesCount }); })
      .catch(() => {});
  };
  const postReply = (cid) => {
    const t = replyText.trim();
    if (!t || needLogin()) return;
    fetch(api + "/videos/" + id + "/comments/" + cid + "/replies", { method: "POST", headers: jsonH, body: JSON.stringify({ text: t }) })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) return toast(d.error || "Reply nahi ho saka");
        setComments((cs) => cs.map((c) => (c._id === cid
          ? { ...c, replies: (c.replies || []).concat(d.reply), repliesCount: d.repliesCount }
          : c)));
        setShown((s) => ({ ...s, [cid]: true }));
        setReplyText("");
        setReplyTo("");
      })
      .catch(() => toast("Internet ka masla"));
  };
  const delComment = (cid) => {
    setCMenu("");
    fetch(api + "/videos/" + id + "/comments/" + cid, { method: "DELETE", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setComments((cs) => cs.filter((c) => c._id !== cid));
        setVideo((v) => ({ ...v, commentsCount: d.commentsCount }));
      })
      .catch(() => {});
  };
  const delReply = (cid, rid) => {
    fetch(api + "/videos/" + id + "/comments/" + cid + "/replies/" + rid, { method: "DELETE", headers: authH })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setComments((cs) => cs.map((c) => (c._id === cid
          ? { ...c, replies: (c.replies || []).filter((x) => x._id !== rid), repliesCount: d.repliesCount }
          : c)));
      })
      .catch(() => {});
  };

  const sorted = sort === "top"
    ? comments.slice().sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    : comments;

  /* ----- side list ----- */
  const tags = (video.hashtags || []).map(String);
  const others = list.filter((v) => v._id !== id);
  const cats = (categories || []).filter((c) => c && c !== "All");
  let shownList = others;
  if (tab === "related") {
    shownList = others.filter((v) => v.category === video.category || (v.hashtags || []).some((t) => tags.indexOf(t) > -1));
  } else if (tab === "author") {
    shownList = others.filter((v) => v.author && author._id && v.author._id === author._id);
  } else if (tab.indexOf("cat:") === 0) {
    const c = tab.slice(4);
    shownList = others.filter((v) => v.category === c);
  }
  const q = query.trim().toLowerCase();
  if (q) {
    shownList = shownList.filter((v) => (v.title || "").toLowerCase().indexOf(q) > -1 ||
      ((v.author && v.author.name) || "").toLowerCase().indexOf(q) > -1);
  }

  const desc = video.description || "";
  const longDesc = desc.length > 90 || desc.indexOf("\n") > -1;
  const total = typeof video.commentsCount === "number" ? video.commentsCount : comments.length;
  const myName = me ? (me.displayName || me.username) : "";

  return (
    <div className="wp" ref={rootRef}>
      <style>{WP_CSS}</style>
      <div className="wp-in">
        <header className="wp-head">
          <button type="button" className="wp-ic" onClick={onClose} aria-label="Back"><ArrowLeft size={26} /></button>
          {searchOpen ? (
            <div className="wp-sbox">
              <Search size={18} />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Videos mein search karein" />
              <button type="button" onClick={() => { setQuery(""); setSearchOpen(false); }} aria-label="Close search"><X size={18} /></button>
            </div>
          ) : (
            <>
              <div className="wp-logo"><Logo /></div>
              <button type="button" className="wp-ic" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={24} /></button>
              <button type="button" className="wp-ic wp-bell" onClick={onClose} aria-label="Notifications">
                <Bell size={24} />
                {unread > 0 && <span className="wp-badge">{unread > 99 ? "99+" : unread}</span>}
              </button>
              <span className="wp-me">
                <Avatar name={myName || "?"} url={me && me.avatarUrl} size={40} ring />
                <ChevronDown size={16} />
              </span>
            </>
          )}
        </header>

        <div className="wp-grid">
        <div className="wp-main">
        {ready ? (
          <Player src={video.videoUrl} poster={video.thumbnailUrl} chip={video.category} toast={toast} api={api} videoId={id} token={token} isOwn={Boolean(isOwn)} />
        ) : (
          <div className="wp-player wp-loading">Loading…</div>
        )}

        <h1 className="wp-title">{video.title || " "}</h1>
        <div className="wp-meta">
          <span>{count(video.views)} views</span>
          <i>•</i>
          <span>{video.createdAt ? ago(video.createdAt) : ""}</span>
          {tags.length > 0 && <i>•</i>}
          {tags.map((t) => <b key={t}>#{t}</b>)}
        </div>

        <div className="wp-chan">
          <Avatar name={author.name} url={author.avatarUrl} size={62} ring />
          <div className="wp-chan-i">
            <strong>{author.name || "…"} {author.verified && <Verified />}</strong>
            <span>{count(subs)} subscribers</span>
          </div>
          {!isOwn && (
            <button type="button" className={"wp-sub" + (subscribed ? " on" : "")} onClick={doSubscribe}>
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>

        <div className="wp-acts">
          <button type="button" className={"wp-pill" + (liked ? " on" : "")} onClick={doLike}>
            <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} /> {count(video.likesCount)}
          </button>
          <button type="button" className={"wp-pill wp-round" + (disliked ? " on" : "")} onClick={doDislike} aria-label="Dislike">
            <ThumbsDown size={20} fill={disliked ? "currentColor" : "none"} />
          </button>
          <button type="button" className="wp-pill" onClick={doShare}><Share2 size={20} /> Share</button>
          <button type="button" className="wp-pill" onClick={doDownload}><Download size={20} /> Download</button>
          <button type="button" className={"wp-pill" + (saved ? " on" : "")} onClick={doSave}>
            <Bookmark size={20} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <div className="wp-morewrap">
            <button type="button" className="wp-pill wp-round wp-pill-more" onClick={() => setMoreOpen((m) => !m)} aria-label="More">
              <MoreHorizontal size={20} />
            </button>
            {moreOpen && <div className="wp-pop"><button type="button" onClick={copyLink}>Copy link</button></div>}
          </div>
        </div>

        <div className="wp-desc" onClick={() => longDesc && setDescOpen((o) => !o)}>
          <p className={descOpen ? "open" : ""}>{desc}</p>
          {longDesc && (
            <div className="wp-more">
              <span>{descOpen ? "Show less" : "Show more"}</span>
              {descOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          )}
        </div>

        <section className="wp-cm">
          <div className="wp-cm-h">
            <h3>Comments <em>({count(total)})</em></h3>
            <div className="wp-sortwrap">
              <button type="button" onClick={() => setSortOpen((o) => !o)}>
                <SortIcon /> Sort by
              </button>
              {sortOpen && (
                <div className="wp-pop wp-pop-r">
                  <button type="button" className={sort === "new" ? "on" : ""} onClick={() => { setSort("new"); setSortOpen(false); }}>Newest first</button>
                  <button type="button" className={sort === "top" ? "on" : ""} onClick={() => { setSort("top"); setSortOpen(false); }}>Top comments</button>
                </div>
              )}
            </div>
          </div>

          {video.allowComments === false ? (
            <p className="wp-muted">Is video par comments band hain.</p>
          ) : (
            <div className="wp-add">
              <Avatar name={myName || "?"} url={me && me.avatarUrl} size={58} />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") postComment(); }}
                placeholder="Add a comment…"
                maxLength={500}
              />
              {text.trim() && <button type="button" onClick={postComment} disabled={posting}>{posting ? "…" : "Post"}</button>}
            </div>
          )}
          {cErr && <p className="wp-err">⚠ {cErr}</p>}
          {cLoading && <p className="wp-muted">Comments load ho rahe hain…</p>}
          {!cLoading && comments.length === 0 && video.allowComments !== false && (
            <p className="wp-muted">Abhi koi comment nahi. Pehla comment aap karein!</p>
          )}

          {sorted.map((c) => {
            const canDel = userId && ((c.author && String(c.author._id) === String(userId)) || ownerId === String(userId));
            return (
              <div key={c._id} className="wp-c">
                <Avatar name={c.author && c.author.name} url={c.author && c.author.avatarUrl} size={64} />
                <div className="wp-c-b">
                  <div className="wp-c-h">
                    <strong>{c.author && c.author.name}</strong>
                    {c.author && c.author.verified && <Verified />}
                    <em>{ago(c.createdAt)}</em>
                  </div>
                  <p>{c.text}</p>
                  <div className="wp-c-a">
                    <button type="button" className={c.liked ? "on" : ""} onClick={() => likeComment(c._id, "like")}>
                      <ThumbsUp size={18} fill={c.liked ? "currentColor" : "none"} /> {c.likesCount > 0 ? count(c.likesCount) : ""}
                    </button>
                    <button type="button" className={c.disliked ? "on" : ""} onClick={() => likeComment(c._id, "dislike")} aria-label="Dislike comment">
                      <ThumbsDown size={18} fill={c.disliked ? "currentColor" : "none"} />
                    </button>
                    <button type="button" className="wp-reply" onClick={() => { if (needLogin()) return; setReplyTo(replyTo === c._id ? "" : c._id); setReplyText(""); }}>Reply</button>
                  </div>

                  {replyTo === c._id && (
                    <div className="wp-add wp-add-s">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") postReply(c._id); }}
                        placeholder="Reply likhein…"
                        maxLength={500}
                      />
                      <button type="button" onClick={() => postReply(c._id)} disabled={!replyText.trim()}>Post</button>
                    </div>
                  )}

                  {(c.repliesCount || 0) > 0 && (
                    <button type="button" className="wp-viewr" onClick={() => setShown((s) => ({ ...s, [c._id]: !s[c._id] }))}>
                      {shown[c._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {shown[c._id] ? "Hide replies" : c.repliesCount + (c.repliesCount > 1 ? " replies" : " reply")}
                    </button>
                  )}
                  {shown[c._id] && (c.replies || []).map((r) => (
                    <div key={r._id} className="wp-c wp-c-r">
                      <Avatar name={r.author && r.author.name} url={r.author && r.author.avatarUrl} size={44} />
                      <div className="wp-c-b">
                        <div className="wp-c-h"><strong>{r.author && r.author.name}</strong><em>{ago(r.createdAt)}</em></div>
                        <p>{r.text}</p>
                      </div>
                      {userId && ((r.author && String(r.author._id) === String(userId)) || ownerId === String(userId)) && (
                        <button type="button" className="wp-dots" onClick={() => delReply(c._id, r._id)} aria-label="Delete reply"><Trash2 size={15} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="wp-morewrap">
                  <button type="button" className="wp-dots" onClick={() => setCMenu(cMenu === c._id ? "" : c._id)} aria-label="Comment options">
                    <MoreVertical size={20} />
                  </button>
                  {cMenu === c._id && (
                    <div className="wp-pop wp-pop-r">
                      <button type="button" onClick={() => copyText(c.text)}>Copy text</button>
                      {canDel && <button type="button" onClick={() => delComment(c._id)}>Delete</button>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
        </div>

        <aside className="wp-side">
        <div className="wp-tabs">
          <button type="button" className={tab === "next" ? "on" : ""} onClick={() => setTab("next")}>Up Next</button>
          <button type="button" className={tab === "related" ? "on" : ""} onClick={() => setTab("related")}>Related</button>
          {author.name && (
            <button type="button" className={tab === "author" ? "on" : ""} onClick={() => setTab("author")}>From {author.name}</button>
          )}
          {cats.map((c) => (
            <button key={c} type="button" className={tab === "cat:" + c ? "on" : ""} onClick={() => setTab("cat:" + c)}>{c}</button>
          ))}
        </div>

        <div className="wp-list">
          {shownList.length === 0 && <p className="wp-muted">Is section mein abhi koi video nahi.</p>}
          {shownList.map((v) => (
            <div key={v._id} className="wp-li" role="button" tabIndex={0}
              onClick={() => { onOpen(v); if (rootRef.current) rootRef.current.scrollTop = 0; }}
              onKeyDown={(e) => { if (e.key === "Enter") onOpen(v); }}>
              <div className="wp-th">
                <img src={v.thumbnailUrl} alt="" loading="lazy" />
                <i className="wp-mini"><Avatar name={v.author && v.author.name} url={v.author && v.author.avatarUrl} size={28} /></i>
                <span>{clock(v.duration)}</span>
              </div>
              <div className="wp-li-i">
                <strong>{v.title}</strong>
                <em>{v.author ? v.author.name : ""} {v.author && v.author.verified && <Verified />}</em>
                <small>{count(v.views)} views<i>•</i>{ago(v.createdAt)}</small>
              </div>
              <button
                type="button"
                className="wp-dots"
                onClick={(e) => {
                  e.stopPropagation();
                  const u = window.location.origin + window.location.pathname + "?v=" + v._id;
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(u).then(() => toast("Link copy ho gaya")).catch(() => {});
                  }
                }}
                aria-label="Copy link"
              >
                <MoreVertical size={20} />
              </button>
            </div>
          ))}
        </div>
        </aside>
        </div>
      </div>
      {toastMsg && <div className="wp-toast">{toastMsg}</div>}
    </div>
  );
}

const WP_CSS = `
.wp {
  --color-background: #000F1D; --color-header: #000E1C; --color-card: #00223D; --color-cyan: #00F5FE;
  --color-text: #FFFFFF; --color-text-secondary: #91D8FC; --color-text-desc: #E3F5FD; --color-border: #02305A; --color-card-border: #012743; --color-controls: #001629;
  --color-verified: #03D4F7; --color-seek: #00D2F8; --logo-cyan: #00CFFF; --logo-purple: #8A42FF; --logo-purple-light: #C45BFF;
  --gradient-cta: linear-gradient(90deg, #00EFFE, #01C9FE); --color-divider: #021E34; --color-badge: #FF2E4D;
  --u: clamp(0.414px, calc(100vw / 941), 0.95px);
  position: fixed; inset: 0; z-index: 1000; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: var(--color-background); color: var(--color-text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; line-height: 1.3;
}
@media (min-width: 1000px) { .wp { --u: 0.74px; } }
.wp *, .wp *::before, .wp *::after { box-sizing: border-box; }
:where(.wp) button { font-family: inherit; color: inherit; cursor: pointer; }
.wp svg { flex-shrink: 0; }
.wp-head svg, .wp-pbtn svg, .wp-pill svg, .wp-sbox svg, .wp-c-a svg, .wp-dots svg, .wp-ic svg { stroke-width: 2.4; }
.wp-in { width: 100%; margin: 0; padding-bottom: calc(var(--u) * 40); }

/* header */
.wp-head { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: calc(var(--u) * 12); height: max(55.8px, calc(var(--u) * 90)); padding: 0 calc(var(--u) * 28) 0 calc(var(--u) * 16); background: var(--color-header); }
.wp-ic { background: none; border: 0; padding: calc(var(--u) * 6); display: grid; place-items: center; }
.wp-ic svg { width: max(19.8px, calc(var(--u) * 38)); height: max(19.8px, calc(var(--u) * 38)); }
.wp-logo { flex: 1; min-width: 0; display: flex; align-items: center; gap: calc(var(--u) * 2); margin-left: calc(var(--u) * 6); }
.wp-logo-bf { height: max(35.4px, calc(var(--u) * 68)); width: auto; display: block; flex-shrink: 0; }
.wp-logo-wm { height: max(20.8px, calc(var(--u) * 40)); width: auto; display: block; flex-shrink: 1; min-width: 0; }
.wp-bell { position: relative; }
.wp-badge { position: absolute; top: calc(var(--u) * -2); right: calc(var(--u) * -4); min-width: max(16px, calc(var(--u) * 24)); height: max(16px, calc(var(--u) * 24)); padding: 0 calc(var(--u) * 5); border-radius: 999px; background: var(--color-badge); color: #fff; font-size: max(10px, calc(var(--u) * 16)); font-weight: 700; display: grid; place-items: center; line-height: 1; }
.wp-me { display: flex; align-items: center; gap: calc(var(--u) * 6); margin-left: calc(var(--u) * 6); }
.wp-me > svg { width: max(13.5px, calc(var(--u) * 26)); height: max(13.5px, calc(var(--u) * 26)); }
.wp-sbox { flex: 1; display: flex; align-items: center; gap: calc(var(--u) * 10); background: var(--color-card); border: 1px solid var(--color-border); border-radius: 999px; padding: 0 calc(var(--u) * 22); height: max(34.7px, calc(var(--u) * 56)); }
.wp-sbox svg { width: max(13.5px, calc(var(--u) * 26)); height: max(13.5px, calc(var(--u) * 26)); }
.wp-sbox input { flex: 1; background: none; border: 0; outline: 0; color: var(--color-text); font-size: max(11px, calc(var(--u) * 22)); min-width: 0; }
.wp-sbox button { background: none; border: 0; padding: 0; display: grid; }
.wp-av { display: inline-grid; place-items: center; flex-shrink: 0; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg, var(--logo-cyan), var(--logo-purple)); color: #00121f; font-weight: 700; }
.wp-av img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp-av-ring { margin: calc(var(--u) * 5); box-shadow: 0 0 0 max(1px, calc(var(--u) * 2)) var(--color-background), 0 0 0 max(2px, calc(var(--u) * 5)) var(--color-cyan); }
.wp-tick { width: 1.12em; height: 1.12em; flex-shrink: 0; vertical-align: -0.18em; }

/* layout */
.wp-grid { display: block; }
.wp-main, .wp-side { min-width: 0; }

/* player */
.wp-player { position: relative; width: auto; aspect-ratio: 915 / 421; background: #000; overflow: hidden; border-radius: calc(var(--u) * 14); margin: 0 calc(var(--u) * 13); }
.wp-player video { width: 100%; height: 100%; object-fit: cover; display: block; background: #000; }
.wp-player.portrait video, .wp-player:fullscreen video { object-fit: contain; }
.wp-loading { display: grid; place-items: center; color: var(--color-text-secondary); }
.wp-ptop, .wp-pbot { position: absolute; left: 0; right: 0; display: flex; align-items: center; opacity: 0; transition: opacity .2s; pointer-events: none; }
.wp-player.ui .wp-ptop, .wp-player.ui .wp-pbot { opacity: 1; pointer-events: auto; }
.wp-ptop { top: 0; justify-content: space-between; padding: calc(var(--u) * 16) calc(var(--u) * 16) calc(var(--u) * 30); background: linear-gradient(rgba(0,14,28,.55), transparent); }
.wp-ptop-r { display: flex; align-items: center; gap: calc(var(--u) * 12); }
.wp-pbot { bottom: 0; gap: calc(var(--u) * 14); padding: calc(var(--u) * 34) calc(var(--u) * 18) calc(var(--u) * 14); background: linear-gradient(transparent, rgba(0,22,41,.92) 55%); }
.wp-chip { background: rgba(0,14,28,.74); border: 1px solid rgba(255,255,255,.1); border-radius: 999px; padding: calc(var(--u) * 8) calc(var(--u) * 22); font-size: max(11px, calc(var(--u) * 21)); font-weight: 600; line-height: 1.2; }
.wp-pbtn { background: none; border: 0; padding: calc(var(--u) * 4); display: grid; place-items: center; color: #fff; }
.wp-pbtn svg { width: max(17.7px, calc(var(--u) * 34)); height: max(17.7px, calc(var(--u) * 34)); }
.wp-ptop .wp-pbtn { background: rgba(0,14,28,.74); border: 1px solid rgba(255,255,255,.1); border-radius: calc(var(--u) * 12); padding: calc(var(--u) * 8); }
.wp-time { font-size: max(11px, calc(var(--u) * 21)); white-space: nowrap; }
.wp-seek { position: relative; flex: 1; height: max(18.6px, calc(var(--u) * 30)); display: flex; align-items: center; touch-action: none; cursor: pointer; min-width: 40px; }
.wp-seek::before { content: ""; position: absolute; left: 0; right: 0; height: max(3px, calc(var(--u) * 6)); border-radius: 999px; background: rgba(255,255,255,.28); }
.wp-seek-fill { position: absolute; left: 0; height: max(3px, calc(var(--u) * 6)); border-radius: 999px; background: var(--color-seek); }
.wp-seek-dot { position: absolute; width: max(12px, calc(var(--u) * 26)); height: max(12px, calc(var(--u) * 26)); margin-left: max(-6px, calc(var(--u) * -13)); border-radius: 50%; background: #01EBFB; box-shadow: 0 0 0 4px rgba(1,235,251,.25); }
.wp-cc { font-size: max(9px, calc(var(--u) * 18)); font-weight: 800; border: 2px solid #fff; border-radius: 5px; padding: 0 calc(var(--u) * 5); line-height: 1.5; }
.wp-cc.on { color: var(--color-cyan); border-color: var(--color-cyan); }
.wp-menu { position: absolute; right: 8px; bottom: calc(100% - 4px); background: rgba(0,22,41,.97); border: 1px solid var(--color-border); border-radius: 12px; padding: 6px; display: flex; flex-direction: column; min-width: 190px; max-height: 140px; overflow-y: auto; z-index: 3; }
.wp-player:fullscreen .wp-menu { max-height: 60vh; }
.wp-menu strong { font-size: 13px; color: var(--color-text-secondary); padding: 6px 10px; cursor: pointer; }
.wp-menu p { margin: 0; padding: 8px 10px; font-size: 13px; color: var(--color-text-secondary); }
.wp-menu button { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: none; border: 0; text-align: left; padding: 9px 10px; border-radius: 8px; font-size: 14px; color: #fff; width: 100%; }
.wp-menu button em { font-style: normal; color: var(--color-text-secondary); font-size: 13px; }
.wp-menu button.on { color: var(--color-cyan); font-weight: 700; }
.wp-menu-row { display: flex; align-items: center; }
.wp-menu-row .wp-menu-x { width: auto; padding: 8px; color: var(--color-text-secondary); }
.wp-menu .wp-menu-add { color: var(--color-cyan); font-weight: 600; margin-top: 4px; border-top: 1px solid var(--color-border); border-radius: 0 0 8px 8px; }
.wp-sub-text { position: absolute; left: 0; right: 0; bottom: 14px; display: flex; justify-content: center; padding: 0 12px; pointer-events: none; transition: bottom .2s; }
.wp-player.ui .wp-sub-text { bottom: 15%; }
.wp-sub-text span { background: rgba(0,0,0,.75); color: #fff; padding: 3px 10px; border-radius: 6px; font-size: 16px; line-height: 1.35; text-align: center; white-space: pre-line; max-width: 100%; }

/* info */
.wp-title { font-size: max(18.5px, calc(var(--u) * 37)); line-height: 1.22; font-weight: 600; margin: calc(var(--u) * 13) calc(var(--u) * 24) calc(var(--u) * 2); letter-spacing: -0.01em; }
.wp-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: calc(var(--u) * 2) calc(var(--u) * 14); padding: 0 calc(var(--u) * 26); font-size: max(11px, calc(var(--u) * 22)); color: var(--color-text-secondary); }
.wp-meta i { font-style: normal; }
.wp-meta b { color: var(--color-cyan); font-weight: 500; }
.wp-meta b + b { margin-left: calc(var(--u) * 13); }
.wp-chan { display: flex; align-items: center; gap: calc(var(--u) * 22); height: max(57.7px, calc(var(--u) * 93)); padding: 0 calc(var(--u) * 26) 0 calc(var(--u) * 25); }
.wp-chan-i { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; padding-top: calc(var(--u) * 16); }
.wp-chan-i strong { font-size: max(13.0px, calc(var(--u) * 26)); line-height: calc(var(--u) * 30); font-weight: 500; display: flex; align-items: center; gap: calc(var(--u) * 10); }
.wp-chan-i span { color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 21)); line-height: calc(var(--u) * 34); }
.wp-tick { color: var(--color-verified); }
.wp-sub { border: 0; border-radius: 999px; height: max(39.7px, calc(var(--u) * 64)); padding: 0 calc(var(--u) * 39); font-size: max(11px, calc(var(--u) * 22)); font-weight: 700; color: #00121f; background: var(--gradient-cta); }
.wp-sub.on { background: var(--color-card); color: var(--color-text); border: 1px solid var(--color-border); }
.wp-acts { display: flex; gap: calc(var(--u) * 13); padding: calc(var(--u) * 6) calc(var(--u) * 26) calc(var(--u) * 9); overflow-x: auto; scrollbar-width: none; }
.wp-acts::-webkit-scrollbar { display: none; }
.wp-pill { flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: calc(var(--u) * 10); height: max(32.2px, calc(var(--u) * 52)); padding: 0 calc(var(--u) * 24); background: var(--color-card); border: 1px solid var(--color-card-border); border-radius: 999px; font-size: max(11px, calc(var(--u) * 21)); white-space: nowrap; }
.wp-pill svg { width: max(14.0px, calc(var(--u) * 27)); height: max(14.0px, calc(var(--u) * 27)); }
.wp-round { padding: 0 calc(var(--u) * 34); }
.wp-pill-more { padding: 0 calc(var(--u) * 14); }
.wp-pill.on { color: var(--color-cyan); border-color: var(--color-cyan); }
.wp-morewrap { position: relative; flex-shrink: 0; }
.wp-pop { position: absolute; z-index: 8; top: 100%; left: 0; margin-top: 6px; background: #00182c; border: 1px solid var(--color-border); border-radius: 12px; padding: 6px; min-width: 150px; box-shadow: 0 10px 30px rgba(0,0,0,.5); }
.wp-pop-r { left: auto; right: 0; }
.wp-pop button { display: block; width: 100%; text-align: left; background: none; border: 0; padding: 10px 12px; border-radius: 8px; font-size: 15px; }
.wp-pop button.on { color: var(--color-cyan); }
.wp-desc { margin: calc(var(--u) * 4) calc(var(--u) * 26) 0 calc(var(--u) * 26); background: var(--color-card); border: 1px solid var(--color-card-border); border-radius: calc(var(--u) * 16); padding: calc(var(--u) * 10) calc(var(--u) * 22) calc(var(--u) * 7) calc(var(--u) * 18); }
.wp-desc p { margin: 0; color: var(--color-text-desc); font-size: max(11px, calc(var(--u) * 21)); line-height: 1.38; white-space: pre-wrap; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word; }
.wp-desc p.open { display: block; }
.wp-more { display: flex; justify-content: space-between; align-items: center; color: var(--color-cyan); font-size: max(11px, calc(var(--u) * 22)); font-weight: 600; margin-top: calc(var(--u) * 4); }
.wp-more svg { width: max(15.6px, calc(var(--u) * 30)); height: max(15.6px, calc(var(--u) * 30)); color: #fff; }

/* comments */
.wp-cm { padding: calc(var(--u) * 21) calc(var(--u) * 28) calc(var(--u) * 11) calc(var(--u) * 26); }
.wp-cm-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: calc(var(--u) * 10); }
.wp-cm-h h3 { font-size: max(12.5px, calc(var(--u) * 25)); font-weight: 500; margin: 0; }
.wp-cm-h h3 em { font-style: normal; color: var(--color-text-secondary); font-weight: 400; }
.wp-sortwrap { position: relative; }
.wp-sortwrap > button { display: flex; align-items: center; gap: calc(var(--u) * 10); background: none; border: 0; color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 21)); }
.wp-sortwrap svg { width: max(14.6px, calc(var(--u) * 28)); height: max(14.6px, calc(var(--u) * 28)); }
.wp-add { display: flex; align-items: center; gap: calc(var(--u) * 16); }
.wp-add input { flex: 1; min-width: 0; height: max(33.5px, calc(var(--u) * 54)); border-radius: 999px; background: var(--color-card); border: 1px solid var(--color-border); color: var(--color-text); padding: 0 calc(var(--u) * 24); font-size: max(11px, calc(var(--u) * 21)); outline: 0; }
.wp-add input::placeholder { color: #A1D3F6; opacity: 1; }
.wp-add input:focus { border-color: var(--color-cyan); }
.wp-add button { background: var(--gradient-cta); color: #00121f; border: 0; border-radius: 999px; padding: calc(var(--u) * 10) calc(var(--u) * 24); font-size: max(11px, calc(var(--u) * 21)); font-weight: 700; }
.wp-add button:disabled { opacity: .5; }
.wp-add-s { margin: 10px 0 4px; }
.wp-muted { color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 21)); margin: calc(var(--u) * 18) 0; }
.wp-err { color: #ff7a8c; font-size: max(11px, calc(var(--u) * 20)); margin: 8px 0; }
.wp-c { display: flex; gap: calc(var(--u) * 20); margin-top: calc(var(--u) * 19); align-items: flex-start; }
.wp-c-r { margin-top: calc(var(--u) * 16); }
.wp-c-b { flex: 1; min-width: 0; }
.wp-c-h { display: flex; align-items: center; gap: calc(var(--u) * 12); flex-wrap: wrap; }
.wp-c-h strong { font-size: max(11px, calc(var(--u) * 22)); font-weight: 500; }
.wp-c-h em { font-style: normal; color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 21)); }
.wp-c-b p { margin: calc(var(--u) * 4) 0 calc(var(--u) * 16); font-size: max(11px, calc(var(--u) * 21)); line-height: 1.4; word-break: break-word; }
.wp-c-a { display: flex; align-items: center; gap: calc(var(--u) * 36); }
.wp-c-a button { display: flex; align-items: center; gap: calc(var(--u) * 10); background: none; border: 0; padding: 0; color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 21)); }
.wp-c-a button svg { width: max(14.0px, calc(var(--u) * 27)); height: max(14.0px, calc(var(--u) * 27)); }
.wp-c-a button.on { color: var(--color-cyan); }
.wp-c-a .wp-reply { color: var(--color-cyan); font-size: max(11px, calc(var(--u) * 22)); font-weight: 500; }
.wp-viewr { display: flex; align-items: center; gap: 4px; background: none; border: 0; padding: 8px 0 0; color: var(--color-cyan); font-size: max(11px, calc(var(--u) * 21)); font-weight: 600; }
.wp-viewr svg { width: max(12.5px, calc(var(--u) * 24)); height: max(12.5px, calc(var(--u) * 24)); }
.wp-dots { background: none; border: 0; padding: calc(var(--u) * 4); color: var(--color-text); display: grid; place-items: center; }
.wp-dots svg { width: max(15.6px, calc(var(--u) * 30)); height: max(15.6px, calc(var(--u) * 30)); }

/* up next */
.wp-tabs { display: flex; gap: calc(var(--u) * 16); padding: calc(var(--u) * 16) calc(var(--u) * 24) calc(var(--u) * 20); overflow-x: auto; scrollbar-width: none; border-top: 1px solid var(--color-divider); margin-top: calc(var(--u) * 10); }
.wp-tabs::-webkit-scrollbar { display: none; }
.wp-tabs button { flex-shrink: 0; height: max(33.5px, calc(var(--u) * 54)); padding: 0 calc(var(--u) * 25); background: var(--color-card); border: 1px solid var(--color-card-border); border-radius: 999px; font-size: max(11px, calc(var(--u) * 21)); font-weight: 500; white-space: nowrap; }
.wp-tabs button.on { padding: 0 calc(var(--u) * 36); background: var(--gradient-cta); color: #00121f; border-color: transparent; font-weight: 700; }
.wp-list { padding: 0 calc(var(--u) * 26) 0 calc(var(--u) * 27); display: flex; flex-direction: column; gap: calc(var(--u) * 10); }
.wp-li { display: flex; gap: calc(var(--u) * 26); align-items: flex-start; cursor: pointer; }
.wp-th { position: relative; width: max(124px, calc(var(--u) * 240)); aspect-ratio: 240 / 99; flex-shrink: 0; border-radius: calc(var(--u) * 14); overflow: hidden; background: var(--color-card); }
.wp-th img { width: 100%; height: 100%; object-fit: cover; display: block; }
.wp-th > span { position: absolute; right: 6px; bottom: 6px; background: rgba(0,0,0,.78); border-radius: 6px; padding: 1px 6px; font-size: max(10px, calc(var(--u) * 20)); font-weight: 600; }
.wp-mini { position: absolute; left: 6px; bottom: 6px; display: block; line-height: 0; }
.wp-li-i { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: calc(var(--u) * 6); padding-top: calc(var(--u) * 5); }
.wp-li-i strong { font-size: max(11px, calc(var(--u) * 21)); font-weight: 500; line-height: 1.32; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wp-li-i em { font-style: normal; color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 20)); display: flex; align-items: center; gap: calc(var(--u) * 8); }
.wp-li-i small { color: var(--color-text-secondary); font-size: max(11px, calc(var(--u) * 20)); }
.wp-li-i small i { font-style: normal; margin: 0 calc(var(--u) * 8); }
.wp-toast { position: fixed; left: 50%; bottom: 40px; transform: translateX(-50%); background: #00182c; border: 1px solid var(--color-cyan); color: var(--color-text); padding: 10px 18px; border-radius: 22px; font-size: 14px; z-index: 20; max-width: 90%; text-align: center; }

@media (max-width: 400px) {
  .wp-acts { gap: 6px; padding-left: 10px; padding-right: 10px; }
  .wp-pill { padding: 0 8px; gap: 5px; }
  .wp-round { padding: 0 10px; }
}

/* desktop: two columns */
@media (min-width: 1000px) {
  .wp-player { aspect-ratio: 16 / 9; }
  .wp-th { aspect-ratio: 16 / 9; }
  .wp-player video { object-fit: contain; }
  .wp-grid { display: grid; grid-template-columns: minmax(0, 1fr) clamp(340px, 29vw, 460px); gap: 28px; padding: 16px 28px 0; align-items: start; }
  .wp-player { margin: 0; }
  .wp-title { margin-left: 0; margin-right: 0; }
  .wp-meta, .wp-chan, .wp-acts, .wp-cm { padding-left: 0; padding-right: 0; }
  .wp-desc { margin-left: 0; margin-right: 0; }
  .wp-tabs { border-top: 0; margin-top: 0; padding: 0 0 16px; flex-wrap: wrap; overflow: visible; }
  .wp-list { padding: 0; }
  .wp-head { padding: 0 28px 0 24px; }
}
`;
