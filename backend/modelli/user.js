import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'L\'email è obbligatoria'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Inserisci un indirizzo email valido']
    },
    password: {
        type: String,
        required: [true, 'La password è obbligatoria'],
        minlength: [6, 'La password deve essere di almeno 6 caratteri'],
        select: false // Non includere di default nelle query
    },
    name: {
        type: String,
        required: [true, 'Il nome è obbligatorio'],
        trim: true
    },
    surname: {
        type: String,
        required: [true, 'Il cognome è obbligatorio'],
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    phone: {
        type: String,
        required: [true, 'Il numero di telefono è obbligatorio'],
        trim: true
    },
    address: {
        street: {
            type: String,
            required: [true, 'L\'indirizzo è obbligatorio']
        },
        city: {
            type: String,
            required: [true, 'La città è obbligatoria']
        },
        zipCode: {
            type: String,
            required: [true, 'Il CAP è obbligatorio']
        },
        country: {
            type: String,
            required: [true, 'La nazione è obbligatoria']
        }
    },
    avatar: {
        type: String,
        default: null
    },
    birth_date: {
        type: Date,
        required: [true, 'La data di nascita è obbligatoria']
    },
    savedConfigurations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Configuration'
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    savedConfigurations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine'
    }],

    cart: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'cart.itemType'
        },
        itemType: {
            type: String,
            enum: ['machine', 'preset', "workstation"] // o altri tipi che potresti avere
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        },
        addedAt: {
            type: Date,
            default: Date.now
        },

    }]
});

const User = mongoose.model('User', UserSchema);
export default User;