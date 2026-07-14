import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../config/brand';

const Navbar = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const linkClass = ({ isActive }) =>
    `text-stone-700 hover:text-primary font-medium transition-colors py-2 px-1 border-b-2 ${
      isActive ? 'border-primary text-primary font-bold' : 'border-transparent'
    }`;

  return (
    <nav className="glass-effect sticky top-0 z-40 shadow-sm transition-all-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Right Section: Logo & Toggle Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-stone-500 hover:text-primary hover:bg-stone-50 md:hidden focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2 select-none group">
              {/* Herb logo illustration */}
              <div className="bg-primary hover:bg-primary-dark text-white p-2.5 rounded-2xl shadow-md transition-all-300 group-hover:rotate-12">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 3c-1.2 0-2.4.4-3.4 1.2A10 10 0 005 13c0 4.4 3.6 8 8 8h1a8 8 0 008-8 10 10 0 00-3.8-8.8c-1-.8-2.2-1.2-3.4-1.2z" />
                  <path d="M12 3v18M12 11c2-1 4-1 6 0M12 15c-2-1-4-1-6 0" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-primary-dark font-cairo">{BRAND.nameArabic}</span>
            </Link>
          </div>

          {/* Center Section: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass}>الرئيسية</NavLink>
            <NavLink to="/products" className={linkClass}>منتجاتنا</NavLink>
            {user && (
              <NavLink to="/admin/dashboard" className={linkClass}>لوحة التحكم</NavLink>
            )}
          </div>

          {/* Left Section: Search / Cart / Admin Auth */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-stone-100 hover:bg-primary/10 text-stone-700 hover:text-primary rounded-2xl transition-all-300 focus:outline-none active:scale-95 group shadow-sm hover:shadow"
              aria-label="سلة التسوق"
            >
              <svg className="h-6 w-6 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Profile/Logout */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-stone-600 hover:text-rose-600 hover:bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link
                to="/admin"
                className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl transition-all-300 active:scale-95 shadow-sm hover:shadow"
                title="لوحة الإدارة"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
          
        </div>
      </div>

      {/* Mobile Menu (Drawer/Collapse) */}
      {isMenuOpen && (
        <div className="md:hidden glass-effect border-t border-stone-100 py-4 px-6 animate-fade-in shadow-inner">
          <div className="flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-stone-700 hover:text-primary font-bold py-2 border-b border-stone-50 transition-colors"
            >
              الرئيسية
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMenuOpen(false)}
              className="text-stone-700 hover:text-primary font-bold py-2 border-b border-stone-50 transition-colors"
            >
              منتجاتنا
            </Link>
            {user ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-stone-700 hover:text-primary font-bold py-2 border-b border-stone-50 transition-colors"
                >
                  لوحة التحكم
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-right text-rose-600 hover:bg-rose-50 font-bold py-2 border-b border-stone-50 transition-colors flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-stone-700 hover:text-primary font-bold py-2 transition-colors flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                دخول الإدارة
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
