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
          setOrder({ id: docSnap.id, ...docSnap.data() });
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
            قريباً ستتلقى اتصالاً هاتفياً من فريق التوصيل لتنسيق موعد تسليم الشحنة. إذا كان لديك أي استفسار يرجى الاحتفاظ برقم الطلب.
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
