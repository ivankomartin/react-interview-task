import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '../../../components/pagination';
import { pageRange } from '../utils';

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

export function PaginationBar({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="px-6 py-3">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, page - 1));
              }}
              className={
                page <= 1 ? 'pointer-events-none opacity-50' : undefined
              }
            />
          </PaginationItem>

          {pageRange(totalPages, page).map((n, idx) =>
            n === -1 ? (
              <PaginationItem key={`dots-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={n}>
                <PaginationLink
                  href="#"
                  isActive={n === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(n);
                  }}
                >
                  {n}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, page + 1));
              }}
              className={
                page >= totalPages
                  ? 'pointer-events-none opacity-50'
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
