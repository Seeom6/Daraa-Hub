import { StorePage } from '@/features/stores/presentation/pages';

export default async function StoreDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StorePage slug={slug} />;
}

