// ==================== HISTORY MANAGEMENT ====================

let currentHistoryData = [];

// Initialiser les contrôles d'historique
function initHistoryControls() {
    // Définir les dates par défaut (aujourd'hui et hier)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    document.getElementById('historyEndDate').valueAsDate = today;
    document.getElementById('historyStartDate').valueAsDate = yesterday;
    
    // Événements
    document.getElementById('loadHistoryBtn').addEventListener('click', loadHistoryForDateRange);
    document.getElementById('exportHistoryPDF').addEventListener('click', exportHistoryToPDF);
    document.getElementById('deleteHistoryBtn').addEventListener('click', deleteHistory);
}

// Charger l'historique pour une plage de dates
function loadHistoryForDateRange() {
    if (!selectedTracker) {
        alert('Veuillez sélectionner un tracker');
        return;
    }
    
    const startDate = document.getElementById('historyStartDate').value;
    const endDate = document.getElementById('historyEndDate').value;
    
    if (!startDate || !endDate) {
        alert('Veuillez sélectionner une date de début et de fin');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Fin de la journée
    
    if (start > end) {
        alert('La date de début doit être antérieure à la date de fin');
        return;
    }
    
    // Mode démo - filtrer l'historique existant
    if (useMockData) {
        if (selectedTracker.history) {
            currentHistoryData = selectedTracker.history.filter(point => {
                const pointDate = new Date(point.timestamp);
                return pointDate >= start && pointDate <= end;
            });
            
            if (currentHistoryData.length === 0) {
                alert('Aucune donnée pour cette période');
                return;
            }
            
            showHistory(currentHistoryData);
            updateHistoryStats(currentHistoryData);
        }
        return;
    }
    
    // Mode réel - charger depuis Firebase
    const historyRef = database.ref('positions/' + selectedTracker.imei + '/history');
    
    historyRef.orderByKey()
        .startAt(start.toISOString())
        .endAt(end.toISOString())
        .once('value', (snapshot) => {
            const data = snapshot.val();
            
            if (!data) {
                alert('Aucune donnée pour cette période');
                return;
            }
            
            currentHistoryData = Object.keys(data).map(key => ({
                ...data[key],
                timestamp: key
            }));
            
            currentHistoryData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            showHistory(currentHistoryData);
            updateHistoryStats(currentHistoryData);
        })
        .catch((error) => {
            console.error('Erreur lors du chargement de l\'historique:', error);
            alert('Erreur lors du chargement de l\'historique');
        });
}

// Mettre à jour les statistiques de l'historique
function updateHistoryStats(historyData) {
    if (!historyData || historyData.length === 0) {
        document.getElementById('historyPoints').textContent = '0';
        document.getElementById('historyDistance').textContent = '0 km';
        document.getElementById('historyDuration').textContent = '0h';
        return;
    }
    
    // Nombre de points
    document.getElementById('historyPoints').textContent = historyData.length;
    
    // Calculer la distance totale
    let totalDistance = 0;
    for (let i = 1; i < historyData.length; i++) {
        const prev = historyData[i - 1];
        const curr = historyData[i];
        
        // Distance en km (formule de Haversine simplifiée)
        const distance = calculateDistance(
            prev.lat, prev.lng,
            curr.lat, curr.lng
        );
        totalDistance += distance;
    }
    
    document.getElementById('historyDistance').textContent = totalDistance.toFixed(2) + ' km';
    
    // Calculer la durée
    const startTime = new Date(historyData[0].timestamp);
    const endTime = new Date(historyData[historyData.length - 1].timestamp);
    const durationMs = endTime - startTime;
    const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(1);
    
    document.getElementById('historyDuration').textContent = durationHours + 'h';
}

// Calculer la distance entre deux points (Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// Exporter l'historique en PDF
function exportHistoryToPDF() {
    if (!selectedTracker || !currentHistoryData || currentHistoryData.length === 0) {
        alert('Aucune donnée à exporter. Veuillez charger l\'historique d\'abord.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Rapport d\'historique GPS', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    // Informations du véhicule
    let yPos = 30;
    doc.text('Véhicule: ' + (selectedTracker.vehicleName || selectedTracker.name), 20, yPos);
    yPos += 7;
    
    if (selectedTracker.brand || selectedTracker.model) {
        doc.text('Marque/Modèle: ' + (selectedTracker.brand || '') + ' ' + (selectedTracker.model || ''), 20, yPos);
        yPos += 7;
    }
    
    if (selectedTracker.plate) {
        doc.text('Plaque: ' + selectedTracker.plate, 20, yPos);
        yPos += 7;
    }
    
    if (selectedTracker.driverName) {
        doc.text('Chauffeur: ' + selectedTracker.driverName, 20, yPos);
        yPos += 7;
    }
    
    doc.text('IMEI: ' + selectedTracker.imei, 20, yPos);
    yPos += 7;
    
    // Période
    const startDate = document.getElementById('historyStartDate').value;
    const endDate = document.getElementById('historyEndDate').value;
    doc.text('Période: du ' + formatDateFR(startDate) + ' au ' + formatDateFR(endDate), 20, yPos);
    yPos += 10;
    
    // Ligne de séparation
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Statistiques
    doc.setFont(undefined, 'bold');
    doc.text('Statistiques', 20, yPos);
    yPos += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text('Nombre de points: ' + currentHistoryData.length, 20, yPos);
    yPos += 7;
    
    const distance = document.getElementById('historyDistance').textContent;
    doc.text('Distance totale: ' + distance, 20, yPos);
    yPos += 7;
    
    const duration = document.getElementById('historyDuration').textContent;
    doc.text('Durée totale: ' + duration, 20, yPos);
    yPos += 10;
    
    // Ligne de séparation
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Détails de l'historique
    doc.setFont(undefined, 'bold');
    doc.text('Détails du trajet', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // En-têtes du tableau
    doc.text('Date/Heure', 20, yPos);
    doc.text('Position', 70, yPos);
    doc.text('Vitesse', 150, yPos);
    yPos += 5;
    
    // Ligne sous les en-têtes
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Données (maximum 30 points pour ne pas surcharger)
    const maxPoints = Math.min(30, currentHistoryData.length);
    const step = Math.ceil(currentHistoryData.length / maxPoints);
    
    for (let i = 0; i < currentHistoryData.length; i += step) {
        const point = currentHistoryData[i];
        
        // Vérifier si on doit créer une nouvelle page
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        
        const dateTime = new Date(point.timestamp).toLocaleString('fr-FR');
        const position = point.lat.toFixed(5) + ', ' + point.lng.toFixed(5);
        const speed = (point.speed || 0) + ' km/h';
        
        doc.text(dateTime, 20, yPos);
        doc.text(position, 70, yPos);
        doc.text(speed, 150, yPos);
        yPos += 6;
    }
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            'Page ' + i + ' sur ' + pageCount + ' - Généré le ' + new Date().toLocaleString('fr-FR'),
            105,
            290,
            { align: 'center' }
        );
        doc.text('TechnoWeb GPS Tracker Platform', 105, 295, { align: 'center' });
    }
    
    // Sauvegarder le PDF
    const filename = 'historique_' + selectedTracker.imei + '_' + Date.now() + '.pdf';
    doc.save(filename);
    
    alert('PDF exporté avec succès !');
}

// Formater une date en français
function formatDateFR(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Supprimer l'historique
function deleteHistory() {
    if (!selectedTracker) {
        alert('Veuillez sélectionner un tracker');
        return;
    }
    
    const confirmed = confirm(
        'Êtes-vous sûr de vouloir supprimer TOUT l\'historique de ce tracker ?\n\n' +
        'Cette action est IRRÉVERSIBLE et supprimera toutes les données de position historiques.\n\n' +
        'Véhicule: ' + (selectedTracker.vehicleName || selectedTracker.name)
    );
    
    if (!confirmed) return;
    
    // Double confirmation
    const doubleConfirm = confirm(
        'DERNIÈRE CONFIRMATION\n\n' +
        'Vous allez supprimer définitivement l\'historique.\n' +
        'Tapez OK pour confirmer.'
    );
    
    if (!doubleConfirm) return;
    
    // Mode démo
    if (useMockData) {
        selectedTracker.history = [];
        currentHistoryData = [];
        clearHistory();
        updateHistoryStats([]);
        alert('Historique supprimé (mode démo)');
        return;
    }
    
    // Mode réel - supprimer de Firebase
    const historyRef = database.ref('positions/' + selectedTracker.imei + '/history');
    
    historyRef.remove()
        .then(() => {
            currentHistoryData = [];
            clearHistory();
            updateHistoryStats([]);
            alert('Historique supprimé avec succès');
        })
        .catch((error) => {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'historique');
        });
}

// Afficher/masquer le panneau de contrôle d'historique
function toggleHistoryControls(show) {
    const panel = document.getElementById('historyControls');
    if (show) {
        panel.style.display = 'block';
        // Re-initialiser les icônes
        setTimeout(() => lucide.createIcons(), 100);
    } else {
        panel.style.display = 'none';
    }
}

console.log('History manager chargé');