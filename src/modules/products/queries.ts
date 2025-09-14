import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, type ProductsQuery } from '../../lib/api';
import type { ProductsResponse } from '../../lib/api';

export function useProducts(
  params: ProductsQuery,
  options?: { enabled?: boolean }
) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', 'list', params] as const,
    queryFn: ({ signal }) => fetchProducts(params, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    ...options,
  });
}
