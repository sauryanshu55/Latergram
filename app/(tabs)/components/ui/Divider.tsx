import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../../constants';

interface DividerProps {
  text?: string;
  style?: any;
}

export const Divider: React.FC<DividerProps> = ({ text, style }) => {
  if (text) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.line} />
        <Text style={styles.text}>{text}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.simpleLine, style]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.medium,
  },
  text: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    fontWeight: Typography.fontWeight.medium,
  },
  simpleLine: {
    height: 1,
    backgroundColor: Colors.border.medium,
    marginVertical: Spacing.md,
  },
});