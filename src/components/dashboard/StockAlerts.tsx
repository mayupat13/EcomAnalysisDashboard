import Link from 'next/link';
import Card from '@/components/ui/Card';
import { ProductType } from '@/types';

interface StockAlertsProps {
  products: ProductType[];
}

export default function StockAlerts({ products }: StockAlertsProps) {
  // Helper to get stock level class
  const getStockLevelClass = (stock: number) => {
    if (stock === 0) return 'text-red-600 dark:text-red-400';
    if (stock < 5) return 'text-orange-600 dark:text-orange-400';
    if (stock < 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <Card>
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Low Stock Alerts</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Products that need to be restocked
        </p>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.length > 0 ? (
            products.map((product) => (
              <li key={product._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex items-center">
                      <p className="font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {product.name}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate">
                        {product.sku ? `SKU: ${product.sku}` : 'No SKU'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <span className={`inline-flex text-sm font-medium ${getStockLevelClass(product.stock)}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href={`/dashboard/products/${product._id}`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    View Product →
                  </Link>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No low stock products
            </li>
          )}
        </ul>
      </div>
      {products.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-right sm:px-6">
          <Link href="/dashboard/products" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
            View all products →
          </Link>
        </div>
      )}
    </Card>
  );
}
