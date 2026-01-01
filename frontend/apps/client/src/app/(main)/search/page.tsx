import { Suspense } from 'react';
import { SearchPage } from '@/features/products/presentation/pages/SearchPage';
import { Spinner } from '@/components/ui/Spinner';

export default function Search() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <SearchPage />
    </Suspense>
  );
}

