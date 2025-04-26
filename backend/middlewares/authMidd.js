import jwt from 'jsonwebtoken';
import User from '../modelli/user.js';

// Generare token JWT
export const generateToken = (userId, userRole) => {
    return jwt.sign(
        {
            id: userId,
            role: userRole // Assicurati che il ruolo sia incluso nel token
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Verifica del token e autenticazione
export const verifyToken = async (req, res, next) => {
    console.log('⭐Middleware verifyToken eseguito su:', req.originalUrl);

    const authHeader = req.header('Authorization');
    console.log('🔑 Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Header non valido');
        return res.status(401).json({
            message: 'Per accedere a questa pagina devi effettuare il login o registrarti',
            requireAuth: true,
            statusCode: 401
        });
    }

    try {
        const token = authHeader.split(' ')[1];
        console.log('🎫 Token estratto:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔓 Token decodificato:', decoded);

        // Recupera l'utente completo dal database
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log('❌ Utente non trovato');
            return res.status(404).json({
                message: 'Utente non trovato',
                requireAuth: true,
                statusCode: 404
            });
        }

        // Salva l'utente completo in req.user
        req.user = user;
        console.log('👤 Utente salvato in req.user:', user._id);

        next();
    } catch (error) {
        console.log('❌ Errore verifica token:', error.message);
        res.status(403).json({
            message: 'Token non valido o scaduto',
            requireAuth: true,
            statusCode: 403
        });
    }
};

// Middleware per verificare il ruolo di amministratore
export const isAdmin = (req, res, next) => {
    console.log("🔒 Verifica admin per:", req.user);
    console.log("👤 Ruolo dell'utente:", req.user?.role);

    if (req.user && req.user.role === 'admin') {
        console.log("✅ Accesso admin consentito");
        next();
    } else {
        console.log("❌ Accesso admin negato");
        res.status(403).json({
            message: 'Accesso negato: richiesti privilegi di amministratore',
            statusCode: 403
        });
    }
};
// Middleware per verificare ruoli specifici
export const checkRole = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: 'Utente non autenticato',
                requireAuth: true,
                statusCode: 401
            });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Non hai i permessi necessari',
                statusCode: 403
            });
        }

        next();
    };
};

export default verifyToken;