import logoFull from "../assets/ballonfly-logo.png";
import butterfly from "../assets/ballonfly-butterfly.png";
import authLogo from "../assets/ballonfly-auth-logo.png";

// full = dark background par, mark = sirf butterfly, light = light background par (Login/Signup design wala logo)
export default function Logo({ variant = "full", height = 48, style }) {
  const src = variant === "mark" ? butterfly : variant === "light" ? authLogo : logoFull;
  return <img src={src} alt="Ballonfly" style={{ height, width: "auto", display: "block", ...style }} />;
}
