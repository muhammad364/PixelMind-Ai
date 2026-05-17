export interface TextOverlayOptions {
  text: string;
  position: "top" | "center" | "bottom";
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  padding: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right";
  textStyle: "normal" | "neon" | "shadow" | "outline" | "gradient";
}

export async function applyTextOverlay(
  base64Image: string,
  options: TextOverlayOptions,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Canvas not supported");
        return;
      }

      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(
        24,
        Math.floor((options.fontSize / 100) * img.width * 0.08),
      );
      ctx.font = `${options.fontWeight} ${fontSize}px ${options.fontFamily}`;
      ctx.textAlign = options.textAlign as CanvasTextAlign;

      const x =
        options.textAlign === "center"
          ? img.width / 2
          : options.textAlign === "right"
            ? img.width - options.padding
            : options.padding;

      const lineHeight = fontSize * 1.3;
      const words = options.text.split(" ");
      const maxWidth = img.width - options.padding * 2;
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      const totalTextHeight = lines.length * lineHeight;

      let startY: number;
      if (options.position === "top") {
        startY = options.padding + fontSize;
      } else if (options.position === "center") {
        startY = (img.height - totalTextHeight) / 2 + fontSize;
      } else {
        startY = img.height - options.padding - totalTextHeight + fontSize;
      }

      if (options.backgroundOpacity > 0) {
        const bgHeight = totalTextHeight + options.padding * 2;
        const bgY = startY - fontSize - options.padding;
        ctx.save();
        ctx.globalAlpha = options.backgroundOpacity;
        ctx.fillStyle = options.backgroundColor;
        ctx.beginPath();
        ctx.roundRect(
          options.padding / 2,
          bgY,
          img.width - options.padding,
          bgHeight,
          12,
        );
        ctx.fill();
        ctx.restore();
      }

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;

        ctx.save();

        if (options.textStyle === "neon") {
          ctx.shadowColor = options.textColor;
          ctx.shadowBlur = 20;
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = options.textColor;
          ctx.lineWidth = 2;
          ctx.strokeText(line, x, y);
          ctx.fillText(line, x, y);
          ctx.shadowBlur = 40;
          ctx.strokeText(line, x, y);
        } else if (options.textStyle === "shadow") {
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
          ctx.fillStyle = options.textColor;
          ctx.fillText(line, x, y);
        } else if (options.textStyle === "outline") {
          ctx.strokeStyle = options.strokeColor;
          ctx.lineWidth = options.strokeWidth;
          ctx.lineJoin = "round";
          ctx.strokeText(line, x, y);
          ctx.fillStyle = options.textColor;
          ctx.fillText(line, x, y);
        } else if (options.textStyle === "gradient") {
          const gradient = ctx.createLinearGradient(0, y - fontSize, 0, y);
          gradient.addColorStop(0, options.textColor);
          gradient.addColorStop(1, options.strokeColor);
          ctx.fillStyle = gradient;
          ctx.shadowColor = "rgba(0,0,0,0.5)";
          ctx.shadowBlur = 8;
          ctx.fillText(line, x, y);
        } else {
          ctx.fillStyle = options.textColor;
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 6;
          ctx.fillText(line, x, y);
        }

        ctx.restore();
      });

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject("Failed to load image");
    img.src = `data:image/png;base64,${base64Image}`;
  });
}
