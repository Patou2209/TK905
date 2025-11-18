

// ==================== MAIN APPLICATION LOGIC ====================

// Variables globales
/*let currentUser = null;
let trackersData = [];
let selectedTracker = null;
let currentFilter = 'all';
let currentView = 'live'; // 'live' ou 'history'
let useMockData = true; // ← CHANGEZ À false POUR MODE RÉEL

// ==================== INITIALISATION ====================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page index.html
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        initializeApp();
    }
});

// Initialiser l'application
function initializeApp() {
    console.log('Initialisation de l\'application...');
    
    // Initialiser la carte
    initMap();
    
    // Attendre que l'utilisateur soit connecté
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            console.log('Utilisateur connecté:', user.email);
            
            // Charger les données
            if (useMockData) {
                loadMockData();
            } else {
                loadRealData();
            }
            
            // Initialiser les événements
            initializeEventListeners();
            
            // Initialiser les événements du modal de gestion
            initTrackerModalEvents();
            
            // Initialiser les contrôles d'historique
            initHistoryControls();
        }
    });
}

// ==================== CHARGEMENT DES DONNÉES ====================

// Charger des données de démonstration
function loadMockData() {
    console.log('Chargement des données de démonstration...');
    
    trackersData = [
        {
            imei: '2015070203001',
            name: 'Véhicule 1',
            lat: -25.7479,
            lng: 28.2293,
            speed: 45,
            battery: 85,
            status: 'moving',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7479, 28.2293)
        },
        {
            imei: '2015070203002',
            name: 'Véhicule 2',
            lat: -25.7679,
            lng: 28.2493,
            speed: 0,
            battery: 72,
            status: 'stopped',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7679, 28.2493)
        },
        {
            imei: '2015070203003',
            name: 'Véhicule 3',
            lat: -25.7279,
            lng: 28.2093,
            speed: 60,
            battery: 95,
            status: 'moving',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7279, 28.2093)
        },
        {
            imei: '2015070203004',
            name: 'Véhicule 4',
            lat: -25.7579,
            lng: 28.2693,
            speed: 0,
            battery: 45,
            status: 'offline',
            lastUpdate: new Date(Date.now() - 3600000).toISOString(),
            history: generateMockHistory(-25.7579, 28.2693)
        }
    ];
    
    // Afficher les données
    displayTrackers();
    updateFilterCounts();
    
    // Simuler les mises à jour en temps réel
    startMockUpdates();
}

// Générer un historique de démonstration
function generateMockHistory(baseLat, baseLng) {
    const history = [];
    const now = Date.now();
    
    for (let i = 0; i < 20; i++) {
        history.push({
            lat: baseLat + (Math.random() - 0.5) * 0.02,
            lng: baseLng + (Math.random() - 0.5) * 0.02,
            speed: Math.floor(Math.random() * 80),
            timestamp: new Date(now - (20 - i) * 300000).toISOString()
        });
    }
    
    return history;
}

// Simuler les mises à jour en temps réel (données de démo)
function startMockUpdates() {
    // Initialiser les données d'animation pour chaque tracker
    trackersData.forEach(tracker => {
        if (tracker.status === 'moving') {
            tracker.animationData = {
                startLat: tracker.lat,
                startLng: tracker.lng,
                targetLat: tracker.lat + (Math.random() - 0.5) * 0.005,
                targetLng: tracker.lng + (Math.random() - 0.5) * 0.005,
                progress: 0,
                lastUpdateTime: Date.now()
            };
        }
    });
    
    // Animation fluide à 60 FPS
    function animateVehicles() {
        const now = Date.now();
        let needsUpdate = false;
        
        trackersData.forEach(tracker => {
            if (tracker.status === 'moving' && tracker.animationData) {
                const elapsed = now - tracker.animationData.lastUpdateTime;
                
                // Calculer la vitesse de progression basée sur la vitesse réelle
                // Plus le véhicule va vite, plus il se déplace rapidement
                // 1 km/h = 0.000278 km/s = 0.278 m/s
                // Conversion: speed (km/h) -> distance par frame
                const speedFactor = tracker.speed / 100; // Normaliser la vitesse
                const progressIncrement = speedFactor * 0.02; // Ajuster selon les besoins
                
                tracker.animationData.progress += progressIncrement;
                
                if (tracker.animationData.progress >= 1) {
                    // Arrivé à destination, définir une nouvelle cible
                    tracker.animationData.startLat = tracker.animationData.targetLat;
                    tracker.animationData.startLng = tracker.animationData.targetLng;
                    tracker.animationData.targetLat = tracker.lat + (Math.random() - 0.5) * 0.005;
                    tracker.animationData.targetLng = tracker.lng + (Math.random() - 0.5) * 0.005;
                    tracker.animationData.progress = 0;
                    
                    // Varier légèrement la vitesse
                    tracker.speed = Math.max(20, Math.min(120, tracker.speed + (Math.random() - 0.5) * 10));
                }
                
                // Interpolation smooth (easing)
                const easedProgress = easeInOutQuad(tracker.animationData.progress);
                
                // Calculer la nouvelle position
                tracker.lat = lerp(
                    tracker.animationData.startLat,
                    tracker.animationData.targetLat,
                    easedProgress
                );
                tracker.lng = lerp(
                    tracker.animationData.startLng,
                    tracker.animationData.targetLng,
                    easedProgress
                );
                
                tracker.lastUpdate = new Date().toISOString();
                tracker.animationData.lastUpdateTime = now;
                
                // Mettre à jour le marqueur sur la carte
                addOrUpdateMarker(tracker);
                
                // Si ce tracker est sélectionné, mettre à jour le panneau d'infos
                if (selectedTracker && selectedTracker.imei === tracker.imei) {
                    updateInfoPanel(tracker);
                }
                
                needsUpdate = true;
            }
        });
        
        // Demander la prochaine frame
        requestAnimationFrame(animateVehicles);
    }
    
    // Démarrer l'animation
    animateVehicles();
    
    // Mettre à jour l'affichage de la liste périodiquement
    setInterval(() => {
        displayTrackers();
    }, 2000);
}

// Fonction d'interpolation linéaire
function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

// Fonction d'easing pour un mouvement plus naturel
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Charger les vraies données depuis Firebase
function loadRealData() {
    console.log('Chargement des données depuis Firebase...');
    
    const userId = currentUser.uid;
    const trackersRef = database.ref('trackers/' + userId);
    
    // Écouter les changements
    trackersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            trackersData = [];
            
            Object.keys(data).forEach(imei => {
                const tracker = data[imei];
                
                // Récupérer la position actuelle
                database.ref('positions/' + imei + '/current').once('value', (posSnapshot) => {
                    const position = posSnapshot.val();
                    
                    if (position) {
                        trackersData.push({
                            imei: imei,
                            name: tracker.name,
                            lat: position.lat,
                            lng: position.lng,
                            speed: position.speed || 0,
                            battery: position.battery || 0,
                            status: tracker.status || 'offline',
                            lastUpdate: tracker.lastUpdate
                        });
                        
                        // Afficher les données
                        displayTrackers();
                        updateFilterCounts();
                    }
                });
            });
        } else {
            console.log('Aucun tracker trouvé pour cet utilisateur');
            trackersData = [];
            displayTrackers();
        }
    });
}

// ==================== AFFICHAGE ====================

// Afficher la liste des trackers
function displayTrackers() {
    const container = document.getElementById('trackerListContainer');
    
    // Filtrer les trackers
    let filtered = trackersData;
    if (currentFilter !== 'all') {
        filtered = trackersData.filter(t => t.status === currentFilter);
    }
    
    // Mettre à jour le compteur
    document.getElementById('trackerCount').textContent = `${filtered.length} véhicule(s)`;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">Aucun tracker trouvé</div>';
        return;
    }
    
    // Créer les éléments de la liste
    filtered.forEach(tracker => {
        const item = createTrackerListItem(tracker);
        container.appendChild(item);
        
        // Ajouter ou mettre à jour le marqueur sur la carte
        if (currentView === 'live') {
            addOrUpdateMarker(tracker);
        }
    });
}

// Créer un élément de la liste de trackers
function createTrackerListItem(tracker) {
    const div = document.createElement('div');
    div.className = 'tracker-item';
    if (selectedTracker && selectedTracker.imei === tracker.imei) {
        div.classList.add('selected');
    }
    
    const statusText = {
        moving: 'En marche',
        stopped: 'En arrêt',
        offline: 'Hors ligne'
    };
    
    const statusClass = `status-${tracker.status}`;
    
    const updateTime = new Date(tracker.lastUpdate).toLocaleTimeString('fr-FR');
    
    // Informations du véhicule
    const brand = tracker.brand || '';
    const model = tracker.model || '';
    const vehicleInfo = brand || model ? `${brand} ${model}`.trim() : '';
    const driverName = tracker.driverName || '';
    
    div.innerHTML = `
        <div class="tracker-header">
            <h3 class="tracker-name">${tracker.vehicleName || tracker.name}</h3>
            <div class="status-dot ${statusClass}"></div>
        </div>
        <div class="tracker-info">
            ${vehicleInfo ? `<p style="color: #3b82f6; font-weight: 500;">${vehicleInfo}</p>` : ''}
            ${driverName ? `<p><strong>Chauffeur:</strong> ${driverName}</p>` : ''}
            <p>IMEI: ${tracker.imei}</p>
            <p>Statut: <span class="tracker-status">${statusText[tracker.status] || 'Inconnu'}</span></p>
            <p>Vitesse: ${tracker.speed} km/h</p>
            <p>Batterie: ${tracker.battery}%</p>
            <p class="tracker-update">MAJ: ${updateTime}</p>
        </div>
    `;
    
    // Événement de clic
    div.addEventListener('click', () => {
        selectTracker(tracker);
    });
    
    return div;
}

// Sélectionner un tracker
function selectTracker(tracker) {
    selectedTracker = tracker;
    
    // Mettre à jour l'affichage de la liste
    displayTrackers();
    
    // Voler vers le tracker
    flyToTracker(tracker.lat, tracker.lng);
    
    // Afficher le panneau d'infos
    showInfoPanel(tracker);
    
    // Si on est en mode historique, afficher l'historique
    if (currentView === 'history') {
        showTrackerHistory(tracker);
    }
}

// Afficher le panneau d'informations
function showInfoPanel(tracker) {
    const panel = document.getElementById('infoPanel');
    const viewText = currentView === 'live' ? 'Position actuelle' : 'Historique du trajet';
    
    document.getElementById('infoPanelName').textContent = tracker.name;
    document.getElementById('infoPanelView').textContent = viewText;
    document.getElementById('infoPanelSpeed').textContent = `${tracker.speed} km/h`;
    document.getElementById('infoPanelBattery').textContent = `Batterie: ${tracker.battery}%`;
    
    panel.style.display = 'block';
}

// Mettre à jour le panneau d'informations
function updateInfoPanel(tracker) {
    if (document.getElementById('infoPanel').style.display === 'block') {
        document.getElementById('infoPanelSpeed').textContent = `${tracker.speed} km/h`;
        document.getElementById('infoPanelBattery').textContent = `Batterie: ${tracker.battery}%`;
    }
}

// Mettre à jour les compteurs de filtres
function updateFilterCounts() {
    document.getElementById('countAll').textContent = `(${trackersData.length})`;
    document.getElementById('countMoving').textContent = `(${trackersData.filter(t => t.status === 'moving').length})`;
    document.getElementById('countStopped').textContent = `(${trackersData.filter(t => t.status === 'stopped').length})`;
    document.getElementById('countOffline').textContent = `(${trackersData.filter(t => t.status === 'offline').length})`;
}

// ==================== ÉVÉNEMENTS ====================

// Initialiser les événements
function initializeEventListeners() {
    // Toggle sidebar
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('sidebar-expanded');
        
        // Re-initialiser les icônes Lucide
        setTimeout(() => lucide.createIcons(), 100);
    });
    
    // Filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            // Mettre à jour le filtre
            currentFilter = btn.dataset.filter;
            
            // Réafficher les trackers
            displayTrackers();
        });
    });
    
    // Navigation (Live / History)
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons de navigation
            document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            // Mettre à jour la vue
            currentView = btn.dataset.view;
            
            // Afficher/masquer les panneaux selon la vue
            if (currentView === 'history') {
                // Afficher le panneau de contrôle d'historique
                toggleHistoryControls(true);
                document.getElementById('infoPanel').style.display = 'none';
                
                // Charger l'historique si un tracker est sélectionné
                if (selectedTracker) {
                    loadHistoryForDateRange();
                } else {
                    alert('Veuillez sélectionner un tracker pour voir l\'historique');
                }
            } else {
                // Vue live - masquer le panneau d'historique
                toggleHistoryControls(false);
                clearHistory();
                displayTrackers();
                
                if (selectedTracker) {
                    showInfoPanel(selectedTracker);
                }
            }
        });
    });
}

// Afficher l'historique d'un tracker
function showTrackerHistory(tracker) {
    // En mode démo, utiliser l'historique généré
    if (useMockData) {
        currentHistoryData = tracker.history;
        showHistory(tracker.history);
        updateHistoryStats(tracker.history);
        showInfoPanel(tracker);
        return;
    }
    
    // En mode réel, charger l'historique depuis Firebase
    const historyRef = database.ref('positions/' + tracker.imei + '/history');
    
    historyRef.once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            const historyArray = Object.keys(data).map(key => ({
                ...data[key],
                timestamp: key
            }));
            
            // Trier par timestamp
            historyArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            currentHistoryData = historyArray;
            
            // Afficher sur la carte
            showHistory(historyArray);
            updateHistoryStats(historyArray);
        } else {
            alert('Aucun historique disponible pour ce tracker');
        }
    });
}

// La fonction exportHistoryToPDF est maintenant dans history-manager.js
// Plus besoin de la dupliquer ici

// ==================== FONCTIONS UTILITAIRES ====================

// Formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
}

// Obtenir la couleur selon le statut
function getStatusColor(status) {
    const colors = {
        moving: '#10b981',
        stopped: '#f59e0b',
        offline: '#ef4444'
    };
    return colors[status] || '#6b7280';
}

console.log('Application chargée et prête'); 
*/

// ==================== MAIN APPLICATION LOGIC ====================

// Variables globales
let currentUser = null;
let trackersData = [];
let selectedTracker = null;
let currentFilter = 'all';
let currentView = 'live'; // 'live' ou 'history'
let useMockData = true; // ← CHANGEZ À false POUR MODE RÉEL

// ==================== INITIALISATION ====================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page index.html
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        initializeApp();
    }
});

// Initialiser l'application
function initializeApp() {
    console.log('Initialisation de l\'application...');
    
    // Initialiser la carte
    initMap();
    
    // Attendre que l'utilisateur soit connecté
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            console.log('Utilisateur connecté:', user.email);
            
            // Charger les données
            if (useMockData) {
                loadMockData();
            } else {
                loadRealData();
            }
            
            // Initialiser les événements
            initializeEventListeners();
            
            // Initialiser les événements du modal de gestion
            initTrackerModalEvents();
            
            // Initialiser les contrôles d'historique
            initHistoryControls();
        }
    });
}

// ==================== CHARGEMENT DES DONNÉES ====================

// Charger des données de démonstration
function loadMockData() {
    console.log('Chargement des données de démonstration...');
    
    trackersData = [
        {
            imei: '2015070203001',
            name: 'Véhicule 1',
            lat: -25.7479,
            lng: 28.2293,
            speed: 45,
            battery: 85,
            status: 'moving',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7479, 28.2293)
        },
        {
            imei: '2015070203002',
            name: 'Véhicule 2',
            lat: -25.7679,
            lng: 28.2493,
            speed: 0,
            battery: 72,
            status: 'stopped',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7679, 28.2493)
        },
        {
            imei: '2015070203003',
            name: 'Véhicule 3',
            lat: -25.7279,
            lng: 28.2093,
            speed: 60,
            battery: 95,
            status: 'moving',
            lastUpdate: new Date().toISOString(),
            history: generateMockHistory(-25.7279, 28.2093)
        },
        {
            imei: '2015070203004',
            name: 'Véhicule 4',
            lat: -25.7579,
            lng: 28.2693,
            speed: 0,
            battery: 45,
            status: 'offline',
            lastUpdate: new Date(Date.now() - 3600000).toISOString(),
            history: generateMockHistory(-25.7579, 28.2693)
        }
    ];
    
    // Afficher les données
    displayTrackers();
    updateFilterCounts();
    
    // Simuler les mises à jour en temps réel
    startMockUpdates();
}

// Générer un historique de démonstration
function generateMockHistory(baseLat, baseLng) {
    const history = [];
    const now = Date.now();
    
    for (let i = 0; i < 20; i++) {
        history.push({
            lat: baseLat + (Math.random() - 0.5) * 0.02,
            lng: baseLng + (Math.random() - 0.5) * 0.02,
            speed: Math.floor(Math.random() * 80),
            timestamp: new Date(now - (20 - i) * 300000).toISOString()
        });
    }
    
    return history;
}

// Simuler les mises à jour en temps réel (données de démo)
function startMockUpdates() {
    // Initialiser les données d'animation pour chaque tracker
    trackersData.forEach(tracker => {
        if (tracker.status === 'moving') {
            tracker.animationData = {
                startLat: tracker.lat,
                startLng: tracker.lng,
                targetLat: tracker.lat + (Math.random() - 0.5) * 0.005,
                targetLng: tracker.lng + (Math.random() - 0.5) * 0.005,
                progress: 0,
                lastUpdateTime: Date.now()
            };
        }
    });
    
    // Animation fluide à 60 FPS
    function animateVehicles() {
        const now = Date.now();
        let needsUpdate = false;
        
        trackersData.forEach(tracker => {
            if (tracker.status === 'moving' && tracker.animationData) {
                const elapsed = now - tracker.animationData.lastUpdateTime;
                
                // Calculer la vitesse de progression basée sur la vitesse réelle
                // Plus le véhicule va vite, plus il se déplace rapidement
                // 1 km/h = 0.000278 km/s = 0.278 m/s
                // Conversion: speed (km/h) -> distance par frame
                const speedFactor = tracker.speed / 100; // Normaliser la vitesse
                const progressIncrement = speedFactor * 0.02; // Ajuster selon les besoins
                
                tracker.animationData.progress += progressIncrement;
                
                if (tracker.animationData.progress >= 1) {
                    // Arrivé à destination, définir une nouvelle cible
                    tracker.animationData.startLat = tracker.animationData.targetLat;
                    tracker.animationData.startLng = tracker.animationData.targetLng;
                    tracker.animationData.targetLat = tracker.lat + (Math.random() - 0.5) * 0.005;
                    tracker.animationData.targetLng = tracker.lng + (Math.random() - 0.5) * 0.005;
                    tracker.animationData.progress = 0;
                    
                    // Varier légèrement la vitesse
                    tracker.speed = Math.max(20, Math.min(120, tracker.speed + (Math.random() - 0.5) * 10));
                }
                
                // Interpolation smooth (easing)
                const easedProgress = easeInOutQuad(tracker.animationData.progress);
                
                // Calculer la nouvelle position
                tracker.lat = lerp(
                    tracker.animationData.startLat,
                    tracker.animationData.targetLat,
                    easedProgress
                );
                tracker.lng = lerp(
                    tracker.animationData.startLng,
                    tracker.animationData.targetLng,
                    easedProgress
                );
                
                tracker.lastUpdate = new Date().toISOString();
                tracker.animationData.lastUpdateTime = now;
                
                // Mettre à jour le marqueur sur la carte
                addOrUpdateMarker(tracker);
                
                // Si ce tracker est sélectionné, mettre à jour le panneau d'infos
                if (selectedTracker && selectedTracker.imei === tracker.imei) {
                    updateInfoPanel(tracker);
                }
                
                needsUpdate = true;
            }
        });
        
        // Demander la prochaine frame
        requestAnimationFrame(animateVehicles);
    }
    
    // Démarrer l'animation
    animateVehicles();
    
    // Mettre à jour l'affichage de la liste périodiquement
    setInterval(() => {
        displayTrackers();
    }, 2000);
}

// Fonction d'interpolation linéaire
function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

// Fonction d'easing pour un mouvement plus naturel
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Charger les vraies données depuis Firebase
function loadRealData() {
    console.log('Chargement des données depuis Firebase...');
    
    const userId = currentUser.uid;
    const trackersRef = database.ref('trackers/' + userId);
    
    // Écouter les changements
    trackersRef.on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            trackersData = [];
            
            Object.keys(data).forEach(imei => {
                const tracker = data[imei];
                
                // Récupérer la position actuelle
                database.ref('positions/' + imei + '/current').once('value', (posSnapshot) => {
                    const position = posSnapshot.val();
                    
                    if (position) {
                        trackersData.push({
                            imei: imei,
                            name: tracker.name,
                            lat: position.lat,
                            lng: position.lng,
                            speed: position.speed || 0,
                            battery: position.battery || 0,
                            status: tracker.status || 'offline',
                            lastUpdate: tracker.lastUpdate
                        });
                        
                        // Afficher les données
                        displayTrackers();
                        updateFilterCounts();
                    }
                });
            });
        } else {
            console.log('Aucun tracker trouvé pour cet utilisateur');
            trackersData = [];
            displayTrackers();
        }
    });
}

// ==================== AFFICHAGE ====================

// Afficher la liste des trackers
function displayTrackers() {
    const container = document.getElementById('trackerListContainer');
    
    // Filtrer les trackers
    let filtered = trackersData;
    if (currentFilter !== 'all') {
        filtered = trackersData.filter(t => t.status === currentFilter);
    }
    
    // Mettre à jour le compteur
    document.getElementById('trackerCount').textContent = `${filtered.length} véhicule(s)`;
    
    // Vider le conteneur
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="loading">Aucun tracker trouvé</div>';
        return;
    }
    
    // Créer les éléments de la liste
    filtered.forEach(tracker => {
        const item = createTrackerListItem(tracker);
        container.appendChild(item);
        
        // Ajouter ou mettre à jour le marqueur sur la carte
        if (currentView === 'live') {
            const isSelected = selectedTracker && selectedTracker.imei === tracker.imei;
            addOrUpdateMarker(tracker, isSelected);
        }
    });
}

// Créer un élément de la liste de trackers
function createTrackerListItem(tracker) {
    const div = document.createElement('div');
    div.className = 'tracker-item';
    if (selectedTracker && selectedTracker.imei === tracker.imei) {
        div.classList.add('selected');
    }
    
    const statusText = {
        moving: 'En marche',
        stopped: 'En arrêt',
        offline: 'Hors ligne'
    };
    
    const statusClass = `status-${tracker.status}`;
    
    const updateTime = new Date(tracker.lastUpdate).toLocaleTimeString('fr-FR');
    
    // Informations du véhicule
    const brand = tracker.brand || '';
    const model = tracker.model || '';
    const vehicleInfo = brand || model ? `${brand} ${model}`.trim() : '';
    const driverName = tracker.driverName || '';
    
    div.innerHTML = `
        <div class="tracker-header">
            <h3 class="tracker-name">${tracker.vehicleName || tracker.name}</h3>
            <div class="status-dot ${statusClass}"></div>
        </div>
        <div class="tracker-info">
            ${vehicleInfo ? `<p style="color: #3b82f6; font-weight: 500;">${vehicleInfo}</p>` : ''}
            ${driverName ? `<p><strong>Chauffeur:</strong> ${driverName}</p>` : ''}
            <p>IMEI: ${tracker.imei}</p>
            <p>Statut: <span class="tracker-status">${statusText[tracker.status] || 'Inconnu'}</span></p>
            <p>Vitesse: ${tracker.speed} km/h</p>
            <p>Batterie: ${tracker.battery}%</p>
            <p class="tracker-update">MAJ: ${updateTime}</p>
        </div>
    `;
    
    // Événement de clic
    div.addEventListener('click', () => {
        selectTracker(tracker);
    });
    
    return div;
}

// Sélectionner un tracker
function selectTracker(tracker) {
    selectedTracker = tracker;
    
    // Mettre à jour l'affichage de la liste
    displayTrackers();
    
    // Voler vers le tracker
    flyToTracker(tracker.lat, tracker.lng);
    
    // Afficher le panneau d'infos
    showInfoPanel(tracker);
    
    // Si on est en mode historique, afficher l'historique
    if (currentView === 'history') {
        showTrackerHistory(tracker);
    }
}

// Afficher le panneau d'informations
function showInfoPanel(tracker) {
    const panel = document.getElementById('infoPanel');
    const viewText = currentView === 'live' ? 'Position actuelle' : 'Historique du trajet';
    
    document.getElementById('infoPanelName').textContent = tracker.name;
    document.getElementById('infoPanelView').textContent = viewText;
    document.getElementById('infoPanelSpeed').textContent = `${tracker.speed} km/h`;
    document.getElementById('infoPanelBattery').textContent = `Batterie: ${tracker.battery}%`;
    
    panel.style.display = 'block';
}

// Mettre à jour le panneau d'informations
function updateInfoPanel(tracker) {
    if (document.getElementById('infoPanel').style.display === 'block') {
        document.getElementById('infoPanelSpeed').textContent = `${tracker.speed} km/h`;
        document.getElementById('infoPanelBattery').textContent = `Batterie: ${tracker.battery}%`;
    }
}

// Mettre à jour les compteurs de filtres
function updateFilterCounts() {
    document.getElementById('countAll').textContent = `(${trackersData.length})`;
    document.getElementById('countMoving').textContent = `(${trackersData.filter(t => t.status === 'moving').length})`;
    document.getElementById('countStopped').textContent = `(${trackersData.filter(t => t.status === 'stopped').length})`;
    document.getElementById('countOffline').textContent = `(${trackersData.filter(t => t.status === 'offline').length})`;
}

// ==================== ÉVÉNEMENTS ====================

// Initialiser les événements
function initializeEventListeners() {
    // Toggle sidebar
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('sidebar-expanded');
        
        // Re-initialiser les icônes Lucide
        setTimeout(() => lucide.createIcons(), 100);
    });
    
    // Filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            // Mettre à jour le filtre
            currentFilter = btn.dataset.filter;
            
            // Réafficher les trackers
            displayTrackers();
        });
    });
    
    // Navigation (Live / History)
    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons de navigation
            document.querySelectorAll('.nav-item[data-view]').forEach(b => b.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            btn.classList.add('active');
            
            // Mettre à jour la vue
            currentView = btn.dataset.view;
            
            // Afficher/masquer les panneaux selon la vue
            if (currentView === 'history') {
                // Afficher le panneau de contrôle d'historique
                toggleHistoryControls(true);
                document.getElementById('infoPanel').style.display = 'none';
                
                // Charger l'historique si un tracker est sélectionné
                if (selectedTracker) {
                    loadHistoryForDateRange();
                } else {
                    alert('Veuillez sélectionner un tracker pour voir l\'historique');
                }
            } else {
                // Vue live - masquer le panneau d'historique
                toggleHistoryControls(false);
                clearHistory();
                displayTrackers();
                
                if (selectedTracker) {
                    showInfoPanel(selectedTracker);
                }
            }
        });
    });
}

// Afficher l'historique d'un tracker
function showTrackerHistory(tracker) {
    // En mode démo, utiliser l'historique généré
    if (useMockData) {
        currentHistoryData = tracker.history;
        showHistory(tracker.history);
        updateHistoryStats(tracker.history);
        showInfoPanel(tracker);
        return;
    }
    
    // En mode réel, charger l'historique depuis Firebase
    const historyRef = database.ref('positions/' + tracker.imei + '/history');
    
    historyRef.once('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            const historyArray = Object.keys(data).map(key => ({
                ...data[key],
                timestamp: key
            }));
            
            // Trier par timestamp
            historyArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            currentHistoryData = historyArray;
            
            // Afficher sur la carte
            showHistory(historyArray);
            updateHistoryStats(historyArray);
        } else {
            alert('Aucun historique disponible pour ce tracker');
        }
    });
}

// La fonction exportHistoryToPDF est maintenant dans history-manager.js
// Plus besoin de la dupliquer ici

// ==================== FONCTIONS UTILITAIRES ====================

// Formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
}

// Obtenir la couleur selon le statut
function getStatusColor(status) {
    const colors = {
        moving: '#10b981',
        stopped: '#f59e0b',
        offline: '#ef4444',
        selected: '#3b82f6'
    };
    return colors[status] || '#6b7280';
}

console.log('Application chargée et prête');