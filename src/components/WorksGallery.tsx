import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { triangulate, generatePoints, type Triangle } from "@/lib/delaunay";

import work1 from "@/assets/work-1.jpg";
import work2 from "@/assets/work-2.jpg";
import work3 from "@/assets/work-3.jpg";
import work4 from "@/assets/work-4.jpg";
import work5 from "@/assets/work-5.jpg";
import work6 from "@/assets/work-6.jpg";
import work7 from "@/assets/work-7.jpg";
import work8 from "@/assets/work-8.jpg";
import work9 from "@/assets/work-9.jpg";
import work10 from "@/assets/work-10.jpg";

const imageSrcs = [work1, work2, work3, work4, work5, work6, work7, work8, work9, work10];

interface AnimatedTriangle extends Triangle {
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  delay: number;
}

const WorksGallery = () => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedImages = useRef<HTMLImageElement[]>([]);
  const animFrameRef = useRef<number>(0);

  // Preload all images
  useEffect(() => {
    imageSrcs.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      loadedImages.current[i] = img;
    });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isAnimating) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const currentImg = loadedImages.current[current];
      if (!currentImg || !currentImg.complete) return;

      setIsAnimating(true);

      // Generate Delaunay triangles
      const points = generatePoints(w, h, clickX, clickY, 100);
      const tris = triangulate(points, w, h);

      // Create animated triangles with velocity away from click point
      const animTris: AnimatedTriangle[] = tris.map((tri) => {
        const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
        const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;
        const dx = cx - clickX;
        const dy = cy - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 1.5 + Math.random() * 4;
        return {
          ...tri,
          cx,
          cy,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed + (Math.random() - 0.5) * 2,
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          delay: (dist / Math.max(w, h)) * 600,
        };
      });

      const nextIndex = (current + 1) % imageSrcs.length;
      const nextImg = loadedImages.current[nextIndex];

      // Draw the current image on canvas to "shatter"
      // The next image will show behind via CSS
      let startTime: number | null = null;
      const duration = 3000;

      // object-fit: contain calculation for canvas drawing
      const imgRatio = currentImg.naturalWidth / currentImg.naturalHeight;
      const canvasRatio = w / h;
      let dx = 0, dy = 0, dw = w, dh = h;
      if (imgRatio > canvasRatio) {
        dh = w / imgRatio;
        dy = (h - dh) / 2;
      } else {
        dw = h * imgRatio;
        dx = (w - dw) / 2;
      }

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        ctx.clearRect(0, 0, w, h);

        let allDone = true;

        for (const tri of animTris) {
          const triElapsed = Math.max(0, elapsed - tri.delay);
          if (triElapsed <= 0) {
            // Draw stationary triangle
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tri.p1.x, tri.p1.y);
            ctx.lineTo(tri.p2.x, tri.p2.y);
            ctx.lineTo(tri.p3.x, tri.p3.y);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(currentImg, 0, 0, currentImg.naturalWidth, currentImg.naturalHeight, dx, dy, dw, dh);
            ctx.restore();
            allDone = false;
            continue;
          }

          const progress = Math.min(triElapsed / (duration * 0.7), 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic

          if (progress < 1) allDone = false;

          const offsetX = tri.vx * eased * 50;
          const offsetY = tri.vy * eased * 50 + eased * eased * 80; // gravity
          const rot = tri.rotationSpeed * eased * 20;
          const alpha = 1 - eased;

          if (alpha <= 0.01) continue;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(tri.cx + offsetX, tri.cy + offsetY);
          ctx.rotate(rot);
          ctx.translate(-(tri.cx), -(tri.cy));

          ctx.beginPath();
          ctx.moveTo(tri.p1.x, tri.p1.y);
          ctx.lineTo(tri.p2.x, tri.p2.y);
          ctx.lineTo(tri.p3.x, tri.p3.y);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(currentImg, 0, 0, currentImg.naturalWidth, currentImg.naturalHeight, dx, dy, dw, dh);
          ctx.restore();
        }

        if (!allDone && elapsed < duration + 500) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, w, h);
          setCurrent(nextIndex);
          setIsAnimating(false);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [current, isAnimating]
  );

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <section className="bg-background py-20 md:py-32">
      <div className="px-6 md:px-10 mb-12 md:mb-16 text-center">
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-[0.3em] text-foreground"
        >
          наши работы
        </motion.span>
      </div>

      <div className="px-4 md:px-10 max-w-[1170px] mx-auto">
        <div
          ref={containerRef}
          onClick={handleClick}
          className="relative w-full overflow-hidden rounded-2xl cursor-pointer select-none"
          style={{
            maxHeight: "560px",
            boxShadow:
              "0 26px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          {/* Next image underneath */}
          <img
            src={imageSrcs[(current + 1) % imageSrcs.length]}
            alt="Следующая работа"
            className="absolute inset-0 w-full h-full object-contain bg-background"
          />

          {/* Current image (visible when not animating) */}
          {!isAnimating && (
            <img
              src={imageSrcs[current]}
              alt={`Работа ${current + 1}`}
              className="absolute inset-0 w-full h-full object-contain bg-background z-[1]"
            />
          )}

          {/* Canvas for shatter animation */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-[2]"
            style={{ pointerEvents: "none" }}
          />

          {/* Click hint */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-10 text-xs uppercase tracking-[0.2em] text-foreground/40 font-medium pointer-events-none">
            нажмите для перехода
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 z-10 text-xs uppercase tracking-[0.2em] text-foreground/50 font-medium pointer-events-none">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(imageSrcs.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorksGallery;
