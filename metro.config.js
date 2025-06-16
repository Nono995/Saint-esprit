const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration pour améliorer la compatibilité web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Optimisations pour le build web
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
