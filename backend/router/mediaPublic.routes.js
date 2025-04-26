import { Router } from 'express';
import Media from '../modelli/media.js';
import mongoose from 'mongoose';

const routerMediaPublic = Router();

// Middleware per verificare se l'ObjectId è valido
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID media non valido',
            statusCode: 400
        });
    }
    next();
};

// ========== ROUTE GET PUBBLICHE (Accessibili a tutti) ==========

// Ottieni tutti i media (pubblico)
routerMediaPublic.get('/media', async (req, res) => {
    try {
        // Supporto per filtri opzionali
        const filter = {};

        // Filtra per tipo se specificato
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // Filtra per categoria se specificato
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Filtra per stato attivo/inattivo se specificato
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        const media = await Media.find(filter).sort({ order: 1, createdAt: -1 });

        res.status(200).json(media);
    } catch (error) {
        console.error('Errore nel recupero dei media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni media per carosello home (pubblico)
routerMediaPublic.get('/media/carousel/home', async (req, res) => {
    try {
        console.log('📍 Esecuzione route pubblica /media/carousel/home');
        const carouselMedia = await Media.find({
            type: 'carousel',
            category: 'home',
            isActive: true
        }).sort({ order: 1 }).limit(4);

        // Aggiungi un controllo sugli URL
        const validatedMedia = carouselMedia.map(media => {
            // Converti il documento Mongoose in un oggetto JavaScript semplice
            const mediaObj = media.toObject();

            // Verifica e correggi l'URL se necessario
            if (!mediaObj.url) {
                console.warn(`🚨 Media ${mediaObj._id} ha URL mancante`);
                mediaObj.url = '/images/placeholder.jpg'; // URL di fallback
            } else if (!mediaObj.url.startsWith('http')) {
                console.warn(`🚨 Media ${mediaObj._id} ha URL non valido: ${mediaObj.url}`);
                // In caso di URL relativo, convertilo in assoluto se necessario
                if (mediaObj.url.startsWith('/')) {
                    mediaObj.url = `${process.env.BASE_URL || 'http://localhost:5020'}${mediaObj.url}`;
                }
            }

            return mediaObj;
        });

        res.status(200).json(validatedMedia);
    } catch (error) {
        console.error('Errore nel recupero dei media per carosello home:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni media per categoria specifica (pubblico)
routerMediaPublic.get('/media/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const categoryMedia = await Media.find({
            category,
            isActive: true
        }).sort({ order: 1 });

        res.status(200).json(categoryMedia);
    } catch (error) {
        console.error(`Errore nel recupero dei media per categoria ${req.params.category}:`, error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni un media specifico per ID (pubblico)
routerMediaPublic.get('/media/:id', validateObjectId, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        res.status(200).json(media);
    } catch (error) {
        console.error('Errore nel recupero del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerMediaPublic;