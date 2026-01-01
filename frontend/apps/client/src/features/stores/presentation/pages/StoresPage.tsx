'use client';

import { useState } from 'react';
import { Store, Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { StoreCard } from '@/features/stores/components';
import { useStores } from '@/features/stores/hooks/useStores';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const sortOptions = [
  { value: 'rating_desc', label: 'الأعلى تقييماً' },
  { value: 'rating_asc', label: 'الأقل تقييماً' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
];

export function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating_desc' | 'rating_asc' | 'newest' | 'oldest'>('rating_desc');

  const { data, isLoading, error } = useStores({
    search: searchQuery || undefined,
    sort: sortBy,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل المتاجر" variant="card" />
      </div>
    );
  }

  const stores = data?.stores || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Store className="w-8 h-8" />
          المتاجر
        </h1>
        <p className="text-white/60">
          {data?.total || 0} {data?.total === 1 ? 'متجر' : 'متاجر'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن متجر..."
            className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">ترتيب حسب:</span>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <div className="text-center py-16">
          <Store className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لا توجد متاجر</h3>
          <p className="text-white/60">لم يتم العثور على أي متاجر</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {stores.map((store) => (
              <StoreCard key={store._id} store={store} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

