import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { uploadImage } from '../../services/cloudinaryService';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { useCurrency } from '../../context/CurrencyContext';

const ManageProducts = () => {
  const { products, loading, addProduct, editProduct, removeProduct, categories } = useProducts(false);
  const { currencySymbol } = useCurrency();

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'أعشاب',
    stock: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  // Filter products by search
  const filteredProducts = products.filter((p) =>
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditInit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      isAvailable: product.isAvailable,
    });
    setSelectedFile(null);
    setImagePreview(product.imageUrl || '');
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: 'أعشاب',
      stock: '',
      description: '',
      imageUrl: '',
      isAvailable: true,
    });
    setSelectedFile(null);
    setImagePreview('');
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.price || !formData.stock) {
      setError('يرجى ملء جميع الحقول المطلوبة (*)');
      return;
    }

    let imageUrl = formData.imageUrl;

    if (selectedFile) {
      setUploading(true);
      try {
        imageUrl = await uploadImage(selectedFile);
      } catch (err) {
        console.error(err);
        setError('فشل رفع الصورة إلى السحابة. يرجى التحقق من الإعدادات.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      if (editingId) {
        await editProduct(editingId, { ...formData, imageUrl });
        setSuccess('تم تعديل المنتج بنجاح!');
      } else {
        await addProduct({ ...formData, imageUrl });
        setSuccess('تم إضافة المنتج الجديد بنجاح!');
      }
      handleCancel();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('فشل حفظ البيانات. تحقق من الصلاحيات والاتصال.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟')) {
      try {
        await removeProduct(id);
        setSuccess('تم حذف المنتج بنجاح!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error(err);
        setError('فشل حذف المنتج.');
      }
    }
  };

  return (
    <div className="w-full text-right">

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-850 mb-2">إدارة كتالوج المنتجات</h1>
          <p className="text-stone-500">إضافة وتعديل وحذف الأعشاب والتوابل والمنتجات.</p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            className="rounded-2xl font-bold py-3 px-6 shadow-md"
          >
            + إضافة منتج جديد
          </Button>
        )}
      </div>

      {/* Success/Error Alerts */}
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

      {/* Add / Edit Form Panel */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-lg mb-10 max-w-4xl mx-auto">
          <h2 className="text-xl font-extrabold text-stone-850 mb-6 pb-3 border-b border-stone-50">
            {editingId ? 'تعديل تفاصيل المنتج' : 'إضافة منتج عطارة جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Right Column (Inputs) */}
            <div className="flex flex-col gap-6">

              <div>
                <label className="block text-stone-650 font-bold text-xs mb-2">اسم المنتج *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="مثال: بابونج بري مجفف"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-650 font-bold text-xs mb-2">السعر ({currencySymbol}) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="120"
                    min="1"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-stone-650 font-bold text-xs mb-2">المخزون (الكمية) *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="50"
                    min="0"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-650 font-bold text-xs mb-2">القسم الرئيسي</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-bold text-sm cursor-pointer"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="h-5 w-5 rounded border-stone-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="isAvailable" className="text-stone-700 font-bold text-sm cursor-pointer select-none">
                  المنتج متوفر للبيع ويظهر في الكتالوج العام
                </label>
              </div>

            </div>

            {/* Left Column (Upload and Description) */}
            <div className="flex flex-col gap-6">

              <div>
                <label className="block text-stone-650 font-bold text-xs mb-2">وصف المنتج</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="اكتب مواصفات المنتج، الفوائد الصحية، وطريقة الاستعمال..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-stone-650 font-bold text-xs mb-2">صورة المنتج</label>

                {/* File picker */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer cursor-pointer border border-stone-200 p-2.5 rounded-2xl bg-stone-50"
                />

                {uploading && <div className="text-xs text-primary font-bold mt-2 animate-pulse">جاري رفع الصورة إلى Cloudinary...</div>}

                {(imagePreview || formData.imageUrl) && (
                  <div className="mt-3 relative h-28 w-28 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 shadow-inner">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview('');
                        setFormData((prev) => ({ ...prev, imageUrl: '' }));
                      }}
                      className="absolute top-1 left-1 bg-rose-600/90 text-white rounded-full p-1 hover:bg-rose-700 transition-colors"
                      title="حذف الصورة"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* CTAs */}
            <div className="md:col-span-2 pt-4 border-t border-stone-100 flex gap-4 justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={uploading}
                className="py-3 px-8 rounded-2xl font-black text-sm"
              >
                {editingId ? 'حفظ التغييرات' : 'إضافة المنتج'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                className="py-3 px-6 rounded-2xl text-stone-600 font-bold text-sm"
              >
                إلغاء
              </Button>
            </div>

          </form>
        </div>
      )}

      {/* Search Bar */}
      {!showForm && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ابحث باسم المنتج أو القسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-12 pl-4 py-3 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-stone-700 font-medium text-sm shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Products Catalog List */}
      {loading ? (
        <Loader message="جاري جلب قائمة المنتجات للإدارة..." />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border border-stone-100 shadow-sm text-stone-400">
          {search ? `لا توجد نتائج لـ "${search}"` : 'كتالوج المنتجات فارغ حالياً، يرجى البدء بإضافة أول منتج.'}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-bold">
                  <th className="py-3 px-4">الصورة</th>
                  <th className="py-3 px-4">المنتج</th>
                  <th className="py-3 px-4">القسم</th>
                  <th className="py-3 px-4">السعر</th>
                  <th className="py-3 px-4">المخزون</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">

                    {/* Photo */}
                    <td className="py-3 px-4">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1596003906949-67221c37965c?auto=format&fit=crop&q=80&w=100'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-bold text-stone-850">{product.name}</td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-500 font-bold text-xs">{product.category}</td>

                    {/* Price — Inline Editable */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={product.price}
                          onBlur={(e) => {
                            const val = Number(e.target.value);
                            if (val > 0 && val !== product.price) {
                              editProduct(product.id, { price: val });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          className="w-20 text-center border border-stone-200 rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none bg-stone-50 hover:bg-white transition-colors"
                          min="1"
                        />
                        <span className="text-xs text-stone-400 mr-1">{currencySymbol}</span>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className={`py-3 px-4 font-bold ${product.stock <= 5 ? 'text-amber-600 font-black' : 'text-stone-600'}`}>
                      {product.stock} وحدة
                    </td>

                    {/* Availability */}
                    <td className="py-3 px-4">
                      {product.isAvailable && product.stock > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-lg text-xs font-bold">نشط</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-lg text-xs font-bold">متوقف / نفذ</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditInit(product)}
                          className="p-2 border border-stone-200 text-stone-600 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5"
                          title="تعديل المنتج"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 border border-stone-200 text-stone-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors font-bold text-xs flex items-center gap-1.5"
                          title="حذف المنتج"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};

export default ManageProducts;
