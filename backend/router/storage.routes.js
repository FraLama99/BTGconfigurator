import { Router } from 'express';
import Storage from '../modelli/storage.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerStorage = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID storage non valido',
            statusCode: 400
        });
    }
    next();
};

routerStorage.get('/storages', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        if (req.query.type) {
            filter.type = { $regex: req.query.type, $options: 'i' };
        }

        if (req.query.formFactor) {
            filter.formFactor = { $regex: req.query.formFactor, $options: 'i' };
        }

        if (req.query.interface) {
            filter.interface = { $regex: req.query.interface, $options: 'i' };
        }

        if (req.query.minCapacity || req.query.maxCapacity) {
            filter.capacity = {};
            if (req.query.minCapacity) filter.capacity.$gte = Number(req.query.minCapacity);
            if (req.query.maxCapacity) filter.capacity.$lte = Number(req.query.maxCapacity);
        }

        if (req.query.minReadSpeed || req.query.maxReadSpeed) {
            filter.readSpeed = {};
            if (req.query.minReadSpeed) filter.readSpeed.$gte = Number(req.query.minReadSpeed);
            if (req.query.maxReadSpeed) filter.readSpeed.$lte = Number(req.query.maxReadSpeed);
        }

        if (req.query.minWriteSpeed || req.query.maxWriteSpeed) {
            filter.writeSpeed = {};
            if (req.query.minWriteSpeed) filter.writeSpeed.$gte = Number(req.query.minWriteSpeed);
            if (req.query.maxWriteSpeed) filter.writeSpeed.$lte = Number(req.query.maxWriteSpeed);
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const storages = await Storage.find(filter).sort({ price: 1 });

        res.status(200).json(storages);
    } catch (error) {
        console.error('Errore nel recupero degli storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.get('/storages/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const storage = await Storage.findById(req.params.id);

        if (!storage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        res.status(200).json(storage);
    } catch (error) {
        console.error('Errore nel recupero dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.get('/storages/:id/image', async (req, res) => {
    try {
        const storage = await Storage.findById(req.params.id).select('imageUrl');

        if (!storage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        if (!storage.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questo storage',
                statusCode: 404
            });
        }

        res.redirect(storage.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.post('/storages', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, type, capacity, formFactor,
            interface: interfaceType, readSpeed, writeSpeed,
            cache, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !type || !capacity || !formFactor || !interfaceType || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newStorage = new Storage({
            name,
            brand,
            model,
            type,
            capacity: Number(capacity),
            formFactor,
            interface: interfaceType,
            readSpeed: readSpeed ? Number(readSpeed) : null,
            writeSpeed: writeSpeed ? Number(writeSpeed) : null,
            cache: cache ? Number(cache) : null,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedStorage = await newStorage.save();

        res.status(201).json({
            message: 'Storage creato con successo',
            storage: savedStorage,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.put('/storages/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, type, capacity, formFactor,
            interface: interfaceType, readSpeed, writeSpeed,
            cache, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !type || !capacity || !formFactor || !interfaceType || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            brand,
            model,
            type,
            capacity: Number(capacity),
            formFactor,
            interface: interfaceType,
            readSpeed: readSpeed ? Number(readSpeed) : null,
            writeSpeed: writeSpeed ? Number(writeSpeed) : null,
            cache: cache ? Number(cache) : null,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedStorage = await Storage.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedStorage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Storage aggiornato con successo',
            storage: updatedStorage,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.patch('/storages/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        if (updates.capacity) updates.capacity = Number(updates.capacity);
        if (updates.readSpeed) updates.readSpeed = Number(updates.readSpeed);
        if (updates.writeSpeed) updates.writeSpeed = Number(updates.writeSpeed);
        if (updates.cache) updates.cache = Number(updates.cache);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedStorage = await Storage.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedStorage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Storage aggiornato parzialmente con successo',
            storage: updatedStorage,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.patch('/storages/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedStorage = await Storage.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedStorage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine storage aggiornata con successo',
            imageUrl: updatedStorage.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerStorage.delete('/storages/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedStorage = await Storage.findByIdAndDelete(req.params.id);

        if (!deletedStorage) {
            return res.status(404).json({
                message: 'Storage non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Storage eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione dello storage:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerStorage;