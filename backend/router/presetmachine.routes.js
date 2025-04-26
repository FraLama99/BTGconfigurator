import { Router } from 'express';
import PresetMachine from '../modelli/presetMachine.js';
import Machine from '../modelli/machine.js';
import { verifyToken, isAdmin } from '../middlewares/authMidd.js';
import mongoose from 'mongoose';
import CPU from '../modelli/CPU.js';
import Motherboard from '../modelli/MB.js';
import RAM from '../modelli/RAM.js';
import GPU from '../modelli/GPU.js';
import Storage from '../modelli/storage.js';
import PowerSupply from '../modelli/power.js';
import Case from '../modelli/case.js';
import Cooling from '../modelli/cooling.js';

const routerAdmin = Router();

// Middleware per verificare se l'ObjectId è valido
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID configurazione non valido',
            statusCode: 400
        });
    }
    next();
};

// Middleware per verificare se l'utente è admin


// ========== ROUTE ADMIN PER LA GESTIONE DELLE CONFIGURAZIONI PREDEFINITE ==========

// Ottieni tutte le configurazioni predefinite
routerAdmin.get('/admin/presets', verifyToken, /* isAdmin, */ async (req, res) => {
    try {
        const presets = await PresetMachine.find()
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling');

        res.status(200).json(presets);
    } catch (error) {
        console.error('Errore nel recupero delle configurazioni predefinite:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni una configurazione predefinita specifica per ID
routerAdmin.get('/admin/presets/:id', verifyToken, /* isAdmin, */ validateObjectId, async (req, res) => {
    try {
        const preset = await PresetMachine.findById(req.params.id)
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling');

        if (!preset) {
            return res.status(404).json({
                message: 'Configurazione predefinita non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(preset);
    } catch (error) {
        console.error('Errore nel recupero della configurazione predefinita:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Crea una nuova configurazione predefinita
routerAdmin.post('/admin/presets', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, category, components, basePrice, isActive } = req.body;

        // Verifica dei campi obbligatori
        if (!name || !category || !components || basePrice === undefined) {
            return res.status(400).json({
                message: 'Nome, categoria, componenti e prezzo base sono obbligatori',
                statusCode: 400
            });
        }

        // Verifica che tutti i componenti necessari siano presenti
        const requiredComponents = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'powerSupply', 'case', 'cooling'];
        for (const component of requiredComponents) {
            if (!components[component]) {
                return res.status(400).json({
                    message: `Il componente ${component} è obbligatorio`,
                    statusCode: 400
                });
            }
        }

        // Crea la nuova configurazione predefinita
        const newPreset = new PresetMachine({
            name,
            description: description || '',
            category,
            components,
            basePrice: parseFloat(basePrice.toFixed(2)),
            isActive: isActive !== undefined ? isActive : true
        });

        const savedPreset = await newPreset.save();

        res.status(201).json({
            message: 'Configurazione predefinita creata con successo',
            preset: savedPreset,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della configurazione predefinita:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna una configurazione predefinita
routerAdmin.put('/admin/presets/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const { name, description, category, components, basePrice, isActive } = req.body;

        // Verifica dei campi obbligatori
        if (!name || !category || !components || basePrice === undefined) {
            return res.status(400).json({
                message: 'Nome, categoria, componenti e prezzo base sono obbligatori',
                statusCode: 400
            });
        }

        // Verifica che tutti i componenti necessari siano presenti
        const requiredComponents = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'powerSupply', 'case', 'cooling'];
        for (const component of requiredComponents) {
            if (!components[component]) {
                return res.status(400).json({
                    message: `Il componente ${component} è obbligatorio`,
                    statusCode: 400
                });
            }
        }

        const updatedPreset = await PresetMachine.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description: description || '',
                category,
                components,
                basePrice: parseFloat(basePrice.toFixed(2)),
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!updatedPreset) {
            return res.status(404).json({
                message: 'Configurazione predefinita non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Configurazione predefinita aggiornata con successo',
            preset: updatedPreset,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della configurazione predefinita:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina una configurazione predefinita
routerAdmin.delete('/admin/presets/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const deletedPreset = await PresetMachine.findByIdAndDelete(req.params.id);

        if (!deletedPreset) {
            return res.status(404).json({
                message: 'Configurazione predefinita non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Configurazione predefinita eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della configurazione predefinita:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerAdmin;