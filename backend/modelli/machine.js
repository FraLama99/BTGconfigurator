import mongoose from 'mongoose';
const { ObjectId } = mongoose.Schema.Types;

const machineSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    description: { type: String },
    presetOrigin: {
        type: ObjectId,
        ref: 'PresetMachine',
        default: null
    },
    components: {
        cpu: { type: ObjectId, ref: 'CPU' },
        motherboard: { type: ObjectId, ref: 'Motherboard' },
        ram: [{ type: ObjectId, ref: 'RAM' }],
        gpu: { type: ObjectId, ref: 'GPU' },
        storage: [{ type: ObjectId, ref: 'Storage' }],
        powerSupply: { type: ObjectId, ref: 'PowerSupply' },
        case: { type: ObjectId, ref: 'Case' },
        cooling: [{ type: ObjectId, ref: 'Cooling' }]
    },
    totalPrice: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'saved', 'ordered'], default: 'draft' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
