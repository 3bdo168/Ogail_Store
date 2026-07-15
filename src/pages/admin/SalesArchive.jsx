import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  setDoc,
  onSnapshot 
} from 'firebase/firestore';
import * as XLSX from 'xlsx';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { Calendar, Download, RefreshCw, Filter, Shield, Settings, FileSpreadsheet } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const SalesArchive = () => {
  const { currencySymbol } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Export Settings State
  const [autoExportEnabled, setAutoExportEnabled] = useState(false);
  const [exportFrequency, setExportFrequency] = useState('daily');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Generated Archives State
  const [archives, setArchives] = useState([]);
  const [loadingArchives, setLoadingArchives] = useState(true);

  // Fetch all orders once on mount
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const fetched = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
          fetched.push({ id: docSnap.id, ...data, createdAt });
        });
        setOrders(fetched);
      } catch (err) {
        console.error('Error fetching orders for archive:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch Auto Export Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'storeConfig');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setAutoExportEnabled(data.salesExportEnabled || false);
          setExportFrequency(data.salesExportFrequency || 'daily');
        }
      } catch (err) {
        console.error('Error fetching auto export settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Listen to Sales Archives Firestore Collection
  useEffect(() => {
    const q = query(collection(db, 'salesArchives'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
        docs.push({ id: docSnap.id, ...data, createdAt });
      });
      setArchives(docs);
      setLoadingArchives(false);
    }, (err) => {
      console.error('Error subscribing to sales archives:', err);
      setLoadingArchives(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Save Auto Export Settings
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSettingsSuccess('');
    try {
      const docRef = doc(db, 'settings', 'storeConfig');
      await setDoc(docRef, {
        salesExportEnabled: autoExportEnabled,
        salesExportFrequency: exportFrequency
      }, { merge: true });
      setSettingsSuccess('تم حفظ إعدادات التصدير التلقائي بنجاح!');
      setTimeout(() => setSettingsSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('فشل حفظ الإعدادات، يرجى التحقق من الصلاحيات.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    // Date checks
    const orderTime = new Date(order.createdAt).getTime();
    if (startDate) {
      const startMs = new Date(startDate).setHours(0, 0, 0, 0);
      if (orderTime < startMs) return false;
    }
    if (endDate) {
      const endMs = new Date(endDate).setHours(23, 59, 59, 999);
      if (orderTime > endMs) return false;
    }

    // Status check
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  // Client-Side Excel Export
  const handleClientExport = () => {
    if (filteredOrders.length === 0) {
      alert('لا توجد مبيعات مطابقة للفلترة الحالية لتصديرها.');
      return;
    }

    // Form data array
    const dataToExport = filteredOrders.map((order) => {
      const productsStr = order.items
        ? order.items.map((i) => `${i.name} (${i.quantity})`).join('، ')
        : '';
      return {
        'رقم الطلب': order.id,
        'اسم العميل': order.customerName || '',
        'رقم الهاتف': order.customerPhone || '',
        'المنتجات': productsStr,
        'الإجمالي': `${order.totalPrice} ${currencySymbol}`,
        'طريقة الدفع': order.paymentMethod === 'cod' ? 'كاش عند الاستلام' : (order.paymentMethod || ''),
        'حالة الطلب': order.orderStatus || '',
        'التاريخ': new Date(order.createdAt).toLocaleString('ar-EG'),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المبيعات المفلترة');

    // Trigger download
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `sales_export_${dateStr}.xlsx`);
  };

  const statusLabels = {
    pending: 'قيد المراجعة',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  return (
    <div className="w-full text-right font-cairo">
      
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-stone-850 mb-2">أرشيف وتصدير المبيعات</h1>
        <p className="text-stone-500">فلترة وتصدير تقارير المبيعات يدوياً أو تفعيل جدولة التصدير التلقائي.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Manual Filter & Export */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Filter Panel */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <span>تصفية وتحديد البيانات المطلوبة</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">من تاريخ</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">إلى تاريخ</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">حالة الطلب</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 text-sm font-bold cursor-pointer"
                >
                  <option value="all">كل الحالات</option>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-stone-50 pt-6">
              <span className="text-sm font-bold text-stone-500">
                عدد الطلبات المحددة: <span className="text-primary text-base font-black">{filteredOrders.length}</span>
              </span>
              <Button
                variant="primary"
                onClick={handleClientExport}
                className="flex items-center gap-2 py-3 px-6 rounded-2xl font-bold shadow-md shadow-primary/10"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>تصدير إلى Excel</span>
              </Button>
            </div>
          </div>

          {/* Orders Preview */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-base font-bold text-stone-850 mb-4">معاينة الطلبات المفلترة</h3>
            
            {loadingOrders ? (
              <Loader message="جاري جلب الطلبات..." />
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                لا توجد طلبات مطابقة للفلترة المحددة.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-400 font-bold">
                      <th className="py-2.5 px-3">الطلب</th>
                      <th className="py-2.5 px-3">العميل</th>
                      <th className="py-2.5 px-3">الإجمالي</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0, 15).map((order) => (
                      <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-stone-800">#{order.id.slice(0,8)}</td>
                        <td className="py-2 px-3 text-stone-600">{order.customerName}</td>
                        <td className="py-2 px-3 font-black text-primary">{order.totalPrice} {currencySymbol}</td>
                        <td className="py-2 px-3 text-stone-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-lg font-bold text-[10px]">
                            {statusLabels[order.orderStatus] || order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length > 15 && (
                  <p className="text-center text-[10px] text-stone-400 mt-4">
                    يتم عرض أول 15 طلباً فقط في المعاينة. سيشمل تصدير Excel كل المبيعات المفلترة ({filteredOrders.length} طلب).
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Auto Export Schedule & Archive files list */}
        <div className="flex flex-col gap-8">
          
          {/* Auto Export Config */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>إعدادات الأرشفة التلقائية</span>
            </h2>

            {settingsSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
                {settingsSuccess}
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                <div>
                  <h4 className="text-sm font-bold text-stone-800">تفعيل التصدير التلقائي</h4>
                  <p className="text-stone-400 text-[10px] mt-1">توليد ملفات مبيعات دورية تلقائياً</p>
                </div>
                <input 
                  type="checkbox"
                  checked={autoExportEnabled}
                  onChange={(e) => setAutoExportEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">تكرار التصدير التلقائي</label>
                <select
                  disabled={!autoExportEnabled}
                  value={exportFrequency}
                  onChange={(e) => setExportFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="daily">يومي (كل ليلة الساعة 12:00)</option>
                  <option value="weekly">أسبوعي (كل ليلة أحد)</option>
                  <option value="monthly">شهري (أول يوم من كل شهر)</option>
                </select>
              </div>

              <Button
                variant="primary"
                onClick={handleSaveSettings}
                loading={savingSettings}
                className="w-full py-3 rounded-2xl font-bold text-sm shadow-md shadow-primary/10"
              >
                حفظ الإعدادات المجدولة
              </Button>
            </div>
          </div>

          {/* Previous Automatic Archives Table */}
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <h3 className="text-base font-bold text-stone-850 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>الأرشيفات المتاحة للتحميل</span>
            </h3>

            {loadingArchives ? (
              <Loader message="جاري جلب الأرشيفات..." />
            ) : archives.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-xs leading-relaxed">
                لا توجد أرشيفات منشأة تلقائياً بعد.
                <br />
                <span className="text-[10px] text-stone-300">يتم توليد الأرشيفات تلقائياً عند حلول موعد الجدولة.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {archives.map((archive) => (
                  <div key={archive.id} className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/50 rounded-2xl border border-stone-100 transition-colors">
                    <div className="text-right">
                      <h4 className="text-xs font-bold text-stone-850 truncate max-w-[150px]" title={archive.fileName}>
                        {archive.fileName}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1.5">
                        <span>نوع التصدير:</span>
                        <span className="text-primary font-bold">
                          {archive.frequency === 'daily' ? 'يومي' : archive.frequency === 'weekly' ? 'أسبوعي' : 'شهري'}
                        </span>
                      </p>
                      <p className="text-[9px] text-stone-400 mt-0.5">
                        تاريخ الإنشاء: {new Date(archive.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <a 
                      href={archive.downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-colors"
                      title="تحميل الملف"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SalesArchive;
