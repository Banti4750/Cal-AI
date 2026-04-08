import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize, TAB_BAR_TOTAL_HEIGHT } from '../../theme/theme';
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {greeting()}, {user?.name?.split(' ')[0] || 'there'}
          </Text>
          <Text style={styles.dateText}>{dateString}</Text>
        </View>

        {/* Day Toggle */}
        <View style={styles.tabRow}>
          {['Today', 'Yesterday'].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab(tab);
              }}
              style={({ pressed }) => [
                styles.tab,
                selectedTab === tab && styles.tabActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Calorie Ring Card */}
        <View style={styles.ringCard}>
          <CalorieRing consumed={Math.round(totals.calories)} goal={goal.calories} />
          <View style={styles.macroPillRow}>
            <MacroCard label="Protein" value={totals.protein} goal={goal.protein} color={colors.protein} />
            <MacroCard label="Carbs" value={totals.carbs} goal={goal.carbs} color={colors.carbs} />
            <MacroCard label="Fat" value={totals.fat} goal={goal.fat} color={colors.fat} />
          </View>
        </View>

        {/* Meals Feed */}
        <Text style={styles.sectionLabel}>TODAY'S MEALS</Text>
        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>+</Text>
            <Text style={styles.emptyText}>Tap + to log your first meal</Text>
          </View>
        ) : (
          meals.map((meal) => (
            <MealCard
              key={meal._id}
              meal={meal}
              onPress={() => navigation.navigate('MealResult', { meal })}
            />
          ))
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: TAB_BAR_TOTAL_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000000',
  },
  ringCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  macroPillRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
  },
  emptyIcon: {
    color: colors.textMuted,
    fontSize: 40,
    fontWeight: '300',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});

export default HomeScreen;
