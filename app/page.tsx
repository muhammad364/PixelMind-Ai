"use client";


import { Textarea } from "@/components/ui/textarea";
import { stylePresets, randomPrompts, dimensionsMap } from "@/lib/config";
import imagePlaceholder from "@/public/image-placeholder.png";
import ParallaxBackground from "@/components/ParallaxBackground";
import ParallaxHero from "@/components/ParallaxHero";
import Image from "next/image";
import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Sparkles,
  TriangleAlert,
  WandSparkles,
  X,
  Dices,
  Wand2,
  ChevronDown,
  ChevronUp,
  Check,
  Palette,
  Type,
} from "lucide-react";

type ImageResponse = {
  b64_json: string;
};

type GenerationItem = {
  id: string;
  prompt: string;
  image: ImageResponse;
};

const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 3;

const tips = [
  "Tip: Be descriptive for better results",
  "Tip: Try adding art styles like 'oil painting' or 'anime'",
  "Tip: Mention lighting like 'golden hour' for atmosphere",
];

function mapErrorToMessage(error: unknown) {
  if (!navigator.onLine) {
    return "No internet connection. Please check your network.";
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (lower.includes("network") || lower.includes("failed to fetch")) {
      return "No internet connection. Please check your network.";
    }
    if (lower.includes("status: 429") || lower.includes("429")) {
      return "Too many requests. Please wait a few seconds and try again.";
    }
    if (lower.includes("status: 500") || lower.includes("500")) {
      return "Something went wrong on our end. Please retry.";
    }
  }

  return "Image generation failed. Please try again.";
}

// BASE CARD STYLE — use this for both Aspect Ratio AND Style cards
const cardBaseStyle = {
  flexShrink: 0,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  position: "relative" as const,
};

// SELECTED CARD STYLE
const cardSelectedStyle = {
  ...cardBaseStyle,
  background: "rgba(168,85,247,0.12)",
  border: "2px solid #a855f7",
  boxShadow: "0 0 20px rgba(168,85,247,0.15)",
};

// Use this EXACT container style for BOTH Aspect Ratio row AND Style row
const rowContainerStyle = {
  display: "flex",
  gap: "10px",
  overflowX: "auto" as const,
  paddingBottom: "6px",
  paddingTop: "4px",
  scrollbarWidth: "none" as const,
  msOverflowStyle: "none" as const,
};

// Use this for BOTH "ASPECT RATIO" and "STYLE" labels
const sectionLabelStyle = {
  color: "#94a3b8",
  fontSize: "0.75rem",
  fontWeight: 600,
  fontFamily: "'Space Grotesk', sans-serif",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: "12px",
  display: "block",
};

function HomeContent() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyleValue, setSelectedStyleValue] = useState("none");
  const [iterativeMode, setIterativeMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [recentGenerations, setRecentGenerations] = useState<GenerationItem[]>(
    [],
  );
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(
    null,
  );
  const [tipIndex, setTipIndex] = useState(0);

  // New states for Text on Image
  const [showTextOnImage, setShowTextOnImage] = useState(false);
  const [imageText, setImageText] = useState("");
  const [fontStyle, setFontStyle] = useState("Bold");
  const [textPosition, setTextPosition] = useState("Center");
  const [textColor, setTextColor] = useState("White");

  // New states for Enhancer and Random
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  // New state for Aspect Ratio
  const [selectedRatio, setSelectedRatio] = useState("1:1");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const styleScrollRef = useRef<HTMLDivElement>(null);

  const scrollStyles = (direction: "left" | "right") => {
    if (styleScrollRef.current) {
      styleScrollRef.current.scrollBy({
        left: direction === "right" ? 220 : -220,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const activeGeneration = useMemo(
    () =>
      recentGenerations.find((generation) => generation.id === activeGenerationId) ??
      recentGenerations[0],
    [activeGenerationId, recentGenerations],
  );

  const isPromptTooShort = prompt.trim().length < MIN_PROMPT_LENGTH;

  const handleRandomPrompt = () => {
    setIsShuffling(true);
    const random = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(random);
    
    // highlight animation
    const textarea = document.getElementById('main-prompt-textarea');
    if (textarea) {
      textarea.style.boxShadow = "0 0 15px rgba(168,85,247,0.5)";
      setTimeout(() => {
        textarea.style.boxShadow = "0 0 0 0 rgba(168,85,247,0)";
      }, 500);
    }
    setTimeout(() => setIsShuffling(false), 500);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    setIsEnhancing(true);
    try {
      const response = await fetch("/api/enhancePrompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error("Enhancement failed");
      const data = await response.json();
      setPrompt(data.enhancedPrompt);
      toast.success("✦ Prompt enhanced by Groq AI!");
      const textarea = document.getElementById('main-prompt-textarea');
      if (textarea) {
        textarea.style.boxShadow = "0 0 15px rgba(236,72,153,0.5)";
        setTimeout(() => {
          textarea.style.boxShadow = "0 0 0 0 rgba(236,72,153,0)";
        }, 500);
      }
    } catch (err) {
      toast.error("Enhancement failed, please try again");
    } finally {
      setIsEnhancing(false);
    }
  };

  async function requestImageGeneration(promptToGenerate: string) {
    const { width, height } = dimensionsMap[selectedRatio];
    const response = await fetch("/api/generateImages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptToGenerate,
        iterativeMode,
        width,
        height
      }),
    });

    if (!response.ok) {
      throw new Error(`status:${response.status}`);
    }

    return (await response.json()) as ImageResponse;
  }

  async function generateImage(promptOverride?: string) {
    let resolvedPrompt = (promptOverride ?? prompt).trim();

    if (resolvedPrompt.length < MIN_PROMPT_LENGTH || isGenerating) {
      return;
    }

    // Apply Text on Image
    if (imageText) {
      resolvedPrompt += `. The image must contain the exact text "${imageText}" written in ${fontStyle} style, positioned at the ${textPosition} of the image, in ${textColor} color. Make the text clearly readable and prominent.`;
    }

    // Apply Style
    const selectedStyle = stylePresets.find(s => s.id === selectedStyleValue);
    if (selectedStyle && selectedStyle.id !== "none") {
      resolvedPrompt += `. Style: ${selectedStyle.prompt}`;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setLastPrompt(resolvedPrompt);

    try {
      const image = await requestImageGeneration(resolvedPrompt);
      const generationItem = {
        id: crypto.randomUUID(),
        prompt: resolvedPrompt,
        image,
      };

      setRecentGenerations((previous) => [generationItem, ...previous].slice(0, 4));
      setActiveGenerationId(generationItem.id);
      toast.success("✦ Image generated!");
      setToastMsg("✦ Image generated successfully!");
      setTimeout(() => setToastMsg(null), 3000);
    } catch (error) {
      setErrorMessage(mapErrorToMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRetry() {
    if (!lastPrompt) return;
    setPrompt(lastPrompt);
    void generateImage(lastPrompt);
  }

  function handlePromptCopy() {
    const promptToCopy = prompt.trim() || activeGeneration?.prompt;
    if (!promptToCopy) return;
    void navigator.clipboard.writeText(promptToCopy);
    toast.success("Copied!");
  }

  function handleDownload() {
    if (!activeGeneration) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${activeGeneration.image.b64_json}`;
    link.download = `pixelmind-ai-${activeGeneration.prompt.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <main style={{
      width: "100%",
      maxWidth: "100vw",
      minHeight: "100vh",
      margin: "0",
      padding: "0",
      overflowX: "hidden",
      background: "#07070f",
      position: "relative",
      boxSizing: "border-box",
    }}>
      {/* Parallax Background */}
      <ParallaxBackground />

      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Navbar */}
        <nav style={{
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(20px)",
          background: "rgba(7,7,15,0.85)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          boxSizing: "border-box",
        }}>
          <div style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}>
            {/* Logo and name on left */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/icon.png" alt="logo" width={36} height={36}
                style={{ borderRadius: "10px" }} />
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "1.2rem",
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>PixelMind AI</span>
            </div>
            {/* Right side text */}
            <span style={{
              color: "#64748b",
              fontSize: "0.85rem",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>Free AI Image Generator</span>
          </div>
        </nav>

        {/* Hero centered */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <ParallaxHero />
        </div>

        {/* Main content box centered */}
        <div style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 32px 80px 32px",
          boxSizing: "border-box",
        }}>
          <form
            className="glass-card"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "24px",
              padding: "28px 32px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              marginBottom: "20px",
              overflow: "hidden",
            }}
            onSubmit={(event) => {
              event.preventDefault();
              void generateImage();
            }}
          >
            <fieldset>
              {/* Textarea wrapper */}
              {/* Textarea Section */}
              <div style={{ position: "relative", width: "100%", marginBottom: "8px" }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create..."
                  maxLength={500}
                  style={{
                    width: "100%",
                    minHeight: "130px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "16px 16px 52px 16px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontFamily: "'Space Grotesk', sans-serif",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                    display: "block",
                  }}
                />
                {/* Enhance Prompt button - locked inside textarea */}
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    background: "linear-gradient(135deg, #a855f7, #ec4899)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "8px 16px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    whiteSpace: "nowrap",
                    zIndex: 2,
                  }}
                >
                  {isEnhancing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  {isEnhancing ? "Enhancing..." : "✦ Enhance Prompt"}
                </button>
              </div>
              {/* Character counter */}
              <p style={{
                color: "#64748b",
                fontSize: "0.8rem",
                textAlign: "right",
                marginBottom: "16px",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {prompt.length} / 500
              </p>

              {/* Feature 1: Text on Image */}
              <div style={{ marginTop: "16px" }} className="rounded-xl border border-[#a855f7]/30 bg-black/40 overflow-hidden transition-all duration-300">
                <button
                  type="button"
                  onClick={() => setShowTextOnImage(!showTextOnImage)}
                  className="flex w-full items-center justify-between p-3 text-sm font-semibold text-gray-200 hover:bg-white/5 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Type className="size-4 text-[#a855f7]" />
                    ✦ Add Text to Image
                  </span>
                  {showTextOnImage ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${showTextOnImage ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 space-y-4">
                      <input
                        type="text"
                        value={imageText}
                        onChange={(e) => setImageText(e.target.value)}
                        placeholder="Type text to appear in the image e.g. 'Hello World'"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                      />
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex-1 min-w-[120px]">
                          <label className="mb-1 block text-xs text-gray-400">Font Style</label>
                          <select 
                            value={fontStyle} 
                            onChange={(e) => setFontStyle(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                          >
                            <option>Bold</option>
                            <option>Elegant Script</option>
                            <option>Neon Glowing</option>
                            <option>Graffiti</option>
                            <option>Vintage</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="mb-1 block text-xs text-gray-400">Position</label>
                          <select 
                            value={textPosition} 
                            onChange={(e) => setTextPosition(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-[#a855f7]"
                          >
                            <option>Top</option>
                            <option>Center</option>
                            <option>Bottom</option>
                          </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                          <label className="mb-1 block text-xs text-gray-400">Color</label>
                          <div className="flex gap-2">
                            {['White', 'Black', 'Gold', 'Red', 'Blue'].map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={(e) => { e.preventDefault(); setTextColor(color); }}
                                className={`size-6 rounded-full border-2 transition-all ${textColor === color ? 'border-[#a855f7] scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color.toLowerCase(), ...(color === 'Black' ? { border: '1px solid #333' } : {}) }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Aspect Ratio Selector */}
              <div style={{ marginTop: "20px" }}>
                <p style={sectionLabelStyle}>
                  Aspect Ratio
                </p>
                <div style={rowContainerStyle}>
                  {Object.entries(dimensionsMap).map(([ratio, data]) => {
                    const isSelected = selectedRatio === ratio;
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setSelectedRatio(ratio)}
                        style={{
                          width: "100px",
                          height: "100px",
                          flexShrink: 0,
                          borderRadius: "14px",
                          padding: "10px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          cursor: "pointer",
                          border: isSelected
                            ? "2px solid #a855f7"
                            : "1px solid rgba(255,255,255,0.08)",
                          background: isSelected
                            ? "rgba(168,85,247,0.12)"
                            : "rgba(255,255,255,0.04)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Shape icon */}
                        <span style={{
                          color: isSelected ? "#a855f7" : "#64748b",
                          fontSize: "1.4rem",
                          lineHeight: 1,
                        }}>{data.icon}</span>
                        {/* Ratio label - MUST be visible */}
                        <span style={{
                          color: isSelected ? "#a855f7" : "#e2e8f0",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk', sans-serif",
                          textAlign: "center",
                        }}>{ratio}</span>
                        {/* Description */}
                        <span style={{
                          color: isSelected ? "rgba(168,85,247,0.8)" : "#64748b",
                          fontSize: "0.7rem",
                          fontWeight: 400,
                          fontFamily: "'Space Grotesk', sans-serif",
                          textAlign: "center",
                        }}>{data.useCase}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature 5: Image Style Presets */}
              <div style={{ marginBottom: "20px" }}>
                {/* Label row with arrows */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}>
                  <span style={{
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}>
                    Style
                  </span>
                  {/* Scroll Arrow Buttons */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => scrollStyles("left")}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(168,85,247,0.15)";
                        e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
                        e.currentTarget.style.color = "#a855f7";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#94a3b8";
                      }}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollStyles("right")}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(168,85,247,0.15)";
                        e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)";
                        e.currentTarget.style.color = "#a855f7";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#94a3b8";
                      }}
                    >
                      →
                    </button>
                  </div>
                </div>

                <div style={{ position: "relative", width: "100%" }}>
                  {/* Left fade */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 8,
                    width: "40px",
                    background: "linear-gradient(to right, #0d0d1a, transparent)",
                    zIndex: 2,
                    pointerEvents: "none",
                    borderRadius: "14px 0 0 14px",
                  }} />
                  {/* Right fade */}
                  <div style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    bottom: 8,
                    width: "60px",
                    background: "linear-gradient(to left, #0d0d1a, transparent)",
                    zIndex: 2,
                    pointerEvents: "none",
                    borderRadius: "0 14px 14px 0",
                  }} />
                  {/* Scrollable Cards Row */}
                  <div
                    ref={styleScrollRef}
                    style={{
                      display: "flex",
                      gap: "10px",
                      overflowX: "auto",
                      paddingBottom: "8px",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      scrollBehavior: "smooth",
                    }}
                  >
                    {stylePresets.map((style) => {
                      const isSelected = selectedStyleValue === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyleValue(style.id)}
                          style={{
                            width: "100px",
                            height: "100px",
                            flexShrink: 0,
                            borderRadius: "14px",
                            padding: "10px 8px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            cursor: "pointer",
                            border: isSelected
                              ? "2px solid #a855f7"
                              : "1px solid rgba(255,255,255,0.08)",
                            background: isSelected
                              ? "rgba(168,85,247,0.12)"
                              : "rgba(255,255,255,0.04)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 rounded-full bg-[#a855f7] p-0.5">
                              <Check className="size-2.5 text-white" />
                            </div>
                          )}
                          <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>{style.emoji}</span>
                          <span style={{
                            color: isSelected ? "#a855f7" : "#e2e8f0",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            fontFamily: "'Space Grotesk', sans-serif",
                            textAlign: "center",
                          }}>{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                width: "100%",
                boxSizing: "border-box",
                marginTop: "20px",
                paddingTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}>
                {/* Left side - styles and consistency mode */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <label
                    title="Use earlier images as references"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      height: "42px",
                    }}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#a855f7]"
                      checked={iterativeMode}
                      onChange={() => {
                        setIterativeMode(!iterativeMode);
                      }}
                    />
                    Consistency Mode
                  </label>
                  
                  <button
                    type="button"
                    onClick={handlePromptCopy}
                    disabled={!prompt.trim() && !activeGeneration?.prompt}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      fontFamily: "'Space Grotesk', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      height: "42px",
                    }}
                    title="Copy prompt"
                  >
                    <Copy className="size-4" />
                    Copy
                  </button>
                </div>

                {/* Right side - Random and Generate */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {/* Feature 2: Random Prompt Button */}
                  <button
                    type="button"
                    onClick={handleRandomPrompt}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#94a3b8",
                      cursor: "pointer",
                      height: "42px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Generate a random creative prompt"
                  >
                    <Dices className={`size-5 text-[#a855f7] ${isShuffling ? "animate-spin" : ""}`} />
                  </button>

                  <button
                    type="submit"
                    disabled={isPromptTooShort || isGenerating}
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 28px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      fontFamily: "'Space Grotesk', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      height: "42px",
                      transition: "all 0.2s ease",
                      animation: isGenerating ? "none" : "pulse-glow 3s ease-in-out infinite",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "scale(1.04) translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 20px 40px rgba(168,85,247,0.4)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "scale(1) translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.transform = "scale(0.97)";
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.transform = "scale(1.04) translateY(-2px)";
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        ✨ Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-blue-200/80 transition-opacity duration-500">
                {tips[tipIndex]}
              </p>

              {errorMessage ? (
                <div className="slide-down mt-4 rounded-xl border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.1)] p-3 text-left text-sm text-red-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                      <p>{errorMessage}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="text-red-100/90 transition hover:text-white"
                      aria-label="Dismiss error"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={!lastPrompt || isGenerating}
                      className="inline-flex items-center gap-2 rounded border border-red-200/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw className="size-3.5" />
                      Retry
                    </button>
                  </div>
                </div>
              ) : null}
            </fieldset>
          </form>

          {/* Image Output Section */}
          {!activeGeneration && !isGenerating ? (
            <div className="glass-card" style={{ borderRadius: "24px", padding: "28px", textAlign: "center" }}>
              <p className="font-display text-2xl font-bold text-gray-100 md:text-3xl">
                Ready when you are
              </p>
              <p className="mt-3 text-gray-300">
                Enter a prompt and click Generate to create your first PixelMind AI image.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Image Display Card */}
              {isGenerating ? (
                <div className="glass-card" style={{
                  borderRadius: "24px",
                  height: "58vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div className="shimmer" style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "20px",
                    position: "absolute",
                    inset: 0,
                  }} />
                  <p style={{
                    position: "relative",
                    color: "#a855f7",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "1rem",
                    animation: "fadeIn 1s ease infinite alternate",
                  }}>
                    ✦ Crafting your image...
                  </p>
                </div>
              ) : activeGeneration ? (
                <div className="glass-card image-reveal" style={{
                  borderRadius: "24px",
                  overflow: "hidden",
                  position: "relative",
                  maxHeight: "58vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 60px rgba(168,85,247,0.15), 0 40px 80px rgba(0,0,0,0.5)",
                }}>
                  <Image
                    placeholder="blur"
                    blurDataURL={imagePlaceholder.blurDataURL}
                    width={1024}
                    height={1024}
                    src={`data:image/png;base64,${activeGeneration.image.b64_json}`}
                    alt={activeGeneration.prompt}
                    loading="lazy"
                    style={{
                      maxHeight: "58vh",
                      maxWidth: "100%",
                      objectFit: "contain",
                      borderRadius: "20px",
                    }}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-2">
                    {selectedStyleValue !== 'none' && (
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-[#a855f7]/30 bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-pink-300">
                        <Palette className="size-3" />
                        {stylePresets.find(s => s.id === selectedStyleValue)?.label}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/[0.08] px-3 py-1.5 text-xs text-white transition-all duration-300 ease-in-out hover:bg-white/[0.15] backdrop-blur"
                      title="Download image"
                    >
                      <Download className="size-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Recent Generations */}
              <div className="glass-card" style={{ borderRadius: "20px", padding: "12px", textAlign: "left" }}>
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <p className="inline-flex items-center gap-2 font-display text-sm font-bold text-gray-100">
                    <Sparkles className="size-4" />
                    Recent Generations
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentGenerations([]);
                      setActiveGenerationId(null);
                    }}
                    disabled={recentGenerations.length === 0}
                    className="rounded-lg border border-white/20 px-2.5 py-1 text-xs text-gray-200 transition-all duration-300 ease-in-out hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear History
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {recentGenerations.length === 0 ? (
                    <p className="col-span-full text-xs text-gray-400">
                      No images yet. Generate one to see history.
                    </p>
                  ) : (
                    recentGenerations.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveGenerationId(item.id)}
                        className={`overflow-hidden rounded border transition ${
                          activeGeneration?.id === item.id
                            ? "border-[#a855f7]"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        title={item.prompt}
                      >
                        <Image
                          width={256}
                          height={192}
                          src={`data:image/png;base64,${item.image.b64_json}`}
                          alt={item.prompt}
                          className="h-20 w-full object-cover"
                        />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          color: "#475569",
          fontSize: "0.8rem",
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          PixelMind AI • Powered by Pollinations.ai • Built with Next.js
        </footer>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "linear-gradient(135deg, rgba(168,85,247,0.9), rgba(236,72,153,0.9))",
          color: "white",
          padding: "14px 20px",
          borderRadius: "14px",
          fontSize: "0.9rem",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          backdropFilter: "blur(10px)",
          animation: "toast-in 0.4s ease forwards",
          zIndex: 100,
          boxShadow: "0 10px 30px rgba(168,85,247,0.3)",
        }}>
          {toastMsg}
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
