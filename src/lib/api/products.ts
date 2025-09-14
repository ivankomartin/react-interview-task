import { get, post } from './client';
import type {
  ProductsQuery,
  ProductsResponse,
  Product,
  CreateProductBody,
} from './types';

export async function fetchProducts(
  params: ProductsQuery,
  opts?: { signal?: AbortSignal }
) {
  return await get<ProductsResponse>(
    '/api/products',
    params as Record<string, any>,
    opts?.signal
  );
}

export async function fetchProductsCount(opts: { active?: boolean } = {}) {
  const json = await get<ProductsResponse>('/api/products', {
    active: opts.active,
  });
  return json.pagination.totalItems;
}

export async function fetchRecentActiveProducts(limit = 5) {
  const json = await get<ProductsResponse>('/api/products', {
    active: true,
    sort: 'registeredAt',
    order: 'desc',
    page: 1,
    limit,
  });
  return json.data;
}

export type CreateProductResponse = {
  success: boolean;
  data: Product & { active: boolean };
  message?: string;
};

export async function createProduct(body: CreateProductBody) {
  return post<CreateProductResponse>('/api/products', body);
}
