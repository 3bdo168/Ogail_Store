import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/brand';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-300 font-cairo pt-16 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Column 1: Store Intro */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 select-none">
              <div className="bg-primary text-white p-2 rounded-xl shadow-md">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 3c-1.2 0-2.4.4-3.4 1.2A10 10 0 005 13c0 4.4 3.6 8 8 8h1a8 8 0 008-8 10 10 0 00-3.8-8.8c-1-.8-2.2-1.2-3.4-1.2z" />
                  <path d="M12 3v18M12 11c2-1 4-1 6 0M12 15c-2-1-4-1-6 0" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">{BRAND.nameArabic}</span>
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed mt-2">
              {BRAND.tagline}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 border-r-4 border-primary pr-3">روابط سريعة</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary transition-colors">جميع المنتجات</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-primary transition-colors">تتبع طلبك</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary transition-colors">بوابة الإدارة</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 border-r-4 border-primary pr-3">أقسام المتجر</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link to="/products?category=أعشاب" className="hover:text-primary transition-colors">أعشاب طبيعية</Link>
              </li>
              <li>
                <Link to="/products?category=توابل" className="hover:text-primary transition-colors">توابل وبهارات</Link>
              </li>
              <li>
                <Link to="/products?category=زيوت" className="hover:text-primary transition-colors">زيوت طبيعية</Link>
              </li>
              <li>
                <Link to="/products?category=بذور" className="hover:text-primary transition-colors">بذور وحبوب</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div>
            <h4 className="text-white text-base font-bold mb-4 border-r-4 border-primary pr-3">تواصل معنا</h4>
            <ul className="flex flex-col gap-3 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>الفرع الرئيسي: {BRAND.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>يومياً من 9:00 ص إلى 10:00 م</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stone-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-stone-500 text-xs gap-4">
          <p>© {currentYear} {BRAND.nameArabic}. {BRAND.copyrightText}.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
            <span>•</span>
            <a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
