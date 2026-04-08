import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import HomeScreen from '../screens/home/HomeScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors, TAB_BAR_HEIGHT } from '../theme/theme';

const Tab = createBottomTabNavigator();

// Lucide-style SVG icons
const HomeIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const ChartIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 20V10" />
    <Path d="M12 20V4" />
    <Path d="M6 20v-6" />
  </Svg>
);

const CameraIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <Path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const UserIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
  </Svg>
);

const icons = {
  Home: HomeIcon,
  CameraPlaceholder: CameraIcon,
  Analytics: ChartIcon,
  Settings: UserIcon,
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrapper, { bottom: Math.max(insets.bottom, 20) }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="dark" style={styles.tabBarBlur}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCamera = route.name === 'CameraPlaceholder';
            const IconComponent = icons[route.name];

            const onPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isCamera) {
                navigation.navigate('Camera');
                return;
              }
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            if (isCamera) {
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  style={styles.cameraTabWrapper}
                >
                  <View style={styles.cameraCircle}>
                    <IconComponent color="#000000" size={28} />
                  </View>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View style={[
                  styles.tabIconWrap,
                  isFocused && styles.tabIconWrapActive,
                ]}>
                  <IconComponent
                    color={isFocused ? colors.accent : colors.textMuted}
                    size={22}
                  />
                </View>
                {isFocused && <View style={styles.activeDot} />}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

// Dummy screen for the camera tab placeholder
const CameraPlaceholder = () => null;

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="CameraPlaceholder" component={CameraPlaceholder} />
      <Tab.Screen name="Settings" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBarBlur: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.tabBarBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 20,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: TAB_BAR_HEIGHT,
    paddingHorizontal: 24,
    backgroundColor: Platform.OS === 'android' ? colors.tabBarBg : 'transparent',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    height: TAB_BAR_HEIGHT,
  },
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: colors.accentSubtle,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  cameraTabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cameraCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabNavigator;
