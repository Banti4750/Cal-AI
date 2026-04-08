import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';

const API_HOST = 'https://cal-ai-4d0f.onrender.com';

const MacroBar = ({ label, value, max, color, delay = 0 }) => {
  const animWidth = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [value, max]);

  const width = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelRow}>
        <Text style={barStyles.label}>{label}</Text>
        <Text style={[barStyles.value, { color }]}>{Math.round(value)}g</Text>
      </View>
      <View style={barStyles.track}>
        <Animated.View style={[barStyles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const barStyles = StyleSheet.create({
  row: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: '600' },
  value: { fontSize: fontSize.xs, fontWeight: '700' },
  track: { height: 6, backgroundColor: colors.ringTrack, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});

const MealResultScreen = ({ route, navigation }) => {
  const { meal } = route.params;

  const imageUri = meal.imageUrl
    ? `${API_HOST}${meal.imageUrl}`
    : null;

  const maxMacro = Math.max(meal.totals.protein, meal.totals.carbs, meal.totals.fat, 1);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Food Image */}
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mealType}>
            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
          </Text>
          <Text style={styles.title}>
            {meal.foods.map((f) => f.name).join(', ')}
          </Text>
        </View>

        {/* Calorie Display */}
        <View style={styles.calorieCard}>
          <Text style={styles.calNumber}>{Math.round(meal.totals.calories)}</Text>
          <Text style={styles.calLabel}>KCAL</Text>
        </View>

        {/* Macro Bars */}
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>MACROS</Text>
          <MacroBar label="Protein" value={meal.totals.protein} max={maxMacro} color={colors.protein} delay={0} />
          <MacroBar label="Carbs" value={meal.totals.carbs} max={maxMacro} color={colors.carbs} delay={100} />
          <MacroBar label="Fat" value={meal.totals.fat} max={maxMacro} color={colors.fat} delay={200} />
        </View>

        {/* Individual Food Items */}
        <Text style={styles.sectionLabel}>DETECTED ITEMS</Text>
        {meal.foods.map((food, index) => (
          <View key={index} style={styles.foodItem}>
            <View style={styles.foodHeader}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodQuantity}>{food.quantity}</Text>
            </View>
            <View style={styles.foodMacros}>
              <Text style={styles.foodCal}>{Math.round(food.calories)} kcal</Text>
              <Text style={[styles.foodMacro, { color: colors.protein }]}>P: {Math.round(food.protein)}g</Text>
              <Text style={[styles.foodMacro, { color: colors.carbs }]}>C: {Math.round(food.carbs)}g</Text>
              <Text style={[styles.foodMacro, { color: colors.fat }]}>F: {Math.round(food.fat)}g</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [styles.doneBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.navigate('HomeTabs');
          }}
        >
          <Text style={styles.doneBtnText}>Add to Today</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
  },
  mealType: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: 4,
  },
  calorieCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  calNumber: {
    color: colors.accent,
    fontSize: fontSize.display,
    fontWeight: '800',
    letterSpacing: -2,
  },
  calLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    letterSpacing: 3,
    fontWeight: '600',
  },
  macroCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: spacing.lg,
  },
  macroTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    letterSpacing: 3,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    fontWeight: '600',
    letterSpacing: 3,
    marginHorizontal: 20,
    marginBottom: spacing.md,
  },
  foodItem: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  foodQuantity: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  foodMacros: {
    flexDirection: 'row',
    gap: 16,
  },
  foodCal: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  foodMacro: {
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#000000',
    fontSize: fontSize.md,
    fontWeight: '800',
  },
});

export default MealResultScreen;
