import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinaryStorageUtility = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'configBTG/utility',
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        allowed_formats: ['jpg', 'jpeg', 'png'],
        secure: true
    }
});

const uploadCloudinary = multer({ storage: cloudinaryStorageUtility });

export default uploadCloudinary;
