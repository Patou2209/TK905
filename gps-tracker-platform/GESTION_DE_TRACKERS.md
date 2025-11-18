# 🚗 Système de Gestion des Trackers/Véhicules

## 📋 Vue d'ensemble

Chaque utilisateur peut maintenant **gérer complètement ses trackers** directement depuis l'interface :
- ✅ Ajouter des nouveaux trackers
- ✅ Modifier les informations
- ✅ Supprimer des trackers
- ✅ Voir toutes les informations détaillées

## 🎯 Informations enregistrées pour chaque véhicule

### **Informations obligatoires :**
- **IMEI du tracker** (numéro unique du TK905)
- **Nom du véhicule** (ex: "Camion Livraison")

### **Informations optionnelles :**
- **Marque** (ex: Toyota)
- **Modèle** (ex: Hilux)
- **Plaque d'immatriculation** (ex: ABC-123-GP)
- **Couleur** (ex: Blanc)
- **Nom du chauffeur** (ex: Pierre Mbala)
- **Téléphone du chauffeur** (ex: +27 12 345 6789)
- **Notes** (informations supplémentaires)

## 🖥️ Comment utiliser

### **1. Accéder à la gestion**
- Cliquez sur **"Gérer trackers"** dans la sidebar
- Un modal s'ouvre avec la liste de vos trackers

### **2. Ajouter un tracker**
1. Cliquez sur **"Ajouter un tracker"**
2. Remplissez le formulaire (au minimum IMEI et nom du véhicule)
3. Cliquez sur **"Enregistrer"**
4. Le tracker apparaît immédiatement dans votre liste

### **3. Modifier un tracker**
1. Dans la liste, cliquez sur l'icône **crayon** (✏️)
2. Modifiez les informations souhaitées
3. Cliquez sur **"Enregistrer"**

### **4. Supprimer un tracker**
1. Dans la liste, cliquez sur l'icône **poubelle** (🗑️)
2. Confirmez la suppression
3. Le tracker et toutes ses données sont supprimés

## 📊 Structure de données Firebase

```json
{
  "trackers": {
    "userId123": {
      "2015070203001": {
        "imei": "2015070203001",
        "vehicleName": "Camion Livraison",
        "brand": "Toyota",
        "model": "Hilux",
        "plate": "ABC-123-GP",
        "color": "Blanc",
        "driverName": "Pierre Mbala",
        "driverPhone": "+27 12 345 6789",
        "notes": "Véhicule principal",
        "status": "moving",
        "lastUpdate": "2024-01-01T12:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    }
  }
}
```

## 🎨 Affichage des informations

### **Dans la liste des trackers (sidebar gauche) :**
```
┌─────────────────────────────┐
│ Camion Livraison        🟢  │
│ Toyota Hilux               │
│ Chauffeur: Pierre Mbala    │
│ IMEI: 2015070203001        │
│ Statut: En marche          │
│ Vitesse: 45 km/h           │
│ Batterie: 85%              │
│ MAJ: 14:30:25              │
└─────────────────────────────┘
```

### **Dans les popups de la carte :**
```
┌─────────────────────────────┐
│ Camion Livraison           │
│ Toyota Hilux               │
│ Plaque: ABC-123-GP         │
│ Chauffeur: Pierre Mbala    │
│ IMEI: 2015070203001        │
│ Vitesse: 45 km/h           │
│ Batterie: 85%              │
│ Statut: En marche          │
└─────────────────────────────┘
```

### **Dans le modal de gestion :**
```
┌─────────────────────────────────────────┐
│ Camion Livraison              ✏️ 🗑️    │
│                                         │
│ # IMEI: 2015070203001                   │
│ 🚗 Véhicule: Toyota Hilux               │
│ 💳 Plaque: ABC-123-GP                   │
│ 👤 Chauffeur: Pierre Mbala              │
│ 📞 +27 12 345 6789                      │
└─────────────────────────────────────────┘
```

## 🔄 Flux de travail typique

### **Scénario : Ajouter un nouveau véhicule**

1. **Recevoir le tracker TK905**
   - Noter l'IMEI (au dos du tracker)
   - Installer dans le véhicule

2. **Configurer le tracker TK905**
   - Insérer la carte SIM
   - Configurer l'APN (voir documentation TK905)
   - Tester la connexion

3. **Ajouter dans la plateforme**
   - Ouvrir "Gérer trackers"
   - Cliquer "Ajouter un tracker"
   - Remplir les informations :
     - IMEI : `2015070203005`
     - Nom : `Fourgon Blanc`
     - Marque : `Mercedes`
     - Modèle : `Sprinter`
     - Plaque : `DEF-456-GP`
     - Chauffeur : `Jean Doe`
     - Téléphone : `+27 12 999 8888`
   - Enregistrer

4. **Le véhicule apparaît**
   - Dans la liste (statut: "Hors ligne" au début)
   - Quand le tracker envoie les données → "En marche" ou "En arrêt"
   - Position visible sur la carte

## 🎓 Avantages de ce système

### **Pour l'utilisateur :**
✅ **Autonomie complète** - Pas besoin de développeur pour ajouter des trackers  
✅ **Informations riches** - Nom du chauffeur, marque, etc.  
✅ **Gestion facile** - Interface intuitive  
✅ **Multi-utilisateurs** - Chaque utilisateur voit seulement ses trackers  

### **Pour vous (TechnoWeb) :**
✅ **Scalable** - Les clients ajoutent eux-mêmes leurs trackers  
✅ **Base de données organisée** - Structure claire  
✅ **Pas d'intervention manuelle** - Tout est automatisé  
✅ **Professional** - Interface moderne et complète  

## 📱 Mode démo vs Mode réel

### **Mode démo (actuel) :**
```javascript
let useMockData = true;
```
- Les trackers sont en mémoire
- Disparaissent au rechargement
- Parfait pour tester l'interface

### **Mode réel (avec Firebase) :**
```javascript
let useMockData = false;
```
- Les trackers sont sauvegardés dans Firebase
- Persistants entre les sessions
- Synchronisés en temps réel

## 🔧 Fichiers modifiés/ajoutés

| Fichier | Changements |
|---------|-------------|
| **index.html** | Ajout du modal + bouton "Gérer trackers" |
| **css/style.css** | Styles du modal et des cartes |
| **js/tracker-manager.js** | ⭐ NOUVEAU - Gestion complète des trackers |
| **js/main.js** | Affichage amélioré avec infos véhicule/chauffeur |
| **js/map.js** | Popup amélioré avec toutes les infos |

## 🚀 Prochaines étapes possibles

### **Fonctionnalités supplémentaires :**
1. **Photos des véhicules** - Upload d'images
2. **Historique des chauffeurs** - Qui a conduit quand
3. **Alertes personnalisées** - Par véhicule
4. **Groupes de véhicules** - Organiser par flotte
5. **Statistiques** - Distance parcourue, temps de conduite, etc.
6. **Export Excel** - Liste complète des véhicules

### **Améliorations UX :**
1. **Recherche** - Trouver rapidement un véhicule
2. **Tri** - Par nom, statut, chauffeur, etc.
3. **Filtres avancés** - Par marque, chauffeur, etc.
4. **Notifications** - Quand un véhicule démarre/s'arrête

## 💡 Conseils d'utilisation

### **Nomenclature des véhicules :**
- ✅ **Bon** : "Camion Livraison Nord", "Fourgon Blanc Pretoria"
- ❌ **Éviter** : "V1", "Truck", "Car"

### **Informations du chauffeur :**
- Toujours renseigner le téléphone
- Mettre à jour quand le chauffeur change
- Utiliser les notes pour des informations importantes

### **IMEI :**
- Vérifier deux fois avant d'enregistrer
- Ne peut pas être modifié après création
- Doit correspondre au tracker physique

## 🐛 Résolution de problèmes

### **Le tracker n'apparaît pas après ajout**
- Vérifiez que l'IMEI est correct
- Vérifiez que le tracker TK905 est allumé
- Vérifiez la configuration APN du tracker

### **Impossible de modifier un tracker**
- Actualisez la page
- Vérifiez votre connexion Internet
- Vérifiez les logs de la console (F12)

### **Les données ne sont pas sauvegardées**
- En mode démo (`useMockData = true`), les données ne persistent pas
- Passez en mode réel avec Firebase pour sauvegarder

---

**Félicitations !** Vous avez maintenant un système complet de gestion de flotte ! 🎉