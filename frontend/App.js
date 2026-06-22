import React from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import "./global.css";
import { MD3LightTheme as DefaultTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { 
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from '@expo-google-fonts/outfit';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// ── BẢO ĐẢM ĐỒNG BỘ LOGO/ICON TRÊN WEB ─────────────────────────
if (Platform.OS === 'web') {
  const iconFontStyles = `
    @font-face {
      src: url('https://unpkg.com/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf');
      font-family: Ionicons;
    }
    @font-face {
      src: url('https://unpkg.com/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf');
      font-family: MaterialDesignIcons;
    }
    @font-face {
      src: url('https://unpkg.com/@expo/vector-icons@14.0.2/build/vendor/react-native-vector-icons/Fonts/Feather.ttf');
      font-family: Feather;
    }
  `;
  if (!document.getElementById('vector-icons-web-fonts')) {
    const style = document.createElement('style');
    style.id = 'vector-icons-web-fonts';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(iconFontStyles));
    document.head.appendChild(style);
  }
}

const fontConfig = {
  fontFamily: 'Outfit_400Regular',
};

const theme = {
  ...DefaultTheme,
  fonts: configureFonts({config: fontConfig}),
  colors: {
    ...DefaultTheme.colors,
    primary: '#00D1A0',
    onPrimary: '#FFFFFF',
    secondary: '#000000',
    onSecondary: '#FFFFFF',
    tertiary: '#F5F5F5',
    onTertiary: '#000000',
    surface: '#FFFFFF',
    onSurface: '#1E1E1E',
    background: '#F7F9FA',
    onBackground: '#1E1E1E',
    outline: '#737373',
  },
};

export default function App() {
  let [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
    ...Feather.font,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00D1A0" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
      <StatusBar style="auto" />
      <Toast />
    </PaperProvider>
  );
}
