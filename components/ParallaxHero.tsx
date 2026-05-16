"use client";
export default function ParallaxHero() {
  return (
    <div style={{ textAlign: "center", padding: "80px 16px 40px" }}>

      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(3rem, 8vw, 7rem)",
        fontWeight: 800,
        background: "linear-gradient(135deg, #a855f7, #ec4899, #f97316)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "24px",
        lineHeight: 1.1,
      }}>
        PixelMind AI
      </h1>
      <p style={{
        color: "#94a3b8",
        fontSize: "1.1rem",
        maxWidth: "500px",
        margin: "0 auto",
      }}>
        Transform your imagination into stunning visuals in seconds
      </p>
    </div>
  );
}
