// app/components/common/Logo.tsx
import { Colors, Typography } from '@/components/constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', style }) => {
  return (
    <View style={[styles.container, styles[size], style]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>
        LaterGram
      </Text>
      <View style={[styles.accent, styles[`${size}Accent`]]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  text: {
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    letterSpacing: -0.5,
  },

  accent: {
    backgroundColor: Colors.secondary.main,
    borderRadius: 2,
    marginTop: 2,
  },

  // Sizes
  sm: {},
  md: {},
  lg: {},

  // Text sizes
  smText: {
    fontSize: Typography.fontSize.lg,
  },
  mdText: {
    fontSize: Typography.fontSize['2xl'],
  },
  lgText: {
    fontSize: Typography.fontSize['4xl'],
  },

  // Accent sizes
  smAccent: {
    width: 20,
    height: 2,
  },
  mdAccent: {
    width: 30,
    height: 3,
  },
  lgAccent: {
    width: 40,
    height: 4,
  },
});