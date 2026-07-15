import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currencySymbol } = useCurrency();
  const shippingCost = 50; // flat rate for Egypt

  if (cartItems.length === 0) {
    return (
      <div className="font-cairo max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon="cart"
          title="سلة التسوق فارغة حالياً"
          description="تصفح أعشابنا وتوابلنا الفريدة والخلطات العضوية واشترِ احتياجاتك الصحية بأفضل الأسعار المتاحة."
          actionText="تصفح المنتجات"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="font-cairo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Title */}
      <h1 className="text-3xl font-black text-stone-850 mb-10 text-right">سلة التسوق الخاصة بك</h1>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (Col 1-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-stone-100">
              <span className="text-stone-600 font-bold">المنتجات ({cartItems.length})</span>
              <button
                onClick={clearCart}
                className="text-stone-400 hover:text-rose-600 font-bold text-sm transition-colors"
              >
                تفريغ السلة بالكامل
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary (Col 9-12) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h3 className="text-lg font-black text-stone-850 pb-4 mb-4 border-b border-stone-100 text-right">
              ملخص الطلب
            </h3>
            
            {/* Calculation details */}
            <div className="flex flex-col gap-4 mb-6 text-sm text-stone-650 text-right">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-stone-800">{cartTotal.toLocaleString('ar-EG')} {currencySymbol}</span>
              </div>
              <div className="flex justify-between">
                <span>تكلفة التوصيل (شحن موحد):</span>
                <span className="font-bold text-stone-800">{shippingCost.toLocaleString('ar-EG')} {currencySymbol}</span>
              </div>
              <div className="border-t border-stone-100 pt-4 flex justify-between text-base font-bold text-stone-850">
                <span>إجمالي الطلب:</span>
                <span className="text-xl font-black text-primary-dark">
                  {(cartTotal + shippingCost).toLocaleString('ar-EG')} {currencySymbol}
                </span>
              </div>
            </div>

            <p className="text-stone-400 text-xs mb-6 leading-relaxed text-right">
              * سيتم توجيهك لصفحة إتمام الطلب وملء بيانات الشحن. يمكنك الدفع نقداً عند الاستلام أو تأكيد طلبك عبر واتساب.
            </p>

            <div className="flex flex-col gap-3">
              <Link to="/checkout" className="w-full">
                <Button variant="primary" className="w-full py-3.5 rounded-2xl font-black shadow-md">
                  الانتقال إلى الدفع والشحن
                </Button>
              </Link>
              <Link to="/products" className="w-full text-center">
                <Button variant="ghost" className="w-full py-2 text-stone-500 hover:text-stone-800">
                  مواصلة التسوق
                </Button>
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Cart;
