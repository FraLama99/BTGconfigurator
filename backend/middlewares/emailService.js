import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione del trasporto email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Funzione per inviare email di conferma ordine con dettagli
export const sendOrderConfirmation = async (email, name, orderNumber, estimatedDelivery, details = {}) => {
    try {
        const deliveryDate = new Date(estimatedDelivery).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Prepara la sezione dei dettagli macchina
        let componentsHtml = '';
        if (details.components && details.components.length > 0) {
            componentsHtml = `
                <div style="margin-top: 15px;">
                    <h3>Componenti:</h3>
                    <ul style="list-style-type: none; padding-left: 10px;">
                        ${details.components.map(component => `<li>• ${component}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Formatta il prezzo
        const formattedPrice = details.totalPrice ?
            new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(details.totalPrice) :
            "N/A";

        await transporter.sendMail({
            from: `"BTG Configurator" <${process.env.EMAIL_CERT}>`,
            to: email,
            subject: `Conferma Ordine #${orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
                        <h1>Grazie per il tuo ordine!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                        <p>Ciao ${name},</p>
                        <p>Grazie per aver scelto BTG Configurator! Abbiamo ricevuto il tuo ordine ed è in fase di elaborazione.</p>
                        
                        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h2 style="color: #333; margin-top: 0;">Dettagli dell'ordine</h2>
                            <p><strong>Numero Ordine:</strong> ${orderNumber}</p>
                            <p><strong>Prodotto:</strong> ${details.machineName || 'PC personalizzato'}</p>
                            <p><strong>Prezzo totale:</strong> ${formattedPrice}</p>
                            <p><strong>Metodo di pagamento:</strong> ${details.paymentMethod || 'Non specificato'}</p>
                            <p><strong>Indirizzo di spedizione:</strong><br>${details.shippingAddress || 'Non specificato'}</p>
                            <p><strong>Data di consegna stimata:</strong> ${deliveryDate}</p>
                            ${componentsHtml}
                        </div>
                        
                        <p>Riceverai un'altra email quando il tuo ordine sarà pronto per la spedizione.</p>
                        <p>Per qualsiasi domanda, non esitare a contattarci rispondendo a questa email.</p>
                        <p>Cordiali saluti,<br>Il team di BTG Configurator</p>
                    </div>
                    <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px;">
                        <p>BTG Configurator &copy; 2025 | Tutti i diritti riservati</p>
                    </div>
                </div>
            `
        });
        console.log(`Email di conferma ordine inviata a: ${email}`);
    } catch (error) {
        console.error('Errore nell\'invio dell\'email di conferma ordine:', error);
    }
};

// Funzione per inviare notifiche di aggiornamento stato
export const sendOrderStatusUpdate = async (email, name, orderNumber, status, estimatedDelivery) => {
    try {
        const deliveryDate = new Date(estimatedDelivery).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        let subject, statusText, additionalText;

        switch (status) {
            case 'processing':
                subject = `Il tuo ordine #${orderNumber} è in lavorazione`;
                statusText = "in fase di lavorazione";
                additionalText = `I nostri tecnici stanno assemblando il tuo PC. La consegna stimata è per il ${deliveryDate}.`;
                break;
            case 'shipped':
                subject = `Il tuo ordine #${orderNumber} è stato spedito`;
                statusText = "spedito";
                additionalText = `Il tuo ordine è in viaggio! Dovresti riceverlo entro il ${deliveryDate}.`;
                break;
            case 'delivered':
                subject = `Il tuo ordine #${orderNumber} è stato consegnato`;
                statusText = "consegnato";
                additionalText = "Speriamo che tu sia soddisfatto del tuo nuovo PC. Grazie per aver scelto BTG Configurator!";
                break;
            default:
                subject = `Aggiornamento sul tuo ordine #${orderNumber}`;
                statusText = "aggiornato";
                additionalText = `La consegna è prevista per il ${deliveryDate}.`;
        }

        await transporter.sendMail({
            from: `"BTG Configurator" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
                        <h1>Aggiornamento Ordine</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                        <p>Ciao ${name},</p>
                        <p>Ti informiamo che il tuo ordine #${orderNumber} è stato ${statusText}.</p>
                        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p>${additionalText}</p>
                        </div>
                        <p>Per qualsiasi domanda, non esitare a contattarci rispondendo a questa email.</p>
                        <p>Cordiali saluti,<br>Il team di BTG Configurator</p>
                    </div>
                    <div style="background-color: #f0f0f0; padding: 10px; text-align: center; font-size: 12px;">
                        <p>BTG Configurator &copy; 2025 | Tutti i diritti riservati</p>
                    </div>
                </div>
            `
        });
        console.log(`Email di aggiornamento stato ordine inviata a: ${email}`);
    } catch (error) {
        console.error('Errore nell\'invio dell\'email di aggiornamento stato ordine:', error);
    }
};