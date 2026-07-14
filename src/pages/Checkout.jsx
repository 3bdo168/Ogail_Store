import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../hooks/useOrders';
import Button from '../components/ui/Button';
import { subscribeToShippingRates } from '../services/shippingService';
import { notifyCustomer, notifyAdminNewOrder } from '../services/whatsappService';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { submitOrder, payWithPaymob } = useOrders();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash | online
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [shippingRates, setShippingRates] = useState([]);
  const [selectedGov, setSelectedGov] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    const unsub = subscribeToShippingRates((rates) => {
      // Only show active governorates
      setShippingRates(rates.filter((r) => r.isActive));
    });
    return unsub;
  }, []);

  const handleGovChange = (govId) => {
    const gov = shippingRates.find((r) => r.id === govId);
    setSelectedGov(gov);
    setShippingCost(gov?.price || 0);
  };

  const grandTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="font-cairo max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-600 mb-4">سلتك فارغة، لا يمكنك إتمام الشراء.</h2>
        <Link to="/products">
          <Button variant="primary">اذهب للتسوق</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'يرجى إدخال الاسم بالكامل.';
    if (!selectedGov) return 'يرجى اختيار المحافظة لتحديد سعر الشحن.';
    if (!formData.phone.trim()) return 'يرجى إدخال رقم الهاتف.';

    // Egyptian phone number regex validation (starts with 010, 011, 012, 015)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return 'يرجى إدخال رقم هاتف مصري صحيح مكون من 11 رقم (مثال: 010XXXXXXXX).';
    }

    if (!formData.address.trim()) return 'يرجى إدخال عنوان الشحن بالتفصيل.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setSubmitting(true);

    try {
      // Create Firestore order details
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        governorate: selectedGov.name,
        shippingCost: shippingCost,
        items: cartItems,
        totalPrice: grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending', // 'paid' is updated later by Paymob or admin
        orderStatus: 'pending',
      };

      // 1. Submit order to Firestore
      const orderId = await submitOrder(orderData);
      const savedOrder = { id: orderId, ...orderData };

      // 1. إشعار العميل بتأكيد الطلب
      const customerResult = notifyCustomer(savedOrder, 'confirmed');

      // 2. إشعار الأدمن
      notifyAdminNewOrder(savedOrder);

      clearCart();

      if (paymentMethod === 'cash') {
        // Cash order flow completes instantly
        if (!customerResult.success) {
          navigate('/order-success', {
            state: {
              orderId: orderId,
              whatsappFallbackUrl: customerResult.url
            }
          });
        } else {
          navigate('/order-success', { state: { orderId: orderId } });
        }
      } else {
        // Online payment flow via Paymob
        const payData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        };

        const paymentResponse = await payWithPaymob(grandTotal, payData, orderId);

        if (paymentResponse.simulated) {
          // If Paymob CORS/unconfigured, go to success page with notice
          if (!customerResult.success) {
            navigate(paymentResponse.redirectUrl, {
              state: {
                orderId: orderId,
                whatsappFallbackUrl: customerResult.url
              }
            });
          } else {
            navigate(paymentResponse.redirectUrl, { state: { orderId: orderId } });
          }
        } else {
          // Redirect to actual Paymob checkout frame
          window.location.href = paymentResponse.redirectUrl;
        }
      }
    } catch (err) {
      console.error(err);
      setFormError('حدث خطأ أثناء تسجيل الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-cairo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Back to Cart */}
      <div className="mb-6 text-right">
        <Link to="/cart" className="inline-flex items-center gap-1 text-stone-500 hover:text-primary font-bold text-sm transition-colors">
          <svg className="h-4 w-4 transform rotate-185" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة لتعديل السلة
        </Link>
      </div>

      <h1 className="text-3xl font-black text-stone-850 mb-10 text-right">إتمام الطلب والدفع</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Shipping Form & Payment Toggles (Col 1-7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm text-right">

            <h3 className="text-xl font-extrabold text-stone-800 pb-4 mb-6 border-b border-stone-50">
              بيانات الشحن والتوصيل
            </h3>

            {/* Error Notification */}
            {formError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{formError}</span>
              </div>
            )}

            {/* Inputs */}
            <div className="flex flex-col gap-6 mb-8">

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="name">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="أدخل اسمك الثلاثي"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="phone">
                  رقم الهاتف (محمول مصري) *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="مثال: 01012345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="governorate">
                  المحافظة *
                </label>
                <select
                  id="governorate"
                  required
                  onChange={(e) => handleGovChange(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-bold text-sm cursor-pointer"
                >
                  <option value="">اختر المحافظة</option>
                  {shippingRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.name} (شحن بقيمة {rate.price} ج.م)
                    </option>
                  ))}
                </select>
                {selectedGov && (
                  <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5 font-bold">
                    <span>⏱ وقت التوصيل المتوقع:</span>
                    <span className="text-primary-dark">{selectedGov.estimatedDays}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="address">
                  العنوان بالتفصيل (المدينة، اسم الشارع، رقم المبنى/الشقة) *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="أدخل عنوان الشحن بالتفصيل ليسهل على مندوب التوصيل إيجادك"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Payment Method */}
            <h3 className="text-xl font-extrabold text-stone-800 pb-4 mb-6 border-b border-stone-50">
              طريقة الدفع
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

              {/* Option 1: Cash */}
              <div
                onClick={() => setPaymentMethod('cash')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all-300 flex items-center justify-between ${paymentMethod === 'cash'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">كاش عند الاستلام</h4>
                    <p className="text-stone-400 text-xs mt-0.5">ادفع عند توصيل المنتج لبابك</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary' : 'border-stone-300'
                  }`}>
                  {paymentMethod === 'cash' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
              </div>

              {/* Option 2: Online */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all-300 flex items-center justify-between ${paymentMethod === 'online'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">دفع إلكتروني (بطاقة / محفظة)</h4>
                    <p className="text-stone-400 text-xs mt-0.5">ادفع الآن بأمان عبر شبكة Paymob</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-stone-300'
                  }`}>
                  {paymentMethod === 'online' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
              </div>

            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-4 rounded-2xl font-black text-base shadow-lg"
            >
              {paymentMethod === 'cash' ? 'تأكيد طلب التوصيل كاش' : 'الانتقال لبوابة الدفع الآمن'}
            </Button>

          </form>
        </div>

        {/* Purchase Summary Sidebar (Col 8-12) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-right">

            <h3 className="text-lg font-black text-stone-850 pb-4 mb-4 border-b border-stone-100">
              مراجعة الطلب
            </h3>

            {/* List items */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-6 pr-1 no-scrollbar">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 items-center py-2 border-b border-stone-50">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
                    <img src={item.imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=100'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-stone-800 text-xs line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-stone-400 font-bold">{item.quantity} × {item.price} ج.م</span>
                  </div>
                  <span className="text-xs font-black text-stone-700">{(item.price * item.quantity).toLocaleString('ar-EG')} ج.م</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-3 text-sm text-stone-500 pb-4 mb-4 border-b border-stone-100">
              <div className="flex justify-between">
                <span>إجمالي المنتجات:</span>
                <span className="font-bold text-stone-700">{cartTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة الشحن والتعبئة:</span>
                <span className="font-bold text-stone-700">
                  {shippingCost > 0 ? `${shippingCost.toLocaleString('ar-EG')} ج.م` : 'حدد المحافظة'}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-stone-850">
              <span>الإجمالي الكلي:</span>
              <span className="text-2xl font-black text-primary-dark">
                {grandTotal.toLocaleString('ar-EG')} ج.م
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
