import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface FileViewerProps {
  url: string;
  type?: string;
  onClose: () => void;
}

/**
 * Fullscreen in-app file viewer for images and documents.
 * On Android PWA, target="_blank" opens a browser tab that's hard to close.
 * This component shows files in an overlay instead.
 */
const FileViewer = ({ url, type, onClose }: FileViewerProps) => {
  const isImage = type === "image" || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] dashboard-theme flex flex-col bg-black/95" onClick={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-white/80 active:text-white text-sm"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
            Закрыть
          </button>
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs active:bg-white/20"
          >
            <Download size={14} /> Открыть
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
          {isImage ? (
            <img
              src={url}
              alt=""
              className="max-w-full max-h-full object-contain rounded-lg select-none"
              style={{ touchAction: "pinch-zoom" }}
            />
          ) : (
            <iframe
              src={url}
              className="w-full h-full rounded-lg bg-white"
              title="File viewer"
            />
          )}
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default FileViewer;
