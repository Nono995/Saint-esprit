import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

const FAVORITE_VERSES_STORAGE_KEY = '@bible-app:favorite-verses';

const books = [
  'Genèse', 'Exode', 'Lévitique', 'Nombres', 'Deutéronome', 'Josué', 'Juges', 'Ruth', '1 Samuel', '2 Samuel', '1 Rois', '2 Rois', '1 Chroniques', '2 Chroniques', 'Esdras', 'Néhémie', 'Esther', 'Job', 'Psaumes', 'Proverbes', 'Ecclésiaste', 'Cantique des Cantiques', 'Ésaïe', 'Jérémie', 'Lamentations', 'Ézéchiel', 'Daniel', 'Osée', 'Joël', 'Amos', 'Abdias', 'Jonas', 'Michée', 'Nahum', 'Habacuc', 'Sophonie', 'Aggée', 'Zacharie', 'Malachie', 'Matthieu', 'Marc', 'Luc', 'Jean', 'Actes', 'Romains', '1 Corinthiens', '2 Corinthiens', 'Galates', 'Éphésiens', 'Philippiens', 'Colossiens', '1 Thessaloniciens', '2 Thessaloniciens', '1 Timothée', '2 Timothée', 'Tite', 'Philémon', 'Hébreux', 'Jacques', '1 Pierre', '2 Pierre', '1 Jean', '2 Jean', '3 Jean', 'Jude', 'Apocalypse'
];

// Correction : certains livres de la Bible-API ont un nom de chapitre différent (ex : "Psaumes" → "Psaume").
// On adapte la détection du nombre de chapitres pour chaque livre :
const chaptersPerBook: Record<string, number> = {
  'Genèse': 50, 'Exode': 40, 'Lévitique': 27, 'Nombres': 36, 'Deutéronome': 34, 'Josué': 24, 'Juges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24, '1 Rois': 22, '2 Rois': 25, '1 Chroniques': 29, '2 Chroniques': 36, 'Esdras': 10, 'Néhémie': 13, 'Esther': 10, 'Job': 42, 'Psaumes': 150, 'Proverbes': 31, 'Ecclésiaste': 12, 'Cantique des Cantiques': 8, 'Ésaïe': 66, 'Jérémie': 52, 'Lamentations': 5, 'Ézéchiel': 48, 'Daniel': 12, 'Osée': 14, 'Joël': 3, 'Amos': 9, 'Abdias': 1, 'Jonas': 4, 'Michée': 7, 'Nahum': 3, 'Habacuc': 3, 'Sophonie': 3, 'Aggée': 2, 'Zacharie': 14, 'Malachie': 4, 'Matthieu': 28, 'Marc': 16, 'Luc': 24, 'Jean': 21, 'Actes': 28, 'Romains': 16, '1 Corinthiens': 16, '2 Corinthiens': 13, 'Galates': 6, 'Éphésiens': 6, 'Philippiens': 4, 'Colossiens': 4, '1 Thessaloniciens': 5, '2 Thessaloniciens': 3, '1 Timothée': 6, '2 Timothée': 4, 'Tite': 3, 'Philémon': 1, 'Hébreux': 13, 'Jacques': 5, '1 Pierre': 5, '2 Pierre': 3, '1 Jean': 5, '2 Jean': 1, '3 Jean': 1, 'Jude': 1, 'Apocalypse': 22
};

// Correspondance noms français -> noms API
const bookApiNames: Record<string, string> = {
  'Genèse': 'Genesis',
  'Exode': 'Exodus',
  'Lévitique': 'Leviticus',
  'Nombres': 'Numbers',
  'Deutéronome': 'Deuteronomy',
  'Josué': 'Joshua',
  'Juges': 'Judges',
  'Ruth': 'Ruth',
  '1 Samuel': '1 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Rois': '1 Kings',
  '2 Rois': '2 Kings',
  '1 Chroniques': '1 Chronicles',
  '2 Chroniques': '2 Chronicles',
  'Esdras': 'Ezra',
  'Néhémie': 'Nehemiah',
  'Esther': 'Esther',
  'Job': 'Job',
  'Psaumes': 'Psalms',
  'Proverbes': 'Proverbs',
  'Ecclésiaste': 'Ecclesiastes',
  'Cantique des Cantiques': 'Song of Solomon',
  'Ésaïe': 'Isaiah',
  'Jérémie': 'Jeremiah',
  'Lamentations': 'Lamentations',
  'Ézéchiel': 'Ezekiel',
  'Daniel': 'Daniel',
  'Osée': 'Hosea',
  'Joël': 'Joel',
  'Amos': 'Amos',
  'Abdias': 'Obadiah',
  'Jonas': 'Jonah',
  'Michée': 'Micah',
  'Nahum': 'Nahum',
  'Habacuc': 'Habakkuk',
  'Sophonie': 'Zephaniah',
  'Aggée': 'Haggai',
  'Zacharie': 'Zechariah',
  'Malachie': 'Malachi',
  'Matthieu': 'Matthew',
  'Marc': 'Mark',
  'Luc': 'Luke',
  'Jean': 'John',
  'Actes': 'Acts',
  'Romains': 'Romans',
  '1 Corinthiens': '1 Corinthians',
  '2 Corinthiens': '2 Corinthians',
  'Galates': 'Galatians',
  'Éphésiens': 'Ephesians',
  'Philippiens': 'Philippians',
  'Colossiens': 'Colossians',
  '1 Thessaloniciens': '1 Thessalonians',
  '2 Thessaloniciens': '2 Thessalonians',
  '1 Timothée': '1 Timothy',
  '2 Timothée': '2 Timothy',
  'Tite': 'Titus',
  'Philémon': 'Philemon',
  'Hébreux': 'Hebrews',
  'Jacques': 'James',
  '1 Pierre': '1 Peter',
  '2 Pierre': '2 Peter',
  '1 Jean': '1 John',
  '2 Jean': '2 John',
  '3 Jean': '3 John',
  'Jude': 'Jude',
  'Apocalypse': 'Revelation'
};

// Fonction utilitaire pour obtenir le nombre de chapitres d'un livre, en gérant les accents et espaces
const getChaptersCount = (book: string) => {
  // Correction : bonne regex unicode pour retirer les accents
  const normalized = book
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire accents
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return chaptersPerBook[book] || chaptersPerBook[normalized] || 0;
};

export default function BibleScreen() {
  const [selectedBook, setSelectedBook] = useState(books[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [verses, setVerses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteVerses, setFavoriteVerses] = useState<Set<string>>(new Set());

  const versesCache = React.useRef<Record<string, string[]>>({});

  // Fonction pour sauvegarder les favoris
  const saveFavorites = async (favorites: Set<string>) => {
    try {
      await AsyncStorage.setItem(
        FAVORITE_VERSES_STORAGE_KEY,
        JSON.stringify(Array.from(favorites))
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  };

  // Fonction pour charger les favoris
  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(FAVORITE_VERSES_STORAGE_KEY);
      if (savedFavorites) {
        setFavoriteVerses(new Set(JSON.parse(savedFavorites)));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  // Charger les favoris au démarrage
  useEffect(() => {
    loadFavorites();
  }, []);

  // Sauvegarder les favoris à chaque changement
  useEffect(() => {
    saveFavorites(favoriteVerses);
  }, [favoriteVerses]);

  // Fonction pour ajouter/retirer un verset des favoris
  const toggleFavoriteVerse = useCallback((verseIndex: number) => {
    const verseKey = `${selectedBook}-${selectedChapter}-${verseIndex + 1}`;
    setFavoriteVerses(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(verseKey)) {
        newFavorites.delete(verseKey);
      } else {
        newFavorites.add(verseKey);
      }
      return newFavorites;
    });
  }, [selectedBook, selectedChapter]);

  // Fonction fetchChapter pour bible-api.com (anglais, CORS OK)
  const fetchChapter = useCallback(async (book: string, chapter: number) => {
    setLoading(true);
    setError(null);
    setVerses([]);
    try {
      const bookApiNames: Record<string, string> = {
        'Genèse': 'Genesis', 'Exode': 'Exodus', 'Lévitique': 'Leviticus', 'Nombres': 'Numbers', 'Deutéronome': 'Deuteronomy',
        'Josué': 'Joshua', 'Juges': 'Judges', 'Ruth': 'Ruth', '1 Samuel': '1 Samuel', '2 Samuel': '2 Samuel',
        '1 Rois': '1 Kings', '2 Rois': '2 Kings', '1 Chroniques': '1 Chronicles', '2 Chroniques': '2 Chronicles',
        'Esdras': 'Ezra', 'Néhémie': 'Nehemiah', 'Esther': 'Esther', 'Job': 'Job', 'Psaumes': 'Psalms',
        'Proverbes': 'Proverbs', 'Ecclésiaste': 'Ecclesiastes', 'Cantique des Cantiques': 'Song of Solomon',
        'Ésaïe': 'Isaiah', 'Jérémie': 'Jeremiah', 'Lamentations': 'Lamentations', 'Ézéchiel': 'Ezekiel',
        'Daniel': 'Daniel', 'Osée': 'Hosea', 'Joël': 'Joel', 'Amos': 'Amos', 'Abdias': 'Obadiah',
        'Jonas': 'Jonah', 'Michée': 'Micah', 'Nahum': 'Nahum', 'Habacuc': 'Habakkuk', 'Sophonie': 'Zephaniah',
        'Aggée': 'Haggai', 'Zacharie': 'Zechariah', 'Malachie': 'Malachi',
        'Matthieu': 'Matthew', 'Marc': 'Mark', 'Luc': 'Luke', 'Jean': 'John', 'Actes': 'Acts',
        'Romains': 'Romans', '1 Corinthiens': '1 Corinthians', '2 Corinthiens': '2 Corinthians',
        'Galates': 'Galatians', 'Éphésiens': 'Ephesians', 'Philippiens': 'Philippians', 'Colossiens': 'Colossians',
        '1 Thessaloniciens': '1 Thessalonians', '2 Thessaloniciens': '2 Thessalonians',
        '1 Timothée': '1 Timothy', '2 Timothée': '2 Timothy', 'Tite': 'Titus', 'Philémon': 'Philemon',
        'Hébreux': 'Hebrews', 'Jacques': 'James', '1 Pierre': '1 Peter', '2 Pierre': '2 Peter',
        '1 Jean': '1 John', '2 Jean': '2 John', '3 Jean': '3 John', 'Jude': 'Jude', 'Apocalypse': 'Revelation'
      };
      const apiBook = bookApiNames[book] || book;
      const ref = encodeURIComponent(`${apiBook} ${chapter}`);
      const res = await fetch(`https://bible-api.com/${ref}`);
      const data = await res.json();
      if (data.verses) {
        setVerses(data.verses.map((v: any) => v.text.trim()));
      } else {
        setVerses(["Erreur de chargement ou chapitre non disponible."]);
      }
    } catch {
      setError("Erreur de connexion à l'API Bible.");
      setVerses([]);
    }
    setLoading(false);
  }, []);

  // Charger le chapitre seulement quand les modales sont fermées
  React.useEffect(() => {
    if (!showBookModal && !showChapterModal) {
      fetchChapter(selectedBook, selectedChapter);
    }
  }, [selectedBook, selectedChapter, showBookModal, showChapterModal, fetchChapter]);

  const handleBookSelect = useCallback((book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setShowBookModal(false);
  }, []);

  const handleChapterSelect = useCallback((chapter: number) => {
    setSelectedChapter(chapter);
    setShowChapterModal(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => setShowBookModal(true)} 
          style={styles.selectorButton}
        >
          <Text style={styles.selectorButtonText}>{selectedBook}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity 
          onPress={() => setShowChapterModal(true)} 
          style={styles.selectorButton}
        >
          <Text style={styles.selectorButtonText}>Chapitre {selectedChapter}</Text>
          <Ionicons name="chevron-down" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => fetchChapter(selectedBook, selectedChapter)}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.versesContainer}>
            {verses.map((verse, idx) => {
              const verseKey = `${selectedBook}-${selectedChapter}-${idx + 1}`;
              const isFavorite = favoriteVerses.has(verseKey);
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.verseContainer,
                    isFavorite && {
                      backgroundColor: 'rgba(255, 165, 0, 0.1)',
                      borderRadius: 8,
                      padding: 8,
                      marginVertical: 4,
                    }
                  ]}
                  onPress={() => toggleFavoriteVerse(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.verseNumber,
                    isFavorite && { color: '#FF69B4' }
                  ]}>{idx + 1}</Text>
                  <Text style={[
                    styles.verseText,
                    isFavorite && { color: '#FF69B4' }
                  ]}>{verse}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Modal sélection livre */}
      <Modal
        visible={showBookModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un livre</Text>
              <TouchableOpacity 
                onPress={() => setShowBookModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={books}
              keyExtractor={item => item}
              numColumns={3}
              contentContainerStyle={styles.gridContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleBookSelect(item)}
                  style={[
                    styles.gridItem,
                    selectedBook === item && styles.selectedGridItem
                  ]}
                >
                  <Text 
                    style={[
                      styles.gridItemText,
                      selectedBook === item && styles.selectedGridItemText
                    ]}
                    numberOfLines={2}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal sélection chapitre */}
      <Modal
        visible={showChapterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChapterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un chapitre</Text>
              <TouchableOpacity 
                onPress={() => setShowChapterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {getChaptersCount(selectedBook) > 0 ? (
              <FlatList
                data={Array.from({ length: getChaptersCount(selectedBook) }, (_, i) => i + 1)}
                keyExtractor={item => item.toString()}
                numColumns={4}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleChapterSelect(item)}
                    style={[
                      styles.chapterItem,
                      selectedChapter === item && styles.selectedChapterItem
                    ]}
                  >
                    <Text 
                      style={[
                        styles.chapterItemText,
                        selectedChapter === item && styles.selectedChapterItemText
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.errorText}>Aucun chapitre disponible</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  selectorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginRight: 8,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  versesContainer: {
    padding: 20,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  verseNumber: {
    width: 30,
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  gridContainer: {
    padding: 16,
  },
  gridItem: {
    flex: 1,
    margin: 6,
    aspectRatio: 1.2,
    borderRadius: 16,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedGridItem: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  gridItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  selectedGridItemText: {
    color: theme.colors.white,
  },
  chapterItem: {
    margin: 6,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedChapterItem: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
  },
  chapterItemText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  selectedChapterItemText: {
    color: theme.colors.white,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  favoriteVerseContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }
});