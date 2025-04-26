import mongoose from "mongoose";

const cpuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    series: { type: String },
    model: { type: String, required: true },
    socket: { type: String, required: true },
    cores: { type: Number, required: true },
    threads: { type: Number, required: true },
    baseFrequency: { type: Number, required: true }, // in GHz
    boostFrequency: { type: Number }, // in GHz
    tdp: { type: Number }, // in Watts
    architecture: { type: String },
    cache: { type: String },
    integratedGraphics: { type: Boolean, default: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
const CPU = mongoose.model("CPU", cpuSchema);
export default CPU;
