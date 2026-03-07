import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  refreshing: boolean;
  threshold?: number;
}

const PullToRefreshIndicator = ({ pullDistance, refreshing, threshold = 80 }: PullToRefreshIndicatorProps) => {
  if (pullDistance <= 0 && !refreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <motion.div
      className="flex items-center justify-center overflow-hidden"
      style={{ height: pullDistance }}
      animate={{ height: refreshing ? 40 : pullDistance }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full bg-card shadow-md border border-border/30"
        style={{
          opacity: Math.min(progress * 1.5, 1),
          transform: refreshing ? undefined : `rotate(${rotation}deg)`,
        }}
      >
        <Loader2
          size={18}
          className={`text-primary ${refreshing ? "animate-spin" : ""}`}
        />
      </div>
    </motion.div>
  );
};

export default PullToRefreshIndicator;
