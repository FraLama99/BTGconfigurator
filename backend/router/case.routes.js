import { Router } from 'express';
import Case from '../modelli/case.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerCase = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID Case non valido',
            statusCode: 400
        });
    }
    next();
};

routerCase.get('/cases', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Modifico per cercare un formato nell'array formFactor
        if (req.query.formFactor) {
            // Cerco case che contengono il formato richiesto nell'array
            filter.formFactor = req.query.formFactor;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        if (req.query.rgb) {
            filter.rgb = req.query.rgb === 'true';
        }

        const cases = await Case.find(filter).sort({ price: 1 });

        res.status(200).json(cases);
    } catch (error) {
        console.error('Errore nel recupero dei case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.get('/cases/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id);

        if (!caseItem) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        res.status(200).json(caseItem);
    } catch (error) {
        console.error('Errore nel recupero del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.get('/cases/:id/image', async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id).select('imageUrl');

        if (!caseItem) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        if (!caseItem.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questo case',
                statusCode: 404
            });
        }

        res.redirect(caseItem.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.post('/cases', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model,
            height, width, depth,
            maxGpuLength, maxCpuCoolerHeight, includedFans,
            panelType, rgb, price, stock, description
        } = req.body;

        // Gestisco formFactor come array
        let formFactor = req.body.formFactor;

        // Se è una singola stringa, la converto in array
        if (typeof formFactor === 'string') {
            formFactor = [formFactor];
        } else if (!Array.isArray(formFactor)) {
            return res.status(400).json({
                message: 'Il campo formFactor deve essere un array o una stringa',
                statusCode: 400
            });
        }

        if (!name || !brand || !model || !formFactor.length || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newCase = new Case({
            name,
            brand,
            model,
            formFactor, // Ora è un array
            dimensions: {
                height: height ? Number(height) : undefined,
                width: width ? Number(width) : undefined,
                depth: depth ? Number(depth) : undefined
            },
            maxGpuLength: maxGpuLength ? Number(maxGpuLength) : undefined,
            maxCpuCoolerHeight: maxCpuCoolerHeight ? Number(maxCpuCoolerHeight) : undefined,
            includedFans: includedFans ? Number(includedFans) : 0,
            panelType: panelType || undefined,
            rgb: rgb === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedCase = await newCase.save();

        res.status(201).json({
            message: 'Case creato con successo',
            case: savedCase,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.put('/cases/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model,
            height, width, depth,
            maxGpuLength, maxCpuCoolerHeight, includedFans,
            panelType, rgb, price, stock, description
        } = req.body;

        // Gestisco formFactor come array
        let formFactor = req.body.formFactor;

        // Se è una singola stringa, la converto in array
        if (typeof formFactor === 'string') {
            formFactor = [formFactor];
        } else if (!Array.isArray(formFactor)) {
            return res.status(400).json({
                message: 'Il campo formFactor deve essere un array o una stringa',
                statusCode: 400
            });
        }

        if (!name || !brand || !model || !formFactor.length || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            brand,
            model,
            formFactor, // Ora è un array
            dimensions: {
                height: height ? Number(height) : undefined,
                width: width ? Number(width) : undefined,
                depth: depth ? Number(depth) : undefined
            },
            maxGpuLength: maxGpuLength ? Number(maxGpuLength) : undefined,
            maxCpuCoolerHeight: maxCpuCoolerHeight ? Number(maxCpuCoolerHeight) : undefined,
            includedFans: includedFans ? Number(includedFans) : 0,
            panelType: panelType || undefined,
            rgb: rgb === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Case aggiornato con successo',
            case: updatedCase,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.patch('/cases/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        // Gestisco formFactor se presente nella richiesta
        if (updates.formFactor) {
            if (typeof updates.formFactor === 'string') {
                updates.formFactor = [updates.formFactor];
            } else if (!Array.isArray(updates.formFactor)) {
                return res.status(400).json({
                    message: 'Il campo formFactor deve essere un array o una stringa',
                    statusCode: 400
                });
            }
        }

        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        if (updates.includedFans) updates.includedFans = Number(updates.includedFans);
        if (updates.maxGpuLength) updates.maxGpuLength = Number(updates.maxGpuLength);
        if (updates.maxCpuCoolerHeight) updates.maxCpuCoolerHeight = Number(updates.maxCpuCoolerHeight);
        if (updates.rgb) updates.rgb = updates.rgb === 'true';

        if (updates.height || updates.width || updates.depth) {
            updates.dimensions = updates.dimensions || {};
            if (updates.height) {
                updates.dimensions.height = Number(updates.height);
                delete updates.height;
            }
            if (updates.width) {
                updates.dimensions.width = Number(updates.width);
                delete updates.width;
            }
            if (updates.depth) {
                updates.dimensions.depth = Number(updates.depth);
                delete updates.depth;
            }
        }

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Case aggiornato parzialmente con successo',
            case: updatedCase,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.patch('/cases/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedCase = await Case.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedCase) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine del case aggiornata con successo',
            imageUrl: updatedCase.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerCase.delete('/cases/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedCase = await Case.findByIdAndDelete(req.params.id);

        if (!deletedCase) {
            return res.status(404).json({
                message: 'Case non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Case eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione del case:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerCase;