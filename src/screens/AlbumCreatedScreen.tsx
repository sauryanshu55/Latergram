// app/album-created.tsx - Simple version without clipboard
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlbumCreatedScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCopyCode = () => {
    // Simple alert instead of clipboard
    Alert.alert(
      'Album Code',
      `Your album code is: ${albumId || 'ABC123'}\n\nShare this code with your friends!`,
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleShareCode = async () => {
    if (!albumId) return;
    
    try {
      const shareMessage = `Join my photo album! 📸\n\nUse code: ${albumId}\n\nPhotos will be revealed soon.`;
      
      await Share.share({
        message: shareMessage,
        title: `Join Album`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Success Icon */}
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Album Created!</Text>
          <Text style={styles.subtitle}>
            Your album is ready to collect memories
          </Text>

          {/* Album Code Section */}
          <View style={styles.codeSection}>
            <Text style={styles.codeLabel}>Share this code with your friends:</Text>
            
            <TouchableOpacity 
              style={styles.codeButton}
              onPress={handleCopyCode}
              activeOpacity={0.8}
            >
              <Text style={styles.codeText}>{albumId || 'ABC123'}</Text>
              <View style={styles.copyIcon}>
                <Ionicons 
                  name="information-circle-outline" 
                  size={20} 
                  color="#007AFF"
                />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.copyHint}>
              Tap to view code details
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleShareCode}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Share Code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleGoHome}
            >
              <Ionicons name="home-outline" size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Go Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  successIcon: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  codeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    fontWeight: '500',
  },
  codeButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 4,
    marginRight: 16,
  },
  copyIcon: {
    padding: 4,
  },
  copyHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actionSection: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});