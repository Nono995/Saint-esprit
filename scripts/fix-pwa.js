const fs = require('fs');
const path = require('path');

// Fonction pour corriger l'index.html
function fixIndexHtml() {
  const indexPath = path.join(__dirname, '../web-build/index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html not found');
    return;
  }

  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Ajouter les meta tags PWA si pas présents
  if (!html.includes('rel="manifest"')) {
    const metaInsert = `  <meta name="theme-color" content="#5F4B8B">
<meta name="description" content="Application spirituelle pour la communauté - Podcasts, Témoignages, Bible et Prières">
<!-- PWA Meta Tags -->
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Saint-Esprit">
<meta name="mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/assets/assets/icon.png">`;

    html = html.replace(
      /<meta name="theme-color"[^>]*>/,
      metaInsert
    );
  }

  // Ajouter le script service worker si pas présent
  if (!html.includes('serviceWorker')) {
    const swScript = `  <!-- PWA Service Worker Registration -->
  <script>
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
  }

  fs.writeFileSync(indexPath, html);
  console.log('✅ index.html fixed for PWA');
}

// Fonction pour corriger le manifest.json
function fixManifest() {
  const manifestPath = path.join(__dirname, '../web-build/manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ manifest.json not found');
    return;
  }

  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Corriger les chemins des icônes
  if (manifest.icons) {
    manifest.icons = manifest.icons.map(icon => ({
      ...icon,
      src: icon.src.replace('/assets/', '/assets/assets/')
    }));
  }

  // Corriger les raccourcis
  if (manifest.shortcuts) {
    manifest.shortcuts = manifest.shortcuts.map(shortcut => ({
      ...shortcut,
      icons: shortcut.icons?.map(icon => ({
        ...icon,
        src: icon.src.replace('/assets/', '/assets/assets/')
      }))
    }));
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ manifest.json fixed for PWA');
}

// Exécuter les corrections
console.log('🔧 Fixing PWA files...');
fixIndexHtml();
fixManifest();
console.log('🎉 PWA files fixed successfully!');
