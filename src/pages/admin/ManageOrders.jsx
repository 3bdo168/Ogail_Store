import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import Loader from '../../components/ui/Loader';
import { notifyCustomer } from '../../services/whatsappService';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const ManageOrders = () => {
  const { orders, loading, updateStatus, updatePayment, fetchOrders } = useOrders(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    processing: 'bg-blue-50 text-blue-700 border-blue-100',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const statusLabels = {
    pending: 'قيد المراجعة',
    processing: 'جاري التجهيز',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      // 1. Update status in Firestore
      await updateDoc(doc(db, 'orders', order.id), {
        orderStatus: newStatus,
        lastNotifiedStatus: order.lastNotifiedStatus || null,
      });

      // 2. Ask the admin
      const alreadyNotified = order.lastNotifiedStatus === newStatus;
      const shouldNotify = window.confirm(
        `✅ تم تحديث الحالة إلى "${statusLabels[newStatus]}"\n\n` +
        `${alreadyNotified ? '⚠️ تم إرسال هذا الإشعار من قبل!\n\n' : ''}` +
        `هل تريد إرسال إشعار واتساب للعميل ${order.customerName}؟`
      );

      if (shouldNotify) {
        const result = notifyCustomer(order, newStatus);
        
        // 3. Update lastNotifiedStatus in Firestore
        await updateDoc(doc(db, 'orders', order.id), {
          lastNotifiedStatus: newStatus,
        });

        // 4. Fallback if popup blocked
        if (!result.success) {
          alert(`لم يتم فتح نافذة واتساب تلقائياً. يرجى فتح الرابط يدوياً:\n\n${result.url}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحديث الطلب');
    } finally {
      fetchOrders();
    }
  };

  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    try {
      await updatePayment(orderId, newPaymentStatus);
    } catch (err) {
      alert('فشل تحديث حالة الدفع.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customerPhone.includes(searchQuery) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full text-right">
      
      {/* Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-stone-850 mb-2">إدارة طلبات العملاء</h1>
        <p className="text-stone-500">متابعة الشحنات وتعديل حالة الدفع والتسليم للطلبات المسجلة.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm mb-10 flex flex-col lg:flex-row gap-6 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-stone-700 font-medium"
          />
          <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
              statusFilter === 'all'
                ? 'bg-stone-800 border-stone-800 text-white'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            الكل
          </button>
          {Object.keys(statusLabels).map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                statusFilter === key
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {statusLabels[key]}
            </button>
          ))}
        </div>

      </div>

      {/* Orders List */}
      {loading ? (
        <Loader message="جاري جلب الطلبات..." />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border border-stone-100 shadow-sm text-stone-400">
          لا توجد طلبات مطابقة لمعايير التصفية الحالية.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-100 hover:border-stone-200 shadow-sm hover:shadow-md transition-all-300 p-6"
            >
              
              {/* Order Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-stone-55 gap-4">
                <div>
                  <span className="text-stone-400 text-xs font-bold">رقم الطلب:</span>
                  <span className="font-mono font-bold text-stone-750 text-sm ml-4 mr-1">{order.id}</span>
                  <span className="text-stone-400 text-xs font-bold block sm:inline">
                    بتاريخ: {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-EG') : 'N/A'}
                  </span>
                </div>
                
                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Payment update */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-xs font-bold">الدفع:</span>
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}
                    >
                      <option value="pending">معلق (غير مدفوع)</option>
                      <option value="paid">تم الدفع</option>
                    </select>
                  </div>

                  {/* Order Status update */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-xs font-bold">الحالة:</span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ${statusColors[order.orderStatus] || ''}`}
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Direct WhatsApp notify button */}
                  {['processing', 'shipped', 'delivered', 'cancelled'].includes(order.orderStatus) && (
                    <button
                      onClick={() => {
                        const result = notifyCustomer(order, order.orderStatus);
                        if (!result.success) {
                          alert(`لم يتم فتح نافذة واتساب تلقائياً. يرجى فتح الرابط يدوياً:\n\n${result.url}`);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      title={`إرسال إشعار واتساب — آخر إشعار: ${statusLabels[order.lastNotifiedStatus] || 'لم يُرسل'}`}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      إشعار
                      {order.lastNotifiedStatus && (
                        <span className="text-emerald-200 text-[10px] mr-1">
                          ({statusLabels[order.lastNotifiedStatus]})
                        </span>
                      )}
                    </button>
                  )}

                </div>
              </div>

              {/* Order Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Column 1: Customer Details (Col 1-5) */}
                <div className="lg:col-span-5 bg-stone-50/50 p-4 rounded-2xl border border-stone-100 text-xs flex flex-col gap-2.5">
                  <h4 className="font-extrabold text-stone-800 text-sm mb-1.5">بيانات الشحن</h4>
                  <div>
                    <span className="text-stone-400 font-bold">الاسم:</span>
                    <span className="font-bold text-stone-700 mr-2">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold">الهاتف:</span>
                    <span className="font-bold text-stone-700 mr-2 font-mono" dir="ltr">{order.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold">العنوان:</span>
                    <span className="font-bold text-stone-700 mr-2">{order.customerAddress}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-bold">طريقة الدفع:</span>
                    <span className={`font-bold mr-2 px-2 py-0.5 rounded-lg text-xs ${
                      order.paymentMethod === 'whatsapp'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : (order.paymentMethod === 'cod' || order.paymentMethod === 'cash')
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {order.paymentMethod === 'whatsapp' ? 'تأكيد عبر واتساب 💬' : (order.paymentMethod === 'cod' || order.paymentMethod === 'cash') ? 'الدفع عند الاستلام 💵' : 'دفع إلكتروني'}
                    </span>
                  </div>
                  <div className="border-t border-stone-100 pt-2.5 mt-1 flex justify-between text-sm font-bold text-stone-850">
                    <span>إجمالي القيمة:</span>
                    <span className="text-primary-dark font-black">{order.totalPrice.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>

                {/* Column 2: Items Purchased (Col 6-12) */}
                <div className="lg:col-span-7 flex flex-col gap-3">
                  <h4 className="font-extrabold text-stone-800 text-sm">الأصناف المطلوبة</h4>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center py-2 border-b border-stone-50 text-xs">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-stone-50 border border-stone-100 flex-shrink-0">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=100'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-bold text-stone-850 line-clamp-1">{item.name}</h5>
                          <span className="text-[11px] text-stone-400 font-bold">سعر الوحدة: {item.price} ج.م</span>
                        </div>
                        <span className="font-black text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                          الكمية: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageOrders;
