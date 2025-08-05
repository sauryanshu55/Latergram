// src/screens/EnterCodeScreen.tsx - Updated with real database integration
import { AuthModal } from '@/components/auth/AuthModal';
import { QuickAuthButtons } from '@/components/auth/QuickAuthButtons';
import { SafeContainer } from '@/components/common';
import { Colors, Spacing } from '@/components/constants';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { albumService } from '@/services/albumService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function EnterCodeScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const cleanedCode = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    setCode(cleanedCode);
  };

  const validateCode = (): boolean => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-character code');
      return false;
    }

    if (!albumService.isValidAlbumCode(code)) {
      Alert.alert('Invalid Code', 'Code must contain only letters and numbers');
      return false;
    }

    return true;
  };

  const handleJoinAlbum = async () => {
    if (!validateCode()) {
      return;
    }

    if (!isAuthenticated || !user) {
      // Show auth options if not signed in
      setShowAuthOptions(true);
      Alert.alert(
        'Sign In Required',
        'You need to sign in to join an album.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => setAuthModalVisible(true) }
        ]
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting to join album with code:', code);
      
      // Join the album
      const joinedAlbum = await albumService.joinAlbum(code, user);
      
      console.log('Successfully joined album:', joinedAlbum.name);
      
      // Show success message
      Alert.alert(
        'Success!',
        `You've joined "${joinedAlbum.name}" album!\n\nYou'll be notified when photos are revealed.`,
        [
          {
            text: 'View Album',
            onPress: () => {
              router.replace({
                pathname: '/album/[id]' as any,
                params: { id: joinedAlbum.id }
              });
            }
          },
          {
            text: 'Go Home',
            onPress: () => router.replace('/'),
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('Error joining album:', error);
      
      let errorMessage = 'Failed to join album. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Album not found. Please check the code and try again.';
        } else if (error.message.includes('already a member')) {
          errorMessage = 'You are already a member of this album.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowEmailAuth = () => {
    setAuthModalVisible(true);
  };

  const handleScanCode = () => {
    console.log('Scan code functionality - to be implemented');
    Alert.alert('Coming Soon', 'QR code scanning will be available in a future update.');
  };

  const isCodeComplete = code.length === 6;

  return (
    <SafeAreaProvider>
      <SafeContainer>
        <StatusBar style="auto" />
        
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary.dark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Join Album</Text>
            <View style={styles.backButton} />
          </View>

          <View style={styles.content}>
            {/* Main Card */}
            <Card style={styles.mainCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="enter-outline" size={32} color={Colors.primary.main} />
                </View>
                <Text style={styles.cardTitle}>Enter Album Code</Text>
                <Text style={styles.cardDescription}>
                  Get the 6-character code from the event organizer
                </Text>
              </View>

              {/* Code Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Album Code</Text>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.codeInput,
                    isCodeComplete && styles.codeInputComplete,
                    isLoading && styles.codeInputDisabled
                  ]}
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="ABC123"
                  placeholderTextColor={Colors.primary.light}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  editable={!isLoading}
                  keyboardType="ascii-capable"
                  returnKeyType="join"
                  onSubmitEditing={handleJoinAlbum}
                />
                <Text style={styles.inputHint}>
                  {code.length}/6 characters
                </Text>
              </View>

              {/* Join Button */}
              <View style={styles.buttonSection}>
                <Button
                  title={isLoading ? 'Joining...' : 'Join Album'}
                  onPress={handleJoinAlbum}
                  disabled={!isCodeComplete || isLoading}
                  style={styles.joinButton}
                  variant="primary"
                />
                
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator 
                      size="small" 
                      color={Colors.primary.main} 
                      style={styles.loadingSpinner}
                    />
                    <Text style={styles.loadingText}>
                      Verifying code and joining album...
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Alternative Options */}
            <View style={styles.alternativeSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.scanButton}
                onPress={handleScanCode}
                disabled={isLoading}
              >
                <Ionicons name="qr-code-outline" size={24} color={Colors.secondary.main} />
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>

            {/* Auth Section */}
            {showAuthOptions && !isAuthenticated && (
              <Card style={styles.authCard}>
                <Text style={styles.authTitle}>Sign in to join albums</Text>
                <Text style={styles.authDescription}>
                  Create an account or sign in to join photo albums and get notified when photos are revealed.
                </Text>
                <QuickAuthButtons onShowEmailAuth={handleShowEmailAuth} />
              </Card>
            )}

            {/* Help Text */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>💡 How it works</Text>
              <Text style={styles.helpText}>
                • Get a 6-character code from the event organizer{'\n'}
                • Enter the code to join the album{'\n'}
                • Add photos during the event{'\n'}
                • Photos are revealed when the "marination" period ends
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Auth Modal */}
        <AuthModal
          visible={authModalVisible}
          initialMode="signin"
          onClose={() => {
            setAuthModalVisible(false);
            setShowAuthOptions(false);
          }}
        />
      </SafeContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
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
    color: Colors.primary.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  mainCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 16,
    color: Colors.primary.light,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.sm,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    color: Colors.primary.dark,
    backgroundColor: Colors.background.secondary,
  },
  codeInputComplete: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light,
  },
  codeInputDisabled: {
    opacity: 0.6,
  },
  inputHint: {
    fontSize: 14,
    color: Colors.primary.light,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  buttonSection: {
    marginBottom: Spacing.lg,
  },
  joinButton: {
    paddingVertical: Spacing.lg,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  loadingSpinner: {
    marginRight: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary.light,
  },
  alternativeSection: {
    marginBottom: Spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.primary.light,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.secondary.main,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary.main,
    marginLeft: Spacing.sm,
  },
  authCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  authDescription: {
    fontSize: 14,
    color: Colors.primary.light,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: Colors.primary.light,
    lineHeight: 20,
  },
});