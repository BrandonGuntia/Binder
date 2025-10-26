import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'map' | 'tasks';
}

export default function Layout({ children, activeTab }: LayoutProps) {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Footer Navigation */}
      <View style={[styles.footer, isDarkMode && styles.footerDark]}>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            isDarkMode && styles.navButtonDark,
            activeTab === 'dashboard' && styles.navButtonActive,
            pressed && styles.navButtonPressed
          ]}
          onPress={() => router.push('dashboard')}
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
          onPress={() => router.push('worldmap')}
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
          onPress={() => router.push('task')}
        >
          <Text style={[
            styles.navButtonText,
            isDarkMode && styles.navButtonTextDark,
            activeTab === 'tasks' && styles.navButtonTextActive
          ]}>
            Tasks
          </Text>
        </Pressable>
      </View>
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
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  footerDark: {
    backgroundColor: '#2a2a2a',
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
