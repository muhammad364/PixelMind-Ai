export async function POST(req: Request) {
  const { prompt } = await req.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `You are an expert AI image prompt engineer. Take the user's simple prompt and enhance it into a detailed, vivid, professional image generation prompt. Add specific details about lighting, style, mood, camera angle, quality descriptors. Keep it under 200 words. Return ONLY the enhanced prompt, nothing else, no explanations.

          User prompt: "${prompt}"`,
        },
      ],
    }),
  });

  const data = await response.json();
  const enhancedPrompt = data.choices[0].message.content;
  return Response.json({ enhancedPrompt });
}

export const runtime = "edge";
