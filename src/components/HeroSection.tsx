import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import heroVideo1 from "@/assets/hero-video.mp4";
import heroVideo3 from "@/assets/hero-video-3.mp4";

const videos = [heroVideo1, heroVideo3];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  }, [currentIndex]);

  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      {/* Background videos with crossfade */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.video
            key={currentIndex}
            ref={videoRef}
            src={videos[currentIndex]}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Centered subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span
          className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-[0.25em] text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          установка & сервис
        </span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
