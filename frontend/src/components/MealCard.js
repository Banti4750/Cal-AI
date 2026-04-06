import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '../theme/theme';

const API_HOST = 'http://10.121.23.186:5000';

const MealCard = ({ meal, onPress, onDelete }) => {
  const foodNames = meal.foods.map((f) => f.name).join(', ');
  const displayName = foodNames.length > 30 ? foodNames.substring(0, 27) + '...' : foodNames;
  const time = new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: `${API_HOST}${meal.imageUrl}` }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <View style={styles.macroRow}>
          <Text style={styles.calories}>🔥 {Math.round(meal.totals.calories)} kcal</Text>
        </View>
        <View style={styles.macroRow}>
          <Text style={[styles.macro, { color: colors.protein }]}>⚡ {Math.round(meal.totals.protein)}g</Text>
          <Text style={[styles.macro, { color: colors.carbs }]}>🌾 {Math.round(meal.totals.carbs)}g</Text>
          <Text style={[styles.macro, { color: colors.fat }]}>💧 {Math.round(meal.totals.fat)}g</Text>
        </View>
      </View>
      <Text style={styles.time}>{time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  macroRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  calories: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  macro: {
    fontSize: fontSize.xs,
  },
  time: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
});

export default MealCard;
