import React, { useState } from 'react';
import { addReview } from '../../services/reviewService';
import Button from './Button';

const StarRating = ({ value, onChange, label }) => (
  <div className="flex flex-col gap-2 text-right">
    <span className="text-xs font-bold text-stone-500">{label}</span>
    <div className="flex gap-1.5 flex-row-reverse justify-end">
      {[5, 4, 3, 2, 1].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-all hover:scale-125 focus:outline-none ${
            star <= value ? 'text-amber-400' : 'text-stone-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  </div>
);

const ReviewForm = ({ product, order, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const reviewData = {
      productId: product.productId || product.id,
      orderId: order.id,
      customerPhone: order.customerPhone,
      customerName: order.customerName,
      rating,
      serviceRating,
      deliveryRating,
      comment,
    };

    try {
      await addReview(reviewData);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-stone-50 border border-stone-100 rounded-3xl p-6 text-right mt-4 flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-stone-200/50 pb-4">
        <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-sm flex-shrink-0">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=100'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-extrabold text-stone-850 text-sm">تقييم منتج: {product.name}</h4>
          <p className="text-stone-400 text-xs mt-0.5">شاركنا رأيك وتجربتك لمساعدة الآخرين.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StarRating value={rating} onChange={setRating} label="تقييم المنتج *" />
        <StarRating value={serviceRating} onChange={setServiceRating} label="تقييم الخدمة *" />
        <StarRating value={deliveryRating} onChange={setDeliveryRating} label="تقييم التوصيل *" />
      </div>

      <div>
        <label className="block text-stone-600 font-bold text-xs mb-2">رأيك بالتفصيل (اختياري)</label>
        <textarea
          rows="3"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="اكتب تجربتك مع المنتج، جودته، وكيف كانت الفوائد..."
          className="w-full px-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium resize-none leading-relaxed text-sm animate-fade-in"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-stone-200/50">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          className="py-2.5 px-6 rounded-2xl font-black text-xs"
        >
          إرسال التقييم
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 rounded-2xl border border-stone-200 hover:bg-white text-stone-500 hover:text-stone-700 font-bold text-xs transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
