import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../modelli/order.js';
import User from '../modelli/user.js';
import Machine from '../modelli/machine.js';
import CustomMachine from '../modelli/customMachine.js';
import { verifyToken, isAdmin } from '../middlewares/authMidd.js';
import { sendOrderConfirmation } from '../middlewares/emailService.js';
import CPU from '../modelli/CPU.js';
import Motherboard from '../modelli/MB.js';
import RAM from '../modelli/RAM.js';
import GPU from '../modelli/GPU.js';
import Storage from '../modelli/storage.js';
import PowerSupply from '../modelli/power.js';
import Case from '../modelli/case.js';
import Cooling from '../modelli/cooling.js';
import { updateComponentsStock, checkComponentsAvailability } from '../middlewares/inventoryMiddleware.js';

const routerOrder = Router();

// Middleware per validare ObjectId
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
            message: 'ID ordine non valido',
            statusCode: 400
        });
    }
    next();
};

// ========== ROUTE PER GLI ORDINI ==========

// Modifica la route di creazione ordine per accettare paymentMethod e altri campi facoltativi

routerOrder.post('/orders', verifyToken, async (req, res) => {
    try {
        const { machines, shippingInfo, paymentMethod, totalPrice: overrideTotalPrice } = req.body;

        // Validazione dei dati di input
        if (!machines || !Array.isArray(machines) || machines.length === 0 || !shippingInfo) {
            return res.status(400).json({
                message: 'Array di macchine e informazioni di spedizione sono obbligatori',
                statusCode: 400
            });
        }

        // Verifica che paymentMethod sia valido se specificato
        if (paymentMethod) {
            const validPaymentMethods = ['creditCard', 'paypal', 'bankTransfer'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return res.status(400).json({
                    message: 'Metodo di pagamento non valido',
                    statusCode: 400
                });
            }
        }

        // Recupera le informazioni dell'utente per la spedizione
        const user = await User.findById(req.user.id);

        // Se l'utente non ha fornito informazioni di spedizione nell'ordine, usa quelle del profilo
        if (!shippingInfo.address && user.address) {
            shippingInfo.address = user.address.street;
            shippingInfo.city = user.address.city;
            shippingInfo.zipCode = user.address.zipCode;
            shippingInfo.country = user.address.country || 'Italia';
        }

        // Array per memorizzare le macchine elaborate
        const processedMachines = [];
        let grandTotalPrice = 0;
        let allComponentsData = {};
        const allInventoryUpdates = [];

        // Elabora ogni macchina nell'array
        for (const machineItem of machines) {
            const { machineType, machineId, quantity = 1 } = machineItem;

            // Verifica che machineType sia valido
            const validMachineTypes = ['machine', 'preset', 'custom', 'standard', 'Machine', 'CustomMachine'];
            if (!validMachineTypes.includes(machineType)) {
                continue; // Salta questa macchina e vai alla prossima
            }

            let machine, components, machinePrice;

            // Recupera la macchina in base al tipo
            if (machineType === 'machine' || machineType === 'Machine') {
                machine = await Machine.findOne({
                    _id: machineId,
                    userId: req.user.id
                }).populate('components.cpu')
                    .populate('components.motherboard')
                    .populate('components.ram')
                    .populate('components.gpu')
                    .populate('components.storage')
                    .populate('components.powerSupply')
                    .populate('components.case')
                    .populate('components.cooling');

                machinePrice = machine ? machine.totalPrice : 0;

                // Estrai componenti
                components = {
                    cpu: machine?.components?.cpu ? {
                        id: machine.components.cpu._id,
                        name: machine.components.cpu.name,
                        price: machine.components.cpu.price
                    } : null,
                    motherboard: machine?.components?.motherboard ? {
                        id: machine.components.motherboard._id,
                        name: machine.components.motherboard.name,
                        price: machine.components.motherboard.price
                    } : null,
                    ram: machine?.components?.ram?.[0] ? {
                        id: machine.components.ram[0]._id,
                        name: machine.components.ram[0].name,
                        price: machine.components.ram[0].price
                    } : null,
                    gpu: machine?.components?.gpu ? {
                        id: machine.components.gpu._id,
                        name: machine.components.gpu.name,
                        price: machine.components.gpu.price
                    } : null,
                    storage: machine?.components?.storage?.[0] ? {
                        id: machine.components.storage[0]._id,
                        name: machine.components.storage[0].name,
                        price: machine.components.storage[0].price
                    } : null,
                    powerSupply: machine?.components?.powerSupply ? {
                        id: machine.components.powerSupply._id,
                        name: machine.components.powerSupply.name,
                        price: machine.components.powerSupply.price
                    } : null,
                    case: machine?.components?.case ? {
                        id: machine.components.case._id,
                        name: machine.components.case.name,
                        price: machine.components.case.price
                    } : null,
                    cooling: machine?.components?.cooling?.[0] ? {
                        id: machine.components.cooling[0]._id,
                        name: machine.components.cooling[0].name,
                        price: machine.components.cooling[0].price
                    } : null
                };

                // Aggiorna lo stato della macchina a "ordered"
                await Machine.findByIdAndUpdate(machineId, { status: 'ordered' });

            } else {
                machine = await CustomMachine.findOne({
                    _id: machineId,
                    userId: req.user.id
                }).populate('components.cpu')
                    .populate('components.motherboard')
                    .populate('components.ram')
                    .populate('components.gpu')
                    .populate('components.storage')
                    .populate('components.powerSupply')
                    .populate('components.case')
                    .populate('components.cooling');

                machinePrice = machine ? machine.finalPrice : 0;

                // Estrai componenti
                components = {
                    cpu: machine?.components?.cpu ? {
                        id: machine.components.cpu._id,
                        name: machine.components.cpu.name,
                        price: machine.components.cpu.price || machine.componentPrices?.cpu
                    } : null,
                    motherboard: machine?.components?.motherboard ? {
                        id: machine.components.motherboard._id,
                        name: machine.components.motherboard.name,
                        price: machine.components.motherboard.price || machine.componentPrices?.motherboard
                    } : null,
                    ram: machine?.components?.ram ? {
                        id: machine.components.ram._id,
                        name: machine.components.ram.name,
                        price: machine.components.ram.price || machine.componentPrices?.ram
                    } : null,
                    gpu: machine?.components?.gpu ? {
                        id: machine.components.gpu._id,
                        name: machine.components.gpu.name,
                        price: machine.components.gpu.price || machine.componentPrices?.gpu
                    } : null,
                    storage: machine?.components?.storage ? {
                        id: machine.components.storage._id,
                        name: machine.components.storage.name,
                        price: machine.components.storage.price || machine.componentPrices?.storage
                    } : null,
                    powerSupply: machine?.components?.powerSupply ? {
                        id: machine.components.powerSupply._id,
                        name: machine.components.powerSupply.name,
                        price: machine.components.powerSupply.price || machine.componentPrices?.powerSupply
                    } : null,
                    case: machine?.components?.case ? {
                        id: machine.components.case._id,
                        name: machine.components.case.name,
                        price: machine.components.case.price || machine.componentPrices?.case
                    } : null,
                    cooling: machine?.components?.cooling ? {
                        id: machine.components.cooling._id,
                        name: machine.components.cooling.name,
                        price: machine.components.cooling.price || machine.componentPrices?.cooling
                    } : null
                };

                // Aggiorna lo stato della macchina a "purchased"
                await CustomMachine.findByIdAndUpdate(machineId, { status: 'purchased' });
            }

            if (!machine) {
                console.warn(`Macchina con ID ${machineId} non trovata, saltata`);
                continue;
            }

            // Verifica disponibilità effettiva dei componenti nel database
            const stockAvailability = await checkComponentsAvailability(components);

            // NUOVO: Aggiorna lo stock dei componenti utilizzati nell'ordine
            const stockUpdateResults = await updateComponentsStock(components);
            allInventoryUpdates.push(stockUpdateResults);

            // Aggiorna il totale generale
            grandTotalPrice += machinePrice * quantity;

            // Aggiungi la macchina elaborata all'array
            processedMachines.push({
                machineType: machineType === 'machine' || machineType === 'standard' ? 'Machine' : 'CustomMachine',
                machineId: machine._id,
                name: machine.name || 'Configurazione personalizzata',
                quantity,
                price: machinePrice,
                components
            });

            // Aggiungi componenti all'oggetto generale per il calcolo della data di consegna
            for (const [type, component] of Object.entries(components)) {
                if (component && component.id) {
                    allComponentsData[type] = component.id;
                }
            }
        }

        // Se non ci sono macchine valide elaborate
        if (processedMachines.length === 0) {
            return res.status(400).json({
                message: 'Nessuna macchina valida da elaborare',
                statusCode: 400
            });
        }

        // Calcola la data di consegna stimata in base a tutti i componenti
        const { estimatedDelivery, allAvailable, unavailableComponents } =
            await Order.calculateEstimatedDelivery(allComponentsData);

        // Crea il nuovo ordine con array di macchine
        const newOrder = new Order({
            userId: req.user.id,        // ID dell'utente che fa l'ordine
            machines: processedMachines, // Array di macchine elaborate
            shippingInfo,               // Informazioni di spedizione
            paymentMethod: paymentMethod || 'creditCard', // Metodo di pagamento predefinito se non specificato
            paymentStatus: paymentMethod === 'bankTransfer' ? 'pending' : 'completed', // Stato del pagamento
            totalPrice: overrideTotalPrice || grandTotalPrice, // Usa il prezzo fornito dal client se disponibile
            componentsAvailability: {   // Informazioni sulla disponibilità dei componenti
                allAvailable,
                unavailableComponents
            },
            estimatedDeliveryDate: estimatedDelivery  // Data stimata di consegna
        });

        const savedOrder = await newOrder.save();

        try {
            // Svuota il carrello dell'utente
            await User.findByIdAndUpdate(req.user.id, {
                $set: { cart: [] },
                $push: { orders: savedOrder._id } // Aggiungi l'ID dell'ordine all'array orders dell'utente
            });

            console.log(`Carrello dell'utente ${req.user.id} svuotato con successo dopo l'ordine`);
        } catch (cartError) {
            console.error('Errore nello svuotare il carrello:', cartError);
            // Non interrompiamo il processo se la pulizia del carrello fallisce
        }

        // Invia email di conferma all'utente con dettagli aggiuntivi
        try {
            // Preparare un riassunto dei componenti per l'email
            const machinesList = processedMachines.map(machine => {
                const componentsList = Object.entries(machine.components)
                    .filter(([_, component]) => component) // Filtra i componenti nulli
                    .map(([type, component]) => {
                        const typeLabels = {
                            cpu: "Processore",
                            motherboard: "Scheda madre",
                            ram: "RAM",
                            gpu: "Scheda video",
                            storage: "Storage",
                            powerSupply: "Alimentatore",
                            case: "Case",
                            cooling: "Sistema di raffreddamento"
                        };
                        return `${typeLabels[type] || type}: ${component.name}`;
                    });

                return {
                    name: machine.name,
                    quantity: machine.quantity,
                    price: machine.price * machine.quantity,
                    components: componentsList
                };
            });

            // Invia email con maggiori dettagli
            await sendOrderConfirmation(
                user.email,
                user.name || 'Cliente',
                savedOrder.orderNumber,
                savedOrder.estimatedDeliveryDate,
                {
                    machines: machinesList,
                    totalPrice: grandTotalPrice,
                    paymentMethod: paymentMethod || "Non specificato",
                    shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zipCode}, ${shippingInfo.country}`
                }
            );

            console.log(`Email di conferma inviata a ${user.email} per l'ordine ${savedOrder.orderNumber}`);
        } catch (emailError) {
            console.error('Errore nell\'invio dell\'email di conferma:', emailError);
            // Non interrompiamo il processo se l'invio dell'email fallisce
        }

        // Includi le informazioni sull'aggiornamento dello stock nella risposta
        res.status(201).json({
            message: 'Ordine creato con successo e carrello svuotato',
            order: savedOrder,
            machinesProcessed: processedMachines.length,
            stockUpdateResults: allInventoryUpdates,
            statusCode: 201
        });

    } catch (error) {
        console.error('Errore nella creazione dell\'ordine:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni tutti gli ordini dell'utente attuale
routerOrder.get('/orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ orderDate: -1 })
            .lean();  // Converte in oggetto javascript semplice

        // Gestisci la retrocompatibilità per ogni ordine
        const processedOrders = orders.map(order => {
            if (!order.machines && order.machineId) {
                // Versione legacy: c'è un singolo machineId/machineType
                order.machines = [{
                    machineType: order.machineType,
                    machineId: order.machineId,
                    name: order.machineName || 'Configurazione PC',
                    price: order.totalPrice,
                    quantity: 1,
                    components: order.components
                }];
            }
            return order;
        });

        res.status(200).json(processedOrders);
    } catch (error) {
        console.error('Errore nel recupero degli ordini:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni un ordine specifico dell'utente attuale
routerOrder.get('/orders/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            userId: req.user.id
        })
            .populate('machines.machineId')  // Popola i dati di ogni macchina
            .lean();  // Converte in oggetto javascript semplice

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        // Controlla se la proprietà machines esiste
        if (!order.machines && order.machineId) {
            // Versione legacy: c'è un singolo machineId/machineType
            // Crea un array machines con un singolo elemento per retrocompatibilità
            order.machines = [{
                machineType: order.machineType,
                machineId: order.machineId,
                name: order.machineName || 'Configurazione PC',
                price: order.totalPrice,
                quantity: 1,
                components: order.components
            }];
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Errore nel recupero dell\'ordine:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// ========== ROUTE ADMIN ==========

// Ottieni tutti gli ordini (solo admin)
routerOrder.get('/admin/orders', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status, sort, from, to } = req.query;
        let query = {};

        // Filtraggio per stato
        if (status) {
            query.status = status;
        }

        // Filtraggio per data
        if (from || to) {
            query.orderDate = {};
            if (from) {
                query.orderDate.$gte = new Date(from);
            }
            if (to) {
                query.orderDate.$lte = new Date(to);
            }
        }

        // Ordinamento
        let sortOption = { orderDate: -1 }; // default: più recenti prima
        if (sort === 'oldest') {
            sortOption = { orderDate: 1 };
        } else if (sort === 'price-high') {
            sortOption = { totalPrice: -1 };
        } else if (sort === 'price-low') {
            sortOption = { totalPrice: 1 };
        }

        const orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('processedBy', 'name email')
            .populate('machines.machineId')  // Popola i dati di ogni macchina
            .sort(sortOption)
            .lean();

        // Gestisci retrocompatibilità per ogni ordine
        const processedOrders = orders.map(order => {
            if (!order.machines && order.machineId) {
                order.machines = [{
                    machineType: order.machineType,
                    machineId: order.machineId,
                    name: order.machineName || 'Configurazione PC',
                    price: order.totalPrice,
                    quantity: 1,
                    components: order.components
                }];
            }
            return order;
        });

        res.status(200).json(processedOrders);
    } catch (error) {
        console.error('Errore nel recupero degli ordini:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Ottieni un ordine specifico (solo admin)
routerOrder.get('/admin/orders/:id', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone address')
            .populate('processedBy', 'name email')
            .populate('machines.machineId')  // Popola i dati di ogni macchina
            .lean();

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        // Gestisci retrocompatibilità
        if (!order.machines && order.machineId) {
            order.machines = [{
                machineType: order.machineType,
                machineId: order.machineId,
                name: order.machineName || 'Configurazione PC',
                price: order.totalPrice,
                quantity: 1,
                components: order.components
            }];
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Errore nel recupero dell\'ordine:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerOrder.patch('/admin/orders/:id/status', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        const { status, notes, paymentStatus: clientPaymentStatus, estimatedDeliveryDate } = req.body;

        if (!status || !['pending', 'processing', 'assembled', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                message: 'Stato non valido',
                statusCode: 400
            });
        }

        // Verifica stato del pagamento corrente
        const currentOrder = await Order.findById(req.params.id);
        if (!currentOrder) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        // Inizializza l'oggetto updateData all'inizio
        const updateData = {
            status,
            updatedAt: new Date()
        };

        // Gestione dello stato di pagamento
        // Se il client ha fornito un paymentStatus, usa quello
        if (clientPaymentStatus && ['pending', 'completed', 'refunded', 'failed'].includes(clientPaymentStatus)) {
            updateData.paymentStatus = clientPaymentStatus;
        }
        // Altrimenti calcola automaticamente il paymentStatus in base allo stato dell'ordine
        else {
            let paymentStatus = currentOrder.paymentStatus;

            if (status === 'cancelled') {
                paymentStatus = currentOrder.paymentStatus === 'completed' ? 'refunded' : 'failed';
            } else if (status === 'delivered') {
                paymentStatus = 'completed';
            } else if (status === 'processing' && currentOrder.paymentMethod === 'bankTransfer') {
                paymentStatus = 'pending';
            }

            updateData.paymentStatus = paymentStatus;
        }

        // Aggiungi data di consegna stimata se presente
        if (estimatedDeliveryDate) {
            updateData.estimatedDeliveryDate = estimatedDeliveryDate;
        }

        // Aggiungi note se presenti
        if (notes) {
            updateData.notes = notes;
        }

        // Se lo stato passa a "processing", registra l'admin che l'ha evaso
        if (status === 'processing') {
            updateData.processedBy = req.user.id;
            updateData.processedDate = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('userId', 'name email');

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: `Stato dell'ordine aggiornato a "${status}"`,
            order,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dello stato dell\'ordine:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});
// Dashboard per analisi ordini (solo admin)
routerOrder.get('/admin/orders-analytics', verifyToken, isAdmin, async (req, res) => {
    try {
        // Totali ordini
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        // Ordini per stato
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Ordini per tipo di macchina
        const ordersByType = await Order.aggregate([
            {
                $group: {
                    _id: '$machineType',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Ordini negli ultimi 7 giorni
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentOrders = await Order.aggregate([
            {
                $match: {
                    orderDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            ordersByStatus,
            ordersByType,
            recentOrders
        });
    } catch (error) {
        console.error('Errore nel recupero delle analitiche degli ordini:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});


// Aggiungi questa route per il ripristino dello stock
routerOrder.post('/admin/orders/:id/restore-stock', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        // Recupera l'ordine
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        // Crea un oggetto per aumentare lo stock (inverso di updateComponentsStock)
        const updatePromises = [];
        const stockUpdates = [];

        // Per ogni componente nell'ordine
        const { components } = order;

        // Ripristina lo stock per ogni componente
        if (components.cpu && components.cpu.id) {
            updatePromises.push(
                CPU.findByIdAndUpdate(
                    components.cpu.id,
                    { $inc: { stock: 1 } }, // Incrementa lo stock di 1
                    { new: true }
                ).then(updated => {
                    stockUpdates.push({
                        type: 'CPU',
                        id: components.cpu.id,
                        name: components.cpu.name,
                        newStock: updated ? updated.stock : 'non trovato'
                    });
                    return updated;
                })
            );
        }



        // Implementa lo stesso pattern per gli altri componenti...

        // Attendi che tutti gli aggiornamenti siano completati
        const results = await Promise.allSettled(updatePromises);

        // Aggiorna lo stato dell'ordine
        await Order.findByIdAndUpdate(req.params.id, {
            $set: { status: 'cancelled' },
            $push: {
                tracking: {
                    status: 'stock-restored',
                    date: new Date(),
                    details: {
                        action: 'stock-increase',
                        componentsUpdated: results.filter(r => r.status === 'fulfilled').length,
                        componentsFailed: results.filter(r => r.status === 'rejected').length,
                        by: req.user.id
                    }
                }
            }
        });

        res.status(200).json({
            message: 'Stock ripristinato con successo',
            updates: stockUpdates,
            statusCode: 200
        });

    } catch (error) {
        console.error('Errore nel ripristino dello stock:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerOrder.get('/admin/orders/:id/inventory', verifyToken, isAdmin, validateObjectId, async (req, res) => {
    try {
        // Recupera l'ordine
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato',
                statusCode: 404
            });
        }

        // Array per memorizzare i dati dei componenti
        const componentsData = [];
        // Set per tenere traccia degli ID dei componenti già elaborati per evitare duplicati
        const processedComponentIds = new Set();
        // Array di promesse per il recupero dei componenti
        const componentQueries = [];

        // Verifica se l'ordine ha il nuovo schema con machines array
        if (order.machines && Array.isArray(order.machines) && order.machines.length > 0) {
            console.log('Rilevato ordine con array "machines"');

            // Elabora ogni macchina nell'array
            for (const machine of order.machines) {
                if (!machine.components) continue;

                // Per ogni macchina, recupera i componenti
                const components = machine.components;

                // CPU
                if (components.cpu && components.cpu.id && !processedComponentIds.has(components.cpu.id.toString())) {
                    processedComponentIds.add(components.cpu.id.toString());
                    componentQueries.push(
                        CPU.findById(components.cpu.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // Motherboard
                if (components.motherboard && components.motherboard.id && !processedComponentIds.has(components.motherboard.id.toString())) {
                    processedComponentIds.add(components.motherboard.id.toString());
                    componentQueries.push(
                        Motherboard.findById(components.motherboard.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // RAM
                if (components.ram && components.ram.id && !processedComponentIds.has(components.ram.id.toString())) {
                    processedComponentIds.add(components.ram.id.toString());
                    componentQueries.push(
                        RAM.findById(components.ram.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // GPU
                if (components.gpu && components.gpu.id && !processedComponentIds.has(components.gpu.id.toString())) {
                    processedComponentIds.add(components.gpu.id.toString());
                    componentQueries.push(
                        GPU.findById(components.gpu.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // Storage
                if (components.storage && components.storage.id && !processedComponentIds.has(components.storage.id.toString())) {
                    processedComponentIds.add(components.storage.id.toString());
                    componentQueries.push(
                        Storage.findById(components.storage.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // Power Supply
                if (components.powerSupply && components.powerSupply.id && !processedComponentIds.has(components.powerSupply.id.toString())) {
                    processedComponentIds.add(components.powerSupply.id.toString());
                    componentQueries.push(
                        PowerSupply.findById(components.powerSupply.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // Case
                if (components.case && components.case.id && !processedComponentIds.has(components.case.id.toString())) {
                    processedComponentIds.add(components.case.id.toString());
                    componentQueries.push(
                        Case.findById(components.case.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }

                // Cooling
                if (components.cooling && components.cooling.id && !processedComponentIds.has(components.cooling.id.toString())) {
                    processedComponentIds.add(components.cooling.id.toString());
                    componentQueries.push(
                        Cooling.findById(components.cooling.id)
                            .select('_id name stock price')
                            .then(component => component ? componentsData.push(component) : null)
                    );
                }
            }
        }
        // Retrocompatibilità: gestisci il vecchio schema con components a livello dell'ordine
        else if (order.components) {
            console.log('Rilevato ordine con schema legacy: components a livello ordine');

            const { components } = order;

            // CPU
            if (components.cpu && components.cpu.id) {
                componentQueries.push(
                    CPU.findById(components.cpu.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // Motherboard
            if (components.motherboard && components.motherboard.id) {
                componentQueries.push(
                    Motherboard.findById(components.motherboard.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // RAM
            if (components.ram && components.ram.id) {
                componentQueries.push(
                    RAM.findById(components.ram.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // GPU
            if (components.gpu && components.gpu.id) {
                componentQueries.push(
                    GPU.findById(components.gpu.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // Storage
            if (components.storage && components.storage.id) {
                componentQueries.push(
                    Storage.findById(components.storage.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // Power Supply
            if (components.powerSupply && components.powerSupply.id) {
                componentQueries.push(
                    PowerSupply.findById(components.powerSupply.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // Case
            if (components.case && components.case.id) {
                componentQueries.push(
                    Case.findById(components.case.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }

            // Cooling
            if (components.cooling && components.cooling.id) {
                componentQueries.push(
                    Cooling.findById(components.cooling.id)
                        .select('_id name stock price')
                        .then(component => component ? componentsData.push(component) : null)
                );
            }
        } else {
            console.log('Nessun componente trovato nell\'ordine');
        }

        // Log del numero di query da eseguire
        console.log(`Esecuzione di ${componentQueries.length} query per il recupero dei componenti`);

        // Attendi che tutte le query siano completate
        await Promise.all(componentQueries);

        // Log dei componenti recuperati
        console.log(`Recuperati ${componentsData.length} componenti dall'inventario`);

        // Restituisci i dati dell'inventario
        res.status(200).json({
            message: 'Dati inventario componenti recuperati con successo',
            components: componentsData,
            statusCode: 200
        });

    } catch (error) {
        console.error('Errore nel recupero dei dati dell\'inventario:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});


routerOrder.get('/admin/inventory', verifyToken, isAdmin, async (req, res) => {
    try {
        // Recupera i componenti per categoria con filtri opzionali
        const { search, category, stockBelow, sortBy, order } = req.query;

        // Crea filtri di base
        const baseFilter = {};

        // Aggiunge filtro di ricerca se presente
        if (search) {
            baseFilter.name = { $regex: search, $options: 'i' };
        }

        // Aggiunge filtro per stock minimo se presente
        if (stockBelow && !isNaN(stockBelow)) {
            baseFilter.stock = { $lte: parseInt(stockBelow) };
        }

        // Opzioni di ordinamento
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'desc' ? -1 : 1;
        } else {
            // Ordinamento predefinito per stock (ascendente)
            sortOptions.stock = 1;
        }

        // Recupero parallelo dei componenti da tutti i modelli
        const [cpus, motherboards, rams, gpus, storages, powerSupplies, cases, coolings] = await Promise.all([
            CPU.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            Motherboard.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            RAM.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            GPU.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            Storage.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            PowerSupply.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            Case.find(baseFilter).select('_id name brand price stock').sort(sortOptions),
            Cooling.find(baseFilter).select('_id name brand price stock').sort(sortOptions)
        ]);

        // Calcola statistiche di stock per ogni categoria
        const calculateStats = (components) => {
            if (!components.length) return { total: 0, outOfStock: 0, lowStock: 0 };

            return {
                total: components.length,
                outOfStock: components.filter(c => c.stock === 0).length,
                lowStock: components.filter(c => c.stock > 0 && c.stock <= 5).length
            };
        };

        // Restituisce tutti i componenti raggruppati per categoria o solo una categoria specifica
        let result;

        if (category) {
            // Se è specificata una categoria, restituisce solo quella
            switch (category.toLowerCase()) {
                case 'cpu': result = { cpus }; break;
                case 'motherboard': result = { motherboards }; break;
                case 'ram': result = { rams }; break;
                case 'gpu': result = { gpus }; break;
                case 'storage': result = { storages }; break;
                case 'power': case 'powersupply': result = { powerSupplies }; break;
                case 'case': result = { cases }; break;
                case 'cooling': result = { coolings }; break;
                default: result = { error: 'Categoria non valida' };
            }
        } else {
            // Altrimenti restituisce tutti i componenti raggruppati
            result = {
                cpus,
                motherboards,
                rams,
                gpus,
                storages,
                powerSupplies,
                cases,
                coolings
            };
        }

        // Aggiunge statistiche generali
        const stats = {
            totalComponents: cpus.length + motherboards.length + rams.length +
                gpus.length + storages.length + powerSupplies.length +
                cases.length + coolings.length,
            outOfStockComponents:
                cpus.filter(c => c.stock === 0).length +
                motherboards.filter(c => c.stock === 0).length +
                rams.filter(c => c.stock === 0).length +
                gpus.filter(c => c.stock === 0).length +
                storages.filter(c => c.stock === 0).length +
                powerSupplies.filter(c => c.stock === 0).length +
                cases.filter(c => c.stock === 0).length +
                coolings.filter(c => c.stock === 0).length,
            categoryStats: {
                cpu: calculateStats(cpus),
                motherboard: calculateStats(motherboards),
                ram: calculateStats(rams),
                gpu: calculateStats(gpus),
                storage: calculateStats(storages),
                powerSupply: calculateStats(powerSupplies),
                case: calculateStats(cases),
                cooling: calculateStats(coolings)
            }
        };

        res.status(200).json({
            message: 'Inventario componenti recuperato con successo',
            inventory: result,
            stats,
            statusCode: 200
        });

    } catch (error) {
        console.error('Errore nel recupero dell\'inventario:', error);
        res.status(500).json({
            message: 'Errore nel recupero dell\'inventario: ' + error.message,
            statusCode: 500
        });
    }
});

// Aggiungi questa route per accedere agli ordini per la stampa (accessibile a tutti gli utenti autenticati)
routerOrder.get('/print/orders/:id', verifyToken, validateObjectId, async (req, res) => {
    try {
        // Cerca l'ordine, sia in base all'ID utente che senza restrizioni per gli admin
        let order;

        if (req.user.role === 'admin') {
            // Se è un admin, può accedere a qualsiasi ordine
            order = await Order.findById(req.params.id)
                .populate('userId', 'name email phone address')
                .populate('processedBy', 'name email')
                .populate('machines.machineId')
                .lean();
        } else {
            // Se è un utente normale, può accedere solo ai propri ordini
            order = await Order.findOne({
                _id: req.params.id,
                userId: req.user.id
            })
                .populate('userId', 'name email phone address')
                .populate('machines.machineId')
                .lean();
        }

        if (!order) {
            return res.status(404).json({
                message: 'Ordine non trovato o non hai il permesso di visualizzarlo',
                statusCode: 404
            });
        }

        // Gestisci retrocompatibilità
        if (!order.machines && order.machineId) {
            order.machines = [{
                machineType: order.machineType,
                machineId: order.machineId,
                name: order.machineName || 'Configurazione PC',
                price: order.totalPrice,
                quantity: 1,
                components: order.components
            }];
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Errore nel recupero dell\'ordine per la stampa:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

export default routerOrder;