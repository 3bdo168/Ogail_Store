const functions = require("firebase-functions");
const admin = require("firebase-admin");
const XLSX = require("xlsx");

admin.initializeApp();

const db = admin.firestore();

/**
 * Helper to generate and upload the sales archive.
 */
async function generateAndUploadArchive(frequency) {
  const now = new Date();
  let startDate = new Date();

  if (frequency === "daily") {
    startDate.setDate(now.getDate() - 1);
  } else if (frequency === "weekly") {
    startDate.setDate(now.getDate() - 7);
  } else if (frequency === "monthly") {
    startDate.setMonth(now.getMonth() - 1);
  }

  // Fetch orders created since startDate
  const ordersSnapshot = await db
    .collection("orders")
    .where("createdAt", ">=", startDate)
    .get();

  const orders = [];
  ordersSnapshot.forEach((doc) => {
    const data = doc.data();
    // Convert Firestore Timestamp to JS Date
    const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
    orders.push({ id: doc.id, ...data, createdAt });
  });

  // Sort orders descending by date
  orders.sort((a, b) => b.createdAt - a.createdAt);

  if (orders.length === 0) {
    console.log(`No orders found for frequency: ${frequency}`);
    return;
  }

  // Map to flat structure for Excel
  const data = orders.map((order) => {
    const productsStr = order.items
      ? order.items.map((i) => `${i.name} (${i.quantity})`).join(", ")
      : "";
    return {
      "رقم الطلب": order.id,
      "اسم العميل": order.customerName || "",
      "رقم الهاتف": order.customerPhone || "",
      "المنتجات": productsStr,
      "الإجمالي": order.totalPrice || 0,
      "طريقة الدفع": order.paymentMethod === "cod" ? "الدفع عند الاستلام" : (order.paymentMethod || ""),
      "حالة الطلب": order.orderStatus || "",
      "التاريخ": order.createdAt.toISOString(),
    };
  });

  // Generate Excel buffer
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "المبيعات");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Upload to Storage
  const bucket = admin.storage().bucket();
  const timestampStr = now.toISOString().replace(/[:.]/g, "-");
  const filename = `sales-archives/sales_archive_${frequency}_${timestampStr}.xlsx`;
  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });

  // Generate public download URL
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filename)}?alt=media`;

  // Write record to Firestore
  await db.collection("salesArchives").add({
    fileName: `sales_archive_${frequency}_${timestampStr}.xlsx`,
    frequency: frequency,
    downloadUrl: downloadUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Successfully generated sales archive: ${filename}`);
}

/**
 * Single Daily Scheduled Trigger checking configuration.
 * Runs every day at 00:00 (midnight).
 */
exports.checkAndExportSales = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Riyadh") // Middle East time zone
  .onRun(async (context) => {
    // Read global store settings
    const settingsSnap = await db.collection("settings").doc("storeConfig").get();
    if (!settingsSnap.exists()) {
      console.log("No storeConfig settings found.");
      return null;
    }

    const settings = settingsSnap.data();
    if (!settings.salesExportEnabled) {
      console.log("Auto sales export is disabled in settings.");
      return null;
    }

    const frequency = settings.salesExportFrequency || "daily";
    const now = new Date();

    if (frequency === "daily") {
      await generateAndUploadArchive("daily");
    } else if (frequency === "weekly") {
      // Run only on Sunday (0)
      if (now.getDay() === 0) {
        await generateAndUploadArchive("weekly");
      } else {
        console.log("Weekly export active, but today is not Sunday.");
      }
    } else if (frequency === "monthly") {
      // Run only on the first day of the month (1)
      if (now.getDate() === 1) {
        await generateAndUploadArchive("monthly");
      } else {
        console.log("Monthly export active, but today is not the first day of the month.");
      }
    }

    return null;
  });
