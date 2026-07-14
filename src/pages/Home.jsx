import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config/brand';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';

const Home = () => {
  const { products, loading, error } = useProducts(true);

  // Filter 4 featured products for display
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: 'أعشاب', label: 'أعشاب طبيعية', count: 'بابونج، ميرمية، زعتر...', icon: '🌱', bg: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
    { name: 'توابل', label: 'توابل وبهارات', count: 'كمون، كزبرة، سماق...', icon: '🌶️', bg: 'bg-amber-50 text-amber-800 border-amber-100' },
    { name: 'زيوت', label: 'زيوت طبيعية', count: 'زيت زيتون، حبة البركة...', icon: '🏺', bg: 'bg-yellow-50 text-yellow-800 border-yellow-100' },
    { name: 'بذور', label: 'بذور وحبوب', count: 'كتان، شيا، رشاد...', icon: '🌾', bg: 'bg-stone-50 text-stone-800 border-stone-200' },
  ];

  return (
    <div className="font-cairo pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-dark via-primary to-emerald-950 text-white py-24 px-4 sm:px-6 lg:px-8 shadow-inner select-none">
        
        {/* Abstract leaf background shapes */}
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 opacity-10 pointer-events-none">
          <svg className="h-[500px] w-[500px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H21V7H17V3M12 3C10.9 3 10 3.9 10 5V19C10 20.1 10.9 21 12 21H16C17.1 21 18 20.1 18 19V5C18 3.9 17.1 3 16 3H12M12 5H16V19H12V5M6 7C4.9 7 4 7.9 4 9V17C4 18.1 4.9 19 6 19H8C9.1 19 10 18.1 10 17V9C10 7.9 9.1 7 8 7H6M6 9H8V17H6V9Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          
          {/* Hero Content */}
          <div className="flex-1 text-right">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-primary-light text-sm font-bold mb-6 border border-white/10">
              🌱 طبيعي وعضوي 100%
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-wide drop-shadow-md">
              صحتك ونكهة طعامك <br />
              <span className="text-primary-light">من خير الطبيعة مباشرة</span>
            </h1>
            <p className="text-stone-200 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              اكتشف تشكيلة {BRAND.nameArabic} الفاخرة من المنتجات الطبيعية لدعم صحتك ونمط حياتك.
            </p>
            <div className="flex flex-wrap gap-4 justify-start">
              <Link to="/products">
                <Button variant="secondary" className="px-8 py-4 text-primary font-black shadow-lg rounded-2xl hover:bg-stone-50">
                  تسوق منتجاتنا الآن
                </Button>
              </Link>
              <a href="#categories">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary-dark px-6 py-4 rounded-2xl">
                  تصفح الأقسام
                </Button>
              </a>
            </div>
          </div>

          {/* Hero Graphics / Display */}
          <div className="flex-1 flex justify-center relative">
            <div className="relative h-72 w-72 sm:h-96 sm:w-96 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=600"
                alt="Herbs and spices in wooden spoons"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-stone-800 mb-4">أقسام العطارة المميزة</h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            تصفح منتجاتنا المتنوعة المقسمة بدقة لتسهيل وصولك لأعشابك وتوابلك المفضلة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${cat.name}`}
              className={`p-6 rounded-3xl border ${cat.bg} hover:shadow-lg transition-all-300 block relative overflow-hidden group`}
            >
              <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <h3 className="text-xl font-bold mb-2">{cat.label}</h3>
              <p className="opacity-80 text-sm leading-relaxed">{cat.count}</p>
              
              {/* Arrow Indicator */}
              <div className="absolute left-6 bottom-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="h-5 w-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products (Best Sellers) Section */}
      <section className="bg-stone-50 py-20 border-y border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
            <div className="text-right">
              <h2 className="text-3xl font-black text-stone-800 mb-2">الأكثر مبيعاً</h2>
              <p className="text-stone-500">
                المنتجات العضوية الأكثر طلباً وشهرة من قبل عملائنا.
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="rounded-2xl border-stone-300 hover:border-primary text-stone-600 hover:text-primary">
                عرض الكتالوج بالكامل
              </Button>
            </Link>
          </div>

          {loading ? (
            <Loader message="جاري تحميل المنتجات المميزة..." />
          ) : error ? (
            <div className="text-center py-8 text-rose-600 font-bold">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-stone-500 font-medium">
              لم يتم العثور على منتجات حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-16">
          <h2 className="text-3xl font-black text-stone-800 mb-4">لماذا تشتري من {BRAND.nameArabic}؟</h2>
          <p className="text-stone-500 max-w-xl mx-auto">
            نحن ملتزمون بتقديم أعلى معايير الجودة والقيمة لعملائنا في كل غرام.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Card 1 */}
          <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-850 mb-3">جودة مضمونة 100%</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              جميع الأعشاب والتوابل نقية خالية من الإضافات الكيماوية أو المواد الحافظة، وتُحفظ في بيئة مثالية لضمان جودتها ونكهتها.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-850 mb-3">طرق دفع مرنة وآمنة</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              نوفر لك خيار الدفع نقداً عند استلام شحنتك، أو تأكيد طلبك والتنسيق مباشرة مع إدارة المتجر عبر واتساب.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-850 mb-3">شحن سريع ومحمي</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              تصلك طلبياتك معبأة في عبوات محكمة الإغلاق تحافظ على الزيوت العطرية والرطوبة، وبأقصى سرعة توصيل ممكنة.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
