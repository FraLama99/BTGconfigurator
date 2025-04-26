import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinaryStorageProduct = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'configBTG/product',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

const uploadCloudinary = multer({ storage: cloudinaryStorageProduct });

export default uploadCloudinary;
