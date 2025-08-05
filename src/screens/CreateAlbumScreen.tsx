// src/screens/CreateAlbumScreen.tsx
import { useAuth } from '@/contexts/AuthContext';
import { albumService } from '@/services/albumService';
import { CreateAlbumData } from '@/types/albums';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateAlbumScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [marinationDate, setMarinationDate] = useState(
    () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  );
  
  // Date picker states
  const [showEventDatePicker, setShowEventDatePicker] = useState(false);
  const [showMarinationDatePicker, setShowMarinationDatePicker] = useState(false);
  
  // Advanced settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [allowGuestUploads, setAllowGuestUploads] = useState(true);
  const [maxPhotosPerUser, setMaxPhotosPerUser] = useState('');

  const handleEventDateChange = (event: any, selectedDate?: Date) => {
    setShowEventDatePicker(false);
    if (selectedDate) {
      setEventDate(selectedDate);
      
      // Auto-adjust marination date if it's before the event date
      if (marinationDate <= selectedDate) {
        const newMarinationDate = new Date(selectedDate);
        newMarinationDate.setDate(selectedDate.getDate() + 1);
        setMarinationDate(newMarinationDate);
      }
    }
  };

  const handleMarinationDateChange = (event: any, selectedDate?: Date) => {
    setShowMarinationDatePicker(false);
    if (selectedDate) {
      if (selectedDate > eventDate) {
        setMarinationDate(selectedDate);
      } else {
        Alert.alert(
          'Invalid Date',
          'Marination date must be after the event date.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const validateForm = (): boolean => {
    if (!albumName.trim()) {
      Alert.alert('Error', 'Please enter an album name.');
      return false;
    }

    if (albumName.trim().length < 3) {
      Alert.alert('Error', 'Album name must be at least 3 characters long.');
      return false;
    }

    if (eventDate > new Date()) {
      // For future events, ensure marination is after event
      if (marinationDate <= eventDate) {
        Alert.alert('Error', 'Marination date must be after the event date.');
        return false;
      }
    }

    if (maxPhotosPerUser && (isNaN(Number(maxPhotosPerUser)) || Number(maxPhotosPerUser) <= 0)) {
      Alert.alert('Error', 'Maximum photos per user must be a positive number.');
      return false;
    }

    return true;
  };

  const handleCreateAlbum = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create an album.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const albumData: CreateAlbumData = {
        name: albumName.trim(),
        description: description.trim() || undefined,
        eventDate,
        marinationEndDate: marinationDate,
        isPrivate,
        allowGuestUploads,
        maxPhotosPerUser: maxPhotosPerUser ? Number(maxPhotosPerUser) : undefined
      };

      const createdAlbum = await albumService.createAlbum(albumData, user);
      
      // Navigate to album code screen
      router.replace({
        pathname: '/album-created',
        params: { albumId: createdAlbum.id }
      });
      
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create album. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getDaysUntilMarination = (): number => {
    const now = new Date();
    const diffTime = marinationDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event Album</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Album Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Album Name *</Text>
            <TextInput
              style={styles.textInput}
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="e.g., Sarah's Birthday Party"
              maxLength={50}
              returnKeyType="next"
            />
            <Text style={styles.charCount}>{albumName.length}/50</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details about your event..."
              multiline
              numberOfLines={3}
              maxLength={200}
              returnKeyType="done"
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Event Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Date *</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowEventDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.dateButtonText}>{formatDate(eventDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Marination Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When to Reveal Photos *</Text>
            <Text style={styles.sectionSubtitle}>
              Photos will be hidden until this date and time
            </Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowMarinationDatePicker(true)}
            >
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text style={styles.dateButtonText}>{formatDateTime(marinationDate)}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            
            {getDaysUntilMarination() > 0 && (
              <Text style={styles.marinationInfo}>
                Photos will be revealed in {getDaysUntilMarination()} day{getDaysUntilMarination() !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {/* Advanced Settings */}
          <TouchableOpacity 
            style={styles.advancedToggle}
            onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
          >
            <Text style={styles.advancedToggleText}>Advanced Settings</Text>
            <Ionicons 
              name={showAdvancedSettings ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#007AFF" 
            />
          </TouchableOpacity>

          {showAdvancedSettings && (
            <View style={styles.advancedSettings}>
              {/* Private Album Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Private Album</Text>
                  <Text style={styles.settingDescription}>
                    Require approval for new members
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, isPrivate && styles.toggleActive]}
                  onPress={() => setIsPrivate(!isPrivate)}
                >
                  <View style={[styles.toggleCircle, isPrivate && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>

              {/* Guest Uploads Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Allow Guest Uploads</Text>
                  <Text style={styles.settingDescription}>
                    Let non-registered users add photos
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, allowGuestUploads && styles.toggleActive]}
                  onPress={() => setAllowGuestUploads(!allowGuestUploads)}
                >
                  <View style={[styles.toggleCircle, allowGuestUploads && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>

              {/* Max Photos Per User */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Max Photos Per User</Text>
                <Text style={styles.sectionSubtitle}>
                  Leave empty for unlimited photos
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={maxPhotosPerUser}
                  onChangeText={setMaxPhotosPerUser}
                  placeholder="e.g., 20"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateAlbum}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.createButtonText}>Create Album</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showEventDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="date"
            display="default"
            onChange={handleEventDateChange}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          />
        )}

        {showMarinationDatePicker && (
          <DateTimePicker
            value={marinationDate}
            mode="datetime"
            display="default"
            onChange={handleMarinationDateChange}
            minimumDate={new Date(eventDate.getTime() + 60 * 60 * 1000)} // 1 hour after event
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginTop: 8,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    marginTop: 8,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  marinationInfo: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  advancedSettings: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 30,
    backgroundColor: '#e1e8ed',
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  createButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});