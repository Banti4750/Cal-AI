import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';
import { analyticsAPI } from '../../services/api';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundColor: colors.surface,
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: colors.surfaceLight,
    strokeWidth: 1,
  },
  barPercentage: 0.6,
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
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      labels: dayLabels,
      datasets: [{
        data: data.days.map((d) => d.totals.calories),
      }],
    };
  };

  const getMonthlyChartData = () => {
    if (!data?.days) return null;
    const labels = data.days.filter((_, i) => i % 5 === 0).map((d) => {
      const day = parseInt(d.date.split('-')[2]);
      return `${day}`;
    });
    return {
      labels,
      datasets: [{
        data: data.days.map((d) => d.totals.calories),
        color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const avg = data?.average || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal = data?.goal || { calories: 2500, protein: 150, carbs: 250, fat: 65 };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Analytics</Text>

        {/* View Toggle */}
        <View style={styles.toggleRow}>
          {['weekly', 'monthly'].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}
              onPress={() => setView(v)}
            >
              <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Calories Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Calories</Text>
              {view === 'weekly' && getWeeklyChartData() ? (
                <BarChart
                  data={getWeeklyChartData()}
                  width={screenWidth - 32}
                  height={200}
                  chartConfig={chartConfig}
                  fromZero
                  showValuesOnTopOfBars
                  withInnerLines={false}
                  style={styles.chart}
                />
              ) : getMonthlyChartData() ? (
                <LineChart
                  data={getMonthlyChartData()}
                  width={screenWidth - 32}
                  height={200}
                  chartConfig={chartConfig}
                  bezier
                  withInnerLines={false}
                  withDots={false}
                  style={styles.chart}
                />
              ) : null}
            </View>

            {/* Average Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {view === 'weekly' ? 'Weekly' : 'Monthly'} Average
              </Text>
              <View style={styles.summaryGrid}>
                <SummaryItem label="Calories" value={avg.calories} unit="kcal" goal={goal.calories} color={colors.text} />
                <SummaryItem label="Protein" value={avg.protein} unit="g" goal={goal.protein} color={colors.protein} />
                <SummaryItem label="Carbs" value={avg.carbs} unit="g" goal={goal.carbs} color={colors.carbs} />
                <SummaryItem label="Fat" value={avg.fat} unit="g" goal={goal.fat} color={colors.fat} />
              </View>
            </View>

            {/* Macro Breakdown Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Protein Trend</Text>
              {data?.days && (
                <LineChart
                  data={{
                    labels: view === 'weekly'
                      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                      : data.days.filter((_, i) => i % 5 === 0).map((d) => parseInt(d.date.split('-')[2]).toString()),
                    datasets: [
                      {
                        data: data.days.map((d) => d.totals.protein || 0),
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                        strokeWidth: 2,
                      },
                    ],
                  }}
                  width={screenWidth - 32}
                  height={180}
                  chartConfig={chartConfig}
                  bezier
                  withInnerLines={false}
                  withDots={false}
                  style={styles.chart}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const SummaryItem = ({ label, value, unit, goal, color }) => {
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0;
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>
        {Math.round(value)} {unit}
      </Text>
      <Text style={styles.summaryPct}>{pct}% of goal</Text>
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
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: 100,
  },
  screenTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  toggleBtnActive: {
    backgroundColor: colors.surfaceLight,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.text,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  chartTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryItem: {
    width: '46%',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  summaryValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryPct: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
});

export default AnalyticsScreen;
