import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useState } from 'react'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-bg-cream h-48 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-primary-light/30 group-hover:bg-primary-light/50 transition-colors duration-300">
            <span className="text-5xl mb-2">{product.emoji || '🌿'}</span>
            <span className="text-primary/60 text-xs font-medium">{product.category || 'أعشاب طبيعية'}</span>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {product.badge}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < (product.rating || 5)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
          <span className="text-muted text-xs mr-1">({product.reviews || 0})</span>
        </div>

        {/* Name */}
        <h3 className="text-gray-800 font-bold text-base leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-muted text-xs leading-relaxed line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Price + Button */}
        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <div className="flex flex-col">
            <span className="text-primary font-extrabold text-lg leading-none">
              {product.price} جنيه
            </span>
            {product.originalPrice && (
              <span className="text-muted text-xs line-through">
                {product.originalPrice} جنيه
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${
              added
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            aria-label={`أضف ${product.name} للسلة`}
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={2} />
            <span>{added ? '✓ أُضيف' : 'أضف للسلة'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
