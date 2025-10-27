import { useDarkMode } from '@/contexts/DarkModeContext';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'map' | 'tasks' | 'accounting' | 'settings';
  ignoreTopSafeArea?: boolean;
}

export default function Layout({ children, activeTab, ignoreTopSafeArea = false }: LayoutProps) {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location access denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        // Format: "Suburb, City" (e.g., "Hurstville, Sydney")
        const suburb = address.city || address.subregion || '';
        const city = address.region || '';
        setLocation(`${suburb}${city ? ', ' + city : ''}`);
      }
    })();
  }, []);

  // Get footer background image based on active tab
  const getFooterBackground = () => {
    switch (activeTab) {
      case 'dashboard':
        return require('@/assets/images/sand2-background.png');
      case 'map':
        return require('@/assets/images/sand2-background.png');
      case 'tasks':
        return require('@/assets/images/sand2-background.png');
      case 'accounting':
        return require('@/assets/images/sand2-background.png');
      case 'settings':
        return require('@/assets/images/sand2-background.png');
      default:
        return require('@/assets/images/sand2-background.png');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={ignoreTopSafeArea ? [] : ['top']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Date Display in top left corner */}
      <View style={styles.dateContainer}>
        <Text style={styles.timeText}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.dateText}>{currentTime.toLocaleDateString()}</Text>
        
      </View>

      {/* Display in top right corner */}
      <View style={styles.locationContainer}>
        <Text style={styles.locationText}>{location}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer Navigation */}
      <ImageBackground
        source={getFooterBackground()}
        style={styles.footerImageBackground}
        resizeMode="cover"
      >
        <View style={[styles.footer]}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              isDarkMode && styles.navButtonDark,
              activeTab === 'dashboard' && styles.navButtonActive,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={[
              styles.navButtonText,
              isDarkMode && styles.navButtonTextDark,
              activeTab === 'dashboard' && styles.navButtonTextActive
            ]}>
              Dashboard
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              isDarkMode && styles.navButtonDark,
              activeTab === 'map' && styles.navButtonActive,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => router.push('/worldmap')}
          >
            <Text style={[
              styles.navButtonText,
              isDarkMode && styles.navButtonTextDark,
              activeTab === 'map' && styles.navButtonTextActive
            ]}>
              Map
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              isDarkMode && styles.navButtonDark,
              activeTab === 'tasks' && styles.navButtonActive,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => router.push('/task')}
          >
            <Text style={[
              styles.navButtonText,
              isDarkMode && styles.navButtonTextDark,
              activeTab === 'tasks' && styles.navButtonTextActive
            ]}>
              Tasks
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              isDarkMode && styles.navButtonDark,
              activeTab === 'accounting' && styles.navButtonActive,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => router.push('/accounting-screen/accounting_home')}
          >
            <Text style={[
              styles.navButtonText,
              isDarkMode && styles.navButtonTextDark,
              activeTab === 'accounting' && styles.navButtonTextActive
            ]}>
              $
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              isDarkMode && styles.navButtonDark,
              activeTab === 'settings' && styles.navButtonActive,
              pressed && styles.navButtonPressed
            ]}
            onPress={() => router.push('/user_setting')}
          >
            <Text style={[
              styles.navButtonText,
              isDarkMode && styles.navButtonTextDark,
              activeTab === 'settings' && styles.navButtonTextActive
            ]}>
              Settings
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  dateContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
    paddingLeft: 15,
    paddingTop: 10,
  },
  locationContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    paddingRight: 15,
    paddingTop: 5,
    alignItems: 'flex-end',
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f7f9ff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
    alignSelf: 'flex-end',
    paddingTop: 40,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f7f9ff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f7f9ff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  footerImageBackground: {
    borderTopWidth: 1,
    height: 90,
    borderTopColor: '#f0f0f0',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    gap: 12,
  },
  footerDark: {
    backgroundColor: 'transparent',
    borderTopColor: '#444',
  },
  navButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  navButtonDark: {
    backgroundColor: '#3a3a3a',
  },
  navButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  navButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  navButtonTextDark: {
    color: '#ccc',
  },
  navButtonTextActive: {
    color: '#fff',
  },
});
