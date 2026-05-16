"use client";
export default function ParallaxBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div style={{
        position: "absolute",
        width: "600px",
        height: "600px",
        top: "-100px",
        left: "-100px",
        background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        width: "700px",
        height: "700px",
        bottom: "-150px",
        right: "-150px",
        background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
      }} />
    </div>
  );
}
