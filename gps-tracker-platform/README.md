# 🚗 Plateforme GPS Tracker TK905 - TechnoWeb

Plateforme de suivi GPS en temps réel pour les trackers TK905.

## 📁 Structure des fichiers

```
gps-tracker-platform/
│
├── index.html              # Page principale de l'application
├── login.html              # Page de connexion/inscription
├── README.md               # Ce fichier
│
├── css/
│   └── style.css          # Tous les styles CSS
│
├── js/
│   ├── config.js          # Configuration Firebase
│   ├── auth.js            # Gestion de l'authentification
│   ├── map.js             # Gestion de la carte Leaflet
│   └── main.js            # Logique principale de l'application
│
└── assets/                 # (Optionnel) Images et ressources
```

## 🚀 Installation

### Étape 1 : Créer la structure des dossiers

1. Créez un dossier principal `gps-tracker-platform`
2. À l'intérieur, créez les sous-dossiers :
   - `css/`
   - `js/`
   - `assets/` (optionnel)

### Étape 2 : Copier les fichiers

Copiez chaque fichier que je vous ai fourni dans son emplacement respectif :

- `index.html` → à la racine
- `login.html` → à la racine
- `style.css` → dans le dossier `css/`
- `config.js` → dans le dossier `js/`
- `auth.js` → dans le dossier `js/`
- `map.js` → dans le dossier `js/`
- `main.js` → dans le dossier `js/`

### Étape 3 : Configuration Firebase

1. **Créer un projet Firebase :**
   - Allez sur https://console.firebase.google.com/
   - Cliquez sur "Ajouter un projet"
   - Suivez les étapes de création

2. **Activer l'authentification :**
   - Dans votre projet, allez dans "Authentication"
   - Cliquez sur "Commencer"
   - Activez "Email/Password" dans l'onglet "Sign-in method"

3. **Créer une Realtime Database :**
   - Allez dans "Realtime Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez un emplacement (par exemple : europe-west1)
   - Commencez en "mode test" (vous modifierez les règles plus tard)

4. **Obtenir votre configuration :**
   - Allez dans Paramètres du projet (icône engrenage) > Général
   - Faites défiler jusqu'à "Vos applications"
   - Cliquez sur l'icône Web `</>`
   - Donnez un nom à votre app et cliquez sur "Enregistrer l'application"
   - Copiez la configuration `firebaseConfig`

5. **Mettre à jour config.js :**
   - Ouvrez le fichier `js/config.js`
   - Remplacez les valeurs dans `firebaseConfig` par les vôtres

```javascript
const firebaseConfig = {
    apiKey: "VOTRE_VRAIE_API_KEY",
    authDomain: "votre-projet.firebaseapp.com",
    databaseURL: "https://votre-projet-default-rtdb.firebaseio.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

6. **Configurer les règles de sécurité Firebase :**
   - Dans Firebase Console, allez dans Realtime Database > Règles
   - Remplacez les règles par celles-ci :

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "trackers": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "positions": {
      "$trackerId": {
        ".read": "root.child('trackers').child(auth.uid).child($trackerId).exists()",
        ".write": "root.child('trackers').child(auth.uid).child($trackerId).exists()"
      }
    }
  }
}
```

### Étape 4 : Tester l'application

1. **Méthode simple (avec un serveur local) :**
   
   Si vous avez Python installé :
   ```bash
   # Pour Python 3
   python -m http.server 8000
   ```
   
   Puis ouvrez http://localhost:8000 dans votre navigateur.

2. **Méthode avec Visual Studio Code :**
   
   - Installez l'extension "Live Server"
   - Cliquez droit sur `index.html` ou `login.html`
   - Sélectionnez "Open with Live Server"

3. **Méthode avec Node.js :**
   ```bash
   npx http-server
   ```

## 📱 Utilisation

### Première utilisation

1. Ouvrez `login.html` dans votre navigateur
2. Créez un compte avec votre email et mot de passe
3. Vous serez automatiquement redirigé vers l'application principale

### Interface principale

**Sidebar (barre latérale) :**
- Cliquez sur l'icône menu (burger) pour l'ouvrir/fermer
- "Temps réel" : Affiche les positions actuelles
- "Historique" : Affiche le trajet complet
- "Déconnexion" : Se déconnecter

**Filtres (barre du haut) :**
- **Tous** : Affiche tous les trackers
- **En marche** : Véhicules en mouvement (vert)
- **En arrêt** : Véhicules arrêtés (orange)
- **Hors ligne** : Véhicules déconnectés (rouge)

**Liste des trackers (gauche) :**
- Affiche tous vos trackers avec leurs informations
- Cliquez sur un tracker pour le suivre sur la carte

**Carte (centre) :**
- Affiche les positions des trackers
- Animation fluide (flyTo) lors de la sélection
- Cliquez sur les marqueurs pour voir les détails

## 🔧 Configuration avancée

### Mode démo vs mode réel

Par défaut, l'application utilise des **données de démonstration** pour tester l'interface.

Pour passer en mode réel :
1. Ouvrez `js/main.js`
2. Trouvez la ligne : `let useMockData = true;`
3. Changez-la en : `let useMockData = false;`

### Structure de la base de données Firebase

L'application s'attend à cette structure :

```json
{
  "users": {
    "userId1": {
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "trackers": {
    "userId1": {
      "2015070203001": {
        "name": "Véhicule 1",
        "imei": "2015070203001",
        "status": "moving",
        "lastUpdate": "2024-01-01T12:00:00Z"
      }
    }
  },
  "positions": {
    "2015070203001": {
      "current": {
        "lat": -25.7479,
        "lng": 28.2293,
        "speed": 45,
        "battery": 85,
        "timestamp": "2024-01-01T12:00:00Z"
      },
      "history": {
        "2024-01-01T12:00:00Z": {
          "lat": -25.7479,
          "lng": 28.2293,
          "speed": 45,
          "battery": 85
        }
      }
    }
  }
}
```

## 🛠️ Prochaines étapes

### 1. Serveur Node.js pour recevoir les données TK905

Les TK905 envoient leurs données via GPRS (TCP/IP). Vous aurez besoin d'un serveur pour :
- Recevoir les paquets GPRS des trackers
- Parser les données GPS
- Pousser vers Firebase

Je peux vous fournir le code du serveur Node.js séparément.

### 2. Ajouter l'export PDF

Pour activer l'export PDF :
1. Ajoutez jsPDF dans `index.html` :
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

2. Implémentez la fonction `exportHistoryToPDF()` dans `main.js`

### 3. Ajouter des trackers manuellement

Pour tester avec de vrais trackers, ajoutez-les manuellement dans Firebase :

1. Allez dans Firebase Console > Realtime Database
2. Créez les entrées comme dans la structure ci-dessus
3. Remplacez `useMockData = false` dans `main.js`

## ❓ Dépannage

### L'application ne charge pas
- Vérifiez la console du navigateur (F12)
- Assurez-vous que tous les fichiers sont dans les bons dossiers
- Vérifiez que la configuration Firebase est correcte

### Erreur Firebase
- Vérifiez que vous avez bien activé Authentication et Realtime Database
- Vérifiez les règles de sécurité
- Vérifiez votre configuration dans `config.js`

### La carte ne s'affiche pas
- Vérifiez votre connexion Internet
- Ouvrez la console et regardez les erreurs
- Assurez-vous que Leaflet.js est bien chargé

## 📞 Support

Pour toute question ou problème, contactez TechnoWeb.

---

Développé par TechnoWeb 🚀