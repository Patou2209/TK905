// ==================== AUTHENTICATION MANAGEMENT ====================

// Vérifier l'état de l'authentification
firebase.auth().onAuthStateChanged((user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // L'utilisateur est connecté
        console.log('Utilisateur connecté:', user.email);
        
        // Si on est sur la page de login, rediriger vers index.html
        if (currentPage === 'login.html' || currentPage === '') {
            window.location.href = 'index.html';
        }
        
        // Afficher l'email de l'utilisateur dans la sidebar
        const userEmailElement = document.getElementById('userEmail');
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }
        
        // Créer l'utilisateur dans la base de données s'il n'existe pas
        createUserInDatabase(user);
        
    } else {
        // L'utilisateur n'est pas connecté
        console.log('Utilisateur non connecté');
        
        // Si on n'est pas sur la page de login, rediriger
        if (currentPage !== 'login.html' && currentPage !== '') {
            window.location.href = 'login.html';
        }
    }
});

// Créer l'utilisateur dans la base de données
function createUserInDatabase(user) {
    const userRef = database.ref('users/' + user.uid);
    
    // Vérifier si l'utilisateur existe déjà
    userRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            // Créer l'utilisateur
            userRef.set({
                email: user.email,
                createdAt: new Date().toISOString()
            }).then(() => {
                console.log('Utilisateur créé dans la base de données');
            }).catch((error) => {
                console.error('Erreur lors de la création de l\'utilisateur:', error);
            });
        }
    });
}

// Fonction de déconnexion
function logout() {
    firebase.auth().signOut().then(() => {
        console.log('Déconnexion réussie');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    });
}

// Attacher l'événement de déconnexion au bouton
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ==================== HELPER FUNCTIONS ====================

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    return firebase.auth().currentUser;
}

// Obtenir l'UID de l'utilisateur actuel
function getCurrentUserId() {
    const user = getCurrentUser();
    return user ? user.uid : null;
}

// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}