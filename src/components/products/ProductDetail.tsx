import { useState } from 'react';
import { ProductType } from '@/types';
import { formatCurrency } from '@/lib/auth';

interface ProductDetailProps {
  product: ProductType;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get the selected image URL or a placeholder if no images
  const mainImageUrl =
    product.images && product.images.length > 0
      ? product.images[selectedImageIndex]
      : 'https://via.placeholder.com/600x400?text=No+Image+Available';

  // Get stock status badge
  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          In Stock
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Left column - Image gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-w-3 aspect-h-2 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img
              src={mainImageUrl}
              alt={product.name}
              className="w-full h-full object-center object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
              }}
            />
          </div>

          {/* Thumbnail gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`
                    aspect-w-1 aspect-h-1 rounded-md overflow-hidden
                    ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-indigo-500'
                        : 'ring-1 ring-gray-200 dark:ring-gray-700'
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-center object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/150?text=Not+Found';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Product details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <p className="mt-1 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(product.price)}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                  Availability:
                </span>
                {getStockBadge(product.stock)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{product.stock}</span> in stock
              </div>
            </div>

            {product.sku && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">SKU:</span> {product.sku}
              </div>
            )}

            {product.category && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Category:</span> {product.category}
              </div>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Description</h3>
              <div className="mt-2 prose prose-sm text-gray-500 dark:text-gray-400">
                <p>{product.description}</p>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {new Date(product.updatedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
