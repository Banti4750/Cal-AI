import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../theme/theme';

const MacroCard = ({ label, value, goal, color }) => {
  return (
    <View style={styles.pill}>
      <Text style={[styles.value, { color }]}>{Math.round(value)}g</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default MacroCard;
