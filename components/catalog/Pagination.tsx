import { ChevronLeftIcon, ChevronRightIcon } from '@/components/layout/icons';

// Compact page list: always first/last, the current page and its
// immediate neighbours, and "…" for any gap — so a large catalog doesn't
// turn into 40 buttons.
function pageList(current: number, total: number): (number | '…')[] {
  const pages: (number | '…')[] = [];
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }
  return pages;
}

export default function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="pagination-arrow" aria-label="Previous page" disabled={current <= 1} onClick={() => onChange(current - 1)}>
        <ChevronLeftIcon />
      </button>
      <div className="pagination-numbers">
        {pageList(current, total).map((p, i) =>
          p === '…' ? (
            <span key={'gap' + i} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button key={p} className={'pagination-btn' + (p === current ? ' active' : '')} onClick={() => onChange(p)}>
              {p}
            </button>
          )
        )}
      </div>
      <button className="pagination-arrow" aria-label="Next page" disabled={current >= total} onClick={() => onChange(current + 1)}>
        <ChevronRightIcon />
      </button>
    </nav>
  );
}
