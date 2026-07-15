import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BRAND } from '../config/brand';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { getProductReviews, getProductRating } from '../services/reviewService';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { fetchProductById, product, loadingProduct, errorProduct, products, fetchProducts } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { currencySymbol } = useCurrency();
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ avg: 0, count: 0 });

  // Load the product details and reviews on ID change
  useEffect(() => {
    fetchProductById(id);
    fetchProducts(); // Load other products for "related products"
    
    const loadReviews = async () => {
      try {
        const data = await getProductReviews(id);
        setReviews(data);
        const stats = getProductRating(data);
        setRatingStats(stats);
      } catch (err) {
        console.error('Error fetching product reviews:', err);
      }
    };
    loadReviews();
  }, [id, fetchProductById, fetchProducts]);

  // Reset quantity to 1 when changing products
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (loadingProduct) return <Loader fullPage={true} message="جاري تحميل تفاصيل المنتج..." />;
  if (errorProduct || !product) {
    return (
      <div className="font-cairo max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-rose-600 mb-4">{errorProduct || 'المنتج غير موجود'}</h2>
        <Link to="/products">
          <Button variant="primary">العودة إلى المنتجات</Button>
        </Link>
      </div>
    );
  }

  const { name, price, description, category, imageUrl, stock, isAvailable } = product;
  const outOfStock = !isAvailable || stock <= 0;

  // Filter related products
  const relatedProducts = products
    .filter((p) => p.category === category && p.id !== id)
    .slice(0, 4);

  const displayImage = imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=600';

  const handleIncrement = () => {
    if (quantity < stock) setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = () => {
    if (!outOfStock) {
      addToCart(product, quantity);
    }
  };

  return (
    <div className="font-cairo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back Link */}
      <div className="mb-8 text-right">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-primary font-bold text-sm transition-colors">
          <svg className="h-4 w-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          العودة لكتالوج المنتجات
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm mb-16">
        
        {/* Left/Right Columns depending on RTL (Right: Image, Left: Details) */}
        {/* Product Image (Col 1-5) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full aspect-square rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 shadow-inner relative max-w-md">
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover"
            />
            {outOfStock && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-rose-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg text-base">
                  نفذت الكمية
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info (Col 6-12) */}
        <div className="lg:col-span-7 flex flex-col justify-between text-right">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-stone-100 text-stone-700 text-xs font-bold px-3 py-1.5 rounded-full border border-stone-200">
                {category}
              </span>
              
              {outOfStock ? (
                <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-100">
                  غير متوفر
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                  متوفر في المخزون
                </span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-stone-850 mb-4">{name}</h1>

            <div className="mb-6">
              <span className="text-3xl font-black text-primary-dark">
                {price.toLocaleString('ar-EG')} <span className="text-lg font-normal">{currencySymbol}</span>
              </span>
            </div>

            <h3 className="text-stone-700 font-bold mb-2">الوصف:</h3>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 whitespace-pre-line">
              {description || `لم يتم كتابة وصف تفصيلي لهذا المنتج بعد. نوفر لك في متجر ${BRAND.nameArabic} أجود المنتجات المنتقاة وتعبئتها بأرقى الأساليب لضمان جودتها وحفظ خصائصها الطبيعية.`}
            </p>

            {/* Stock Level Alert */}
            {!outOfStock && stock <= 5 && (
              <div className="bg-amber-50 border border-amber-250 text-amber-800 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 mb-6">
                <svg className="h-5 w-5 flex-shrink-0 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>تنبيه: الكمية محدودة جداً! متبقي فقط {stock} في المخزون.</span>
              </div>
            )}
          </div>

          {/* Quantity and Cart Controls */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-4">
            
            {/* Quantity adjust */}
            {!outOfStock && (
              <div className="flex items-center border border-stone-200 rounded-2xl overflow-hidden bg-stone-50 shadow-sm w-full sm:w-auto justify-between">
                <button
                  onClick={handleDecrement}
                  className="px-4 py-3.5 text-stone-500 hover:bg-white hover:text-primary active:bg-stone-100 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </button>
                <span className="px-6 py-2 font-black text-stone-700 bg-white min-w-[3rem] text-center select-none text-lg">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= stock}
                  className="px-4 py-3.5 text-stone-500 hover:bg-white hover:text-primary active:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              variant={outOfStock ? 'secondary' : 'primary'}
              disabled={outOfStock}
              onClick={handleAddToCart}
              className="w-full sm:flex-1 py-4 rounded-2xl shadow-md hover:shadow-lg font-black text-base"
            >
              {outOfStock ? 'نفذت الكمية من المتجر' : 'إضافة إلى سلة التسوق'}
            </Button>

          </div>

        </div>

      </div>

      {/* Product Reviews and Ratings Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-stone-800 mb-8 text-right border-r-4 border-primary pr-3">
          تقييمات وآراء العملاء
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-10">
          {/* Rating Statistics Dashboard (Col 1-5) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col justify-between gap-6 text-right">
            <div>
              <span className="block text-stone-400 text-xs font-bold mb-1">التقييم العام للمنتج</span>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-stone-850">
                  {ratingStats.avg.toLocaleString('ar-EG')}
                </span>
                <span className="text-stone-400 text-sm">من ٥</span>
              </div>
              
              {/* Star graphics */}
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-xl ${
                      star <= Math.round(ratingStats.avg) ? 'text-amber-400' : 'text-stone-200'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-stone-500 text-xs font-bold block mb-6">
                بناءً على {ratingStats.count.toLocaleString('ar-EG')} تقييم من عملائنا
              </span>

              {/* Star breakdown */}
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const total = reviews.length;
                  const percentage = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="text-stone-500 w-12 font-bold">{star} نجوم</span>
                      <div className="flex-1 bg-stone-100 rounded-full h-2 shadow-inner overflow-hidden">
                        <div
                          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-stone-400 w-8 text-left font-mono">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service & Delivery Averages */}
            {reviews.length > 0 && (
              <div className="border-t border-stone-100 pt-4 mt-2 grid grid-cols-2 gap-4 text-center">
                <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-100/50">
                  <span className="block text-stone-400 text-[10px] font-bold mb-1">تقييم الخدمة</span>
                  <span className="text-base font-black text-stone-700">
                    {(reviews.reduce((sum, r) => sum + (r.serviceRating || 5), 0) / reviews.length).toFixed(1).toLocaleString('ar-EG')} / ٥
                  </span>
                </div>
                <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-100/50">
                  <span className="block text-stone-400 text-[10px] font-bold mb-1">تقييم التوصيل</span>
                  <span className="text-base font-black text-stone-700">
                    {(reviews.reduce((sum, r) => sum + (r.deliveryRating || 5), 0) / reviews.length).toFixed(1).toLocaleString('ar-EG')} / ٥
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reviews List (Col 6-12) */}
          <div className="lg:col-span-7 flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
            {reviews.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-[2.5rem] border border-stone-100 shadow-sm text-stone-400 h-full flex flex-col justify-center items-center">
                <span className="text-4xl mb-3">💬</span>
                <h4 className="font-extrabold text-stone-700 text-sm mb-1">لا توجد تقييمات حالياً</h4>
                <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                  هذا المنتج لم يتلق أي مراجعات بعد. إذا قمت بشراء هذا المنتج يمكنك تقييمه من صفحة تتبع الطلبات بعد الاستلام!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-stone-800 text-sm">{review.customerName}</h4>
                      {review.isVerified && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          ✓ مشتري موثق
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ar-EG') : ''}
                    </span>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-base ${
                          star <= review.rating ? 'text-amber-400' : 'text-stone-200'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line bg-stone-50/30 p-3 rounded-2xl border border-stone-100/30">
                      {review.comment}
                    </p>
                  )}
                  
                  {/* Micro ratings indicator */}
                  <div className="flex gap-3 text-[10px] text-stone-400 font-bold">
                    <span>المنتج: {review.rating}/٥</span>
                    <span>•</span>
                    <span>الخدمة: {review.serviceRating || 5}/٥</span>
                    <span>•</span>
                    <span>التوصيل: {review.deliveryRating || 5}/٥</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-stone-800 mb-8 text-right border-r-4 border-primary pr-3">
            منتجات ذات صلة
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
