import mongoose from 'mongoose';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../middlewares/emailService.js';

const orderSchema = new mongoose.Schema({
    // Riferimento all'utente che ha effettuato l'ordine
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Numero ordine user-friendly (es. ORD-12345)
    orderNumber: {
        type: String,
        unique: true
    },
    machines: [{
        machineType: {
            type: String,
            enum: ['Machine', 'CustomMachine', 'preset', 'standard', 'custom'],
            required: true
        },
        machineId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'machines.machineType'
        },
        quantity: {
            type: Number,
            default: 1,
            required: true
        },
        name: String,
        price: Number,
        components: Object
    }],
    // Metodo di pagamento utilizzato
    paymentMethod: {
        type: String,
        enum: ['creditCard', 'paypal', 'bankTransfer'],
        default: 'creditCard'
    },

    // Stato del pagamento
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    componentsAvailability: {
        allAvailable: {
            type: Boolean,
            default: true
        },
        unavailableComponents: [String],
        lastChecked: {
            type: Date,
            default: Date.now
        }
    },
    // Snapshot dei componenti al momento dell'ordine
    components: {
        cpu: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'CPU' },
            name: String,
            price: Number
        },
        motherboard: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Motherboard' },
            name: String,
            price: Number
        },
        ram: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'RAM' },
            name: String,
            price: Number
        },
        gpu: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'GPU' },
            name: String,
            price: Number
        },
        storage: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Storage' },
            name: String,
            price: Number
        },
        powerSupply: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'PowerSupply' },
            name: String,
            price: Number
        },
        case: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
            name: String,
            price: Number
        },
        cooling: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooling' },
            name: String,
            price: Number
        }
    },
    // Informazioni di spedizione
    shippingInfo: {
        address: String,
        city: String,
        zipCode: String,
        country: String
    },
    // Prezzo totale dell'ordine
    totalPrice: {
        type: Number,
        required: true
    },
    // Stato dell'ordine
    status: {
        type: String,
        enum: ['pending', 'processing', 'assembled', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    // Disponibilità dei componenti
    componentsAvailability: {
        allAvailable: { type: Boolean, default: false },
        unavailableComponents: [String] // nomi dei componenti non disponibili
    },
    // Date importante dell'ordine
    orderDate: {
        type: Date,
        default: Date.now
    },
    // Data di consegna stimata
    estimatedDeliveryDate: {
        type: Date,
        required: true
    },
    // Data di evasione (quando un admin elabora l'ordine)
    processedDate: Date,
    // ID dell'admin che ha evaso l'ordine
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    inventoryUpdates: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        success: Number,
        failed: Number,
        details: [{
            type: String,
            id: mongoose.Schema.Types.ObjectId,
            name: String,
            newStock: Number,
            quantity: Number,
            status: String,
            reason: String
        }]
    }],
    // Note sull'ordine
    notes: String

});

// Middleware pre-save per generare il numero d'ordine
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model('Order').countDocuments();
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        this.orderNumber = `ORD-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Metodi statici
// Modifica il metodo calculateEstimatedDelivery

// Modifica il metodo statico per usare il middleware
orderSchema.statics.calculateEstimatedDelivery = async function (componentIds) {
    try {
        const { checkComponentsAvailability } = require('../middlewares/inventoryMiddleware');

        // Crea l'oggetto components nel formato richiesto da checkComponentsAvailability
        const components = {};
        for (const [type, id] of Object.entries(componentIds)) {
            components[type] = { id };
        }

        // Verifica la disponibilità effettiva dei componenti
        const { allAvailable, unavailableComponents } = await checkComponentsAvailability(components);

        // Calcola la data di consegna stimata in base alla disponibilità
        const now = new Date();
        let estimatedDays = allAvailable ? 4 : 15; // 4 giorni se tutti disponibili, altrimenti 15

        const estimatedDelivery = new Date(now);
        estimatedDelivery.setDate(now.getDate() + estimatedDays);

        return {
            estimatedDelivery,
            allAvailable,
            unavailableComponents: unavailableComponents.map(c => c.type)
        };
    } catch (error) {
        console.error('Errore nel calcolo della data di consegna stimata:', error);

        // Fallback: ritorna una stima di default
        const now = new Date();
        const estimatedDelivery = new Date(now);
        estimatedDelivery.setDate(now.getDate() + 7); // Default: 7 giorni

        return {
            estimatedDelivery,
            allAvailable: false,
            unavailableComponents: []
        };
    }
};
// Hook per l'invio di email quando l'ordine viene processato
orderSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();

    // Se lo stato è stato modificato a "processing"
    if (update && update.status === 'processing' && update.processedBy) {
        const order = await this.model.findOne(this.getQuery());

        // Recupera le informazioni dell'utente
        const User = mongoose.model('User');
        const user = await User.findById(order.userId);

        if (user && user.email) {
            // Invia l'email di notifica
            await sendOrderStatusUpdate(
                user.email,
                user.name || 'Cliente',
                order.orderNumber,
                'processing',
                order.estimatedDeliveryDate
            );
        }
    }

    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;