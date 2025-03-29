import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ProductType } from '@/types';
import api from '@/lib/api';

interface ProductFormProps {
  initialData?: ProductType;
  categories: string[];
  onSubmit: (data: Partial<ProductType>) => Promise<void>;
  isLoading: boolean;
  buttonText: string;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
  buttonText,
}: ProductFormProps) {
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<Partial<ProductType>>({
    defaultValues: initialData || {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      sku: '',
      images: [],
    },
  });

  useEffect(() => {
    // If initialData has images, load them as preview URLs
    if (initialData?.images && initialData.images.length > 0) {
      setImagePreviewUrls(initialData.images);
    }
  }, [initialData]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomCategory(true);
      setValue('category', '');
    } else {
      setShowCustomCategory(false);
      setValue('category', value);
    }
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setValue('category', value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setUploadedImages((prev) => [...prev, ...newFiles]);

    // Generate temporary preview URLs for the new files
    const tempPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...tempPreviewUrls]);

    // Upload the files to the server
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.urls) {
        // Replace temporary URLs with actual server URLs
        // Keep existing URLs and append new ones
        setImagePreviewUrls((prev) => {
          const oldUrls = prev.slice(0, prev.length - newFiles.length);
          return [...oldUrls, ...response.data.urls];
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError('Failed to upload images. Please try again.');
      // Remove the temporary URLs
      setImagePreviewUrls((prev) => prev.slice(0, prev.length - newFiles.length));
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    // Remove the image preview URL
    const updatedPreviewUrls = imagePreviewUrls.filter((_, index) => index !== indexToRemove);
    setImagePreviewUrls(updatedPreviewUrls);
  };

  const handleFormSubmit = async (data: Partial<ProductType>) => {
    // If using custom category, ensure it's set
    if (showCustomCategory) {
      data.category = customCategory;
    }

    // Convert price and stock to numbers
    data.price = Number(data.price);
    data.stock = Number(data.stock);

    // Set the images from our uploaded and validated URLs
    data.images = imagePreviewUrls;

    // Call the onSubmit function provided by the parent
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Product Name*
          </label>
          <Input
            id="name"
            type="text"
            {...register('name', { required: 'Product name is required' })}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label
            htmlFor="sku"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            SKU
          </label>
          <Input id="sku" type="text" {...register('sku')} error={errors.sku?.message} />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Price (₹)*
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
              valueAsNumber: true,
            })}
            error={errors.price?.message}
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Stock*
          </label>
          <Input
            id="stock"
            type="number"
            min="0"
            {...register('stock', {
              required: 'Stock is required',
              min: { value: 0, message: 'Stock cannot be negative' },
              valueAsNumber: true,
            })}
            error={errors.stock?.message}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Category
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                id="category"
                value={field.value}
                onChange={(e) => {
                  field.onChange(e);
                  handleCategoryChange(e);
                }}
                error={errors.category?.message}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
                <option value="custom">Add New Category</option>
              </Select>
            )}
          />
          {showCustomCategory && (
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Enter new category"
                value={customCategory}
                onChange={handleCustomCategoryChange}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          rows={4}
          {...register('description')}
        />
      </div>

      <div>
        <label
          htmlFor="images"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Product Images
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none"
              >
                <span>Upload images</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
            {isUploading && (
              <div className="mt-2">
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Uploading images...</p>
              </div>
            )}
            {uploadError && (
              <div className="mt-2">
                <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image preview gallery */}
      {imagePreviewUrls.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Preview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                  <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-indigo-500 text-white text-xs px-1 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading || isUploading} disabled={isUploading}>
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
