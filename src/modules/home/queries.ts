import { useQuery } from '@tanstack/react-query';
import {
  fetchCompaniesCount,
  fetchProductsCount,
  fetchUsersCount,
  fetchRecentActiveProducts,
} from '../../lib/api';

import type { Product } from '../../lib/api';

export function useActiveProductsCount() {
  return useQuery({
    queryKey: ['count', 'products', 'active:true'],
    queryFn: () => fetchProductsCount({ active: true }),
    staleTime: 60_000,
  });
}

export function usePendingProductsCount() {
  return useQuery({
    queryKey: ['count', 'products', 'active:false'],
    queryFn: () => fetchProductsCount({ active: false }),
    staleTime: 60_000,
  });
}

export function useCompaniesCount() {
  return useQuery({
    queryKey: ['count', 'companies'],
    queryFn: () => fetchCompaniesCount(),
    staleTime: 60_000,
  });
}

export function useUsersCount() {
  return useQuery({
    queryKey: ['count', 'users'],
    queryFn: () => fetchUsersCount(),
    staleTime: 60_000,
  });
}

export function useRecentActiveProducts(limit = 5) {
  return useQuery<Product[]>({
    queryKey: ['products', 'recent', 'active:true', limit],
    queryFn: () => fetchRecentActiveProducts(limit),
    staleTime: 60_000,
  });
}
