const fs = require('fs');
const path = require('path');

console.log('🔧 Building PWA...');

// 1. Copier les fichiers PWA
try {
  fs.copyFileSync('web/manifest.json', 'web-build/manifest.json');
  fs.copyFileSync('web/sw.js', 'web-build/sw.js');
  console.log('✅ PWA files copied');
} catch (error) {
  console.error('❌ Error copying PWA files:', error);
  process.exit(1);
}

// 2. Modifier l'index.html
try {
  let html = fs.readFileSync('web-build/index.html', 'utf8');
  
  // Ajouter les meta tags PWA
  const pwaMetaTags = `<meta name="description" content="Application spirituelle pour la communauté - Podcasts, Témoignages, Bible et Prières">
<!-- PWA Configuration -->
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Saint-Esprit">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-touch-fullscreen" content="yes">
<meta name="format-detection" content="telephone=no">
<link rel="apple-touch-icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="152x152" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="167x167" href="/favicon.ico">`;

  html = html.replace(
    '<meta name="description" content="Application spirituelle pour la communauté">',
    pwaMetaTags
  );

  // Ajouter le service worker et test standalone
  const swScript = `  <!-- PWA Service Worker -->
  <script>
    // Test si l'app est en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App running in STANDALONE mode - No browser bars!');
      document.body.style.backgroundColor = '#5F4B8B'; // Couleur de confirmation
    } else {
      console.log('❌ App running in BROWSER mode - Browser bars visible');
    }

    if ('serviceWorker' in navigator) {
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
  </script>
</body>`;

  html = html.replace('</body>', swScript);
  
  fs.writeFileSync('web-build/index.html', html);
  console.log('✅ index.html updated with PWA configuration');
} catch (error) {
  console.error('❌ Error updating index.html:', error);
  process.exit(1);
}

console.log('🎉 PWA build completed successfully!');
