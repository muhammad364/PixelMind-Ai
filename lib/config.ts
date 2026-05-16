export const stylePresets = [
  {
    id: "none",
    label: "None",
    emoji: "✦",
    description: "No style",
    prompt: ""
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "⛩️",
    description: "Japanese animation style",
    prompt: "anime style, Studio Ghibli inspired, vibrant colors, detailed anime art"
  },
  {
    id: "realistic",
    label: "Realistic",
    emoji: "📷",
    description: "Photorealistic",
    prompt: "hyperrealistic, photorealistic, 8K resolution, DSLR photography, ultra detailed"
  },
  {
    id: "oilpainting",
    label: "Oil Painting",
    emoji: "🎨",
    description: "Classic oil paint",
    prompt: "oil painting style, classical art, textured brushstrokes, museum quality, renaissance style"
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    emoji: "🤖",
    description: "Neon futuristic",
    prompt: "cyberpunk style, neon lights, futuristic city, blade runner aesthetic, dark atmosphere, rain reflections"
  },
  {
    id: "watercolor",
    label: "Watercolor",
    emoji: "💧",
    description: "Soft watercolor",
    prompt: "watercolor painting style, soft edges, flowing colors, artistic, delicate brushwork"
  },
  {
    id: "pixelart",
    label: "Pixel Art",
    emoji: "👾",
    description: "Retro pixel style",
    prompt: "pixel art style, 16-bit retro game art, pixelated, colorful sprites"
  },
  {
    id: "sketch",
    label: "Sketch",
    emoji: "✏️",
    description: "Pencil sketch",
    prompt: "pencil sketch style, hand drawn, detailed line art, black and white sketch"
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🧙",
    description: "Epic fantasy art",
    prompt: "epic fantasy art style, magical, dramatic lighting, highly detailed fantasy illustration"
  },
  {
    id: "minimalist",
    label: "Minimalist",
    emoji: "◻️",
    description: "Clean minimal",
    prompt: "minimalist style, clean design, simple shapes, lots of white space, modern aesthetic"
  },
];

export const randomPrompts = [
  // Nature
  "A magical forest with glowing mushrooms and fireflies at night, ultra detailed, 8K",
  "A massive waterfall in a tropical jungle with golden sunlight breaking through trees",
  "Snow covered mountains at sunrise with a lone wolf silhouette on the peak",
  // Fantasy
  "A dragon made of crystal flying over a futuristic city at night, cinematic",
  "An ancient wizard casting spells in a dark mystical library, dramatic lighting",
  "A floating island with waterfalls cascading into clouds below, fantasy art style",
  // Sci-Fi
  "A cyberpunk street market in neon-lit Tokyo rain, blade runner aesthetic",
  "An astronaut discovering an alien ocean planet with two moons, photorealistic",
  "A massive space station orbiting a purple nebula, cinematic, detailed",
  // Architecture
  "A futuristic glass mansion on a cliff overlooking the ocean at sunset",
  "An abandoned gothic cathedral overgrown with glowing vines at midnight",
  "A cozy Japanese tea house surrounded by cherry blossoms in spring rain",
  // Characters
  "A samurai warrior standing in a bamboo forest, fog, dramatic lighting, cinematic",
  "A female scientist in a glowing laboratory with holographic displays around her",
  "An old lighthouse keeper watching a storm approach from a rocky coast",
  // Food & Still Life
  "A gorgeous gourmet burger with melting cheese and fresh ingredients, food photography",
  "A magical potion shop with colorful glowing bottles and mystical ingredients",
  // Abstract
  "A surreal melting clock landscape in the style of Salvador Dali",
  "Colorful geometric shapes forming a beautiful mandala, vibrant neon colors",
  "An infinite staircase in an impossible architecture, M.C. Escher style",
  // Animals
  "A majestic white tiger in a bamboo forest, golden hour, photorealistic",
  "A tiny fox wearing a wizard hat sitting on a pile of ancient books",
  "An underwater scene with a whale surrounded by glowing jellyfish, cinematic",
  // Cities
  "A bustling night market in Bangkok with colorful lights and street food",
  "New York City skyline at sunset reflected in the Hudson River, golden hour",
  "A post apocalyptic city reclaimed by nature with trees growing through buildings",
  // Seasons
  "A beautiful autumn forest path covered in red and orange leaves, warm light",
  "A magical winter wonderland village with glowing windows and falling snow",
  "A spring meadow full of wildflowers with mountains in the background",
  // Misc
  "A steampunk airship flying through golden clouds at sunset, detailed",
];

export const dimensionsMap: Record<string, { width: number, height: number, icon: string, useCase: string }> = {
  "1:1":  { width: 1024, height: 1024, icon: "□", useCase: "Square" },
  "16:9": { width: 1024, height: 576, icon: "▭", useCase: "Wallpaper" },
  "9:16": { width: 576,  height: 1024, icon: "▯", useCase: "Phone" },
  "4:3":  { width: 1024, height: 768, icon: "▭", useCase: "Standard" },
  "3:4":  { width: 768,  height: 1024, icon: "▯", useCase: "Portrait" },
};
