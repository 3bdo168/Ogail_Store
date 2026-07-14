import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { BRAND } from '../config/brand';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const PAYMENT_METHOD_LABELS = {
  cod: 'الدفع عند الاستلام',
  whatsapp: 'تأكيد عبر واتساب',
  cash: 'كاش عند الاستلام',
};

const OrderSuccess = () => {
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
      
      {/* WhatsApp Fallback Banner */}
      {whatsappFallbackUrl && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 text-center shadow-sm">
          <p className="text-emerald-800 font-bold text-sm mb-2">
            📱 لم يتم فتح نافذة واتساب تلقائياً لتأكيد الطلب
          </p>
          <a
            href={whatsappFallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm transition-colors shadow-sm"
          >
            اضغط هنا لتأكيد طلبك عبر واتساب
          </a>
        </div>
      )}

      {/* WhatsApp Confirm Order Banner */}
      {whatsappConfirmUrl && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 text-center shadow-sm">
          <p className="text-emerald-800 font-bold text-sm mb-2">
            💬 أرسل تفاصيل طلبك للمتجر عبر واتساب لتأكيد الطلب
          </p>
          <a
            href={whatsappConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm transition-colors shadow-sm"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            إرسال تفاصيل الطلب عبر واتساب
          </a>
        </div>
      )}

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
              <span className="text-primary-dark font-black">{order.totalPrice.toLocaleString('ar-EG')} ج.م</span>
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
