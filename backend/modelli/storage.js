import mongoose from "mongoose";

const storageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    type: { type: String, required: true }, // SSD, HDD, NVMe
    capacity: { type: Number, required: true }, // in GB
    formFactor: { type: String, required: true }, // 2.5", 3.5", M.2
    interface: { type: String, required: true }, // SATA, PCIe, NVMe
    readSpeed: { type: Number }, // in MB/s
    writeSpeed: { type: Number }, // in MB/s
    cache: { type: Number }, // in MB
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Storage = mongoose.model("Storage", storageSchema);
export default Storage;
