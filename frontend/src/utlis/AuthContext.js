import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const lastToken = useRef(null);

    // Funzione per ottenere i dati dell'utente dal backend
    const fetchUserData = async (token) => {
        try {
            const response = await axios.get('http://localhost:5050/api/v1/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("✅ Dati utente recuperati:", response.data);
            setUserData(response.data);

            // Verifica il ruolo dell'utente dai dati recuperati
            const isAdminUser = response.data.role === 'admin';
            console.log("👑 È admin?", isAdminUser, "role:", response.data.role);

            return isAdminUser;
        } catch (error) {
            console.error('❌ Errore nel recupero dei dati utente:', error);
            return false;
        }
    };

    // Aggiunta di una funzione di debug
    const debugToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("❌ Nessun token trovato");
                return null;
            }

            const decoded = jwtDecode(token);
            console.log("🔍 Analisi token:", {
                id: decoded.id,
                exp: new Date(decoded.exp * 1000).toLocaleString(),
                valido: decoded.exp > Date.now() / 1000
            });

            return decoded;
        } catch (error) {
            console.error("❌ Errore nell'analisi del token:", error);
            return null;
        }
    };

    // Verifica l'autenticazione all'avvio
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    lastToken.current = token;
                    debugToken(); // Log del token per debug

                    // Verifica se il token è valido (non scaduto)
                    const decoded = jwtDecode(token);
                    const isTokenValid = decoded.exp > Date.now() / 1000;

                    if (isTokenValid) {
                        setIsAuthenticated(true);
                        // Recupera i dati utente e imposta isAdmin
                        const adminStatus = await fetchUserData(token);
                        console.log("⭐ Impostazione stato admin:", adminStatus);
                        setIsAdmin(adminStatus);
                    } else {
                        console.log("⏱️ Token scaduto, effettua il logout");
                        logout();
                    }
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('❌ Errore nel caricamento dello stato:', error);
                setIsAuthenticated(false);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (token) => {
        try {
            localStorage.setItem('token', token);
            lastToken.current = token;
            setIsAuthenticated(true);

            // Recupera i dati utente e imposta isAdmin
            const adminStatus = await fetchUserData(token);
            console.log("⭐ Login - Impostazione stato admin:", adminStatus);
            setIsAdmin(adminStatus);

            return true;
        } catch (error) {
            console.error('❌ Errore durante il login:', error);
            return false;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem('token', 'cart', 'pendingGoogleAuth');
            lastToken.current = null;
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserData(null);
        } catch (error) {
            console.error('❌ Errore durante il logout:', error);
        }
    };

    const getToken = () => {
        return localStorage.getItem('token');
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAdmin,
            userData,
            login,
            logout,
            getToken,
            loading,
            debugToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);