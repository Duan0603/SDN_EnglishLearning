import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header Section */}
          <View style={{ backgroundColor: '#00D1A0', paddingTop: insets.top + 20, paddingHorizontal: 32, height: 260 }}>
            {/* We don't have a back button on Login usually, but we keep the space */}
            <View style={{ height: 40 }} />
            <Text variant="displaySmall" style={{ color: '#FFFFFF', fontFamily: 'Outfit_700Bold', lineHeight: 44 }}>
              Welcome{'\n'}Back
            </Text>
          </View>
          
          {/* Wave */}
          <View style={{ backgroundColor: '#FFFFFF', marginTop: -1 }}>
            <Svg height="80" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <Path 
                fill="#00D1A0" 
                d="M0,0 L1440,0 L1440,120 C1140,320 960,20 720,120 C480,220 240,40 0,120 Z" 
              />
            </Svg>
          </View>

          {/* Form Section */}
          <View style={{ flex: 1, paddingHorizontal: 32, paddingTop: 16, paddingBottom: 40 }}>
            {!!error && (
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: '#DC2626', textAlign: 'center', fontFamily: 'Outfit_500Medium' }}>{error}</Text>
              </View>
            )}

            <View style={{ gap: 8, marginBottom: 24 }}>
              <TextInput
                mode="flat"
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                // left={<TextInput.Icon icon="email-outline" color="#737373" />}
                style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                activeUnderlineColor="#00D1A0"
                underlineColor="#E5E7EB"
              />

              <View>
                <TextInput
                  mode="flat"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  // left={<TextInput.Icon icon="lock-outline" color="#737373" />}
                  style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                  activeUnderlineColor="#00D1A0"
                  underlineColor="#E5E7EB"
                />
                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 12 }}>
                  <Text style={{ color: '#00D1A0', fontFamily: 'Outfit_500Medium' }}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button 
              mode="contained" 
              onPress={handleLogin} 
              loading={isLoading}
              disabled={isLoading}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, fontFamily: 'Outfit_700Bold' }}
              style={{ borderRadius: 12, marginBottom: 16, elevation: 0 }}
            >
              Log in
            </Button>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              <Text style={{ marginHorizontal: 16, color: '#737373', fontFamily: 'Outfit_400Regular' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            </View>

            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Register')}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, color: '#737373', fontFamily: 'Outfit_500Medium' }}
              style={{ borderRadius: 12, borderColor: '#E5E7EB' }}
            >
              Sign up
            </Button>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
