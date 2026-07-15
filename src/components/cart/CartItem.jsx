import React from 'react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { currencySymbol } = useCurrency();
  const { id, name, price, imageUrl, quantity, stock } = item;

  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=200';

  return (
    <div className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-stone-200 transition-colors">
      
      {/* Image */}
      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white border border-stone-100 flex-shrink-0">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info & Adjustments */}
      <div className="flex flex-col justify-between flex-grow">
        
        {/* Name and Remove */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-stone-800 text-sm line-clamp-1 leading-snug font-cairo">
            {name}
          </h4>
          <button
            onClick={() => removeFromCart(id)}
            className="text-stone-400 hover:text-rose-600 transition-colors p-1"
            title="حذف من السلة"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-sm font-bold text-stone-500">
            {(price * quantity).toLocaleString('ar-EG')} {currencySymbol}
          </span>

          <div className="flex items-center border border-stone-200 bg-white rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => updateQuantity(id, quantity - 1)}
              className="px-2.5 py-1.5 text-stone-500 hover:bg-stone-50 hover:text-primary active:bg-stone-100 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            </button>
            <span className="px-3 py-1 text-sm font-black text-stone-700 bg-stone-50/50 w-8 text-center select-none font-cairo">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(id, quantity + 1)}
              disabled={quantity >= stock}
              className="px-2.5 py-1.5 text-stone-500 hover:bg-stone-50 hover:text-primary active:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CartItem;
