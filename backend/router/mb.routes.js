import { Router } from 'express';
import Motherboard from '../modelli/MB.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerMB = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID scheda madre non valido',
            statusCode: 400
        });
    }
    next();
};

routerMB.get('/motherboards', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        if (req.query.socket) {
            filter.socket = { $regex: req.query.socket, $options: 'i' };
        }

        if (req.query.chipset) {
            filter.chipset = { $regex: req.query.chipset, $options: 'i' };
        }

        if (req.query.formFactor) {
            filter.formFactor = { $regex: req.query.formFactor, $options: 'i' };
        }

        if (req.query.memoryType) {
            filter.memoryType = { $regex: req.query.memoryType, $options: 'i' };
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const motherboards = await Motherboard.find(filter).sort({ price: 1 });

        res.status(200).json(motherboards);
    } catch (error) {
        console.error('Errore nel recupero delle schede madri:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.get('/motherboards/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const motherboard = await Motherboard.findById(req.params.id);

        if (!motherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(motherboard);
    } catch (error) {
        console.error('Errore nel recupero della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.get('/motherboards/:id/image', async (req, res) => {
    try {
        const motherboard = await Motherboard.findById(req.params.id).select('imageUrl');

        if (!motherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        if (!motherboard.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questa scheda madre',
                statusCode: 404
            });
        }

        res.redirect(motherboard.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.post('/motherboards', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, socket, chipset, formFactor, memoryType,
            memorySlots, maxMemory, pcie_x16, pcie_x8, pcie_x4, pcie_x1,
            sataConnectors, m2Slots, usb2, usb3, typeC,
            wifiIncluded, bluetoothIncluded, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !socket || !chipset || !formFactor || !memoryType || !memorySlots || !maxMemory || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newMotherboard = new Motherboard({
            name,
            brand,
            model,
            socket,
            chipset,
            formFactor,
            memoryType,
            memorySlots: Number(memorySlots),
            maxMemory: Number(maxMemory),
            pciSlots: {
                pcie_x16: pcie_x16 ? Number(pcie_x16) : 0,
                pcie_x8: pcie_x8 ? Number(pcie_x8) : 0,
                pcie_x4: pcie_x4 ? Number(pcie_x4) : 0,
                pcie_x1: pcie_x1 ? Number(pcie_x1) : 0
            },
            sataConnectors: sataConnectors ? Number(sataConnectors) : 0,
            m2Slots: m2Slots ? Number(m2Slots) : 0,
            usbPorts: {
                usb2: usb2 ? Number(usb2) : 0,
                usb3: usb3 ? Number(usb3) : 0,
                typeC: typeC ? Number(typeC) : 0
            },
            wifiIncluded: wifiIncluded === 'true',
            bluetoothIncluded: bluetoothIncluded === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedMotherboard = await newMotherboard.save();

        res.status(201).json({
            message: 'Scheda madre creata con successo',
            motherboard: savedMotherboard,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.put('/motherboards/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, socket, chipset, formFactor, memoryType,
            memorySlots, maxMemory, pcie_x16, pcie_x8, pcie_x4, pcie_x1,
            sataConnectors, m2Slots, usb2, usb3, typeC,
            wifiIncluded, bluetoothIncluded, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !socket || !chipset || !formFactor || !memoryType || !memorySlots || !maxMemory || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            brand,
            model,
            socket,
            chipset,
            formFactor,
            memoryType,
            memorySlots: Number(memorySlots),
            maxMemory: Number(maxMemory),
            pciSlots: {
                pcie_x16: pcie_x16 ? Number(pcie_x16) : 0,
                pcie_x8: pcie_x8 ? Number(pcie_x8) : 0,
                pcie_x4: pcie_x4 ? Number(pcie_x4) : 0,
                pcie_x1: pcie_x1 ? Number(pcie_x1) : 0
            },
            sataConnectors: sataConnectors ? Number(sataConnectors) : 0,
            m2Slots: m2Slots ? Number(m2Slots) : 0,
            usbPorts: {
                usb2: usb2 ? Number(usb2) : 0,
                usb3: usb3 ? Number(usb3) : 0,
                typeC: typeC ? Number(typeC) : 0
            },
            wifiIncluded: wifiIncluded === 'true',
            bluetoothIncluded: bluetoothIncluded === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedMotherboard = await Motherboard.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedMotherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Scheda madre aggiornata con successo',
            motherboard: updatedMotherboard,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.patch('/motherboards/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        if (updates.memorySlots) updates.memorySlots = Number(updates.memorySlots);
        if (updates.maxMemory) updates.maxMemory = Number(updates.maxMemory);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        if (updates.sataConnectors) updates.sataConnectors = Number(updates.sataConnectors);
        if (updates.m2Slots) updates.m2Slots = Number(updates.m2Slots);
        if (updates.wifiIncluded) updates.wifiIncluded = updates.wifiIncluded === 'true';
        if (updates.bluetoothIncluded) updates.bluetoothIncluded = updates.bluetoothIncluded === 'true';

        if (updates.pcie_x16 || updates.pcie_x8 || updates.pcie_x4 || updates.pcie_x1) {
            updates.pciSlots = updates.pciSlots || {};
            if (updates.pcie_x16) updates.pciSlots.pcie_x16 = Number(updates.pcie_x16);
            if (updates.pcie_x8) updates.pciSlots.pcie_x8 = Number(updates.pcie_x8);
            if (updates.pcie_x4) updates.pciSlots.pcie_x4 = Number(updates.pcie_x4);
            if (updates.pcie_x1) updates.pciSlots.pcie_x1 = Number(updates.pcie_x1);

            delete updates.pcie_x16;
            delete updates.pcie_x8;
            delete updates.pcie_x4;
            delete updates.pcie_x1;
        }

        if (updates.usb2 || updates.usb3 || updates.typeC) {
            updates.usbPorts = updates.usbPorts || {};
            if (updates.usb2) updates.usbPorts.usb2 = Number(updates.usb2);
            if (updates.usb3) updates.usbPorts.usb3 = Number(updates.usb3);
            if (updates.typeC) updates.usbPorts.typeC = Number(updates.typeC);

            delete updates.usb2;
            delete updates.usb3;
            delete updates.typeC;
        }

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedMotherboard = await Motherboard.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedMotherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Scheda madre aggiornata parzialmente con successo',
            motherboard: updatedMotherboard,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.patch('/motherboards/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedMotherboard = await Motherboard.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedMotherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine scheda madre aggiornata con successo',
            imageUrl: updatedMotherboard.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerMB.delete('/motherboards/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedMotherboard = await Motherboard.findByIdAndDelete(req.params.id);

        if (!deletedMotherboard) {
            return res.status(404).json({
                message: 'Scheda madre non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Scheda madre eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della scheda madre:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerMB;