import CPU from '../modelli/CPU.js';
import Motherboard from '../modelli/MB.js';
import RAM from '../modelli/RAM.js';
import GPU from '../modelli/GPU.js';
import Storage from '../modelli/storage.js';
import PowerSupply from '../modelli/power.js';
import Case from '../modelli/case.js';
import Cooling from '../modelli/cooling.js';

// Aggiorna updateComponentsStock per gestire anche la quantità
export const updateComponentsStock = async (components, quantity = 1) => {
    const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        details: []
    };

    try {
        // Array delle promesse per aggiornamenti componenti
        const updatePromises = [];

        // CPU
        if (components.cpu && components.cpu.id) {
            updatePromises.push(
                // Usa findOneAndUpdate con la condizione per prevenire stock negativi
                CPU.findOneAndUpdate(
                    { _id: components.cpu.id, stock: { $gte: quantity } }, // Assicura che lo stock sia >= quantità
                    { $inc: { stock: -quantity } }, // Decrementa in base alla quantità
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'CPU',
                            id: components.cpu.id,
                            name: components.cpu.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'CPU',
                            id: components.cpu.id,
                            name: components.cpu.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // Applica lo stesso pattern per gli altri componenti
        // Motherboard
        if (components.motherboard && components.motherboard.id) {
            updatePromises.push(
                Motherboard.findOneAndUpdate(
                    { _id: components.motherboard.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'Motherboard',
                            id: components.motherboard.id,
                            name: components.motherboard.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'Motherboard',
                            id: components.motherboard.id,
                            name: components.motherboard.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // RAM
        if (components.ram && components.ram.id) {
            updatePromises.push(
                RAM.findOneAndUpdate(
                    { _id: components.ram.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    // Logica di gestione risultato simile...
                    // ...
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'RAM',
                            id: components.ram.id,
                            name: components.ram.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'RAM',
                            id: components.ram.id,
                            name: components.ram.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // GPU
        if (components.gpu && components.gpu.id) {
            updatePromises.push(
                GPU.findOneAndUpdate(
                    { _id: components.gpu.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'GPU',
                            id: components.gpu.id,
                            name: components.gpu.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'GPU',
                            id: components.gpu.id,
                            name: components.gpu.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // Storage
        if (components.storage && components.storage.id) {
            updatePromises.push(
                Storage.findOneAndUpdate(
                    { _id: components.storage.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'Storage',
                            id: components.storage.id,
                            name: components.storage.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'Storage',
                            id: components.storage.id,
                            name: components.storage.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // PowerSupply
        if (components.powerSupply && components.powerSupply.id) {
            updatePromises.push(
                PowerSupply.findOneAndUpdate(
                    { _id: components.powerSupply.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'PowerSupply',
                            id: components.powerSupply.id,
                            name: components.powerSupply.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'PowerSupply',
                            id: components.powerSupply.id,
                            name: components.powerSupply.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // Case
        if (components.case && components.case.id) {
            updatePromises.push(
                Case.findOneAndUpdate(
                    { _id: components.case.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'Case',
                            id: components.case.id,
                            name: components.case.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'Case',
                            id: components.case.id,
                            name: components.case.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // Cooling
        if (components.cooling && components.cooling.id) {
            updatePromises.push(
                Cooling.findOneAndUpdate(
                    { _id: components.cooling.id, stock: { $gte: quantity } },
                    { $inc: { stock: -quantity } },
                    { new: true }
                ).then(updated => {
                    if (updated) {
                        results.success++;
                        results.details.push({
                            type: 'Cooling',
                            id: components.cooling.id,
                            name: components.cooling.name,
                            newStock: updated.stock,
                            quantity: quantity,
                            status: 'success'
                        });
                    } else {
                        results.failed++;
                        results.details.push({
                            type: 'Cooling',
                            id: components.cooling.id,
                            name: components.cooling.name,
                            quantity: quantity,
                            status: 'failed',
                            reason: 'Stock insufficiente o componente non trovato'
                        });
                    }
                    return updated;
                })
            );
        }

        // Attendi che tutte le promesse siano risolte
        await Promise.all(updatePromises);

        return results;
    } catch (error) {
        console.error('Errore nell\'aggiornamento dello stock:', error);
        results.error = error.message;
        return results;
    }
};

export const checkComponentsAvailability = async (components) => {
    try {
        const checkPromises = [];
        const unavailableComponents = [];
        const incompatibilities = [];

        // Prima recuperiamo tutti i componenti necessari
        const componentsData = {};

        // Verifica ogni componente, se è richiesto
        if (components.cpu && components.cpu.id) {
            checkPromises.push(
                CPU.findById(components.cpu.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'CPU',
                            id: components.cpu.id,
                            name: components.cpu.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.cpu = component;
                    }
                    return component;
                })
            );
        }

        if (components.motherboard && components.motherboard.id) {
            checkPromises.push(
                Motherboard.findById(components.motherboard.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'Motherboard',
                            id: components.motherboard.id,
                            name: components.motherboard.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.motherboard = component;
                    }
                    return component;
                })
            );
        }

        if (components.ram && components.ram.id) {
            checkPromises.push(
                RAM.findById(components.ram.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'RAM',
                            id: components.ram.id,
                            name: components.ram.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.ram = component;
                    }
                    return component;
                })
            );
        }

        if (components.gpu && components.gpu.id) {
            checkPromises.push(
                GPU.findById(components.gpu.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'GPU',
                            id: components.gpu.id,
                            name: components.gpu.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.gpu = component;
                    }
                    return component;
                })
            );
        }

        // Aggiungi gli altri componenti seguendo lo stesso pattern...
        if (components.storage && components.storage.id) {
            checkPromises.push(
                Storage.findById(components.storage.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'Storage',
                            id: components.storage.id,
                            name: components.storage.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.storage = component;
                    }
                    return component;
                })
            );
        }

        if (components.powerSupply && components.powerSupply.id) {
            checkPromises.push(
                PowerSupply.findById(components.powerSupply.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'PowerSupply',
                            id: components.powerSupply.id,
                            name: components.powerSupply.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.powerSupply = component;
                    }
                    return component;
                })
            );
        }

        if (components.case && components.case.id) {
            checkPromises.push(
                Case.findById(components.case.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'Case',
                            id: components.case.id,
                            name: components.case.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.case = component;
                    }
                    return component;
                })
            );
        }

        if (components.cooling && components.cooling.id) {
            checkPromises.push(
                Cooling.findById(components.cooling.id).then(component => {
                    if (!component || component.stock < 1) {
                        unavailableComponents.push({
                            type: 'Cooling',
                            id: components.cooling.id,
                            name: components.cooling.name,
                            available: component ? component.stock : 0
                        });
                    }
                    if (component) {
                        componentsData.cooling = component;
                    }
                    return component;
                })
            );
        }

        await Promise.all(checkPromises);

        // Verifica di compatibilità tra RAM e Motherboard
        if (componentsData.ram && componentsData.motherboard) {
            // Verifica compatibilità memoryType
            if (componentsData.ram.memoryType !== componentsData.motherboard.memoryType) {
                incompatibilities.push({
                    type: 'MemoryType',
                    components: [
                        {
                            type: 'RAM',
                            id: componentsData.ram._id,
                            name: componentsData.ram.name,
                            detail: `Tipo di memoria: ${componentsData.ram.memoryType}`
                        },
                        {
                            type: 'Motherboard',
                            id: componentsData.motherboard._id,
                            name: componentsData.motherboard.name,
                            detail: `Tipo di memoria supportato: ${componentsData.motherboard.memoryType}`
                        }
                    ],
                    message: `Incompatibilità: RAM ${componentsData.ram.memoryType} non compatibile con scheda madre che supporta ${componentsData.motherboard.memoryType}`
                });
            }
        }

        return {
            allAvailable: unavailableComponents.length === 0,
            unavailableComponents,
            compatible: incompatibilities.length === 0,
            incompatibilities
        };
    } catch (error) {
        console.error('❌ Errore nella verifica della disponibilità:', error);
        throw error;
    }
};

export default {
    updateComponentsStock,
    checkComponentsAvailability
};