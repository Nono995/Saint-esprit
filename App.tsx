import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import { Svg, Circle, Rect, Defs, LinearGradient, Stop, G, Path } from 'react-native-svg';

// Import Firebase config
import './config/firebaseConfig';

// Import Cloudinary config
import { cloudinaryConfig } from './config/cloudinaryConfig';

// Import screens
import HomeScreen from './screens/HomeScreen';
import PodcastScreen from './screens/PodcastScreen';
import TestimonyScreen from './screens/TestimonyScreen';
import BibleScreen from './screens/BibleScreen';
import PrayerScreen from './screens/PrayerScreen';

// Import theme
import { theme } from './theme';
import { app } from './config/firebaseConfig';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];
type TabBarIconProps = {
  focused: boolean;
  name: IoniconsName;
  label: string;
};

const TabBarIcon = ({ focused, name, label }: TabBarIconProps) => (
  <View style={[
    styles.tabIconContainer,
    focused && styles.tabIconContainerActive
  ]}>
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <Ionicons 
        name={name} 
        size={26}
        color={focused ? theme.colors.secondary : theme.colors.text.secondary} 
        style={styles.tabIcon}
      />
    </View>
    <Text style={[
      styles.tabLabel,
      focused && styles.tabLabelActive
    ]}>
      {label}
    </Text>
  </View>
);

const OnboardingScreen = ({ navigation: { setIsFirstLaunch } }: { navigation: { setIsFirstLaunch: (value: boolean) => void } }) => {
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  const pages = [
    {
      title: "Bienvenue dans\nnotre Communauté",
      subtitle: "Merci Saint Esprit",
      image: require('./assets/church-header.png'),
      description: "Rejoignez une communauté vibrante de croyants unis dans la foi et l'amour du Christ.",
    },
    {
      title: "Prière et\nPartage",
      subtitle: "Unis en Christ",
      image: require('./assets/church-header.png'),
      description: "Partagez vos témoignages, vos prières et encouragez-vous mutuellement dans votre marche spirituelle.",
    },
    {
      title: "Découvrir les Podcasts",
      subtitle: "Messages inspirants",
      image: require('./assets/church-header.png'),
      description: "Écoutez des enseignements et des messages pour nourrir votre foi chaque semaine.",
    },
    {
      title: "Favoris et Prières",
      subtitle: "Votre espace personnel",
      image: require('./assets/church-header.png'),
      description: "Ajoutez des versets, des podcasts ou des prières à vos favoris pour les retrouver facilement.",
    }
  ];

  const handleFinish = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    setIsFirstLaunch(false);
  };

  return (
    <View style={onboardingStyles.container}>
      {/* Motifs décoratifs SVG en fond, avec croix */}
      <Svg
        height="100%"
        width="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <Defs>
          <LinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FF914D" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#5F4B8B" stopOpacity="0.12" />
          </LinearGradient>
        </Defs>
        <Circle cx="80" cy="80" r="80" fill="url(#grad1)" />
        <Circle cx="90%" cy="20%" r="60" fill="#5F4B8B22" />
        <Rect x="-40" y="60%" width="180" height="180" rx="90" fill="#FF914D22" />
        <Circle cx="85%" cy="90%" r="100" fill="#5F4B8B11" />
        {/* Croix décoratives existantes */}
        <G opacity="0.18">
          <Path d="M 30 200 L 30 240 M 10 220 L 50 220" stroke="#5F4B8B" strokeWidth="6" strokeLinecap="round" />
        </G>
        <G opacity="0.13">
          <Path d="M 320 60 L 320 100 M 300 80 L 340 80" stroke="#FF914D" strokeWidth="8" strokeLinecap="round" />
        </G>
        <G opacity="0.10">
          <Path d="M 200 600 L 200 650 M 180 625 L 220 625" stroke="#5F4B8B" strokeWidth="10" strokeLinecap="round" />
        </G>
        {/* Nouvelles croix décoratives */}
        <G opacity="0.12">
          <Path d="M 60 60 L 60 100 M 40 80 L 80 80" stroke="#FF914D" strokeWidth="5" strokeLinecap="round" />
        </G>
        <G opacity="0.10">
          <Path d="M 350 700 L 350 740 M 330 720 L 370 720" stroke="#5F4B8B" strokeWidth="7" strokeLinecap="round" />
        </G>
        <G opacity="0.15">
          <Path d="M 100 500 L 100 540 M 80 520 L 120 520" stroke="#FFF" strokeWidth="6" strokeLinecap="round" />
        </G>
        <G opacity="0.09">
          <Path d="M 280 300 L 280 340 M 260 320 L 300 320" stroke="#FF914D" strokeWidth="8" strokeLinecap="round" />
        </G>
        <G opacity="0.13">
          <Path d="M 60 650 L 60 690 M 40 670 L 80 670" stroke="#5F4B8B" strokeWidth="7" strokeLinecap="round" />
        </G>
        <G opacity="0.11">
          <Path d="M 370 180 L 370 220 M 350 200 L 390 200" stroke="#FFF" strokeWidth="5" strokeLinecap="round" />
        </G>
        <G opacity="0.10">
          <Path d="M 200 100 L 200 140 M 180 120 L 220 120" stroke="#FF914D" strokeWidth="6" strokeLinecap="round" />
        </G>
        <G opacity="0.08">
          <Path d="M 120 300 L 120 340 M 100 320 L 140 320" stroke="#5F4B8B" strokeWidth="8" strokeLinecap="round" />
        </G>
        <G opacity="0.12">
          <Path d="M 320 500 L 320 540 M 300 520 L 340 520" stroke="#FF914D" strokeWidth="7" strokeLinecap="round" />
        </G>
        <G opacity="0.09">
          <Path d="M 250 200 L 250 240 M 230 220 L 270 220" stroke="#FFF" strokeWidth="6" strokeLinecap="round" />
        </G>
      </Svg>
      <StatusBar style="light" />
      <View style={onboardingStyles.page}>
        <Animated.View style={[onboardingStyles.content, { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>  
          <View style={onboardingStyles.content}>
            <Text style={onboardingStyles.subtitle}>{pages[currentPage].subtitle}</Text>
            <Text style={onboardingStyles.title}>{pages[currentPage].title}</Text>
            <Text style={onboardingStyles.description}>{pages[currentPage].description}</Text>
          </View>
        </Animated.View>
        <View style={onboardingStyles.footer}>
          <View style={onboardingStyles.pagination}>
            {pages.map((_, index: number) => (
              <View
                // @ts-ignore
                key={index}
                style={[
                  onboardingStyles.paginationDot,
                  currentPage === index && onboardingStyles.paginationDotActive
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={onboardingStyles.button}
            onPress={() => {
              if (currentPage < pages.length - 1) {
                setCurrentPage((prev: number) => prev + 1);
              } else {
                handleFinish();
              }
            }}
          >
            <Text style={onboardingStyles.buttonText}>
              {currentPage < pages.length - 1 ? "Suivant" : "Commencer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const MainApp = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: any }) => ({
      headerStyle: {
        backgroundColor: theme.colors.primary,
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTintColor: theme.colors.white,
      headerTitleStyle: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 20,
      },
      tabBarIcon: ({ focused }: { focused: boolean }) => {
        let iconName: IoniconsName;
        let label = route.name;

        switch (route.name) {
          case 'Accueil':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Podcasts':
            iconName = focused ? 'headset' : 'headset-outline';
            label = 'Podcasts';
            break;
          case 'Témoignages':
            iconName = focused ? 'heart' : 'heart-outline';
            break;
          case 'Bible':
            iconName = focused ? 'book' : 'book-outline';
            break;
          case 'Prières':
            iconName = focused ? 'people' : 'people-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <TabBarIcon focused={focused} name={iconName} label={label} />;
      },
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        height: 65,
        paddingBottom: 8,
        paddingTop: 8,
      },
    })}
  >
    <Tab.Screen 
      name="Accueil" 
      component={HomeScreen}
      options={{
        title: 'Accueil',
      }}
    />
    <Tab.Screen 
      name="Podcasts" 
      component={PodcastScreen}
      options={{
        title: 'Messages',
      }}
    />
    <Tab.Screen 
      name="Témoignages" 
      component={TestimonyScreen}
      options={{
        title: 'Témoignages',
      }}
    />
    <Tab.Screen 
      name="Bible" 
      component={BibleScreen}
      options={{
        title: 'Bible',
      }}
    />
    <Tab.Screen 
      name="Prières" 
      component={PrayerScreen}
      options={{
        title: 'Prières',
      }}
    />
  </Tab.Navigator>
);

const OnboardingStack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
  });
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean>(true); // Toujours true
  const [debugKey, setDebugKey] = React.useState<string | null>(null);

  // On ne vérifie plus AsyncStorage, on affiche toujours l'onboarding
  // React.useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     try {
  //       const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
  //       setDebugKey(hasSeenOnboarding);
  //       setIsFirstLaunch(hasSeenOnboarding === null);
  //       console.log('Valeur AsyncStorage hasSeenOnboarding:', hasSeenOnboarding);
  //     } catch (e) {
  //       setIsFirstLaunch(true);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);

  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  if (!fontsLoaded || isFirstLaunch === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {isFirstLaunch ? (
          <OnboardingScreen navigation={{ setIsFirstLaunch }} />
        ) : (
          <MainApp />
        )}
      </View>
    </NavigationContainer>
  );
}

const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  page: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 18, // augmenté
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  title: {
    color: theme.colors.white,
    fontSize: 27, // augmenté
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34, // augmenté
    letterSpacing: 0.3,
    fontWeight: '700',
  },
  description: {
    color: theme.colors.white,
    fontSize: 16, // augmenté
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    lineHeight: 22, // augmenté
    opacity: 0.9,
    maxWidth: '92%',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  footer: {
    padding: 18,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.white,
    opacity: 0.25,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    opacity: 1,
    backgroundColor: theme.colors.secondary,
  },
  button: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 14, // augmenté
    paddingHorizontal: 30, // augmenté
    borderRadius: 26, // légèrement augmenté
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18, // augmenté
    fontFamily: 'Roboto_500Medium',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20, // diminue la marge haute
    paddingBottom: 40, // réduit la marge basse
    width: 70,
  },
  tabIconContainerActive: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 16,
    paddingVertical: 2, // réduit la hauteur du fond actif
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: -8, // remonte l'icône
  },
  iconWrapperActive: {
    backgroundColor: `${theme.colors.secondary}10`,
    elevation: 10,
    shadowColor: theme.colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  tabIcon: {
    marginBottom: 0, // supprime l'espace sous l'icône
  },
  tabLabel: {
    color: theme.colors.text.secondary,
    fontSize: 11,
    fontFamily: 'Roboto_400Regular',
    marginTop: 0, // rapproche le texte de l'icône
    opacity: 0.8,
  },
  tabLabelActive: {
    color: theme.colors.secondary,
    fontFamily: 'Roboto_500Medium',
    opacity: 1,
  },
});
