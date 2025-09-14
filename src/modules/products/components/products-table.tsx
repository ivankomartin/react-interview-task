import { ArrowRight, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '../../../components/table';
import { Button } from '../../../components/button';
import { Badge } from '../../../components/badge';
import { Skeleton } from '../../../components/skeleton';
import type { Product } from '../../../lib/api';
import { formatDate, formatDeposit, formatVolume, titleCase } from '../utils';
import { Link } from 'react-router';

type Props = {
  rows: Product[];
  isLoading?: boolean;
  isError?: boolean;
  pageSize: number;
  sort: 'name' | 'registeredAt';
  onToggleSort: (field: 'name' | 'registeredAt') => void;
};

export function ProductsTable({
  rows,
  isLoading,
  isError,
  pageSize,
  onToggleSort,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-6 w-[42%]">
            <Button
              variant="secondary"
              className="px-0 gap-1"
              onClick={() => onToggleSort('name')}
            >
              Name
              <ArrowUpDown className="size-4 opacity-60" />
            </Button>
          </TableHead>
          <TableHead>Packaging</TableHead>
          <TableHead>Deposit</TableHead>
          <TableHead>Volume</TableHead>
          <TableHead>
            <Button
              variant="secondary"
              className="px-0 gap-1"
              onClick={() => onToggleSort('registeredAt')}
            >
              Registered at
              <ArrowUpDown className="size-4 opacity-60" />
            </Button>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right pr-6 w-[1%]">
            <span>Detail</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          Array.from({ length: pageSize }).map((_, i) => (
            <TableRow key={`sk-${i}`}>
              <TableCell className="px-6">
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell className="text-right pr-6">
                <Skeleton className="h-9 w-9 rounded-md inline-block" />
              </TableCell>
            </TableRow>
          ))
        ) : isError ? (
          <TableRow>
            <TableCell className="px-6" colSpan={6}>
              <p className="text-sm text-destructive">
                Failed to load products.
              </p>
            </TableCell>
          </TableRow>
        ) : rows.length === 0 ? (
          <TableRow>
            <TableCell className="px-6" colSpan={6}>
              <p className="text-sm text-muted-foreground">
                No products found.
              </p>
            </TableCell>
          </TableRow>
        ) : (
          rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="px-6">
                <div>{p.name}</div>
                <div className="text-muted-foreground text-sm">
                  ID #{p.id} • Company #{p.companyId}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {titleCase(p.packaging)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDeposit(p.deposit)}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatVolume(p.volume)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(p.registeredAt)}
              </TableCell>
              <TableCell>
                {p.active ? (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-700 inset-ring inset-ring-pink-700/10"
                  >
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={`Open ${p.name} detail`}
                >
                  <Link to={`/products/${p.id}`} state={{ product: p }}>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
