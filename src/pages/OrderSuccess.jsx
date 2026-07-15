import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { BRAND } from '../config/brand';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { useCurrency } from '../context/CurrencyContext';

const PAYMENT_METHOD_LABELS = {
  cod: 'الدفع عند الاستلام',
  whatsapp: 'تأكيد عبر واتساب',
  cash: 'كاش عند الاستلام',
};

const TRACKING_PHONE_STORAGE_KEY = 'ogail_last_order_phone';

const OrderSuccess = () => {
  const { currencySymbol } = useCurrency();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state } = location || {};
  const orderId = searchParams.get('orderId') || state?.orderId;
  const whatsappFallbackUrl = state?.whatsappFallbackUrl;
  const whatsappConfirmUrl = state?.whatsappConfirmUrl;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrder({ id: docSnap.id, ...data });
          // Store phone for tracking link
          if (data.customerPhone) {
            sessionStorage.setItem(TRACKING_PHONE_STORAGE_KEY, data.customerPhone);
          }
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <Loader fullPage={true} message="جاري تحميل تفاصيل الفاتورة..." />;

  return (
    <div className="font-cairo max-w-2xl mx-auto px-4 py-16 text-center">
      


      {/* Success Badge Graphic */}
      <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-6 border border-emerald-100 shadow-sm animate-bounce">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-stone-850 mb-3">تم تسجيل طلبك بنجاح!</h1>
      
      <p className="text-stone-500 text-sm mb-8 max-w-md mx-auto">
        شكراً لتسوقك من {BRAND.nameArabic}. تم استلام تفاصيل شحنتك وجاري مراجعتها وتعبئتها لإرسالها بأقرب وقت ممكن.
      </p>

      {/* Tracking Callout */}
      {order && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 mb-8 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="flex-grow">
              <h3 className="font-extrabold text-indigo-800 text-sm mb-1">تتبع حالة طلبك</h3>
              <p className="text-indigo-600 text-xs leading-relaxed">
                يمكنك متابعة حالة طلبك في أي وقت من خلال رابط التتبع. احتفظ برقم الطلب ورقم هاتفك للرجوع إليهما لاحقاً.
              </p>
            </div>
            <Link
              to={`/track-order?orderId=${order.id}&phone=${encodeURIComponent(sessionStorage.getItem(TRACKING_PHONE_STORAGE_KEY) || '')}`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs shadow-md transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              تتبع حالة طلبك
            </Link>
          </div>
        </div>
      )}

      {order ? (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 text-right mb-8">
          
          <h3 className="text-base font-extrabold text-stone-800 pb-3 mb-4 border-b border-stone-50">
            تفاصيل الفاتورة
          </h3>

          <div className="flex flex-col gap-3 text-sm text-stone-600 mb-6">
            <div className="flex justify-between">
              <span className="text-stone-400">رقم الطلب:</span>
              <span className="font-mono font-bold text-stone-750">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">المستلم:</span>
              <span className="font-bold text-stone-750">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">رقم الهاتف:</span>
              <span className="font-bold text-stone-750">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">عنوان التوصيل:</span>
              <span className="font-bold text-stone-750 text-left max-w-xs">{order.customerAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">طريقة الدفع:</span>
              <span className="font-bold text-stone-750">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between border-t border-stone-50 pt-3 text-base font-bold text-stone-850">
              <span>القيمة الإجمالية:</span>
              <span className="text-primary-dark font-black">{order.totalPrice.toLocaleString('ar-EG')} {currencySymbol}</span>
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl text-xs text-stone-500 leading-relaxed text-center">
            قريباً ستتلقى اتصالاً هاتفياً من فريق التوصيل لتنسيق موعد تسليم الشحنة. احتفظ برقم الطلب ورقم هاتفك للرجوع لتتبع الطلب في أي وقت.
          </div>

        </div>
      ) : (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-2xl text-sm font-bold mb-8">
          لم نتمكن من جلب تفاصيل الفاتورة مباشرة، ولكن طلبك مسجل بالفعل لدينا.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/products" className="sm:flex-1">
          <Button variant="primary" className="w-full py-3.5 rounded-2xl font-black shadow-md">
            الاستمرار في التسوق
          </Button>
        </Link>
        <Link to="/" className="sm:flex-1">
          <Button variant="secondary" className="w-full py-3.5 rounded-2xl text-stone-700">
            العودة للصفحة الرئيسية
          </Button>
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
