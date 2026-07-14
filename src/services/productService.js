import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

/**
 * Fetch all products ordered by creation date descending.
 */
export const getProducts = async () => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Safeguard date conversion
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      products.push({ id: docSnap.id, ...data, createdAt });
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetch a single product details by document ID.
 */
export const getProductById = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      return { id: docSnap.id, ...data, createdAt };
    } else {
      throw new Error('المنتج المطلوب غير موجود');
    }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product in Firestore.
 */
export const createProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name: productData.name,
      description: productData.description || '',
      price: Number(productData.price),
      category: productData.category || 'أعشاب',
      imageUrl: productData.imageUrl || '',
      stock: Number(productData.stock) || 0,
      isAvailable: productData.isAvailable !== undefined ? Boolean(productData.isAvailable) : true,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product in Firestore.
 */
export const updateProduct = async (id, productData) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const dataToUpdate = { ...productData };
    if (dataToUpdate.price !== undefined) dataToUpdate.price = Number(dataToUpdate.price);
    if (dataToUpdate.stock !== undefined) dataToUpdate.stock = Number(dataToUpdate.stock);
    if (dataToUpdate.isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(dataToUpdate.isAvailable);
    
    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product from Firestore.
 */
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};
