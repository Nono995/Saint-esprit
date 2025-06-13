import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { db, getAuthInstance } from '../config/firebaseConfig';
import { collection, getDocs, orderBy, query, Timestamp, updateDoc, doc, increment, where, getDoc } from 'firebase/firestore';

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

interface PrayerAudio {
  id: string;
  author: string;
  audioUrl: string;
  duration: number;
  date?: string;
  amens?: number;
  published?: boolean;
  likes: number;
  comments?: Comment[];
}

// Composant Header avec animation et motif de croix
const AnimatedHeader = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 100],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.header, 
        { 
          height: headerHeight,
          opacity: headerOpacity 
        }
      ]}
    >
      <View style={styles.headerBackground}>
        <View style={styles.patternOverlay} />
        <View style={styles.gradientOverlay} />
      </View>
      <View style={styles.headerContent}>
        <View style={styles.crossPattern}>
          <View style={styles.cross} />
          <View style={[styles.cross, { transform: [{ rotate: '45deg' }] }]} />
        </View>
        <Text style={styles.headerTitle}>Prière</Text>
        <Text style={styles.headerSubtitle}>Partagez vos prières vocales et prions ensemble</Text>
      </View>
    </Animated.View>
  );
};

// Composant de visualisation des ondes audio
const AudioWaveform = ({ isPlaying }: { isPlaying: boolean }) => {
  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      ).start();
    } else {
      waveAnim.setValue(1);
    }
  }, [isPlaying]);

  return (
    <View style={styles.waveformContainer}>
      {[...Array(5)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: 20 + i * 4,
              transform: [{ scale: waveAnim }],
              opacity: isPlaying ? 0.6 + i * 0.08 : 0.3 + i * 0.05,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Composant de carte de prière audio
const AudioPrayerCard = ({ 
  prayer, 
  onPlay, 
  isPlaying,
  onLike,
  isLiked,
  audioPosition = 0,
  audioDuration = 0,
  onSeek
}: { 
  prayer: PrayerAudio, 
  onPlay: () => void, 
  isPlaying: boolean,
  onLike: () => void,
  isLiked: boolean,
  audioPosition?: number,
  audioDuration?: number,
  onSeek?: (seconds: number) => void
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        friction: 5,
        tension: 100
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 100
      }),
    ]).start();
  };

  const animateLike = () => {
    if (!isLiked) {
      Animated.sequence([
        Animated.spring(likeAnim, {
          toValue: 1.3,
          useNativeDriver: true,
          friction: 3,
          tension: 200
        }),
        Animated.spring(likeAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 180
        }),
      ]).start();
    }
  };

  const handleLikePress = () => {
    if (!isLiked) {
      animatePress();
      animateLike();
      onLike();
    }
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View 
      style={[
        styles.prayerCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Ionicons name="person" size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.authorName}>{prayer.author}</Text>
            <Text style={styles.date}>{prayer.date}</Text>
          </View>
        </View>
        <Text style={styles.duration}>{formatDuration(prayer.duration)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.playerContainer}
        onPress={() => {
          animatePress();
          onPlay();
        }}
        activeOpacity={0.9}
      >
        <View style={styles.playButton}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color="#FFD600"
          />
        </View>
        <AudioWaveform isPlaying={isPlaying} />
        {/* Mode lecture : afficher le texte "Lecture en cours..." si en lecture */}
        {isPlaying && (
          <Text style={{ marginLeft: 12, color: theme.colors.primary, fontWeight: 'bold', fontSize: 15 }}>
            Lecture en cours...
          </Text>
        )}
      </TouchableOpacity>
      {/* Ajout de la barre de progression et du temps d'audio */}
      {isPlaying && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          {/* Bouton reculer 10s */}
          <TouchableOpacity
            onPress={() => onSeek && onSeek(Math.max(audioPosition - 10, 0))}
            style={{ padding: 4, marginRight: 2 }}
            accessibilityLabel="Reculer de 10 secondes"
          >
            <Ionicons name="play-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: 12, color: theme.colors.text.secondary, width: 40 }}>{formatDuration(audioPosition)}</Text>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <View style={{ height: 4, backgroundColor: '#eee', borderRadius: 2 }}>
              <View style={{
                height: 4,
                width: audioDuration ? `${(audioPosition / audioDuration) * 100}%` : '0%',
                backgroundColor: theme.colors.primary,
                borderRadius: 2,
                position: 'absolute',
                left: 0,
                top: 0,
              }} />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: audioDuration ? `${(audioPosition / audioDuration) * 100}%` : 0,
                  top: -6,
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary,
                  borderWidth: 2,
                  borderColor: '#fff',
                  zIndex: 2,
                }}
                activeOpacity={0.7}
                onPress={e => {
                  if (!onSeek || !audioDuration) return;
                  onSeek(Math.min(audioPosition + 10, audioDuration));
                }}
                onLongPress={e => {
                  if (!onSeek || !audioDuration) return;
                  onSeek(Math.max(audioPosition - 10, 0));
                }}
              />
            </View>
          </View>
          <Text style={{ fontSize: 12, color: theme.colors.text.secondary, width: 40, textAlign: 'right' }}>{formatDuration(audioDuration)}</Text>
          {/* Bouton avancer 10s */}
          <TouchableOpacity
            onPress={() => onSeek && onSeek(Math.min(audioPosition + 10, audioDuration))}
            style={{ padding: 4, marginLeft: 2 }}
            accessibilityLabel="Avancer de 10 secondes"
          >
            <Ionicons name="play-forward" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isLiked && styles.actionButtonLiked
          ]} 
          onPress={handleLikePress}
          activeOpacity={0.8}
          disabled={isLiked}
        >
          <Animated.View style={{
            transform: [{ scale: likeAnim }],
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? theme.colors.white : theme.colors.primary} 
            />
            <Text style={[
              styles.actionText,
              isLiked && styles.actionTextLiked
            ]}>{prayer.likes || 0} J'aime</Text>
          </Animated.View>
        </TouchableOpacity>
        {/* Removed duplicate play button from card footer */}
      </View>
    </Animated.View>
  );
};

// Composant principal de l'écran
export default function PrayerScreen() {
  const [prayers, setPrayers] = useState<PrayerAudio[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [likedPrayers, setLikedPrayers] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  // Ajout des états globaux pour la position et la durée de l'audio joué
  const [audioPosition, setAudioPosition] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadPrayers();
    loadLikedPrayers();
    checkAdminStatus();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Met à jour la position et la durée pendant la lecture
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playingId && soundRef.current) {
      const updateStatus = async () => {
        const status = await soundRef.current?.getStatusAsync();
        if (status?.isLoaded) {
          setAudioPosition(status.positionMillis / 1000);
          setAudioDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        }
      };
      interval = setInterval(updateStatus, 500);
    }
    return () => clearInterval(interval);
  }, [playingId]);

  // Permet d'avancer/reculer dans l'audio
  const seekAudio = async (seconds: number) => {
    if (soundRef.current && playingId) {
      await soundRef.current.setPositionAsync(seconds * 1000);
      setAudioPosition(seconds);
    }
  };

  const loadLikedPrayers = async () => {
    try {
      const liked = await AsyncStorage.getItem('likedPrayers');
      if (liked) {
        setLikedPrayers(JSON.parse(liked));
      }
    } catch (error) {
      console.error('Error loading liked prayers:', error);
    }
  };

  const checkAdminStatus = async () => {
    const authInstance = getAuthInstance();
    if (!authInstance.currentUser) return;

    try {
      const userRef = doc(db, 'users', authInstance.currentUser.uid);
      const userDoc = await getDoc(userRef);
      setIsAdmin(userDoc.data()?.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadPrayers = async () => {
    try {
      let baseQuery = query(
        collection(db, 'prayers'),
        orderBy('publishedAt', 'desc'),
        where('published', '==', true)
      );
      
      if (!isAdmin) {
        baseQuery = query(
          collection(db, 'prayers'),
          orderBy('publishedAt', 'desc'),
          where('published', '==', true),
          where('adminOnly', '==', false)
        );
      }
      
      const snapshot = await getDocs(baseQuery);
      setPrayers(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        comments: doc.data().comments || [] 
      } as PrayerAudio)));
    } catch (error) {
      console.error('Error loading prayers:', error);
      Alert.alert('Erreur', 'Impossible de charger les prières.');
    }
  };

  const handlePlay = async (prayer: PrayerAudio) => {
    if (!prayer.audioUrl) {
      console.error('No audio URL provided');
      Alert.alert('Erreur', 'Cette prière n\'a pas de contenu audio.');
      return;
    }

    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        
        if (playingId === prayer.id) {
          setPlayingId(null);
          return;
        }
      } catch (error) {
        console.error('Error stopping previous audio:', error);
      }
    }

    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: prayer.audioUrl },
        { shouldPlay: true },
        (playbackStatus) => {
          if (playbackStatus.isLoaded && !playbackStatus.isPlaying && playbackStatus.didJustFinish) {
            setPlayingId(null);
          }
        }
      );

      soundRef.current = sound;
      setPlayingId(prayer.id);

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert(
        'Erreur de lecture',
        'Impossible de lire cet enregistrement. Veuillez réessayer.'
      );
      setPlayingId(null);
    }
  };

  const handleLike = async (prayerId: string) => {
    try {
      if (likedPrayers.includes(prayerId)) return;

      const prayerRef = doc(db, 'prayers', prayerId);
      await updateDoc(prayerRef, {
        likes: increment(1)
      });

      // Update local state
      setPrayers(prayers.map(p => 
        p.id === prayerId 
          ? { ...p, likes: (p.likes || 0) + 1 }
          : p
      ));

      // Save to AsyncStorage
      const newLikedPrayers = [...likedPrayers, prayerId];
      setLikedPrayers(newLikedPrayers);
      await AsyncStorage.setItem('likedPrayers', JSON.stringify(newLikedPrayers));
    } catch (error) {
      console.error('Error liking prayer:', error);
      Alert.alert('Erreur', 'Impossible d\'aimer cette prière.');
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedHeader />
      
      <FlatList
        data={prayers}
        renderItem={({ item }) => (
          <AudioPrayerCard
            prayer={item}
            onPlay={() => handlePlay(item)}
            isPlaying={playingId === item.id}
            onLike={() => handleLike(item.id)}
            isLiked={likedPrayers.includes(item.id)}
            audioPosition={playingId === item.id ? audioPosition : 0}
            audioDuration={playingId === item.id ? audioDuration : item.duration}
            onSeek={seekAudio}
          />
        )
        }
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="mic-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyStateText}>Aucune prière vocale</Text>
            <Text style={styles.emptyStateSubtext}>Soyez le premier à partager une prière</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderStyle: 'dashed',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${theme.colors.primary}40`,
    transform: [{ skewY: '-6deg' }],
  },
  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 36,
    color: theme.colors.white,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.white,
    fontFamily: 'Inter_400Regular',
    opacity: 0.9,
  },
  crossPattern: {
    position: 'absolute',
    top: 20,
    right: 20,
    opacity: 0.15,
  },
  cross: {
    position: 'absolute',
    width: 40,
    height: 4,
    backgroundColor: theme.colors.white,
    borderRadius: 2,
  },
  prayerCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 8,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFD60022',
  },
  prayerCardDecoration: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    opacity: 0.1,
    zIndex: 1,
  },
  prayerCardCross: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.primary,
    top: '50%',
    marginTop: -1.5,
    borderRadius: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFD60022',
  },
  authorName: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    fontFamily: 'Inter_400Regular',
  },
  duration: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: 'Inter_600SemiBold',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD60022',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: '#FFD60033',
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 40,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#FFD600',
    borderRadius: 1.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFD60022',
    paddingTop: 16,
  },
  amenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFD60022',
  },
  amenText: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 28,
    margin: 16,
    borderWidth: 1.5,
    borderColor: '#FFD60022',
  },
  emptyStateText: {
    fontSize: 20,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD60022',
    marginLeft: 8,
  },
  cardSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFD60022',
    paddingTop: 16,
  },
  commentsList: {
    maxHeight: 200,
  },
  commentItem: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD60022',
  },
  addCommentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  commentInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD60022',
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentTextContent: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontFamily: 'Inter_400Regular',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD60022',
  },
  actionButtonLiked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 15,
    color: theme.colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  actionTextLiked: {
    color: theme.colors.white,
  },
});
