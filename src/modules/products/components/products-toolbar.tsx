import { CardHeader, CardTitle } from '../../../components/card';
import { Badge } from '../../../components/badge';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../../../components/select';
import { Skeleton } from '../../../components/skeleton';
import { Input } from '../../../components/input';
import { useQuery } from '@tanstack/react-query';
import { fetchCompaniesList } from '../../../lib/api/companies';
import { formatNumber } from '../utils';

export type ToolbarProps = {
  status: 'all' | 'active' | 'inactive';
  onStatusChange: (next: 'all' | 'active' | 'inactive') => void;
  limit: number;
  onLimitChange: (n: number) => void;
  totalItems?: number;
  isLoading?: boolean;
  isError?: boolean;
  nameQuery?: string;
  onNameQueryChange: (q: string) => void;
  companyId?: string;
  onCompanyIdChange: (id: string) => void;
};

export function ProductsToolbar({
  status,
  onStatusChange,
  limit,
  onLimitChange,
  totalItems = 0,
  isLoading,
  isError,
  nameQuery = '',
  onNameQueryChange,
  companyId = '',
  onCompanyIdChange,
}: ToolbarProps) {
  const companiesQuery = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: fetchCompaniesList,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <CardHeader className="px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Products</CardTitle>
          {isLoading ? (
            <Skeleton className="h-5 w-16 rounded-md" />
          ) : isError ? (
            <Badge variant="outline">—</Badge>
          ) : (
            <Badge variant="outline">{formatNumber(totalItems)} total</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search by name */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search:</span>
            <Input
              className="h-8 w-48"
              placeholder="Name..."
              value={nameQuery}
              onChange={(e) => onNameQueryChange(e.target.value)}
            />
          </div>

          {/* Filter by company */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Company:</span>
            <Select
              value={companyId || 'all'}
              onValueChange={(v) => onCompanyIdChange(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="min-w-[10rem]">
                <SelectValue
                  placeholder={
                    companiesQuery.isLoading ? 'Loading...' : 'All companies'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {companiesQuery.data?.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status as compact Select */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={status}
              onValueChange={(v) => onStatusChange(v as any)}
            >
              <SelectTrigger className="min-w-[7.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => onLimitChange(Number(v))}
            >
              <SelectTrigger className="min-w-[5.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
