import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing } from '../constants';

interface QuickAuthButtonsProps {
  onShowEmailAuth: () => void;
  style?: any;
}

export const QuickAuthButtons: React.FC<QuickAuthButtonsProps> = ({
  onShowEmailAuth,
  style,
}) => {
  const { signInWithGoogle, signInWithApple, isAppleSignInAvailable } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      // Handle error - you might want to show a toast or alert
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (error: any) {
      console.error('Apple sign in error:', error);
      // Handle error - you might want to show a toast or alert
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Sign in to save your albums</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" />
          <Text style={styles.buttonText}>Google</Text>
        </TouchableOpacity>

        {isAppleSignInAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={8}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        <TouchableOpacity
          style={styles.emailButton}
          onPress={onShowEmailAuth}
        >
          <Ionicons name="mail" size={20} color={Colors.primary.main} />
          <Text style={styles.emailButtonText}>Email</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Or continue without signing in (you won't be able to save albums)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Colors.border.dark,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.main,
  },
  appleButton: {
    height: 50,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.light,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary.main,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.primary.main,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});