import { Router } from 'express';
import Machine from '../modelli/machine.js';
import verifyToken from '../middlewares/authMidd.js';
import mongoose from 'mongoose';
import CPU from '../modelli/CPU.js';
import Motherboard from '../modelli/MB.js';
import RAM from '../modelli/RAM.js';
import GPU from '../modelli/GPU.js';
import Storage from '../modelli/storage.js';
import PowerSupply from '../modelli/power.js';
import Case from '../modelli/case.js';
import Cooling from '../modelli/cooling.js';
import User from '../modelli/user.js'; // Assicurati di importare il modello utente

const routerMachine = Router();

// Middleware per verificare se l'ObjectId è valido
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID macchina non valido',
            statusCode: 400
        });
    }
    next();
};

// ========== ROUTE GET (Richiede solo autenticazione) ==========

// Ottieni tutte le macchine dell'utente corrente
routerMachine.get('/machines', verifyToken, async (req, res) => {
    try {
        const machines = await Machine.find({ userId: req.user.id })
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling');

        res.status(200).json(machines);
    } catch (error) {
        console.error('Errore nel recupero delle macchine:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni una macchina specifica per ID
routerMachine.get('/machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const machine = await Machine.findOne({
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
            .populate('components.cooling');

        if (!machine) {
            return res.status(404).json({
                message: 'Macchina non trovata',
                statusCode: 404
            });
        }

        res.status(200).json(machine);
    } catch (error) {
        console.error('Errore nel recupero della macchina:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Crea una nuova macchina (utente autenticato)
routerMachine.post('/machines', verifyToken, async (req, res) => {
    try {
        const { name, description, components, status, saveToUser, addToCart } = req.body;

        // Verifica dei campi obbligatori
        if (!name || !components) {
            return res.status(400).json({
                message: 'Nome e componenti sono obbligatori',
                statusCode: 400
            });
        }

        // Calcolo automatico del prezzo totale
        let totalPrice = 250; // Costo fisso per assemblaggio e test

        // Recupero prezzi componenti singoli
        if (components.cpu) {
            const cpu = await CPU.findById(components.cpu);
            if (cpu) totalPrice += cpu.price;
        }

        if (components.motherboard) {
            const motherboard = await Motherboard.findById(components.motherboard);
            if (motherboard) totalPrice += motherboard.price;
        }

        if (components.ram) {
            // Per array di componenti
            if (Array.isArray(components.ram)) {
                for (const ramId of components.ram) {
                    const ram = await RAM.findById(ramId);
                    if (ram) totalPrice += ram.price;
                }
            } else {
                // Per singolo componente
                const ram = await RAM.findById(components.ram);
                if (ram) totalPrice += ram.price;
            }
        }

        if (components.gpu) {
            const gpu = await GPU.findById(components.gpu);
            if (gpu) totalPrice += gpu.price;
        }

        if (components.storage) {
            // Per array di componenti
            if (Array.isArray(components.storage)) {
                for (const storageId of components.storage) {
                    const storage = await Storage.findById(storageId);
                    if (storage) totalPrice += storage.price;
                }
            } else {
                // Per singolo componente
                const storage = await Storage.findById(components.storage);
                if (storage) totalPrice += storage.price;
            }
        }

        if (components.powerSupply) {
            const powerSupply = await PowerSupply.findById(components.powerSupply);
            if (powerSupply) totalPrice += powerSupply.price;
        }

        if (components.case) {
            const computerCase = await Case.findById(components.case);
            if (computerCase) totalPrice += computerCase.price;
        }

        if (components.cooling) {
            // Per array di componenti
            if (Array.isArray(components.cooling)) {
                for (const coolingId of components.cooling) {
                    const cooling = await Cooling.findById(coolingId);
                    if (cooling) totalPrice += cooling.price;
                }
            } else {
                // Per singolo componente
                const cooling = await Cooling.findById(components.cooling);
                if (cooling) totalPrice += cooling.price;
            }
        }

        // Crea la nuova macchina con il prezzo calcolato
        const newMachine = new Machine({
            userId: req.user.id, // Ottieni l'utente dal token
            name,
            description: description || '', // Assicuriamo che la descrizione sia sempre presente
            components,
            totalPrice: parseFloat(totalPrice.toFixed(2)), // Arrotonda a 2 decimali
            status: status || 'draft'
        });

        const savedMachine = await newMachine.save();

        // INIZIO NUOVE FUNZIONALITÀ

        // Se richiesto, salva l'ID della configurazione nell'array savedConfigurations dell'utente
        if (saveToUser) {
            await User.findByIdAndUpdate(
                req.user.id,
                {
                    $addToSet: { savedConfigurations: savedMachine._id }
                },
                { new: true }
            );
            console.log(`Configurazione ${savedMachine._id} salvata per l'utente ${req.user.id}`);
        }

        // Se richiesto, aggiungi al carrello dell'utente
        if (addToCart) {
            await User.findByIdAndUpdate(
                req.user.id,
                {
                    $push: {
                        cart: {
                            itemId: savedMachine._id,
                            itemType: 'machine',
                            quantity: 1,
                            addedAt: new Date()
                        }
                    }
                },
                { new: true }
            );
            console.log(`Configurazione ${savedMachine._id} aggiunta al carrello dell'utente ${req.user.id}`);
        }

        // FINE NUOVE FUNZIONALITÀ

        res.status(201).json({
            message: 'Configurazione creata con successo',
            machine: savedMachine,
            statusCode: 201
        });

    } catch (error) {
        console.error('Errore nella creazione della configurazione:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna una macchina completamente
routerMachine.put('/machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const { name, description, components, status } = req.body;

        // Verifica i campi obbligatori
        if (!name || !components) {
            return res.status(400).json({
                message: 'Nome e componenti sono campi obbligatori',
                statusCode: 400
            });
        }

        // Verifica che la macchina appartenga all'utente
        const existingMachine = await Machine.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!existingMachine) {
            return res.status(404).json({
                message: 'Macchina non trovata',
                statusCode: 404
            });
        }

        // Calcolo automatico del prezzo totale
        let totalPrice = 250; // Costo fisso per assemblaggio e test

        // Recupero prezzi componenti singoli
        if (components.cpu) {
            const cpu = await CPU.findById(components.cpu);
            if (cpu) totalPrice += cpu.price;
        }

        if (components.motherboard) {
            const motherboard = await Motherboard.findById(components.motherboard);
            if (motherboard) totalPrice += motherboard.price;
        }

        if (components.ram) {
            // Per array di componenti
            if (Array.isArray(components.ram)) {
                for (const ramId of components.ram) {
                    const ram = await RAM.findById(ramId);
                    if (ram) totalPrice += ram.price;
                }
            } else {
                // Per singolo componente
                const ram = await RAM.findById(components.ram);
                if (ram) totalPrice += ram.price;
            }
        }

        if (components.gpu) {
            const gpu = await GPU.findById(components.gpu);
            if (gpu) totalPrice += gpu.price;
        }

        if (components.storage) {
            // Per array di componenti
            if (Array.isArray(components.storage)) {
                for (const storageId of components.storage) {
                    const storage = await Storage.findById(storageId);
                    if (storage) totalPrice += storage.price;
                }
            } else {
                // Per singolo componente
                const storage = await Storage.findById(components.storage);
                if (storage) totalPrice += storage.price;
            }
        }

        if (components.powerSupply) {
            const powerSupply = await PowerSupply.findById(components.powerSupply);
            if (powerSupply) totalPrice += powerSupply.price;
        }

        if (components.case) {
            const computerCase = await Case.findById(components.case);
            if (computerCase) totalPrice += computerCase.price;
        }

        if (components.cooling) {
            // Per array di componenti
            if (Array.isArray(components.cooling)) {
                for (const coolingId of components.cooling) {
                    const cooling = await Cooling.findById(coolingId);
                    if (cooling) totalPrice += cooling.price;
                }
            } else {
                // Per singolo componente
                const cooling = await Cooling.findById(components.cooling);
                if (cooling) totalPrice += cooling.price;
            }
        }

        const updatedMachine = await Machine.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description: description || '', // Assicuriamo che la descrizione sia sempre presente
                components,
                totalPrice: parseFloat(totalPrice.toFixed(2)), // Calcola il prezzo totale
                status: status || 'draft',
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Macchina aggiornata con successo',
            machine: updatedMachine,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della macchina:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiorna parzialmente una macchina
routerMachine.patch('/machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        // Verifica che la macchina appartenga all'utente
        const existingMachine = await Machine.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!existingMachine) {
            return res.status(404).json({
                message: 'Macchina non trovata',
                statusCode: 404
            });
        }

        const updates = { ...req.body, updatedAt: Date.now() };

        // Se vengono aggiornati i componenti, ricalcola il prezzo totale
        if (updates.components) {
            let totalPrice = 250; // Costo fisso per assemblaggio e test
            const components = updates.components;

            // Recupero prezzi componenti singoli
            if (components.cpu) {
                const cpu = await CPU.findById(components.cpu);
                if (cpu) totalPrice += cpu.price;
            }

            if (components.motherboard) {
                const motherboard = await Motherboard.findById(components.motherboard);
                if (motherboard) totalPrice += motherboard.price;
            }

            if (components.ram) {
                // Per array di componenti
                if (Array.isArray(components.ram)) {
                    for (const ramId of components.ram) {
                        const ram = await RAM.findById(ramId);
                        if (ram) totalPrice += ram.price;
                    }
                } else {
                    // Per singolo componente
                    const ram = await RAM.findById(components.ram);
                    if (ram) totalPrice += ram.price;
                }
            }

            if (components.gpu) {
                const gpu = await GPU.findById(components.gpu);
                if (gpu) totalPrice += gpu.price;
            }

            if (components.storage) {
                // Per array di componenti
                if (Array.isArray(components.storage)) {
                    for (const storageId of components.storage) {
                        const storage = await Storage.findById(storageId);
                        if (storage) totalPrice += storage.price;
                    }
                } else {
                    // Per singolo componente
                    const storage = await Storage.findById(components.storage);
                    if (storage) totalPrice += storage.price;
                }
            }

            if (components.powerSupply) {
                const powerSupply = await PowerSupply.findById(components.powerSupply);
                if (powerSupply) totalPrice += powerSupply.price;
            }

            if (components.case) {
                const computerCase = await Case.findById(components.case);
                if (computerCase) totalPrice += computerCase.price;
            }

            if (components.cooling) {
                // Per array di componenti
                if (Array.isArray(components.cooling)) {
                    for (const coolingId of components.cooling) {
                        const cooling = await Cooling.findById(coolingId);
                        if (cooling) totalPrice += cooling.price;
                    }
                } else {
                    // Per singolo componente
                    const cooling = await Cooling.findById(components.cooling);
                    if (cooling) totalPrice += cooling.price;
                }
            }

            // Aggiorna il prezzo totale
            updates.totalPrice = parseFloat(totalPrice.toFixed(2));
        }

        const updatedMachine = await Machine.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling');

        res.status(200).json({
            message: 'Macchina aggiornata parzialmente con successo',
            machine: updatedMachine,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento parziale della macchina:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Elimina una macchina
routerMachine.delete('/machines/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        // Verifica che la macchina appartenga all'utente
        const deletedMachine = await Machine.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!deletedMachine) {
            return res.status(404).json({
                message: 'Macchina non trovata',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Macchina eliminata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della macchina:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});


// Ottieni tutte le configurazioni predefinite disponibili
routerMachine.get('/presets', verifyToken, async (req, res) => {
    try {
        const presets = await PresetMachine.find({ isActive: true })
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

// Ottieni una configurazione predefinita specifica
routerMachine.get('/presets/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const preset = await PresetMachine.findOne({
            _id: req.params.id,
            isActive: true
        })
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

// Crea una nuova macchina personalizzata a partire da una configurazione predefinita
routerMachine.post('/machines/from-preset/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        // Verifichiamo che la configurazione predefinita esista e sia attiva
        const preset = await PresetMachine.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!preset) {
            return res.status(404).json({
                message: 'Configurazione predefinita non trovata',
                statusCode: 404
            });
        }

        // Estraiamo i nuovi componenti personalizzabili (RAM e GPU)
        const { ram, gpu, name, description } = req.body;

        // Prepariamo i componenti a partire dalla configurazione predefinita
        const components = { ...preset.components.toObject() };

        // Permettiamo la personalizzazione solo di RAM e GPU
        if (ram) {
            components.ram = ram;
        }

        if (gpu) {
            components.gpu = gpu;
        }

        // Calcoliamo il prezzo totale
        let totalPrice = preset.basePrice;

        // Se la RAM è cambiata, aggiorniamo il prezzo
        if (ram) {
            // Rimuoviamo il prezzo della RAM originale (se possibile determinarlo)
            const originalRam = await RAM.findById(preset.components.ram);
            if (originalRam) {
                totalPrice -= originalRam.price;
            }

            // Aggiungiamo il prezzo della nuova RAM
            const newRam = await RAM.findById(ram);
            if (newRam) {
                totalPrice += newRam.price;
            }
        }

        // Se la GPU è cambiata, aggiorniamo il prezzo
        if (gpu) {
            // Rimuoviamo il prezzo della GPU originale
            const originalGpu = await GPU.findById(preset.components.gpu);
            if (originalGpu) {
                totalPrice -= originalGpu.price;
            }

            // Aggiungiamo il prezzo della nuova GPU
            const newGpu = await GPU.findById(gpu);
            if (newGpu) {
                totalPrice += newGpu.price;
            }
        }

        // Creiamo la nuova macchina personalizzata
        const newMachine = new Machine({
            userId: req.user.id,
            name: name || `${preset.name} Personalizzata`,
            description: description || `Personalizzata da ${preset.name}`,
            components,
            totalPrice: parseFloat(totalPrice.toFixed(2)),
            status: 'draft',
            presetOrigin: preset._id  // Riferimento alla configurazione predefinita di origine
        });

        const savedMachine = await newMachine.save();

        res.status(201).json({
            message: 'Configurazione personalizzata creata con successo',
            machine: savedMachine,
            statusCode: 201
        });
    } catch (error) {
        console.error('Errore nella creazione della configurazione personalizzata:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerMachine;