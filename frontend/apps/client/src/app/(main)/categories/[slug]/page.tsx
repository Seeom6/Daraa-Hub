/**
 * Category Page
 * Displays a specific category with its products
 */

import { CategoryPage } from '@/features/categories/presentation/pages/CategoryPage';

export default async function Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryPage slug={slug} />;
}

