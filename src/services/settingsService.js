import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// جلب الإعدادات الحالية
export const getStoreSettings = async () => {
  const docRef = doc(db, 'settings', 'store');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data();
  } else {
    // إعدادات افتراضية
    const defaultSettings = { currency: 'EGP' };
    await setDoc(docRef, defaultSettings);
    return defaultSettings;
  }
};

// تحديث العملة الافتراضية
export const updateCurrency = async (currencyCode) => {
  const docRef = doc(db, 'settings', 'store');
  return await setDoc(docRef, { currency: currencyCode }, { merge: true });
};
