import Layout from '@/components/Layout';
import { Stack } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable
} from 'react-native';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Layout activeTab="dashboard">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.title, isDarkMode && styles.titleDark]}>Dashboard</Text>
              <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>Welcome back!</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.darkModeButton,
                isDarkMode && styles.darkModeButtonActive,
                pressed && styles.darkModeButtonPressed
              ]}
              onPress={toggleDarkMode}
            >
              <Text style={[styles.darkModeButtonText, isDarkMode && styles.darkModeButtonTextActive]}>
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  subtitleDark: {
    color: '#aaa',
  },
  darkModeButton: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  darkModeButtonActive: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  darkModeButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  darkModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  darkModeButtonTextActive: {
    color: '#fff',
  },
});
