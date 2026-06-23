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

<<<<<<< HEAD
// ── Prefix for deep linking
const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'ielts-app://'],
  config: {
    screens: {
      ResetPassword: 'reset-password',
    },
  },
=======
// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExamScreen from '../screens/ExamScreen';
import AdminScreen from '../screens/AdminScreen';
import MentorsScreen from '../screens/MentorsScreen';
import useAuthStore from '../store/useAuthStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for Main Screens
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00CC99',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
              <Rect x="3" y="3" width="7" height="9" rx="1" />
              <Rect x="14" y="3" width="7" height="5" rx="1" />
              <Rect x="14" y="12" width="7" height="9" rx="1" />
              <Rect x="3" y="16" width="7" height="5" rx="1" />
            </Svg>
          ),
        }}
      />
      <Tab.Screen 
        name="Practice" 
        component={PracticeScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </Svg>
          ),
        }}
      />
      <Tab.Screen 
        name="Mentors" 
        component={MentorsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <Circle cx="9" cy="7" r="4" />
              <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </Svg>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>
          ),
        }}
      />
    </Tab.Navigator>
  );
>>>>>>> origin/main
};

// ── Screens ────────────────────────────────────────────────
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen  from '../screens/ResetPasswordScreen';
import HomeScreen     from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import ExamScreen     from '../screens/ExamScreen';
import SpeakingScreen from '../screens/SpeakingScreen';
import AdminScreen    from '../screens/AdminScreen';

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
      component={ProfileScreen}
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
<<<<<<< HEAD
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
=======
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Exam" component={ExamScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Mentors" component={MentorsScreen} />
>>>>>>> origin/main
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
