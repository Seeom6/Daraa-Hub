import { OrderSuccessPage } from '@/features/orders/presentation/pages';

export default async function OrderSuccess({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderSuccessPage orderId={id} />;
}

