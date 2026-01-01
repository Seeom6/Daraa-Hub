import { Suspense } from 'react';
import { ProductsPage } from '@/features/products/presentation/pages/ProductsPage';
import { Spinner } from '@/components/ui/Spinner';

export default function Products() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <ProductsPage />
    </Suspense>
  );
}

