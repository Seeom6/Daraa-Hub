/**
 * ImageUpload Component
 * Upload images with preview and drag & drop
 */

import { useState, useRef, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ImageUploadProps {
  value?: string[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  error?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5,
  accept = 'image/*',
  error,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`الملف ${file.name} أكبر من ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (previews.length + validFiles.length > maxFiles) {
      alert(`الحد الأقصى ${maxFiles} صور`);
      return;
    }

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    onChange(validFiles);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-primary-400',
          error && 'border-red-500'
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          اسحب الصور هنا أو انقر للتحميل
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          الحد الأقصى {maxFiles} صور، كل صورة حتى {maxSize}MB
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

