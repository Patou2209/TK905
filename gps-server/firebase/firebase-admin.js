// ==================== FIREBASE ADMIN CONFIGURATION ====================

const admin = require('firebase-admin');
const path = require('path');

// Charger la clé de service
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// Initialiser Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Référence à la base de données
const db = admin.database();

console.log('✅ Firebase Admin initialisé');

// ==================== FONCTIONS POUR SAUVEGARDER LES DONNÉES ====================

/**
 * Sauvegarder la position actuelle d'un tracker
 * @param {string} imei - IMEI du tracker
 * @param {object} data - Données GPS {lat, lng, speed, battery, timestamp}
 * @param {string} userId - ID de l'utilisateur (optionnel pour l'instant)
 */
async function saveCurrentPosition(imei, data, userId = null) {
    try {
        const positionRef = db.ref(`positions/${imei}/current`);
        
        await positionRef.set({
            lat: data.lat,
            lng: data.lng,
            speed: data.speed || 0,
            battery: data.battery || 100,
            timestamp: data.timestamp || new Date().toISOString()
        });
        
        console.log(`✅ Position sauvegardée pour ${imei}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur sauvegarde position ${imei}:`, error);
        return false;
    }
}

/**
 * Sauvegarder dans l'historique
 * @param {string} imei - IMEI du tracker
 * @param {object} data - Données GPS
 */
async function saveToHistory(imei, data) {
    try {
        const timestamp = data.timestamp || new Date().toISOString();
        const historyRef = db.ref(`positions/${imei}/history/${timestamp}`);
        
        await historyRef.set({
            lat: data.lat,
            lng: data.lng,
            speed: data.speed || 0,
            battery: data.battery || 100
        });
        
        console.log(`📝 Historique sauvegardé pour ${imei}`);
        return true;
    } catch (error) {
        console.error(`❌ Erreur sauvegarde historique ${imei}:`, error);
        return false;
    }
}

/**
 * Mettre à jour le statut du tracker
 * @param {string} imei - IMEI du tracker
 * @param {string} status - moving, stopped, ou offline
 */
async function updateTrackerStatus(imei, status) {
    try {
        // Chercher dans tous les utilisateurs (simplifié pour l'instant)
        const trackersRef = db.ref('trackers');
        
        const snapshot = await trackersRef.once('value');
        const users = snapshot.val();
        
        if (!users) return false;
        
        // Parcourir tous les utilisateurs pour trouver le tracker
        for (const userId in users) {
            if (users[userId][imei]) {
                const trackerRef = db.ref(`trackers/${userId}/${imei}`);
                await trackerRef.update({
                    status: status,
                    lastUpdate: new Date().toISOString()
                });
                
                console.log(`🔄 Statut mis à jour: ${imei} → ${status}`);
                return true;
            }
        }
        
        console.log(`⚠️ Tracker ${imei} non trouvé dans la base`);
        return false;
    } catch (error) {
        console.error(`❌ Erreur mise à jour statut ${imei}:`, error);
        return false;
    }
}

/**
 * Déterminer le statut basé sur la vitesse
 * @param {number} speed - Vitesse en km/h
 * @returns {string} - moving, stopped, ou offline
 */
function determineStatus(speed) {
    if (speed > 5) return 'moving';
    if (speed >= 0) return 'stopped';
    return 'offline';
}

module.exports = {
    saveCurrentPosition,
    saveToHistory,
    updateTrackerStatus,
    determineStatus,
    db
};