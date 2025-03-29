import Link from 'next/link';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { CustomerType } from '@/types';

interface CustomerListProps {
  customers: CustomerType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CustomerList({
  customers,
  currentPage,
  totalPages,
  onPageChange
}: CustomerListProps) {
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get first letter of name for avatar
  const getNameInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                        {getNameInitial(customer.name)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {customer.email}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {customer.phone || 'N/A'}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td>
                    <Link href={`/dashboard/customers/${customer._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No customers found
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
