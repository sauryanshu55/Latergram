// app/screens/EnterCodeScreen.tsx
import { SafeContainer } from '@/components/common';
import { Colors, Spacing, Typography } from '@/components/constants';
import { Card } from '@/components/ui';
import { CodeInput } from '@/components/ui/CodeInput';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function EnterCodeScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeComplete = async (enteredCode: string) => {
    console.log('Code entered:', enteredCode);
    setIsLoading(true);
    try {
      // Here you would typically validate the code with your backend
      // For now, we'll simulate a delay and then navigate

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with actual validation logic
      if (enteredCode === '123456') {
        // Navigate to event album screen (not yet implemented)
        console.log('Code validated successfully, navigating to event...');
        // router.push('/event-album'); // Will implement later

        Alert.alert(
          'Success!',
          'Code validated successfully. Event album screen coming soon!',
          [{ text: 'OK' }]
        );
      } else {
        // Show error for invalid code
        Alert.alert(
          'Invalid Code',
          'The event code you entered is not valid. Please check and try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                // Clear the code and refocus
                setCode('');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error validating code:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleGoBack = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaProvider>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <SafeContainer backgroundColor={Colors.background.secondary}>
          <StatusBar style="dark" backgroundColor={Colors.background.secondary} />

          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Enter Event Code</Text>
                <Text style={styles.subtitle}>
                  Enter the 6-digit code shared by the event organizer
                </Text>
              </View>

              <Card style={styles.inputCard}>
                <CodeInput
                  length={6}
                  onComplete={handleCodeComplete}
                  onCodeChange={handleCodeChange}
                  disabled={isLoading}
                  autoFocus={true}
                />

                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Validating code...</Text>
                  </View>
                )}
              </Card>

              {/* Help Text */}
              <View style={styles.helpSection}>
                <Text style={styles.helpText}>
                  Don't have a code?{' '}
                  <Text
                    style={styles.helpLink}
                    onPress={() => {
                      Alert.alert(
                        'Need Help?',
                        'Ask the event organizer to share the event code with you, or scan the QR code if available.',
                        [{ text: 'Got it' }]
                      );
                    }}
                  >
                    Get help
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </SafeContainer>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginLeft: -Spacing.md, // Compensate for padding to align with screen edge
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['3xl'], // Extra bottom padding
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[800],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    paddingHorizontal: Spacing.md,
  },
  inputCard: {
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  loadingContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    fontWeight: Typography.fontWeight.medium,
  },
  helpSection: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  helpLink: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
});