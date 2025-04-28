import mongoose from "mongoose";

const caseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    formFactor: {
        type: [String],
        required: true,
        enum: {
            values: [
                'E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX',
                'Nano-ITX', 'XL-ATX', 'EATX', 'EEATX',
                'SSI-CEB', 'SSI-EEB', 'Mini-STX', 'CEB'
            ],
            message: '{VALUE} non è un formato supportato'
        },
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'È necessario specificare almeno un formato'
        }
    },
    dimensions: {
        height: { type: Number }, // in mm
        width: { type: Number }, // in mm
        depth: { type: Number } // in mm
    },
    maxGpuLength: { type: Number }, // in mm
    maxCpuCoolerHeight: { type: Number }, // in mm
    includedFans: { type: Number, default: 0 },
    panelType: { type: String }, // Glass, Acrylic, Metal
    rgb: { type: Boolean, default: false },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Case = mongoose.model("Case", caseSchema);
export default Case;