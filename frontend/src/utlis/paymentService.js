import api from './api';

/**
 * Servizio per gestire i pagamenti (versione fittizia)
 */
const paymentService = {
    /**
     * Elabora un pagamento con carta di credito
     * @param {Object} cardDetails - Dettagli della carta di credito
     * @param {number} amount - Importo da pagare
     * @returns {Promise} - Promise con la risposta del pagamento
     */
    processCardPayment: async (cardDetails, amount) => {
        try {
            // Validazione base dei dati carta
            if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 13) {
                throw new Error('Numero di carta non valido');
            }

            if (!cardDetails.expiryDate || !cardDetails.expiryDate.includes('/')) {
                throw new Error('Data di scadenza non valida');
            }

            if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
                throw new Error('CVV non valido');
            }

            // Formatta i dati per la transazione fittizia
            const paymentData = {
                method: 'credit_card',
                amount,
                currency: 'EUR',
                card: {
                    last4: cardDetails.cardNumber.slice(-4),
                    expMonth: cardDetails.expiryDate.split('/')[0],
                    expYear: cardDetails.expiryDate.split('/')[1],
                    brand: getCardBrand(cardDetails.cardNumber)
                }
            };

            // Chiama l'API fittizia
            return await api.processFakePayment(paymentData);
        } catch (error) {
            console.error('Errore nel processamento pagamento:', error);
            throw error;
        }
    },

    /**
     * Elabora un pagamento con PayPal
     * @param {number} amount - Importo da pagare
     * @returns {Promise} - Promise con la risposta del pagamento
     */
    processPayPalPayment: async (amount) => {
        try {
            const paymentData = {
                method: 'paypal',
                amount,
                currency: 'EUR'
            };

            return await api.processFakePayment(paymentData);
        } catch (error) {
            console.error('Errore nel processamento pagamento PayPal:', error);
            throw error;
        }
    },

    /**
     * Genera i dettagli per un bonifico bancario
     * @param {number} amount - Importo da pagare
     * @returns {Object} - Dettagli del bonifico
     */
    generateBankTransferDetails: (amount, orderId) => {
        return {
            bankName: 'Banca BTG',
            iban: 'ITxxxxxxxxxxxxxxxxxxxxxxxxxx',
            accountHolder: 'BTG Configurator SRL',
            amount,
            reference: `ORDINE-${orderId}`,
            instructions: 'Effettua il bonifico entro 3 giorni lavorativi per evitare la cancellazione dell\'ordine.'
        };
    }
};

/**
 * Identifica il brand della carta di credito dal numero
 */
function getCardBrand(cardNumber) {
    // Versione semplificata per demo
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'MasterCard';
    if (firstDigit === '3') return 'American Express';
    return 'Unknown';
}

export default paymentService;