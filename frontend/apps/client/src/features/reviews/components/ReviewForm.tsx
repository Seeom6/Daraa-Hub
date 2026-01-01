'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { StarRating } from './StarRating';
import { Spinner } from '@/components/ui/Spinner';

export interface ReviewFormProps {
  productId?: string;
  storeId?: string;
  initialRating?: number;
  initialComment?: string;
  onSubmit: (data: { rating: number; comment: string; images: File[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ReviewForm({
  initialRating = 0,
  initialComment = '',
  onSubmit,
  onCancel,
  isLoading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('يمكنك رفع 5 صور كحد أقصى');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('الرجاء اختيار التقييم');
      return;
    }
    if (!comment.trim()) {
      alert('الرجاء كتابة تعليق');
      return;
    }
    onSubmit({ rating, comment, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-white font-medium mb-2">التقييم *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-white font-medium mb-2">التعليق *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شارك تجربتك مع المنتج..."
          rows={5}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors resize-none"
          required
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-white font-medium mb-2">
          الصور (اختياري - حتى 5 صور)
        </label>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 left-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>رفع صور</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <Spinner size="sm" /> : 'إرسال التقييم'}
        </motion.button>
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
        >
          إلغاء
        </motion.button>
      </div>
    </form>
  );
}

