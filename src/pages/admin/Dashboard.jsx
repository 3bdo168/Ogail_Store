import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/brand';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../hooks/useOrders';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { getStoreSettings, updateCurrency } from '../../services/settingsService';
import { CURRENCIES } from '../../config/currency';
import { useCurrency } from '../../context/CurrencyContext';

const Dashboard = () => {
  const { products, loading: productsLoading } = useProducts(true);
  const { orders, loading: ordersLoading } = useOrders(true);
  const { currencySymbol } = useCurrency();

  // Settings state
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Fetch initial store settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getStoreSettings();
        setSelectedCurrency(settings.currency || 'EGP');
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      await updateCurrency(selectedCurrency);
      setSettingsSuccess('تم تحديث عملة المتجر بنجاح!');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setSettingsError('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setSettingsLoading(false);
    }
  };

  if (productsLoading || ordersLoading) {
    return <Loader fullPage={true} message="جاري تحميل إحصائيات لوحة التحكم..." />;
  }

  // Calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const activeProducts = products.filter((p) => p.isAvailable).length;

  // Total Revenue: sum of all orders that are paid, or all orders in general (excluding pending online payments if appropriate)
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid' || o.paymentMethod === 'cash' || o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const recentOrders = orders.slice(0, 5);

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    processing: 'bg-blue-50 text-blue-700 border-blue-100',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
  };

  return (
    <div className="w-full text-right">

      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-850 mb-2">لوحة تحكم {BRAND.nameArabic}</h1>
          <p className="text-stone-500">نظرة عامة على أداء المتجر، المبيعات وإدارة المخزون.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products">
            <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl shadow font-bold text-sm transition-all cursor-pointer">
              إدارة المنتجات
            </span>
          </Link>
          <Link to="/admin/orders">
            <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl border border-stone-200 font-bold text-sm transition-all cursor-pointer">
              إدارة الطلبات
            </span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

        {/* Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 font-bold px-2 py-1 rounded-lg">المبيعات النشطة</span>
          </div>
          <span className="block text-stone-400 text-xs font-bold mb-1">إجمالي المبيعات</span>
          <span className="text-2xl font-black text-stone-800">{totalRevenue.toLocaleString('ar-EG')} {currencySymbol}</span>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-[11px] text-blue-600 bg-blue-50 font-bold px-2 py-1 rounded-lg">كل الطلبات</span>
          </div>
          <span className="block text-stone-400 text-xs font-bold mb-1">إجمالي الطلبات</span>
          <span className="text-2xl font-black text-stone-800">{totalOrders} طلب</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[11px] text-amber-600 bg-amber-50 font-bold px-2 py-1 rounded-lg">بحاجة لتجهيز</span>
          </div>
          <span className="block text-stone-400 text-xs font-bold mb-1">طلبات قيد الانتظار</span>
          <span className="text-2xl font-black text-stone-800">{pendingOrders} طلب</span>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-[11px] text-stone-600 bg-stone-150 font-bold px-2 py-1 rounded-lg">نشط بالكتالوج</span>
          </div>
          <span className="block text-stone-400 text-xs font-bold mb-1">المنتجات المتوفرة</span>
          <span className="text-2xl font-black text-stone-800">{activeProducts} منتج</span>
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 overflow-hidden">

        <div className="flex justify-between items-center pb-4 mb-6 border-b border-stone-100">
          <h3 className="text-lg font-black text-stone-850">آخر الطلبات المستلمة</h3>
          <Link to="/admin/orders" className="text-xs text-primary font-bold hover:underline">
            عرض كل الطلبات
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-stone-400 font-medium">
            لا توجد طلبات مسجلة حالياً في النظام.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold">
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">المجموع</th>
                  <th className="py-3 px-4">حالة الدفع</th>
                  <th className="py-3 px-4">حالة الطلب</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-stone-700 text-xs">
                      <Link to="/admin/orders" className="hover:text-primary hover:underline">
                        {order.id.substring(0, 8)}...
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-stone-800">{order.customerName}</div>
                      <div className="text-[11px] text-stone-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-EG') : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-800">
                      {order.totalPrice.toLocaleString('ar-EG')} {currencySymbol}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {order.paymentStatus === 'paid' ? 'تم الدفع' : 'معلق'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColors[order.orderStatus] || ''}`}>
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Store Settings Section */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 mb-8 mt-8">
        <h3 className="text-lg font-black text-stone-850 mb-2">إعدادات المتجر العامة</h3>
        <p className="text-stone-500 text-xs mb-6">تحكم في خيارات المتجر الأساسية مثل العملة الرسمية للموقع.</p>
        
        {settingsError && (
          <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-xs font-bold mb-4">
            {settingsError}
          </div>
        )}
        {settingsSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-750 p-4 rounded-2xl text-xs font-bold mb-4">
            {settingsSuccess}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
          <div className="w-full">
            <label className="block text-stone-600 font-bold text-xs mb-2">العملة الافتراضية للموقع</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-750 font-bold text-sm cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleSaveSettings}
            loading={settingsLoading}
            variant="primary"
            className="py-2.5 px-6 rounded-xl font-black text-xs whitespace-nowrap sm:w-auto w-full"
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
