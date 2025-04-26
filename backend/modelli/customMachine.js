import mongoose from 'mongoose';

const customMachineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['gaming', 'office', 'workstation', 'entry-level', 'high-end'],
        required: true
    },
    // Componenti selezionati dall'utente
    components: {
        cpu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CPU',
            required: true
        },
        motherboard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Motherboard',
            required: true
        },
        ram: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RAM',
            required: true
        },
        gpu: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GPU',
            required: true
        },
        storage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Storage',
            required: true
        },
        powerSupply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PowerSupply',
            required: true
        },
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Case',
            required: true
        },
        cooling: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cooling',
            required: true
        }
    },
    // Prezzi dei componenti al momento della creazione (per storico)
    componentPrices: {
        cpu: Number,
        motherboard: Number,
        ram: Number,
        gpu: Number,
        storage: Number,
        powerSupply: Number,
        case: Number,
        cooling: Number
    },
    // Prezzo base della configurazione originale
    basePrice: {
        type: Number,
        required: true
    },
    // Prezzo finale calcolato con i componenti personalizzati
    finalPrice: {
        type: Number,
        required: true
    },
    // Riferimento alla configurazione preimpostata originale
    originalPresetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PresetMachine',
        required: true
    },
    // Utente che ha creato questa configurazione personalizzata
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Status della configurazione
    status: {
        type: String,
        enum: ['draft', 'saved', 'purchased', 'archived'],
        default: 'draft'
    },
    // Metadati temporali
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const CustomMachine = mongoose.model('CustomMachine', customMachineSchema);

export default CustomMachine;