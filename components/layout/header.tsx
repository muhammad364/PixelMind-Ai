export function Header() {
  return (
    <header className="fade-in-up relative mx-auto mt-4 flex w-full max-w-5xl items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-xl md:justify-between">
      <div className="flex items-center">
        <img
          src="/icon.png"
          alt="PixelMind AI Logo"
          width={32}
          height={32}
          style={{ borderRadius: "8px", marginRight: "8px" }}
        />
        <p className="font-display text-lg font-bold text-white md:text-xl">
          PixelMind AI
        </p>
      </div>
      <p className="hidden text-xs text-gray-300 md:block">
        Free AI Image Generator
      </p>
    </header>
  );
}
