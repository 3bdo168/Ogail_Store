import React, { useState, useEffect } from 'react';
import {
  subscribeToShippingRates,
  updateShippingRate,
  initializeShippingRates,
  addShippingRate,
  deleteShippingRate
} from '../../services/shippingService';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';


const ManageShipping = () => {
  const { currencySymbol } = useCurrency();
  const [shippingRates, setShippingRates] = useState([]);
  const [localRates, setLocalRates] = useState({}); // Stores local edits: { [id]: { price, estimatedDays, isActive } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [actionLoading, setActionLoading] = useState(false);

  // Add Governorate Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGov, setNewGov] = useState({
    name: '',
    price: 0,
    estimatedDays: '2-3 أيام',
    isActive: true
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Governorate handler
  const handleDelete = async (id, name) => {
    if (window.confirm(`متأكد إنك عايز تحذف ${name}؟ الإجراء ده مش قابل للتراجع`)) {
      setActionLoading(true);
      setError('');
      setSuccess('');
      try {
        await deleteShippingRate(id);
        // Clear from local edits map if any
        if (localRates[id]) {
          setLocalRates((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }
        setSuccess(`تم حذف محافظة ${name} بنجاح!`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء حذف المحافظة.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Add Governorate submit handler
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newGov.name.trim()) {
      setModalError('اسم المحافظة مطلوب');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      await addShippingRate({
        name: newGov.name.trim(),
        price: Number(newGov.price),
        estimatedDays: newGov.estimatedDays.trim(),
        isActive: newGov.isActive
      });
      setSuccess('تم إضافة المحافظة الجديدة بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
      setIsAddModalOpen(false);
      setNewGov({
        name: '',
        price: 0,
        estimatedDays: '2-3 أيام',
        isActive: true
      });
    } catch (err) {
      console.error(err);
      setModalError('حدث خطأ أثناء إضافة المحافظة.');
    } finally {
      setModalLoading(false);
    }
  };


  // Subscribe to shipping rates in real-time
  useEffect(() => {
    const unsubscribe = subscribeToShippingRates((rates) => {
      setShippingRates(rates);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePriceChange = (id, priceVal) => {
    const rate = shippingRates.find((r) => r.id === id);
    const existingLocal = localRates[id] || {
      price: rate.price,
      estimatedDays: rate.estimatedDays,
      isActive: rate.isActive,
    };
    setLocalRates((prev) => ({
      ...prev,
      [id]: { ...existingLocal, price: Number(priceVal) },
    }));
  };

  const handleDaysChange = (id, daysVal) => {
    const rate = shippingRates.find((r) => r.id === id);
    const existingLocal = localRates[id] || {
      price: rate.price,
      estimatedDays: rate.estimatedDays,
      isActive: rate.isActive,
    };
    setLocalRates((prev) => ({
      ...prev,
      [id]: { ...existingLocal, estimatedDays: daysVal },
    }));
  };

  const handleStatusToggle = async (id, currentActive) => {
    const newStatus = !currentActive;
    
    // Update local state immediately
    const rate = shippingRates.find((r) => r.id === id);
    const existingLocal = localRates[id] || {
      price: rate.price,
      estimatedDays: rate.estimatedDays,
      isActive: rate.isActive,
    };
    setLocalRates((prev) => ({
      ...prev,
      [id]: { ...existingLocal, isActive: newStatus },
    }));

    // Save to Firestore
    try {
      await updateShippingRate(id, { isActive: newStatus });
      setSuccess('تم تحديث حالة المحافظة بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('فشل تحديث حالة المحافظة.');
    }
  };

  // Initialize rates with default values
  const handleInitialize = async () => {
    if (window.confirm('هل أنت متأكد من رغبتك في تهيئة أسعار الشحن الافتراضية؟ سيؤدي ذلك لإضافة أو استعادة المحافظات الـ 27.')) {
      setActionLoading(true);
      setError('');
      setSuccess('');
      try {
        await initializeShippingRates();
        setSuccess('تم تهيئة المحافظات وأسعار الشحن الافتراضية بنجاح!');
        setLocalRates({});
        setTimeout(() => setSuccess(''), 4000);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء تهيئة البيانات.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Save changes for a single row
  const handleSaveRow = async (id) => {
    const edited = localRates[id];
    if (!edited) return; // No changes to save

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateShippingRate(id, {
        price: Number(edited.price),
        estimatedDays: edited.estimatedDays,
        isActive: edited.isActive,
      });
      
      // Remove from dirty localRates map
      setLocalRates((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      setSuccess('تم حفظ التغييرات للمحافظة بنجاح!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ التغييرات.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save all changes across all rows at once
  const handleSaveAll = async () => {
    const ids = Object.keys(localRates);
    if (ids.length === 0) {
      alert('لا توجد تغييرات معلقة لحفظها.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      for (const id of ids) {
        const edited = localRates[id];
        await updateShippingRate(id, {
          price: Number(edited.price),
          estimatedDays: edited.estimatedDays,
          isActive: edited.isActive,
        });
      }
      setLocalRates({});
      setSuccess('تم حفظ جميع تعديلات أسعار الشحن بنجاح!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحديث كافة أسعار الشحن.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered list based on state
  const displayedRates = shippingRates.filter((rate) => {
    const localVal = localRates[rate.id];
    const isActive = localVal ? localVal.isActive : rate.isActive;
    
    if (filter === 'active') return isActive === true;
    if (filter === 'inactive') return isActive === false;
    return true;
  });

  const hasUnsavedChanges = Object.keys(localRates).length > 0;

  return (
    <div className="w-full text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-850 mb-2">تسعير الشحن والتوصيل</h1>
          <p className="text-stone-500">إدارة تكلفة شحن وتوصيل الطلبات حسب كل محافظة مصرية.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl font-bold py-2.5 px-4 text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Plus size={16} className="ml-1.5" />
            إضافة محافظة جديدة
          </Button>
          <Button
            variant="outline"
            onClick={handleInitialize}
            loading={actionLoading}
            className="rounded-2xl border-stone-200 text-stone-600 font-bold hover:bg-stone-50 py-2.5 px-4 text-xs sm:text-sm"
          >
            <RefreshCw size={16} className="ml-1.5" />
            تهيئة المحافظات الافتراضية
          </Button>
          {hasUnsavedChanges && (
            <Button
              variant="primary"
              onClick={handleSaveAll}
              loading={actionLoading}
              className="rounded-2xl font-black shadow-md py-2.5 px-5 text-xs sm:text-sm"
            >
              <Save size={16} className="ml-1.5" />
              تحديث الكل ({Object.keys(localRates).length})
            </Button>
          )}
        </div>

      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-750 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-750 p-4 rounded-2xl text-sm font-bold mb-6 flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      {!loading && shippingRates.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
              filter === 'all'
                ? 'bg-stone-800 border-stone-800 text-white shadow'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            الكل ({shippingRates.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
              filter === 'active'
                ? 'bg-primary border-primary text-white shadow'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            نشطة ({shippingRates.filter(r => r.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
              filter === 'inactive'
                ? 'bg-rose-600 border-rose-600 text-white shadow'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            متوقفة ({shippingRates.filter(r => !r.isActive).length})
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <Loader message="جاري جلب أسعار شحن المحافظات..." />
      ) : shippingRates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-stone-100 shadow-sm text-stone-400">
          <p className="mb-4">لا توجد محافظات أو أسعار شحن حالياً.</p>
          <Button variant="primary" onClick={initializeShippingRates}>
            تهيئة المحافظات الافتراضية
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold">
                  <th className="py-4 px-4 font-bold text-stone-400">المحافظة</th>
                  <th className="py-4 px-4 font-bold text-stone-400">سعر الشحن ({currencySymbol})</th>
                  <th className="py-4 px-4 font-bold text-stone-400">وقت التوصيل المتوقع</th>
                  <th className="py-4 px-4 font-bold text-stone-400">الحالة</th>
                  <th className="py-4 px-4 text-center font-bold text-stone-400">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {displayedRates.map((rate) => {
                  const localVal = localRates[rate.id] || {};
                  const price = localVal.price !== undefined ? localVal.price : rate.price;
                  const estimatedDays = localVal.estimatedDays !== undefined ? localVal.estimatedDays : rate.estimatedDays;
                  const isActive = localVal.isActive !== undefined ? localVal.isActive : rate.isActive;
                  const isDirty = localRates[rate.id] !== undefined;

                  return (
                    <tr
                      key={rate.id}
                      className={`border-b border-stone-50 hover:bg-stone-50/50 transition-colors ${
                        isDirty ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-4 px-4 font-bold text-stone-800">{rate.name}</td>

                      {/* Shipping Cost */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => handlePriceChange(rate.id, e.target.value)}
                            className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none bg-stone-50 focus:bg-white transition-colors"
                            min="0"
                          />
                          <span className="text-xs text-stone-400">{currencySymbol}</span>
                        </div>
                      </td>

                      {/* Delivery Days */}
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          value={estimatedDays}
                          onChange={(e) => handleDaysChange(rate.id, e.target.value)}
                          className="w-32 text-center border border-stone-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none bg-stone-50 focus:bg-white transition-colors"
                        />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleStatusToggle(rate.id, isActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-150'
                          }`}
                        >
                          {isActive ? 'نشطة' : 'متوقفة'}
                        </button>
                      </td>

                      {/* Row Action */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            disabled={!isDirty}
                            onClick={() => handleSaveRow(rate.id)}
                            className={`p-2 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1 border ${
                              isDirty
                                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 cursor-pointer'
                                : 'border-stone-100 text-stone-300 cursor-not-allowed'
                            }`}
                            title="حفظ تعديل المحافظة"
                          >
                            <Save size={14} />
                            حفظ
                          </button>
                          <button
                            onClick={() => handleDelete(rate.id, rate.name)}
                            className="p-2 rounded-xl transition-all font-bold text-xs inline-flex items-center gap-1 border border-rose-100 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="حذف المحافظة"
                          >
                            <Trash2 size={14} />
                            حذف
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
         </div>
      )}
      {/* Modal لعملية إضافة محافظة جديدة */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-100 shadow-2xl overflow-hidden p-6 text-right relative">
            <h3 className="text-xl font-black text-stone-850 mb-1">إضافة محافظة جديدة</h3>
            <p className="text-stone-400 text-xs mb-6">أدخل تفاصيل المحافظة الجديدة لتفعيل خيارات الشحن لها.</p>

            {modalError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-750 p-3 rounded-2xl text-xs font-bold mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-stone-600 font-bold text-xs mb-2">اسم المحافظة *</label>
                <input
                  type="text"
                  required
                  value={newGov.name}
                  onChange={(e) => setNewGov(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: أسوان"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-750 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-xs mb-2">سعر الشحن ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newGov.price}
                  onChange={(e) => setNewGov(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-750 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-xs mb-2">مدة التوصيل المتوقعة *</label>
                <input
                  type="text"
                  required
                  value={newGov.estimatedDays}
                  onChange={(e) => setNewGov(prev => ({ ...prev, estimatedDays: e.target.value }))}
                  placeholder="مثال: 2-3 أيام"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-750 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-bold text-xs mb-2">الحالة *</label>
                <select
                  value={newGov.isActive ? 'true' : 'false'}
                  onChange={(e) => setNewGov(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-750 font-bold text-sm cursor-pointer"
                >
                  <option value="true">نشطة</option>
                  <option value="false">متوقفة</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-stone-100 mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={modalLoading}
                  className="py-2.5 px-6 rounded-2xl font-black text-xs"
                >
                  حفظ المحافظة
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewGov({ name: '', price: 0, estimatedDays: '2-3 أيام', isActive: true });
                    setModalError('');
                  }}
                  className="py-2.5 px-4 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-500 hover:text-stone-700 font-bold text-xs transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


export default ManageShipping;
