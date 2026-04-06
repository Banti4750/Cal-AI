import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';

const API_HOST = 'http://10.121.23.186:5000';

const MealResultScreen = ({ route, navigation }) => {
  const { meal } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Food Image */}
        <Image source={{ uri: `${API_HOST}${meal.imageUrl}` }} style={styles.image} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.mealType}>
              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
            </Text>
            <Text style={styles.title}>
              {meal.foods.map((f) => f.name).join(', ')}
            </Text>
          </View>
        </View>

        {/* Total Nutrition */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalIcon}>🔥</Text>
              <Text style={styles.totalLabel}>Calories</Text>
              <Text style={styles.totalValue}>{Math.round(meal.totals.calories)}</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalIcon, { color: colors.carbs }]}>🌾</Text>
              <Text style={styles.totalLabel}>Carbs</Text>
              <Text style={styles.totalValue}>{Math.round(meal.totals.carbs)}g</Text>
            </View>
          </View>
          <View style={styles.totalRow}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalIcon, { color: colors.protein }]}>⚡</Text>
              <Text style={styles.totalLabel}>Protein</Text>
              <Text style={styles.totalValue}>{Math.round(meal.totals.protein)}g</Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalIcon, { color: colors.fat }]}>💧</Text>
              <Text style={styles.totalLabel}>Fats</Text>
              <Text style={styles.totalValue}>{Math.round(meal.totals.fat)}g</Text>
            </View>
          </View>
        </View>

        {/* Individual Food Items */}
        <Text style={styles.sectionTitle}>Detected Items</Text>
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

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('HomeTabs')}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
  },
  header: {
    padding: spacing.lg,
  },
  mealType: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: 4,
  },
  totalCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  totalItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  totalValue: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  foodItem: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
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
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneBtn: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

export default MealResultScreen;
