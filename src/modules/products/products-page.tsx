import * as React from 'react';
import { Milk } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { PageHeader } from '../../components/page-header';
import { Card, CardContent } from '../../components/card';
import { useProducts } from './queries';
import { ProductsToolbar } from './components/products-toolbar';
import { ProductsTable } from './components/products-table';
import { PaginationBar } from './components/pagination-bar';

import { fetchProducts } from '../../lib/api';
import type { Product } from '../../lib/api/types';

export function ProductsPage() {
  const [sp, setSp] = useSearchParams();

  const spStatus = sp.get('status');
  const initialStatus: 'all' | 'active' | 'inactive' =
    spStatus === 'active' || spStatus === 'inactive' ? spStatus : 'all';

  const initialPage = Math.max(1, Number(sp.get('page')) || 1);
  const initialLimitRaw = Number(sp.get('limit')) || 25;
  const initialLimit = [10, 25, 50, 100].includes(initialLimitRaw)
    ? initialLimitRaw
    : 25;

  const spSort = sp.get('sort') === 'name' ? 'name' : 'registeredAt';
  const spOrder = sp.get('order') === 'asc' ? 'asc' : 'desc';

  const initialQ = sp.get('q') ?? '';
  const initialCompanyId = sp.get('companyId') ?? '';

  const [page, setPage] = React.useState(initialPage);
  const [limit, setLimit] = React.useState(initialLimit);
  const [status, setStatus] = React.useState<'all' | 'active' | 'inactive'>(
    initialStatus
  );
  const [sort, setSort] = React.useState<'registeredAt' | 'name'>(spSort);
  const [order, setOrder] = React.useState<'asc' | 'desc'>(spOrder);
  const [q, setQ] = React.useState<string>(initialQ);
  const [companyId, setCompanyId] = React.useState<string>(initialCompanyId);

  React.useEffect(() => {
    const next = new URLSearchParams(sp);
    next.set('status', status);
    next.set('page', String(page));
    next.set('limit', String(limit));
    next.set('sort', sort);
    next.set('order', order);
    if (q) next.set('q', q);
    else next.delete('q');
    if (companyId) next.set('companyId', companyId);
    else next.delete('companyId');
    setSp(next, { replace: true });
  }, [status, page, limit, sort, order, q, companyId]);

  React.useEffect(() => {
    setPage(1);
  }, [status, limit, q, companyId]);

  function useDebounced<T>(value: T, delay = 350) {
    const [v, setV] = React.useState(value);
    React.useEffect(() => {
      const t = setTimeout(() => setV(value), delay);
      return () => clearTimeout(t);
    }, [value, delay]);
    return v;
  }

  const qDebounced = useDebounced(q, 350);
  const companyIdDebounced = useDebounced(companyId, 350);

  const activeParam = status === 'all' ? undefined : status === 'active';
  const usingSearch = Boolean(q || companyId);

  const { data, isLoading, isError } = useProducts(
    {
      page,
      limit,
      active: activeParam,
      sort,
      order,
    } as any,
    { enabled: !usingSearch }
  );

  const [searchRows, setSearchRows] = React.useState<Product[] | null>(null);
  const [searchTotal, setSearchTotal] = React.useState<number | null>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const PAGE_SIZE = 300;
  const MAX_PAGES = 4;

  React.useEffect(() => {
    if (!usingSearch) return;
    setSearchRows(null);
    setSearchTotal(null);
    setSearchError(null);
    setSearchLoading(true);
  }, [q, companyId, usingSearch]);

  React.useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function aggregateWhenFiltering() {
      if (!qDebounced && !companyIdDebounced) {
        setSearchRows(null);
        setSearchTotal(null);
        setSearchLoading(false);
        setSearchError(null);
        return;
      }

      try {
        const acc: Product[] = [];

        for (let p = 1; p <= MAX_PAGES; p++) {
          const res = await fetchProducts(
            {
              page: p,
              limit: PAGE_SIZE,
              active: activeParam,
              sort,
              order,
            } as any,
            { signal: controller.signal }
          );

          const chunk = res.data.filter((item) => {
            const nameOk = qDebounced
              ? item.name.toLowerCase().includes(qDebounced.toLowerCase())
              : true;
            const companyOk = companyIdDebounced
              ? String(item.companyId) === String(companyIdDebounced)
              : true;
            return nameOk && companyOk;
          });

          acc.push(...chunk);

          if (acc.length >= page * limit) break;
          if (!res.pagination.hasNextPage) break;
        }

        if (cancelled) return;

        const start = (page - 1) * limit;
        setSearchRows(acc.slice(start, start + limit));
      } catch (e: any) {
        if (!cancelled && e?.name !== 'AbortError') {
          setSearchError(e?.message ?? 'Search failed');
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }

    if (usingSearch) {
      aggregateWhenFiltering();
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    qDebounced,
    companyIdDebounced,
    activeParam,
    sort,
    order,
    page,
    limit,
    usingSearch,
  ]);

  const serverTotalItems = data?.pagination.totalItems ?? 0;
  const serverRows = data?.data ?? [];

  const isDebouncing =
    usingSearch && (q !== qDebounced || companyId !== companyIdDebounced);

  const rowsForTable = usingSearch ? (searchRows ?? []) : serverRows;
  const totalItems = usingSearch ? (searchTotal ?? 0) : serverTotalItems;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const isLoadingEffective =
    isLoading ||
    (usingSearch && (searchLoading || searchRows === null || isDebouncing));

  const isErrorEffective = isError || Boolean(usingSearch && searchError);

  function toggleSort(field: 'name' | 'registeredAt') {
    if (sort === field) setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(field);
      setOrder(field === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  return (
    <div className="pb-8">
      <PageHeader
        title="Registered products"
        description="View and manage your registered products."
        icon={<Milk size={28} />}
      />

      <Card>
        <ProductsToolbar
          status={status}
          onStatusChange={setStatus}
          limit={limit}
          onLimitChange={setLimit}
          totalItems={totalItems}
          isLoading={isLoadingEffective}
          isError={isErrorEffective}
          nameQuery={q}
          onNameQueryChange={setQ}
          companyId={companyId}
          onCompanyIdChange={setCompanyId}
        />

        <CardContent className="px-0">
          <ProductsTable
            rows={rowsForTable}
            isLoading={isLoadingEffective}
            isError={isErrorEffective}
            pageSize={limit}
            sort={sort}
            onToggleSort={toggleSort}
          />

          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
