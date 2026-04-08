import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Image, Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize } from '../../theme/theme';
import { mealsAPI } from '../../services/api';

const CameraScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mealType, setMealType] = useState('snack');
  const cameraRef = useRef(null);

  const takePhoto = async () => {
    if (cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhoto(result.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const analyzeMeal = async () => {
    if (!photo) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      const uri = Platform.OS === 'android' && !photo.startsWith('file://') ? `file://${photo}` : photo;
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'meal.jpg',
      });
      formData.append('mealType', mealType);

      const response = await mealsAPI.create(formData);
      navigation.replace('MealResult', { meal: response.data.meal });
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permText}>Camera access is needed to scan food</Text>
        <Pressable style={styles.permButton} onPress={requestPermission}>
          <Text style={styles.permButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  if (analyzing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.analyzingText}>Analyzing your meal...</Text>
        <Text style={styles.analyzingSubtext}>AI is identifying foods and estimating nutrition</Text>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.previewControls}>
          <Text style={styles.mealTypeLabel}>MEAL TYPE</Text>
          <View style={styles.mealTypeRow}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <Pressable
                key={type}
                style={({ pressed }) => [
                  styles.mealTypeChip,
                  mealType === type && styles.mealTypeChipActive,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setMealType(type)}
              >
                <Text style={[styles.mealTypeText, mealType === type && styles.mealTypeTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.previewActions}>
            <Pressable
              style={({ pressed }) => [styles.retakeBtn, pressed && { opacity: 0.7 }]}
              onPress={() => setPhoto(null)}
            >
              <Text style={styles.retakeBtnText}>Retake</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.analyzeBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
              onPress={analyzeMeal}
            >
              <Text style={styles.analyzeBtnText}>Scan food</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.cameraOverlay}>
          <Text style={styles.instructionText}>Point at your meal</Text>
          <View style={styles.scanFrame} />
        </View>
      </CameraView>
      <View style={styles.cameraControls}>
        <Pressable
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.7 }]}
          onPress={pickImage}
        >
          <Text style={styles.sideBtnIcon}>gallery</Text>
        </Pressable>
        <Pressable onPress={takePhoto}>
          <View style={styles.captureBtn}>
            <View style={styles.captureBtnInner} />
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.sideBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.sideBtnIcon}>close</Text>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xl,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.text,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtnIcon: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  preview: {
    flex: 1,
  },
  previewControls: {
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 40,
  },
  mealTypeLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xxs,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: spacing.sm,
  },
  mealTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  mealTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceRaised,
  },
  mealTypeChipActive: {
    backgroundColor: colors.accent,
  },
  mealTypeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  mealTypeTextActive: {
    color: '#000000',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  retakeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  analyzeBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
  analyzeBtnText: {
    color: '#000000',
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  permText: {
    color: colors.text,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  permButtonText: {
    color: '#000000',
    fontWeight: '800',
  },
  analyzingText: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  analyzingSubtext: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default CameraScreen;
