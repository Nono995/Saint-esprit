# 🧪 Guide de Test PWA - Saint-Esprit

## ✅ Vérifications Rapides

### 1. **Test du Manifest**
Ouvrez votre app déployée et dans la console du navigateur (F12), tapez :
```javascript
console.log(navigator.serviceWorker);
fetch('/manifest.json').then(r => r.json()).then(console.log);
```

### 2. **Test d'Installation Android/Chrome**
1. Ouvrez l'app sur **Chrome mobile** ou **Chrome desktop**
2. Cherchez l'icône d'installation dans la barre d'adresse
3. Ou menu Chrome > "Installer Saint-Esprit"
4. Le bouton "Installer l'app" devrait apparaître

### 3. **Test d'Installation iOS/Safari**
1. Ouvrez l'app sur **Safari iOS** (pas Chrome!)
2. Bouton **Partager** (carré avec flèche)
3. **"Sur l'écran d'accueil"**
4. L'icône devrait apparaître sur l'écran d'accueil

### 4. **Test Mode Standalone**
Après installation :
1. Lancez l'app depuis l'icône (pas le navigateur)
2. ✅ **Pas de barre d'adresse** visible
3. ✅ **Pas de boutons navigateur** (retour, actualiser)
4. ✅ **Plein écran** complet

## 🔧 Dépannage

### Le bouton d'installation n'apparaît pas ?
**Causes possibles :**
- ❌ Pas sur HTTPS (requis pour PWA)
- ❌ Manifest.json non accessible
- ❌ Service Worker non enregistré
- ❌ Déjà installé
- ❌ Navigateur non compatible

**Solutions :**
1. Vérifiez l'URL : doit être **https://**
2. Testez `/manifest.json` directement dans le navigateur
3. Console F12 > Application > Service Workers
4. Essayez en navigation privée
5. Utilisez Chrome/Safari (pas Firefox mobile)

### L'app ne s'affiche pas en plein écran ?
**Vérifications :**
1. ✅ Lancez depuis l'**icône** (pas le navigateur)
2. ✅ Vérifiez `"display": "standalone"` dans manifest.json
3. ✅ Meta tag `apple-mobile-web-app-capable` présent
4. ✅ Redémarrez l'appareil si nécessaire

### Service Worker ne fonctionne pas ?
**Debug :**
1. F12 > Application > Service Workers
2. Vérifiez que `/sw.js` est accessible
3. Console : erreurs de registration ?
4. Forcez l'actualisation (Ctrl+F5)

## 📱 Tests par Plateforme

### **Android Chrome ✅**
- Installation automatique
- Mode standalone
- Icône personnalisée
- Notifications (si configurées)

### **iOS Safari ✅**
- Installation manuelle
- Mode standalone
- Icône personnalisée
- Pas de notifications push

### **Desktop Chrome/Edge ✅**
- Installation automatique
- Fenêtre dédiée
- Icône dans la barre des tâches

### **Firefox Mobile ❌**
- Pas de support PWA natif
- Fonctionne comme site web normal

## 🎯 Critères de Succès

### ✅ **Installation Réussie**
- Icône visible sur écran d'accueil
- Nom "Saint-Esprit" affiché
- Lancement depuis l'icône fonctionne

### ✅ **Mode Standalone**
- Pas de barre d'adresse
- Pas de boutons navigateur
- Interface plein écran
- Navigation interne fluide

### ✅ **Fonctionnalités**
- Tous les onglets fonctionnent
- Audio des podcasts
- Navigation entre écrans
- Données Firebase chargées

## 🚀 URL de Test

Testez sur votre URL Vercel :
`https://votre-app.vercel.app`

## 📞 Support

Si les tests échouent :
1. Vérifiez la console (F12) pour les erreurs
2. Testez `/manifest.json` et `/sw.js` directement
3. Essayez en navigation privée
4. Testez sur différents navigateurs/appareils
