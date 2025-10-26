import Layout from '@/components/Layout';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

export default function WorldMap() {
  return (
    <Layout activeTab="map">
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.mapContainer}>
        <MapView style={styles.map} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
