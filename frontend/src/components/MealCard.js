import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '../theme/theme';

const API_HOST = 'https://cal-ai-4d0f.onrender.com';

const MealCard = ({ meal, onPress }) => {
  const foodNames = meal.foods.map((f) => f.name).join(', ');
  const displayName = foodNames.length > 30 ? foodNames.substring(0, 27) + '...' : foodNames;
  const time = new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const imageUri = meal.imageUrl
    ? (Platform.OS === 'android' && !meal.imageUrl.startsWith('file://')
      ? `${API_HOST}${meal.imageUrl}`
      : `${API_HOST}${meal.imageUrl}`)
    : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.calBadge}>
        <Text style={styles.calText}>{Math.round(meal.totals.calories)} kcal</Text>
      </View>
    </Pressable>
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
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceRaised,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  calBadge: {
    backgroundColor: colors.accentSubtle,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  calText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});

export default MealCard;
