import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import "./global.css";

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}
