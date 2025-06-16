# Configuration des Variables d'Environnement pour Vercel

## Variables Firebase à ajouter dans Vercel

Lors de la configuration de votre projet sur Vercel, ajoutez ces variables d'environnement :

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

### Cloudinary Configuration (si utilisé)
```
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME = [votre_cloud_name]
EXPO_PUBLIC_CLOUDINARY_API_KEY = [votre_api_key]
EXPO_PUBLIC_CLOUDINARY_API_SECRET = [votre_api_secret]
```

## Instructions de déploiement

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Importez le repository "Nono995/Saint-esprit"
5. Configurez :
   - Project Name: saint-esprit-app
   - Framework: Other/Static Site
   - Build Command: npm run vercel-build
   - Output Directory: web-build
6. Ajoutez les variables d'environnement ci-dessus
7. Cliquez sur "Deploy"

## Post-déploiement

Après le déploiement, votre application sera accessible via une URL Vercel.
Vous pourrez configurer un domaine personnalisé si souhaité.

## Troubleshooting

Si le build échoue :
1. Vérifiez que toutes les variables d'environnement sont correctement définies
2. Assurez-vous que le build local fonctionne avec `npm run vercel-build`
3. Vérifiez les logs de build dans l'interface Vercel
