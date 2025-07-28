import { BorderRadius, Colors, Spacing } from '@/components/constants';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof Spacing;
  elevation?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 'lg',
  elevation = true 
}) => {
  return (
    <View style={[
      styles.card, 
      { padding: Spacing[padding] },
      elevation && styles.elevated,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  elevated: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
});

