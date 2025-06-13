import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
// @ts-ignore
import RcSlider from 'rc-slider'; // web uniquement
import 'rc-slider/assets/index.css'; // styles web
import Slider from '@react-native-community/slider'; // natif
import { theme } from '../theme';

interface PodcastHeaderPlayerProps {
  podcast: {
    title: string;
    audioUrl: string;
    verseText?: string;
    verseReference?: string;
    imageUrl?: string; // Ajout d'une image optionnelle
  };
}

export const PodcastHeaderPlayer: React.FC<PodcastHeaderPlayerProps> = ({ podcast }) => {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(1);

  const verseText = podcast.verseText || 'Je puis tout par celui qui me fortifie';
  const verseReference = podcast.verseReference || 'Philippiens 4:13';

  React.useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const handlePlayPause = async () => {
    if (!sound) {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setProgress(status.positionMillis || 0);
            setDuration(status.durationMillis || 1);
            setIsPlaying(!!status.isPlaying);
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
    } else {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (status.isLoaded) {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setProgress(value);
    }
  };

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Affichage de l'image du podcast si présente */}
        {podcast.imageUrl && (
          <View style={styles.podcastImageContainer}>
            <Image
              source={{ uri: podcast.imageUrl }}
              style={styles.podcastImage}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.badge}>PODCAST DU JOUR</Text>
          <Text style={styles.verseText}>{`"${verseText}"`}</Text>
          <Text style={styles.verseReference}>{verseReference}</Text>
          <View style={styles.controls}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#FFF" 
              />
            </TouchableOpacity>
            <View style={styles.sliderContainer}>
              {Platform.OS === 'web' ? (
                <div style={{ width: '100%', marginTop: 8 }}>
                  <RcSlider
                    min={0}
                    max={duration}
                    value={progress}
                    onChange={value => {
                      // RcSlider peut renvoyer number ou number[]
                      const v = Array.isArray(value) ? value[0] : value;
                      handleSeek(v);
                    }}
                    trackStyle={{ backgroundColor: '#007bff', height: 6 }}
                    handleStyle={{ borderColor: '#007bff', height: 20, width: 20 }}
                    railStyle={{ backgroundColor: '#e0e0e0', height: 6 }}
                  />
                </div>
              ) : (
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={progress}
                  onValueChange={handleSeek}
                  minimumTrackTintColor="#007bff"
                  maximumTrackTintColor="#e0e0e0"
                  thumbTintColor="#007bff"
                />
              )}
              <Text style={styles.time}>{formatTime(progress)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  content: {
    padding: 20,
  },
  badge: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 1,
    opacity: 0.9,
    marginBottom: 16,
  },
  verseText: {
    fontSize: 24,
    lineHeight: 32,
    color: '#FFF',
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 8,
  },
  verseReference: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    opacity: 0.8,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    height: 40,
    marginBottom: -8,
  },
  time: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Roboto_400Regular',
    opacity: 0.8,
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  podcastImageContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
    maxHeight: 80, // Réduction de la hauteur maximale de l'image
  },
  podcastImage: {
    width: '100%',
    height: 80, // Réduction de la hauteur de l'image
    maxHeight: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    resizeMode: 'cover',
  },
});
