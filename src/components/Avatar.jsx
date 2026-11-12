export default function Avatar({ name = "?", src, size = 40, className = "", onClick }) {
  return (<span className={"avimg " + className} onClick={onClick} style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>{src ? <img src={src} alt="" /> : String(name || "?")[0].toUpperCase()}</span>);
}
