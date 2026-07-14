import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

/**
 * Submits a new order to the Firestore database.
 */
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      items: orderData.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      })),
      totalPrice: Number(orderData.totalPrice),
      paymentMethod: orderData.paymentMethod, // 'cod' | 'whatsapp'
      paymentStatus: orderData.paymentStatus || 'pending', // 'pending' | 'paid'
      orderStatus: orderData.orderStatus || 'pending', // 'pending' | 'processing' | 'shipped' | 'delivered'
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
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
