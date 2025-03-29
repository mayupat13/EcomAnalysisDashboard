import Link from 'next/link';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { ProductType } from '@/types';
import { formatCurrency } from '@/lib/auth';

interface ProductListProps {
  products: ProductType[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function ProductList({
  products,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: ProductListProps) {
  // Get stock status badge
  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          In Stock
        </span>
      );
    }
  };

  return (
    <Card>
      {isLoading ? (
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <Link href={`/dashboard/products/${product._id}`}>
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = 'https://via.placeholder.com/40?text=No+Image';
                                  }}
                                />
                              </Link>
                            ) : (
                              <Link href={`/dashboard/products/${product._id}`}>
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
                              </Link>
                            )}
                          </div>
                          <Link
                            href={`/dashboard/products/${product._id}`}
                            className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </td>
                      <td className="text-gray-500 dark:text-gray-400">{product.sku || 'N/A'}</td>
                      <td className="text-gray-500 dark:text-gray-400">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.price)}
                      </td>
                      <td>
                        <div className="flex items-center">
                          <span className="mr-2">{product.stock}</span>
                          {getStockBadge(product.stock)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/dashboard/products/${product._id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No products found
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
        </>
      )}
    </Card>
  );
}
