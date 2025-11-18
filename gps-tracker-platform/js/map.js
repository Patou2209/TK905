

// ==================== MAP MANAGEMENT ====================

let map = null;
let markers = {};
let historyPolyline = null;
let historyMarkers = [];

// Initialiser la carte
function initMap() {
    // Centre initial (Pretoria, Afrique du Sud)
    const defaultCenter = [-25.7479, 28.2293];
    const defaultZoom = 13;
    
    // Créer la carte
    map = L.map('map').setView(defaultCenter, defaultZoom);
    
    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('Carte initialisée');
}

// Créer une icône personnalisée selon le statut
function createCustomIcon(status, isSelected = false) {
    const colors = {
        moving: '#10b981',    // Vert
        stopped: '#f59e0b',   // Orange
        offline: '#ef4444',   // Rouge
        selected: '#3b82f6'   // Bleu (véhicule suivi)
    };
    
    // Utiliser bleu si sélectionné, sinon couleur du statut
    const color = isSelected ? colors.selected : (colors[status] || '#6b7280');
    
    // Créer une icône SVG de localisation (pin)
    const svgIcon = `
        <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
            <!-- Ombre -->
            <ellipse cx="20" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>
            
            <!-- Pin de localisation -->
            <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 33 15 33s15-24.716 15-33C35 6.716 28.284 0 20 0z" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="2"/>
            
            <!-- Cercle intérieur blanc -->
            <circle cx="20" cy="15" r="6" fill="white"/>
            
            <!-- Point central -->
            <circle cx="20" cy="15" r="3" fill="${color}"/>
        </svg>
    `;
    
    return L.divIcon({
        className: 'custom-pin-icon',
        html: svgIcon,
        iconSize: [40, 48],
        iconAnchor: [20, 48], // Point en bas du pin
        popupAnchor: [0, -48] // Popup au-dessus du pin
    });
}

// Ajouter ou mettre à jour un marqueur avec animation smooth
function addOrUpdateMarker(tracker) {
    const { imei, lat, lng, name, speed, battery, status } = tracker;
    
    // Si le marqueur existe déjà, le mettre à jour avec animation
    if (markers[imei]) {
        const currentLatLng = markers[imei].getLatLng();
        const newLatLng = [lat, lng];
        
        // Vérifier si la position a changé significativement
        const distance = map.distance(currentLatLng, newLatLng);
        
        if (distance > 0.1) { // Plus de 10cm de différence
            // Animation smooth de la position
            animateMarkerMove(markers[imei], currentLatLng, newLatLng, 100);
        }
        
        // Mettre à jour l'icône si le statut a changé
        markers[imei].setIcon(createCustomIcon(status));
        
        // Mettre à jour le popup
        const popupContent = createPopupContent(tracker);
        markers[imei].setPopupContent(popupContent);
    } else {
        // Créer un nouveau marqueur
        const marker = L.marker([lat, lng], {
            icon: createCustomIcon(status)
        }).addTo(map);
        
        // Ajouter le popup
        const popupContent = createPopupContent(tracker);
        marker.bindPopup(popupContent);
        
        // Sauvegarder le marqueur
        markers[imei] = marker;
    }
}

// Animation smooth du mouvement du marqueur
function animateMarkerMove(marker, startLatLng, endLatLng, duration) {
    const startTime = Date.now();
    const startLat = startLatLng.lat;
    const startLng = startLatLng.lng;
    const endLat = endLatLng[0];
    const endLng = endLatLng[1];
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function pour un mouvement naturel
        const easedProgress = easeInOutCubic(progress);
        
        // Interpolation de la position
        const currentLat = startLat + (endLat - startLat) * easedProgress;
        const currentLng = startLng + (endLng - startLng) * easedProgress;
        
        marker.setLatLng([currentLat, currentLng]);
        
        // Continuer l'animation si pas terminée
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Fonction d'easing pour un mouvement naturel
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Créer le contenu du popup
function createPopupContent(tracker) {
    const statusText = {
        moving: 'En marche',
        stopped: 'En arrêt',
        offline: 'Hors ligne'
    };
    
    const brand = tracker.brand || '';
    const model = tracker.model || '';
    const vehicleInfo = brand || model ? `${brand} ${model}`.trim() : '';
    const driverName = tracker.driverName || '';
    const plate = tracker.plate || '';
    
    return `
        <div style="padding: 8px; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${tracker.vehicleName || tracker.name}</h3>
            ${vehicleInfo ? `<p style="margin: 4px 0; font-size: 13px; color: #3b82f6; font-weight: 500;">${vehicleInfo}</p>` : ''}
            ${plate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Plaque:</strong> ${plate}</p>` : ''}
            ${driverName ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Chauffeur:</strong> ${driverName}</p>` : ''}
            <p style="margin: 4px 0; font-size: 13px;">IMEI: ${tracker.imei}</p>
            <p style="margin: 4px 0; font-size: 13px;">Vitesse: ${tracker.speed} km/h</p>
            <p style="margin: 4px 0; font-size: 13px;">Batterie: ${tracker.battery}%</p>
            <p style="margin: 4px 0; font-size: 13px;">Statut: ${statusText[tracker.status] || 'Inconnu'}</p>
        </div>
    `;
}

// Voler vers une position avec animation fluide
function flyToTracker(lat, lng, zoom = 15) {
    if (map) {
        map.flyTo([lat, lng], zoom, {
            duration: 1.5,
            easeLinearity: 0.25
        });
    }
}

// Supprimer un marqueur
function removeMarker(imei) {
    if (markers[imei]) {
        map.removeLayer(markers[imei]);
        delete markers[imei];
    }
}

// Supprimer tous les marqueurs
function clearAllMarkers() {
    Object.keys(markers).forEach(imei => {
        map.removeLayer(markers[imei]);
    });
    markers = {};
}

// Afficher l'historique d'un tracker
function showHistory(historyData) {
    // Supprimer l'ancien historique
    clearHistory();
    
    if (!historyData || historyData.length === 0) {
        return;
    }
    
    // Créer la polyligne
    const positions = historyData.map(point => [point.lat, point.lng]);
    
    historyPolyline = L.polyline(positions, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7
    }).addTo(map);
    
    // Ajouter des marqueurs pour chaque point
    historyData.forEach((point, index) => {
        const marker = L.circleMarker([point.lat, point.lng], {
            radius: 4,
            fillColor: '#3b82f6',
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        // Ajouter un popup avec les informations
        const timestamp = new Date(point.timestamp).toLocaleString('fr-FR');
        marker.bindPopup(`
            <div style="padding: 8px;">
                <p style="margin: 4px 0; font-size: 14px; font-weight: bold;">${timestamp}</p>
                <p style="margin: 4px 0; font-size: 14px;">Vitesse: ${point.speed} km/h</p>
            </div>
        `);
        
        historyMarkers.push(marker);
    });
    
    // Ajuster la vue pour montrer tout l'historique
    map.fitBounds(historyPolyline.getBounds(), {
        padding: [50, 50]
    });
}

// Supprimer l'historique affiché
function clearHistory() {
    // Supprimer la polyligne
    if (historyPolyline) {
        map.removeLayer(historyPolyline);
        historyPolyline = null;
    }
    
    // Supprimer les marqueurs d'historique
    historyMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    historyMarkers = [];
}

// Obtenir les limites de tous les marqueurs visibles
function fitAllMarkers() {
    const markerPositions = Object.values(markers).map(marker => marker.getLatLng());
    
    if (markerPositions.length > 0) {
        const group = L.featureGroup(Object.values(markers));
        map.fitBounds(group.getBounds(), {
            padding: [50, 50]
        });
    }
}