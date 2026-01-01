/**
 * Step 3: Images & Media
 * Product image upload and management with drag & drop
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ProductFormData } from '@/features/products/types';

interface Step3ImagesProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  imageFiles: File[];
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

interface ImagePreview {
  file?: File;
  preview: string;
  isExisting?: boolean; // Flag to identify existing images from server
}

export function Step3Images({ formData, setFormData, imageFiles, setImageFiles }: Step3ImagesProps) {
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images when component mounts (for edit mode)
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      const existingImages: ImagePreview[] = formData.images.map((url) => ({
        preview: url,
        isExisting: true,
      }));
      setImagePreviews(existingImages);
    }
  }, []); // Run only once on mount

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: ImagePreview[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: نوع الملف غير مدعوم. استخدم PNG, JPG, GIF, أو WEBP`);
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(`${file.name}: حجم الملف كبير جداً. الحد الأقصى 10MB`);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      validFiles.push({ file, preview });
    });

    if (validFiles.length > 0) {
      setImagePreviews((prev) => [...prev, ...validFiles]);

      // Update parent component with actual files
      setImageFiles((prev) => [...prev, ...validFiles.map((f) => f.file).filter((file): file is File => file !== undefined)]);

      // Update form data with preview URLs (for display only)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validFiles.map((f) => f.preview)],
      }));

      toast.success(`تم إضافة ${validFiles.length} صورة`);
    }
  };

  // Handle click to upload
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  // Handle remove image
  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagePreviews[index];

    // Revoke object URL only for new images (blob URLs), not existing images from server
    if (imageToRemove && !imageToRemove.isExisting && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    // Only remove from imageFiles if it's a new image (has a file object)
    if (imageToRemove && imageToRemove.file) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    toast.success('تم حذف الصورة');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        الصور والوسائط
      </h2>

      <div className="space-y-6">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Upload Area with Drag & Drop */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`w-full p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer group ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isDragging
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
              }`}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${
                  isDragging
                    ? 'text-blue-500'
                    : 'text-gray-400 group-hover:text-blue-500'
                }`}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {isDragging ? 'أفلت الصور هنا' : 'انقر أو اسحب الصور هنا'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF, WEBP حتى 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {imagePreviews.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              الصور المضافة ({imagePreviews.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((imagePreview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700"
                >
                  <img
                    src={imagePreview.preview}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-blue-500 text-white text-xs font-medium shadow-lg">
                      رئيسية
                    </div>
                  )}
                  {/* File info */}
                  {imagePreview.file && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">
                        {imagePreview.file.name}
                      </p>
                      <p className="text-xs text-gray-300">
                        {(imagePreview.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {imagePreview.isExisting && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">
                        صورة موجودة
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {imagePreviews.length === 0 && (
          <div className="text-center py-8">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              لم يتم إضافة صور بعد
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              اسحب الصور هنا أو انقر للاختيار
            </p>
          </div>
        )}

        {/* Info */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              💡 <strong>نصيحة:</strong> الصورة الأولى ستكون الصورة الرئيسية للمنتج
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400">
              • يمكنك إضافة عدة صور دفعة واحدة
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400">
              • الحد الأقصى لحجم الصورة: 10MB
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-400">
              • الصيغ المدعومة: PNG, JPG, GIF, WEBP
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

