import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExamScreen from '../screens/ExamScreen';
import AdminScreen from '../screens/AdminScreen';

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
        component={ProfileScreen} 
        listeners={{
          tabPress: e => {
            // Placeholder: Navigate to Mentor screen or show coming soon
          },
        }}
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
};

const AppNavigator = () => {
  const { user, restoreToken, isBootstrapping } = useAuthStore();

  useEffect(() => {
    restoreToken();
  }, []);

  if (isBootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#00D1A0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="HomePreview" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main App
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="Exam" component={ExamScreen} />
            <Stack.Screen name="Admin" component={AdminScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
