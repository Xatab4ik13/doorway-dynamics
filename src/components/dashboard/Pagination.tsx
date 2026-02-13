import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, total, limit, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  // Generate page numbers to show
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btnBase = "flex items-center justify-center rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      <p className="text-xs text-muted-foreground">
        {from}–{to} из {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={`${btnBase} w-8 h-8 hover:bg-accent`}
          title="Первая страница"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} w-8 h-8 hover:bg-accent`}
          title="Предыдущая"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btnBase} w-8 h-8 ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent text-muted-foreground"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} w-8 h-8 hover:bg-accent`}
          title="Следующая"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={`${btnBase} w-8 h-8 hover:bg-accent`}
          title="Последняя страница"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
