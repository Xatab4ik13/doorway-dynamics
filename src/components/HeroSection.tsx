import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-video.mp4";
import heroImage from "@/assets/hero-video-poster.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0">
        <video
          src={heroVideo}
          poster={heroImage}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Subtitle top-center */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-28 left-0 right-0 text-center"
      >
        <span className="section-label">установка & сервис</span>
      </motion.div>

      {/* Main heading */}
      <div className="relative w-full px-6 md:px-10 pb-16 md:pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="heading-xl max-w-4xl"
        >
          Повышаем качество жизни, исключая посредственность
        </motion.h1>
      </div>
    </section>
  );
};

export default HeroSection;
