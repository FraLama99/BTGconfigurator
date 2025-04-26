import express from 'express';
import mongoose from 'mongoose';
import { verifyToken } from '../middlewares/authMidd.js';
import { isAdmin } from '../middlewares/authMidd.js';

import CustomMachine from '../modelli/customMachine.js';
// Importa i modelli necessari per i componenti
import CPU from '../modelli/CPU.js';
import Motherboard from '../modelli/MB.js';
import RAM from '../modelli/RAM.js';
import GPU from '../modelli/GPU.js';
import Storage from '../modelli/storage.js';
import PowerSupply from '../modelli/power.js';
import Case from '../modelli/case.js';
import Cooling from '../modelli/cooling.js';

const routerCustomMachines = express.Router();

// Helper per ottenere il modello corretto in base al tipo di componente
function getModelByComponentType(type) {
    switch (type) {
        case 'cpu': return CPU;
        case 'motherboard': return Motherboard;
        case 'ram': return RAM;
        case 'gpu': return GPU;
        case 'storage': return Storage;
        case 'powerSupply': return PowerSupply;
        case 'case': return Case;
        case 'cooling': return Cooling;
        default: return null;
    }
}

// Middleware per validare gli ObjectId di MongoDB
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID non valido',
            statusCode: 400
        });
    }
    next();
};

routerCustomMachines.post('/custom-machines', verifyToken, async (req, res) => {
    console.log("🖥️ Richiesta di creazione configurazione personalizzata ricevuta");
    console.log("📦 Dati ricevuti:", req.body);

    try {
        // Estrai i dati dalla richiesta
        const {
            name,
            basePrice,
            category,
            description,
            components,
            originalPresetId
        } = req.body;

        // Validazioni dei dati
        if (!name || !category || !components || basePrice === undefined || !originalPresetId) {
            console.error("❌ Dati mancanti nella richiesta");
            return res.status(400).json({
                message: 'Nome, categoria, componenti, prezzo base e ID preset originale sono obbligatori',
                statusCode: 400
            });
        }

        // Ottieni la configurazione originale per confrontare i componenti
        const originalPreset = await mongoose.model('PresetMachine').findById(originalPresetId)
            .populate('components.ram')
            .populate('components.gpu');

        if (!originalPreset) {
            return res.status(404).json({
                message: 'Preset originale non trovato',
                statusCode: 404
            });
        }

        // Inizia con il prezzo base
        let finalPrice = parseFloat(basePrice) || 0;
        const componentPrices = {};

        // Registra i prezzi di tutti i componenti (per riferimento)
        for (const [componentType, componentId] of Object.entries(components)) {
            if (!componentId) continue;

            try {
                let Model = getModelByComponentType(componentType);
                if (!Model) continue;

                const component = await Model.findById(componentId);
                if (component && component.price) {
                    componentPrices[componentType] = component.price;
                }
            } catch (err) {
                console.error(`Errore nel recupero del prezzo per ${componentType}:`, err);
            }
        }

        // Calcola le differenze di prezzo solo per RAM e GPU
        // Per la RAM
        if (components.ram && originalPreset.components.ram) {
            const originalRamId = originalPreset.components.ram._id ?
                originalPreset.components.ram._id.toString() :
                originalPreset.components.ram.toString();

            if (components.ram.toString() !== originalRamId) {
                // La RAM è stata cambiata
                const originalRamPrice = originalPreset.components.ram.price || 0;
                const newRamPrice = componentPrices.ram || 0;

                console.log(`Aggiornamento prezzo RAM: originale ${originalRamPrice}, nuovo ${newRamPrice}`);
                finalPrice = finalPrice - originalRamPrice + newRamPrice;
            }
        }

        // Per la GPU
        if (components.gpu && originalPreset.components.gpu) {
            const originalGpuId = originalPreset.components.gpu._id ?
                originalPreset.components.gpu._id.toString() :
                originalPreset.components.gpu.toString();

            if (components.gpu.toString() !== originalGpuId) {
                // La GPU è stata cambiata
                const originalGpuPrice = originalPreset.components.gpu.price || 0;
                const newGpuPrice = componentPrices.gpu || 0;

                console.log(`Aggiornamento prezzo GPU: originale ${originalGpuPrice}, nuovo ${newGpuPrice}`);
                finalPrice = finalPrice - originalGpuPrice + newGpuPrice;
            }
        }

        console.log("Prezzi componenti calcolati:", componentPrices);
        console.log("Prezzo finale calcolato:", finalPrice);

        // Crea una nuova istanza di CustomMachine
        const customMachine = new CustomMachine({
            name,
            description: description || '',
            category,
            components,
            componentPrices,
            basePrice: parseFloat(basePrice.toFixed(2)),
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            originalPresetId,
            userId: req.user.id, // Associa all'utente corrente
            status: 'saved'
        });

        console.log("📝 Configurazione da salvare:", customMachine);

        // Salva la configurazione personalizzata
        const savedMachine = await customMachine.save();
        console.log("✅ Configurazione salvata con ID:", savedMachine._id);

        // Restituisci la risposta
        res.status(201).json({
            message: 'Configurazione personalizzata creata con successo',
            machine: savedMachine,
            statusCode: 201
        });
    } catch (error) {
        console.error("❌ Errore nel salvataggio:", error);
        res.status(500).json({
            message: error.message || 'Errore interno del server',
            error: error.toString(),
            stackTrace: error.stack,
            statusCode: 500
        });
    }
});
// Ottiene tutte le configurazioni personalizzate di un utente
routerCustomMachines.get('/custom-machines', verifyToken, async (req, res) => {
    try {
        const customMachines = await CustomMachine.find({ userId: req.user.id })
            .populate('originalPresetId')
            .sort({ createdAt: -1 });

        res.status(200).json(customMachines);
    } catch (error) {
        console.error('Errore nel recupero delle configurazioni personalizzate:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottiene una configurazione personalizzata specifica
routerCustomMachines.get('/custom-machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const customMachine = await CustomMachine.findOne({
            _id: req.params.id,
            userId: req.user.id
        })
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling')
            .populate('originalPresetId');

        if (!customMachine) {
            return res.status(404).json({
                message: 'Configurazione personalizzata non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(customMachine);
    } catch (error) {
        console.error('Errore nel recupero della configurazione personalizzata:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina una configurazione personalizzata
routerCustomMachines.delete('/custom-machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const customMachine = await CustomMachine.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!customMachine) {
            return res.status(404).json({
                message: 'Configurazione personalizzata non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Configurazione personalizzata eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della configurazione personalizzata:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Modifica una configurazione personalizzata
routerCustomMachines.put('/custom-machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const customMachine = await CustomMachine.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!customMachine) {
            return res.status(404).json({
                message: 'Configurazione personalizzata non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Configurazione personalizzata aggiornata con successo',
            machine: customMachine,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della configurazione personalizzata:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerCustomMachines;