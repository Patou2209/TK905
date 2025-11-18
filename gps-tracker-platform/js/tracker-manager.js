// ==================== TRACKER MANAGEMENT ====================

let editingTrackerId = null;

// Ouvrir le modal de gestion des trackers
function openTrackerModal() {
    const modal = document.getElementById('trackerModal');
    modal.classList.add('show');
    
    // Charger la liste des trackers
    loadTrackersInModal();
    
    // Afficher la liste, cacher le formulaire
    showTrackersList();
    
    // Re-initialiser les icônes
    setTimeout(() => lucide.createIcons(), 100);
}

// Fermer le modal
function closeTrackerModal() {
    const modal = document.getElementById('trackerModal');
    modal.classList.remove('show');
    editingTrackerId = null;
}

// Afficher la liste des trackers
function showTrackersList() {
    document.getElementById('trackersList').style.display = 'block';
    document.getElementById('trackerForm').style.display = 'none';
}

// Afficher le formulaire d'ajout/modification
function showTrackerForm(isEdit = false) {
    document.getElementById('trackersList').style.display = 'none';
    document.getElementById('trackerForm').style.display = 'block';
    
    const formTitle = document.getElementById('formTitle');
    formTitle.textContent = isEdit ? 'Modifier le tracker' : 'Ajouter un tracker';
    
    // Re-initialiser les icônes
    setTimeout(() => lucide.createIcons(), 100);
}

// Charger la liste des trackers dans le modal
function loadTrackersInModal() {
    const container = document.getElementById('trackersListContainer');
    const userId = getCurrentUserId();
    
    if (!userId) {
        container.innerHTML = '<div class="loading">Erreur: Utilisateur non connecté</div>';
        return;
    }
    
    // En mode démo
    if (useMockData) {
        container.innerHTML = '';
        
        if (trackersData.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Aucun tracker enregistré. Cliquez sur "Ajouter un tracker" pour commencer.</p>';
            return;
        }
        
        trackersData.forEach(tracker => {
            const card = createTrackerCard(tracker);
            container.appendChild(card);
        });
        
        return;
    }
    
    // Charger depuis Firebase
    const trackersRef = database.ref('trackers/' + userId);
    
    trackersRef.once('value', (snapshot) => {
        container.innerHTML = '';
        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Aucun tracker enregistré. Cliquez sur "Ajouter un tracker" pour commencer.</p>';
            return;
        }
        
        Object.keys(data).forEach(imei => {
            const tracker = data[imei];
            const card = createTrackerCard(tracker);
            container.appendChild(card);
        });
    }).catch((error) => {
        console.error('Erreur lors du chargement des trackers:', error);
        container.innerHTML = '<div class="error-message">Erreur lors du chargement</div>';
    });
}

// Créer une carte de tracker pour le modal
function createTrackerCard(tracker) {
    const div = document.createElement('div');
    div.className = 'tracker-card';
    
    const brand = tracker.brand || 'N/A';
    const model = tracker.model || '';
    const plate = tracker.plate || 'N/A';
    const driver = tracker.driverName || 'Non assigné';
    const phone = tracker.driverPhone || '';
    
    div.innerHTML = `
        <div class="tracker-card-header">
            <h4 class="tracker-card-title">${tracker.vehicleName || tracker.name}</h4>
            <div class="tracker-card-actions">
                <button class="icon-btn-small edit" data-imei="${tracker.imei}">
                    <i data-lucide="edit-2"></i>
                </button>
                <button class="icon-btn-small delete" data-imei="${tracker.imei}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
        <div class="tracker-card-info">
            <div class="info-item">
                <i data-lucide="hash"></i>
                <span><span class="info-label">IMEI:</span> ${tracker.imei}</span>
            </div>
            <div class="info-item">
                <i data-lucide="car"></i>
                <span><span class="info-label">Véhicule:</span> ${brand} ${model}</span>
            </div>
            <div class="info-item">
                <i data-lucide="credit-card"></i>
                <span><span class="info-label">Plaque:</span> ${plate}</span>
            </div>
            <div class="info-item">
                <i data-lucide="user"></i>
                <span><span class="info-label">Chauffeur:</span> ${driver}</span>
            </div>
            ${phone ? `
            <div class="info-item">
                <i data-lucide="phone"></i>
                <span>${phone}</span>
            </div>
            ` : ''}
        </div>
    `;
    
    // Événements
    div.querySelector('.edit').addEventListener('click', () => editTracker(tracker.imei));
    div.querySelector('.delete').addEventListener('click', () => deleteTracker(tracker.imei));
    
    return div;
}

// Modifier un tracker
function editTracker(imei) {
    editingTrackerId = imei;
    
    // Trouver le tracker
    let tracker = null;
    
    if (useMockData) {
        tracker = trackersData.find(t => t.imei === imei);
    } else {
        const userId = getCurrentUserId();
        const trackerRef = database.ref('trackers/' + userId + '/' + imei);
        
        trackerRef.once('value', (snapshot) => {
            tracker = snapshot.val();
            if (tracker) {
                fillFormWithTracker(tracker);
            }
        });
        return;
    }
    
    if (tracker) {
        fillFormWithTracker(tracker);
    }
}

// Remplir le formulaire avec les données du tracker
function fillFormWithTracker(tracker) {
    document.getElementById('trackerIMEI').value = tracker.imei || '';
    document.getElementById('trackerIMEI').disabled = true; // Ne pas permettre de modifier l'IMEI
    document.getElementById('vehicleName').value = tracker.vehicleName || tracker.name || '';
    document.getElementById('vehicleBrand').value = tracker.brand || '';
    document.getElementById('vehicleModel').value = tracker.model || '';
    document.getElementById('vehiclePlate').value = tracker.plate || '';
    document.getElementById('vehicleColor').value = tracker.color || '';
    document.getElementById('driverName').value = tracker.driverName || '';
    document.getElementById('driverPhone').value = tracker.driverPhone || '';
    document.getElementById('vehicleNotes').value = tracker.notes || '';
    
    showTrackerForm(true);
}

// Supprimer un tracker
function deleteTracker(imei) {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer ce tracker ?\n\nCette action est irréversible.');
    
    if (!confirmed) return;
    
    if (useMockData) {
        // Supprimer des données de démo
        const index = trackersData.findIndex(t => t.imei === imei);
        if (index > -1) {
            trackersData.splice(index, 1);
            loadTrackersInModal();
            displayTrackers();
            updateFilterCounts();
            
            // Supprimer le marqueur
            removeMarker(imei);
        }
        return;
    }
    
    // Supprimer de Firebase
    const userId = getCurrentUserId();
    
    // Supprimer le tracker
    database.ref('trackers/' + userId + '/' + imei).remove()
        .then(() => {
            // Supprimer les positions
            return database.ref('positions/' + imei).remove();
        })
        .then(() => {
            alert('Tracker supprimé avec succès');
            loadTrackersInModal();
            loadRealData(); // Recharger les données
        })
        .catch((error) => {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression du tracker');
        });
}

// Soumettre le formulaire
function submitTrackerForm(event) {
    event.preventDefault();
    
    const imei = document.getElementById('trackerIMEI').value.trim();
    const vehicleName = document.getElementById('vehicleName').value.trim();
    const brand = document.getElementById('vehicleBrand').value.trim();
    const model = document.getElementById('vehicleModel').value.trim();
    const plate = document.getElementById('vehiclePlate').value.trim();
    const color = document.getElementById('vehicleColor').value.trim();
    const driverName = document.getElementById('driverName').value.trim();
    const driverPhone = document.getElementById('driverPhone').value.trim();
    const notes = document.getElementById('vehicleNotes').value.trim();
    
    // Validation
    if (!imei || imei.length < 10) {
        showFormError('IMEI invalide. Il doit contenir au moins 10 caractères.');
        return;
    }
    
    if (!vehicleName) {
        showFormError('Veuillez entrer un nom pour le véhicule.');
        return;
    }
    
    // Créer l'objet tracker
    const trackerData = {
        imei: imei,
        vehicleName: vehicleName,
        brand: brand,
        model: model,
        plate: plate,
        color: color,
        driverName: driverName,
        driverPhone: driverPhone,
        notes: notes,
        status: 'offline',
        lastUpdate: new Date().toISOString()
    };
    
    // Si modification, ajouter l'IMEI original
    if (editingTrackerId) {
        trackerData.createdAt = new Date().toISOString();
    } else {
        trackerData.createdAt = new Date().toISOString();
    }
    
    // Afficher le loader
    showFormLoader(true);
    
    if (useMockData) {
        // Mode démo
        if (editingTrackerId) {
            // Modifier
            const index = trackersData.findIndex(t => t.imei === editingTrackerId);
            if (index > -1) {
                trackersData[index] = {
                    ...trackersData[index],
                    ...trackerData,
                    name: vehicleName // Garder la compatibilité
                };
            }
        } else {
            // Ajouter
            trackersData.push({
                ...trackerData,
                name: vehicleName,
                lat: -25.7479 + (Math.random() - 0.5) * 0.1,
                lng: 28.2293 + (Math.random() - 0.5) * 0.1,
                speed: 0,
                battery: 100,
                history: generateMockHistory(-25.7479, 28.2293)
            });
        }
        
        showFormLoader(false);
        alert(editingTrackerId ? 'Tracker modifié avec succès' : 'Tracker ajouté avec succès');
        resetForm();
        loadTrackersInModal();
        displayTrackers();
        updateFilterCounts();
        showTrackersList();
        
        return;
    }
    
    // Sauvegarder dans Firebase
    const userId = getCurrentUserId();
    const trackerRef = database.ref('trackers/' + userId + '/' + imei);
    
    trackerRef.set(trackerData)
        .then(() => {
            showFormLoader(false);
            alert(editingTrackerId ? 'Tracker modifié avec succès' : 'Tracker ajouté avec succès');
            resetForm();
            loadTrackersInModal();
            loadRealData(); // Recharger les données
            showTrackersList();
        })
        .catch((error) => {
            showFormLoader(false);
            console.error('Erreur lors de l\'enregistrement:', error);
            showFormError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        });
}

// Afficher une erreur dans le formulaire
function showFormError(message) {
    const errorDiv = document.getElementById('formError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Afficher/masquer le loader du formulaire
function showFormLoader(show) {
    const btnText = document.getElementById('submitBtnText');
    const loader = document.getElementById('submitLoader');
    
    if (show) {
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
    } else {
        btnText.style.display = 'inline';
        loader.style.display = 'none';
    }
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('vehicleForm').reset();
    document.getElementById('trackerIMEI').disabled = false;
    editingTrackerId = null;
    document.getElementById('formError').style.display = 'none';
}

// Initialiser les événements du modal
function initTrackerModalEvents() {
    // Ouvrir le modal
    document.getElementById('manageTrackers').addEventListener('click', openTrackerModal);
    
    // Fermer le modal
    document.getElementById('closeModal').addEventListener('click', closeTrackerModal);
    
    // Fermer en cliquant en dehors
    document.getElementById('trackerModal').addEventListener('click', (e) => {
        if (e.target.id === 'trackerModal') {
            closeTrackerModal();
        }
    });
    
    // Ajouter un nouveau tracker
    document.getElementById('addNewTracker').addEventListener('click', () => {
        resetForm();
        showTrackerForm(false);
    });
    
    // Annuler le formulaire
    document.getElementById('cancelForm').addEventListener('click', () => {
        resetForm();
        showTrackersList();
    });
    
    // Soumettre le formulaire
    document.getElementById('vehicleForm').addEventListener('submit', submitTrackerForm);
}

// Appeler cette fonction dans main.js après initializeEventListeners()
console.log('Tracker manager chargé');