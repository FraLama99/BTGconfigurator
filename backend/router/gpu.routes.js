import { Router } from 'express';
import GPU from '../modelli/GPU.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js';
import mongoose from 'mongoose';

const routerGPU = Router();

// Middleware per verificare se l'ObjectId è valido
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID GPU non valido',
            statusCode: 400
        });
    }
    next();
};

// ========== ROUTE GET (Richiede solo autenticazione) ==========

// Ottieni tutte le GPU
routerGPU.get('/gpus', verifyToken, async (req, res) => {
    try {
        // Supporto per filtri opzionali
        const filter = {};

        // Filtra per brand se specificato
        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Filtra per chipset se specificato
        if (req.query.chipset) {
            filter.chipset = { $regex: req.query.chipset, $options: 'i' };
        }

        // Filtra per vram se specificato
        if (req.query.vram) {
            filter.vram = Number(req.query.vram);
        }

        // Filtra per range di prezzo
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const gpus = await GPU.find(filter).sort({ price: 1 });

        res.status(200).json(gpus);
    } catch (error) {
        console.error('Errore nel recupero delle GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni una GPU specifica per ID
routerGPU.get('/gpus/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const gpu = await GPU.findById(req.params.id);

        if (!gpu) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(gpu);
    } catch (error) {
        console.error('Errore nel recupero della GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni solo l'immagine di una GPU
routerGPU.get('/gpus/:id/image', async (req, res) => {
    try {
        const gpu = await GPU.findById(req.params.id).select('imageUrl');

        if (!gpu) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        if (!gpu.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questa GPU',
                statusCode: 404
            });
        }

        // Reindirizza all'URL dell'immagine (efficiente per Cloudinary)
        res.redirect(gpu.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// ========== ROUTE POST, PUT, PATCH, DELETE (Richiede admin) ==========

// Crea una nuova GPU (solo admin)
routerGPU.post('/gpus', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, chipset, vram, vramType, coreClock, boostClock,
            length, tdp, powerConnectors, displayPorts, hdmiPorts,
            price, stock, description
        } = req.body;

        // Verifica i campi obbligatori
        if (!name || !brand || !model || !chipset || !vram || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        // Gestione dell'immagine caricata (se presente)
        const imageUrl = req.file ? req.file.path : null;

        const newGPU = new GPU({
            name,
            brand,
            model,
            chipset,
            vram: Number(vram),
            vramType: vramType || '',
            coreClock: coreClock ? Number(coreClock) : undefined,
            boostClock: boostClock ? Number(boostClock) : undefined,
            length: length ? Number(length) : undefined,
            tdp: tdp ? Number(tdp) : undefined,
            powerConnectors: powerConnectors || '',
            displayPorts: displayPorts ? Number(displayPorts) : 0,
            hdmiPorts: hdmiPorts ? Number(hdmiPorts) : 0,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedGPU = await newGPU.save();

        res.status(201).json({
            message: 'GPU creata con successo',
            gpu: savedGPU,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna una GPU completamente (solo admin)
routerGPU.put('/gpus/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, model, chipset, vram, vramType, coreClock, boostClock,
            length, tdp, powerConnectors, displayPorts, hdmiPorts,
            price, stock, description
        } = req.body;

        // Verifica i campi obbligatori
        if (!name || !brand || !model || !chipset || !vram || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        // Caricamento immagine se presente
        const updateData = {
            name,
            brand,
            model,
            chipset,
            vram: Number(vram),
            vramType: vramType || '',
            coreClock: coreClock ? Number(coreClock) : undefined,
            boostClock: boostClock ? Number(boostClock) : undefined,
            length: length ? Number(length) : undefined,
            tdp: tdp ? Number(tdp) : undefined,
            powerConnectors: powerConnectors || '',
            displayPorts: displayPorts ? Number(displayPorts) : 0,
            hdmiPorts: hdmiPorts ? Number(hdmiPorts) : 0,
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        // Aggiorna l'URL dell'immagine solo se è stata caricata una nuova immagine
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedGPU = await GPU.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedGPU) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'GPU aggiornata con successo',
            gpu: updatedGPU,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna parzialmente una GPU (solo admin)
routerGPU.patch('/gpus/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        // Converti i tipi di dato appropriati
        if (updates.vram) updates.vram = Number(updates.vram);
        if (updates.coreClock) updates.coreClock = Number(updates.coreClock);
        if (updates.boostClock) updates.boostClock = Number(updates.boostClock);
        if (updates.length) updates.length = Number(updates.length);
        if (updates.tdp) updates.tdp = Number(updates.tdp);
        if (updates.displayPorts) updates.displayPorts = Number(updates.displayPorts);
        if (updates.hdmiPorts) updates.hdmiPorts = Number(updates.hdmiPorts);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);

        // Aggiorna l'URL dell'immagine solo se è stata caricata una nuova immagine
        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedGPU = await GPU.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedGPU) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'GPU aggiornata parzialmente con successo',
            gpu: updatedGPU,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale della GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna solo l'immagine di una GPU (solo admin)
routerGPU.patch('/gpus/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedGPU = await GPU.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedGPU) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine GPU aggiornata con successo',
            imageUrl: updatedGPU.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina una GPU (solo admin)
routerGPU.delete('/gpus/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedGPU = await GPU.findByIdAndDelete(req.params.id);

        if (!deletedGPU) {
            return res.status(404).json({
                message: 'GPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'GPU eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della GPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerGPU;