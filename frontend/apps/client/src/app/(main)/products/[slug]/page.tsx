import { ProductDetailPage } from '@/features/products/presentation/pages/ProductDetailPage';

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailPage slug={slug} />;
}

