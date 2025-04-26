import { Router } from 'express';
import mailer from '../middlewares/mailer.js';

const router = Router();

router.post('/send-message', async (req, res) => {
    console.log("Ricevuta richiesta di contatto:", req.body);

    try {
        const { nome, cognome, email, telefono, messaggio, richiamami } = req.body;

        const mailOptions = {
            from: process.env.EMAIL_CERT,
            to: process.env.EMAIL_CERT,
            replyTo: email,
            subject: "Nuovo messaggio dal form di contatto BTG SYS",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h1 style="color: #0d6efd; text-align: center; border-bottom: 3px solid #fd7e14; padding-bottom: 10px;">Nuovo messaggio dal form di contatto</h1>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <h2 style="color: #212529; margin-top: 0;">Dettagli contatto</h2>
                        <p><strong>Nome completo:</strong> ${nome} ${cognome}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Telefono:</strong> ${telefono || 'Non fornito'}</p>
                        <p><strong>Richiede di essere richiamato:</strong> ${richiamami ? 'Sì' : 'No'}</p>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                        <h2 style="color: #212529; margin-top: 0;">Messaggio</h2>
                        <p style="white-space: pre-line;">${messaggio}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #6c757d;">
                        Questo messaggio è stato inviato tramite il form di contatto sul sito BTG SYS.
                    </p>
                </div>
            `
        };

        const info = await mailer.sendMail(mailOptions);
        console.log("Email inviata:", info.response);

        res.status(200).json({ success: true, message: "Email inviata con successo" });
    } catch (error) {
        console.error("Errore nell'invio dell'email:", error);
        res.status(500).json({
            success: false,
            message: "Errore nell'invio dell'email",
            error: error.message
        });
    }
});

export default router;