import { BRAND } from '../config/brand';

// تنظيف رقم التليفون المصري — يتعامل مع كل الصيغ
export const sanitizeEgyptianPhone = (phone) => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('20')) return cleaned;
  if (cleaned.startsWith('0')) return '2' + cleaned;
  if (cleaned.startsWith('1')) return '20' + cleaned;
  return '20' + cleaned;
};

// فتح واتساب مع fallback لو الـ popup اتبلوك
export const sendWhatsAppMessage = (phoneNumber, message) => {
  const phone = sanitizeEgyptianPhone(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encodedMessage}`;
  
  const newTab = window.open(url, '_blank');
  
  // Fallback لو المتصفح بلوك الـ popup
  if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
    return { success: false, url }; // الـ caller هيعرض الـ url يدوياً
  }
  return { success: true, url };
};

// إنشاء رابط تأكيد الطلب للعميل لإرساله للمتجر
export const getCustomerWhatsAppConfirmLink = (order, currencySymbol = 'ج.م') => {
  const storePhone = import.meta.env.VITE_STORE_WHATSAPP_NUMBER || BRAND.whatsappNumberRaw;
  const phone = sanitizeEgyptianPhone(storePhone);
  
  const message = `
🌿 *تأكيد طلب من ${BRAND.nameArabic}*

أهلاً، أود تأكيد طلبي بالتفاصيل التالية:

📋 *رقم الطلب:* #${order.id.substring(0, 8)}
👤 *الاسم:* ${order.customerName}
📞 *الهاتف:* ${order.customerPhone}
📍 *العنوان:* ${order.customerAddress} (${order.governorate || ''})

📦 *المنتجات المطلوبة:*
${order.items.map(i => `• ${i.name} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString('ar-EG')} ${currencySymbol}`).join('\n')}

🚚 *تكلفة الشحن:* ${order.shippingCost || 0} ${currencySymbol}
💵 *الإجمالي الكلي:* ${order.totalPrice.toLocaleString('ar-EG')} ${currencySymbol}

أرجو تأكيد الطلب وتجهيزه للشحن 🙏
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

// رسائل لكل حالة
export const ORDER_STATUS_MESSAGES = {
  // تأكيد الطلب للعميل (فور الشراء)
  confirmed: (order, currencySymbol = 'ج.م') => `
🌿 *${BRAND.nameArabic}*

أهلاً ${order.customerName}! 😊

✅ تم استلام طلبك بنجاح!
رقم طلبك: *#${order.id.substring(0, 8)}*

📦 *المنتجات:*
${order.items.map(i => `• ${i.name} × ${i.quantity} — ${(i.price * i.quantity).toLocaleString('ar-EG')} ${currencySymbol}`).join('\n')}

🚚 *الشحن إلى:* ${order.governorate || ''}
💰 *سعر الشحن:* ${order.shippingCost || 0} ${currencySymbol}
💵 *الإجمالي:* ${order.totalPrice.toLocaleString('ar-EG')} ${currencySymbol}
💳 *الدفع:* ${
    order.paymentMethod === 'whatsapp'
      ? 'تأكيد عبر واتساب 💬'
      : (order.paymentMethod === 'cod' || order.paymentMethod === 'cash')
      ? 'كاش عند الاستلام 💵'
      : 'أونلاين ✅'
  }

هنتواصل معك قريباً لتأكيد موعد التوصيل 🙏
  `.trim(),

  processing: (order, currencySymbol = 'ج.م') => `
✅ *${BRAND.nameArabic}*

أهلاً ${order.customerName}! 🌿

طلبك رقم *#${order.id.substring(0, 8)}* قيد التجهيز دلوقتي.

📦 *المنتجات:*
${order.items.map(i => `• ${i.name} × ${i.quantity}`).join('\n')}

💰 *الإجمالي:* ${order.totalPrice} ${currencySymbol}
🚚 *الشحن إلى:* ${order.governorate || 'غير محدد'}

هنبعتلك رسالة تانية لما يتشحن. شكراً لثقتك! 🙏
  `.trim(),

  shipped: (order, currencySymbol = 'ج.م') => `
🚚 *${BRAND.nameArabic}*

أهلاً ${order.customerName}! 🌿

طلبك رقم *#${order.id.substring(0, 8)}* في الطريق إليك الآن!

📍 *عنوان التوصيل:* ${order.customerAddress}
⏱ *وقت التوصيل المتوقع:* خلال 1-3 أيام عمل

${
  order.paymentMethod === 'whatsapp'
    ? '💬 *طريقة الدفع:* تأكيد وتنسيق الدفع عبر واتساب'
    : (order.paymentMethod === 'cod' || order.paymentMethod === 'cash')
    ? `💵 *طريقة الدفع:* كاش عند الاستلام (${order.totalPrice} ${currencySymbol})`
    : '✅ *الدفع:* تم الدفع إلكترونياً'
}

لأي استفسار تواصل معنا: wa.me/${import.meta.env.VITE_STORE_WHATSAPP_NUMBER || BRAND.whatsappNumberRaw}
  `.trim(),

  delivered: (order) => `
🎉 *${BRAND.nameArabic}*

أهلاً ${order.customerName}! 🌿

تم توصيل طلبك رقم *#${order.id.substring(0, 8)}* بنجاح! ✅

نتمنى تكون راضي عن منتجاتنا 🌿
شاركنا رأيك وقيّم تجربتك من خلال:
🔗 ${import.meta.env.VITE_SITE_URL || 'ogail-store.netlify.app'}/track-order

شكراً لاختيارك ${BRAND.nameArabic}! 💚
  `.trim(),

  cancelled: (order) => `
❌ *${BRAND.nameArabic}*

أهلاً ${order.customerName}،

للأسف تم إلغاء طلبك رقم *#${order.id.substring(0, 8)}*.

للاستفسار أو إعادة الطلب:
📞 تواصل معنا: wa.me/${import.meta.env.VITE_STORE_WHATSAPP_NUMBER || BRAND.whatsappNumberRaw}

نعتذر عن أي إزعاج 🙏
  `.trim(),
};

// إشعار العميل
export const notifyCustomer = (order, status, currencySymbol = 'ج.م') => {
  const generator = ORDER_STATUS_MESSAGES[status];
  if (!generator || !order.customerPhone) return { success: false };
  const message = generator(order, currencySymbol);
  return sendWhatsAppMessage(order.customerPhone, message);
};

// إشعار الأدمن بطلب جديد
export const notifyAdminNewOrder = (order, currencySymbol = 'ج.م') => {
  const adminPhone = import.meta.env.VITE_STORE_WHATSAPP_NUMBER || BRAND.whatsappNumberRaw; // ← رقم واتساب الأدمن
  const message = `
🔔 *طلب جديد على ${BRAND.nameArabic}!*

👤 *العميل:* ${order.customerName}
📞 *التليفون:* ${order.customerPhone}
📍 *العنوان:* ${order.customerAddress}
🏙 *المحافظة:* ${order.governorate || 'غير محدد'}

📦 *المنتجات:*
${order.items.map(i => `• ${i.name} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString('ar-EG')} ج.م`).join('\n')}

🚚 *الشحن:* ${order.shippingCost || 0} ج.م
💰 *الإجمالي:* ${order.totalPrice.toLocaleString('ar-EG')} ج.م
💳 *الدفع:* ${
    order.paymentMethod === 'whatsapp'
      ? 'تأكيد عبر واتساب 💬'
      : (order.paymentMethod === 'cod' || order.paymentMethod === 'cash')
      ? 'كاش عند الاستلام 💵'
      : 'أونلاين (سابق)'
  }

⏰ ${new Date().toLocaleString('ar-EG')}
  `.trim();

  return sendWhatsAppMessage(adminPhone, message);
};
