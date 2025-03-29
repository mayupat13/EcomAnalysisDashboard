import Link from 'next/link';
import { useRouter } from 'next/router';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { OrderType } from '@/types';
import { formatCurrency } from '@/lib/auth';

// Import the formatDate function from auth.ts
import { formatDate as formatDateFromAuth } from '@/lib/auth';

interface OrderListProps {
  orders: OrderType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function OrderList({
  orders,
  currentPage,
  totalPages,
  onPageChange,
}: OrderListProps) {
  const router = useRouter();

  // Format date function with time - use a consistent method that works on both server and client
  const formatDateWithTime = (dateString: string) => {
    const date = new Date(dateString);
    // Use ISO string parts to ensure consistent formatting
    const datePart = date.toISOString().split('T')[0].split('-').reverse().join('/');
    const timePart = date.toISOString().split('T')[1].substring(0, 5);
    return `${datePart} ${timePart}`;
  };

  // Helper to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Handler for clicking on an order
  const handleOrderClick = (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();

    if (!orderId) {
      console.error('OrderList - Cannot navigate: Order ID is missing');
      return;
    }

    console.log(`OrderList - Navigating to order: ${orderId}`);
    console.log('OrderList - Using navigation pattern:', {
      pathname: '/dashboard/orders/[id]',
      query: { id: orderId },
      as: `/dashboard/orders/${orderId}`,
    });

    // Ensure a clean navigation by using the router directly
    router.push(
      {
        pathname: '/dashboard/orders/[id]',
        query: { id: orderId },
      },
      `/dashboard/orders/${orderId}`,
      { shallow: false },
    );
  };

  // Helper to render the order ID
  const renderOrderId = (order: OrderType) => {
    if (!order._id) {
      console.warn('OrderList - Order has no ID:', order);
      return '#' + order.orderNumber;
    }
    return '#' + order.orderNumber;
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="font-medium text-gray-900 dark:text-gray-100">
                    {renderOrderId(order)}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {(order.customer as any)?.name || 'N/A'}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {formatDateWithTime(order.createdAt)}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order._id ? (
                      <Link
                        href={`/dashboard/orders/${order._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        onClick={(e) => handleOrderClick(e, order._id)}
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-gray-400">Not available</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}
