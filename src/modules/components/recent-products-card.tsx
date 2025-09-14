import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/card';
import { Table, TableBody, TableCell, TableRow } from '../../components/table';
import { Separator } from '../../components/separator';
import { Skeleton } from '../../components/skeleton';
import { useRecentActiveProducts } from '../home/queries';
import type { Product } from '../../lib/api';
import { Link } from 'react-router';

function formatVolume(ml: number) {
  if (ml >= 1000) {
    const l = ml / 1000;
    return (Number.isInteger(l) ? l.toFixed(0) : l.toFixed(1)) + 'L';
  }
  return `${ml}ml`;
}
function formatDeposit(cents: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    cents / 100
  );
}
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

const DATE_COL_W = 'w-28';

function RowSkeleton() {
  return (
    <TableRow className="border-b-0">
      <TableCell className="w-full">
        <div className="space-y-1.5">
          <Skeleton className="h-4.5 w-60" />
          <Skeleton className="h-4 w-40" />
        </div>
      </TableCell>
      <TableCell className={`text-right ${DATE_COL_W}`}>
        <Skeleton className="h-4 w-full ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function RecentProductsCard() {
  const { data, isLoading, isError } = useRecentActiveProducts(5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Recent products
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="px-2">
        {isLoading ? (
          <Table>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </TableBody>
          </Table>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Failed to load recent products.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent active products.
          </p>
        ) : (
          <Table>
            <TableBody>
              {data.map((p: Product) => (
                <TableRow key={p.id} className="border-b-0">
                  <TableCell className="w-full">
                    <Link
                      to={`/products/${p.id}`}
                      state={{ product: p }}
                      className="underline-offset-4 hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="text-muted-foreground text-sm truncate">
                      {formatVolume(p.volume)} • {formatDeposit(p.deposit)}{' '}
                      deposit •{' '}
                      {p.packaging[0].toUpperCase() + p.packaging.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-muted-foreground text-sm text-right ${DATE_COL_W}`}
                  >
                    {formatDate(p.registeredAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
