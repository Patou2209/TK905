# 🎬 Système d'animation fluide des véhicules

## Aperçu

Le système d'animation a été conçu pour créer un mouvement **ultra-fluide** et **réaliste** des véhicules sur la carte, avec une vitesse proportionnelle à leur vitesse réelle.

## 🚗 Comment ça fonctionne

### 1. Animation à 60 FPS

Au lieu de mettre à jour les positions toutes les 5 secondes avec des "sauts", nous utilisons maintenant `requestAnimationFrame()` qui fonctionne à **60 images par seconde** (60 FPS).

```javascript
function animateVehicles() {
    // Mis à jour 60 fois par seconde
    requestAnimationFrame(animateVehicles);
}
```

### 2. Interpolation entre les points

Chaque véhicule se déplace **graduellement** d'un point A vers un point B :

```
Point A ----[animation fluide]----> Point B
   |                                    |
Position actuelle            Prochaine position
```

### 3. Vitesse proportionnelle

**Plus un véhicule va vite, plus il se déplace rapidement sur la carte.**

| Vitesse réelle | Vitesse d'animation |
|---------------|---------------------|
| 20 km/h       | Lent ⚪             |
| 60 km/h       | Moyen 🟡           |
| 100 km/h      | Rapide 🔴          |

```javascript
const speedFactor = tracker.speed / 100;
const progressIncrement = speedFactor * 0.02;
```

### 4. Easing (mouvement naturel)

Nous utilisons une fonction d'**easing** pour que le mouvement soit plus naturel :
- Accélération progressive au départ
- Décélération douce à l'arrivée

```javascript
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
```

## 📊 Structure des données d'animation

Chaque véhicule en mouvement possède ces données :

```javascript
tracker.animationData = {
    startLat: -25.7479,          // Position de départ
    startLng: 28.2293,           // Position de départ
    targetLat: -25.7489,         // Position cible
    targetLng: 28.2303,          // Position cible
    progress: 0.35,              // Progression (0 = début, 1 = arrivé)
    lastUpdateTime: 1234567890   // Timestamp de la dernière mise à jour
}
```

## 🎯 Avantages de ce système

✅ **Mouvement ultra-fluide** - 60 images par seconde  
✅ **Vitesse réaliste** - Proportionnelle à la vitesse réelle  
✅ **Différenciation visuelle** - On voit clairement quel véhicule va vite  
✅ **Performance optimale** - Utilise requestAnimationFrame  
✅ **Naturel** - Accélération et décélération progressives  

## 🔧 Personnalisation

### Modifier la fluidité du mouvement

Dans `js/main.js`, ligne ~80 :

```javascript
const progressIncrement = speedFactor * 0.02; // ← Changez ce nombre
```

- **Plus petit (0.01)** = Mouvement plus lent et plus fluide
- **Plus grand (0.05)** = Mouvement plus rapide

### Modifier la distance entre les points

Dans `js/main.js`, ligne ~97 :

```javascript
tracker.animationData.targetLat = tracker.lat + (Math.random() - 0.5) * 0.005;
//                                                                      ^^^^^^
//                                                                   Changez ici
```

- **Plus petit (0.002)** = Petits déplacements
- **Plus grand (0.01)** = Grands déplacements

### Modifier le type d'easing

Vous pouvez changer la fonction d'easing pour différents effets :

**Easing linéaire** (mouvement constant) :
```javascript
function easeLinear(t) {
    return t;
}
```

**Easing rapide au début** :
```javascript
function easeInQuad(t) {
    return t * t;
}
```

**Easing rapide à la fin** :
```javascript
function easeOutQuad(t) {
    return t * (2 - t);
}
```

## 🎨 Animation des marqueurs sur la carte

Les marqueurs Leaflet utilisent aussi une animation indépendante :

```javascript
function animateMarkerMove(marker, startLatLng, endLatLng, duration) {
    // Animation sur 100ms avec easing cubique
    // Plus naturel que l'easing quadratique
}
```

**Durée d'animation** : 100ms par défaut  
**Easing** : Cubic (plus smooth que quadratic)

## 🔄 Cycle complet d'une animation

```
1. Véhicule à la position A
   ↓
2. Définir position cible B
   ↓
3. Animation fluide A → B
   (vitesse basée sur tracker.speed)
   ↓
4. Arrivé en B
   ↓
5. Définir nouvelle cible C
   ↓
6. Animation fluide B → C
   ↓
(etc...)
```

## 🐛 Debug

Pour voir l'animation en détail, ajoutez dans la console :

```javascript
// Voir la progression en temps réel
console.log('Progress:', tracker.animationData.progress);
console.log('Speed:', tracker.speed, 'km/h');
console.log('Position:', tracker.lat, tracker.lng);
```

## 📈 Performance

- **60 FPS** : Fluide sur tous les navigateurs modernes
- **Optimisé** : Utilise `requestAnimationFrame` au lieu de `setInterval`
- **Scalable** : Fonctionne bien avec 50+ véhicules simultanés

## 💡 Cas d'usage réels

Quand vous recevrez les vraies données des TK905 :

1. **Mise à jour toutes les 10 secondes** : L'animation comblera le vide entre les mises à jour
2. **Vitesse variable** : Les véhicules qui accélèrent/freinent verront leur animation s'adapter
3. **Arrêts** : Les véhicules arrêtés (`speed = 0`) ne bougeront pas

## 🎓 Concepts utilisés

- **Interpolation linéaire (LERP)** : Calcul de position intermédiaire
- **Easing functions** : Courbes d'accélération/décélération
- **RequestAnimationFrame** : Synchronisation avec le refresh de l'écran
- **Delta time** : Calcul du temps écoulé pour animation précise

---

**Résultat** : Des véhicules qui se déplacent de manière ultra-fluide, réaliste, et visuellement agréable ! 🚀