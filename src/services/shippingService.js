import { db } from '../firebase';
import {
  collection, doc, getDocs, setDoc,
  updateDoc, onSnapshot
} from 'firebase/firestore';

// المحافظات الافتراضية وقيم الشحن المبدئية.
// تنبيه: هذه القيم تعتبر أمثلة افتراضية قابلة للتعديل بالكامل من قبل صاحب المتجر
// سواء مباشرة من لوحة التحكم (Admin Dashboard) أو عبر تعديل هذا الملف لتناسب أسعار الشحن الفعلية.
export const DEFAULT_GOVERNORATES = [
  { id: 'cairo', name: 'القاهرة', price: 40, isActive: true, estimatedDays: '1-2 يوم' },
  { id: 'giza', name: 'الجيزة', price: 40, isActive: true, estimatedDays: '1-2 يوم' },
  { id: 'alexandria', name: 'الإسكندرية', price: 50, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'dakahlia', name: 'الدقهلية', price: 55, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'sharqia', name: 'الشرقية', price: 55, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'qalyubia', name: 'القليوبية', price: 45, isActive: true, estimatedDays: '1-2 يوم' },
  { id: 'kafr_el_sheikh', name: 'كفر الشيخ', price: 60, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'gharbia', name: 'الغربية', price: 55, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'monufia', name: 'المنوفية', price: 50, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'beheira', name: 'البحيرة', price: 55, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'ismailia', name: 'الإسماعيلية', price: 60, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'port_said', name: 'بورسعيد', price: 65, isActive: true, estimatedDays: '3-4 أيام' },
  { id: 'suez', name: 'السويس', price: 65, isActive: true, estimatedDays: '3-4 أيام' },
  { id: 'damietta', name: 'دمياط', price: 60, isActive: true, estimatedDays: '2-3 أيام' },
  { id: 'minya', name: 'المنيا', price: 70, isActive: true, estimatedDays: '3-4 أيام' },
  { id: 'beni_suef', name: 'بني سويف', price: 65, isActive: true, estimatedDays: '3-4 أيام' },
  { id: 'fayoum', name: 'الفيوم', price: 65, isActive: true, estimatedDays: '3-4 أيام' },
  { id: 'assiut', name: 'أسيوط', price: 75, isActive: true, estimatedDays: '3-5 أيام' },
  { id: 'sohag', name: 'سوهاج', price: 75, isActive: true, estimatedDays: '3-5 أيام' },
  { id: 'qena', name: 'قنا', price: 80, isActive: true, estimatedDays: '4-5 أيام' },
  { id: 'luxor', name: 'الأقصر', price: 85, isActive: true, estimatedDays: '4-5 أيام' },
  { id: 'aswan', name: 'أسوان', price: 90, isActive: true, estimatedDays: '5-6 أيام' },
  { id: 'red_sea', name: 'البحر الأحمر', price: 90, isActive: true, estimatedDays: '4-5 أيام' },
  { id: 'matrouh', name: 'مطروح', price: 85, isActive: true, estimatedDays: '4-5 أيام' },
  { id: 'north_sinai', name: 'شمال سيناء', price: 85, isActive: true, estimatedDays: '4-5 أيام' },
  { id: 'south_sinai', name: 'جنوب سيناء', price: 90, isActive: true, estimatedDays: '5-6 أيام' },
  { id: 'new_valley', name: 'الوادي الجديد', price: 95, isActive: false, estimatedDays: '5-7 أيام' },
];

// جلب كل أسعار الشحن real-time
export const subscribeToShippingRates = (callback) => {
  return onSnapshot(collection(db, 'shippingRates'), (snapshot) => {
    const rates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(rates);
  });
};

// تهيئة البيانات الافتراضية (تشغيل مرة واحدة)
export const initializeShippingRates = async () => {
  for (const gov of DEFAULT_GOVERNORATES) {
    await setDoc(doc(db, 'shippingRates', gov.id), gov, { merge: true });
  }
};

// تعديل سعر شحن محافظة
export const updateShippingRate = async (id, data) => {
  return await updateDoc(doc(db, 'shippingRates', id), data);
};

// جلب سعر محافظة معينة
export const getShippingRate = async (governorateId) => {
  const rates = await getDocs(collection(db, 'shippingRates'));
  const rate = rates.docs.find(d => d.id === governorateId);
  return rate ? { id: rate.id, ...rate.data() } : null;
};
