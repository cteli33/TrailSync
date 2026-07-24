function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default function Avatar({ name, color = "#2f6d51", size = "" }) {
  return (
    <div className={`avatar ${size}`} style={{ background: color }}>
      {initials(name)}
    </div>
  );
}
