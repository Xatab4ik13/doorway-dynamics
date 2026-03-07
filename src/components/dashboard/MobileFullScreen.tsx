import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileFullScreenProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Right-side header action */
  headerRight?: React.ReactNode;
}

/**
 * iOS-style fullscreen sheet.
 * - Mobile: slides up from bottom, takes full screen with iOS nav bar
 * - Desktop: centered modal with backdrop
 */
const MobileFullScreen = ({ open, onClose, title, children, headerRight }: MobileFullScreenProps) => {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {isMobile ? (
            /* Mobile: fullscreen slide-up */
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-0 bg-card flex flex-col"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              {/* iOS-style navigation bar */}
              <div className="flex items-center justify-between h-11 px-1 border-b border-border/30 shrink-0">
                <button
                  onClick={onClose}
                  className="flex items-center gap-0.5 px-3 py-2 text-primary text-[15px] active:opacity-60 transition-opacity"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                  <span>Назад</span>
                </button>
                {title && (
                  <h2 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold truncate max-w-[50%]">
                    {title}
                  </h2>
                )}
                <div className="px-3">
                  {headerRight}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto overscroll-contain" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
                {children}
              </div>
            </motion.div>
          ) : (
            /* Desktop: centered modal */
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[90vh] bg-card shadow-2xl rounded-2xl overflow-auto flex flex-col"
            >
              {/* Desktop header */}
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                <h2 className="text-lg font-heading font-bold">{title}</h2>
                <div className="flex items-center gap-2">
                  {headerRight}
                  <button onClick={onClose} className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground">
                    <ChevronLeft size={20} className="rotate-180" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileFullScreen;