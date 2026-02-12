import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
const CACHE_BUST = "v8";
const videos = [
  `/videos/hero-video-new-1.mp4?${CACHE_BUST}`,
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.load();
      video.play().catch(() => {
        // Fallback: try again on user interaction
        const tryPlay = () => {
          video.play().catch(() => {});
          document.removeEventListener("touchstart", tryPlay);
          document.removeEventListener("click", tryPlay);
        };
        document.addEventListener("touchstart", tryPlay, { once: true });
        document.addEventListener("click", tryPlay, { once: true });
      });
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
            preload="metadata"
            webkit-playsinline=""
            x-webkit-airplay="deny"
            disablePictureInPicture
            onEnded={handleVideoEnd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
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
        <span className="text-lg md:text-2xl lg:text-3xl font-medium uppercase tracking-[0.3em] text-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          установка & сервис
        </span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
