import mongoose from "mongoose";

const gpuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    chipset: { type: String, required: true }, // e.g., "NVIDIA RTX 4060"
    vram: { type: Number, required: true }, // in GB
    vramType: { type: String }, // GDDR6, GDDR6X
    coreClock: { type: Number }, // in MHz
    boostClock: { type: Number }, // in MHz
    length: { type: Number }, // in mm
    tdp: { type: Number }, // in Watts
    powerConnectors: { type: String }, // e.g., "1x 8-pin"
    displayPorts: { type: Number, default: 0 },
    hdmiPorts: { type: Number, default: 0 },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const GPU = mongoose.model("GPU", gpuSchema);
export default GPU;