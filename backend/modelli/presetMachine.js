import mongoose from 'mongoose';

const presetMachineSchema = new mongoose.Schema({
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
    basePrice: {
        type: Number,
        required: true
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

const PresetMachine = mongoose.model('PresetMachine', presetMachineSchema);

export default PresetMachine;