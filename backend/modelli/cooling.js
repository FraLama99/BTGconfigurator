import mongoose from "mongoose";

const coolingSchema = new mongoose.Schema({

    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true }, // Air, AIO Liquid
    radiatorSize: { type: Number }, // in mm, for AIO coolers
    fanSize: { type: Number }, // in mm
    fanCount: { type: Number, default: 1 },
    height: { type: Number }, // in mm, for air coolers
    rgb: { type: Boolean, default: false },
    supportedSockets: [{ type: String }], // Array of supported CPU sockets
    tdpRating: { type: Number }, // Maximum TDP supported
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


const Cooling = mongoose.model("Cooling", coolingSchema);
export default Cooling;