import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subscribeToOrder } from '../services/trackingService';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import ReviewForm from '../components/ui/ReviewForm';
import { useCurrency } from '../context/CurrencyContext';

const ORDER_STEPS = [
  { key: 'pending', label: 'تم الاستلام', icon: '📋' },
  { key: 'processing', label: 'جاري التجهيز', icon: '📦' },
  { key: 'shipped', label: 'في الطريق', icon: '🚚' },
  { key: 'delivered', label: 'تم التوصيل', icon: '✅' },
];

const statusColors = {
  pending: 'text-amber-500 bg-amber-50 border-amber-100',
  processing: 'text-blue-500 bg-blue-50 border-blue-100',
  shipped: 'text-indigo-500 bg-indigo-50 border-indigo-100',
  delivered: 'text-emerald-500 bg-emerald-50 border-emerald-100',
  cancelled: 'text-rose-500 bg-rose-50 border-rose-100',
};

const statusLabels = {
  pending: 'قيد المراجعة',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const paymentMethodLabels = {
  cod: 'الدفع عند الاستلام',
  cash: 'الدفع عند الاستلام',
  whatsapp: 'تأكيد عبر واتساب',
};

const paymentDescriptions = {
  pending: 'سيتم تحصيل القيمة عند استلام الشحنة',
  paid: 'تم الدفع',
};

const OrderTracking = () => {
  const { currencySymbol } = useCurrency();
  const [searchParams] = useSearchParams();

  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeReview, setActiveReview] = useState(null);
  const [submittedReviews, setSubmittedReviews] = useState([]);

  const unsubscribeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedId = orderId.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedId || !trimmedPhone) {
      setError('يرجى إدخال كل من رقم الطلب ورقم الهاتف.');
      return;
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setLoading(true);
    setError('');
    setOrder(null);
    setActiveReview(null);

    const unsub = subscribeToOrder(
      trimmedId,
      trimmedPhone,
      (orderData) => {
        setOrder(orderData);
        setLoading(false);
        setError('');
      },
      (errMsg) => {
        setOrder(null);
        setLoading(false);
        setError(errMsg);
      }
    );

    unsubscribeRef.current = unsub;
  };

  const currentStep = order ? ORDER_STEPS.findIndex((s) => s.key === order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === 'cancelled';

  return (
    <div className="font-cairo max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-right">

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-stone-850 mb-3">تتبع حالة طلبك</h1>
        <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
          أدخل رقم الطلب ورقم الهاتف الذي سجلت به الطلب لمتابعة حالة شحنتك لحظة بلحظة.
        </p>
      </div>

      {/* Search Form — Two Inputs */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">

          <div className="relative flex-1">
            <label className="block text-stone-500 text-xs font-bold mb-1.5 text-right">رقم الطلب</label>
            <input
              type="text"
              placeholder="مثال: ICWIclp8..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium text-sm text-left"
              dir="ltr"
            />
          </div>

          <div className="relative flex-1">
            <label className="block text-stone-500 text-xs font-bold mb-1.5 text-right">رقم الهاتف</label>
            <input
              type="tel"
              placeholder="مثال: +201012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium text-sm text-left"
              dir="ltr"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" variant="primary" className="py-3.5 px-8 rounded-2xl font-black text-sm shadow-md w-full sm:w-auto">
              تتبع الطلب
            </Button>
          </div>

        </div>
      </form>

      {/* Loader */}
      {loading && <Loader message="جاري البحث عن طلبك..." />}

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-sm font-bold text-center mb-6">
          {error}
        </div>
      )}

      {/* Order Details */}
      {!loading && order && (
        <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm p-6 sm:p-8 flex flex-col gap-8">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-stone-50 gap-4">
            <div>
              <span className="text-stone-400 text-xs font-bold block sm:inline">رقم الطلب:</span>
              <span className="font-mono font-bold text-stone-750 text-sm ml-4 mr-1">#{order.id.substring(0, 8)}</span>
              <span className="text-stone-400 text-xs font-bold block sm:inline mt-1 sm:mt-0">
                بتاريخ: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : ''}
              </span>
            </div>
            {!isCancelled && (
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${statusColors[order.orderStatus] || ''}`}>
                {statusLabels[order.orderStatus] || order.orderStatus}
              </span>
            )}
          </div>

          {/* Status Timeline */}
          {!isCancelled ? (
            <div className="py-4">
              <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
                <div className="absolute right-0 left-0 top-1/2 -translate-y-1/2 h-1 bg-stone-100 -z-10" />
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-500"
                  style={{
                    width: `${currentStep >= 0 ? (currentStep / (ORDER_STEPS.length - 1)) * 100 : 0}%`,
                    right: 0,
                    left: 'auto',
                  }}
                />

                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isActive = idx === currentStep;
                  const isFuture = idx > currentStep;

                  let circleClass = '';
                  let textClass = '';

                  if (isCompleted) {
                    circleClass = 'bg-emerald-500 text-white border-emerald-500 scale-100';
                    textClass = 'text-emerald-600 font-bold';
                  } else if (isActive) {
                    circleClass = 'bg-white text-primary border-primary ring-4 ring-primary/20 scale-110 animate-pulse';
                    textClass = 'text-primary-dark font-black';
                  } else {
                    circleClass = 'bg-white text-stone-300 border-stone-200';
                    textClass = 'text-stone-400';
                  }

                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                      <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center text-sm shadow-sm transition-all duration-300 ${circleClass}`}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <span className={`text-[11px] sm:text-xs text-center ${textClass}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-xs font-bold text-center">
              ❌ نأسف، تم إلغاء هذا الطلب من قبل الإدارة. يرجى التواصل معنا للاستفسار.
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

            {/* Shipping & Payment */}
            <div className="md:col-span-5 bg-stone-50/50 p-5 rounded-3xl border border-stone-100 text-xs flex flex-col gap-2.5">
              <h4 className="font-extrabold text-stone-800 text-sm mb-1">بيانات التوصيل</h4>
              <div>
                <span className="text-stone-400 font-bold">المستلم:</span>
                <span className="font-bold text-stone-700 mr-2">{order.customerName}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold">العنوان:</span>
                <span className="font-bold text-stone-700 mr-2">{order.customerAddress}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold">المحافظة:</span>
                <span className="font-bold text-stone-700 mr-2">{order.governorate}</span>
              </div>
              <div>
                <span className="text-stone-400 font-bold">طريقة الدفع:</span>
                <span className="font-bold text-stone-700 mr-2">
                  {paymentMethodLabels[order.paymentMethod] || 'الدفع عند الاستلام'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-bold">حالة الدفع:</span>
                <span className={`mr-2 font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {order.paymentStatus === 'paid' ? paymentDescriptions.paid : paymentDescriptions.pending}
                </span>
              </div>

              <div className="border-t border-stone-200/60 pt-3 mt-2 flex flex-col gap-2 text-stone-500">
                <div className="flex justify-between">
                  <span>قيمة المنتجات:</span>
                  <span>{(order.totalPrice - (order.shippingCost || 0)).toLocaleString('ar-EG')} {currencySymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>سعر الشحن:</span>
                  <span>{(order.shippingCost || 0).toLocaleString('ar-EG')} {currencySymbol}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-850 pt-1 border-t border-stone-200/30">
                  <span>الإجمالي الكلي:</span>
                  <span className="text-primary-dark">{order.totalPrice.toLocaleString('ar-EG')} {currencySymbol}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="md:col-span-7 flex flex-col gap-4">
              <h4 className="font-extrabold text-stone-800 text-sm">الأصناف المطلوبة</h4>
              <div className="flex flex-col gap-3">
                {order.items && order.items.map((item, idx) => {
                  const isReviewSubmitted = submittedReviews.includes(`${order.id}-${item.productId}`);
                  const isReviewingThis = activeReview && activeReview.orderId === order.id && activeReview.productId === item.productId;

                  return (
                    <div key={idx} className="flex flex-col border-b border-stone-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex gap-4 items-center text-xs">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=100'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-bold text-stone-850 text-sm line-clamp-1">{item.name}</h5>
                          <span className="text-[11px] text-stone-400 font-bold">
                            {item.quantity} × {item.price} {currencySymbol}
                          </span>
                        </div>

                        {order.orderStatus === 'delivered' && (
                          <div className="flex-shrink-0">
                            {isReviewSubmitted ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm">
                                ✓ تم التقييم
                              </span>
                            ) : (
                              <button
                                disabled={isReviewingThis}
                                onClick={() => setActiveReview({ orderId: order.id, productId: item.productId, item })}
                                className={`px-3 py-1.5 border rounded-xl font-bold text-[11px] transition-all focus:outline-none ${
                                  isReviewingThis
                                    ? 'border-stone-100 bg-stone-50 text-stone-300 cursor-not-allowed'
                                    : 'border-amber-200 text-amber-600 bg-amber-50/50 hover:bg-amber-50 hover:text-amber-700 shadow-sm'
                                }`}
                              >
                                ★ تقييم المنتج
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {isReviewingThis && (
                        <ReviewForm
                          product={item}
                          order={order}
                          onSuccess={() => {
                            setSubmittedReviews((prev) => [...prev, `${order.id}-${item.productId}`]);
                            setActiveReview(null);
                            alert('شكراً لك! تم إرسال تقييمك بنجاح وسيظهر بالمتجر قريباً.');
                          }}
                          onCancel={() => setActiveReview(null)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default OrderTracking;
