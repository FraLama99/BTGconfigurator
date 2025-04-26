import axios from 'axios';
import { notifyCartUpdated } from './cartUtils';



const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;

const noAuthRequired = [
    '/media/carousel/home',
    '/media/carousel',
    '/media',
    '/media/category/',
    '/users/login',
    '/users/register',
    '/users/login-google',
    '/users/callback-google',
    '/users/reset-password'
];

axios.interceptors.request.use(
    (config) => {
        console.log(`📡 Richiesta a: ${config.url} (metodo: ${config.method})`);
        const currentUrl = config.url.split('?')[0];
        console.log(`🔍 URL senza parametri: ${currentUrl}`);

        if (currentUrl.includes('/media') && config.method.toLowerCase() === 'get') {
            console.log(`🔓 Endpoint media pubblico rilevato: ${config.url}`);
            return config;
        }

        const token = localStorage.getItem('token');
        const isPublicEndpoint = noAuthRequired.some(route => {
            const match = currentUrl.includes(route);
            if (match) console.log(`🔓 Endpoint pubblico: ${config.url}`);
            return match && config.method.toLowerCase() === 'get';
        });

        if (!isPublicEndpoint && token) {
            console.log(`🔒 Aggiunto token alla richiesta: ${config.url}`);
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isRedirecting = false;

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && !isRedirecting) {
            isRedirecting = true;
            localStorage.removeItem('token');
            setTimeout(() => {
                window.location.href = '/login';
                isRedirecting = false;
            }, 100);
        }
        return Promise.reject(error);
    }
);

const api = {
    getCarouselImages: () => axios.get('/media/carousel/home'),
    getAllMedia: (filters = {}) => {
        console.log('Chiamata getAllMedia con filtri:', filters);
        if (filters.type === 'carousel' && filters.category === 'home') {
            console.log('🔄 Reindirizzamento a endpoint dedicato /media/carousel/home');
            return axios.get('/media/carousel/home');
        }
        return axios.get('/media', { params: filters });
    },
    getMediaById: (id) => axios.get(`/media/${id}`),
    createMedia: (data) => axios.post('/media', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    uploadMediaImage: (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.post('/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateMedia: (id, data) => axios.put(`/media/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateMediaImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/media/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteMedia: (id) => axios.delete(`/media/${id}`),

    login: (credentials) => axios.post('/users/login', credentials, {
        headers: { 'Content-Type': 'application/json' }
    }),
    register: (userData) => axios.post('/users/register', userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    resetPassword: (email) => axios.post('/users/reset-password', { email }, {
        headers: { 'Content-Type': 'application/json' }
    }),
    confirmResetPassword: (token, password) => axios.post(`/users/reset-password/${token}`, { password }, {
        headers: { 'Content-Type': 'application/json' }
    }),

    getCurrentUser: () => axios.get('/users/me'),
    getUserById: (id) => axios.get(`/users/${id}`),
    updateUser: (id, userData) => axios.put(`/users/${id}`, userData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateAvatar: (id, imageFile) => {
        const formData = new FormData();
        formData.append('avatar', imageFile);
        return axios.patch(`/users/${id}/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteUser: (id) => axios.delete(`/users/${id}`),

    getMachineById: (id) => {
        console.log(`⚙️ Recupero macchina con ID: ${id}`);
        return axios.get(`/machines/${id}`)
            .then(response => {
                console.log('✅ Dati macchina ricevuti:', response.data);
                if (!response.data || !response.data.machine) {
                    console.error('❌ Formato risposta non valido:', response.data);
                    throw new Error('Formato risposta API non valido');
                }
                return response;
            })
            .catch(error => {
                console.error('❌ Errore nel recupero macchina:', error);
                throw error;
            });
    },
    getCustomMachineById: (id) => {
        console.log(`⚙️ Recupero macchina personalizzata con ID: ${id}`);
        return axios.get(`/custom-machines/${id}`)
            .then(response => {
                console.log('✅ Dati macchina personalizzata ricevuti:', response.data);
                if (!response.data || !response.data.customMachine) {
                    console.error('❌ Formato risposta non valido:', response.data);
                    throw new Error('Formato risposta API non valido');
                }
                return response;
            })
            .catch(error => {
                console.error('❌ Errore nel recupero macchina personalizzata:', error);
                throw error;
            });
    },
    getMachineByIdAndType: (id, source) => {
        console.log(`⚙️ Recupero macchina con ID: ${id}, tipo: ${source || 'sconosciuto'}`);

        // Se il source è specificato come customMachine, usa l'endpoint per macchine personalizzate
        if (source === 'customMachine') {
            return axios.get(`/custom-machines/${id}`)
                .then(response => {
                    console.log('✅ Dati macchina personalizzata ricevuti:', response.data);
                    return response;
                })
                .catch(error => {
                    console.error('❌ Errore nel recupero macchina personalizzata:', error);
                    throw error;
                });
        }
        // Altrimenti prova con le macchine standard
        else {
            return axios.get(`/machines/${id}`)
                .then(response => {
                    console.log('✅ Dati macchina standard ricevuti:', response.data);
                    return response;
                })
                .catch(error => {
                    console.error('❌ Errore nel recupero macchina standard:', error);
                    throw error;
                });
        }
    },


    // Ottieni il carrello dell'utente corrente
    getUserCart: () => axios.get('/users/me/cart'),

    // Aggiungi un elemento al carrello
    addToCart: (item) =>
        axios.post('/users/me/cart', item, {
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            notifyCartUpdated();
            return response;
        }),

    // Aggiorna la quantità di un elemento nel carrello
    updateCartItem: (cartItemId, quantity) =>
        axios.patch('/users/me/cart', {
            cartItemId,
            quantity
        }).then(response => {
            notifyCartUpdated();
            return response;
        }),

    // Rimuovi un elemento dal carrello
    removeCartItem: (itemId) =>
        axios.delete(`/users/me/cart/${itemId}`).then(response => {
            notifyCartUpdated();
            return response;
        }),

    // Crea un nuovo ordine
    createOrder: (orderData) => axios.post('/orders', orderData, {
        headers: { 'Content-Type': 'application/json' }
    }),

    // Ottieni un ordine per ID
    getOrderById: (id) => axios.get(`/orders/${id}`),
    saveMachineConfiguration: (configData) => axios.post('/machines', configData, {
        headers: { 'Content-Type': 'application/json' }
    }),

    // Ottieni le configurazioni dell'utente corrente
    getUserMachines: () => axios.get('/users/me/machines'),

    getPresets: () => axios.get('/admin/presets'),
    getPresetById: (id) => axios.get(`/admin/presets/${id}`),
    createPreset: (presetData) => axios.post('/admin/presets', presetData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updatePreset: (id, presetData) => axios.put(`/admin/presets/${id}`, presetData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    deletePreset: (id) => axios.delete(`/admin/presets/${id}`),

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            console.error('Errore nel verificare il token:', error);
            return false;
        }
    },

    getCPUs: (filters = {}) => axios.get('/cpus', { params: filters }),
    getCPUById: (id) => axios.get(`/cpus/${id}`),
    createCPU: (data) => axios.post('/cpus', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCPU: (id, data) => axios.put(`/cpus/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCPUImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/cpus/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteCPU: (id) => axios.delete(`/cpus/${id}`),

    getCases: (filters = {}) => axios.get('/cases', { params: filters }),
    getCaseById: (id) => axios.get(`/cases/${id}`),
    createCase: (data) => axios.post('/cases', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCase: (id, data) => axios.put(`/cases/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCaseImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/cases/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteCase: (id) => axios.delete(`/cases/${id}`),

    getCoolers: (filters = {}) => axios.get('/coolers', { params: filters }),
    getCoolerById: (id) => axios.get(`/coolers/${id}`),
    createCooler: (data) => axios.post('/coolers', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCooler: (id, data) => axios.put(`/coolers/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCoolerImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/coolers/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteCooler: (id) => axios.delete(`/coolers/${id}`),

    getGPUs: (filters = {}) => axios.get('/gpus', { params: filters }),
    getGPUById: (id) => axios.get(`/gpus/${id}`),
    createGPU: (data) => axios.post('/gpus', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateGPU: (id, data) => axios.put(`/gpus/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateGPUImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/gpus/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteGPU: (id) => axios.delete(`/gpus/${id}`),

    getMotherboards: (filters = {}) => axios.get('/motherboards', { params: filters }),
    getMotherboardById: (id) => axios.get(`/motherboards/${id}`),
    createMotherboard: (data) => axios.post('/motherboards', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateMotherboard: (id, data) => axios.put(`/motherboards/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateMotherboardImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/motherboards/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteMotherboard: (id) => axios.delete(`/motherboards/${id}`),

    getPowerSupplies: (filters = {}) => axios.get('/powersupplies', { params: filters }),
    getPowerSupplyById: (id) => axios.get(`/powersupplies/${id}`),
    createPowerSupply: (data) => axios.post('/powersupplies', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updatePowerSupply: (id, data) => axios.put(`/powersupplies/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updatePowerSupplyImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/powersupplies/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deletePowerSupply: (id) => axios.delete(`/powersupplies/${id}`),

    getRAMs: (filters = {}) => axios.get('/rams', { params: filters }),
    getRAMById: (id) => axios.get(`/rams/${id}`),
    createRAM: (data) => axios.post('/rams', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateRAM: (id, data) => axios.put(`/rams/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateRAMImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/rams/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteRAM: (id) => axios.delete(`/rams/${id}`),

    getStorages: (filters = {}) => axios.get('/storages', { params: filters }),
    getStorageById: (id) => axios.get(`/storages/${id}`),
    createStorage: (data) => axios.post('/storages', data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateStorage: (id, data) => axios.put(`/storages/${id}`, data, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateStorageImage: (id, imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        return axios.patch(`/storages/${id}/image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    deleteStorage: (id) => axios.delete(`/storages/${id}`),

    getUsers: () => axios.get('/users'),
    updateUserRole: (id, role) => axios.patch(`/users/${id}/role`, { role }, {
        headers: { 'Content-Type': 'application/json' }
    }),
    createMachine: (machineData) => axios.post('/machines', machineData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    createCustomMachine: (customData) => axios.post('/custom-machines', customData, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        return response;
    }),

    // Aggiungi queste funzioni a api.js
    deleteMachine: (id) => axios.delete(`/machines/${id}`),
    deleteCustomMachine: (id) => axios.delete(`/custom-machines/${id}`),

    // Funzione generica per eliminare qualsiasi tipo di macchina
    deleteMachineByType: (id, source) => {
        if (source === 'customMachine') {
            return axios.delete(`/custom-machines/${id}`);
        } else {
            return axios.delete(`/machines/${id}`);
        }
    },

    updateMachine: (id, machineData) => axios.put(`/machines/${id}`, machineData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    updateCustomMachine: (id, customData) => axios.put(`/custom-machines/${id}`, customData, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        return response;
    }),
    // Crea un nuovo ordine
    createOrder: (orderData) => axios.post('/orders', orderData, {
        headers: { 'Content-Type': 'application/json' }
    }),

    // Ottieni un ordine specifico
    getOrderById: (id) => axios.get(`/orders/${id}`),

    // Ottiene tutti gli ordini dell'utente
    getUserOrders: () => axios.get('/orders'),
    getAdminOrders: (filters = {}) => axios.get('/admin/orders', { params: filters }),

    // Ottieni un ordine specifico (solo admin)
    getAdminOrderById: (id) => axios.get(`/admin/orders/${id}`),

    // Aggiorna lo stato di un ordine (solo admin)
    updateOrderStatus: (id, statusData) => axios.patch(`/admin/orders/${id}/status`, statusData, {
        headers: { 'Content-Type': 'application/json' }
    }),
    getOrderInventory: (orderId) => {
        console.log('Richiesta inventario per ordine:', orderId);
        return axios.get(`/admin/orders/${orderId}/inventory`)
            .then(response => {
                console.log('Risposta inventario:', response.data);
                return response;
            });
    },
    getInventory: () => {
        return axios.get(`/admin/inventory`);
    },
    // route per stampare ordine 
    getPrintableOrder: (id) => axios.get(`/print/orders/${id}`),

    // Analisi degli ordini (solo admin)
    getOrdersAnalytics: () => axios.get('/admin/orders-analytics'),

    // Ripristina lo stock di un ordine cancellato (solo admin)
    restoreOrderStock: (id) => axios.post(`/admin/orders/${id}/restore-stock`),

    // Simula una transazione di pagamento
    processFakePayment: (paymentData) => {
        console.log('🔄 Elaborazione pagamento fittizio:', paymentData);
        // Simula una risposta dopo un breve ritardo
        return new Promise((resolve) => {
            setTimeout(() => {
                // Genera casualmente una transazione riuscita (90% possibilità)
                const isSuccessful = Math.random() < 0.9;

                if (isSuccessful) {
                    resolve({
                        status: 'success',
                        transactionId: 'txn_' + Date.now() + Math.floor(Math.random() * 1000),
                        message: 'Pagamento elaborato con successo'
                    });
                } else {
                    // Simula un errore nella transazione
                    throw new Error('Errore nella transazione di pagamento. Riprova più tardi.');
                }
            }, 1500); // Simula un ritardo di 1.5 secondi
        });
    },

};

export default api;