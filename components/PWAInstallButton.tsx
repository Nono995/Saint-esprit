import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  // Ne pas afficher sur mobile natif
  if (Platform.OS !== 'web') {
    return null;
  }

  // Ne pas afficher si déjà installé
  if (isInstalled) {
    return null;
  }

  // Ne pas afficher si pas installable
  if (!isInstallable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.installButton} onPress={installApp}>
        <Ionicons name="download-outline" size={20} color={theme.colors.white} />
        <Text style={styles.installText}>Installer l'app</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
  },
  installButton: {
    backgroundColor: theme.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  installText: {
    color: theme.colors.white,
    fontSize: 14,
    fontFamily: 'Roboto_500Medium',
    marginLeft: 8,
  },
});
