import GoogleStrategy from 'passport-google-oauth20';
import User from '../modelli/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mailer from './mailer.js'; // Importa il mailer

const googleStrategy = new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
            process.env.BACKEND_HOST + process.env.GOOGLE_CALLBACK_PATH, // deve essere tra quelli registrati su Google
    },

    async function (accessToken, refreshToken, profile, done) {
        try {
            // Cerca l'utente esistente con l'email di Google
            const existingUser = await User.findOne({ email: profile.emails[0].value });

            if (existingUser) {
                // Se l'utente esiste già, genera un token JWT
                existingUser.jwtToken = jwt.sign(
                    { id: existingUser._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1 day" }
                );
                return done(null, existingUser);
            }

            // Se l'utente non esiste, ne crea uno nuovo con i dati di Google
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Creiamo un oggetto indirizzo di default per rispettare lo schema
            const defaultAddress = {
                street: 'Da impostare',
                city: 'Da impostare',
                zipCode: '00000',
                country: 'Da impostare'
            };

            const newUser = new User({
                name: profile.name.givenName || profile.displayName.split(" ")[0],
                surname: profile.name.familyName || profile.displayName.split(" ").slice(1).join(" "),
                email: profile.emails[0].value,
                birth_date: new Date(), // Imposta una data di default
                phone: 'Da impostare', // Valore di default per il telefono
                address: defaultAddress, // Indirizzo di default
                avatar: profile.photos[0]?.value || null,
                password: hashedPassword
            });

            const savedUser = await newUser.save();

            // Qui inviamo l'email di benvenuto solo per i nuovi utenti
            try {
                await mailer.sendMail({
                    from: 'info@3dlama.it', // indirizzo mittente
                    to: savedUser.email, // indirizzo destinatario
                    subject: 'Benvenuto su BTG System', // oggetto
                    text: `Benvenuto ${savedUser.name} ${savedUser.surname}! Grazie per esserti registrato con Google.`, // corpo testo
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
                            <h2 style="color: #4285f4;">Benvenuto su BTG System!</h2>
                            <p>Ciao <strong>${savedUser.name} ${savedUser.surname}</strong>,</p>
                            <p>Grazie per esserti registrato tramite Google. Il tuo account è stato creato con successo.</p>
                            <p>Per completare il tuo profilo, ti invitiamo ad aggiornare le seguenti informazioni:</p>
                            <ul>
                                <li>Numero di telefono</li>
                                <li>Indirizzo completo</li>
                            </ul>
                            <p>Puoi aggiornare questi dati accedendo alla pagina del tuo profilo.</p>
                            <p>Cordiali saluti,<br>Il team di BTG System</p>
                        </div>
                    `, // corpo HTML
                });
                console.log(`Email di benvenuto inviata a ${savedUser.email}`);
            } catch (emailError) {
                console.error('Errore nell\'invio dell\'email di benvenuto:', emailError);
                // Non blocchiamo il processo di registrazione se l'invio dell'email fallisce
            }

            // Genera un token JWT per il nuovo utente
            savedUser.jwtToken = jwt.sign(
                { id: savedUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "1 day" }
            );

            return done(null, savedUser);
        } catch (error) {
            console.error('Errore durante il login con Google:', error);
            return done(error);
        }
    }
);

export default googleStrategy;
