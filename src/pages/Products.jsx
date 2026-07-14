import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';

const Products = () => {
  const { products, loading, error, categories } = useProducts(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('newest'); // newest | price-asc | price-desc

  // Read URL search parameter for pre-filtering (e.g. ?category=أعشاب)
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('الكل');
    }
  }, [searchParams]);

  const handleCategorySelect = (category) => {
    if (category === 'الكل') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Filter and sort items locally
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // 'newest' (createdAt timestamp comparison)
      const dateA = a.createdAt ? new Date(a.createdAt) : 0;
      const dateB = b.createdAt ? new Date(b.createdAt) : 0;
      return dateB - dateA;
    });

  return (
    <div className="font-cairo max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Title & Description */}
      <div className="text-right mb-10">
        <h1 className="text-3xl font-black text-stone-800 mb-2">كتالوج المنتجات الطبيعية</h1>
        <p className="text-stone-500">
          تصفح تشكيلة منتجاتنا العضوية الممتازة المضمونة الجودة والنقاء.
        </p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm mb-10 flex flex-col lg:flex-row gap-6 items-stretch justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="ابحث عن اسم العشبة، التابل أو المنتج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 transition-all font-medium"
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-3 justify-end">
          <span className="text-stone-400 text-sm font-bold flex-shrink-0">ترتيب حسب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-bold text-sm cursor-pointer"
          >
            <option value="newest">المضاف حديثاً</option>
            <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
            <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
          </select>
        </div>

      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth">
        <button
          onClick={() => handleCategorySelect('الكل')}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex-shrink-0 border ${
            selectedCategory === 'الكل'
              ? 'bg-primary border-primary text-white shadow-md'
              : 'bg-white border-stone-100 hover:border-stone-300 text-stone-600'
          }`}
        >
          الكل
        </button>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => handleCategorySelect(cat)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex-shrink-0 border ${
              selectedCategory === cat
                ? 'bg-primary border-primary text-white shadow-md'
                : 'bg-white border-stone-100 hover:border-stone-300 text-stone-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <Loader message="جاري تحميل قائمة المنتجات..." />
      ) : error ? (
        <div className="text-center py-8 text-rose-600 font-bold">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title="لا توجد منتجات مطابقة"
            description="لم نجد أي منتج يطابق معايير البحث أو التصفية الحالية. يرجى محاولة تعديل الكلمات الرئيسية أو تصفح أقسام أخرى."
            actionText="عرض كل المنتجات"
            onActionClick={() => {
              setSearchQuery('');
              handleCategorySelect('الكل');
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Products;
