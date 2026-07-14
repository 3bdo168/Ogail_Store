/**
 * Uploads a file directly to Cloudinary using an unsigned upload preset.
 * Uses hardcoded cloud name and preset for Ogail Store.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} The secure URL of the uploaded image.
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('فشل رفع الصورة');
  const data = await res.json();
  return data.secure_url;
};
