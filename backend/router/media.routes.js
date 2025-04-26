import { Router } from 'express';
import Media from '../modelli/media.js';
import verifyToken, { isAdmin } from '../middlewares/authMidd.js';
import uploadCloudinaryUtility from '../middlewares/uploadCloudinaryUtility.js';
import mongoose from 'mongoose';

const routerMedia = Router();

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

/* // ========== ROUTE GET (Accessibili a tutti) ==========

// Ottieni tutti i media
routerMedia.get('/media', async (req, res) => {
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

// Ottieni media per carosello home
routerMedia.get('/media/carousel/home', async (req, res) => {
    try {
        const carouselMedia = await Media.find({
            type: 'carousel',
            category: 'home',
            isActive: true
        }).sort({ order: 1 });

        res.status(200).json(carouselMedia);
    } catch (error) {
        console.error('Errore nel recupero dei media per carosello home:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni media per categoria specifica
routerMedia.get('/media/category/:category', async (req, res) => {
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

// Ottieni un media specifico per ID
routerMedia.get('/media/:id', validateObjectId, async (req, res) => {
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
}); */

// ========== ROUTE POST, PUT, PATCH, DELETE (Solo admin) ==========

// Crea un nuovo media (solo admin)
routerMedia.post('/media', verifyToken, isAdmin, uploadCloudinaryUtility.single('image'), async (req, res) => {
    try {
        const { name, type, category, description, altText, order, isActive } = req.body;

        // Verifica i campi obbligatori
        if (!name || !altText) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori (nome, testo alternativo)',
                statusCode: 400
            });
        }

        // Verifica che sia stata caricata un'immagine
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const newMedia = new Media({
            name,
            type: type || 'image',
            category: category || 'general',
            url: req.file.path,
            cloudinaryId: req.file.filename,
            description: description || '',
            altText,
            order: order ? Number(order) : 0,
            isActive: isActive === undefined ? true : isActive === 'true'
        });

        const savedMedia = await newMedia.save();

        res.status(201).json({
            message: 'Media creato con successo',
            media: savedMedia,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna un media completamente (solo admin)
routerMedia.put('/media/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryUtility.single('image'), async (req, res) => {
    try {
        const { name, type, category, description, altText, order, isActive } = req.body;

        // Verifica i campi obbligatori
        if (!name || !altText) {
            return res.status(400).json({
                message: 'Mancano uno o più campi obbligatori (nome, testo alternativo)',
                statusCode: 400
            });
        }

        const updateData = {
            name,
            type: type || 'image',
            category: category || 'general',
            description: description || '',
            altText,
            order: order ? Number(order) : 0,
            isActive: isActive === undefined ? true : isActive === 'true',
            updatedAt: Date.now()
        };

        // Aggiorna l'URL e l'ID Cloudinary solo se è stata caricata una nuova immagine
        if (req.file) {
            updateData.url = req.file.path;
            updateData.cloudinaryId = req.file.filename;
        }

        const updatedMedia = await Media.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedMedia) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Media aggiornato con successo',
            media: updatedMedia,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna parzialmente un media (solo admin)
routerMedia.patch('/media/:id', verifyToken, isAdmin, validateObjectId, uploadCloudinaryUtility.single('image'), async (req, res) => {
    try {
        const updates = { ...req.body, updatedAt: Date.now() };

        // Converti i tipi di dato appropriati
        if (updates.order) updates.order = Number(updates.order);
        if (updates.isActive !== undefined) updates.isActive = updates.isActive === 'true';

        // Aggiorna l'URL e l'ID Cloudinary solo se è stata caricata una nuova immagine
        if (req.file) {
            updates.url = req.file.path;
            updates.cloudinaryId = req.file.filename;
        }

        const updatedMedia = await Media.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        );

        if (!updatedMedia) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Media aggiornato parzialmente con successo',
            media: updatedMedia,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna solo l'immagine di un media (solo admin)
routerMedia.patch('/media/:id/image', verifyToken, isAdmin, validateObjectId, uploadCloudinaryUtility.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'Nessuna immagine caricata',
                statusCode: 400
            });
        }

        const updatedMedia = await Media.findByIdAndUpdate(
            req.params.id,
            {
                url: req.file.path,
                cloudinaryId: req.file.filename,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedMedia) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Immagine media aggiornata con successo',
            url: updatedMedia.url,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'immagine media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna lo stato attivo/inattivo di un media (solo admin)
routerMedia.patch('/media/:id/toggle-status', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        media.isActive = !media.isActive;
        media.updatedAt = Date.now();

        await media.save();

        res.status(200).json({
            message: `Media ${media.isActive ? 'attivato' : 'disattivato'} con successo`,
            isActive: media.isActive,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nel cambio di stato del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina un media (solo admin)
routerMedia.delete('/media/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedMedia = await Media.findByIdAndDelete(req.params.id);

        if (!deletedMedia) {
            return res.status(404).json({
                message: 'Media non trovato',
                statusCode: 404
            });
        }

        // Nota: qui potresti voler eliminare anche l'immagine da Cloudinary
        // utilizzando deletedMedia.cloudinaryId

        res.status(200).json({
            message: 'Media eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione del media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Riordina i media di una categoria (solo admin)
routerMedia.post('/media/reorder', verifyToken, isAdmin, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: 'Formato dati non valido per il riordino',
                statusCode: 400
            });
        }

        // Esegui le operazioni di aggiornamento in parallelo
        const updatePromises = items.map(item => {
            if (!item.id || item.order === undefined) {
                return Promise.reject(new Error('ID o order mancante per un elemento'));
            }

            return Media.findByIdAndUpdate(
                item.id,
                { order: item.order, updatedAt: Date.now() }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            message: 'Ordine dei media aggiornato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nel riordino dei media:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerMedia;