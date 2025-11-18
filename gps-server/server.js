// ==================== SERVEUR TCP POUR TRACKERS TK905 ====================

// Charger les variables d'environnement
require('dotenv').config();

const net = require('net');
const { parseData } = require('./protocol/tk905-parser');
const {
    saveCurrentPosition,
    saveToHistory,
    updateTrackerStatus,
    determineStatus
} = require('./firebase/firebase-admin');

// Configuration
const PORT = process.env.PORT || 5023;
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces

// Stocker les connexions actives
const activeConnections = new Map();

// ==================== CRÉER LE SERVEUR TCP ====================

const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    console.log('\n🔌 Nouvelle connexion:', clientId);
    
    // Stocker la connexion
    activeConnections.set(clientId, {
        socket: socket,
        imei: null,
        connectedAt: new Date()
    });
    
    // ==================== RÉCEPTION DES DONNÉES ====================
    
    socket.on('data', async (data) => {
        try {
            console.log('\n📥 Données reçues de', clientId);
            console.log('📄 Brut:', data.toString());
            
            // Parser les données
            const parsedData = parseData(data);
            
            if (!parsedData) {
                console.log('⚠️ Données non parsables');
                return;
            }
            
            // Stocker l'IMEI de cette connexion
            const connection = activeConnections.get(clientId);
            if (connection) {
                connection.imei = parsedData.imei;
            }
            
            // Si le GPS est invalide, ne pas sauvegarder
            if (!parsedData.valid) {
                console.log('⚠️ GPS invalide, en attente de signal...');
                
                // Répondre au tracker pour confirmer la réception
                socket.write('LOAD');
                return;
            }
            
            console.log('✅ Données valides:');
            console.log(`   📍 Position: ${parsedData.lat}, ${parsedData.lng}`);
            console.log(`   🚗 Vitesse: ${parsedData.speed} km/h`);
            console.log(`   🔋 Batterie: ${parsedData.battery}%`);
            
            // Déterminer le statut
            const status = determineStatus(parsedData.speed);
            console.log(`   📊 Statut: ${status}`);
            
            // Sauvegarder dans Firebase
            const savePromises = [
                saveCurrentPosition(parsedData.imei, parsedData),
                saveToHistory(parsedData.imei, parsedData),
                updateTrackerStatus(parsedData.imei, status)
            ];
            
            await Promise.all(savePromises);
            
            console.log('💾 Données sauvegardées dans Firebase');
            
            // Répondre au tracker pour confirmer
            socket.write('LOAD');
            
        } catch (error) {
            console.error('❌ Erreur traitement données:', error);
        }
    });
    
    // ==================== GESTION DES ERREURS ====================
    
    socket.on('error', (error) => {
        console.error('❌ Erreur socket', clientId, ':', error.message);
    });
    
    socket.on('close', () => {
        const connection = activeConnections.get(clientId);
        const imei = connection ? connection.imei : 'inconnu';
        
        console.log('🔌 Connexion fermée:', clientId, '(IMEI:', imei, ')');
        
        // Marquer le tracker comme offline si on connaît son IMEI
        if (imei && imei !== 'inconnu') {
            updateTrackerStatus(imei, 'offline').catch(console.error);
        }
        
        activeConnections.delete(clientId);
    });
    
    socket.on('timeout', () => {
        console.log('⏱️ Timeout:', clientId);
        socket.end();
    });
    
    // Définir un timeout de 5 minutes
    socket.setTimeout(300000);
});

// ==================== DÉMARRAGE DU SERVEUR ====================

server.listen(PORT, HOST, () => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   🚀 SERVEUR GPS TK905 DÉMARRÉ            ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║   📡 Port: ${PORT}                          ║`);
    console.log(`║   🌐 Host: ${HOST}                    ║`);
    console.log('║   🔥 Firebase: Connecté                    ║');
    console.log('╚════════════════════════════════════════════╝\n');
    console.log('✅ En attente de connexions des trackers...\n');
});

// ==================== GESTION DES ERREURS DU SERVEUR ====================

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${PORT} est déjà utilisé`);
        console.log('💡 Solutions:');
        console.log('   1. Changez le port dans le fichier .env');
        console.log('   2. Arrêtez l\'application qui utilise ce port');
    } else {
        console.error('❌ Erreur serveur:', error);
    }
    process.exit(1);
});

// ==================== ARRÊT PROPRE ====================

process.on('SIGINT', () => {
    console.log('\n\n🛑 Arrêt du serveur...');
    
    // Fermer toutes les connexions
    activeConnections.forEach((connection, clientId) => {
        console.log(`🔌 Fermeture connexion: ${clientId}`);
        connection.socket.end();
    });
    
    // Fermer le serveur
    server.close(() => {
        console.log('✅ Serveur arrêté proprement');
        process.exit(0);
    });
    
    // Force la fermeture après 5 secondes
    setTimeout(() => {
        console.log('⚠️ Fermeture forcée');
        process.exit(0);
    }, 5000);
});

// ==================== STATISTIQUES ====================

// Afficher les statistiques toutes les 5 minutes
setInterval(() => {
    console.log('\n📊 STATISTIQUES:');
    console.log(`   🔌 Connexions actives: ${activeConnections.size}`);
    
    if (activeConnections.size > 0) {
        console.log('   📱 Trackers connectés:');
        activeConnections.forEach((connection, clientId) => {
            const uptime = Math.floor((Date.now() - connection.connectedAt) / 1000 / 60);
            console.log(`      - ${connection.imei || 'inconnu'} (${clientId}) - ${uptime}min`);
        });
    }
    console.log('');
}, 300000); // 5 minutes