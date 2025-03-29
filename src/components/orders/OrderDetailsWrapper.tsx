import { useRouter } from 'next/router';
import { useEffect } from 'react';
import OrderDetails from './OrderDetails';
import { OrderType } from '@/types';

interface OrderDetailsWrapperProps {
  order: OrderType;
}

export default function OrderDetailsWrapper({ order }: OrderDetailsWrapperProps) {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Log order ID information for debugging
    console.log('OrderDetailsWrapper - Router query ID:', id);
    console.log('OrderDetailsWrapper - Order ID from props:', order?._id);
    console.log('OrderDetailsWrapper - Full router query:', router.query);
    console.log('OrderDetailsWrapper - Full router path:', router.asPath);

    // Check if IDs match
    if (id && order && id !== order._id) {
      console.warn('OrderDetailsWrapper - ID mismatch between router query and order prop');
      console.warn('OrderDetailsWrapper - Types:', {
        idType: typeof id,
        orderIdType: typeof order._id,
      });
      console.warn('OrderDetailsWrapper - Values:', {
        id: id,
        orderId: order._id,
      });
    }
  }, [id, order, router.query, router.asPath]);

  if (!order) {
    console.log('OrderDetailsWrapper - No order data provided');
    return <div>No order data available</div>;
  }

  return <OrderDetails order={order} />;
}
