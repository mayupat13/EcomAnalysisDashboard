import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { OrderType } from '@/types';
import { formatCurrency, formatDate } from '@/lib/auth';

interface OrderDetailsProps {
  order: OrderType;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
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

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Order Summary
          </h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Order Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  #{order.orderNumber}
                </dd>
              </dl>
            </div>

            <div>
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date Placed
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(order.createdAt)}
                </dd>
              </dl>
            </div>

            <div>
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </dd>
              </dl>
            </div>

            <div>
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Payment Method
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {order.paymentMethod || 'Not specified'}
                </dd>
              </dl>
            </div>

            <div>
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Amount
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(order.totalAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Information */}
      <Card>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Customer Information
          </h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Contact Details
              </h4>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">{(order.customer as any)?.name}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(order.customer as any)?.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(order.customer as any)?.phone || 'No phone provided'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Shipping Address
              </h4>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {order.shippingAddress?.street ||
                  (order.customer as any)?.address?.street ||
                  'No address provided'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.shippingAddress?.city || (order.customer as any)?.address?.city}
                {order.shippingAddress?.city ? ',' : ''}{' '}
                {order.shippingAddress?.state || (order.customer as any)?.address?.state}{' '}
                {order.shippingAddress?.zipCode || (order.customer as any)?.address?.zipCode}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {order.shippingAddress?.country || (order.customer as any)?.address?.country}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Items */}
      <Card>
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Order Items
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                        {(item.product as any)?.images &&
                        (item.product as any).images.length > 0 ? (
                          <img
                            src={(item.product as any).images[0]}
                            alt={(item.product as any).name}
                            className="h-10 w-10 rounded-md object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/40?text=No+Image';
                            }}
                          />
                        ) : (
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {(item.product as any)?.name || 'Unknown Product'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(item.product as any)?.sku || 'No SKU'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">{formatCurrency(item.price)}</td>
                  <td className="text-gray-500 dark:text-gray-400">{item.quantity}</td>
                  <td className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="border-t border-gray-200 dark:border-gray-700"></td>
                <td className="border-t border-gray-200 dark:border-gray-700 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Subtotal
                </td>
                <td className="border-t border-gray-200 dark:border-gray-700 py-2 text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(order.subtotal)}
                </td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Shipping
                </td>
                <td className="py-2 text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(order.shipping)}
                </td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="py-2 text-sm font-medium text-gray-900 dark:text-gray-100">Tax</td>
                <td className="py-2 text-sm text-gray-900 dark:text-gray-100">
                  {formatCurrency(order.tax)}
                </td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="py-2 text-base font-bold text-gray-900 dark:text-gray-100">Total</td>
                <td className="py-2 text-base font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card>
    </div>
  );
}
