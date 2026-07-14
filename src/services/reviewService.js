import { db } from '../firebase';
import {
  collection, addDoc, query, where,
  getDocs, orderBy, serverTimestamp
} from 'firebase/firestore';

// إضافة تقييم جديد
export const addReview = async (reviewData) => {
  try {
    // تحقق إن العميل اشترى المنتج فعلاً من خلال الطلبات المكتملة (delivered)
    const orderQuery = query(
      collection(db, 'orders'),
      where('customerPhone', '==', reviewData.customerPhone),
      where('orderStatus', '==', 'delivered')
    );
    const orders = await getDocs(orderQuery);
    
    const bought = orders.docs.some(docSnap => {
      const items = docSnap.data().items || [];
      return items.some(item => item.productId === reviewData.productId);
    });

    const docRef = await addDoc(collection(db, 'reviews'), {
      productId: reviewData.productId,
      orderId: reviewData.orderId || '',
      customerPhone: reviewData.customerPhone,
      customerName: reviewData.customerName,
      rating: Number(reviewData.rating) || 5,
      comment: reviewData.comment || '',
      serviceRating: Number(reviewData.serviceRating) || 5,
      deliveryRating: Number(reviewData.deliveryRating) || 5,
      isVerified: bought,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// جلب تقييمات منتج معين
export const getProductReviews = async (productId) => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      return { id: docSnap.id, ...data, createdAt };
    });
  } catch (error) {
    console.error(`Error getting reviews for product ${productId}:`, error);
    throw error;
  }
};

// حساب متوسط التقييم
export const getProductRating = (reviews) => {
  if (!reviews || !reviews.length) return { avg: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avg = sum / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
};
