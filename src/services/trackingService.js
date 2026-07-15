import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

export function subscribeToOrder(orderId, phone, onData, onError) {
  const ref = doc(db, ORDERS_COLLECTION, orderId);

  const unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onError('لم يتم العثور على الطلب. تأكد من رقم الطلب ورقم الهاتف.');
        return;
      }

      const data = snap.data();

      if (data.customerPhone !== phone) {
        onError('لم يتم العثور على الطلب. تأكد من رقم الطلب ورقم الهاتف.');
        return;
      }

      const order = {
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      };

      onData(order);
    },
    (err) => {
      console.error('[trackingService] onSnapshot error:', err);
      onError('حدث خطأ أثناء تحميل بيانات الطلب. يرجى المحاولة مرة أخرى.');
    }
  );

  return unsubscribe;
}
