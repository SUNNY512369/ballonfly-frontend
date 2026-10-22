import React, { useState, useRef, useEffect } from "react";
import {
  Home, Play, Pause, User, PlusSquare, Heart, MessageCircle, Share2,
  Bookmark, Search, X, Image as ImageIcon, Video, Zap, Volume2, VolumeX,
  Mail, Lock, LogOut, Loader2, Settings, Bell, Shield, Globe, Trash2,
  ChevronRight, Check, UserPlus, Flame, Send, ArrowLeft, Sparkles, Eye, Camera, Maximize2, Minimize2
} from "lucide-react";
import VideoControls from "./VideoControls";
import VideoWatchPage from "./VideoWatchPage.jsx";
import { useIsDesktop, isDesktopNow, DesktopHeader, DesktopSidebar, DesktopHome, DesktopVideoList, DESKTOP_CSS } from "./Desktop.jsx";

const API_BASE = "https://73f66bd3-8cea-466c-bb50-f674376c52b5-00-258qwqohl8u35.pike.replit.dev/api";

const GRADIENTS = [
  "linear-gradient(135deg,#FF4D6D,#7C3AED)",
  "linear-gradient(135deg,#33D6A6,#2563EB)",
  "linear-gradient(135deg,#F2B84B,#FF4D6D)",
  "linear-gradient(135deg,#7C3AED,#33D6A6)",
  "linear-gradient(135deg,#2563EB,#F2B84B)",
  "linear-gradient(135deg,#FF4D6D,#F2B84B)",
];

const NAMES = ["Ayesha K.", "Bilal R.", "Zoya M.", "Hamza T.", "Sana W.", "Usman F.", "Mahnoor S.", "Ali Q."];

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return Math.max(1, minutes) + "m";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  return Math.floor(hours / 24) + "d";
}

function notificationFromApi(n) {
  let text;
  if (n.type === "like") {
    text = n.video ? "aapke video ko like kiya" : n.short ? "aapke short video ko like kiya" : "aapke post ko like kiya";
  } else if (n.type === "comment") {
    text = (n.video ? "aapke video par" : n.short ? "aapke short video par" : "aapke post par") + ' comment kiya: "' + (n.text || "") + '"';
  } else {
    text = "aapko follow karna shuru kiya";
  }
  return {
    id: n._id,
    type: n.type,
    user: (n.actor && (n.actor.name || n.actor.username)) || "Someone",
    text,
    time: timeAgo(n.createdAt),
    read: Boolean(n.read),
  };
}

const seedConversations = [
  {
    id: "c1",
    user: "Bilal R.",
    messages: [
      { id: "m1", from: "them", text: "Bhai wo video kamaal ki thi!", time: "10:02 AM" },
      { id: "m2", from: "me", text: "Shukriya! Kal aur ek post kar raha hoon", time: "10:05 AM" },
    ],
    unread: 1,
  },
  {
    id: "c2",
    user: "Zoya M.",
    messages: [{ id: "m3", from: "them", text: "Kal ka shoot kab hai?", time: "Yesterday" }],
    unread: 0,
  },
  {
    id: "c3",
    user: "Hamza T.",
    messages: [
      { id: "m4", from: "them", text: "Follow ho gaya, content bohat acha hai", time: "2d" },
      { id: "m5", from: "me", text: "Thankyou bhai 🙌", time: "2d" },
    ],
    unread: 0,
  },
];

function useLikeState(seedIds) {
  const [liked, setLiked] = useState(() => new Set());
  const toggle = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  return [liked, toggle, setLiked];
}

function countValue(value) {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "number") return value;
  if (value && typeof value.count === "number") return value.count;
  return 0;
}

function isEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizePost(post, index = 0, fallback = {}) {
  const author =
    post.author ||
    (post.user && typeof post.user === "object" && post.user) ||
    fallback.user ||
    {};
  const media = post.media && typeof post.media === "object" ? post.media : {};
  const type = String(post.mediaType || post.type || media.type || fallback.type || "").toLowerCase();
  const mediaString = typeof post.media === "string" ? post.media : "";
  const videoUrl = post.videoUrl || media.videoUrl || (type === "video" ? mediaString : "");
  const videoField = typeof post.video === "string" ? post.video : "";
  const imageField = typeof post.image === "string" ? post.image : "";
  const mediaUrl =
    post.mediaUrl ||
    post.imageUrl ||
    post.videoUrl ||
    videoField ||
    imageField ||
    post.url ||
    post.fileUrl ||
    media.url ||
    mediaString ||
    fallback.mediaUrl ||
    "";
  const thumbnailUrl = post.thumbnailUrl || media.thumbnailUrl || fallback.thumbnailUrl || "";
  const comments = post.comments ?? post.commentsCount ?? post.commentCount;
  const commentList = Array.isArray(comments) ? comments : Array.isArray(post.commentList) ? post.commentList : [];
  const displayName = [
    author.name,
    author.username,
    author.displayName,
    typeof post.user === "string" ? post.user : "",
    typeof fallback.user === "string" ? fallback.user : "",
    post.username,
  ].find((value) => typeof value === "string" && value.trim() && !isEmailAddress(value))?.trim()
    || "Unknown creator";
  const createdAt = post.createdAt || post.created_at || post.timestamp;
  const postTime = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : post.time || "Just now";

  return {
    id: String(post._id || post.id || fallback.id || `post-${index}`),
    user: displayName,
    userId: String(author._id ?? author.id ?? post.userId ?? ""),
    avatarUrl: author.profilePicture || author.profileImageUrl || author.avatarUrl || author.avatar || "",
    time: postTime,
    caption: post.caption ?? fallback.caption ?? "",
    grad: GRADIENTS[index % GRADIENTS.length],
    mediaUrl: mediaUrl || fallback.mediaUrl || "",
    thumbnailUrl,
    isVideo: Boolean(videoUrl) || type === "video" || type === "short" ||
      /\.(mp4|mov|webm|m4v)(?:$|[?#])/i.test(mediaUrl) || Boolean(fallback.isVideo),
    likes: countValue(post.likesCount ?? post.likes ?? post.likeCount),
    comments: countValue(post.commentsCount ?? post.commentCount ?? comments),
    commentsList: commentList.map((comment, commentIndex) => {
      const commentUser = comment.user && typeof comment.user === "object" ? comment.user : {};
      return {
        id: String(comment._id || comment.id || `post-${index}-comment-${commentIndex}`),
        user: commentUser.username || commentUser.displayName || comment.username ||
          (typeof comment.user === "string" ? comment.user : "User"),
        text: comment.text || comment.content || "",
      };
    }),
    isLiked: Boolean(post.liked ?? post.isLiked ?? post.likedByCurrentUser),
    saved: Boolean(post.saved ?? fallback.saved),
  };
}

function syncPostFlags(posts, setLiked, setSavedPostIds) {
  const postIds = new Set(posts.map((post) => post.id));
  setLiked((previous) => {
    const next = new Set(previous);
    postIds.forEach((id) => next.delete(id));
    posts.forEach((post) => {
      if (post.isLiked) next.add(post.id);
    });
    return next;
  });
  setSavedPostIds((previous) => {
    const next = new Set(previous);
    postIds.forEach((id) => next.delete(id));
    posts.forEach((post) => {
      if (post.saved) next.add(post.id);
    });
    return next;
  });
}

function extractPostList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.savedPosts)) return data.savedPosts;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.posts)) return data.data.posts;
  return [];
}

function normalizeShort(short, index = 0) {
  const account =
    (short.user && typeof short.user === "object" && short.user) ||
    short.uploader ||
    {};
  const userName =
    (typeof short.user === "string" && short.user) ||
    account.displayName ||
    account.name ||
    account.username ||
    short.username ||
    "User";
  const commentsList = Array.isArray(short.comments)
    ? short.comments.map((comment, commentIndex) => ({
        id: comment._id || comment.id || `comment-${commentIndex}`,
        user: comment.user?.displayName ||
          comment.user?.username ||
          comment.username ||
          (typeof comment.user === "string" ? comment.user : "User"),
        text: comment.text || comment.content || "",
      }))
    : [];

  return {
    id: String(short._id || short.id || `s${index}`),
    user: userName,
    avatarUrl:
      account.profilePicture ||
      account.profileImageUrl ||
      account.avatarUrl ||
      account.avatar ||
      short.avatarUrl ||
      short.uploader?.profilePicture ||
      short.uploader?.avatarUrl ||
      "",
    caption: short.caption || "",
    grad: GRADIENTS[index % GRADIENTS.length],
    mediaUrl: short.videoUrl || short.url || short.mediaUrl || "",
    isVideo: true,
    likes: countValue(short.likes),
    commentsCount: countValue(short.comments),
    commentsList,
    views: countValue(short.views),
  };
}

function Avatar({ name, size = 40, imageUrl, initialOnly = false }) {
  const initials = initialOnly
    ? name.slice(0, 1).toUpperCase()
    : name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const idx = name.length % GRADIENTS.length;
  return (
    <div>
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: GRADIENTS[idx] }}
    >
      {imageUrl ? <img className="avatar-image" src={imageUrl} alt="" /> : initials}
    </div>
  );
}

function PostCard({
  post, liked, onLike, following, onFollow, onOpenComments, currentUserId,
  saved, saving, onSave, onShare, isDetailView = false,
}) {
  const isLiked = liked.has(post.id);
  const isFollowing = following.has(post.userId);
  const postAuthorId = String(post.userId ?? "").trim();
  const viewerId = String(currentUserId ?? "").trim();
  const isOwnPost = Boolean(postAuthorId && viewerId && postAuthorId === viewerId);
  const detailVideoRef = useRef(null);
  const [detailVideoPlaying, setDetailVideoPlaying] = useState(false);
  const toggleDetailVideo = () => {
    const video = detailVideoRef.current;
    if (!video) return;
    if (video.paused) {
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => setDetailVideoPlaying(false));
      }
    } else {
      video.pause();
    }
  };
  return (
    <article className="post-card">
      <div className="post-head">
        <Avatar name={post.user} imageUrl={post.avatarUrl} initialOnly />
        <div className="post-head-text">
          <span className="post-user">{post.user}</span>
          <span className="post-time">{post.time}</span>
        </div>
        {!isOwnPost && (
          <button
            className={"follow-btn" + (isFollowing ? " following" : "")}
            onClick={() => onFollow(post.userId)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
      <p className="post-caption">{post.caption}</p>
      {post.mediaUrl ? (
        post.isVideo ? (
          isDetailView ? (
            <div className="post-detail-video-wrap" style={{ position: "relative" }}>
              <video
                ref={detailVideoRef}
                src={post.mediaUrl}
                playsInline
                className="post-media post-media-real"
                onClick={toggleDetailVideo}
                onPlay={() => setDetailVideoPlaying(true)}
                onPause={() => setDetailVideoPlaying(false)}
                onEnded={() => setDetailVideoPlaying(false)}
              />
              <button
                type="button"
                className={"post-video-toggle" + (detailVideoPlaying ? " is-playing" : "")}
                onClick={toggleDetailVideo}
                aria-label={detailVideoPlaying ? "Pause video" : "Play video"}
                aria-pressed={detailVideoPlaying}
              >
                {detailVideoPlaying
                  ? <Pause size={30} fill="currentColor" />
                  : <Play size={30} fill="currentColor" />}
              </button>
              <VideoControls videoRef={detailVideoRef} showCenter={false} />
            </div>
          ) : (
            <video src={post.mediaUrl} controls className="post-media post-media-real" />
          )
        ) : (
          <img src={post.mediaUrl} alt="" className="post-media post-media-real" />
        )
      ) : <div className="post-media post-media-missing">Media unavailable</div>}
      <div className="post-actions">
        <button className={"icon-btn" + (isLiked ? " liked" : "")} onClick={() => onLike(post.id)}>
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span>{post.likes}</span>
        </button>
        <button className="icon-btn" onClick={() => onOpenComments(post)}>
          <MessageCircle size={20} />
          <span>{post.comments}</span>
        </button>
        <button className="icon-btn" onClick={() => onShare(post)} aria-label="Share post">
          <Share2 size={20} />
        </button>
        <button
          className={"icon-btn spacer-left" + (saved ? " saved" : "")}
          onClick={() => onSave(post)}
          disabled={saving}
          aria-label={saved ? "Remove saved post" : "Save post"}
          title={saved ? "Saved" : "Save"}
        >
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}

function CommentsModal({ post, comments, currentUser, onAddComment, onClose, isPost = false }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || (isPost && submitting)) return;
    if (!isPost) {
      onAddComment(post.id, text.trim());
      setText("");
      return;
    }

    setSubmitting(true);
    setError("");
    Promise.resolve(onAddComment(post.id, text.trim()))
      .then(() => {
      setText("");
      })
      .catch((err) => setError(err.message || "Could not post your comment. Please try again."))
      .finally(() => setSubmitting(false));
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Comments</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="comments-list">
          {comments.length === 0 && (
            <p className="comments-empty">Abhi koi comment nahi — pehla comment aap karein!</p>
          )}
          {comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <Avatar name={c.user} size={32} />
              <div>
                <span className="comment-user">{c.user}</span>
                <p className="comment-text">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        {isPost && error && <p className="comment-error" role="alert">{error}</p>}
        <div className="comment-form">
          <Avatar name={currentUser?.name || "You"} size={32} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(e)}
            disabled={isPost && submitting}
            placeholder="Comment likhein..."
          />
          <button type="button" onClick={submit} disabled={!text.trim() || (isPost && submitting)}>
            {isPost && submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShortCard({
  s,
  isLiked,
  onLike,
  isFollowing,
  onFollow,
  muted,
  setMuted,
  onOpenComments,
  commentCount,
  onView,
  onShare,
  isActive,
  isSparks,
}) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const onViewRef = useRef(onView);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      onViewRef.current(s.id);
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, s.id]);

  useEffect(() => {
    onViewRef.current = onView;
  }, [onView]);

  useEffect(() => {
    if (!isSparks) return undefined;
    const syncFullscreen = () => {
      const fullscreen = document.fullscreenElement === cardRef.current;
      setIsFullscreen(fullscreen);
      if (!fullscreen) {
        try {
          window.screen.orientation?.unlock?.();
        } catch (error) {
          // Orientation unlock is not supported in every browser.
        }
      }
    };
    const video = videoRef.current;
    const handleNativeFullscreenStart = () => setIsFullscreen(true);
    const handleNativeFullscreenEnd = () => {
      setIsFullscreen(false);
      try {
        window.screen.orientation?.unlock?.();
      } catch (error) {
        // Orientation unlock is not supported in every browser.
      }
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    video?.addEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
    video?.addEventListener("webkitendfullscreen", handleNativeFullscreenEnd);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
      video?.removeEventListener("webkitbeginfullscreen", handleNativeFullscreenStart);
      video?.removeEventListener("webkitendfullscreen", handleNativeFullscreenEnd);
    };
  }, [isSparks]);

  const openFullscreen = async () => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return;

    try {
      if (document.fullscreenElement === card) {
        await document.exitFullscreen();
        return;
      }
      if (card.requestFullscreen) {
        await card.requestFullscreen({ navigationUI: "hide" });
      } else if (video.requestFullscreen) {
        await video.requestFullscreen({ navigationUI: "hide" });
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else {
        return;
      }
      if (isHorizontal) {
        try {
          await window.screen.orientation?.lock?.("landscape");
        } catch (error) {
          // Some platforms only rotate fullscreen video automatically.
        }
      }
    } catch (error) {
      console.error("Spark fullscreen failed:", error);
    }
  };

  return (
    <article
      ref={cardRef}
      className={"short-card" + (isSparks ? " sparks-card" : "")}
      style={{ background: "#000" }}
      data-short-id={s.id}
    >
      {s.mediaUrl && s.isVideo ? (
        <video
          ref={videoRef}
          src={s.mediaUrl}
          className={
            "short-video" +
            (isSparks ? (isHorizontal ? " spark-video-horizontal" : " spark-video-vertical") : "")
          }
          autoPlay={isActive}
          loop
          muted={muted}
          playsInline
          preload={isActive ? "auto" : "metadata"}
          onLoadedMetadata={(event) => {
            const { videoWidth, videoHeight } = event.currentTarget;
            setIsHorizontal(videoWidth > videoHeight);
          }}
        />
      ) : s.mediaUrl ? (
        <img src={s.mediaUrl} alt="" className="short-video" />
      ) : (
        <div className="short-unavailable">This video is unavailable.</div>
      )}
      {s.mediaUrl && s.isVideo && <VideoControls videoRef={videoRef} />}
      {s.mediaUrl && (
        <button
          className="mute-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute video" : "Mute video"}
          title={muted ? "Unmute video" : "Mute video"}
        >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}
      <div className="short-rail">
        <button className={"rail-btn" + (isLiked ? " liked" : "")} onClick={() => onLike(s.id)}>
          <Heart size={26} fill={isLiked ? "currentColor" : "none"} />
          <span>{s.likes + (isLiked ? 1 : 0)}</span>
        </button>
        <button className="rail-btn" onClick={() => onOpenComments(s)}>
          <MessageCircle size={26} />
          <span>{commentCount > 0 ? commentCount : "Reply"}</span>
        </button>
        <button className="rail-btn" onClick={() => onShare(s)} aria-label="Share video">
          <Share2 size={26} />
          <span>Send</span>
        </button>
        {isSparks && s.mediaUrl && s.isVideo && (
          <button
            className="rail-btn fullscreen-rail-btn"
            onClick={openFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Open video fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Open video fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={25} /> : <Maximize2 size={25} />}
            <span>{isFullscreen ? "Exit" : "Full screen"}</span>
          </button>
        )}
      </div>
      <div className="short-info">
        <div className="short-user-row">
          <Avatar name={s.user} size={34} imageUrl={s.avatarUrl} />
          <span className="short-user">{s.user}</span>
          <button
            className={"follow-btn ghost" + (isFollowing ? " following" : "")}
            onClick={() => onFollow(s.user)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
        <p className="short-caption">{s.caption}</p>
        {s.views > 0 && <span className="short-views"><Eye size={13} /> {s.views.toLocaleString()} views</span>}
      </div>
    </article>
  );
}

function ShortsView({
  shorts,
  liked,
  onLike,
  following,
  onFollow,
  commentsByShort,
  onOpenComments,
  onView,
  onShare,
  loading,
  error,
  onRetry,
  isSparks = false,
  onCreate,
}) {
  const [muted, setMuted] = useState(true);
  const [activeShortId, setActiveShortId] = useState(shorts[0]?.id || null);
  const scrollerRef = useRef(null);
  const shortIdsKey = shorts.map((short) => short.id).join("|");

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || shorts.length === 0) {
      setActiveShortId(null);
      return undefined;
    }

    setActiveShortId((current) => (shorts.some((short) => short.id === current) ? current : shorts[0].id));
    if (!("IntersectionObserver" in window)) {
      setActiveShortId(shorts[0].id);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveShortId(visible.target.dataset.shortId);
      },
      { root: scroller, threshold: [0.25, 0.6, 0.85] }
    );
    scroller.querySelectorAll(".short-card[data-short-id]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [shortIdsKey]);

  return (
    <div>
      ref={scrollerRef}
      className={"shorts-scroller" + (isSparks ? " sparks-scroller" : "")}
      aria-label={isSparks ? "Sparks video feed" : "Reels video feed"}
    >
      {isSparks && (
        <div className="sparks-topbar">
          <div className="sparks-title"><Sparkles size={19} /> Sparks</div>
          <button className="sparks-create" onClick={onCreate}>
            <PlusSquare size={17} /> Create
          </button>
        </div>
      )}
      {loading && <div className="shorts-status"><Loader2 size={20} className="spin" /> Loading videos…</div>}
      {error && (
        <div className="shorts-status shorts-status-error">
          <span>{error}</span>
          <button onClick={onRetry}>Try again</button>
        </div>
      )}
      {!loading && !error && shorts.length === 0 && (
        <div className="shorts-status shorts-status-empty">
          <Sparkles size={26} />
          <strong>No Sparks yet</strong>
          <span>Share a 15–60 second video to start the feed.</span>
          {isSparks && <button onClick={onCreate}>Create a Spark</button>}
        </div>
      )}
      {shorts.map((s) => (
        <ShortCard
          key={s.id}
          s={s}
          isLiked={liked.has(s.id)}
          onLike={onLike}
          isFollowing={following.has(s.user)}
          onFollow={onFollow}
          muted={muted}
          setMuted={setMuted}
          onOpenComments={onOpenComments}
          commentCount={s.commentsCount + (commentsByShort[s.id] || []).length}
          onView={onView}
          onShare={onShare}
          isActive={activeShortId === s.id}
          isSparks={isSparks}
        />
      ))}
    </div>
  );
}

function SparksUploadView({ token, onBack, onShortUploaded }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectVideo = (selectedFile, input) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/")) {
      setError("Choose a video file to create a Spark.");
      input.value = "";
      return;
    }
    setFile(selectedFile);
    setDuration(null);
    setError("");
    setPreviewUrl(URL.createObjectURL(selectedFile));
    input.value = "";
  };

  const handleMetadata = (event) => {
    const seconds = event.currentTarget.duration;
    setDuration(seconds);
    if (!Number.isFinite(seconds) || seconds < 15 || seconds > 60) {
      setError("Video must be between 15 and 60 seconds.");
    } else {
      setError("");
    }
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose or record a video first.");
      return;
    }
    if (!Number.isFinite(duration)) {
      setError("Wait for the video duration to finish loading.");
      return;
    }
    if (duration < 15 || duration > 60) {
      setError("Video must be between 15 and 60 seconds.");
      return;
    }
    if (!token) {
      setError("Please sign in again before uploading.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("caption", caption.trim());
      const response = await fetch(API_BASE + "/shorts/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Upload failed. Please try again.");
        return;
      }
      onShortUploaded(data.short || data, caption.trim());
    } catch (uploadError) {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="spark-upload-view">
      <div className="spark-upload-header">
        <button className="icon-btn" onClick={onBack} aria-label="Back to Sparks">
          <ArrowLeft size={20} />
        </button>
        <h2>Create a Spark</h2>
      </div>
      <form className="spark-upload-form" onSubmit={upload}>
        <input
          ref={galleryInputRef}
          type="file"
          accept="video/*"
          className="visually-hidden"
          onChange={(event) => selectVideo(event.target.files?.[0], event.target)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="visually-hidden"
          onChange={(event) => selectVideo(event.target.files?.[0], event.target)}
        />
        {!previewUrl ? (
          <div className="spark-picker">
            <Sparkles size={30} />
            <strong>Share a moment</strong>
            <span>Choose a video or record one now. Videos must be 15–60 seconds.</span>
            <div className="spark-picker-actions">
              <button type="button" onClick={() => galleryInputRef.current?.click()}>
                <Video size={17} /> Choose from gallery
              </button>
              <button type="button" onClick={() => cameraInputRef.current?.click()}>
                <Camera size={17} /> Record a video
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="spark-upload-preview">
              <video
                src={previewUrl}
                controls
                playsInline
                onLoadedMetadata={handleMetadata}
                onError={() => setError("Could not read this video's duration. Choose another video.")}
              />
              <button
                type="button"
                className="spark-change-video"
                onClick={() => galleryInputRef.current?.click()}
              >
                Change video
              </button>
            </div>
            <div className="spark-duration">
              {duration === null ? "Checking video duration…" : `Duration: ${duration.toFixed(1)}s (15–60s)`}
            </div>
          </>
        )}
        <label className="spark-caption-label" htmlFor="spark-caption">Caption</label>
        <textarea
          id="spark-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Add a caption…"
          maxLength={2200}
        />
        {error && <p className="spark-upload-error" role="alert">{error}</p>}
        <button
          className="post-submit spark-submit"
          type="submit"
          disabled={uploading || !file || !Number.isFinite(duration) || duration < 15 || duration > 60}
        >
          {uploading ? "Uploading…" : "Share Spark"}
        </button>
      </form>
    </section>
  );
}

function ProfileView({
  posts, savedPosts, profileTab, onTabChange, following, user, followersCount, followingCount,
  loading, error, onRetry, savedLoading, savedError, onSavedRetry, onOpenPost, onLogout,
}) {
  const displayName = user?.name || "You";
  const handle = "@" + (user?.username || displayName.toLowerCase().replace(/\s+/g, "."));
  const showingSaved = profileTab === "saved";
  const visiblePosts = showingSaved ? savedPosts : posts;
  const visibleLoading = showingSaved ? savedLoading : loading;
  const visibleError = showingSaved ? savedError : error;
  return (
    <div className="profile-view">
      <div className="profile-cover" style={{ background: GRADIENTS[1] }} />
      <div className="profile-header">
        <Avatar name={displayName} size={84} />
        <div className="profile-meta">
          <h2>{displayName}</h2>
          <span className="handle">{handle}</span>
        </div>
      </div>
      <div className="profile-stats">
        <div><strong>{posts.length}</strong><span>Posts</span></div>
        <div><strong>{followersCount ?? 0}</strong><span>Followers</span></div>
        <div><strong>{followingCount ?? following.size}</strong><span>Following</span></div>
      </div>
      <ProfileChannel user={user} onLogout={onLogout} />
      <div className="profile-tabs" role="tablist" aria-label="Profile posts">
        <button
          type="button"
          role="tab"
          aria-selected={!showingSaved}
          className={!showingSaved ? "active" : ""}
          onClick={() => onTabChange("posts")}
        >
          Posts
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showingSaved}
          className={showingSaved ? "active" : ""}
          onClick={() => onTabChange("saved")}
        >
          Saved
        </button>
      </div>
      <div className="profile-grid">
        {visiblePosts.map((p) => (
          <button
            key={p.id}
            type="button"
            className="grid-thumb"
            onClick={() => onOpenPost(p)}
            aria-label={`Open post by ${p.user}`}
          >
            {p.mediaUrl && (p.isVideo
              ? p.thumbnailUrl
                ? <img src={p.thumbnailUrl} alt="" loading="lazy" />
                : <video src={p.mediaUrl} poster={p.thumbnailUrl || undefined} muted playsInline preload="metadata" />
              : <img src={p.thumbnailUrl || p.mediaUrl} alt="" loading="lazy" />)}
            {p.isVideo && (
              <span className="grid-video-play" aria-hidden="true">
                <span className="grid-video-play-circle"><Play size={19} fill="currentColor" /></span>
              </span>
            )}
            <span className="grid-thumb-username">{p.user}</span>
          </button>
        ))}
      </div>
      {visibleLoading && <p className="profile-posts-status">{showingSaved ? "Loading saved posts…" : "Loading your posts…"}</p>}
      {visibleError && <div className="profile-posts-status profile-posts-error" role="alert">
        <span>{visibleError}</span><button type="button" onClick={showingSaved ? onSavedRetry : onRetry}>Retry</button>
      </div>}
      {!visibleLoading && !visibleError && visiblePosts.length === 0 && (
        <p className="profile-posts-status">{showingSaved ? "No saved posts yet" : "No posts yet"}</p>
      )}
    </div>
  );
}

function UploadModal({ onClose, onPost, onShortUploaded, onOpenVideoUpload, token, user }) {
  const [caption, setCaption] = useState("");
  const [type, setType] = useState("photo");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError("");
    setVideoDuration(null);
    setPreviewUrl(URL.createObjectURL(f));
    if (f.type.startsWith("video/")) setType((t) => (t === "photo" ? "video" : t));
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setVideoDuration(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!file) return;

    if (type === "short") {
      const isVideoFile = file.type.startsWith("video/");
      if (isVideoFile) {
        if (videoDuration === null) {
          setError("Video load ho raha hai, thora sa intezar karein");
          return;
        }
        if (videoDuration < 15 || videoDuration > 60) {
          setError("Short video ki length 15 se 60 second ke darmiyan honi chahiye");
          return;
        }
      }

      setUploading(true);
      setError("");
      try {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("caption", caption || "");

        const res = await fetch(API_BASE + "/shorts/upload", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setUploading(false);
          setError(data.error || "Upload fail ho gaya, dobara try karein");
          return;
        }

        setUploading(false);
        onShortUploaded(data.short || data, caption);
        onClose();
      } catch (err) {
        setUploading(false);
        setError("Server tak nahi pohanch paye. Internet check karein.");
      }
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", caption);
      const res = await fetch(API_BASE + "/posts/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not upload your post. Please try again.");

      const createdPost = data.post || data.data?.post || data.data || data;
      onPost(createdPost, {
        id: `uploaded-${Date.now()}`,
        caption,
        type,
        mediaUrl: previewUrl,
        isVideo: file.type.startsWith("video/"),
        user: {
          username: user?.username || user?.name || "You",
          displayName: user?.name || "You",
          id: user?.id,
        },
      });
      onClose();
    } catch (err) {
      setError(err.message || "Could not upload your post. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Create post</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="type-toggle">
          <button className={type === "photo" ? "active" : ""} onClick={() => setType("photo")}>
            <ImageIcon size={16} /> Photo
          </button>
          <button className={type === "video" ? "active" : ""} onClick={() => setType("video")}>
            <Video size={16} /> Video
          </button>
          <button className={type === "short" ? "active" : ""} onClick={() => setType("short")}>
            <Zap size={16} /> Short
          </button>
        </div>

        {onOpenVideoUpload && (
          <button type="button" className="vup-entry" onClick={onOpenVideoUpload}>
            <Video size={16} /> Lambi video upload karein (title, category, community)
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {!previewUrl && (
          <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon size={28} />
            <span>Photo ya video select karne ke liye tap karein</span>
          </div>
        )}

        {previewUrl && (
          <div className="upload-preview">
            {file?.type.startsWith("video/") ? (
              <video
                src={previewUrl}
                controls
                className="upload-preview-media"
                onLoadedMetadata={(e) => setVideoDuration(e.target.duration)}
              />
            ) : (
              <img src={previewUrl} alt="preview" className="upload-preview-media" />
            )}
            <button className="upload-preview-remove" onClick={removeFile}>
              <X size={14} /> Remove
            </button>
          </div>
        )}

        {type === "short" && file?.type.startsWith("video/") && videoDuration !== null && (
          <p style={{ fontSize: 12, color: videoDuration < 15 || videoDuration > 60 ? "#FF4D6D" : "#9B94A8", marginTop: -8, marginBottom: 12 }}>
            Duration: {videoDuration.toFixed(1)}s (15-60s zaroori hai)
          </p>
        )}

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {error && <p style={{ color: "#FF4D6D", fontSize: 12, marginTop: -8, marginBottom: 12 }}>⚠ {error}</p>}

        <button
          className="post-submit"
          disabled={!file || uploading}
          onClick={handleSubmit}
        >
          {uploading ? "Upload ho raha hai..." : file ? "Share" : "Pehle media select karein"}
        </button>
      </div>
    </div>
  );
}

function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function VideoUploadView({ token, onBack, onDone }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState("General / Default");
  const [community, setCommunity] = useState("General / Default");
  const [visibility, setVisibility] = useState("Public");
  const [allowComments, setAllowComments] = useState(true);
  const [meta, setMeta] = useState({
    categories: ["General / Default"],
    communities: ["General / Default"],
    visibility: ["Public", "Unlisted", "Private"],
  });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(API_BASE + "/videos/meta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.categories)) setMeta(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const pickFile = (f, input) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Sirf video file select karein");
      input.value = "";
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError("Video 100MB se chhoti honi chahiye");
      input.value = "";
      return;
    }
    setError("");
    setFile(f);
    setDuration(0);
    setPreviewUrl(URL.createObjectURL(f));
    input.value = "";
  };

  const submit = async () => {
    if (uploading) return;
    if (!file) { setError("Pehle video select karein"); return; }
    if (!title.trim()) { setError("Title likhna zaroori hai"); return; }
    if (!description.trim()) { setError("Description likhna zaroori hai"); return; }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const auth = { Authorization: "Bearer " + token };
      const signRes = await fetch(API_BASE + "/videos/sign", { method: "POST", headers: auth });
      const sign = await signRes.json();
      if (!signRes.ok) throw new Error(sign.error || "Upload shuru nahi ho saka");

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sign.apiKey);
      form.append("timestamp", sign.timestamp);
      form.append("signature", sign.signature);
      form.append("folder", sign.folder);

      const uploaded = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.cloudinary.com/v1_1/" + sign.cloudName + "/video/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          let data = {};
          try { data = JSON.parse(xhr.responseText); } catch (e) {}
          if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) resolve(data);
          else reject(new Error((data.error && data.error.message) || "Video upload fail ho gaya"));
        };
        xhr.onerror = () => reject(new Error("Internet ka masla, dobara try karein"));
        xhr.send(form);
      });

      const saveRes = await fetch(API_BASE + "/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          videoUrl: uploaded.secure_url,
          duration: uploaded.duration || duration,
          title: title.trim(),
          description: description.trim(),
          hashtags: hashtags,
          category: category,
          community: community,
          visibility: visibility,
          allowComments: allowComments,
        }),
      });
      const saved = await saveRes.json();
      if (!saveRes.ok) throw new Error(saved.error || "Video save nahi ho saki");
      setDone(true);
    } catch (err) {
      setError(err.message || "Upload fail ho gaya");
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <section className="vup">
        <div className="vup-done">
          <strong>Video upload ho gayi ✅</strong>
          <span>Aapki video save ho gayi hai. Home ke Videos tab mein nazar aayegi.</span>
          <button className="post-submit" type="button" onClick={onDone}>Wapas jao</button>
        </div>
      </section>
    );
  }

  return (
    <section className="vup">
      <div className="vup-header">
        <button className="icon-btn" type="button" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>Upload</h2>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => pickFile(e.target.files && e.target.files[0], e.target)}
      />
      <div className="vup-top">
        <button type="button" className="vup-thumb" onClick={() => inputRef.current && inputRef.current.click()}>
          {previewUrl ? (
            <>
              <video
                src={previewUrl + "#t=1"}
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />
              <span className="vup-dur">{formatDuration(duration)}</span>
            </>
          ) : (
            <span className="vup-pick">+ Video chunein</span>
          )}
        </button>
        <textarea
          className="vup-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video ka title likhein *"
          maxLength={100}
        />
      </div>
      <textarea
        className="vup-desc"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Video ke baare mein likhein (max 400) *"
        maxLength={400}
      />
      <input
        className="vup-input"
        value={hashtags}
        onChange={(e) => setHashtags(e.target.value)}
        placeholder="Hashtags (jaise #example #tag)"
      />
      <label className="vup-row">
        <span>Category</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="vup-row">
        <span>Country</span>
        <select value={community} onChange={(e) => setCommunity(e.target.value)}>
          {meta.communities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="vup-row">
        <span>Visibility</span>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          {meta.visibility.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="vup-row">
        <span>Comments allow karein</span>
        <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} />
      </label>
      {error && <p className="vup-error" role="alert">⚠ {error}</p>}
      {uploading && (
        <div className="vup-progress"><div style={{ width: progress + "%" }} /></div>
      )}
      <button className="post-submit" type="button" disabled={uploading} onClick={submit}>
        {uploading ? "Upload ho raha hai " + progress + "%" : "UPLOAD"}
      </button>
    </section>
  );
}

function vfDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  if (h > 0) return h + ":" + String(m).padStart(2, "0") + ":" + ss;
  return String(m).padStart(2, "0") + ":" + ss;
}

function videoAgo(d) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  const units = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [name, secs] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return n + " " + name + (n > 1 ? "s" : "") + " ago";
  }
  return "just now";
}

function shortCount(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return (v / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}

function VideosFeed({ token, userId, community, mine }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cats, setCats] = useState(["All"]);
  const [category, setCategory] = useState("All");
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState(null);
  useEffect(() => {
    fetch(API_BASE + "/videos/meta")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.categories)) setCats(["All"].concat(d.categories));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const params = [];
    if (category !== "All") params.push("category=" + encodeURIComponent(category));
    if (community) params.push("community=" + encodeURIComponent(community));
    const q = params.length ? "?" + params.join("&") : "";
    fetch(API_BASE + (mine ? "/videos/mine" : "/videos" + q), mine ? { headers: { Authorization: "Bearer " + token } } : undefined)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!cancelled) setVideos(Array.isArray(d.videos) ? d.videos : []);
      })
      .catch(() => {
        if (!cancelled) setError("Videos load nahi ho sakin");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [category, retry, community, mine]);

  const openVideo = (v) => setActive(v);

  const authorName = (v) => (v.author && v.author.name ? v.author.name : "Unknown");

  return (
    <section className={"vf" + (mine ? " vf-mine" : "")}>
      <div className="vf-chips">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            className={c === category ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && videos.length === 0 && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} className="vf-card vf-skel">
              <div className="vf-thumb" />
              <div className="vf-info">
                <span className="vf-avatar" />
                <div className="vf-meta"><strong>&nbsp;</strong><span>&nbsp;</span></div>
              </div>
            </div>
          ))}
        </>
      )}

      {error && (
        <div className="feed-status feed-status-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((n) => n + 1)}>Retry</button>
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <p className="feed-status">Abhi koi video nahi hai. Create (+) dabao aur "Lambi video upload karein" chuno.</p>
      )}

      {videos.map((v) => (
        <button key={v._id} type="button" className="vf-card" onClick={() => openVideo(v)}>
          <div className="vf-thumb">
            <img src={v.thumbnailUrl} alt="" loading="lazy" />
            <span className="vf-dur">{vfDuration(v.duration)}</span>
          </div>
          <div className="vf-info">
            <span className="vf-avatar">{authorName(v).slice(0, 1).toUpperCase()}</span>
            <div className="vf-meta">
              <strong>{v.title}</strong>
              <span>{authorName(v)} · {shortCount(v.views)} views · {videoAgo(v.createdAt)}</span>
            </div>
          </div>
        </button>
      ))}

      {active && (
        <VideoWatchPage
          key={active._id}
          video={active}
          apiBase={API_BASE}
          token={token}
          userId={userId}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}

const COMMUNITY_COLORS = [
  ["#7c5cff", "#ff4d6d"], ["#00c6a7", "#3a7bd5"], ["#ff8a00", "#e52e71"],
  ["#4facfe", "#7c5cff"], ["#f857a6", "#ff5858"], ["#11998e", "#38ef7d"], ["#8e2de2", "#4a00e0"],
];

function CommunitiesView({ token, userId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const headers = token ? { Authorization: "Bearer " + token } : {};
    fetch(API_BASE + "/communities", { headers: headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!cancelled) setList(Array.isArray(d.communities) ? d.communities : []);
      })
      .catch(() => {
        if (!cancelled) setError("Communities load nahi ho sakin");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, retry]);

  const toggleJoin = (c, e) => {
    if (e) e.stopPropagation();
    if (!token) return;
    fetch(API_BASE + "/communities/" + c._id + "/join", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const patch = { joined: d.joined, membersCount: d.membersCount };
        setList((l) => l.map((x) => (x._id === c._id ? { ...x, ...patch } : x)));
        setSelected((s) => (s && s._id === c._id ? { ...s, ...patch } : s));
      })
      .catch(() => {});
  };

  if (selected) {
    return (
      <section className="cm">
        <div className="cm-head">
          <button className="icon-btn" type="button" onClick={() => setSelected(null)} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="cm-title">
            <strong>{selected.name}</strong>
            <span>{shortCount(selected.membersCount)} members</span>
          </div>
          <button
            type="button"
            className={"cm-join" + (selected.joined ? " joined" : "")}
            onClick={(e) => toggleJoin(selected, e)}
          >
            {selected.joined ? "Joined" : "Join"}
          </button>
        </div>
        <VideosFeed key={selected._id} token={token} userId={userId} community={selected.name} />
      </section>
    );
  }

  const cities = list.filter((c) => c.kind === "city");
  const others = list.filter((c) => c.kind !== "city");

  return (
    <section className="cm">
      <h2 className="cm-h">Communities</h2>

      {error && (
        <div className="feed-status feed-status-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((n) => n + 1)}>Retry</button>
        </div>
      )}

      {loading && list.length === 0 && (
        <div className="cm-grid">
          {[0, 1, 2, 3].map((i) => <div key={i} className="cm-card cm-skel" />)}
        </div>
      )}

      <div className="cm-grid">
        {cities.map((c, i) => {
          const col = COMMUNITY_COLORS[i % COMMUNITY_COLORS.length];
          return (
            <button
              key={c._id}
              type="button"
              className="cm-card"
              style={{ background: "linear-gradient(135deg, " + col[0] + ", " + col[1] + ")" }}
              onClick={() => setSelected(c)}
            >
              <span className="cm-letter">{c.name.slice(0, 1)}</span>
              <strong>{c.name}</strong>
              <span className="cm-count">{shortCount(c.membersCount)} members</span>
              <span
                role="button"
                className={"cm-join sm" + (c.joined ? " joined" : "")}
                onClick={(e) => toggleJoin(c, e)}
              >
                {c.joined ? "Joined" : "Join"}
              </span>
            </button>
          );
        })}
      </div>

      {others.map((c) => (
        <div key={c._id} className="cm-row" onClick={() => setSelected(c)}>
          <span className="vf-avatar">{c.name.slice(0, 1).toUpperCase()}</span>
          <div className="cm-rowtext">
            <strong>{c.name}</strong>
            <span>{shortCount(c.membersCount)} members</span>
          </div>
          <button
            type="button"
            className={"cm-join sm" + (c.joined ? " joined" : "")}
            onClick={(e) => toggleJoin(c, e)}
          >
            {c.joined ? "Joined" : "Join"}
          </button>
        </div>
      ))}
    </section>
  );
}

function EditProfilePage({ token, profile, onClose, onSaved }) {
  const { t, lang } = useT();
  const [channelName, setChannelName] = useState(profile.channelName || "");
  const [firstName, setFirstName] = useState(profile.firstName || "");
  const [lastName, setLastName] = useState(profile.lastName || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [dob, setDob] = useState(profile.dob || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [country, setCountry] = useState(profile.country || "");
  const [countryList, setCountryList] = useState([]);
  const [nameState, setNameState] = useState({ ok: null, msg: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ ok: null, msg: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const auth = { Authorization: "Bearer " + token };

  useEffect(() => {
    fetch(API_BASE + "/countries")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.countries)) {
          setCountryList(d.countries.slice().sort((a, b) => a.name.localeCompare(b.name)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const name = channelName.trim();
    if (name === profile.channelName) {
      setNameState({ ok: null, msg: "" });
      return;
    }
    if (name.length < 3) {
      setNameState({ ok: false, msg: "Kam az kam 3 harf likhein" });
      return;
    }
    setNameState({ ok: null, msg: "Check ho raha hai..." });
    const t = setTimeout(() => {
      fetch(API_BASE + "/users/check-name?name=" + encodeURIComponent(name), { headers: auth })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d) setNameState({ ok: !!d.available, msg: d.available ? "Naam available hai ✓" : d.reason || "Naam available nahi" });
        })
        .catch(() => setNameState({ ok: null, msg: "" }));
    }, 500);
    return () => clearTimeout(t);
  }, [channelName]);

  const save = () => {
    if (saving) return;
    if (nameState.ok === false) { setError("Pehle channel name theek karein"); return; }
    setSaving(true);
    setError("");
    fetch(API_BASE + "/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        channelName: channelName.trim(),
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        dob: dob,
        bio: bio,
        country: country,
        language: lang === "en" ? "" : lang,
      }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d: d })))
      .then((res) => {
        if (!res.ok) { setError(res.d.error || "Save nahi ho saka"); return; }
        onSaved(res.d.profile);
      })
      .catch(() => setError("Internet ka masla, dobara try karein"))
      .finally(() => setSaving(false));
  };

  const changePassword = () => {
    if (pwBusy) return;
    if (newPw.length < 6) { setPwMsg({ ok: false, msg: "Naya password kam az kam 6 harf ka ho" }); return; }
    if (newPw !== confPw) { setPwMsg({ ok: false, msg: "Dono naye password ek jaise nahi" }); return; }
    setPwBusy(true);
    setPwMsg({ ok: null, msg: "" });
    fetch(API_BASE + "/users/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d: d })))
      .then((res) => {
        if (!res.ok) { setPwMsg({ ok: false, msg: res.d.error || "Password nahi badla" }); return; }
        setPwMsg({ ok: true, msg: "Password badal gaya ✓" });
        setCurPw(""); setNewPw(""); setConfPw("");
      })
      .catch(() => setPwMsg({ ok: false, msg: "Internet ka masla" }))
      .finally(() => setPwBusy(false));
  };

  return (
    <div className="pc-page">
      <div className="pc-pagehead">
        <button className="icon-btn" type="button" onClick={onClose} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t("edit.title")}</h2>
      </div>

      <label className="pc-field">
        <span>{t("edit.channelName")}</span>
        <input value={channelName} onChange={(e) => setChannelName(e.target.value)} maxLength={30} />
        {nameState.msg && (
          <em className={nameState.ok === true ? "ok" : nameState.ok === false ? "bad" : ""}>{nameState.msg}</em>
        )}
      </label>

      <label className="pc-field">
        <span>{t("edit.email")}</span>
        <input value={profile.email || ""} readOnly />
      </label>

      <button type="button" className="pc-pwrow" onClick={() => setShowPw((v) => !v)}>
        <span>{t("edit.password")}</span>
        <span>{showPw ? "▲" : "▼"}</span>
      </button>
      {showPw && (
        <div className="pc-pwbox">
          <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} placeholder="Purana password" />
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Naya password (kam az kam 6 harf)" />
          <input type="password" value={confPw} onChange={(e) => setConfPw(e.target.value)} placeholder="Naya password dobara" />
          {pwMsg.msg && <em className={pwMsg.ok ? "ok" : "bad"}>{pwMsg.msg}</em>}
          <button type="button" onClick={changePassword} disabled={pwBusy}>{pwBusy ? "..." : "Password badlo"}</button>
        </div>
      )}

      <label className="pc-field">
        <span>{t("edit.firstName")}</span>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={40} />
      </label>
      <label className="pc-field">
        <span>{t("edit.lastName")}</span>
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={40} />
      </label>
      <label className="pc-field">
        <span>{t("edit.gender")}</span>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Batana nahi chahta</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="pc-field">
        <span>{t("edit.country")}</span>
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">{t("countries.pickPlaceholder")}</option>
          {countryList.map((c) => <option key={c.code} value={c.code}>{flagOf(c.code)} {c.name}</option>)}
        </select>
      </label>
      <label className="pc-field">
        <span>{t("edit.language")}</span>
        <select value={lang} onChange={(e) => setAppLanguage(e.target.value)}>
          {Object.keys(LANGUAGE_NAMES).map((code) => <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>)}
        </select>
      </label>
      <label className="pc-field">
        <span>{t("edit.dob")}</span>
        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)} />
      </label>
      <label className="pc-field">
        <span>{t("edit.bio")}</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} placeholder="Apne baare mein likhein (max 200)" />
      </label>

      {error && <p className="pc-error" role="alert">⚠ {error}</p>}
      <button type="button" className="post-submit pc-save" disabled={saving} onClick={save}>
        {saving ? "..." : t("edit.save")}
      </button>
    </div>
  );
}

function ProfileChannel({ user, onLogout }) {
  const { t } = useT();
  const token = user && user.token;
  const [profile, setProfile] = useState(null);
  const [showVideos, setShowVideos] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [toast, setToast] = useState("");
  const [countryName, setCountryName] = useState("");

  useEffect(() => {
    if (!profile || !profile.country) { setCountryName(""); return; }
    fetch(API_BASE + "/countries")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const c = d && d.countries ? d.countries.find((x) => x.code === profile.country) : null;
        setCountryName(c ? c.name : countryNameOf(profile.country));
      })
      .catch(() => setCountryName(countryNameOf(profile.country)));
  }, [profile && profile.country]);

  useEffect(() => {
    if (!token) return;
    fetch(API_BASE + "/users/me/profile", { headers: { Authorization: "Bearer " + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && d.profile) setProfile(d.profile);
      })
      .catch(() => {});
  }, [token]);

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const shareProfile = () => {
    const url = window.location.origin;
    const text = (profile ? profile.channelName : "Mera channel") + " Tolvify par";
    if (navigator.share) {
      navigator.share({ title: "Tolvify", text: text, url: url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => flash("Link copy ho gaya")).catch(() => {});
    }
  };

  const soon = (title) => {
    setMenuOpen(false);
    setInfo({ title: title, text: "Ye feature agle update mein aa raha hai." });
  };

  const showText = (title, text) => {
    setMenuOpen(false);
    setInfo({ title: title, text: text });
  };

  const n = (v) => shortCount(profile ? profile[v] : 0);

  return (
    <div className="pc">
      <div className="pc-stats">
        <div><strong>{n("videosCount")}</strong><span>{t("profile.videos")}</span></div>
        <div><strong>{n("viewsTotal")}</strong><span>{t("profile.views")}</span></div>
        <div><strong>{n("likesTotal")}</strong><span>{t("profile.likes")}</span></div>
        <div><strong>{profile && profile.country ? <Flag code={profile.country} size={30} /> : "🌍"}</strong><span className="pc-cname">{profile && profile.country ? (countryName || countryNameOf(profile.country)) : t("profile.country")}</span></div>
      </div>
      {profile && profile.bio && <p className="pc-bio">{profile.bio}</p>}
      <div className="pc-actions">
        <button type="button" disabled={!profile} onClick={() => setEditing(true)}>{t("profile.edit")}</button>
        <button type="button" onClick={shareProfile}><Share2 size={15} /> {t("profile.share")}</button>
        <button type="button" className="pc-menu" onClick={() => setMenuOpen(true)} aria-label="Menu">☰</button>
      </div>
      <button type="button" className="pc-toggle" onClick={() => setShowVideos((v) => !v)}>
        <span>{t("profile.myVideos", { n: profile ? profile.videosCount : 0 })}</span>
        <span>{showVideos ? "▲" : "▼"}</span>
      </button>
      {showVideos && <VideosFeed token={token} userId={user && user.id} mine />}
      {toast && <div className="pc-toast">{toast}</div>}

      {editing && profile && (
        <EditProfilePage
          token={token}
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(p) => {
            setProfile(p);
            setEditing(false);
            flash("Profile save ho gayi ✓");
          }}
        />
      )}

      {menuOpen && (
        <div className="pc-overlay" onClick={() => setMenuOpen(false)}>
          <div className="pc-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pc-drawerhead">
              <span className="vf-avatar">{((profile && profile.channelName) || "?").slice(0, 1).toUpperCase()}</span>
              <strong>{profile ? profile.channelName : ""}</strong>
            </div>
            <button type="button" onClick={() => { setMenuOpen(false); setShowVideos(true); }}>Recent Uploads</button>
            <button type="button" onClick={() => soon("Watch History")}>Watch History</button>
            <button type="button" onClick={() => soon("Watch List")}>Watch List</button>
            <button type="button" onClick={() => soon("Policy Violations")}>Policy Violations</button>
            <button type="button" onClick={() => showText("Terms & Conditions", "Tolvify istemal karke aap maante hain ke aap sirf apni ya ijazat wali videos daalenge, kisi ki tauheen ya nuqsan nahi karenge, aur qaanooni qawaneen ki pairwi karenge. Qawaid khilaf-warzi par video ya account band kiya ja sakta hai. (Ye abhi ka mukhtasar masauda hai.)")}>Terms & Conditions</button>
            <button type="button" onClick={() => showText("Privacy Policy", "Hum aapka email, naam aur jo aap upload karte hain mehfooz rakhte hain. Aapka password hamesha encrypted rehta hai. Aapka data kisi ko bechne ke liye nahi hai. (Ye abhi ka mukhtasar masauda hai.)")}>Privacy Policy</button>
            <button type="button" onClick={() => soon("Delete Your Account")}>Delete Your Account</button>
            <button type="button" onClick={() => { setMenuOpen(false); if (onLogout) onLogout(); }}>Logout</button>
          </div>
        </div>
      )}

      {info && (
        <div className="pc-overlay pc-center" onClick={() => setInfo(null)}>
          <div className="pc-info" onClick={(e) => e.stopPropagation()}>
            <h3>{info.title}</h3>
            <p>{info.text}</p>
            <button type="button" onClick={() => setInfo(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

const STRINGS = {
  en: {
    "nav.home": "Home", "nav.reels": "Reels", "nav.sparks": "Sparks", "nav.create": "Create", "nav.dm": "DM",
    "nav.notifications": "Notifications", "nav.profile": "Profile", "nav.settings": "Settings",
    "tabs.posts": "Posts", "tabs.videos": "Videos", "tabs.countries": "Countries",
    "common.members": "{n} members", "common.save": "Save",
    "countries.title": "Countries", "countries.active": "People from {n} countries have joined",
    "countries.pickTitle": "Choose your country", "countries.pickHint": "So your country is counted in this list.",
    "countries.pickPlaceholder": "Select country", "countries.mine": "Your country:", "countries.top": "Most people",
    "countries.search": "Search countries...", "countries.noMembers": "No members yet", "countries.videos": "{n} videos",
    "countries.noMatch": "No country found.", "countries.error": "Could not load countries",
    "profile.videos": "Videos", "profile.views": "Views", "profile.likes": "Likes", "profile.country": "Country",
    "profile.edit": "Edit Profile", "profile.share": "Share Profile", "profile.myVideos": "My Videos ({n})",
    "edit.title": "Edit Profile", "edit.channelName": "Channel Name", "edit.email": "Email",
    "edit.password": "Change Password", "edit.firstName": "First Name", "edit.lastName": "Last Name",
    "edit.gender": "Gender", "edit.country": "Country", "edit.language": "Language", "edit.dob": "Date of Birth",
    "edit.bio": "Bio", "edit.save": "SAVE CHANGES",
    "lang.suggest": "Your country's language is {lang}. Switch the app to it?", "lang.switch": "Switch", "lang.later": "Not now",
  },
  ur: {
    "nav.home": "ہوم", "nav.reels": "ریلز", "nav.sparks": "اسپارکس", "nav.create": "بنائیں", "nav.dm": "پیغامات",
    "nav.notifications": "اطلاعات", "nav.profile": "پروفائل", "nav.settings": "سیٹنگز",
    "tabs.posts": "پوسٹس", "tabs.videos": "ویڈیوز", "tabs.countries": "ممالک",
    "common.members": "{n} ممبرز", "common.save": "محفوظ کریں",
    "countries.title": "ممالک", "countries.active": "{n} ممالک کے لوگ شامل ہو چکے ہیں",
    "countries.pickTitle": "اپنا ملک منتخب کریں", "countries.pickHint": "تاکہ آپ کا ملک اس فہرست میں گنا جائے۔",
    "countries.pickPlaceholder": "ملک منتخب کریں", "countries.mine": "آپ کا ملک:", "countries.top": "سب سے زیادہ لوگ",
    "countries.search": "ممالک تلاش کریں...", "countries.noMembers": "ابھی کوئی ممبر نہیں", "countries.videos": "{n} ویڈیوز",
    "countries.noMatch": "کوئی ملک نہیں ملا۔", "countries.error": "ممالک لوڈ نہیں ہو سکے",
    "profile.videos": "ویڈیوز", "profile.views": "ویوز", "profile.likes": "لائکس", "profile.country": "ملک",
    "profile.edit": "پروفائل ایڈٹ کریں", "profile.share": "پروفائل شیئر کریں", "profile.myVideos": "میری ویڈیوز ({n})",
    "edit.title": "پروفائل ایڈٹ کریں", "edit.channelName": "چینل کا نام", "edit.email": "ای میل",
    "edit.password": "پاسورڈ تبدیل کریں", "edit.firstName": "پہلا نام", "edit.lastName": "آخری نام",
    "edit.gender": "جنس", "edit.country": "ملک", "edit.language": "زبان", "edit.dob": "تاریخ پیدائش",
    "edit.bio": "تعارف", "edit.save": "تبدیلیاں محفوظ کریں",
    "lang.suggest": "آپ کے ملک کی زبان {lang} ہے۔ ایپ اس میں بدلیں؟", "lang.switch": "بدلیں", "lang.later": "ابھی نہیں",
  },
  ar: {
    "nav.home": "الرئيسية", "nav.reels": "ريلز", "nav.sparks": "سباركس", "nav.create": "إنشاء", "nav.dm": "الرسائل",
    "nav.notifications": "الإشعارات", "nav.profile": "الملف الشخصي", "nav.settings": "الإعدادات",
    "tabs.posts": "المنشورات", "tabs.videos": "الفيديوهات", "tabs.countries": "الدول",
    "common.members": "{n} عضو", "common.save": "حفظ",
    "countries.title": "الدول", "countries.active": "انضم أشخاص من {n} دولة",
    "countries.pickTitle": "اختر بلدك", "countries.pickHint": "ليتم احتساب بلدك في هذه القائمة.",
    "countries.pickPlaceholder": "اختر الدولة", "countries.mine": "بلدك:", "countries.top": "الأكثر أعضاءً",
    "countries.search": "ابحث عن دولة...", "countries.noMembers": "لا يوجد أعضاء بعد", "countries.videos": "{n} فيديو",
    "countries.noMatch": "لم يتم العثور على دولة.", "countries.error": "تعذّر تحميل الدول",
    "profile.videos": "الفيديوهات", "profile.views": "المشاهدات", "profile.likes": "الإعجابات", "profile.country": "الدولة",
    "profile.edit": "تعديل الملف الشخصي", "profile.share": "مشاركة الملف الشخصي", "profile.myVideos": "فيديوهاتي ({n})",
    "edit.title": "تعديل الملف الشخصي", "edit.channelName": "اسم القناة", "edit.email": "البريد الإلكتروني",
    "edit.password": "تغيير كلمة المرور", "edit.firstName": "الاسم الأول", "edit.lastName": "اسم العائلة",
    "edit.gender": "الجنس", "edit.country": "الدولة", "edit.language": "اللغة", "edit.dob": "تاريخ الميلاد",
    "edit.bio": "نبذة", "edit.save": "حفظ التغييرات",
    "lang.suggest": "لغة بلدك هي {lang}. هل تريد تغيير التطبيق إليها؟", "lang.switch": "تغيير", "lang.later": "ليس الآن",
  },
  hi: {
    "nav.home": "होम", "nav.reels": "रील्स", "nav.sparks": "स्पार्क्स", "nav.create": "बनाएँ", "nav.dm": "संदेश",
    "nav.notifications": "सूचनाएँ", "nav.profile": "प्रोफ़ाइल", "nav.settings": "सेटिंग्स",
    "tabs.posts": "पोस्ट", "tabs.videos": "वीडियो", "tabs.countries": "देश",
    "common.members": "{n} सदस्य", "common.save": "सहेजें",
    "countries.title": "देश", "countries.active": "{n} देशों के लोग जुड़ चुके हैं",
    "countries.pickTitle": "अपना देश चुनें", "countries.pickHint": "ताकि आपका देश इस सूची में गिना जाए।",
    "countries.pickPlaceholder": "देश चुनें", "countries.mine": "आपका देश:", "countries.top": "सबसे ज़्यादा लोग",
    "countries.search": "देश खोजें...", "countries.noMembers": "अभी कोई सदस्य नहीं", "countries.videos": "{n} वीडियो",
    "countries.noMatch": "कोई देश नहीं मिला।", "countries.error": "देश लोड नहीं हो सके",
    "profile.videos": "वीडियो", "profile.views": "व्यूज़", "profile.likes": "लाइक्स", "profile.country": "देश",
    "profile.edit": "प्रोफ़ाइल संपादित करें", "profile.share": "प्रोफ़ाइल शेयर करें", "profile.myVideos": "मेरे वीडियो ({n})",
    "edit.title": "प्रोफ़ाइल संपादित करें", "edit.channelName": "चैनल का नाम", "edit.email": "ईमेल",
    "edit.password": "पासवर्ड बदलें", "edit.firstName": "पहला नाम", "edit.lastName": "अंतिम नाम",
    "edit.gender": "लिंग", "edit.country": "देश", "edit.language": "भाषा", "edit.dob": "जन्म तिथि",
    "edit.bio": "परिचय", "edit.save": "बदलाव सहेजें",
    "lang.suggest": "आपके देश की भाषा {lang} है। ऐप को इसमें बदलें?", "lang.switch": "बदलें", "lang.later": "अभी नहीं",
  },
  es: {
    "nav.home": "Inicio", "nav.reels": "Reels", "nav.sparks": "Sparks", "nav.create": "Crear", "nav.dm": "Mensajes",
    "nav.notifications": "Notificaciones", "nav.profile": "Perfil", "nav.settings": "Ajustes",
    "tabs.posts": "Publicaciones", "tabs.videos": "Vídeos", "tabs.countries": "Países",
    "common.members": "{n} miembros", "common.save": "Guardar",
    "countries.title": "Países", "countries.active": "Ya se han unido personas de {n} países",
    "countries.pickTitle": "Elige tu país", "countries.pickHint": "Para que tu país cuente en esta lista.",
    "countries.pickPlaceholder": "Selecciona un país", "countries.mine": "Tu país:", "countries.top": "Más personas",
    "countries.search": "Buscar países...", "countries.noMembers": "Aún no hay miembros", "countries.videos": "{n} vídeos",
    "countries.noMatch": "No se encontró ningún país.", "countries.error": "No se pudieron cargar los países",
    "profile.videos": "Vídeos", "profile.views": "Visitas", "profile.likes": "Me gusta", "profile.country": "País",
    "profile.edit": "Editar perfil", "profile.share": "Compartir perfil", "profile.myVideos": "Mis vídeos ({n})",
    "edit.title": "Editar perfil", "edit.channelName": "Nombre del canal", "edit.email": "Correo electrónico",
    "edit.password": "Cambiar contraseña", "edit.firstName": "Nombre", "edit.lastName": "Apellido",
    "edit.gender": "Género", "edit.country": "País", "edit.language": "Idioma", "edit.dob": "Fecha de nacimiento",
    "edit.bio": "Biografía", "edit.save": "GUARDAR CAMBIOS",
    "lang.suggest": "El idioma de tu país es {lang}. ¿Cambiar la app a este idioma?", "lang.switch": "Cambiar", "lang.later": "Ahora no",
  },
  fr: {
    "nav.home": "Accueil", "nav.reels": "Reels", "nav.sparks": "Sparks", "nav.create": "Créer", "nav.dm": "Messages",
    "nav.notifications": "Notifications", "nav.profile": "Profil", "nav.settings": "Paramètres",
    "tabs.posts": "Publications", "tabs.videos": "Vidéos", "tabs.countries": "Pays",
    "common.members": "{n} membres", "common.save": "Enregistrer",
    "countries.title": "Pays", "countries.active": "Des personnes de {n} pays nous ont rejoints",
    "countries.pickTitle": "Choisissez votre pays", "countries.pickHint": "Pour que votre pays soit compté dans cette liste.",
    "countries.pickPlaceholder": "Sélectionner un pays", "countries.mine": "Votre pays :", "countries.top": "Le plus de monde",
    "countries.search": "Rechercher un pays...", "countries.noMembers": "Aucun membre pour l'instant", "countries.videos": "{n} vidéos",
    "countries.noMatch": "Aucun pays trouvé.", "countries.error": "Impossible de charger les pays",
    "profile.videos": "Vidéos", "profile.views": "Vues", "profile.likes": "J'aime", "profile.country": "Pays",
    "profile.edit": "Modifier le profil", "profile.share": "Partager le profil", "profile.myVideos": "Mes vidéos ({n})",
    "edit.title": "Modifier le profil", "edit.channelName": "Nom de la chaîne", "edit.email": "E-mail",
    "edit.password": "Changer le mot de passe", "edit.firstName": "Prénom", "edit.lastName": "Nom",
    "edit.gender": "Genre", "edit.country": "Pays", "edit.language": "Langue", "edit.dob": "Date de naissance",
    "edit.bio": "Bio", "edit.save": "ENREGISTRER LES MODIFICATIONS",
    "lang.suggest": "La langue de votre pays est {lang}. Passer l'application dans cette langue ?", "lang.switch": "Changer", "lang.later": "Pas maintenant",
  },
};

const RTL_LANGS = ["ur", "ar", "fa", "ps"];
const LANGUAGE_NAMES = { en: "English", ur: "اردو", ar: "العربية", hi: "हिन्दी", es: "Español", fr: "Français" };
const LANG_KEY = "tolvify_lang";

let currentLang = "en";
try {
  const savedLang = localStorage.getItem(LANG_KEY);
  if (savedLang && STRINGS[savedLang]) currentLang = savedLang;
} catch (e) {}
const langListeners = new Set();

function applyLangToDocument(code) {
  try {
    document.documentElement.lang = code;
    document.documentElement.dir = RTL_LANGS.indexOf(code) !== -1 ? "rtl" : "ltr";
  } catch (e) {}
}
applyLangToDocument(currentLang);

function setAppLanguage(code) {
  const next = STRINGS[code] ? code : "en";
  currentLang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
  applyLangToDocument(next);
  langListeners.forEach((fn) => fn());
}

function translate(key, vars) {
  const table = STRINGS[currentLang] || {};
  let str = table[key] || STRINGS.en[key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => { str = str.split("{" + k + "}").join(String(vars[k])); });
  }
  return str;
}

function useT() {
  const lang = React.useSyncExternalStore(
    (cb) => { langListeners.add(cb); return () => langListeners.delete(cb); },
    () => currentLang
  );
  return { t: translate, lang: lang };
}

function saveLanguageToServer(token, code) {
  if (!token) return;
  fetch(API_BASE + "/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ language: code === "en" ? "" : code }),
  }).catch(() => {});
}

function LanguageSync({ token }) {
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(API_BASE + "/users/me/profile", { headers: { Authorization: "Bearer " + token } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && d.profile) setAppLanguage(d.profile.language || "en");
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token]);
  return null;
}

function LanguageSuggest({ countryCode, token }) {
  const { t, lang } = useT();
  const [info, setInfo] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetch(API_BASE + "/languages")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setInfo(d);
      })
      .catch(() => {});
  }, []);

  if (hidden || !info || !countryCode) return null;
  const code = info.countryLanguage[countryCode];
  if (!code || code === lang || !STRINGS[code]) return null;
  const dismissKey = "tolvify_lang_dismiss_" + code;
  try {
    if (localStorage.getItem(dismissKey)) return null;
  } catch (e) {}
  const meta = info.languages.find((l) => l.code === code);

  const apply = () => {
    setAppLanguage(code);
    saveLanguageToServer(token, code);
    setHidden(true);
  };
  const dismiss = () => {
    try { localStorage.setItem(dismissKey, "1"); } catch (e) {}
    setHidden(true);
  };

  return (
    <div className="wd-banner">
      <strong>{t("lang.suggest", { lang: meta ? meta.name : code })}</strong>
      <div className="wd-pick">
        <button type="button" onClick={apply}>{STRINGS[code]["lang.switch"]}</button>
        <button type="button" className="lang-later" onClick={dismiss}>{t("lang.later")}</button>
      </div>
    </div>
  );
}

function Flag({ code, size }) {
  const [bad, setBad] = useState(false);
  if (!code || code.length !== 2 || bad) return <span className="flag-fallback">🌍</span>;
  const c = code.toLowerCase();
  const w = size || 28;
  return (
    <img
      className="flag-img"
      src={"https://flagcdn.com/w40/" + c + ".png"}
      srcSet={"https://flagcdn.com/w80/" + c + ".png 2x"}
      width={w}
      height={Math.round(w * 0.75)}
      alt=""
      loading="lazy"
      onError={() => setBad(true)}
    />
  );
}

function countryNameOf(code) {
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(String(code).toUpperCase());
    return name || code;
  } catch (e) {
    return code;
  }
}

function flagOf(code) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint.apply(
    null,
    code.toUpperCase().split("").map(function (c) { return 127397 + c.charCodeAt(0); })
  );
}

function CountriesView({ token, userId }) {
  const { t } = useT();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [retry, setRetry] = useState(0);
  const [pick, setPick] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const headers = token ? { Authorization: "Bearer " + token } : {};
    fetch(API_BASE + "/countries", { headers: headers })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad"))))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError(t("countries.error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, retry]);

  const saveCountry = () => {
    if (!pick || !token || saving) return;
    setSaving(true);
    setSaveErr("");
    fetch(API_BASE + "/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ country: pick }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d: d })))
      .then((res) => {
        if (!res.ok) { setSaveErr(res.d.error || "Could not save"); return; }
        setPick("");
        setRetry((n) => n + 1);
      })
      .catch(() => setSaveErr("Network problem, please try again"))
      .finally(() => setSaving(false));
  };

  if (selected) {
    return (
      <section className="cm">
        <div className="cm-head">
          <button className="icon-btn" type="button" onClick={() => setSelected(null)} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <div className="cm-title">
            <strong><Flag code={selected.code} size={22} /> {selected.name}</strong>
            <span>{t("common.members", { n: shortCount(selected.membersCount) })}</span>
          </div>
        </div>
        <VideosFeed key={selected.code} token={token} userId={userId} community={selected.name} />
      </section>
    );
  }

  const list = data ? data.countries : [];
  const q = query.trim().toLowerCase();
  const filtered = q ? list.filter((c) => c.name.toLowerCase().indexOf(q) !== -1) : list;
  const top = list.filter((c) => c.membersCount > 0).slice(0, 6);
  const alpha = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  const mine = data && data.mine ? list.find((c) => c.code === data.mine) : null;

  return (
    <section className="cm">
      <h2 className="cm-h">{t("countries.title")}</h2>

      {error && (
        <div className="feed-status feed-status-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setRetry((n) => n + 1)}>Retry</button>
        </div>
      )}

      {loading && !data && (
        <div className="cm-grid">
          {[0, 1, 2, 3].map((i) => <div key={i} className="cm-card cm-skel" />)}
        </div>
      )}

      {data && (
        <div className="wd-sum">
          <span className="wd-sumflag">🌍</span>
          <div>
            <strong>{t("common.members", { n: shortCount(data.totalUsers) })}</strong>
            <span>{t("countries.active", { n: data.activeCountries })}</span>
          </div>
        </div>
      )}

      {data && token && !data.mine && (
        <div className="wd-banner">
          <strong>{t("countries.pickTitle")}</strong>
          <span>{t("countries.pickHint")}</span>
          <div className="wd-pick">
            <select value={pick} onChange={(e) => setPick(e.target.value)}>
              <option value="">{t("countries.pickPlaceholder")}</option>
              {alpha.map((c) => <option key={c.code} value={c.code}>{flagOf(c.code)} {c.name}</option>)}
            </select>
            <button type="button" onClick={saveCountry} disabled={!pick || saving}>{saving ? "..." : t("common.save")}</button>
          </div>
          {saveErr && <em>⚠ {saveErr}</em>}
        </div>
      )}

      {mine && <p className="wd-mine">{t("countries.mine")} <Flag code={mine.code} size={20} /> {mine.name}</p>}

      {data && data.mine && <LanguageSuggest countryCode={data.mine} token={token} />}

      {top.length > 0 && (
        <>
          <h3 className="wd-h3">{t("countries.top")}</h3>
          <div className="cm-grid">
            {top.map((c, i) => {
              const col = COMMUNITY_COLORS[i % COMMUNITY_COLORS.length];
              return (
                <button
                  key={c.code}
                  type="button"
                  className="cm-card"
                  style={{ background: "linear-gradient(135deg, " + col[0] + ", " + col[1] + ")" }}
                  onClick={() => setSelected(c)}
                >
                  <span className="wd-bigflag"><Flag code={c.code} size={56} /></span>
                  <strong>{c.name}</strong>
                  <span className="cm-count">{t("common.members", { n: shortCount(c.membersCount) })}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {data && (
        <>
          <input
            className="wd-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("countries.search")}
          />
          {filtered.map((c) => (
            <div>
              key={c.code}
              className={"wd-row" + (data.mine === c.code ? " mine" : "")}
              onClick={() => setSelected(c)}
            >
              <span className="wd-flag"><Flag code={c.code} size={30} /></span>
              <div className="cm-rowtext">
                <strong>{c.name}</strong>
                <span>
                  {c.membersCount > 0 ? t("common.members", { n: shortCount(c.membersCount) }) : t("countries.noMembers")}
                  {c.videosCount > 0 ? " · " + t("countries.videos", { n: c.videosCount }) : ""}
                </span>
              </div>
              <span className="wd-arrow">›</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="feed-status">{t("countries.noMatch")}</p>}
        </>
      )}
    </section>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Sahi email address daalein");
    if (password.length < 6) return setError("Password kam se kam 6 characters ka ho");
    if (mode === "signup" && !name.trim()) return setError("Apna naam daalein");

    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login";
      const body =
        mode === "signup"
          ? { username: email.split("@")[0] + Date.now(), email, password, displayName: name }
          : { email, password };

      const res = await fetch(API_BASE + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return setError(data.error || "Kuch masla ho gaya, dobara try karein");
      }

      setLoading(false);
      onAuth({
        name: data.user.displayName || data.user.username,
        email,
        token: data.token,
        id: data.user.id,
      });
    } catch (err) {
      setLoading(false);
      setError("Server tak nahi pohanch paaye. Internet check karein.");
    }
  };

  return (
    <div className="auth-root">
      <style>{`
        .auth-root {
          --bg: #15121C; --surface: #201B29; --surface-2: #2A2333;
          --border: #322B3D; --text: #F3F0F7; --text-muted: #9B94A8;
          --accent: #FF4D6D; --accent-2: #33D6A6;
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: var(--bg); font-family: 'Inter', sans-serif; padding: 20px;
        }
        .auth-root * { box-sizing: border-box; }
        .auth-card {
          width: 100%; max-width: 380px; background: var(--surface);
          border: 1px solid var(--border); border-radius: 20px; padding: 32px 28px;
        }
        .auth-brand {
          font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700;
          text-align: center; margin-bottom: 4px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .auth-sub { text-align: center; color: var(--text-muted); font-size: 13px; margin-bottom: 26px; }
        .auth-tabs { display: flex; background: var(--surface-2); border-radius: 10px; padding: 4px; margin-bottom: 22px; }
        .auth-tabs button {
          flex: 1; padding: 8px; border: none; background: transparent; color: var(--text-muted);
          font-size: 13px; font-weight: 600; border-radius: 8px; cursor: pointer;
        }
        .auth-tabs button.active { background: var(--surface); color: var(--text); }
        .auth-field { margin-bottom: 14px; }
        .auth-field label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
        .auth-input {
          display: flex; align-items: center; gap: 8px;
          background: var(--surface-2); border: 1px solid var(--border); border-radius: 10px;
          padding: 10px 12px;
        }
        .auth-input input {
          background: transparent; border: none; outline: none; color: var(--text);
          font-size: 14px; width: 100%;
        }
        .auth-input svg { color: var(--text-muted); flex-shrink: 0; }
        .auth-error { color: var(--accent); font-size: 12px; margin-bottom: 12px; }
        .auth-submit {
          width: 100%; padding: 12px; border-radius: 10px; border: none;
          background: var(--accent); color: white; font-weight: 600; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-submit:disabled { opacity: 0.7; cursor: default; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div className="auth-card">
        <div className="auth-brand">Tolvify</div>
        <div className="auth-sub">Create. Connect. Watch.</div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Log In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Sign Up</button>
        </div>

        <div>
          {mode === "signup" && (
            <div className="auth-field">
              <label>Naam</label>
              <div className="auth-input">
                <User size={16} />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aapka naam" />
              </div>
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <div className="auth-input">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(e)}
                placeholder="aap@example.com"
              />
            </div>
          </div>
          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit(e)}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button
            className="auth-submit"
            type="button"
            disabled={loading}
            onClick={submit}
          >
            {loading && <Loader2 size={16} className="spin" />}
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="setting-row">
      <div className="setting-row-text">
        <span className="setting-label">{label}</span>
        {sub && <span className="setting-sub">{sub}</span>}
      </div>
      <button className={"toggle" + (checked ? " on" : "")} onClick={() => onChange(!checked)}>
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

function MessagesView({ conversations, activeId, onOpenChat, onBack, onSend, currentUser }) {
  const active = conversations.find((c) => c.id === activeId);
  const [draft, setDraft] = useState("");

  if (active) {
    const send = () => {
      if (!draft.trim()) return;
      onSend(active.id, draft.trim());
      setDraft("");
    };
    return (
      <div className="chat-view">
        <div className="chat-head">
          <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
          <Avatar name={active.user} size={34} />
          <span className="chat-head-name">{active.user}</span>
        </div>
        <div className="chat-messages">
          {active.messages.map((m) => (
            <div key={m.id} className={"chat-bubble-row" + (m.from === "me" ? " mine" : "")}>
              <div className="chat-bubble">
                <span>{m.text}</span>
                <span className="chat-bubble-time">{m.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Message likhein..."
          />
          <button onClick={send} disabled={!draft.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>

      </div>
);
}
export default App;
