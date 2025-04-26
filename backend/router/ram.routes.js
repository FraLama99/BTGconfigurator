import { Router } from 'express';
import RAM from '../modelli/RAM.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerRAM = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID memoria RAM non valido',
            statusCode: 400
        });
    }
    next();
};

routerRAM.get('/rams', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        if (req.query.memoryType) {
            filter.memoryType = { $regex: req.query.memoryType, $options: 'i' };
        }

        if (req.query.minSpeed || req.query.maxSpeed) {
            filter.speed = {};
            if (req.query.minSpeed) filter.speed.$gte = Number(req.query.minSpeed);
            if (req.query.maxSpeed) filter.speed.$lte = Number(req.query.maxSpeed);
        }

        if (req.query.minCapacity || req.query.maxCapacity) {
            filter.capacity = {};
            if (req.query.minCapacity) filter.capacity.$gte = Number(req.query.minCapacity);
            if (req.query.maxCapacity) filter.capacity.$lte = Number(req.query.maxCapacity);
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        if (req.query.hasRGB) {
            filter.hasRGB = req.query.hasRGB === 'true';
        }

        const rams = await RAM.find(filter).sort({ price: 1 });

        res.status(200).json(rams);
    } catch (error) {
        console.error('Errore nel recupero delle memorie RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.get('/rams/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const ram = await RAM.findById(req.params.id);

        if (!ram) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(ram);
    } catch (error) {
        console.error('Errore nel recupero della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.get('/rams/:id/image', async (req, res) => {
    try {
        const ram = await RAM.findById(req.params.id).select('imageUrl');

        if (!ram) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        if (!ram.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questa memoria RAM',
                statusCode: 404
            });
        }

        res.redirect(ram.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.post('/rams', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, sku, memoryType, capacity, speed,
            casLatency, voltage, hasRGB, kitSize,
            price, stock, description
        } = req.body;

        if (!name || !brand || !model || !memoryType || !capacity || !speed || !kitSize || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newRAM = new RAM({
            name,
            brand,
            model,
            sku, // Aggiunto SKU
            memoryType,
            capacity: Number(capacity),
            speed: Number(speed),
            casLatency: casLatency ? Number(casLatency) : null,
            voltage: voltage ? Number(voltage) : null,
            hasRGB: hasRGB === 'true',
            kitSize: Number(kitSize),
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedRAM = await newRAM.save();

        res.status(201).json({
            message: 'Memoria RAM creata con successo',
            ram: savedRAM,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.put('/rams/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, memoryType, capacity, speed,
            casLatency, voltage, hasRGB, kitSize, sku,
            price, stock, description
        } = req.body;

        if (!name || !brand || !model || !memoryType || !capacity || !speed || !kitSize || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            brand,
            model,
            sku,
            memoryType,
            capacity: Number(capacity),
            speed: Number(speed),
            casLatency: casLatency ? Number(casLatency) : null,
            voltage: voltage ? Number(voltage) : null,
            hasRGB: hasRGB === 'true',
            kitSize: Number(kitSize),
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedRAM = await RAM.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedRAM) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Memoria RAM aggiornata con successo',
            ram: updatedRAM,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.patch('/rams/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        if (updates.capacity) updates.capacity = Number(updates.capacity);
        if (updates.speed) updates.speed = Number(updates.speed);
        if (updates.casLatency) updates.casLatency = Number(updates.casLatency);
        if (updates.voltage) updates.voltage = Number(updates.voltage);
        if (updates.kitSize) updates.kitSize = Number(updates.kitSize);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        if (updates.hasRGB) updates.hasRGB = updates.hasRGB === 'true';
        if (updates.sku) updates.sku = updates.sku.trim();

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedRAM = await RAM.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedRAM) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Memoria RAM aggiornata parzialmente con successo',
            ram: updatedRAM,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.patch('/rams/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedRAM = await RAM.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedRAM) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine memoria RAM aggiornata con successo',
            imageUrl: updatedRAM.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerRAM.delete('/rams/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedRAM = await RAM.findByIdAndDelete(req.params.id);

        if (!deletedRAM) {
            return res.status(404).json({
                message: 'Memoria RAM non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Memoria RAM eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della memoria RAM:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerRAM;