import logoFull from "../assets/ballonfly-logo.png";
import butterfly from "../assets/ballonfly-butterfly.png";

const W = 515, H = 535, SPLIT = 416;
const OUTLINE = "drop-shadow(1px 0 0 #1b2740) drop-shadow(-1px 0 0 #1b2740) drop-shadow(0 1px 0 #1b2740) drop-shadow(0 -1px 0 #1b2740)";

export default function Logo({ variant = "full", height = 48, style }) {
  if (variant === "light") {
    const part = { position: "absolute", left: 0, top: 0, width: "100%", height: "100%" };
    return (
      <div style={{ position: "relative", width: (height * W) / H, height, ...style }}>
        <img src={logoFull} alt="Ballonfly" style={{ ...part, clipPath: `inset(0 0 ${((H - SPLIT) / H) * 100}% 0)` }} />
        <div style={{ ...part, filter: OUTLINE }}>
          <img src={logoFull} alt="" style={{ ...part, clipPath: `inset(${(SPLIT / H) * 100}% 0 0 0)` }} />
        </div>
      </div>
    );
  }
  return <img src={variant === "mark" ? butterfly : logoFull} alt="Ballonfly" style={{ height, width: "auto", display: "block", ...style }} />;
}
