import { Router } from "express";
import User from "../modelli/user.js";
import verifyToken, { isAdmin, checkRole, generateToken } from "../middlewares/authMidd.js";
import { hashPassword, comparePassword, generateResetToken, verifyResetToken } from "../middlewares/passwordMidd.js";
import uploadCloudinary from "../middlewares/uploadCloudinary.js";
import jwt from "jsonwebtoken";
import mailer from "../middlewares/mailer.js";
import passport from "passport";
import Machine from "../modelli/machine.js";
import CustomMachine from "../modelli/customMachine.js";

const routerUser = Router();

// Route pubbliche (senza verifyToken)
routerUser.post('/users/register', hashPassword, async (req, res, next) => {
    try {
        const {
            name,
            surname,
            email,
            birth_date,
            phone,
            address,
            role,
            adminCode // Aggiungi questo campo
        } = req.body;

        // Verifica campi obbligatori
        if (!name || !surname || !email || !birth_date || !req.body.password || !phone ||
            !address || !address.street || !address.city || !address.zipCode || !address.country) {
            return res.status(400).json({
                message: 'Tutti i campi sono obbligatori (nome, cognome, email, data di nascita, password, telefono e indirizzo completo)',
                statusCode: 400
            });
        }

        // Verifica se l'email è già in uso
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email già registrata',
                statusCode: 400
            });
        }

        // Verifica se la richiesta contiene un codice admin valido
        // Se il ruolo richiesto è 'admin' e il codice corrisponde, assegna ruolo admin, altrimenti assegna 'user'
        const userRole = (role === 'admin' && adminCode === process.env.ADMIN_SECRET_CODE)
            ? 'admin'
            : 'user';

        // Crea nuovo utente con il ruolo determinato
        const newUser = new User({
            name,
            surname,
            email,
            birth_date,
            phone,
            address,
            password: req.body.password,
            role: userRole
        });

        const savedUser = await newUser.save();

        // Invia email di benvenuto
        try {
            await mailer.sendMail({
                from: 'info@3dlama.it',
                to: email,
                subject: 'Benvenuto su BTG System',
                text: `Benvenuto ${name} ${surname}! La tua registrazione è stata completata con successo.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
                        <h2 style="color: #4285f4;">Benvenuto su BTG System!</h2>
                        <p>Ciao <strong>${name} ${surname}</strong>,</p>
                        <p>Grazie per esserti registrato. Il tuo account è stato creato con successo.</p>
                        <p>Ecco i dettagli del tuo account:</p>
                        <ul>
                            <li>Email: ${email}</li>
                            <li>Telefono: ${phone}</li>
                            <li>Indirizzo: ${address.street}, ${address.city}, ${address.zipCode}, ${address.country}</li>
                        </ul>
                        <p>Cordiali saluti,<br>Il team di BTG System</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Errore nell\'invio dell\'email di benvenuto:', emailError);
            // Non blocchiamo la registrazione se l'email fallisce
        }

        // Generiamo token JWT per accesso immediato
        if (savedUser && savedUser._id) {
            const token = generateToken(savedUser._id, savedUser.role);

            // Mascheramento password prima di inviare la risposta
            const userToReturn = savedUser.toObject();
            delete userToReturn.password;

            res.status(201).json({
                message: 'Utente registrato con successo',
                token: token,
                user: userToReturn,
                statusCode: 201
            });
        }
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerUser.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email e password sono obbligatorie',
                statusCode: 400
            });
        }

        // Cerca l'utente e include il campo password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        // Verifica password usando il metodo del middleware
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Password non valida',
                statusCode: 401
            });
        }

        // Genera token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1 day' });

        // Rimuovi password dai dati utente
        const userToReturn = user.toObject();
        delete userToReturn.password;

        // Imposta il token nell'header
        res.set('Authorization', `Bearer ${token}`);

        res.status(200).json({
            message: 'Login effettuato con successo',
            token: token,
            user: userToReturn,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

routerUser.post('/users/reset-password', generateResetToken, async (req, res) => {
    try {
        // Invia email con link per reset password
        const resetUrl = `${process.env.FRONTEND_HOST}/reset-password/${req.resetToken}`;

        await mailer.sendMail({
            from: 'info@3dlama.it',
            to: req.user.email,
            subject: 'Reset Password BTG System',
            text: `Per reimpostare la tua password, clicca sul seguente link: ${resetUrl}. Il link è valido per 10 minuti.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #4285f4;">Reset Password</h2>
                    <p>Ciao <strong>${req.user.name}</strong>,</p>
                    <p>Hai richiesto il reset della tua password. Clicca sul link seguente per completare il processo:</p>
                    <p><a href="${resetUrl}" style="display: inline-block; background-color: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
                    <p>Il link è valido per 10 minuti.</p>
                    <p>Se non hai richiesto il reset della password, ignora questa email.</p>
                    <p>Cordiali saluti,<br>Il team di BTG System</p>
                </div>
            `
        });

        res.status(200).json({
            message: 'Email per il reset della password inviata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'invio dell\'email di reset:', error);
        res.status(500).json({
            message: 'Errore nell\'invio dell\'email di reset',
            statusCode: 500
        });
    }
});

routerUser.post('/users/reset-password/:resetToken', verifyResetToken, hashPassword, async (req, res) => {
    try {
        if (!req.body.password) {
            return res.status(400).json({
                message: 'La nuova password è obbligatoria',
                statusCode: 400
            });
        }

        // Aggiorna password e rimuovi token di reset
        req.user.password = req.body.password; // La password è già stata hashata dal middleware
        req.user.resetPasswordToken = undefined;
        req.user.resetPasswordExpire = undefined;

        await req.user.save();

        res.status(200).json({
            message: 'Password reimpostata con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nel reset della password:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});


routerUser.get('/users/login-google', (req, res, next) => {
    console.log('Route login-google raggiunta');
    next();
}, passport.authenticate('google', {
    scope: ['profile', 'email']
}));

routerUser.get('/users/callback-google',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        try {
            // Assicurati che req.user e req.user.jwtToken esistano
            if (!req.user || !req.user.jwtToken) {
                console.error('⚠️ Token mancante nella callback Google:', req.user);
                return res.redirect(`${process.env.FRONTEND_HOST}/login?error=auth_failed`);
            }

            // Log per debugging
            console.log('✅ Autenticazione Google completata con successo');
            console.log('🔑 Token JWT generato:', req.user.jwtToken);
            // Salva il token nel localStorage del client
            console.log('💾 Salvataggio token nel localStorage');
            const scriptToExecute = `
                localStorage.setItem('token', '${req.user.jwtToken}');
            `;
            // Redirect al frontend con il token come parametro URL
            res.redirect(
                `${process.env.FRONTEND_HOST}/login?token=${req.user.jwtToken}`
            );
        } catch (error) {
            console.error('❌ Errore nella callback Google:', error);
            res.redirect(`${process.env.FRONTEND_HOST}/login?error=server_error`);
        }
    }
);
// Route protette (con verifyToken)
const protectedRoutes = Router();

protectedRoutes.use(verifyToken); // Applica verifyToken solo alle route all'interno di questo router

protectedRoutes.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});


protectedRoutes.get('/users/me', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: 'Non autenticato',
                statusCode: 401
            });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});
protectedRoutes.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

protectedRoutes.patch('/users/:userId/avatar', uploadCloudinary.single('avatar'), async (req, res) => {
    try {
        // Verifica permessi
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Non hai i permessi per modificare questo profilo',
                statusCode: 403
            });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        // Aggiorna avatar
        const avatar = req.file?.path || null;
        user.avatar = avatar;
        await user.save();

        res.status(200).json({
            message: 'Avatar aggiornato con successo',
            user: user,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'avatar:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});
protectedRoutes.put('/users/:userId', verifyToken, async (req, res) => {
    try {
        // Verifica permessi
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Non hai i permessi per modificare questo profilo',
                statusCode: 403
            });
        }

        const { name, surname, email, birth_date, phone, address, role } = req.body;

        // Aggiorna solo i campi forniti
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (surname !== undefined) updateData.surname = surname;
        if (email !== undefined) updateData.email = email;
        if (birth_date !== undefined) updateData.birth_date = birth_date;
        if (phone !== undefined) updateData.phone = phone;

        // Aggiorna l'indirizzo se fornito
        if (address) {
            updateData.address = {};
            if (address.street !== undefined) updateData.address.street = address.street;
            if (address.city !== undefined) updateData.address.city = address.city;
            if (address.zipCode !== undefined) updateData.address.zipCode = address.zipCode;
            if (address.country !== undefined) updateData.address.country = address.country;
        }

        // Solo gli admin possono modificare il ruolo
        if (req.user.role === 'admin' && role !== undefined) {
            updateData.role = role;
        }

        console.log('Aggiornamento utente con i dati:', updateData);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Profilo aggiornato con successo',
            user: updatedUser,
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento del profilo:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

protectedRoutes.delete('/users/:userId', verifyToken, async (req, res) => {
    try {
        // Verifica permessi (solo l'utente stesso o un admin possono eliminare)
        if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Non hai i permessi per eliminare questo profilo',
                statusCode: 403
            });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        res.status(200).json({
            message: 'Profilo eliminato con successo',
            statusCode: 200
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione del profilo:', error);
        res.status(500).json({
            message: error.message,
            statusCode: 500
        });
    }
});

// Aggiungi questo endpoint nelle route protette

// Aggiungi al carrello
protectedRoutes.post('/users/me/cart', async (req, res) => {
    try {
        console.log('📝 POST /users/me/cart - Richiesta ricevuta:', req.body);

        const itemId = req.body.itemId || req.body.machineId;
        const itemType = req.body.itemType || req.body.type || "machine";
        const quantity = parseInt(req.body.quantity) || 1;

        if (!itemId || !itemType || !quantity) {
            return res.status(400).json({
                message: 'itemId, itemType e quantity sono obbligatori',
                statusCode: 400
            });
        }

        // Verifica che l'utente esista
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        // Inizializza il carrello se non esiste
        if (!user.cart) {
            user.cart = [];
        }

        // Controlla se l'elemento è già nel carrello, con gestione sicura del toString()
        const existingItemIndex = user.cart.findIndex(
            cartItem => {
                // Verifica che itemId esista prima di chiamare toString()
                if (!cartItem || !cartItem.itemId) return false;

                try {
                    return cartItem.itemId.toString() === itemId.toString() &&
                        cartItem.itemType === itemType;
                } catch (err) {
                    console.error('Errore durante il confronto degli ID:', err);
                    return false;
                }
            }
        );

        if (existingItemIndex >= 0) {
            // Se l'elemento esiste già, aggiorna la quantità
            user.cart[existingItemIndex].quantity += parseInt(quantity);
            console.log(`✅ Quantità aggiornata per elemento esistente: ${user.cart[existingItemIndex].quantity}`);
        } else {
            // Altrimenti aggiungi il nuovo elemento
            user.cart.push({
                itemId,
                itemType,
                quantity: parseInt(quantity),
                addedAt: new Date()
            });
            console.log('✅ Nuovo elemento aggiunto al carrello');
        }

        // Salva le modifiche
        await user.save();
        console.log('💾 Carrello salvato nel database');

        res.status(200).json({
            message: 'Elemento aggiunto al carrello con successo',
            cart: user.cart,
            statusCode: 200
        });
    } catch (error) {
        console.error('❌ Errore nell\'aggiunta al carrello:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            message: error.message || 'Errore durante l\'aggiunta al carrello',
            statusCode: 500
        });
    }
});


protectedRoutes.get('/users/me/cart', async (req, res) => {
    console.log('🔍 GET /users/me/cart - Iniziando il recupero del carrello');
    console.log('👤 User ID:', req.user._id);
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        console.log('Carrello dell\'utente:', JSON.stringify(user.cart));

        if (!user.cart || user.cart.length === 0) {
            console.log('✅ GET /users/me/cart - Carrello vuoto');
            return res.status(200).json({
                items: [],
                totalPrice: 0,
                statusCode: 200
            });
        }

        // Array per memorizzare gli elementi del carrello
        const items = [];
        let totalPrice = 0;

        // Recupera e processa ogni elemento del carrello
        for (const cartItem of user.cart) {
            try {
                console.log(`Elaborazione elemento carrello: ${cartItem.itemType} ID: ${cartItem.itemId}`);

                // Determina il modello corretto in base al tipo di elemento
                let Model;
                switch (cartItem.itemType) {
                    case 'machine':
                        Model = Machine;
                        break;
                    case 'preset':
                        Model = CustomMachine;
                        break;
                    case 'workstation':
                        console.log('⚠️ Tipo workstation non ancora implementato');
                        continue;
                    default:
                        console.log(`⚠️ Tipo elemento non supportato: ${cartItem.itemType}`);
                        continue;
                }

                if (!Model) {
                    console.error(`❌ Modello non disponibile per il tipo: ${cartItem.itemType}`);
                    continue;
                }

                console.log(`🔍 Ricerca elemento ${cartItem.itemId} usando il modello ${Model.modelName}`);

                // Miglioramento: Popoliamo i componenti per CustomMachine e Machine
                let item;
                if (cartItem.itemType === 'preset') {
                    // Popola tutti i componenti necessari per preset
                    item = await CustomMachine.findById(cartItem.itemId)
                        .populate('components.cpu')
                        .populate('components.motherboard')
                        .populate('components.ram')
                        .populate('components.gpu')
                        .populate('components.storage')
                        .populate('components.powerSupply')
                        .populate('components.case')
                        .populate('components.cooling');
                } else if (cartItem.itemType === 'machine') {
                    // Popola anche i componenti per le machine personalizzate
                    item = await Machine.findById(cartItem.itemId)
                        .populate('components.cpu')
                        .populate('components.motherboard')
                        .populate('components.ram')
                        .populate('components.gpu')
                        .populate('components.storage')
                        .populate('components.powerSupply')
                        .populate('components.case')
                        .populate('components.cooling');
                } else {
                    item = await Model.findById(cartItem.itemId);
                }

                if (item) {
                    console.log(`✅ Elemento trovato: ${item.name || 'Senza nome'}`);

                    // Calcola il prezzo in modo più preciso
                    let price = 0;

                    // Per preset (CustomMachine)
                    if (cartItem.itemType === 'preset') {
                        console.log('Calcolo prezzo per preset (CustomMachine)');
                        // Prima opzione: utilizza il prezzo finale se disponibile
                        if (item.finalPrice !== undefined && item.finalPrice !== null) {
                            price = item.finalPrice;
                            console.log(`Usando finalPrice: ${price}`);
                        }
                        // Seconda opzione: utilizza il prezzo base
                        else if (item.basePrice !== undefined && item.basePrice !== null) {
                            price = item.basePrice;
                            console.log(`Usando basePrice: ${price}`);
                        }
                        // Terza opzione: somma i prezzi dei componenti dal componentPrices
                        else if (item.componentPrices) {
                            price = Object.values(item.componentPrices).reduce((sum, val) => sum + (val || 0), 0);
                            console.log(`Usando componentPrices sommati: ${price}`);
                        }
                        // Quarta opzione: somma i prezzi dei componenti popolati
                        else if (item.components) {
                            let componentTotal = 0;
                            for (const [key, componentRef] of Object.entries(item.components)) {
                                if (componentRef && typeof componentRef === 'object' && componentRef.price) {
                                    componentTotal += componentRef.price;
                                    console.log(`Componente ${key}: ${componentRef.price}`);
                                }
                            }
                            if (componentTotal > 0) {
                                price = componentTotal;
                                console.log(`Usando somma componenti: ${price}`);
                            }
                        }
                    }
                    // Per machine personalizzate
                    else if (cartItem.itemType === 'machine') {
                        console.log('Calcolo prezzo per machine personalizzata');
                        // Prima opzione: utilizza totalPrice se disponibile
                        if (item.totalPrice !== undefined && item.totalPrice !== null) {
                            price = item.totalPrice;
                            console.log(`Usando totalPrice: ${price}`);
                        }
                        // Seconda opzione: somma i prezzi dei componenti popolati
                        else if (item.components) {
                            let componentTotal = 0;
                            for (const [key, componentRef] of Object.entries(item.components)) {
                                // Gestisci sia oggetti popolati che ID
                                if (componentRef && typeof componentRef === 'object') {
                                    if (componentRef.price) {
                                        componentTotal += componentRef.price;
                                        console.log(`Componente ${key}: ${componentRef.price}`);
                                    }
                                }
                            }
                            if (componentTotal > 0) {
                                price = componentTotal;
                                console.log(`Usando somma componenti: ${price}`);
                            }
                        }
                        // Fallback: usa il prezzo generico
                        else if (item.price !== undefined && item.price !== null) {
                            price = item.price;
                            console.log(`Usando price generico: ${price}`);
                        }
                    }
                    // Per altri tipi di elementi
                    else {
                        // Per altri tipi di elementi, usa il prezzo standard
                        price = item.price || 0;
                        console.log(`Usando price standard: ${price}`);
                    }

                    // Log dettagliato del prezzo
                    console.log(`💰 Prezzo calcolato per ${item.name}: ${price}`);
                    totalPrice += price * cartItem.quantity;

                    items.push({
                        id: cartItem._id,
                        itemId: item._id,
                        type: cartItem.itemType,
                        item: item,
                        quantity: cartItem.quantity,
                        price: price,
                        addedAt: cartItem.addedAt
                    });
                } else {
                    console.log(`⚠️ Elemento non trovato nel DB: ${cartItem.itemId} (tipo: ${cartItem.itemType})`);

                    // Aggiungiamo un placeholder
                    items.push({
                        id: cartItem._id,
                        itemId: cartItem.itemId,
                        type: cartItem.itemType,
                        item: {
                            _id: cartItem.itemId,
                            name: `Configurazione non disponibile`,
                            price: 0,
                            description: "Questa configurazione non è più disponibile",
                            image: null
                        },
                        quantity: cartItem.quantity,
                        price: 0,
                        addedAt: cartItem.addedAt
                    });
                }
            } catch (err) {
                console.error(`❌ Errore nel recuperare l'item ${cartItem.itemId}:`, err);
                console.error('Stack traccia:', err.stack);
            }
        }

        console.log('✅ GET /users/me/cart - Carrello recuperato con successo:', {
            itemCount: items.length,
            totalPrice
        });

        res.status(200).json({
            items,
            totalPrice,
            statusCode: 200
        });
    } catch (error) {
        console.error('❌ Errore nel recupero del carrello:', error);
        console.error('Stack traccia:', error.stack);
        res.status(500).json({
            message: error.message || 'Errore durante il recupero del carrello',
            statusCode: 500
        });
    }
});


// Rotta per eliminare un elemento dal carrello
protectedRoutes.delete('/users/me/cart/:itemId', async (req, res) => {
    console.log('🗑️ DELETE /users/me/cart - Rimozione elemento dal carrello');
    console.log('👤 User ID:', req.user._id);
    console.log('🔑 Item ID da rimuovere:', req.params.itemId);

    try {
        const cartItemId = req.params.itemId;

        // Verifica che l'ID sia valido
        if (!cartItemId) {
            return res.status(400).json({
                message: 'ID elemento non valido',
                statusCode: 400
            });
        }

        // Cerchiamo l'utente e rimuoviamo l'elemento dal carrello tramite il suo ID
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            // Importante: qui rimuoviamo in base all'_id dell'elemento nel carrello, non all'itemId!
            { $pull: { cart: { _id: cartItemId } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        console.log('✅ Elemento rimosso con successo dal carrello');

        res.status(200).json({
            message: 'Elemento rimosso dal carrello',
            cart: updatedUser.cart,
            statusCode: 200
        });
    } catch (error) {
        console.error('❌ Errore nella rimozione dell\'elemento dal carrello:', error);
        console.error('Stack traccia:', error.stack);
        res.status(500).json({
            message: error.message || 'Errore durante la rimozione dal carrello',
            statusCode: 500
        });
    }
});

// Rotta per aggiornare la quantità di un elemento nel carrello
protectedRoutes.patch('/users/me/cart', async (req, res) => {
    console.log('🔄 PATCH /users/me/cart - Aggiornamento quantità elemento nel carrello');
    console.log('👤 User ID:', req.user._id);
    console.log('📦 Dati ricevuti:', req.body);

    try {
        const { cartItemId, quantity } = req.body;

        // Verifica che i dati richiesti siano presenti e validi
        if (!cartItemId || quantity === undefined) {
            return res.status(400).json({
                message: 'cartItemId e quantity sono obbligatori',
                statusCode: 400
            });
        }

        // Cerca l'utente
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                message: 'Utente non trovato',
                statusCode: 404
            });
        }

        // Trova l'elemento nel carrello per _id
        const cartItemIndex = user.cart.findIndex(item => item._id.toString() === cartItemId);

        if (cartItemIndex === -1) {
            return res.status(404).json({
                message: 'Elemento non trovato nel carrello',
                statusCode: 404
            });
        }

        // Se la quantità è 0 o meno, rimuovi l'elemento
        if (quantity <= 0) {
            user.cart.splice(cartItemIndex, 1);
            console.log('🗑️ Elemento rimosso dal carrello perché la quantità è <= 0');
        } else {
            // Altrimenti aggiorna la quantità
            user.cart[cartItemIndex].quantity = quantity;
            console.log(`✏️ Quantità aggiornata a ${quantity} per l'elemento nel carrello`);
        }

        // Salva le modifiche
        await user.save();

        // Carica i dettagli aggiornati del carrello
        // Questa parte è opzionale, se vuoi restituire i dettagli completi del carrello
        // come nella route GET
        let loadedCart = [];
        let totalPrice = 0;

        // Implementazione semplice: restituisci solo il carrello aggiornato
        console.log('✅ Carrello aggiornato con successo');

        res.status(200).json({
            message: 'Carrello aggiornato con successo',
            cart: user.cart,
            statusCode: 200
        });
    } catch (error) {
        console.error('❌ Errore nell\'aggiornamento del carrello:', error);
        console.error('Stack traccia:', error.stack);
        res.status(500).json({
            message: error.message || 'Errore durante l\'aggiornamento del carrello',
            statusCode: 500
        });
    }
});


protectedRoutes.get('/users/me/machines', async (req, res) => {
    console.log('🔍 GET /users/me/machines - Recupero configurazioni personalizzate');
    console.log('👤 User ID:', req.user._id);

    try {
        // Recupera le macchine dal modello Machine
        const machines = await Machine.find({ userId: req.user._id })
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram') // Popola l'array direttamente
            .populate('components.gpu')
            .populate('components.storage') // Popola l'array direttamente
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling'); // Popola l'array direttamente

        console.log(`✅ Recuperate ${machines.length} configurazioni standard per l'utente`, machines);

        // Recupera le macchine dal modello CustomMachine (già corretto)
        const customMachines = await CustomMachine.find({ userId: req.user._id })
            .populate('components.cpu')
            .populate('components.motherboard')
            .populate('components.ram')
            .populate('components.gpu')
            .populate('components.storage')
            .populate('components.powerSupply')
            .populate('components.case')
            .populate('components.cooling');

        console.log(`✅ Recuperate ${customMachines.length} configurazioni personalizzate per l'utente`);

        // Combina i risultati
        const allMachines = [...machines, ...customMachines];

        // Aggiunge un campo 'source' per distinguere l'origine
        const combinedMachines = allMachines.map(machine => {
            // Crea una copia del documento come oggetto semplice
            const formattedMachine = machine.toObject();

            // Aggiungi un campo per indicare da quale collezione proviene
            formattedMachine.source = machine.collection.name.includes('custom') ? 'customMachine' : 'machine';

            return formattedMachine;
        });

        console.log(`✅ Restituite un totale di ${combinedMachines.length} configurazioni`);

        // Restituisci tutte le macchine trovate
        res.status(200).json({
            machines: combinedMachines,
            count: combinedMachines.length,
            statusCode: 200
        });

    } catch (error) {
        console.error('❌ Errore nel recupero delle configurazioni:', error);
        console.error('Stack traccia:', error.stack);
        res.status(500).json({
            message: error.message || 'Errore durante il recupero delle configurazioni',
            statusCode: 500
        });
    }
});

routerUser.use(protectedRoutes);


routerUser.use((error, req, res, next) => {
    console.error('Errore API utente:', error);
    const status = error.statusCode || 500;
    const message = error.message || 'Errore interno del server';

    res.status(status).json({
        success: false,
        message: message,
        statusCode: status
    });
});


export default routerUser;