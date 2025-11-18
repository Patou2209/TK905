# 📘 Guide complet - Serveur Node.js pour TK905

## ✅ Checklist avant de démarrer

- [ ] Node.js installé (`node --version`)
- [ ] Dossier `gps-server` créé
- [ ] Fichiers créés :
  - [ ] `server.js`
  - [ ] `protocol/tk905-parser.js`
  - [ ] `firebase/firebase-admin.js`
  - [ ] `firebase/serviceAccountKey.json` (clé Firebase)
  - [ ] `.env`
- [ ] Dépendances installées (`npm install`)

---

## 🚀 Étape 6 : Démarrer le serveur

### **Ouvrez un terminal dans le dossier `gps-server` :**

```bash
cd chemin\vers\gps-server
```

### **Démarrez le serveur :**

```bash
node server.js
```

### **✅ Vous devriez voir :**

```
╔════════════════════════════════════════════╗
║   🚀 SERVEUR GPS TK905 DÉMARRÉ            ║
╠════════════════════════════════════════════╣
║   📡 Port: 5023                            ║
║   🌐 Host: 0.0.0.0                        ║
║   🔥 Firebase: Connecté                    ║
╚════════════════════════════════════════════╝

✅ En attente de connexions des trackers...
```

🎉 **Le serveur fonctionne !**

---

## 📱 Étape 7 : Configurer le tracker TK905

Maintenant que le serveur tourne, il faut dire au TK905 où envoyer les données.

### **A. Trouver votre adresse IP**

**Windows :**
```bash
ipconfig
```
Cherchez `Adresse IPv4` (ex de ce Lenovo Classmate: `10.0.0.5`)

**Si le serveur est sur Internet :**
- Utilisez votre IP publique (cherchez "mon ip" sur Google)
- Ouvrez le port 5023 sur votre routeur (port forwarding)

### **B. Configuration du TK905 par SMS**

Envoyez ces SMS au numéro SIM du tracker :

**1. Définir l'adresse du serveur :**
```
adminip123456 VOTRE_IP 5023
```
Exemple : `adminip123456 192.168.1.100 5023`

**2. Activer le GPRS :**
```
gprs123456
```

**3. Définir l'APN (voir documentation TK905) :**
```
apn123456 internet
```
(Remplacez `internet` par l'APN de votre opérateur)

**4. Redémarrer le tracker :**
```
reset123456
```

### **C. Vérification**

Après quelques minutes, vous devriez voir dans le terminal du serveur :

```
🔌 Nouvelle connexion: 41.XXX.XXX.XXX:XXXXX

📥 Données reçues de 41.XXX.XXX.XXX:XXXXX
📄 Brut: imei:359586015829802,tracker,...

✅ Données valides:
   📍 Position: -25.7479, 28.2293
   🚗 Vitesse: 45 km/h
   🔋 Batterie: 100%
   📊 Statut: moving

💾 Données sauvegardées dans Firebase
```

🎉 **Ça marche !**

---

## 🔍 Étape 8 : Vérifier dans Firebase

1. Allez sur https://console.firebase.google.com/
2. Ouvrez votre projet
3. Allez dans **Realtime Database**
4. Vous devriez voir :

```json
positions/
  359586015829802/
    current/
      lat: -25.7479
      lng: 28.2293
      speed: 45
      battery: 100
      timestamp: "2024-11-17T10:30:00Z"
    history/
      2024-11-17T10:30:00Z/
        lat: -25.7479
        lng: 28.2293
        speed: 45
        battery: 100
```

✅ **Les données arrivent bien dans Firebase !**

---

## 🌐 Étape 9 : Vérifier dans l'application web

1. Ouvrez votre application web (`index.html`)
2. Allez dans **"Gérer trackers"**
3. **Ajoutez le tracker** avec l'IMEI `359586015829802`
4. Revenez sur la carte
5. **Le véhicule doit apparaître et bouger en temps réel !** 🚗

---

## 🛠️ Commandes utiles

### **Démarrer le serveur**
```bash
node server.js
```

### **Arrêter le serveur**
Appuyez sur `Ctrl + C`

### **Voir les logs en continu**
Les logs s'affichent automatiquement dans le terminal

### **Redémarrer après modification**
1. `Ctrl + C` pour arrêter
2. `node server.js` pour redémarrer

---

## 🐛 Dépannage

### **Erreur : "Cannot find module 'firebase-admin'"**

➡️ **Solution :**
```bash
npm install firebase-admin dotenv
```

### **Erreur : "serviceAccountKey.json not found"**

➡️ **Solution :**
1. Vérifiez que le fichier est dans `gps-server/firebase/`
2. Vérifiez qu'il s'appelle exactement `serviceAccountKey.json`

### **Erreur : "EADDRINUSE" (port déjà utilisé)**

➡️ **Solution :**
Changez le port dans `.env` :
```env
PORT=5024
```

### **Le tracker ne se connecte pas**

➡️ **Vérifications :**
1. Le serveur est bien démarré ?
2. L'IP et le port sont corrects dans le TK905 ?
3. Le port est ouvert sur le pare-feu ?
4. Le tracker a du réseau GPRS ?

**Windows - Ouvrir le port dans le pare-feu :**
```
1. Panneau de configuration → Système et sécurité → Pare-feu Windows
2. Paramètres avancés
3. Règles de trafic entrant → Nouvelle règle
4. Port → TCP → 5023
5. Autoriser la connexion
```

### **Les données n'arrivent pas dans Firebase**

➡️ **Vérifications :**
1. Le fichier `serviceAccountKey.json` est correct ?
2. L'URL Firebase dans `.env` est correcte ?
3. Les règles Firebase autorisent l'écriture ?

---

## 📊 Commandes de test

### **Tester la connexion TCP**

**Avec telnet (Windows) :**
```bash
telnet localhost 5023
```

**Envoyer des données de test :**
```
imei:123456789012345,tracker,241117100000,,F,100000.000,A,2545.6789,S,02817.6789,E,10.5,;
```

Vous devriez voir dans le serveur :
```
🔌 Nouvelle connexion: 127.0.0.1:XXXXX
📥 Données reçues
✅ Données valides
💾 Données sauvegardées
```

---

## 🚀 Déploiement en production

### **Option 1 : Serveur local (chez vous)**

**Avantages :**
- ✅ Gratuit
- ✅ Contrôle total

**Inconvénients :**
- ❌ Doit toujours être allumé
- ❌ Besoin d'IP publique fixe
- ❌ Configuration routeur

### **Option 2 : VPS (serveur cloud)**

**Recommandations :**
- **DigitalOcean** : 6$/mois
- **Hetzner** : 5€/mois
- **OVH** : 3€/mois
- **AWS EC2** : Gratuit 1 an (tier gratuit)

**Étapes :**
1. Créer un VPS Ubuntu
2. Se connecter en SSH
3. Installer Node.js
4. Copier les fichiers
5. Démarrer avec `pm2` (pour garder le serveur actif)

```bash
# Installer PM2
npm install -g pm2

# Démarrer le serveur
pm2 start server.js --name gps-server

# Démarrer au boot
pm2 startup
pm2 save
```

### **Option 3 : Heroku / Railway / Render**

Plus simple mais peut coûter plus cher.

---

## 📈 Améliorations futures

### **1. Logs dans un fichier**
```bash
npm install winston
```

### **2. Notification sur erreur**
Email ou SMS quand tracker offline

### **3. Multi-protocoles**
Supporter d'autres trackers (GT06, TK103, etc.)

### **4. Interface web pour le serveur**
Dashboard pour voir les connexions actives

### **5. HTTPS / Sécurité**
Ajouter SSL/TLS pour connexions cryptées

---

## 📞 Support

### **Le serveur fonctionne mais...**

**Pas de données dans l'app web ?**
1. Vérifiez que l'IMEI est bien ajouté dans "Gérer trackers"
2. Passez en mode réel dans `main.js` : `useMockData = false`
3. Actualisez la page

**Les véhicules ne bougent pas ?**
1. Vérifiez que le tracker envoie bien des données (logs serveur)
2. Vérifiez que les positions changent dans Firebase
3. L'animation automatique ne fonctionne qu'en mode démo

**Données arrivent mais mauvaise position ?**
Le parser peut avoir besoin d'ajustement selon le format exact de votre TK905.

---

## ✅ Résumé

**Ce qui fonctionne maintenant :**
1. ✅ Serveur TCP qui écoute sur le port 5023
2. ✅ Parse les données TK905
3. ✅ Sauvegarde dans Firebase (position + historique)
4. ✅ Met à jour le statut (moving/stopped/offline)
5. ✅ L'application web affiche en temps réel

**Prochaine étape :**
- Tester avec un vrai tracker TK905
- Ajuster le parser si nécessaire
- Déployer sur un serveur permanent

---

🎉 **Félicitations ! Votre système est maintenant complet et fonctionnel !**


┌─────────────────────────────────────────────────────────────┐
│                     SYSTÈME COMPLET                         │
└─────────────────────────────────────────────────────────────┘

    TK905 Tracker (dans le véhicule)
         │
         │ GPRS/Internet
         │ Port 5023
         ↓
    ┌─────────────────┐
    │  Serveur Node.js│  ← Vous venez de créer ça !
    │  (gps-server)   │
    │                 │
    │  • Écoute TCP   │
    │  • Parse TK905  │
    │  • Valide GPS   │
    └────────┬────────┘
             │
             │ Firebase Admin SDK
             ↓
    ┌─────────────────┐
    │    Firebase     │
    │  Realtime DB    │
    │                 │
    │  • positions/   │
    │  • trackers/    │
    └────────┬────────┘
             │
             │ Firebase SDK
             ↓
    ┌─────────────────┐
    │ Application Web │  ← Votre interface
    │ (gps-tracker)   │
    │                 │
    │  • Carte        │
    │  • Historique   │
    │  • Export PDF   │
    └─────────────────┘

la liste des APN des Operateurs populaire:

| Opérateur   | APN                |
| ----------- | ------------------ |
| Orange      | **internet**       |
| MTN         | **mtninternet**    |
| Vodacom     | **vodacom**        |
| Airtel      | **airtelgprs.com** |
| Tigo        | **tigogprs**       |
| Safaricom   | **safaricom**      |
| Telkom (SA) | **internet**       |
| Vodacom SA  | **internet**       |

  