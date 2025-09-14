import * as React from 'react';
import { useLocation, useParams, Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Milk, ArrowLeft, LoaderCircle } from 'lucide-react';

import { PageHeader } from '../../components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/card';
import { Badge } from '../../components/badge';
import { Skeleton } from '../../components/skeleton';
import { Button } from '../../components/button';

import type { Product, ProductsResponse } from '../../lib/api';
import { fetchProducts } from '../../lib/api';
import { formatDate, formatDeposit, formatVolume, titleCase } from './utils';
import { fetchCompaniesList } from '../../lib/api/companies';
import { useQuery } from '@tanstack/react-query';

export default function ProductDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const location = useLocation() as { state?: { product?: Product } };
  const stateProduct = location.state?.product;
  const qc = useQueryClient();

  const primed = qc.getQueryData<Product>(['product', id]);
  const [product, setProduct] = React.useState<Product | undefined>(
    stateProduct ?? primed
  );

  React.useEffect(() => {
    if (product || !Number.isFinite(id)) return;
    const all = qc.getQueriesData<ProductsResponse>({
      queryKey: ['products', 'list'],
    });
    for (const [, data] of all) {
      const found = data?.data?.find((p) => p.id === id);
      if (found) {
        setProduct(found);
        qc.setQueryData(['product', id], found);
        break;
      }
    }
  }, [id, product, qc]);

  const [scanning, setScanning] = React.useState(false);
  const [scanTried, setScanTried] = React.useState(false);

  React.useEffect(() => {
    if (product || scanTried || !Number.isFinite(id)) return;

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      setScanning(true);
      const PAGES = 6;
      const LIMIT = 50;
      const statuses: Array<boolean | undefined> = [undefined, false, true];
      try {
        for (const active of statuses) {
          for (let page = 1; page <= PAGES; page++) {
            if (cancelled || product) return;
            const res = await fetchProducts(
              {
                page,
                limit: LIMIT,
                sort: 'registeredAt',
                order: 'desc',
                active,
              } as any,
              { signal: controller.signal }
            );
            const found = res.data.find((p) => p.id === id);
            if (found) {
              if (cancelled) return;
              setProduct(found);
              qc.setQueryData(['product', id], found);
              return;
            }
            if (!res.pagination.hasNextPage) break;
          }
        }
      } finally {
        if (!cancelled) {
          setScanning(false);
          setScanTried(true);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, product, scanTried, qc]);

  const companiesQuery = useQuery({
    queryKey: ['companies', 'list'],
    queryFn: fetchCompaniesList,
    staleTime: 60_000,
  });
  const companyName = React.useMemo(() => {
    if (!product) return '';
    const c = companiesQuery.data?.find((x) => x.id === product.companyId);
    return c?.name || `Company #${product.companyId}`;
  }, [companiesQuery.data, product]);

  return (
    <div className="pb-8">
      <PageHeader
        title="Product detail"
        description="View product information"
        icon={<Milk size={28} />}
      />

      {!product && (scanning || !scanTried) ? (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LoaderCircle className="animate-spin" /> Looking up product…
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 px-6 pb-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-56" />
          </CardContent>
        </Card>
      ) : !product ? (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Product not found</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm text-muted-foreground">
              Backend nemá endpoint pre získanie produktu podľa ID, a produkt sa
              nepodarilo nájsť v lokálnych dátach. Skús sa prekliknúť z tabuľky
              alebo z poslednej hlášky po vytvorení.
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/products">
                  <ArrowLeft className="mr-2" />
                  Back to products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader className="px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {product.name}
              </CardTitle>
              {product.active ? (
                <Badge variant="secondary">Active</Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 px-6 pb-6">
            <div className="text-sm">
              <span className="text-muted-foreground">ID:</span> #{product.id}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Company:</span>{' '}
              {companyName}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Packaging:</span>{' '}
              {titleCase(product.packaging)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Deposit:</span>{' '}
              {formatDeposit(product.deposit)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Volume:</span>{' '}
              {formatVolume(product.volume)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Registered at:</span>{' '}
              {formatDate(product.registeredAt)}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Registered by:</span> User
              #{product.registeredById}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link to="/products">
                  <ArrowLeft className="mr-2" />
                  Back to products
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
