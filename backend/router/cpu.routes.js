import { Router } from 'express';
import CPU from '../modelli/CPU.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryProduct from '../middlewares/uploadCloudinaryProduct.js'; // Modificato per usare il middleware dei prodotti
import mongoose from 'mongoose';

const routerCPU = Router();

// Middleware per verificare se l'ObjectId è valido
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID CPU non valido',
            statusCode: 400
        });
    }
    next();
};

// ========== ROUTE GET (Richiede solo autenticazione) ==========

// Ottieni tutte le CPU
routerCPU.get('/cpus', verifyToken, async (req, res) => {
    try {
        // Supporto per filtri opzionali
        const filter = {};

        // Filtra per brand se specificato
        if (req.query.brand) {
            filter.brand = { $regex: req.query.brand, $options: 'i' };
        }

        // Filtra per socket se specificato
        if (req.query.socket) {
            filter.socket = { $regex: req.query.socket, $options: 'i' };
        }

        // Filtra per range di prezzo
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        const cpus = await CPU.find(filter).sort({ price: 1 });

        res.status(200).json(cpus);
    } catch (error) {
        console.error('Errore nel recupero delle CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni una CPU specifica per ID
routerCPU.get('/cpus/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const cpu = await CPU.findById(req.params.id);

        if (!cpu) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(cpu);
    } catch (error) {
        console.error('Errore nel recupero della CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni solo l'immagine di una CPU
routerCPU.get('/cpus/:id/image', async (req, res) => {
    try {
        const cpu = await CPU.findById(req.params.id).select('imageUrl');

        if (!cpu) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        if (!cpu.imageUrl) {
            return res.status(404).json({
                message: 'Immagine non disponibile per questa CPU',
                statusCode: 404
            });
        }

        // Reindirizza all'URL dell'immagine (efficiente per Cloudinary)
        res.redirect(cpu.imageUrl);
    } catch (error) {
        console.error('Errore nel recupero dell\'immagine CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// ========== ROUTE POST, PUT, PATCH, DELETE (Richiede admin) ==========

// Crea una nuova CPU (solo admin)
routerCPU.post('/cpus', verifyToken, isAdmin, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, series, model, socket, cores, threads,
            baseFrequency, boostFrequency, tdp, architecture,
            cache, integratedGraphics, price, stock, description
        } = req.body;

        // Verifica i campi obbligatori
        if (!name || !brand || !model || !socket || !cores || !threads || !baseFrequency || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        // Gestione dell'immagine caricata (se presente)
        const imageUrl = req.file ? req.file.path : null;

        const newCPU = new CPU({
            name,
            brand,
            series: series || '',
            model,
            socket,
            cores: Number(cores),
            threads: Number(threads),
            baseFrequency: Number(baseFrequency),
            boostFrequency: boostFrequency ? Number(boostFrequency) : undefined,
            tdp: tdp ? Number(tdp) : undefined,
            architecture: architecture || '',
            cache: cache || '',
            integratedGraphics: integratedGraphics === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            imageUrl,
            description: description || ''
        });

        const savedCPU = await newCPU.save();

        res.status(201).json({
            message: 'CPU creata con successo',
            cpu: savedCPU,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna una CPU completamente (solo admin)
routerCPU.put('/cpus/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const {
            name, brand, series, model, socket, cores, threads,
            baseFrequency, boostFrequency, tdp, architecture,
            cache, integratedGraphics, price, stock, description
        } = req.body;

        // Verifica i campi obbligatori
        if (!name || !brand || !model || !socket || !cores || !threads || !baseFrequency || !price) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori',
                statusCode: 400
            });
        }

        // Caricamento immagine se presente
        const updateData = {
            name,
            brand,
            series: series || '',
            model,
            socket,
            cores: Number(cores),
            threads: Number(threads),
            baseFrequency: Number(baseFrequency),
            boostFrequency: boostFrequency ? Number(boostFrequency) : undefined,
            tdp: tdp ? Number(tdp) : undefined,
            architecture: architecture || '',
            cache: cache || '',
            integratedGraphics: integratedGraphics === 'true',
            price: Number(price),
            stock: stock ? Number(stock) : 0,
            description: description || '',
            updatedAt: Date.now()
        };

        // Aggiorna l'URL dell'immagine solo se è stata caricata una nuova immagine
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedCPU = await CPU.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedCPU) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'CPU aggiornata con successo',
            cpu: updatedCPU,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna parzialmente una CPU (solo admin)
routerCPU.patch('/cpus/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        // Converti i tipi di dato appropriati
        if (updates.cores) updates.cores = Number(updates.cores);
        if (updates.threads) updates.threads = Number(updates.threads);
        if (updates.baseFrequency) updates.baseFrequency = Number(updates.baseFrequency);
        if (updates.boostFrequency) updates.boostFrequency = Number(updates.boostFrequency);
        if (updates.tdp) updates.tdp = Number(updates.tdp);
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        if (updates.integratedGraphics) updates.integratedGraphics = updates.integratedGraphics === 'true';

        // Aggiorna l'URL dell'immagine solo se è stata caricata una nuova immagine
        if (req.file) {
            updates.imageUrl = req.file.path;
        }

        const updatedCPU = await CPU.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedCPU) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'CPU aggiornata parzialmente con successo',
            cpu: updatedCPU,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale della CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna solo l'immagine di una CPU (solo admin)
routerCPU.patch('/cpus/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryProduct.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedCPU = await CPU.findByIdAndUpdate(
            req.params.id,
            {
                imageUrl: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedCPU) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine CPU aggiornata con successo',
            imageUrl: updatedCPU.imageUrl,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina una CPU (solo admin)
routerCPU.delete('/cpus/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedCPU = await CPU.findByIdAndDelete(req.params.id);

        if (!deletedCPU) {
            return res.status(404).json({
                message: 'CPU non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'CPU eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della CPU:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerCPU;