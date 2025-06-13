import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Image,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { db } from '../config/firebaseConfig';
import { collection, getDocs, orderBy, query, doc, updateDoc, increment } from 'firebase/firestore';
import * as Linking from 'expo-linking';

type Testimony = {
  id: string;
  author: string;
  content: string;
  date: string;
  likes: number;
  category?: string;
  publishedAt: any;
  avatar?: string;
};

const categories = [
  { id: 'guerison', name: 'Guérison', icon: 'medkit' },
  { id: 'provision', name: 'Provision', icon: 'gift' },
  { id: 'protection', name: 'Protection', icon: 'shield-checkmark' },
  { id: 'famille', name: 'Famille', icon: 'people' },
  { id: 'autre', name: 'Autre', icon: 'heart' },
] as const;

const TestimonyCard = ({ testimony, onLike, onShare, liked }: { testimony: Testimony, onLike: () => void, onShare: () => void, liked: boolean }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const likeAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotateAnim]);

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
  };

  const handleLike = () => {
    animatePress();
    animateLike();
    onLike();
  };

  const category = categories.find(c => c.id === testimony.category) || categories[4];
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View 
      style={[
        styles.testimonyCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {/* Motif de croix jaune sous la carte */}
      <View style={styles.crossMotifContainer} pointerEvents="none">
        <View style={styles.crossMotif} />
        <View style={[styles.crossMotif, { transform: [{ rotate: '90deg' }] }]} />
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            {testimony.avatar ? (
              <Image 
                source={{ uri: testimony.avatar }} 
                style={styles.avatarImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={styles.defaultAvatarContainer}>
                <Ionicons name="person" size={24} color={theme.colors.primary} />
              </View>
            )}
          </View>
          <View>
            <Text style={styles.authorName}>{testimony.author}</Text>
            <Text style={styles.date}>{testimony.date}</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Ionicons name={category.icon as any} size={16} color={theme.colors.white} />
          <Text style={styles.categoryText}>{category.name}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.content}>{testimony.content}</Text>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            liked && styles.actionButtonLiked
          ]} 
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Animated.View style={{
            transform: [{ scale: likeAnim }],
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#FFF" : theme.colors.primary} 
              style={styles.actionIcon}
            />
            <Text style={[
              styles.actionText,
              liked && styles.actionTextLiked
            ]}>{testimony.likes || 0} J'aime</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onShare}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="share-social-outline" 
            size={24} 
            color={theme.colors.primary} 
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const AnimatedHeader = () => {
  const scrollY = React.useRef(new Animated.Value(0)).current;

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
        <Text style={styles.headerTitle}>Témoignages</Text>
        <Text style={styles.headerSubtitle}>Partagez ce que Dieu fait dans votre vie</Text>
      </View>
    </Animated.View>
  );
};

interface CategoryListProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ selectedCategory, onSelect }) => {
  return (
    <View style={styles.luxuryCategoryBarWrapper}>
      <View style={styles.luxuryCategoryBarGradient} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.luxuryCategoryBarContent}
      >
        <TouchableOpacity
          style={[
            styles.luxuryCategoryPill,
            !selectedCategory && styles.luxuryCategoryPillSelected
          ]}
          onPress={() => onSelect('')}
          activeOpacity={0.85}
        >
          {!selectedCategory && (
            <Animated.View style={styles.luxuryCrossAnimated}>
              <View style={styles.luxuryCross} />
              <View style={[styles.luxuryCross, { transform: [{ rotate: '90deg' }] }]} />
            </Animated.View>
          )}
          <Ionicons name="grid-outline" size={18} color={!selectedCategory ? '#FFD600' : '#B0B0B0'} />
          <Text style={[
            styles.luxuryCategoryPillText,
            !selectedCategory && styles.luxuryCategoryPillTextSelected
          ]}>Tous</Text>
        </TouchableOpacity>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.luxuryCategoryPill,
                isSelected && styles.luxuryCategoryPillSelected
              ]}
              onPress={() => onSelect(category.id)}
              activeOpacity={0.85}
            >
              {isSelected && (
                <Animated.View style={styles.luxuryCrossAnimated}>
                  <View style={styles.luxuryCross} />
                  <View style={[styles.luxuryCross, { transform: [{ rotate: '90deg' }] }]} />
                </Animated.View>
              )}
              <Ionicons 
                name={category.icon} 
                size={18} 
                color={isSelected ? '#FFD600' : '#B0B0B0'} 
              />
              <Text style={[
                styles.luxuryCategoryPillText,
                isSelected && styles.luxuryCategoryPillTextSelected
              ]}>{category.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function TestimonyScreen() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchTestimonies = async () => {
      const q = query(collection(db, 'testimonies'), orderBy('publishedAt', 'desc'));
      const snapshot = await getDocs(q);
      setTestimonies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimony)));
    };
    fetchTestimonies();
  }, []);

  const filteredTestimonies = selectedCategory
    ? testimonies.filter(t => t.category === selectedCategory)
    : testimonies;


  const handleLike = async (id: string) => {
    if (likedIds.includes(id)) return;
    
    await updateDoc(doc(db, 'testimonies', id), { likes: increment(1) });
    setTestimonies(testimonies => 
      testimonies.map(t => t.id === id ? { ...t, likes: (t.likes || 0) + 1 } : t)
    );
    setLikedIds(ids => [...ids, id]);
  };

  const handleShare = (testimony: Testimony) => {
    const message = `Témoignage de ${testimony.author}\n\n${testimony.content}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  const renderTestimony = ({ item }: { item: Testimony }) => (
    <TestimonyCard 
      testimony={item} 
      onLike={() => handleLike(item.id)} 
      onShare={() => handleShare(item)} 
      liked={likedIds.includes(item.id)}
    />
  );
  const ListHeader = () => (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipSelected
          ]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[
            styles.categoryChipText,
            !selectedCategory && styles.categoryChipTextSelected
          ]}>Tous</Text>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipSelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={selectedCategory === category.id ? theme.colors.white : theme.colors.primary}
              style={styles.categoryChipIcon}
            />
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.id && styles.categoryChipTextSelected
            ]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  return (
    <View style={styles.container}>
      <AnimatedHeader />
      <CategoryList selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
      <FlatList
        data={filteredTestimonies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TestimonyCard
            testimony={item}
            onLike={() => handleLike(item.id)}
            onShare={() => handleShare(item)}
            liked={likedIds.includes(item.id)}
          />
        )
        }
        contentContainerStyle={styles.testimoniesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="heart-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyStateText}>Aucun témoignage pour le moment</Text>
            <Text style={styles.emptyStateSubtext}>Revenez bientôt pour découvrir les témoignages de la communauté</Text>
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
  },  header: {
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
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  crossPattern: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
    opacity: 0.2,
  },
  cross: {
    position: 'absolute',
    width: 60,
    height: 4,
    backgroundColor: theme.colors.white,
    top: '50%',
    marginTop: -2,
  },
  luxuryCategoryBarWrapper: {
    position: 'relative',
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'visible',
    minHeight: 64,
  },
  luxuryCategoryBarGradient: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 0,
    backgroundColor: 'transparent',
    // Simule un dégradé blanc -> jaune
    // Utilisez expo-linear-gradient pour un vrai dégradé si possible
    borderBottomWidth: 2,
    borderBottomColor: '#FFD60033',
  },
  luxuryCategoryBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 10,
    zIndex: 1,
  },
  luxuryCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,214,0,0.12)',
    minWidth: 90,
    justifyContent: 'center',
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 2,
    backdropFilter: 'blur(8px)', // Pour web, sinon ignorer
  },
  luxuryCategoryPillSelected: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderColor: '#FFD600',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  luxuryCategoryPillText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#B0B0B0',
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(255,214,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  luxuryCategoryPillTextSelected: {
    color: '#FFD600',
    textShadowColor: 'rgba(255,214,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  luxuryCrossAnimated: {
    marginRight: 6,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luxuryCross: {
    position: 'absolute',
    width: 14,
    height: 3,
    backgroundColor: '#FFD600',
    borderRadius: 2,
    top: 6.5,
    left: 1,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    margin: 16,
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
  },
  testimoniesList: {
    padding: 16,
    gap: 16,
  },  testimonyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}15`,
  },
  // Motif de croix jaune sous la carte
  crossMotifContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: 'center',
    zIndex: 0,
    height: 36,
    justifyContent: 'center',
  },
  crossMotif: {
    position: 'absolute',
    width: 32,
    height: 6,
    backgroundColor: '#FFD600', // Jaune vif
    borderRadius: 3,
    top: 15,
    left: '50%',
    marginLeft: -16,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: `${theme.colors.primary}20`,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 24,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    opacity: 0.8,
  },  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryText: {
    color: theme.colors.white,
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    marginVertical: 16,
    position: 'relative',
    zIndex: 1,
    backgroundColor: `${theme.colors.white}80`,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}10`,
  },
  content: {
    fontSize: 16,
    lineHeight: 26,
    color: theme.colors.text.primary,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.primary}15`,
    paddingTop: 16,
    position: 'relative',
    zIndex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}08`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}15`,
    elevation: 1,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonLiked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  actionTextLiked: {
    color: theme.colors.white,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.primary}20`,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  modalCategories: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 8,
    fontFamily: 'Roboto_500Medium',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryButton: {
    flex: 1,
    minWidth: '48%',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Roboto_500Medium',
  },
  categoryButtonTextSelected: {
    color: theme.colors.white,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    height: 150,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: `${theme.colors.primary}20`,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: theme.colors.background,
  },
  cancelButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.white,
    opacity: 0.4,
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
    backgroundColor: theme.colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  diagonalPattern: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 200,
    height: 200,
    backgroundColor: `${theme.colors.primary}05`,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 40,
  },
  circlePattern: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.primary}03`,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipIcon: {
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Roboto_500Medium',
  },
  categoryChipTextSelected: {
    color: theme.colors.white,
  },
});