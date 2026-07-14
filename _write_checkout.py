import sys

content = r"""import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../hooks/useOrders';
import Button from '../components/ui/Button';
import { subscribeToShippingRates } from '../services/shippingService';
import { notifyCustomer, notifyAdminNewOrder, getCustomerWhatsAppConfirmLink } from '../services/whatsappService';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { submitOrder } = useOrders();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod | whatsapp
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
        <h2 className="text-xl font-bold text-stone-600 mb-4">\u0633\u0644\u062a\u0643 \u0641\u0627\u0631\u063a\u0629\u060c \u0644\u0627 \u064a\u0645\u0643\u0646\u0643 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0634\u0631\u0627\u0621.</h2>
        <Link to="/products">
          <Button variant="primary">\u0627\u0630\u0647\u0628 \u0644\u0644\u062a\u0633\u0648\u0642</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0643\u0627\u0645\u0644.';
    if (!selectedGov) return '\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0629 \u0644\u062a\u062d\u062f\u064a\u062f \u0633\u0639\u0631 \u0627\u0644\u0634\u062d\u0646.';
    if (!formData.phone.trim()) return '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641.';
    
    // Egyptian phone number regex validation (starts with 010, 011, 012, 015)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      return '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0645\u0635\u0631\u064a \u0635\u062d\u064a\u062d \u0645\u0643\u0648\u0646 \u0645\u0646 11 \u0631\u0642\u0645 (\u0645\u062b\u0627\u0644: 010XXXXXXXX).';
    }

    if (!formData.address.trim()) return '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u062d\u0646 \u0628\u0627\u0644\u062a\u0641\u0635\u064a\u0644.';
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
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        governorate: selectedGov.name,
        shippingCost: shippingCost,
        items: cartItems,
        totalPrice: grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
      };

      const orderId = await submitOrder(orderData);
      const savedOrder = { id: orderId, ...orderData };

      const customerResult = notifyCustomer(savedOrder, 'confirmed');
      notifyAdminNewOrder(savedOrder);

      clearCart();

      if (paymentMethod === 'cod') {
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
        const confirmUrl = getCustomerWhatsAppConfirmLink(savedOrder);
        window.open(confirmUrl, '_blank');
        
        if (!customerResult.success) {
          navigate('/order-success', { 
            state: { 
              orderId: orderId,
              whatsappConfirmUrl: confirmUrl,
              whatsappFallbackUrl: customerResult.url 
            } 
          });
        } else {
          navigate('/order-success', { 
            state: { 
              orderId: orderId,
              whatsappConfirmUrl: confirmUrl
            } 
          });
        }
      }
    } catch (err) {
      console.error(err);
      setFormError('\u062d\u062f\u062b \u062e\u0637\u0623 \u0623\u062b\u0646\u0627\u0621 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0637\u0644\u0628. \u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649.');
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
          \u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0633\u0644\u0629
        </Link>
      </div>

      <h1 className="text-3xl font-black text-stone-850 mb-10 text-right">\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u062f\u0641\u0639</h1>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Shipping Form & Payment Toggles (Col 1-7) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm text-right">
            
            <h3 className="text-xl font-extrabold text-stone-800 pb-4 mb-6 border-b border-stone-50">
              \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644
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
                  \u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643 \u0627\u0644\u062b\u0644\u0627\u062b\u064a"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="phone">
                  \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641 (\u0645\u062d\u0645\u0648\u0644 \u0645\u0635\u0631\u064a) *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="\u0645\u062b\u0627\u0644: 01012345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="governorate">
                  \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0629 *
                </label>
                <select
                  id="governorate"
                  required
                  onChange={(e) => handleGovChange(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-bold text-sm cursor-pointer"
                >
                  <option value="">\u0627\u062e\u062a\u0631 \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0629</option>
                  {shippingRates.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.name} (\u0634\u062d\u0646 \u0628\u0642\u064a\u0645\u0629 {rate.price} \u062c.\u0645)
                    </option>
                  ))}
                </select>
                {selectedGov && (
                  <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5 font-bold">
                    <span>\u23f1 \u0648\u0642\u062a \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u0645\u062a\u0648\u0642\u0639:</span>
                    <span className="text-primary-dark">{selectedGov.estimatedDays}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-sm mb-2" htmlFor="address">
                  \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0628\u0627\u0644\u062a\u0641\u0635\u064a\u0644 (\u0627\u0644\u0645\u062f\u064a\u0646\u0629\u060c \u0627\u0633\u0645 \u0627\u0644\u0634\u0627\u0631\u0639\u060c \u0631\u0642\u0645 \u0627\u0644\u0645\u0628\u0646\u0649/\u0627\u0644\u0634\u0642\u0629) *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  placeholder="\u0623\u062f\u062e\u0644 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0634\u062d\u0646 \u0628\u0627\u0644\u062a\u0641\u0635\u064a\u0644 \u0644\u064a\u0633\u0647\u0644 \u0639\u0644\u0649 \u0645\u0646\u062f\u0648\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0625\u064a\u062c\u0627\u062f\u0643"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Payment Method */}
            <h3 className="text-xl font-extrabold text-stone-800 pb-4 mb-6 border-b border-stone-50">
              \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              
              {/* Option 1: COD */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all-300 flex items-center justify-between ${
                  paymentMethod === 'cod'
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
                    <h4 className="font-bold text-stone-800 text-sm">\u0627\u0644\u062f\u0641\u0639 \u0639\u0646\u062f \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645</h4>
                    <p className="text-stone-400 text-xs mt-0.5">\u0627\u062f\u0641\u0639 \u0646\u0642\u062f\u0627\u064b \u0639\u0646\u062f \u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u0645\u0646\u062a\u062c \u0644\u0628\u0627\u0628\u0643</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'cod' ? 'border-primary' : 'border-stone-300'
                }`}>
                  {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
              </div>

              {/* Option 2: WhatsApp */}
              <div
                onClick={() => setPaymentMethod('whatsapp')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all-300 flex items-center justify-between ${
                  paymentMethod === 'whatsapp'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">\u062a\u0623\u0643\u064a\u062f \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628</h4>
                    <p className="text-stone-400 text-xs mt-0.5">\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u062a\u0646\u0633\u064a\u0642 \u0645\u0628\u0627\u0634\u0631\u0629 \u0645\u0639 \u0627\u0644\u0625\u062f\u0627\u0631\u0629</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'whatsapp' ? 'border-primary' : 'border-stone-300'
                }`}>
                  {paymentMethod === 'whatsapp' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </div>
              </div>

            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full py-4 rounded-2xl font-black text-base shadow-lg"
            >
              {paymentMethod === 'cod' ? '\u062a\u0623\u0643\u064a\u062f \u0637\u0644\u0628 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u0643\u0627\u0634' : '\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062a\u0633\u0627\u0628'}
            </Button>

          </form>
        </div>

        {/* Purchase Summary Sidebar (Col 8-12) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm text-right">
            
            <h3 className="text-lg font-black text-stone-850 pb-4 mb-4 border-b border-stone-100">
              \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0637\u0644\u0628
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
                    <span className="text-[11px] text-stone-400 font-bold">{item.quantity} \u00d7 {item.price} \u062c.\u0645</span>
                  </div>
                  <span className="text-xs font-black text-stone-700">{(item.price * item.quantity).toLocaleString('ar-EG')} \u062c.\u0645</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-3 text-sm text-stone-500 pb-4 mb-4 border-b border-stone-100">
              <div className="flex justify-between">
                <span>\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a:</span>
                <span className="font-bold text-stone-700">{cartTotal.toLocaleString('ar-EG')} \u062c.\u0645</span>
              </div>
              <div className="flex justify-between">
                <span>\u062a\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u062d\u0646 \u0648\u0627\u0644\u062a\u0639\u0628\u0626\u0629:</span>
                <span className="font-bold text-stone-700">
                  {shippingCost > 0 ? `${shippingCost.toLocaleString('ar-EG')} \u062c.\u0645` : '\u062d\u062f\u062f \u0627\u0644\u0645\u062d\u0627\u0641\u0638\u0629'}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-stone-850">
              <span>\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0643\u0644\u064a:</span>
              <span className="text-2xl font-black text-primary-dark">
                {grandTotal.toLocaleString('ar-EG')} \u062c.\u0645
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;
"""

with open(r"f:\Ogail_Store\src\pages\Checkout.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("File written successfully.")
