import bcrypt from 'bcryptjs';
import User from '../modelli/user.js';
import crypto from 'crypto';

// Middleware per cifrare la password prima di salvarla
export const hashPassword = async (req, res, next) => {
    try {
        // Verifica se è stata fornita una password
        if (!req.body.password) {
            return next();
        }

        // Genera salt e hash della password
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        next();
    } catch (error) {
        console.error('Errore durante hashing della password:', error);
        res.status(500).json({
            message: 'Errore durante la gestione della password',
            statusCode: 500
        });
    }
};

// Funzione per confrontare password (utile nei controller)
export const comparePassword = async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
};

// Middleware per generare token di reset password
export const generateResetToken = async (req, res, next) => {
    try {
        // Genera un token casuale
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Se l'utente è già stato trovato (es. in middleware precedente)
        if (req.user) {
            req.user.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            req.user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minuti

            await req.user.save();

            // Salva il token non criptato per l'invio all'utente
            req.resetToken = resetToken;
        } else if (req.body.email) {
            // Se abbiamo solo l'email dell'utente
            const user = await User.findOne({ email: req.body.email });

            if (!user) {
                return res.status(404).json({
                    message: 'Utente non trovato con questa email',
                    statusCode: 404
                });
            }

            user.resetPasswordToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minuti

            await user.save();

            // Salva l'utente e il token per l'uso nei controller
            req.user = user;
            req.resetToken = resetToken;
        } else {
            return res.status(400).json({
                message: 'Email dell\'utente richiesta',
                statusCode: 400
            });
        }

        next();
    } catch (error) {
        console.error('Errore nella generazione del token di reset:', error);
        res.status(500).json({
            message: 'Errore durante la generazione del token di reset',
            statusCode: 500
        });
    }
};

// Middleware per verificare il token di reset password
export const verifyResetToken = async (req, res, next) => {
    try {
        // Ottieni il token dalla richiesta
        const { resetToken } = req.params;

        if (!resetToken) {
            return res.status(400).json({
                message: 'Token di reset non fornito',
                statusCode: 400
            });
        }

        // Cripta il token per confrontarlo con quello nel database
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Trova l'utente con il token valido e non scaduto
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Token di reset non valido o scaduto',
                statusCode: 400
            });
        }

        // Salva l'utente per l'uso nei controller
        req.user = user;
        next();
    } catch (error) {
        console.error('Errore nella verifica del token di reset:', error);
        res.status(500).json({
            message: 'Errore durante la verifica del token di reset',
            statusCode: 500
        });
    }
};

export default {
    hashPassword,
    comparePassword,
    generateResetToken,
    verifyResetToken
};