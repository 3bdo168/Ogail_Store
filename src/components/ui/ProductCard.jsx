import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from './Button';
import { useCurrency } from '../../context/CurrencyContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { currencySymbol } = useCurrency();
  const { id, name, price, category, imageUrl, stock, isAvailable } = product;

  const outOfStock = !isAvailable || stock <= 0;

  // Elegant fallback herbal image
  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=400';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!outOfStock) {
      addToCart(product, 1);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-stone-100 hover:border-primary-light/50 overflow-hidden shadow-sm hover:shadow-xl transition-all-300 flex flex-col h-full relative">
      
      {/* Category Badge */}
      <span className="absolute top-4 right-4 bg-stone-100/95 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm border border-white font-cairo">
        {category}
      </span>

      {/* Product Image Link */}
      <Link to={`/products/${id}`} className="relative block overflow-hidden aspect-[4/3] bg-stone-50 flex-shrink-0">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transition-all-300 group-hover:scale-105"
          loading="lazy"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg font-cairo text-sm tracking-wide">
              نفذت الكمية
            </span>
          </div>
        )}
      </Link>

      {/* Info Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/products/${id}`} className="hover:text-primary transition-colors block">
          <h3 className="text-lg font-extrabold text-stone-800 line-clamp-1 mb-1 font-cairo">
            {name}
          </h3>
        </Link>
        
        <p className="text-stone-400 text-xs line-clamp-2 mb-4 leading-relaxed font-cairo min-h-[32px]">
          {product.description || 'أعشاب وتوابل طبيعية ومنتقاة بعناية لأجود النكهات والأطباق الصحية.'}
        </p>

        {/* Price & Cart CTA */}
        <div className="mt-auto pt-4 border-t border-stone-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-stone-400 font-bold">السعر</span>
            <span className="text-xl font-black text-primary-dark font-cairo">
              {price.toLocaleString('ar-EG')} <span className="text-xs font-normal">{currencySymbol}</span>
            </span>
          </div>

          <Button
            variant={outOfStock ? 'secondary' : 'primary'}
            disabled={outOfStock}
            onClick={handleAddToCart}
            className="px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm"
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              أضف
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
