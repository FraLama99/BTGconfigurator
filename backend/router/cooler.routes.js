import { Router } from 'express';
import Cooling from '../modelli/cooling.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerCooler = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID Cooler non valido',
            statusCode: 400
        });
    }
    next();
};

routerCooler.get('/coolers', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        if (req.query.type) {
            filter.type = { $regex: req.query.type, $options: 'i' };
        }

        if (req.query.socket) {
            filter.supportedSockets = { $regex: req.query.socket, $options: 'i' };
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        if (req.query.rgb) {
            filter.rgb = req.query.rgb === 'true';
        }

        const coolers = await Cooling.find(filter).sort({ price: 1 });

        res.status(200).json(coolers);
    } catch (error) {
        console.error('Errore nel recupero dei cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.get('/coolers/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const cooler = await Cooling.findById(req.params.id);

        if (!cooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        res.status(200).json(cooler);
    } catch (error) {
        console.error('Errore nel recupero del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.get('/coolers/:id/image', async (req, res) => {
    try {
        const cooler = await Cooling.findById(req.params.id).select('imageUrl');

        if (!cooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        if (!cooler.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questo cooler',
                statusCode: 404
            });
        }

        res.redirect(cooler.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.post('/coolers', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, type, radiatorSize, fanSize, fanCount,
            height, rgb, supportedSockets, tdpRating, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !type || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        // Gestisci l'array di supportedSockets
        let parsedSockets = [];
        if (typeof supportedSockets === 'string') {
            try {
                parsedSockets = JSON.parse(supportedSockets);
            } catch (e) {
                // Se non è un JSON valido, dividi la stringa per virgole
                parsedSockets = supportedSockets.split(',').map(s => s.trim());
            }
        } else if (Array.isArray(supportedSockets)) {
            parsedSockets = supportedSockets;
        }

        const newCooler = new Cooling({
            name,
            brand,
            model,
            type,
            radiatorSize: radiatorSize ? Number(radiatorSize) : undefined,
            fanSize: fanSize ? Number(fanSize) : undefined,
            fanCount: fanCount ? Number(fanCount) : 1,
            height: height ? Number(height) : undefined,
            rgb: rgb === 'true',
            supportedSockets: parsedSockets,
            tdpRating: tdpRating ? Number(tdpRating) : undefined,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedCooler = await newCooler.save();

        res.status(201).json({
            message: 'Cooler creato con successo',
            cooler: savedCooler,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.put('/coolers/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, type, radiatorSize, fanSize, fanCount,
            height, rgb, supportedSockets, tdpRating, price, stock, description
        } = req.body;

        if (!name || !brand || !model || !type || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        // Gestisci l'array di supportedSockets
        let parsedSockets = [];
        if (typeof supportedSockets === 'string') {
            try {
                parsedSockets = JSON.parse(supportedSockets);
            } catch (e) {
                // Se non è un JSON valido, dividi la stringa per virgole
                parsedSockets = supportedSockets.split(',').map(s => s.trim());
            }
        } else if (Array.isArray(supportedSockets)) {
            parsedSockets = supportedSockets;
        }

        const updateData = {
            name,
            brand,
            model,
            type,
            radiatorSize: radiatorSize ? Number(radiatorSize) : undefined,
            fanSize: fanSize ? Number(fanSize) : undefined,
            fanCount: fanCount ? Number(fanCount) : 1,
            height: height ? Number(height) : undefined,
            rgb: rgb === 'true',
            supportedSockets: parsedSockets,
            tdpRating: tdpRating ? Number(tdpRating) : undefined,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedCooler = await Cooling.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedCooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Cooler aggiornato con successo',
            cooler: updatedCooler,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.patch('/coolers/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        if (updates.fanCount) updates.fanCount = Number(updates.fanCount);
        if (updates.fanSize) updates.fanSize = Number(updates.fanSize);
        if (updates.radiatorSize) updates.radiatorSize = Number(updates.radiatorSize);
        if (updates.height) updates.height = Number(updates.height);
        if (updates.tdpRating) updates.tdpRating = Number(updates.tdpRating);
        if (updates.rgb) updates.rgb = updates.rgb === 'true';

        // Gestisci l'array di supportedSockets se presente
        if (updates.supportedSockets) {
            if (typeof updates.supportedSockets === 'string') {
                try {
                    updates.supportedSockets = JSON.parse(updates.supportedSockets);
                } catch (e) {
                    updates.supportedSockets = updates.supportedSockets.split(',').map(s => s.trim());
                }
            }
        }

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedCooler = await Cooling.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedCooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Cooler aggiornato parzialmente con successo',
            cooler: updatedCooler,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.patch('/coolers/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedCooler = await Cooling.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedCooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine del cooler aggiornata con successo',
            imageUrl: updatedCooler.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCooler.delete('/coolers/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedCooler = await Cooling.findByIdAndDelete(req.params.id);

        if (!deletedCooler) {
            return res.status(404).json({
                message: 'Cooler non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Cooler eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione del cooler:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerCooler;