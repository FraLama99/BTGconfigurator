// Aggiornamento da aggiungere al modello RAM.js
import mongoose from "mongoose";

const ramSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    sku: { type: String }, // Nuovo campo per il codice SKU
    memoryType: { type: String, required: true }, // DDR4, DDR5
    capacity: { type: Number, required: true }, // in GB
    speed: { type: Number, required: true }, // in MHz o MT/s
    casLatency: { type: Number },
    voltage: { type: Number },
    hasRGB: { type: Boolean, default: false },
    kitSize: { type: Number, required: true }, // Numero di moduli nel kit
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const RAM = mongoose.model("RAM", ramSchema);
export default RAM;