// ============================================================
// AppNavigator - Mobile-First Navigation
// Stack + Bottom Tabs + conditional Auth flow
// NO web menus, NO sidebars, pure native navigation
// ============================================================

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';

// ── Prefix for deep linking
const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'ielts-app://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
};

// ── Screens ────────────────────────────────────────────────
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen  from '../screens/ResetPasswordScreen';
import HomeScreen     from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ExamScreen     from '../screens/ExamScreen';
import SpeakingScreen from '../screens/SpeakingScreen';
import AdminScreen    from '../screens/AdminScreen';
import MentorsScreen  from '../screens/MentorsScreen';

// ── Shared ────────────────────────────────────────────────
import AppIcon          from '../shared/icons/AppIcon';
import useAuthStore     from '../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Tab label component ────────────────────────────────────
const TabLabel = ({ label, focused }) => (
  <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
    {label}
  </Text>
);

// ── Bottom Tab Navigator ───────────────────────────────────
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle:  tabStyles.bar,
      tabBarShowLabel: true,
      tabBarLabelPosition: 'below-icon',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Trang chủ',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name={focused ? 'home' : 'home-outline'}
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Trang chủ" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Practice"
      component={PracticeScreen}
      options={{
        title: 'Luyện tập',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name={focused ? 'practice' : 'practice-outline'}
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Luyện tập" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        title: 'Tiến độ',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name="progress"
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Tiến độ" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Mentors"
      component={MentorsScreen}
      options={{
        title: 'Gia sư',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name="practice" // Fallback icon since mentors might not exist in HEAD
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Gia sư" focused={focused} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Cá nhân',
        tabBarIcon: ({ focused }) => (
          <AppIcon
            name={focused ? 'profile' : 'profile-outline'}
            size={24}
            color={focused ? COLORS.tabActive : COLORS.tabInactive}
          />
        ),
        tabBarLabel: ({ focused }) => <TabLabel label="Cá nhân" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);

// ── Splash / Bootstrapping screen ─────────────────────────
const SplashScreen = () => (
  <View style={splashStyles.container}>
    <View style={splashStyles.logo}>
      <Text style={splashStyles.logoText}>AI</Text>
    </View>
    <Text style={splashStyles.brand}>Apex IELTS</Text>
    <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 32 }} />
  </View>
);

// ── Root Navigator ──────────────────────────────────────────
const AppNavigator = () => {
  const { user, restoreToken, isBootstrapping } = useAuthStore();

  useEffect(() => {
    restoreToken();
  }, []);

  if (isBootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {!user ? (
          // ── AUTH STACK ────────────────────────────────────
          <>
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          // ── MAIN APP ──────────────────────────────────────
          <>
            <Stack.Screen name="Main"  component={MainTabNavigator} />
            <Stack.Screen name="Exam"  component={ExamScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="Speaking" component={SpeakingScreen}
              options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="Admin" component={AdminScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen name="Mentors" component={MentorsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.tabBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 10,
    ...{ shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 10 },
  },
  label: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.tabInactive,
    marginTop: 3,
  },
  labelActive: {
    color: COLORS.tabActive,
    fontFamily: TYPOGRAPHY.fontBold,
  },
});

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fontBlack || 'System',
    color: COLORS.textInverse,
  },
  brand: {
    fontSize: 26,
    fontFamily: TYPOGRAPHY.fontBlack || 'System',
    color: COLORS.textPrimary,
  },
});

export default AppNavigator;
