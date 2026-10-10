// src/components/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Páginas visibles: la actual, 2 a cada lado, la primera y la última
  const getVisiblePages = () => {
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const pages: (number | '...')[] = [];

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages); }

    return pages;
  };

  const btnBase = 'w-9 h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center';

  return (
    <nav className="flex items-center justify-between mt-6" aria-label="Paginación">
      <p className="text-sm text-slate-500">
        Página {currentPage} de {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Página anterior"
        >
          ←
        </button>

        {getVisiblePages().map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className={`${btnBase} text-slate-400`}>
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={`${btnBase} ${
                page === currentPage
                  ? 'bg-brand-800 text-white border border-brand-800'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`${btnBase} border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
          aria-label="Página siguiente"
        >
          →
        </button>
      </div>
    </nav>
  );
}

export default Pagination;