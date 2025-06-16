# 🙏 Saint-Esprit - Application Mobile Spirituelle

Une application mobile développée avec React Native et Expo pour une communauté spirituelle, offrant des fonctionnalités de podcasts, témoignages, lecture biblique et prières.

## 📱 Fonctionnalités

- **🏠 Accueil** - Écran d'accueil avec onboarding
- **🎧 Messages/Podcasts** - Écoute de messages spirituels
- **❤️ Témoignages** - Partage d'expériences de foi
- **📖 Bible** - Lecture et étude biblique
- **🙏 Prières** - Section de prières communautaires
- **⚙️ Interface Admin** - Gestion du contenu

## 🛠 Technologies

- **React Native** avec **Expo**
- **TypeScript**
- **Firebase** (Firestore, Storage, Auth)
- **React Navigation**
- **Expo Audio**
- **Cloudinary** (gestion d'images)

## 🚀 Installation et Développement

### Prérequis
- Node.js (v16 ou plus récent)
- npm ou yarn
- Expo CLI

### Installation
```bash
# Cloner le repository
git clone https://github.com/Nono995/Saint-esprit.git
cd Saint-esprit

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

### Scripts disponibles
- `npm start` - Démarre Expo
- `npm run android` - Lance sur Android
- `npm run ios` - Lance sur iOS
- `npm run web` - Lance sur navigateur web
- `npm run vercel-build` - Build pour déploiement web

## 🌐 Déploiement

### Vercel (Web)
L'application est configurée pour être déployée sur Vercel :
- Build command: `npm run vercel-build`
- Output directory: `web-build`

### Variables d'environnement
Créez un fichier `.env` basé sur `.env.example` avec vos configurations Firebase et Cloudinary.

## 📁 Structure du projet

```
├── screens/          # Écrans de l'application
├── components/       # Composants réutilisables
├── config/          # Configuration Firebase/Cloudinary
├── theme/           # Thème et styles
├── assets/          # Images et ressources
├── admin/           # Interface d'administration
└── utils/           # Utilitaires
```

## 🔧 Configuration

### Firebase
Configurez votre projet Firebase et ajoutez les clés dans `.env`:
- Firestore pour la base de données
- Storage pour les fichiers
- Auth pour l'authentification

### Cloudinary
Pour la gestion des images, configurez Cloudinary dans `.env`.

## 📄 Licence

Ce projet est privé et destiné à un usage communautaire spécifique.

## 👥 Contribution

Pour contribuer au projet, veuillez créer une branche et soumettre une pull request.

---
**Statut : Interface admin déployée et fonctionnelle** ✅
