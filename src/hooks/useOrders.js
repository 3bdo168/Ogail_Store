import { useState, useEffect, useCallback } from 'react';
import * as orderService from '../services/orderService';

export const useOrders = (autoFetch = false) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل الطلبات.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitOrder = async (orderData) => {
    // Pass through the original error message (stock shortage, permissions, etc.)
    return await orderService.createOrder(orderData);
  };

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, orderStatus);
      // Update local state statefully
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, orderStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      throw new Error('فشل تحديث حالة الطلب.');
    }
  };

  const updatePayment = async (orderId, paymentStatus) => {
    try {
      await orderService.updatePaymentStatus(orderId, paymentStatus);
      // Update local state statefully
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, paymentStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      throw new Error('فشل تحديث حالة الدفع.');
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchOrders();
    }
  }, [autoFetch, fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    submitOrder,
    updateStatus,
    updatePayment,
  };
};
