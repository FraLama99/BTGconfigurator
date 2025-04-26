/**
 * Calcola il totale del carrello
 */
export const calculateTotalPrice = (cartItems) => {
    return cartItems.reduce((total, item) => {
        const itemPrice = item.price || item.item.totalPrice || item.item.price || 0;
        return total + itemPrice * item.quantity;
    }, 0);
};

/**
 * Calcola l'IVA e i subtotali
 */
export const calculatePrices = (totalPrice) => {

    const subtotalWithoutVAT = totalPrice / 1.22;
    const vatAmount = totalPrice - subtotalWithoutVAT;
    const totalWithVAT = totalPrice;

    return { subtotalWithoutVAT, vatAmount, totalWithVAT };
};

/**
 * Verifica che tutti i campi obbligatori siano compilati
 */
export const validateCheckoutForm = (shippingAddress, paymentMethod, creditCardInfo) => {
    // Verifica i campi di spedizione
    if (
        !shippingAddress.fullName ||
        !shippingAddress.address ||
        !shippingAddress.city ||
        !shippingAddress.postalCode
    ) {
        return "Tutti i campi dell'indirizzo di spedizione sono obbligatori";
    }

    // Verifica i dati della carta di credito se è il metodo selezionato
    if (
        paymentMethod === "creditCard" &&
        (!creditCardInfo.cardNumber ||
            !creditCardInfo.cardHolder ||
            !creditCardInfo.expiryDate ||
            !creditCardInfo.cvv)
    ) {
        return "Tutti i campi della carta di credito sono obbligatori";
    }

    return null; // Nessun errore
};