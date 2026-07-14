# تقرير فحص مشروع Ogail Store (Audit Report)

تم فحص مشروع **Ogail Store** بالكامل للبحث عن البيانات الحساسة والهاردكودد (hardcoded)، إشارات الهوية البصرية والاسم (Branding)، معلومات العمل (Business Data)، والبيانات الشخصية (Personal Data).

فيما يلي تفاصيل نتائج الفحص مصنفة ومصنفة حسب الترتيب المطلوب.

---

## 1. الأسرار والمفاتيح البرمجية (Secrets)

تحتوي هذه الفئة على مفاتيح الاتصال بالخدمات السحابية والتهيئة الحساسة:

| م | مسار الملف | أرقام الأسطر | القيمة / الرمز المفتاحي | النوع | ملاحظات |
|---|------------|--------------|-------------------------|-------|---------|
| **1** | [firebase.js](file:///f:/Ogail_Store/src/firebase.js) | 5 - 13 | تهيئة كاملة لـ Firebase:<br>- `apiKey`: `"AIzaSyA2nvOO6b9J9yZ0U7-tKp3ozs0i5983eqc"`<br>- `authDomain`: `"ogail-d6dd6.firebaseapp.com"`<br>- `projectId`: `"ogail-d6dd6"`<br>- `storageBucket`: `"ogail-d6dd6.firebasestorage.app"`<br>- `messagingSenderId`: `"238627864136"`<br>- `appId`: `"1:238627864136:web:85481ed7e61783aa06e27d"`<br>- `measurementId`: `"G-09D0JLZKJB"` | **secret** | يجب سحبها إلى ملف البيئة `.env`. |
| **2** | [cloudinaryService.js](file:///f:/Ogail_Store/src/services/cloudinaryService.js) | 10 | `upload_preset: "ogail_products"` | **secret** | الـ Preset الخاص برفع الصور غير الموقع (Unsigned). |
| **3** | [cloudinaryService.js](file:///f:/Ogail_Store/src/services/cloudinaryService.js) | 13 | Cloud Name: `dm1nftumq`<br>(في الرابط: `https://api.cloudinary.com/v1_1/dm1nftumq/...`) | **secret** | اسم السحابة الخاص بالرفع على Cloudinary. |
| **4** | [Checkout.jsx](file:///f:/Ogail_Store/src/pages/Checkout.jsx) | 11, 134 | استدعاء الدالة `payWithPaymob` | **secret** | **تنبيه:** لا توجد أي مفاتيح خاصة بـ Paymob (سواء public أو secret) بالكامل في الكود أو `.env`. كما أن دالة `payWithPaymob` غير معرفة مطلقاً داخل `useOrders.js` مما يسبب خطأ برمجياً عند محاولة الدفع الإلكتروني. |

---

## 2. الهوية البصرية والاسم (Branding)

تم العثور على اسم المتجر "Ogail" أو "عجيل" والروابط والشعارات في المواضع التالية:

| م | مسار الملف | رقم السطر | القيمة المرصودة | النوع |
|---|------------|-----------|-----------------|-------|
| **1** | [index.html](file:///f:/Ogail_Store/index.html) | 5 | `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` | **branding** |
| **2** | [index.html](file:///f:/Ogail_Store/index.html) | 7 | `<title>عجيل — أعشاب وتوابل طبيعية أصيلة</title>` | **branding** |
| **3** | [index.html](file:///f:/Ogail_Store/index.html) | 8 | `متجر عجيل للأعشاب والتوابل الطبيعية الأصيلة. من أجود المزارع...` | **branding** |
| **4** | [Navbar.jsx](file:///f:/Ogail_Store/src/components/layout/Navbar.jsx) | 54 | `عجيل` (اسم الشعار بالهيدر) | **branding** |
| **5** | [Footer.jsx](file:///f:/Ogail_Store/src/components/layout/Footer.jsx) | 21 | `عطارة عجيل` | **branding** |
| **6** | [Footer.jsx](file:///f:/Ogail_Store/src/components/layout/Footer.jsx) | 24 | `نوفر لك أجود أنواع الأعشاب... مباشرة إلى منزلك` (النص التعريفي) | **branding** |
| **7** | [Footer.jsx](file:///f:/Ogail_Store/src/components/layout/Footer.jsx) | 95 | `متجر عجيل. جميع الحقوق محفوظة` | **branding** |
| **8** | [Home.jsx](file:///f:/Ogail_Store/src/pages/Home.jsx) | 46 | `اكتشف تشكيلة عجيل الفاخرة...` | **branding** |
| **9** | [Home.jsx](file:///f:/Ogail_Store/src/pages/Home.jsx) | 149 | `لماذا تشتري من عجيل؟` | **branding** |
| **10** | [OrderSuccess.jsx](file:///f:/Ogail_Store/src/pages/OrderSuccess.jsx) | 99 | `شكراً لتسوقك من عجيل...` | **branding** |
| **11** | [ProductDetails.jsx](file:///f:/Ogail_Store/src/pages/ProductDetails.jsx) | 141 | `...نوفر لك في متجر عجيل أجود أنواع الأعشاب...` | **branding** |
| **12** | [Dashboard.jsx](file:///f:/Ogail_Store/src/pages/admin/Dashboard.jsx) | 47 | `لوحة تحكم عجيل` | **branding** |
| **13** | [AdminLogin.jsx](file:///f:/Ogail_Store/src/pages/admin/AdminLogin.jsx) | 62 | `عجيل — لوحة التحكم` | **branding** |
| **14** | [AdminLogin.jsx](file:///f:/Ogail_Store/src/pages/admin/AdminLogin.jsx) | 87 | `placeholder="admin@ogailstore.com"` (دومين البريد الإلكتروني) | **branding** |
| **15** | [CartContext.jsx](file:///f:/Ogail_Store/src/context/CartContext.jsx) | 8, 19 | مفتاح سلة المشتريات بالذاكرة المحلية: `"ogail_cart"` | **branding** |
| **16** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 32 | `🌿 *تأكيد طلب من عجيل للأعشاب الطبيعية*` | **branding** |
| **17** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 58, 83, 99, 120, 134 | نصوص الإشعارات التلقائية التي تحتوي على اسم `عجيل للأعشاب الطبيعية` | **branding** |
| **18** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 128 | رابط التتبع: `ogail-store.netlify.app/track-order` | **branding** |
| **19** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 130 | `شكراً لاختيارك عجيل! 💚` | **branding** |
| **20** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 159 | `🔔 *طلب جديد على عجيل!*` | **branding** |

---

## 3. معلومات وإحصائيات العمل (Business Data)

تحتوي على الثوابت الخاصة بالتسعير، الأقسام، والمحافظات والتي من الأفضل تحويلها لمتغيرات ديناميكية:

| م | مسار الملف | أرقام الأسطر | القيمة المرصودة | النوع |
|---|------------|--------------|-----------------|-------|
| **1** | [shippingService.js](file:///f:/Ogail_Store/src/services/shippingService.js) | 8 - 36 | مصفوفة `DEFAULT_GOVERNORATES` التي تحتوي على 26 محافظة مصرية بأسعار الشحن الثابتة (مثال: القاهرة 40، أسوان 90، الوادي الجديد 95) وحالة تفعيل المحافظة. | **business-data** |
| **2** | [useProducts.js](file:///f:/Ogail_Store/src/hooks/useProducts.js) | 119 | `const categories = ['أعشاب', 'توابل', 'زيوت', 'بذور', 'خلطات'];` | **business-data** |

> [!NOTE]
> لا توجد أي بيانات لمنتجات حقيقية (أسماء أعشاب بأسعار حقيقية) مخزنة هاردكودد في ملفات المشروع (مثل seed files أو mock arrays)؛ حيث يتم جلب كل بيانات المنتجات بصورة ديناميكية كاملة من قاعدة بيانات Firestore.

---

## 4. البيانات الشخصية وبيانات التواصل (Personal Data)

تشمل أرقام الهواتف الحقيقية والإيميلات الخاصة بالدعم الفني أو الأدمن:

| م | مسار الملف | رقم السطر | القيمة المرصودة | النوع | ملاحظات |
|---|------------|-----------|-----------------|-------|---------|
| **1** | [Footer.jsx](file:///f:/Ogail_Store/src/components/layout/Footer.jsx) | 74 | `<span>+20 10 98092444</span>` | **personal-data** | رقم واتساب المتجر المعروض للعملاء. |
| **2** | [Footer.jsx](file:///f:/Ogail_Store/src/components/layout/Footer.jsx) | 81 | `<span>الفرع الرئيسي: ، الغربيه زفتى </span>` | **personal-data** | العنوان الفعلي لمالك المتجر. |
| **3** | [whatsappService.js](file:///f:/Ogail_Store/src/services/whatsappService.js) | 28, 116, 141, 157 | رقم الواتساب الاحتياطي: `'201098092444'` | **personal-data** | رقم الواتساب الذي يتم إرسال الإشعارات إليه في حال عدم توفر قيمة في ملف البيئة. |
| **4** | [AdminLogin.jsx](file:///f:/Ogail_Store/src/pages/admin/AdminLogin.jsx) | 87 | `placeholder="admin@ogailstore.com"` | **personal-data** | البريد الإلكتروني الافتراضي المعروض كـ Placeholder في شاشة دخول الإدارة. |

---

## 5. فحص قواعد الحماية والفهارس (Rules & Indexes Audit)

### 1) فحص ملف قواعد الحماية `firestore.rules`
* **المسار:** [firestore.rules](file:///f:/Ogail_Store/firestore.rules)
* **النتيجة:**
  * قواعد الحماية **نظيفة تماماً وعامة (Generic)**.
  * لا توجد أي مراجع لهوية مستخدمين محددين (Admin UIDs) أو مراجع لـ Project ID الحالي (`ogail-d6dd6`).
  * تعتمد قواعد الحماية على التحقق الديناميكي من صلاحيات الأدمن بالتحقق من وجود مستند في مجموعة الأدمنز `admins` يطابق الـ Auth UID الحالي للمستخدم:
    ```javascript
    exists(/databases/$(database)/documents/admins/$(request.auth.uid))
    ```

### 2) فحص الفهارس المركبة `firestore.indexes.json`
* **المسار:** [firestore.indexes.json](file:///f:/Ogail_Store/firestore.indexes.json)
* **النتيجة:**
  تم العثور على 3 فهارس مركبة (Composite Indexes) مكتوبة يدوياً للـ Collections التالية:
  1. **مجموعة التقييمات (`reviews`):**
     * الحقول: `productId` (تصاعدي) و `createdAt` (تنازلي).
  2. **مجموعة الطلبات (`orders`):**
     * الحقول: `customerPhone` (تصاعدي) و `createdAt` (تنازلي).
  3. **مجموعة المنتجات (`products`):**
     * الحقول: `isAvailable` (تصاعدي) و `createdAt` (تنازلي).
