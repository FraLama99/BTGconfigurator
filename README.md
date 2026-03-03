# indicazioni per runner da locale:

## arpi due terminali, entra con tutti e due in BTGconfigurator, in uno backend e latro frontend.

### nel backend lancia un install e poi scrivi npm run dev, mentre nel frontend installa i pacchetti già presenti nei package e poi scrivi npm start.

### ricordati di compilare il file .env come dersritto nel esempio.

# Link di riferimento per provare l'applicativo lato cliente : https://btg-gconfigurator.vercel.app

# 🖥️ BTG System Configurator 🛠️

Configuratore e shop esame finale BTGSYS per epicode

## 📋 Panoramica del Progetto

BTG System Configurator è una piattaforma completa per la configurazione, personalizzazione e acquisto di computer personalizzati. Molto più di un semplice e-commerce, offre un'esperienza interattiva per creare la macchina ideale, sia per utenti esperti che principianti.

## 🌟 Funzionalità Principali

### 👨‍💻 Lato Cliente

#### 🧙‍♂️ Configuratore Wizard Intelligente

- ⚙️ Configurazione guidata per CPU Intel e AMD con filtro automatico dei componenti compatibili
- 🔄 Selezione step-by-step che mostra solo componenti compatibili con quelli già scelti
- 🚦 Indicatore visivo di disponibilità dei componenti in tempo reale
- 📊 Calcolo automatico del prezzo totale aggiornato ad ogni selezione

#### 🖥️ PC Preconfigurati

- 🎮 Sezioni dedicate per PC gaming e workstation professionali
- 🛠️ Possibilità di personalizzare i PC preconfigurati modificando componenti selezionati (RAM, GPU)
- 💰 Adeguamento automatico del prezzo in base alle personalizzazioni
- 🔍 Filtri per categoria, fascia di prezzo e altre caratteristiche

#### 🛒 Gestione Ordini e Consegne

- ⏱️ Calcolo in tempo reale dei tempi di consegna stimati in base alla disponibilità dei componenti
- 🏭 Verifica automatica della disponibilità a magazzino durante la configurazione
- 📱 Notifiche sullo stato dell'ordine via email
- 💳 Supporto per diversi metodi di pagamento (carta di credito, bonifico bancario)

#### 👤 Area Utente

- 💾 Salvataggio delle configurazioni personalizzate
- 🛒 Gestione del carrello con possibilità di modificare quantità
- 📜 Storico degli ordini con dettaglio componenti
- 🖨️ Stampa delle ricevute degli ordini

### 👑 Lato Amministratore

#### 📊 Gestione Ordini

- 📋 Pannello di controllo con tutti gli ordini in corso
- 🔄 Gestione del workflow: processing → assemblaggio → spedizione → consegnato
- 🔎 Modal dettagliato per ogni fase della lavorazione
- 📧 Notifiche automatiche al cliente ad ogni cambio stato

#### 📦 Gestione Magazzino

- 📈 Monitoraggio in tempo reale delle scorte di componenti
- 🚨 Segnalazione componenti in esaurimento
- 🔄 Aggiornamento automatico dell'inventario ad ogni ordine completato
- 📉 Statistiche sull'utilizzo dei componenti

#### ⚙️ Gestione PC Preconfigurati

- 🆕 Creazione di nuove configurazioni preimpostate
- 🏷️ Applicazione di sconti speciali sulle configurazioni predefinite
- 🧪 Test di compatibilità automatico durante la creazione
- 📢 Attivazione/disattivazione delle configurazioni dal catalogo

#### 👥 Gestione Utenti

- 👀 Visualizzazione di tutti gli utenti registrati
- 🔍 Dettaglio degli ordini per utente
- 🖨️ Stampa degli ordini degli utenti
- 🔒 Gestione dei permessi e ruoli

## 🔧 Tecnologie Utilizzate

### 🖧 Backend

- Framework: Express.js su Node.js
- Database: MongoDB con Mongoose
- Autenticazione: JWT (JSON Web Tokens), Passport.js
- Email Service: Nodemailer
- Upload Immagini: Cloudinary
- API: RESTful con axios per le richieste
- Middleware: Custom per autenticazione, gestione inventario, email

### 🎨 Frontend

- Framework: React.js
- Routing: React Router
- Gestione Stato: React Context API
- UI Components: React Bootstrap, Bootstrap Icons
- Animazioni: Framer Motion
- Styling: CSS personalizzato, Bootstrap
- HTTP Client: Axios
- Internazionalizzazione: Intl per formattazione prezzi e date

## 🌈 Caratteristiche Distintive

- 🔍 Intelligenza nella selezione: il wizard configura automaticamente le opzioni disponibili basandosi su compatibilità reale tra componenti
- ⏱️ Feedback in tempo reale: il sistema calcola e mostra istantaneamente tempi di consegna e prezzi
- 🛠️ Flessibilità di personalizzazione: sia per macchine predefinite che totalmente personalizzate
- 👥 Dual-face: esperienza completa per cliente e amministratore nella stessa piattaforma
- 📊 Gestione inventario intelligente: tracciamento componenti usati e aggiornamento automatico delle scorte
- 📱 Interfaccia responsive: esperienza fluida su desktop e dispositivi mobili

## 🔮 Sviluppi Futuri

- 🌐 Integrazione con fornitori esterni per ampliare il catalogo
- 🤖 Sistema di raccomandazione basato su AI
- 📱 App mobile dedicata
- 💬 Supporto cliente via chat in tempo reale
- 🔍 Ricerca avanzata con filtri multipli

## 🚀 Conclusione

BTG System Configurator rappresenta una soluzione completa che va oltre il semplice e-commerce: è un configuratore avanzato che integra gestione inventario, verifica compatibilità e amministrazione completa. L'interfaccia user-friendly con wizard guidato permette anche a utenti meno esperti di creare il proprio PC ideale, mentre il backend robusto assicura un'esperienza affidabile sia per i clienti che per gli amministratori.

🏆 **PC CONFIGURATOR**: La soluzione completa per assemblare e vendere computer su misura, combinando le potenzialità di un e-commerce avanzato con un configuratore intelligente! 🏆
