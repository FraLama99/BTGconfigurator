import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['image', 'carousel', 'background', 'logo', 'icon', 'banner'],
        default: 'image'
    },
    category: {
        type: String,
        enum: ['general', 'home', 'products', 'services', 'about', 'contact', 'prebuilt', 'customization'],
        default: 'general'
    },
    url: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    altText: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Media', mediaSchema);