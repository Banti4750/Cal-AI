import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { mealsAPI, analyticsAPI } from '../../services/api';
import CalorieRing from '../../components/CalorieRing';
import MacroCard from '../../components/MacroCard';
import MealCard from '../../components/MealCard';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Today');

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    try {
      const date = selectedTab === 'Today' ? today : yesterday;
      const [summaryRes, mealsRes] = await Promise.all([
        analyticsAPI.daily(date),
        mealsAPI.getByDate(date),
      ]);
      setSummary(summaryRes.data);
      setMeals(mealsRes.data.meals);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const goal = summary?.goal || user?.dailyGoal || { calories: 2500, protein: 150, carbs: 250, fat: 65 };
  const totals = summary?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>🍎 Cal AI</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>15</Text>
          </View>
        </View>

        {/* Day Toggle */}
        <View style={styles.tabRow}>
          {['Today', 'Yesterday'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calorie Ring */}
        <View style={styles.ringSection}>
          <CalorieRing consumed={Math.round(totals.calories)} goal={goal.calories} />
        </View>

        {/* Macro Cards */}
        <View style={styles.macroRow}>
          <MacroCard label="Protein" value={totals.protein} goal={goal.protein} color={colors.protein} />
          <MacroCard label="Carbs" value={totals.carbs} goal={goal.carbs} color={colors.carbs} />
          <MacroCard label="Fats" value={totals.fat} goal={goal.fat} color={colors.fat} />
        </View>

        {/* Recent Meals */}
        <Text style={styles.sectionTitle}>Recently uploaded</Text>
        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <Text style={styles.emptySubtext}>Tap + to scan your first meal</Text>
          </View>
        ) : (
          meals.map((meal) => (
            <MealCard key={meal._id} meal={meal} onPress={() => navigation.navigate('MealResult', { meal })} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    color: colors.streak,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  ringSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: colors.background,
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
});

export default HomeScreen;
