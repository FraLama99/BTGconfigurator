import mongoose from "mongoose";

const motherboardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    socket: { type: String, required: true },
    chipset: { type: String, required: true },
    formFactor: { type: String, required: true }, // ATX, Micro-ATX, Mini-ITX
    memoryType: { type: String, required: true }, // DDR4, DDR5
    memorySlots: { type: Number, required: true },
    maxMemory: { type: Number, required: true }, // in GB
    pciSlots: {
        pcie_x16: { type: Number, default: 0 },
        pcie_x8: { type: Number, default: 0 },
        pcie_x4: { type: Number, default: 0 },
        pcie_x1: { type: Number, default: 0 }
    },
    sataConnectors: { type: Number, default: 0 },
    m2Slots: { type: Number, default: 0 },
    usbPorts: {
        usb2: { type: Number, default: 0 },
        usb3: { type: Number, default: 0 },
        typeC: { type: Number, default: 0 }
    },
    wifiIncluded: { type: Boolean, default: false },
    bluetoothIncluded: { type: Boolean, default: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Motherboard = mongoose.model("Motherboard", motherboardSchema);
export default Motherboard;
