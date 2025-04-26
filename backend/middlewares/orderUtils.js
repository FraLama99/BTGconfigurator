
export const updateOrderTracking = async (orderId, stockUpdateResults) => {
    try {
        const Order = require('../modelli/order.js');

        // Aggiungi una nuova entry nel tracking dell'ordine
        await Order.findByIdAndUpdate(
            orderId,
            {
                $push: {
                    tracking: {
                        status: 'inventory-update',
                        date: new Date(),
                        details: {
                            action: 'stock-decrease',
                            componentsUpdated: stockUpdateResults.success,
                            componentsFailed: stockUpdateResults.failed,
                            updateDetails: stockUpdateResults.updates
                        }
                    }
                }
            }
        );

        console.log(`✅ Tracking aggiornato per l'ordine ${orderId}`);
        return true;
    } catch (error) {
        console.error(`❌ Errore nell'aggiornamento del tracking per l'ordine ${orderId}:`, error);
        return false;
    }
};