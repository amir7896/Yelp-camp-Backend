const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET  
})

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params: {
        folder: 'Yelp Camp 2021',
        allowedFormats: ['png', 'jpg', 'jpeg']
    }
  
})

module.exports = {
    storage,
    cloudinary
}