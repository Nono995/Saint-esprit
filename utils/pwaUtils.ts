// Utilitaires PWA pour l'enregistrement du service worker

export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const addToHomeScreenPrompt = () => {
  // Ajouter des meta tags pour iOS
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.getElementsByTagName('head')[0].appendChild(meta);

    const meta2 = document.createElement('meta');
    meta2.name = 'apple-mobile-web-app-status-bar-style';
    meta2.content = 'black-translucent';
    document.getElementsByTagName('head')[0].appendChild(meta2);

    const meta3 = document.createElement('meta');
    meta3.name = 'apple-mobile-web-app-title';
    meta3.content = 'Saint-Esprit';
    document.getElementsByTagName('head')[0].appendChild(meta3);
  }
};
