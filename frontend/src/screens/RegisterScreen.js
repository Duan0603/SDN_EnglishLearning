import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import { AntDesign } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const { register, googleLogin, isLoading, error } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    webClientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      googleLogin(id_token);
    }
  }, [response]);

  const handleRegister = () => {
    if (!fullName.trim()) {
      setValidationError('Please enter your name.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    setValidationError('');
    
    // Using email as username since the UI doesn't have a separate username field anymore,
    // or generating a username from email if the backend requires one.
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
    
    register({ 
      username: username, 
      email: email.trim(), 
      password, 
      fullName: fullName.trim() 
    });
  };

  const clearErrors = () => {
    if (validationError) setValidationError('');
    if (error) useAuthStore.setState({ error: null });
  };

  const handleGoogleRegister = () => {
    promptAsync();
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
            <View style={{ height: 40 }} />
            <Text variant="displaySmall" style={{ color: '#FFFFFF', fontFamily: 'Outfit_700Bold', lineHeight: 44 }}>
              Create{'\n'}Account
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
            {!!(error || validationError) && (
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: '#DC2626', textAlign: 'center', fontFamily: 'Outfit_500Medium' }}>
                  {validationError || error}
                </Text>
              </View>
            )}

            <View style={{ gap: 8, marginBottom: 32 }}>
              <TextInput
                mode="flat"
                label="Name"
                placeholder="Full Name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearErrors();
                }}
                autoCapitalize="words"
                autoCorrect={false}
                // left={<TextInput.Icon icon="account-outline" color="#737373" />}
                style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                activeUnderlineColor="#00D1A0"
                underlineColor="#E5E7EB"
              />

              <TextInput
                mode="flat"
                label="Email"
                placeholder="name@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearErrors();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                // left={<TextInput.Icon icon="email-outline" color="#737373" />}
                style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                activeUnderlineColor="#00D1A0"
                underlineColor="#E5E7EB"
              />

              <TextInput
                mode="flat"
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearErrors();
                }}
                secureTextEntry
                // left={<TextInput.Icon icon="lock-outline" color="#737373" />}
                style={{ backgroundColor: 'transparent', paddingHorizontal: 0 }}
                activeUnderlineColor="#00D1A0"
                underlineColor="#E5E7EB"
              />
            </View>

            <Button 
              mode="contained" 
              onPress={handleRegister} 
              loading={isLoading}
              disabled={isLoading}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, fontFamily: 'Outfit_700Bold' }}
              style={{ borderRadius: 12, marginBottom: 16, elevation: 0 }}
            >
              Sign up
            </Button>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              <Text style={{ marginHorizontal: 16, color: '#737373', fontFamily: 'Outfit_400Regular' }}>or</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            </View>

            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Login')}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, color: '#737373', fontFamily: 'Outfit_500Medium' }}
              style={{ borderRadius: 12, borderColor: '#E5E7EB', marginBottom: 16 }}
            >
              Log in
            </Button>

            <Button 
              mode="outlined" 
              onPress={handleGoogleRegister}
              disabled={!request || isLoading}
              icon={() => <AntDesign name="google" size={20} color="#DB4437" />}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, color: '#374151', fontFamily: 'Outfit_500Medium' }}
              style={{ borderRadius: 12, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
            >
              Sign up with Google
            </Button>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
