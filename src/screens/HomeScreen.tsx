// src/screens/HomeScreen.tsx - Complete updated version
import { AuthModal } from '@/components/auth/AuthModal';
import { QuickAuthButtons } from '@/components/auth/QuickAuthButtons';
import { Logo, SafeContainer } from '@/components/common';
import { Colors, Spacing } from '@/components/constants';
import { Button, Card, Divider } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup'>('signin');
  
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  const handleEnterCode = () => {
    router.push('/enter-code');
  };

  const handleScanCode = () => {
    console.log('Scan code pressed');
    // Navigate to scan code screen (to be implemented)
  };

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      // Navigate to create album screen
      router.push('/create-album');
    } else {
      // Show auth options first
      setAuthModalInitialMode('signin');
      setAuthModalVisible(true);
    }
  };

  const handleShowEmailAuth = () => {
    setAuthModalInitialMode('signin');
    setAuthModalVisible(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderUserSection = () => {
    if (isLoading) {
      return (
        <View style={styles.userSection}>
          <ActivityIndicator size="small" color={Colors.primary.main} />
        </View>
      );
    }

    if (isAuthenticated && user) {
      return (
        <View style={styles.userSection}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user.displayName || 'User'}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaProvider>
      <SafeContainer>
        <StatusBar style="auto" />
        
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Logo size="lg" />
            {renderUserSection()}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.tagline}>
                Capture memories, reveal them together
              </Text>
              <Text style={styles.description}>
                Create photo albums for events where pictures stay hidden until everyone can enjoy them at the same time.
              </Text>
            </View>

            {/* Action Cards */}
            <View style={styles.actionCards}>
              {/* Create Album Card */}
              <Card style={styles.actionCard}>
                <View style={styles.cardIcon}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary.main} />
                </View>
                <Text style={styles.cardTitle}>Create Album</Text>
                <Text style={styles.cardDescription}>
                  Start a new event album and get a unique code to share
                </Text>
                <Button
                  title={isAuthenticated ? "Create Album" : "Sign in to Create"}
                  onPress={handleCreateEvent}
                  style={styles.cardButton}
                  variant="primary"
                />
              </Card>

              {/* Join Album Card */}
              <Card style={styles.actionCard}>
                <View style={styles.cardIcon}>
                  <Ionicons name="enter-outline" size={32} color={Colors.secondary.main} />
                </View>
                <Text style={styles.cardTitle}>Join Album</Text>
                <Text style={styles.cardDescription}>
                  Enter a 6-digit code to join an existing album
                </Text>
                <Button
                  title="Enter Code"
                  onPress={handleEnterCode}
                  style={styles.cardButton}
                  variant="secondary"
                />
              </Card>

              {/* Scan Code Card */}
              <Card style={styles.actionCard}>
                <View style={styles.cardIcon}>
                  <Ionicons name="qr-code-outline" size={32} color={Colors.background.primary} />
                </View>
                <Text style={styles.cardTitle}>Scan Code</Text>
                <Text style={styles.cardDescription}>
                  Use your camera to scan a QR code
                </Text>
                <Button
                  title="Scan QR Code"
                  onPress={handleScanCode}
                  style={styles.cardButton}
                  variant="outline"
                />
              </Card>
            </View>

            {/* How it Works Section */}
            <View style={styles.howItWorksSection}>
              <Text style={styles.sectionTitle}>How LaterGram Works</Text>
              
              <View style={styles.steps}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Create & Share</Text>
                    <Text style={styles.stepDescription}>
                      Create an album and share the 6-digit code with friends
                    </Text>
                  </View>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Capture Moments</Text>
                    <Text style={styles.stepDescription}>
                      Everyone adds photos during the event, but no one can see them yet
                    </Text>
                  </View>
                </View>

                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Reveal Together</Text>
                    <Text style={styles.stepDescription}>
                      After the "marination" period, all photos are revealed at once
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Auth Section for Non-authenticated Users */}
            {!isAuthenticated && (
              <View style={styles.authSection}>
                <Divider style={styles.divider} />
                <Text style={styles.authTitle}>Get Started</Text>
                <Text style={styles.authDescription}>
                  Sign in to create albums and manage your memories
                </Text>
                <QuickAuthButtons
                  onShowEmailAuth={handleShowEmailAuth}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Auth Modal */}
        <AuthModal
          visible={authModalVisible}
          initialMode={authModalInitialMode}
          onClose={() => setAuthModalVisible(false)}
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
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.primary.light,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.dark,
  },
  signOutButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.background.secondary,
  },
  mainContent: {
    paddingHorizontal: Spacing.lg,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.dark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 16,
    color: Colors.primary.light,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionCards: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  actionCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.primary.light,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  cardButton: {
    minWidth: 160,
  },
  howItWorksSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary.dark,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  steps: {
    gap: Spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.primary.light,
    lineHeight: 20,
  },
  authSection: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: Spacing.xl,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginBottom: Spacing.xs,
  },
  authDescription: {
    fontSize: 14,
    color: Colors.primary.light,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});