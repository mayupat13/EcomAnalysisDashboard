import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { CustomerType, OrderType } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/auth';

interface CustomerDetailsProps {
  customer: CustomerType;
  orders: OrderType[];
}

export default function CustomerDetails({ customer, orders }: CustomerDetailsProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Get first letter of name for avatar
  const getNameInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer Information */}
      <div className="lg:col-span-1 space-y-6">
        {/* Customer Summary */}
        <Card>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Customer Information
            </h3>
          </div>
          <div className="px-4 py-5 sm:px-6 flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold mb-4">
              {getNameInitial(customer.name)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{customer.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{customer.email}</p>
            <p className="text-gray-500 dark:text-gray-400">
              {customer.phone || 'No phone provided'}
            </p>
            <div className="border-t border-gray-200 dark:border-gray-700 w-full mt-6 pt-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Orders
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {orders.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Spent
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(totalSpent)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Customer Since
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatDisplayDate(customer.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Address Information
            </h3>
          </div>
          <div className="px-4 py-5 sm:px-6">
            {customer.address ? (
              <address className="not-italic">
                <p className="text-gray-900 dark:text-gray-100">{customer.address.street}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {customer.address.city}, {customer.address.state} {customer.address.zipCode}
                </p>
                <p className="text-gray-500 dark:text-gray-400">{customer.address.country}</p>
              </address>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No address information available.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Orders */}
      <div className="lg:col-span-2">
        <Card>
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Recent Orders
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Order ID</th>
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
                        #{order.orderNumber}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400">
                        {formatDisplayDate(order.createdAt)}
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
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {orders.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-right">
              <Link
                href={`/dashboard/orders?customer=${customer._id}`}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                View all orders →
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
