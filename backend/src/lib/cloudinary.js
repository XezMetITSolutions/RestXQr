const cloudinary = require('cloudinary').v2;

// Cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Upload helper fonksiyonu
const uploadToCloudinary = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'restxqr', // Ana klasör
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Max boyut
        { quality: 'auto:good' }, // Otomatik kalite optimizasyonu
        { fetch_format: 'auto' } // Otomatik format (WebP vb.)
      ],
      ...options
    };

    // Buffer'ı stream olarak yükle
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload hatası:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload başarılı:', result.secure_url);
          resolve(result);
        }
      }
    );

    // Buffer'ı stream'e yaz
    const Readable = require('stream').Readable;
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Resmi sil
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Cloudinary silme:', result);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary silme hatası:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
