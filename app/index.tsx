// app/index.tsx (Home Screen)
import { testFirebaseConnection } from '@/src/utils/firebaseTest';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Logo, SafeContainer } from './(tabs)/components/common';
import { Button, Card, Divider } from './(tabs)/components/ui';
import { Colors, Spacing } from './constants';

export default function HomeScreen() {
  const handleEnterCode = () => {
    router.push('/enter-code');
  };

  const handleScanCode = () => {
    console.log('Scan code pressed');
    // Navigate to scan code screen
  };

  const handleCreateEvent = () => {
    console.log('Create event pressed');
    // Navigate to create event screen
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

            {/* Main Action Card */}
            <Card style={styles.mainCard}>
              {/* Join Event Section */}
              <View style={styles.joinSection}>
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
                <Button
                  title="Create Your Own Event Album"
                  onPress={handleCreateEvent}
                  variant="secondary"
                  size="lg"
                  fullWidth
                />
              </View>
            </Card>

            <TouchableOpacity onPress={() => testFirebaseConnection()}>
              <Text>Test Firebase</Text>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </SafeContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  mainCard: {
    marginHorizontal: Spacing.sm,
  },
  joinSection: {
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfButton: {
    flex: 1,
  },
  createSection: {
    marginTop: Spacing.md,
  },
  bottomSpacer: {
    height: Spacing['2xl'],
  },
});
