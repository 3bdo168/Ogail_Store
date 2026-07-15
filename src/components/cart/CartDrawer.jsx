import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from './CartItem';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { currencySymbol } = useCurrency();
  const navigate = useNavigate();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-cairo">
      
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10 animate-slide-left">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-r border-stone-100">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-lg font-black text-stone-800">سلة التسوق</h2>
            </div>
            
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors"
              title="إغلاق السلة"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body (Scrollable Cart Items) */}
          <div className="flex-1 py-6 overflow-y-auto px-6 no-scrollbar">
            {cartItems.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon="cart"
                  title="سلتك فارغة تماماً"
                  description="ابدأ في تصفح الأعشاب والتوابل الطازجة والمنتجات العضوية وأضفها إلى السلة لتسوق سريع وسهل."
                  actionText="تصفح المنتجات"
                  onActionClick={() => setIsCartOpen(false)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer (Summary & Checkout) */}
          {cartItems.length > 0 && (
            <div className="border-t border-stone-100 px-6 py-6 bg-stone-50/50 backdrop-blur-sm">
              <div className="flex justify-between text-base font-bold text-stone-800 mb-6">
                <span>المجموع الفرعي:</span>
                <span className="text-2xl font-black text-primary-dark">
                  {cartTotal.toLocaleString('ar-EG')} {currencySymbol}
                </span>
              </div>
              <p className="text-stone-400 text-xs mb-6 leading-relaxed">
                * تكلفة الشحن يتم حسابها عند إتمام عملية الشراء. الدفع متوفر كاش عند الاستلام أو عبر الإنترنت.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 rounded-2xl font-extrabold shadow-md hover:shadow-lg"
                >
                  الذهاب لإتمام الطلب
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-stone-500 hover:text-stone-800 py-2"
                >
                  مواصلة التسوق
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Simple Keyframe animations for slide in (tailored for RTL sliding left) */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

    </div>
  );
};

export default CartDrawer;
