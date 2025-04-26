import mongoose from "mongoose";

const powerSupplySchema = new mongoose.Schema({

    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    wattage: { type: Number, required: true }, // in Watts
    efficiency: { type: String, required: true }, // 80+ Bronze, Gold, Platinum, etc.
    modular: { type: String, required: true }, // Full, Semi, No
    formFactor: { type: String, required: true }, // ATX, SFX
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const PowerSupply = mongoose.model("PowerSupply", powerSupplySchema);
export default PowerSupply;