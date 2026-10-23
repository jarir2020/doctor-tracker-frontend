/** Doctor Tracker: Shows the current record range and controls page changes. */
"use client";

import { Icon } from "./Icon";
import type { PaginationData } from "@/lib/types";

/** Hide when the data fits on one page; otherwise provide range and navigation. */
export function Pagination({ value, onChange }: { value: PaginationData | null; onChange: (page: number) => void }) {
  if (!value || value.total <= value.limit) return null;
  const pages = Math.max(value.totalPages, 1);
  const start = (value.page - 1) * value.limit + 1;
  const end = Math.min(value.page * value.limit, value.total);

  return (
    <div className="pagination-row">
      <span>Showing <strong>{start}-{end}</strong> of <strong>{value.total}</strong></span>
      <div className="pagination-controls">
        <button className="page-arrow" type="button" aria-label="Previous page" disabled={value.page <= 1} onClick={() => onChange(value.page - 1)}>
          <Icon name="chevron-left" size={17} />
        </button>
        <span>Page <strong>{value.page}</strong> of {pages}</span>
        <button className="page-arrow" type="button" aria-label="Next page" disabled={value.page >= pages} onClick={() => onChange(value.page + 1)}>
          <Icon name="chevron-right" size={17} />
        </button>
      </div>
    </div>
  );
}
