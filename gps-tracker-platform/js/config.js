// ==================== FIREBASE CONFIGURATION ====================
// IMPORTANT: Remplacez ces valeurs par votre configuration Firebase
// Vous pouvez obtenir ces informations depuis la console Firebase:
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet ou sélectionnez un projet existant
// 3. Allez dans Paramètres du projet > Général
// 4. Faites défiler jusqu'à "Vos applications" et cliquez sur l'icône Web (</>)
// 5. Copiez la configuration firebaseConfig

const firebaseConfig = {
  apiKey: "AIzaSyAQAiMzu1YW-gD8p_oMEVxULQ8ujAc_XCs",
  authDomain: "fleet-tracker-73838.firebaseapp.com",
  databaseURL: "https://fleet-tracker-73838-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fleet-tracker-73838",
  storageBucket: "fleet-tracker-73838.firebasestorage.app",
  messagingSenderId: "568681005979",
  appId: "1:568681005979:web:1198dfb1bb6ae5ddfc573e"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Références aux services Firebase
const auth = firebase.auth();
const database = firebase.database();

// ==================== STRUCTURE DE LA BASE DE DONNÉES ====================
/*
Structure recommandée pour Firebase Realtime Database:

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
        "timestamp1": {
          "lat": -25.7479,
          "lng": 28.2293,
          "speed": 45,
          "battery": 85
        }
      }
    }
  }
}
*/

// ==================== RÈGLES DE SÉCURITÉ FIREBASE ====================
/*
Copiez ces règles dans Firebase Console > Realtime Database > Rules:

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
*/

console.log('Firebase initialisé avec succès');