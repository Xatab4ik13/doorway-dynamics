import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { proxyFileUrl } from "@/lib/fileUrl";

interface FileItem { url: string; type?: string }

interface FileViewerProps {
  url: string;
  type?: string;
  onClose: () => void;
  /** Список файлов для листания (необязательно) */
  items?: FileItem[];
}

const isImageFile = (url: string, type?: string) => type === "image" || /\.(jpg|jpeg|png|gif|webp|svg|heic)(\?|$)/i.test(url);

/**
 * Fullscreen in-app file viewer. Supports gallery navigation:
 * arrows, keyboard ←/→, swipe, click on the right/left half of an image.
 */
const FileViewer = ({ url: startUrl, type: startType, onClose, items }: FileViewerProps) => {
  const list: FileItem[] = items && items.length ? items : [{ url: startUrl, type: startType }];
  const startIdx = Math.max(0, list.findIndex((f) => proxyFileUrl(f.url) === proxyFileUrl(startUrl)));
  const [idx, setIdx] = useState(startIdx);
  const current = list[idx] || list[0];
  const url = proxyFileUrl(current.url);
  const isImage = isImageFile(url, current.type);
  const multi = list.length > 1;

  const next = useCallback(() => setIdx((i) => (i + 1) % list.length), [list.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + list.length) % list.length), [list.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && multi) next();
      else if (e.key === "ArrowLeft" && multi) prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [multi, next, prev, onClose]);

  const touchX = useRef<number | null>(null);

  return createPortal(
    <div className="fixed inset-0 z-[100] dashboard-theme flex flex-col bg-black/95" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 12px)" }}>
        <button onClick={onClose} className="flex items-center gap-1 text-white/80 hover:text-white text-sm">
          <X size={20} strokeWidth={2.5} /> Закрыть
        </button>
        {multi && <span className="text-white/70 text-sm tabular-nums">{idx + 1} / {list.length}</span>}
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/80 text-xs hover:bg-white/20"
        >
          <Download size={14} /> Скачать
        </a>
      </div>

      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null || !multi) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
          touchX.current = null;
        }}
      >
        {isImage ? (
          <img
            key={url}
            src={url}
            alt=""
            className={`max-w-full max-h-full object-contain rounded-lg select-none ${multi ? "cursor-pointer" : ""}`}
            style={{ touchAction: "pinch-zoom" }}
            onClick={(e) => {
              if (!multi) return;
              const r = (e.currentTarget as HTMLImageElement).getBoundingClientRect();
              (e.clientX - r.left < r.width / 3 ? prev : next)();
            }}
          />
        ) : (
          <iframe key={url} src={url} className="w-full h-full rounded-lg bg-white" title="File viewer" />
        )}

        {multi && (
          <>
            <button onClick={prev} aria-label="Предыдущий" className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center">
              <ChevronLeft size={26} />
            </button>
            <button onClick={next} aria-label="Следующий" className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center">
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default FileViewer;
