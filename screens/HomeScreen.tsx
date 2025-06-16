import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { PodcastHeaderPlayer } from '../components/PodcastHeaderPlayer';
import { theme } from '../theme';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { Audio } from 'expo-av';

interface FirestoreData {
  [key: string]: any;
}

interface ChurchEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
}

interface TestimonyType {
  id: string;
  author: string;
  content: string;
  created_at?: string;
  published?: boolean;
  likes?: number;
}

const { width } = Dimensions.get('window');

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  accent?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onPress, accent = false }) => (
  <TouchableOpacity 
    style={[
      styles.featureCard, 
      accent && (title === "Messages" ? styles.yellowFeatureCard : styles.accentFeatureCard)
    ]}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={[
        styles.iconContainer, 
        accent && (title === "Messages" ? styles.yellowIconContainer : styles.accentIconContainer)
      ]}>
        <Ionicons 
          name={icon} 
          size={28}
          color={accent ? '#FFF' : theme.colors.primary} 
        />
      </View>
      <Text style={[styles.cardTitle, accent && styles.accentText]}>
        {title}
      </Text>
      <Text style={[styles.cardDescription, accent && styles.accentText]}>
        {description}
      </Text>
    </View>
  </TouchableOpacity>
);

const EventCard: React.FC<ChurchEvent> = ({ title, date, time, location, image_url }) => (
  <TouchableOpacity style={styles.eventCard}>
    {image_url && (
      <View style={styles.eventImageContainer}>
        <Image 
          source={{ uri: image_url }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      </View>
    )}
    <View style={styles.eventDateBox}>
      <Text style={styles.eventDay}>{new Date(date).getDate()}</Text>
      <Text style={styles.eventMonth}>
        {new Date(date).toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}
      </Text>
    </View>
    <View style={styles.eventContent}>
      <Text style={styles.eventName}>{title}</Text>
      <View style={styles.eventInfo}>
        <View style={styles.eventInfoItem}>
          <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.eventInfoText}>{time}</Text>
        </View>
        <View style={styles.eventInfoItem}>
          <Ionicons name="location-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.eventInfoText}>{location}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const versesOfTheDay = [
  {
    id: '1',
    text: 'Je puis tout par celui qui me fortifie.',
    reference: 'Philippiens 4:13',
  },
  {
    id: '2',
    text: 'L’Éternel est mon berger: je ne manquerai de rien.',
    reference: 'Psaume 23:1',
  },
];

const VerseOfTheDayCard = ({ text, reference, index }: { text: string; reference: string; index: number }) => (
  <View style={[
    styles.verseCard,
    { marginLeft: index === 0 ? 16 : 0 }
  ]}>
    <View style={styles.verseBadgeRow}>
      <View style={styles.verseBadge}>
        <Ionicons name="book" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
        <Text style={styles.verseBadgeText}>Verset du jour</Text>
      </View>
    </View>
    <View style={styles.verseIconRow}>
      <Ionicons name="chatbubble-ellipses-outline" size={30} color={theme.colors.secondary} style={styles.verseQuoteIcon} />
    </View>
    <Text style={styles.verseText}>{`“${text}”`}</Text>
    <View style={styles.verseRefRow}>
      <Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
      <Text style={styles.verseReference}>{reference}</Text>
    </View>
  </View>
);

const CrossPattern = () => (
  <View style={styles.crossPatternContainer}>
    <View style={styles.crossVertical} />
    <View style={styles.crossHorizontal} />
  </View>
);

const DecorativePatterns = () => (
  <>
    <View style={styles.decorativeTopRight} />
    <View style={styles.decorativeBottomLeft} />
    <View style={styles.decorativeCrossContainer}>
      <View style={styles.decorativeCrossVertical} />
      <View style={styles.decorativeCrossHorizontal} />
    </View>
  </>
);

const TestimonyCard = ({ author, content }: { author: string; content: string }) => (
  <View style={[styles.verseCard, styles.testimonyCard]}>
    <DecorativePatterns />
    <View style={styles.testimonyCardContent}>
      <View style={styles.verseBadgeRow}>
        <View style={[styles.verseBadge, styles.testimonyBadge]}>
          <Ionicons name="heart" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.verseBadgeText}>Témoignage</Text>
        </View>
      </View>

      <View style={styles.verseIconRow}>
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={30} 
          color={theme.colors.secondary} 
          style={styles.verseQuoteIcon} 
        />
      </View>

      <Text style={styles.verseText}>{`"${content}"`}</Text>

      <View style={styles.verseRefRow}>
        <Ionicons name="person-outline" size={18} color={theme.colors.primary} style={{ marginRight: 4 }} />
        <Text style={styles.verseReference}>{author}</Text>
      </View>
    </View>
  </View>
);

const MinimalPrayerAudioCard = ({ prayer, isPlaying, onPlayPause, progress, onSeekBackward, onSeekForward }: {
  prayer: any;
  isPlaying: boolean;
  onPlayPause: () => void;
  progress: number;
  onSeekBackward: () => void;
  onSeekForward: () => void;
}) => (
  <View style={styles.minimalPrayerCard}>
    <Text style={styles.minimalPrayerTitle}>{prayer.title || 'Prière publique'}</Text>
    <Text style={styles.minimalPrayerAuthor}>par {prayer.author || 'Anonyme'}</Text>
    {prayer.intentions && (
      <Text style={styles.minimalPrayerIntentions}>{prayer.intentions}</Text>
    )}
    <View style={styles.minimalAudioRow}>
      <TouchableOpacity
        onPress={onSeekBackward}
        style={[styles.minimalSeekBtn, { opacity: isPlaying ? 1 : 0.7 }]}
        disabled={!isPlaying}
      >
        <Ionicons name="play-back" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onPlayPause}
        style={[styles.minimalPlayPauseBtn, isPlaying ? styles.minimalPlayPauseBtnActive : null]}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={isPlaying ? '#fff' : theme.colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSeekForward}
        style={[styles.minimalSeekBtn, { opacity: isPlaying ? 1 : 0.7 }]}
        disabled={!isPlaying}
      >
        <Ionicons name="play-forward" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
      <View style={styles.minimalProgressBarContainer}>
        <View style={[styles.minimalProgressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [testimonies, setTestimonies] = useState<TestimonyType[]>([]);
  // Ajout de l'état pour les prières
  const [prayers, setPrayers] = useState<any[]>([]);
  // Ajout de l'état pour la gestion audio locale
  const [playingPrayerId, setPlayingPrayerId] = useState<string | null>(null);
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [id: string]: number }>({});
  const [latestPodcast, setLatestPodcast] = useState<any | null>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions?.({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snapshot = await getDocs(q);
        const eventsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChurchEvent[];
        setEvents(eventsList);
      } catch (e) {
        // fallback: use mock events if error
        setEvents([
          {
            id: '1',
            title: 'Culte Dominical',
            date: '2025-06-09',
            time: '10:00',
            location: 'Temple Principal',
          },
          {
            id: '2',
            title: 'Étude Biblique',
            date: '2025-06-11',
            time: '19:00',
            location: "Salle d'étude",
          },
          {
            id: '3',
            title: 'Soirée de Prière',
            date: '2025-06-13',
            time: '20:00',
            location: 'Chapelle',
          },
        ]);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        const q = query(
          collection(db, 'testimonies'),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const testimoniesList = snapshot.docs
          .map(doc => {
            const data = doc.data() as FirestoreData;
            return {
              id: doc.id,
              author: data.author || '',
              content: data.content || '',
              created_at: data.created_at,
              published: data.published,
              likes: data.likes
            };
          })
          .filter(testimony => testimony.published === true);
        setTestimonies(testimoniesList);
      } catch (error) {
        console.error('Error fetching testimonies:', error);
        // Fallback data
        setTestimonies([
          {
            id: '1',
            author: 'Marie L.',
            content: 'La prière m\'a apporté la paix dans les moments difficiles.',
            created_at: new Date().toISOString(),
            published: true,
          },
          {
            id: '2',
            author: 'Jean P.',
            content: 'Grâce à la communauté, j\'ai retrouvé ma foi et mon espérance.',
            created_at: new Date().toISOString(),
            published: true,
          }
        ]);
      }
    };

    fetchTestimonies();
  }, []);

  // Ajout du chargement des prières publiques
  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const q = query(
          collection(db, 'prayers'),
          orderBy('publishedAt', 'desc'),
          // On ne prend que les prières publiées et non adminOnly
          // (adminOnly peut être absent sur d'anciennes entrées, donc on filtre côté JS aussi)
        );
        const snapshot = await getDocs(q);
        const prayersList = snapshot.docs
          .map(doc => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              ...data,
              published: data.published ?? true,
              adminOnly: data.adminOnly ?? false,
            };
          })
          .filter(prayer => prayer.published === true && prayer.adminOnly === false)
          .slice(0, 2); // Ne garder que les 2 plus récentes
        setPrayers(prayersList);
      } catch (e) {
        setPrayers([]);
      }
    };
    fetchPrayers();
  }, []);

  // Ajout du chargement du dernier podcast
  useEffect(() => {
    const fetchLatestPodcast = async () => {
      try {
        const q = query(
          collection(db, 'podcasts'),
          orderBy('publishedAt', 'desc'),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setLatestPodcast({ id: doc.id, ...doc.data() });
        }
      } catch (e) {
        setLatestPodcast(null);
      }
    };
    fetchLatestPodcast();
  }, []);

  // Gestion de la lecture audio minimaliste
  const handlePlayPause = async (prayer: any) => {
    if (playingPrayerId === prayer.id) {
      if (soundObj) {
        const status = await soundObj.getStatusAsync();
        if ('isPlaying' in status && status.isPlaying) {
          await soundObj.pauseAsync();
        } else {
          await soundObj.playAsync();
        }
      }
      return;
    }
    // Arrêter l'audio précédent
    if (soundObj) {
      await soundObj.unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri: prayer.audioUrl },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.durationMillis) {
          setAudioProgress((prev) => ({
            ...prev,
            [prayer.id]: status.durationMillis ? status.positionMillis / status.durationMillis : 0,
          }));
        }
        if ('didJustFinish' in status && status.didJustFinish) {
          setPlayingPrayerId(null);
          setAudioProgress((prev) => ({ ...prev, [prayer.id]: 0 }));
        }
      }
    );
    setSoundObj(sound);
    setPlayingPrayerId(prayer.id);
  };

  // Ajout de la gestion du seek (avance/recul)
  const handleSeek = async (prayer: any, direction: 'backward' | 'forward') => {
    if (playingPrayerId === prayer.id && soundObj) {
      const status = await soundObj.getStatusAsync();
      if (status.isLoaded && status.positionMillis != null && status.durationMillis) {
        let newPosition = status.positionMillis + (direction === 'forward' ? 10000 : -10000);
        newPosition = Math.max(0, Math.min(newPosition, status.durationMillis));
        await soundObj.setPositionAsync(newPosition);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, [soundObj]);

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header} />
        <PodcastHeaderPlayer 
          podcast={latestPodcast ? {
            title: latestPodcast.title || 'Podcast du jour',
            audioUrl: latestPodcast.audioUrl,
            verseText: latestPodcast.verseText,
            verseReference: latestPodcast.verseReference,
            imageUrl: latestPodcast.imageUrl,
          } : {
            title: 'Podcast du jour',
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            verseText: 'Je puis tout par celui qui me fortifie.',
            verseReference: 'Philippiens 4:13',
            imageUrl: undefined,
          }}
        />
        <View style={styles.mainContent}>
          <View style={styles.exploreSection}>
            <View style={styles.exploreHeader}>
              <Text style={styles.exploreTitle}>Explorer</Text>
              <View style={styles.exploreLine} />
            </View>
            <View style={styles.featuresGrid}>
              <View style={styles.featuresRow}>
                <FeatureCard
                  title="Messages"
                  description="Écoutez les derniers messages"
                  icon="headset"
                  onPress={() => navigation.navigate('Podcasts' as never)}
                  accent
                />
                <FeatureCard
                  title="Bible"
                  description="Lisez et étudiez la Parole"
                  icon="book"
                  onPress={() => navigation.navigate('Bible' as never)}
                />
              </View>
              <View style={styles.featuresRow}>
                <FeatureCard
                  title="Témoignages"
                  description="Partagez vos expériences"
                  icon="heart"
                  onPress={() => navigation.navigate('Témoignages' as never)}
                />
                <FeatureCard
                  title="Prières"
                  description="Rejoignez-nous en prière"
                  icon="people"
                  onPress={() => navigation.navigate('Prières' as never)}
                  accent
                />
              </View>
            </View>
          </View>
          {/* Verset du jour section */}
          <View style={styles.verseSectionHeader}>
            <Text style={styles.verseSectionTitle}>Verset du jour</Text>
            <View style={styles.verseSectionLine} />
          </View>
          <View style={{ marginBottom: 28 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
              {versesOfTheDay.map((verse, i) => (
                <VerseOfTheDayCard key={verse.id} text={verse.text} reference={verse.reference} index={i} />
              ))}
            </ScrollView>
          </View>
          {/* Prochains Événements section */}
          <View style={styles.eventSectionHeader}>
            <Text style={styles.eventSectionTitle}>Prochains Événements</Text>
            <View style={styles.eventSectionLine} />
          </View>
          <View style={styles.eventSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {events.map(event => (
                <View key={event.id} style={styles.eventCardContainer}>
                  <EventCard {...event} />
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Section Témoignages */}
          <View style={styles.testimonySectionHeader}>
            <Text style={styles.testimonySectionTitle}>Témoignages récents</Text>
            <View style={styles.testimonySectionLine} />
          </View>
          
          <View style={styles.testimonySection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {testimonies.map((testimony) => (
                <TestimonyCard
                  key={testimony.id}
                  author={testimony.author}
                  content={testimony.content}
                />
              ))}
            </ScrollView>
          </View>
          {/* Section Prières publiques */}
          {/* Bloc à supprimer : affichage statique des prières publiques */}
          {/* Section Prières publiques - Lecteur minimaliste */}
          {prayers && prayers.length > 0 && (
            <View style={{ marginVertical: 16 }}>
              <View style={styles.eventSectionHeader}>
                <Text style={styles.eventSectionTitle}>Prières publiques</Text>
                <View style={styles.eventSectionLine} />
              </View>
              {prayers.slice(0, 2).map((prayer) => (
                <MinimalPrayerAudioCard
                  key={prayer.id}
                  prayer={prayer}
                  isPlaying={playingPrayerId === prayer.id}
                  onPlayPause={() => handlePlayPause(prayer)}
                  progress={audioProgress[prayer.id] || 0}
                  onSeekBackward={() => handleSeek(prayer, 'backward')}
                  onSeekForward={() => handleSeek(prayer, 'forward')}
                />
              ))}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.connectCard}>
          <View style={styles.connectIcon}>
            <Ionicons name="person-add-outline" size={24} color="#FFF" />
          </View>
          <View style={styles.connectContent}>
            <Text style={styles.connectTitle}>Rejoignez la communauté</Text>
            <Text style={styles.connectDescription}>Connectez-vous pour participer</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  decorativeCross: {
    position: 'absolute',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCrossSmall: {
    position: 'absolute',
    width: 20,
    height: 20,
    opacity: 0.15,
    zIndex: 1,
    transform: [{ rotate: '30deg' }],
  },
  decorativeCrossVerticalSmall: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: theme.colors.primary,
    marginLeft: -1,
    borderRadius: 1,
  },
  decorativeCrossHorizontalSmall: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.primary,
    marginTop: -1,
    borderRadius: 1,
  },
  decorativeCrossLarge: {
    position: 'absolute',
    width: 40,
    height: 40,
    opacity: 0.12,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  decorativeCrossVerticalLarge: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 4,
    height: '100%',
    backgroundColor: theme.colors.secondary,
    marginLeft: -2,
    borderRadius: 2,
  },
  decorativeCrossHorizontalLarge: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.secondary,
    marginTop: -2,
    borderRadius: 2,
  },
  decorativeCrossMedium: {
    position: 'absolute',
    width: 30,
    height: 30,
    opacity: 0.1,
    zIndex: 1,
    top: '50%',
    right: 30,
    transform: [{ rotate: '45deg' }],
  },
  decorativeCrossVerticalMedium: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 3,
    height: '100%',
    backgroundColor: theme.colors.primary,
    marginLeft: -1.5,
    borderRadius: 1.5,
  },
  decorativeCrossHorizontalMedium: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 3,
    backgroundColor: theme.colors.primary,
    marginTop: -1.5,
    borderRadius: 1.5,
  },
  decorativeBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}10`,
    borderRadius: 12,
    zIndex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    paddingTop: 32,
    alignItems: 'center',
    marginBottom: 0,
    position: 'relative',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  podcastHeaderContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  podcastHeaderCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  podcastContent: {
    padding: 20,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 1,
    opacity: 0.9,
    marginBottom: 16,
  },
  verseText: {
    fontSize: 19,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  verseReference: {
    fontSize: 15,
    color: theme.colors.primary,
    fontFamily: 'Roboto_500Medium',
    opacity: 0.85,
  },
  audioControls: {
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
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Roboto_400Regular',
    opacity: 0.8,
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  accentFeatureCard: {
    backgroundColor: theme.colors.primary,
  },
  yellowFeatureCard: {
    backgroundColor: '#FFD700',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  accentIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  yellowIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Roboto_500Medium',
    color: theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: theme.colors.text.secondary,
    textAlign: 'center',
    opacity: 0.8,
  },
  accentText: {
    color: '#FFF',
    opacity: 1,
  },
  eventSection: {
    marginTop: 32,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  eventTitle: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  eventImageContainer: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventCardContainer: {
    width: width - 32,
    marginRight: 16,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  eventDateBox: {
    backgroundColor: `${theme.colors.secondary}15`,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 24,
    color: theme.colors.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  eventMonth: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontFamily: 'Roboto_500Medium',
    marginTop: 4,
  },
  eventContent: {
    padding: 16,
  },
  eventName: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontFamily: 'Roboto_500Medium',
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventInfoText: {
    marginLeft: 6,
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
  },
  connectCard: {
    margin: 16,
    padding: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 24,
    elevation: 3,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  connectContent: {
    flex: 1,
  },
  connectTitle: {
    fontSize: 17,
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    marginBottom: 4,
  },
  connectDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Roboto_400Regular',
  },
  verseCard: {
    backgroundColor: '#f6f8ff',
    borderRadius: 22,
    minWidth: width * 0.75,
    maxWidth: width * 0.85,
    marginRight: 18,
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    overflow: 'hidden',
    padding: 22,
    marginVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  testimonyCard: {
    minWidth: width * 0.75,
    maxWidth: width * 0.85,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  testimonyCardContent: {
    position: 'relative',
    zIndex: 2,
  },
  testimonyBadge: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  decorativeTopRight: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}08`,
    transform: [{ rotate: '45deg' }],
  },
  decorativeBottomLeft: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.secondary}06`,
    transform: [{ rotate: '-15deg' }],
  },
  decorativeCrossContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    opacity: 0.1,
    zIndex: 1,
  },
  decorativeCrossVertical: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 4,
    height: '100%',
    backgroundColor: theme.colors.primary,
    marginLeft: -2,
    borderRadius: 2,
  },
  decorativeCrossHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.primary,
    marginTop: -2,
    borderRadius: 2,
  },
  crossPatternContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    opacity: 0.1,
    zIndex: 1,
  },
  crossVertical: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 4,
    height: '100%',
    backgroundColor: theme.colors.primary,
    marginLeft: -2,
    borderRadius: 2,
  },
  crossHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.primary,
    marginTop: -2,
    borderRadius: 2,
  },
  verseBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  verseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  verseBadgeText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  verseIconRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  verseQuoteIcon: {
    opacity: 0.22,
  },
  verseRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  verseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    marginTop: 18,
  },
  verseSectionTitle: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: `${theme.colors.secondary}15`,
    borderRadius: 20,
    overflow: 'hidden',
  },
  verseSectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${theme.colors.secondary}30`,
    marginLeft: 15,
  },
  eventSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    marginTop: 18,
  },
  eventSectionTitle: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: `${theme.colors.secondary}15`,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventSectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${theme.colors.secondary}30`,
    marginLeft: 15,
  },
  badgeContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  exploreSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  exploreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exploreTitle: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: `${theme.colors.secondary}15`,
    borderRadius: 20,
    overflow: 'hidden',
  },
  exploreLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${theme.colors.secondary}30`,
    marginLeft: 15,
  },
  featuresGrid: {
    gap: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  testimonySection: {
    marginVertical: 20,
  },
  testimonySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  testimonySectionTitle: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: 12,
    overflow: 'hidden',
  },
  testimonySectionLine: {
    flex: 1,
    height: 2,
    backgroundColor: `${theme.colors.primary}15`,
    marginLeft: 15,
  },
  minimalPrayerCard: {
    backgroundColor: '#fff',
    borderRadius: 18, // arrondi plus moderne
    padding: 22, // plus d'espace intérieur
    marginVertical: 14, // espace entre les cartes
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    minHeight: 120, // carte plus grande
    width: '100%',
    alignSelf: 'center',
  },
  minimalPrayerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 2,
    letterSpacing: 0.2,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  minimalPrayerAuthor: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    fontFamily: 'Roboto_500Medium',
  },
  minimalPrayerIntentions: {
    fontSize: 15,
    color: theme.colors.secondary,
    marginBottom: 10,
    fontStyle: 'italic',
    fontFamily: 'Roboto_400Regular',
  },
  minimalAudioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  minimalSeekBtn: {
    marginHorizontal: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '22',
  },
  minimalPlayPauseBtn: {
    marginHorizontal: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 24,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.primary + '22',
  },
  minimalPlayPauseBtnActive: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  minimalProgressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginLeft: 16,
  },
  minimalProgressBar: {
    height: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    color: theme.colors.text.primary,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 8,
    marginLeft: 8,
  },
});