import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

/**
 * Submits a new order to Firestore and atomically deducts stock
 * using runTransaction to prevent race conditions.
 * Throws an error with a clear Arabic message if stock is insufficient.
 */
export const createOrder = async (orderData) => {
  try {
    const orderId = await runTransaction(db, async (transaction) => {
      // ── Step 1: Read all product documents inside the transaction ──
      const productRefs = [];
      const productSnaps = [];

      for (const item of orderData.items) {
        const ref = doc(db, PRODUCTS_COLLECTION, item.id);
        const snap = await transaction.get(ref);

        if (!snap.exists()) {
          throw new Error(`المنتج "${item.name}" غير موجود في قاعدة البيانات.`);
        }

        const currentStock = snap.data().stock ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `الكمية المطلوبة من "${item.name}" غير متوفرة في المخزون. المتاح: ${currentStock} وحدة فقط.`
          );
        }

        productRefs.push(ref);
        productSnaps.push({ snap, item });
      }

      // ── Step 2: Write the new order document ──
      const orderRef = doc(collection(db, ORDERS_COLLECTION));
      transaction.set(orderRef, {
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        governorate: orderData.governorate || '',
        shippingCost: orderData.shippingCost || 0,
        items: orderData.items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        totalPrice: Number(orderData.totalPrice),
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || 'pending',
        orderStatus: orderData.orderStatus || 'pending',
        createdAt: serverTimestamp(),
      });

      // ── Step 3: Deduct stock for each product ──
      for (const { snap, item } of productSnaps) {
        const currentStock = snap.data().stock ?? 0;
        const newStock = currentStock - item.quantity;
        const updatePayload = { stock: newStock };

        // Auto-mark unavailable when stock hits zero
        if (newStock === 0) {
          updatePayload.isAvailable = false;
        }

        transaction.update(doc(db, PRODUCTS_COLLECTION, item.id), updatePayload);
      }

      return orderRef.id;
    });

    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error; // Re-throw so Checkout.jsx can display the exact Arabic message
  }
};

/**
 * Fetch all store orders for the administrator dashboard.
 */
export const getOrders = async () => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      orders.push({ id: docSnap.id, ...data, createdAt });
    });
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Update the status of a specific order.
 */
export const updateOrderStatus = async (orderId, orderStatus) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { orderStatus });
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    throw error;
  }
};

/**
 * Update the payment status of a specific order.
 */
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { paymentStatus });
  } catch (error) {
    console.error(`Error updating payment status for ${orderId}:`, error);
    throw error;
  }
};
