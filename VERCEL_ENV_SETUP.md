# 🚀 Guide de Déploiement Vercel - Saint-Esprit App

## ✅ Corrections Appliquées

Les problèmes suivants ont été résolus :
- ❌ **Erreur "Unexpected token '<'"** → ✅ Configuration de routage Vercel corrigée
- ❌ **Fichiers statiques non trouvés** → ✅ Routes `/_expo/static/` ajoutées
- ❌ **Build failures** → ✅ Configuration Expo optimisée
- ❌ **Variables d'environnement** → ✅ Support des env vars ajouté

## 🔧 Variables d'Environnement pour Vercel

### Firebase Configuration
```
EXPO_PUBLIC_FIREBASE_API_KEY = AIzaSyDDdAP3XGeMRhai2gJ6NXB7ZTZGsUFTC_4
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = church-290ce.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID = church-290ce
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = church-290ce.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 1045543151176
EXPO_PUBLIC_FIREBASE_APP_ID = 1:1045543151176:web:860b948249101dba651a7d
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID = G-T4DTGQNT1V
```

### Cloudinary Configuration (optionnel)
```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME = [votre_cloud_name]
EXPO_PUBLIC_CLOUDINARY_API_KEY = [votre_api_key]
EXPO_PUBLIC_CLOUDINARY_API_SECRET = [votre_api_secret]
```

## 📋 Instructions de Re-déploiement

### Option 1: Auto-déploiement (Recommandé)
Si votre projet Vercel est déjà connecté au repository GitHub :
1. **Les changements sont automatiquement déployés** après chaque push
2. Vérifiez le dashboard Vercel pour voir le statut du déploiement
3. Le nouveau build devrait résoudre l'erreur JavaScript

### Option 2: Déploiement Manuel
Si vous devez reconfigurer :
1. Allez sur https://vercel.com/dashboard
2. Trouvez votre projet existant ou créez-en un nouveau
3. Configurez :
   - **Project Name**: saint-esprit-app
   - **Framework**: Other/Static Site
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `web-build`
4. Ajoutez les variables d'environnement ci-dessus
5. Redéployez

## 🎯 Vérifications Post-Déploiement

✅ **Vérifiez que ces éléments fonctionnent :**
- Page d'accueil se charge sans erreur console
- Navigation entre les onglets
- Lecture des podcasts
- Affichage des témoignages
- Fonctionnalité Bible

## 🔍 Troubleshooting

### Si l'erreur "Unexpected token '<'" persiste :
1. **Vérifiez les variables d'environnement** dans Vercel
2. **Forcez un nouveau déploiement** depuis le dashboard
3. **Vérifiez les logs de build** pour d'autres erreurs

### Si le build échoue :
1. Testez localement : `npm run vercel-build`
2. Vérifiez que `web-build/` est généré correctement
3. Consultez les logs détaillés dans Vercel

## 📱 Test de l'Application

Une fois déployée, testez ces fonctionnalités critiques :
- ✅ Onboarding (première visite)
- ✅ Navigation des onglets
- ✅ Lecture audio des podcasts
- ✅ Affichage des témoignages
- ✅ Lecture de la Bible
- ✅ Section Prières
