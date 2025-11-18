// ==================== TK905 PROTOCOL PARSER ====================

/**
 * Parser pour le protocole TK905
 * 
 * Format des données TK905 (exemple) :
 * imei:359586015829802,tracker,150524171648,,F,121648.000,A,2234.5678,N,11357.9012,E,0.00,;
 * 
 * Structure :
 * - imei:XXXXXXXXXX : Identifiant du tracker
 * - tracker : Type de message
 * - Date/Heure : DDMMYYHHMMSS
 * - F/L : First/Later fix
 * - HHMMSS.SSS : Time
 * - A/V : Valid/Invalid
 * - Latitude : DDMM.MMMM,N/S
 * - Longitude : DDDMM.MMMM,E/W
 * - Speed : Vitesse en noeuds
 */

/**
 * Convertir les coordonnées DDMM.MMMM en degrés décimaux
 * @param {string} coord - Coordonnée au format DDMM.MMMM
 * @param {string} direction - N/S/E/W
 * @returns {number} - Coordonnée en degrés décimaux
 */
function convertCoordinate(coord, direction) {
    if (!coord || coord === '') return 0;
    
    const degrees = Math.floor(parseFloat(coord) / 100);
    const minutes = parseFloat(coord) % 100;
    let decimal = degrees + (minutes / 60);
    
    // Appliquer la direction
    if (direction === 'S' || direction === 'W') {
        decimal = -decimal;
    }
    
    return parseFloat(decimal.toFixed(6));
}

/**
 * Convertir vitesse en noeuds vers km/h
 * @param {string} knots - Vitesse en noeuds
 * @returns {number} - Vitesse en km/h
 */
function knotsToKmh(knots) {
    return Math.round(parseFloat(knots || 0) * 1.852);
}

/**
 * Parser les données TK905
 * @param {string} data - Données brutes du tracker
 * @returns {object|null} - Données parsées ou null si erreur
 */
function parseTK905Data(data) {
    try {
        // Nettoyer les données
        const cleanData = data.toString().trim();
        
        console.log('📨 Données reçues:', cleanData);
        
        // Extraire l'IMEI
        const imeiMatch = cleanData.match(/imei:(\d+)/i);
        if (!imeiMatch) {
            console.log('⚠️ IMEI non trouvé dans les données');
            return null;
        }
        
        const imei = imeiMatch[1];
        
        // Vérifier si c'est un message de tracking
        if (!cleanData.includes('tracker')) {
            console.log('⚠️ Pas un message de tracking');
            return null;
        }
        
        // Séparer par virgules
        const parts = cleanData.split(',');
        
        if (parts.length < 12) {
            console.log('⚠️ Format de données incomplet');
            return null;
        }
        
        // Extraire les informations
        const valid = parts[6]; // A = valid, V = invalid
        
        if (valid !== 'A') {
            console.log('⚠️ Signal GPS invalide');
            return {
                imei: imei,
                valid: false,
                timestamp: new Date().toISOString()
            };
        }
        
        const latitude = convertCoordinate(parts[7], parts[8]);
        const longitude = convertCoordinate(parts[9], parts[10]);
        const speedKnots = parts[11];
        const speedKmh = knotsToKmh(speedKnots);
        
        // Construire l'objet de données
        const parsedData = {
            imei: imei,
            lat: latitude,
            lng: longitude,
            speed: speedKmh,
            battery: 100, // TK905 n'envoie pas toujours la batterie, valeur par défaut
            timestamp: new Date().toISOString(),
            valid: true,
            raw: cleanData
        };
        
        console.log('✅ Données parsées:', {
            imei: parsedData.imei,
            lat: parsedData.lat,
            lng: parsedData.lng,
            speed: parsedData.speed
        });
        
        return parsedData;
        
    } catch (error) {
        console.error('❌ Erreur parsing TK905:', error);
        return null;
    }
}

/**
 * Parser alternatif pour format différent
 * Certains TK905 utilisent un format légèrement différent
 */
function parseTK905Alternative(data) {
    try {
        const cleanData = data.toString().trim();
        
        // Format alternatif : (BP05)imei:359586015829802...
        const imeiMatch = cleanData.match(/imei:(\d+)/i);
        if (!imeiMatch) return null;
        
        const imei = imeiMatch[1];
        
        // Chercher les coordonnées au format GPS standard
        const latMatch = cleanData.match(/([0-9]{2})([0-9]{2}\.[0-9]+),([NS])/);
        const lonMatch = cleanData.match(/([0-9]{3})([0-9]{2}\.[0-9]+),([EW])/);
        
        if (!latMatch || !lonMatch) return null;
        
        const latitude = convertCoordinate(latMatch[1] + latMatch[2], latMatch[3]);
        const longitude = convertCoordinate(lonMatch[1] + lonMatch[2], lonMatch[3]);
        
        // Chercher la vitesse
        const speedMatch = cleanData.match(/,([0-9]+\.[0-9]+),/);
        const speedKmh = speedMatch ? knotsToKmh(speedMatch[1]) : 0;
        
        return {
            imei: imei,
            lat: latitude,
            lng: longitude,
            speed: speedKmh,
            battery: 100,
            timestamp: new Date().toISOString(),
            valid: true,
            raw: cleanData
        };
        
    } catch (error) {
        console.error('❌ Erreur parsing alternatif:', error);
        return null;
    }
}

/**
 * Essayer de parser avec tous les formats
 */
function parseData(data) {
    // Essayer le format principal
    let parsed = parseTK905Data(data);
    
    // Si échec, essayer le format alternatif
    if (!parsed || !parsed.valid) {
        parsed = parseTK905Alternative(data);
    }
    
    return parsed;
}

module.exports = {
    parseData,
    parseTK905Data,
    parseTK905Alternative,
    convertCoordinate,
    knotsToKmh
};