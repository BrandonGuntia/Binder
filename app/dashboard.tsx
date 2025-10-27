import Layout from '@/components/Layout';
import { useDarkMode } from '@/contexts/DarkModeContext';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

// Dark mode map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
];

export default function Dashboard() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);

  // Request location permissions and get user's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <Layout activeTab="dashboard" ignoreTopSafeArea={true}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
            source={require('@/assets/images/sand-background.png')}
            style={{ flex: 1, height: '50%',}}
            resizeMode="cover"
          >
         
            
          <View style={styles.mapContainer}>
          {userLocation && (
            <MapView
              style={{ flex: 1, borderRadius: 12 }}
              provider={PROVIDER_GOOGLE}
              initialRegion={userLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
              customMapStyle={darkMapStyle}
            />
          )}
        </View>

        {/* 5 Circles Container */}
        <View style={styles.circlesContainer}>
          <View style={styles.circle} />
          <View style={styles.circle} />
          <View style={styles.circle} />
          <View style={styles.circle} />
          <View style={styles.circle} />
        </View>

        {/* Divider */}
        <View style={styles.divider} />
        <ScrollView
          style={styles.taskContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

        {/* 2x2 Grid of Squares */}
        <View style={styles.gridContainer}>
          {/* First Row */}
          <View style={styles.gridRow}>
            <View style={styles.square} />
            <View style={styles.square} />
          </View>

          {/* Second Row */}
          <View style={styles.gridRow}>
            <View style={styles.square} />
            <View style={styles.square} />
          </View>
        </View>

        </ScrollView>
        <View>
          <Pressable>
            <Text style={styles.buttonText}>Load More</Text>
          </Pressable>
        </View>

        </ImageBackground>


      
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  header:{
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topLeftDiv: {
    height: 60,
    backgroundColor: '#1a1aceff',
    borderRadius: 12,
    width: '55%',
  },
  topRightDiv: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#a7bb24ff',
    borderRadius: 12,
    width: '44%',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    
  },
  mapContainer: {
    height: 350,
    borderRadius: 12,
    width: '100%',
    marginTop: 5,
    overflow: 'hidden',
    paddingTop: 80,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
  },
  divider: {
    width: '95%',
    height: 10,
    backgroundColor: '#ded6d6ff',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: '2.5%',
  },
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  square: {
    width: '48%',
    height: 100,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
  },
  taskContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  toolContainer: {
    backgroundColor: '#ecececff',
    marginTop: 5,
  },
  settingButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  
  notificationButton: {
    backgroundColor: '#F5A623',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  
  messageButton: {
    backgroundColor: '#7ED321',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },

});
