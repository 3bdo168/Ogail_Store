import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import * as productService from '../services/productService';

export const useProducts = (autoFetch = false) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState(null);

  // Real-time listener for products
  useEffect(() => {
    setLoading(true);
    let q;
    if (autoFetch === true) {
      // For storefront: only available products
      q = query(
        collection(db, 'products'),
        where('isAvailable', '==', true),
        orderBy('createdAt', 'desc')
      );
    } else {
      // For admin: all products
      q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
        }));
        setProducts(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Realtime products error:', err);
        setError('حدث خطأ في تحميل المنتجات');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [autoFetch]);

  // One-time fetch (for manual refresh if needed)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل المنتجات. الرجاء المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoadingProduct(true);
    setErrorProduct(null);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
      return data;
    } catch (err) {
      setErrorProduct('فشل تحميل تفاصيل المنتج.');
      console.error(err);
      throw err;
    } finally {
      setLoadingProduct(false);
    }
  }, []);

  const addProduct = async (productData) => {
    try {
      const id = await productService.createProduct(productData);
      // No manual refresh needed — onSnapshot handles it
      return id;
    } catch (err) {
      console.error(err);
      throw new Error('فشل إضافة المنتج.');
    }
  };

  const editProduct = async (id, productData) => {
    try {
      await productService.updateProduct(id, productData);
      // No manual refresh needed — onSnapshot handles it
    } catch (err) {
      console.error(err);
      throw new Error('فشل تعديل المنتج.');
    }
  };

  const removeProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      // No manual refresh needed — onSnapshot handles it
    } catch (err) {
      console.error(err);
      throw new Error('فشل حذف المنتج.');
    }
  };

  // فئات المنتجات الافتراضية المتاحة بالمتجر.
  // تنبيه: هذه القائمة ثابتة في الكود (Static List) وتظهر كخيارات عند إضافة/تعديل المنتجات،
  // ويمكن لصاحب المتجر أو المطور تعديل هذه المصفوفة لإضافة أو تغيير الأقسام.
  const categories = ['أعشاب', 'توابل', 'زيوت', 'بذور', 'خلطات'];

  return {
    products,
    loading,
    error,
    product,
    loadingProduct,
    errorProduct,
    categories,
    fetchProducts,
    fetchProductById,
    addProduct,
    editProduct,
    removeProduct,
  };
};
