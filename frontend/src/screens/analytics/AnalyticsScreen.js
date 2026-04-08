import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Dimensions,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize, TAB_BAR_TOTAL_HEIGHT } from '../../theme/theme';
import { analyticsAPI } from '../../services/api';

const screenWidth = Dimensions.get('window').width - 40;

const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(200, 255, 0, ${opacity})`,
  labelColor: () => colors.textSecondary,
  propsForBackgroundLines: {
    stroke: colors.ringTrack,
    strokeWidth: 1,
  },
  barPercentage: 0.6,
  barRadius: 8,
};

const AnalyticsScreen = () => {
  const [view, setView] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === 'weekly') {
        const monday = getMonday(new Date()).toISOString().split('T')[0];
        const res = await analyticsAPI.weekly(monday);
        setData(res.data);
      } else {
        const now = new Date();
        const res = await analyticsAPI.monthly(now.getMonth() + 1, now.getFullYear());
        setData(res.data);
      }
    } catch (error) {
      console.error('Analytics fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyChartData = () => {
    if (!data?.days) return null;
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: data.days.map((d) => d.totals.calories || 0) }],
    };
  };

  const getMonthlyChartData = () => {
    if (!data?.days) return null;
    const labels = data.days.filter((_, i) => i % 5 === 0).map((d) => {
      return parseInt(d.date.split('-')[2]).toString();
    });
    return {
      labels,
      datasets: [{
        data: data.days.map((d) => d.totals.calories || 0),
        color: (opacity = 1) => `rgba(200, 255, 0, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const avg = data?.average || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const days = data?.days || [];

  // Compute summary stats
  const bestDay = days.length > 0
    ? Math.round(Math.max(...days.map(d => d.totals.calories)))
    : 0;
  const totalLogged = days.reduce((sum, d) => sum + (d.totals.calories > 0 ? 1 : 0), 0);
  const streak = (() => {
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].totals.calories > 0) count++;
      else break;
    }
    return count;
  })();

  const minChartWidth = Math.max(screenWidth - 32, 320);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Analytics</Text>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          {['weekly', 'monthly'].map((v) => (
            <Pressable
              key={v}
              style={({ pressed }) => [
                styles.toggleBtn,
                view === v && styles.toggleBtnActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setView(v);
              }}
            >
              <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Calories Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>CALORIES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {view === 'weekly' && getWeeklyChartData() ? (
                  <BarChart
                    data={getWeeklyChartData()}
                    width={minChartWidth}
                    height={200}
                    chartConfig={chartConfig}
                    fromZero
                    showValuesOnTopOfBars
                    withInnerLines={true}
                    style={styles.chart}
                  />
                ) : getMonthlyChartData() ? (
                  <LineChart
                    data={getMonthlyChartData()}
                    width={minChartWidth}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    withInnerLines={true}
                    withDots={false}
                    style={styles.chart}
                  />
                ) : null}
              </ScrollView>
            </View>

            {/* Summary Stats 2x2 Grid */}
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{Math.round(avg.calories)}</Text>
                <Text style={styles.summaryLabel}>AVG DAILY</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{bestDay}</Text>
                <Text style={styles.summaryLabel}>BEST DAY</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.streakValue}>{streak}</Text>
                <Text style={styles.summaryLabel}>STREAK</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalLogged}</Text>
                <Text style={styles.summaryLabel}>TOTAL LOGGED</Text>
              </View>
            </View>

            {/* Protein Trend */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>PROTEIN TREND</Text>
              {data?.days && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <LineChart
                    data={{
                      labels: view === 'weekly'
                        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        : data.days.filter((_, i) => i % 5 === 0).map((d) =>
                            parseInt(d.date.split('-')[2]).toString()
                          ),
                      datasets: [{
                        data: data.days.map((d) => d.totals.protein || 0),
                        color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                        strokeWidth: 2,
                      }],
                    }}
                    width={minChartWidth}
                    height={180}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                    }}
                    bezier
                    withInnerLines={false}
                    withDots={false}
                    style={styles.chart}
                  />
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: TAB_BAR_TOTAL_HEIGHT,
  },
  screenTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceRaised,
    borderRadius: borderRadius.pill,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.pill,
  },
  toggleBtnActive: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#000000',
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: spacing.md,
  },
  chartTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
    marginLeft: -16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryItem: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
  },
  summaryValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -1,
  },
  streakValue: {
    color: colors.warning,
    fontSize: fontSize.xl,
    fontWeight: '800',
    letterSpacing: -1,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
});

export default AnalyticsScreen;
