// Service Worker simple pour Saint-Esprit PWA
const CACHE_NAME = 'saint-esprit-v1';

// Installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Laisser passer toutes les requêtes normalement
  event.respondWith(fetch(event.request));
});
