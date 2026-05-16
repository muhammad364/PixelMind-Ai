export function Banner() {
  return (
    <div className="relative border-b border-[#7eb7ff30] bg-[#0d2e66b3] p-2 text-center text-blue-50 backdrop-blur-md">
      <p className="text-balance text-sm sm:text-base">
        Check out the free image generation demo from{" "}
        <a
          href="https://pollinations.ai"
          className="font-semibold underline decoration-blue-200/60 underline-offset-4"
          target="_blank"
        >
          Pollinations AI
        </a>{" "}
        for fast AI image generation
      </p>
    </div>
  );
}
