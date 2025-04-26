import { Router } from 'express';
import PowerSupply from '../modelli/power.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerPower = Router();

const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID alimentatore non valido',
            statusCode: 400
        });
    }
    next();
};

routerPower.get('/powersupplies', verifyToken, async (req, res) => {
    try {
        const filter = {};

        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        if (req.query.efficiency) {
            filter.efficiency = { $regex: req.query.efficiency, $options: 'i' };
        }

        if (req.query.modular) {
            filter.modular = { $regex: req.query.modular, $options: 'i' };
        }

        if (req.query.formFactor) {
            filter.formFactor = { $regex: req.query.formFactor, $options: 'i' };
        }

        if (req.query.minWattage || req.query.maxWattage) {
            filter.wattage = {};
            if (req.query.minWattage) filter.wattage.$gte = Number(req.query.minWattage);
            if (req.query.maxWattage) filter.wattage.$lte = Number(req.query.maxWattage);
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const powerSupplies = await PowerSupply.find(filter).sort({ price: 1 });

        res.status(200).json(powerSupplies);
    } catch (error) {
        console.error('Errore nel recupero degli alimentatori:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.get('/powersupplies/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const powerSupply = await PowerSupply.findById(req.params.id);

        if (!powerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        res.status(200).json(powerSupply);
    } catch (error) {
        console.error('Errore nel recupero dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.get('/powersupplies/:id/image', async (req, res) => {
    try {
        const powerSupply = await PowerSupply.findById(req.params.id).select('imageUrl');

        if (!powerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        if (!powerSupply.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questo alimentatore',
                statusCode: 404
            });
        }

        res.redirect(powerSupply.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.post('/powersupplies', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, wattage, efficiency, modular, formFactor,
            price, stock, description
        } = req.body;

        if (!name || !brand || !model || !wattage || !efficiency || !modular || !formFactor || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const imageUrl = req.file ? req.file.path : null;

        const newPowerSupply = new PowerSupply({
            name,
            brand,
            model,
            wattage: Number(wattage),
            efficiency,
            modular,
            formFactor,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedPowerSupply = await newPowerSupply.save();

        res.status(201).json({
            message: 'Alimentatore creato con successo',
            powerSupply: savedPowerSupply,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.put('/powersupplies/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, wattage, efficiency, modular, formFactor,
            price, stock, description
        } = req.body;

        if (!name || !brand || !model || !wattage || !efficiency || !modular || !formFactor || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            brand,
            model,
            wattage: Number(wattage),
            efficiency,
            modular,
            formFactor,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedPowerSupply = await PowerSupply.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedPowerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Alimentatore aggiornato con successo',
            powerSupply: updatedPowerSupply,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.patch('/powersupplies/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        if (updates.wattage) updates.wattage = Number(updates.wattage);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);

        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedPowerSupply = await PowerSupply.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedPowerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Alimentatore aggiornato parzialmente con successo',
            powerSupply: updatedPowerSupply,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.patch('/powersupplies/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedPowerSupply = await PowerSupply.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedPowerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine alimentatore aggiornata con successo',
            imageUrl: updatedPowerSupply.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerPower.delete('/powersupplies/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedPowerSupply = await PowerSupply.findByIdAndDelete(req.params.id);

        if (!deletedPowerSupply) {
            return res.status(404).json({
                message: 'Alimentatore non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Alimentatore eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'alimentatore:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerPower;