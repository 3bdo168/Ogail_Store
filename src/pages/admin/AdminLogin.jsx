import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../config/brand';
import Button from '../../components/ui/Button';

const AdminLogin = () => {
  const { login, user, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in as admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
      // Redirect handled by AuthContext onAuthStateChanged + isAdmin check
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني أو كلمة المرور.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتاً بسبب تكرار الدخول بشكل خاطئ. حاول لاحقاً.');
      } else {
        setError('حدث خطأ أثناء الاتصال بالنظام. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-cairo min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl text-right">
        
        {/* Brand Icon */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 3c-1.2 0-2.4.4-3.4 1.2A10 10 0 005 13c0 4.4 3.6 8 8 8h1a8 8 0 008-8 10 10 0 00-3.8-8.8c-1-.8-2.2-1.2-3.4-1.2z" />
              <path d="M12 3v18M12 11c2-1 4-1 6 0M12 15c-2-1-4-1-6 0" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-primary-dark mt-3">
            {BRAND.nameArabic} — لوحة التحكم
          </h2>
          <p className="text-stone-400 text-sm">
            تسجيل دخول المسؤولين المعتمدين فقط
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-xs font-bold mb-6 flex items-start gap-2">
            <svg className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div>
            <label className="block text-stone-600 font-bold text-xs mb-2" htmlFor="email">
              البريد الإلكتروني للـ Admin
            </label>
            <input
              type="email"
              id="email"
              placeholder={BRAND.adminEmailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 text-left font-medium"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-bold text-xs mb-2" htmlFor="password">
              كلمة المرور
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 text-left font-medium"
              dir="ltr"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="w-full py-3.5 rounded-2xl font-black mt-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            دخول للوحة التحكم
          </Button>

        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
