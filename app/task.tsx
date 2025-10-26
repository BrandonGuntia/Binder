import Layout from '@/components/Layout';
import { useDarkMode } from '@/contexts/DarkModeContext';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabaseClient';

export default function Task() {
  const { isDarkMode } = useDarkMode();

  // Single state for all user input (for Supabase)
  const [newTask, setNewTask] = React.useState({
    userName: "",
    taskTitle: "",
    location: {
      latitude: null as number | null,
      longitude: null as number | null,
      address: ""
    },
    description: ""
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!newTask.userName.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }
    if (!newTask.taskTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a task title');
      return;
    }

    try {
      const { error } = await supabase.from('Tasks').insert([newTask]);

      if (error) {
        console.error('Error adding task:', error.message);
        Alert.alert('Error', 'Failed to add task. Please try again.');
      } else {
        // Clear the form
        setNewTask({
          userName: "",
          taskTitle: "",
          location: {
            latitude: null,
            longitude: null,
            address: ""
          },
          description: ""
        });
        Alert.alert('Success', 'Task added successfully!');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Map-related states (only for autocomplete UI)
  const [suggestions, setSuggestions] = React.useState<Array<{
    address: string;
    latitude: number;
    longitude: number;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const mapRef = React.useRef<MapView>(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;

    try {
      // Fetch the nearest address using reverse geocoding
      const geocodedAddress = await Location.reverseGeocodeAsync({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      });

      let addressName = "Unknown Location";
      if (geocodedAddress && geocodedAddress.length > 0) {
        const { name, street, city, region, country } = geocodedAddress[0];
        // Use name if available (e.g., "Golden Gate Park"), otherwise use street
        const primaryLocation = name || street;
        addressName = [primaryLocation, city, region, country]
          .filter(Boolean)
          .join(', ');
      }

      // Update newTask with location and fetched address
      setNewTask(prev => ({
        ...prev,
        location: {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address: addressName
        }
      }));
    } catch (error) {
      // If geocoding fails, still set the coordinates but with a default address
      setNewTask(prev => ({
        ...prev,
        location: {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          address: "Unknown Location"
        }
      }));
    }
  };

  const handleRecenter = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Animate map to user location
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);

      // Fetch the nearest address using reverse geocoding
      const geocodedAddress = await Location.reverseGeocodeAsync({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      });

      let addressName = "Current Location";
      if (geocodedAddress && geocodedAddress.length > 0) {
        const { name, street, city, region, country } = geocodedAddress[0];
        // Use name if available (e.g., "Golden Gate Park"), otherwise use street
        const primaryLocation = name || street;
        addressName = [primaryLocation, city, region, country]
          .filter(Boolean)
          .join(', ');
      }

      // Set the location in newTask with fetched address
      setNewTask(prev => ({
        ...prev,
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          address: addressName
        }
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  const handleSearchQueryChange = (text: string) => {
    // Update address in newTask
    setNewTask(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: text
      }
    }));

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const geocodedLocations = await Location.geocodeAsync(text);

        if (geocodedLocations.length > 0) {
          const suggestionsList = await Promise.all(
            geocodedLocations.slice(0, 5).map(async (loc) => {
              try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                });

                const address = reverseGeocode[0];
                const addressString = [
                  address.name,
                  address.street,
                  address.city,
                  address.region,
                  address.country,
                ].filter(Boolean).join(', ');

                return {
                  address: addressString || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                };
              } catch {
                return {
                  address: `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                };
              }
            })
          );

          setSuggestions(suggestionsList);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);
  };

  const handleSuggestionSelect = (suggestion: { address: string; latitude: number; longitude: number }) => {
    setShowSuggestions(false);

    const searchedLocation = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };

    // Animate map to selected location
    mapRef.current?.animateToRegion({
      ...searchedLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 1000);

    // Update newTask with location
    setNewTask(prev => ({
      ...prev,
      location: {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.address
      }
    }));
  };

  const handleLocationSearch = async () => {
    if (!newTask.location.address.trim()) {
      Alert.alert('Empty Search', 'Please enter a location to search');
      return;
    }

    setShowSuggestions(false);

    try {
      const geocodedLocations = await Location.geocodeAsync(newTask.location.address);

      if (geocodedLocations.length === 0) {
        Alert.alert('Not Found', 'Location not found. Please try a different search.');
        return;
      }

      const location = geocodedLocations[0];
      const searchedLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Animate map to searched location
      mapRef.current?.animateToRegion({
        ...searchedLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);

      // Update newTask with location
      setNewTask(prev => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: searchedLocation.latitude,
          longitude: searchedLocation.longitude
        }
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to search location');
    }
  };

  return (
    <Layout activeTab="tasks">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Tasks</Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>Manage your tasks</Text>
          </View>

          <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>User_Name</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Enter Your Name"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              value={newTask.userName}
              onChangeText={(text) =>
                setNewTask((prev) => ({...prev, userName: text}))
              }
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>Task Title</Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.inputDark]}
              placeholder="Enter Task Title"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              value={newTask.taskTitle}
              onChangeText={(text) =>
                setNewTask((prev) => ({...prev, taskTitle: text}))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>Description</Text>
            <TextInput
              style={[styles.descriptionInput, isDarkMode && styles.descriptionInputDark]}
              placeholder="Describe your task"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              multiline={true}
              textAlignVertical="top"
              value={newTask.description}
              onChangeText={(text) =>
                setNewTask((prev) => ({...prev, description: text}))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDarkMode && styles.labelDark]}>Location (Tap on map)</Text>

            {/* Location Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                  placeholder="Search location (e.g., New York, USA)"
                  placeholderTextColor={isDarkMode ? "#666" : "#999"}
                  value={newTask.location.address}
                  onChangeText={handleSearchQueryChange}
                  onSubmitEditing={handleLocationSearch}
                  returnKeyType="search"
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <ScrollView
                    style={[styles.suggestionsContainer, isDarkMode && styles.suggestionsContainerDark]}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {suggestions.map((suggestion, index) => (
                      <Pressable
                        key={index}
                        style={({ pressed }) => [
                          styles.suggestionItem,
                          isDarkMode && styles.suggestionItemDark,
                          pressed && styles.suggestionItemPressed,
                          index !== suggestions.length - 1 && styles.suggestionItemBorder,
                          index !== suggestions.length - 1 && isDarkMode && styles.suggestionItemBorderDark,
                        ]}
                        onPress={() => handleSuggestionSelect(suggestion)}
                      >
                        <Text style={[styles.suggestionText, isDarkMode && styles.suggestionTextDark]} numberOfLines={1}>
                          {suggestion.address}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.searchButton,
                  pressed && styles.searchButtonPressed
                ]}
                onPress={handleLocationSearch}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </Pressable>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.mapView}
                initialRegion={{
                  latitude: 37.78825,
                  longitude: -122.4324,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onPress={handleMapPress}
              >
                {newTask.location.latitude && newTask.location.longitude && (
                  <Marker coordinate={{
                    latitude: newTask.location.latitude,
                    longitude: newTask.location.longitude
                  }} />
                )}
              </MapView>
              <Pressable
                style={({ pressed }) => [
                  styles.recenterButton,
                  isDarkMode && styles.recenterButtonDark,
                  pressed && styles.recenterButtonPressed
                ]}
                onPress={handleRecenter}
              >
                <Text style={styles.recenterButtonText}>📍</Text>
              </Pressable>
            </View>

          </View>

          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.addButtonText}>Add Task</Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </Layout>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
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
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  labelDark: {
    color: '#ccc',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  mapContainer: {
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recenterButtonDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  recenterButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  recenterButtonText: {
    fontSize: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  searchInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FF6B9D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  searchButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  searchButtonText: {
    fontSize: 20,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 46,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsContainerDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  suggestionItem: {
    padding: 12,
    backgroundColor: '#fff',
  },
  suggestionItemDark: {
    backgroundColor: '#2a2a2a',
  },
  suggestionItemPressed: {
    opacity: 0.7,
  },
  suggestionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionItemBorderDark: {
    borderBottomColor: '#444',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  suggestionTextDark: {
    color: '#ccc',
  },
  coordinatesBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  coordinatesBoxDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  coordinatesTextDark: {
    color: '#ccc',
  },
  descriptionInput: {
    height: 180,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  descriptionInputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
    color: '#fff',
  },
  addButton: {
    height: 54,
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B9D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});