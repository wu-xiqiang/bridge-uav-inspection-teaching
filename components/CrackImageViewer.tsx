"use client";

import { useEffect, useRef } from "react";
import type { CrackRecord } from "@/lib/types";

export function CrackImageViewer({ crack, showMask }: { crack: CrackRecord; showMask: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new Image();
    image.src = crack.image;
    image.onload = () => {
      canvas.width = 800;
      canvas.height = 440;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (!showMask) return;
      const points = crack.mask.map(([x, y]) => [x * 8, y * 4.4] as [number, number]);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = "rgba(255, 41, 78, .34)";
      ctx.lineWidth = 22;
      ctx.stroke();
      ctx.beginPath();
      points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.strokeStyle = "#ff294e";
      ctx.lineWidth = 3;
      ctx.stroke();
      const mid = points[Math.floor(points.length / 2)];
      ctx.strokeStyle = "#ffe37c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(mid[0] - 28, mid[1] - 18);
      ctx.lineTo(mid[0] + 28, mid[1] + 18);
      ctx.stroke();
      ctx.fillStyle = "rgba(8, 17, 22, .88)";
      ctx.fillRect(mid[0] + 18, mid[1] - 45, 134, 34);
      ctx.fillStyle = "#ffe37c";
      ctx.font = "600 20px system-ui";
      ctx.fillText(`MAX ${crack.maxWidth.toFixed(2)} mm`, mid[0] + 28, mid[1] - 21);
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 402);
      ctx.lineTo(180, 402);
      ctx.stroke();
      ctx.fillStyle = "white";
      ctx.font = "16px system-ui";
      ctx.fillText("50 mm", 82, 392);
    };
  }, [crack, showMask]);

  return <canvas ref={canvasRef} className="crack-canvas" aria-label={`${crack.id}巡检图像`} />;
}
