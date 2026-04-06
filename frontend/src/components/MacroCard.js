import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, borderRadius, fontSize } from '../theme/theme';

const MacroCard = ({ label, value, goal, color, unit = 'g' }) => {
  const remaining = Math.max(0, goal - value);
  const isOver = value > goal;
  const progress = Math.min(value / goal, 1);

  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {isOver ? Math.round(value - goal) : Math.round(remaining)}{unit}
      </Text>
      <Text style={styles.label}>{isOver ? `${label} over` : `${label} left`}</Text>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.surfaceLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  value: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
    marginBottom: 8,
  },
  ringContainer: {
    marginTop: 4,
  },
});

export default MacroCard;
