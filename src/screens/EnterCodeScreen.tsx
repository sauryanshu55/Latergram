// src/screens/EnterCodeScreen.tsx
import { AuthModal } from '@/components/auth/AuthModal';
import { QuickAuthButtons } from '@/components/auth/QuickAuthButtons';
import { SafeContainer } from '@/components/common';
import { Colors, Spacing } from '@/components/constants';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
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
    // Only allow digits and limit to 6 characters
    const numericCode = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numericCode);
  };

  const handleJoinAlbum = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement album joining logic
      // This will check if the album exists and add the user to it
      console.log('Joining album with code:', code);
      
      // For now, simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to album view
      // router.push(`/album/${code}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join album');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleShowAuthOptions = () => {
    setShowAuthOptions(true);
  };

  const handleSignIn = () => {
    setAuthModalVisible(true);
    setShowAuthOptions(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primary.main} />
      </TouchableOpacity>
      <Text style={styles.title}>Enter Event Code</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderCodeInput = () => (
    <Card style={styles.codeCard}>
      <Text style={styles.instructionText}>
        Enter the 6-digit code shared by the event host
      </Text>
      
      <View style={styles.codeInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.codeInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="numeric"
          placeholder="000000"
          placeholderTextColor={Colors.neutral[900]}
          maxLength={6}
          autoFocus
        />
      </View>

      <Button
        title="Join Album"
        onPress={handleJoinAlbum}
        disabled={code.length !== 6 || isLoading}
        style={styles.joinButton}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary.main} />
          <Text style={styles.loadingText}>Joining album...</Text>
        </View>
      )}
    </Card>
  );

  const renderUserStatus = () => {
    if (isAuthenticated && user) {
      return (
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <Ionicons 
              name="checkmark-circle" 
              size={24} 
              color={Colors.success} 
            />
            <View style={styles.userDetails}>
              <Text style={styles.signedInText}>Signed in as</Text>
              <Text style={styles.userNameText}>
                {user.displayName || user.email}
              </Text>
            </View>
          </View>
          <Text style={styles.benefitText}>
            Your participation will be saved to your account
          </Text>
        </Card>
      );
    }

    if (showAuthOptions) {
      return (
        <Card style={styles.authCard}>
          <QuickAuthButtons 
            onShowEmailAuth={handleSignIn}
          />
          <TouchableOpacity 
            style={styles.continueAnonymousButton}
            onPress={() => setShowAuthOptions(false)}
          >
            <Text style={styles.continueAnonymousText}>
              Continue without signing in
            </Text>
          </TouchableOpacity>
        </Card>
      );
    }

    return (
      <Card style={styles.anonymousCard}>
        <View style={styles.anonymousHeader}>
          <Ionicons 
            name="person-outline" 
            size={24} 
            color={Colors.primary.light} 
          />
          <Text style={styles.anonymousTitle}>Join as Guest</Text>
        </View>
        <Text style={styles.anonymousDescription}>
          You can view and add photos to this album anonymously. 
          However, you won't be able to access it again without the code.
        </Text>
        <TouchableOpacity 
          style={styles.signInPromptButton}
          onPress={handleShowAuthOptions}
        >
          <Text style={styles.signInPromptText}>
            Sign in to save this album to your account
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={16} 
            color={Colors.primary.main} 
          />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeContainer backgroundColor={Colors.background.secondary}>
        <StatusBar style="dark" backgroundColor={Colors.background.secondary} />
        
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {renderHeader()}
          
          <View style={styles.content}>
            {renderCodeInput()}
            {renderUserStatus()}
          </View>
        </KeyboardAvoidingView>

        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          initialMode="signin"
        />
      </SafeContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  content: {
    flex: 1,
    gap: Spacing.lg,
  },
  codeCard: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: Colors.primary.light,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeInputContainer: {
    marginBottom: Spacing.lg,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary.main,
    textAlign: 'center',
    letterSpacing: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minWidth: 200,
  },
  joinButton: {
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.primary.light,
  },
  userCard: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
    borderWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  signedInText: {
    fontSize: 14,
    color: Colors.primary.light,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
  },
  authCard: {
    alignItems: 'center',
  },
  continueAnonymousButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  continueAnonymousText: {
    fontSize: 14,
    color: Colors.primary.light,
    textDecorationLine: 'underline',
  },
  anonymousCard: {
    backgroundColor: Colors.warning,
    borderColor: Colors.warning,
    borderWidth: 1,
  },
  anonymousHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  anonymousTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
  },
  anonymousDescription: {
    fontSize: 14,
    color: Colors.primary.light,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  signInPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.light,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  signInPromptText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary.main,
  },
});