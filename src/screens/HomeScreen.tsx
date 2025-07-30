// src/screens/HomeScreen.tsx
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
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  const handleEnterCode = () => {
    router.push('/enter-code');
  };

  const handleScanCode = () => {
    console.log('Scan code pressed');
    // Navigate to scan code screen
  };

  const handleCreateEvent = () => {
    if (isAuthenticated) {
      // Navigate to create event screen
      console.log('Navigate to create event (authenticated user)');
    } else {
      // Show auth options first
      setAuthModalMode('signin');
      setAuthModalVisible(true);
    }
  };

  const handleSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalVisible(true);
  };

  const handleSignUp = () => {
    setAuthModalMode('signup');
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
            <Ionicons name="log-out-outline" size={20} color={Colors.primary.light} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.authSection}>
        <QuickAuthButtons 
          onShowEmailAuth={handleSignIn}
          style={styles.quickAuth}
        />
      </View>
    );
  };

  const renderMainActions = () => (
    <Card style={styles.mainCard}>
      {/* Join Event Section */}
      <View style={styles.joinSection}>
        <Text style={styles.sectionTitle}>Join an Event Album</Text>
        <View style={styles.buttonRow}>
          <Button
            title="Enter Code"
            onPress={handleEnterCode}
            variant="primary"
            style={styles.halfButton}
          />
          <Button
            title="Scan Code"
            onPress={handleScanCode}
            variant="outline"
            style={styles.halfButton}
          />
        </View>
      </View>

      {/* Divider */}
      <Divider text="OR" />

      {/* Create Event Section */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>Create Your Own</Text>
        <Button
          title={isAuthenticated ? "Create Event Album" : "Sign In to Create Album"}
          onPress={handleCreateEvent}
          variant="secondary"
          style={styles.fullButton}
        />
        {!isAuthenticated && (
          <Text style={styles.createHint}>
            Sign in to create and manage your event albums
          </Text>
        )}
      </View>
    </Card>
  );

  const renderMyAlbums = () => {
    if (!isAuthenticated) return null;

    return (
      <Card style={styles.myAlbumsCard}>
        <View style={styles.myAlbumsHeader}>
          <Text style={styles.sectionTitle}>My Albums</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.placeholderText}>
          Your created and joined albums will appear here
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeContainer backgroundColor={Colors.background.secondary}>
        <StatusBar style="dark" backgroundColor={Colors.background.secondary} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Logo size="lg" />
            </View>

            {/* User/Auth Section */}
            {renderUserSection()}

            {/* Main Action Card */}
            {renderMainActions()}

            {/* My Albums Section (only for authenticated users) */}
            {renderMyAlbums()}
          </View>
        </ScrollView>

        {/* Auth Modal */}
        <AuthModal
          visible={authModalVisible}
          onClose={() => setAuthModalVisible(false)}
          initialMode={authModalMode}
        />
      </SafeContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.primary.light
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary.main,
    marginTop: 2,
  },
  signOutButton: {
    padding: Spacing.sm,
  },
  authSection: {
    marginBottom: Spacing.lg,
  },
  quickAuth: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    marginHorizontal: Spacing.sm,
  },
  mainCard: {
    marginBottom: Spacing.lg,
  },
  joinSection: {
    paddingBottom: Spacing.md,
  },
  createSection: {
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary.main,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  fullButton: {
    width: '100%',
  },
  createHint: {
    fontSize: 12,
    color: Colors.primary.light,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  myAlbumsCard: {
    marginBottom: Spacing.lg,
  },
  myAlbumsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.primary.light,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: Spacing.lg,
  },
});