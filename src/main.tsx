import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Layout } from './modules/navigation/layout';
import { HomePage } from './modules/home/home-page';
import { ProductsPage } from './modules/products/products-page';
import NewProductPage from './modules/products/create-new-product-page';
import ProductDetailPage from './modules/products/product-detail-page';
import { ThemeProvider } from './modules/theme/theme-provider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/new', element: <NewProductPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
    ],
  },
]);

const root = document.getElementById('root')!;

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
