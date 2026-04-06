import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const ProfileScreen = () => {
  const { user, signout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState({
    calories: String(user?.dailyGoal?.calories || 2500),
    protein: String(user?.dailyGoal?.protein || 150),
    carbs: String(user?.dailyGoal?.carbs || 250),
    fat: String(user?.dailyGoal?.fat || 65),
  });

  const handleSaveGoals = async () => {
    try {
      const numGoals = {
        calories: parseInt(goals.calories) || 2500,
        protein: parseInt(goals.protein) || 150,
        carbs: parseInt(goals.carbs) || 250,
        fat: parseInt(goals.fat) || 65,
      };
      const res = await authAPI.updateGoals(numGoals);
      updateUser(res.data.user);
      setEditing(false);
      Alert.alert('Success', 'Daily goals updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update goals');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Settings</Text>

        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Daily Goals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Goals</Text>
            <TouchableOpacity onPress={() => editing ? handleSaveGoals() : setEditing(true)}>
              <Text style={styles.editBtn}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <GoalRow
            label="Calories"
            value={goals.calories}
            unit="kcal"
            editing={editing}
            onChange={(v) => setGoals({ ...goals, calories: v })}
          />
          <GoalRow
            label="Protein"
            value={goals.protein}
            unit="g"
            color={colors.protein}
            editing={editing}
            onChange={(v) => setGoals({ ...goals, protein: v })}
          />
          <GoalRow
            label="Carbs"
            value={goals.carbs}
            unit="g"
            color={colors.carbs}
            editing={editing}
            onChange={(v) => setGoals({ ...goals, carbs: v })}
          />
          <GoalRow
            label="Fat"
            value={goals.fat}
            unit="g"
            color={colors.fat}
            editing={editing}
            onChange={(v) => setGoals({ ...goals, fat: v })}
          />
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={signout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const GoalRow = ({ label, value, unit, color, editing, onChange }) => (
  <View style={styles.goalRow}>
    <Text style={[styles.goalLabel, color && { color }]}>{label}</Text>
    {editing ? (
      <View style={styles.goalInputWrap}>
        <TextInput
          style={styles.goalInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
        />
        <Text style={styles.goalUnit}>{unit}</Text>
      </View>
    ) : (
      <Text style={styles.goalValue}>{value} {unit}</Text>
    )}
  </View>
);

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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  editBtn: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  goalLabel: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  goalValue: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  goalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: colors.text,
    fontSize: fontSize.md,
    width: 80,
    textAlign: 'right',
  },
  goalUnit: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  signOutBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  signOutText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default ProfileScreen;
