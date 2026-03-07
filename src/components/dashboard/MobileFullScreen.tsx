import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileFullScreenProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Right-side header action */
  headerRight?: ReactNode;
}

/**
 * iOS-style fullscreen sheet.
 * - Mobile: slides up from bottom, takes full screen with iOS nav bar
 * - Desktop: centered modal with backdrop
 */
const MobileFullScreen = ({ open, onClose, title, children, headerRight }: MobileFullScreenProps) => {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [backdropClosable, setBackdropClosable] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setBackdropClosable(false);
      return;
    }

    const timer = window.setTimeout(() => setBackdropClosable(true), 220);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] dashboard-theme" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-foreground/40"
            onClick={() => {
              if (backdropClosable) onClose();
            }}
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
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* iOS-style navigation bar */}
              <div className="relative flex items-center justify-between h-11 px-1 border-b border-border/30 shrink-0">
                <button
                  onClick={onClose}
                  className="flex items-center gap-0.5 px-3 py-2 text-primary text-[15px] active:opacity-60 transition-opacity"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                  <span>Назад</span>
                </button>

                {title && (
                  <h2 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold truncate max-w-[55%]">
                    {title}
                  </h2>
                )}

                <div className="px-3 min-w-[48px] flex justify-end">{headerRight}</div>
              </div>

              {/* Content */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
                style={{
                  paddingBottom: "env(safe-area-inset-bottom, 0px)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
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
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* Desktop header */}
              <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
                <h2 className="text-lg font-heading font-bold">{title}</h2>
                <div className="flex items-center gap-2">
                  {headerRight}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
                  >
                    <ChevronLeft size={20} className="rotate-180" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">{children}</div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MobileFullScreen;
