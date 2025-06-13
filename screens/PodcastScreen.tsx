import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ImageBackground,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider'; // natif
// @ts-ignore
import RcSlider from 'rc-slider'; // web uniquement
import 'rc-slider/assets/index.css'; // styles web

const { width } = Dimensions.get('window');

type Podcast = {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  author: string;
  authorPhotoUrl?: string;
  coverImage?: string;
  publishedAt?: any;
};

export default function PodcastScreen() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [volume, setVolume] = useState(1.0);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [pressAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const fetchPodcasts = async () => {
      const q = query(collection(db, 'podcasts'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || '',
          description: d.description || '',
          audioUrl: d.audioUrl || '',
          author: d.author || '',
          authorPhotoUrl: d.authorPhotoUrl || '',
          coverImage: d.coverImage || d.authorPhotoUrl || '',
          publishedAt: d.publishedAt || null,
        } as Podcast;
      });
      setPodcasts(data);
    };
    fetchPodcasts();
  }, []);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Error initializing audio:', e);
      }
    };
    initAudio();
  }, []);

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePlay = async (audioUrl: string) => {
    animatePress();
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      if (currentlyPlaying === audioUrl) {
        setCurrentlyPlaying(null);
        setPlaybackStatus(null);
        return;
      }
    }
    setCurrentlyPlaying(audioUrl);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          volume: volume,
          progressUpdateIntervalMillis: 1000,
          positionMillis: 0,
          rate: 1.0,
          shouldCorrectPitch: true,
        },
        (status) => setPlaybackStatus(status)
      );
      await newSound.setVolumeAsync(volume);
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      alert('Erreur lors de la lecture audio');
    }
  };

  const handleSeek = async (value: number) => {
    if (sound && playbackStatus?.durationMillis) {
      await sound.setPositionAsync(value);
    }
  };

  const handleVolume = async (value: number) => {
    try {
      setVolume(value);
      if (sound) {
        await sound.setVolumeAsync(value);
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          throw new Error('Sound is not loaded');
        }
        setPlaybackStatus({
          ...playbackStatus,
          volume: value
        });
      }
    } catch (error) {
      console.error('Error setting volume:', error);
      if (sound) {
        setTimeout(async () => {
          await sound.setVolumeAsync(value);
        }, 100);
      }
    }
  };

  const handleSkip = async (direction: 'forward' | 'backward') => {
    if (sound && playbackStatus?.positionMillis) {
      const skipAmount = 10000; // 10 seconds
      const newPosition = direction === 'forward'
        ? Math.min(playbackStatus.positionMillis + skipAmount, playbackStatus.durationMillis)
        : Math.max(0, playbackStatus.positionMillis - skipAmount);
      await sound.setPositionAsync(newPosition);
    }
  };

  const formatMillis = (ms?: number) => {
    if (!ms) return '0:00';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const renderPodcast = ({ item }: { item: Podcast }) => {
    const isPlaying = currentlyPlaying === item.audioUrl;
    return (
      <View style={styles.podcastCard}>
        <ImageBackground
          source={{ uri: item.coverImage }}
          style={styles.coverBackground}
          imageStyle={{ opacity: 0.5 }}>
          <View style={styles.content}>
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
            </View>
            {isPlaying && playbackStatus && (
              <View style={styles.progressContainer}>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatMillis(playbackStatus.positionMillis)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatMillis(playbackStatus.durationMillis)}
                  </Text>
                </View>
                {Platform.OS === 'web' ? (
                  <div style={{ width: '100%', marginTop: 8 }}>
                    <RcSlider
                      min={0}
                      max={playbackStatus.durationMillis}
                      value={playbackStatus.positionMillis}
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
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={playbackStatus.durationMillis || 1}
                    value={playbackStatus.positionMillis || 0}
                    minimumTrackTintColor={theme.colors.secondary}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={theme.colors.secondary}
                    onSlidingComplete={handleSeek}
                  />
                )}
              </View>
            )}
            <View style={styles.controls}>
              {isPlaying && (
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={() => handleSkip('backward')}>
                  <Ionicons name="play-back" size={24} color={theme.colors.white} />
                </TouchableOpacity>
              )}
              <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => handlePlay(item.audioUrl)}>
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={64}
                    color={theme.colors.secondary}
                  />
                </TouchableOpacity>
              </Animated.View>
              {isPlaying && (
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={() => handleSkip('forward')}>
                  <Ionicons name="play-forward" size={24} color={theme.colors.white} />
                </TouchableOpacity>
              )}
            </View>
            {isPlaying && (
              <View style={styles.volumeContainer}>
                <TouchableOpacity 
                  style={styles.volumeButton}
                  onPress={() => setIsVolumeVisible(!isVolumeVisible)}>
                  <Ionicons 
                    name={volume > 0 ? "volume-high" : "volume-mute"} 
                    size={24} 
                    color={theme.colors.white} 
                  />
                </TouchableOpacity>
                {isVolumeVisible && (
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={handleVolume}
                    minimumTrackTintColor={theme.colors.secondary}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={theme.colors.secondary}
                  />
                )}
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={podcasts}
        renderItem={renderPodcast}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  podcastCard: {
    height: 420,
    marginBottom: theme.spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#1a1a1a',
  },
  coverBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  author: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  playButton: {
    padding: theme.spacing.xs,
    marginHorizontal: theme.spacing.md,
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: theme.spacing.sm,
    borderRadius: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: theme.spacing.xs,
    borderRadius: 20,
  },
  volumeButton: {
    padding: theme.spacing.xs,
  },
  volumeSlider: {
    width: 100,
    height: 40,
    marginLeft: theme.spacing.xs,
  },
});