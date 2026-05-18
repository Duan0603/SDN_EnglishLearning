import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import useAuthStore from '../store/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8 justify-center"
      >
        <View className="mb-12">
          <View className="w-16 h-16 bg-indigo-600 rounded-3xl mb-6 items-center justify-center">
            <Text className="text-white text-3xl font-black tracking-tighter">SD</Text>
          </View>
          <Text className="text-4xl font-black text-white mb-3 tracking-tight">Welcome Back</Text>
          <Text className="text-lg text-slate-400 font-medium">Log in to unlock your IELTS potential.</Text>
        </View>

        <View className="w-full">
          {error && (
            <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-6">
              <Text className="text-red-400 text-center font-medium">{error}</Text>
            </View>
          )}
          
          <View className="space-y-4 mb-8">
            <TextInput
              className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-indigo-500 focus:bg-slate-900/80 transition-colors"
              placeholder="Username or Email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-indigo-500 focus:bg-slate-900/80 transition-colors"
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            className="bg-indigo-600 p-5 rounded-2xl items-center active:scale-[0.98] transition-transform"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-xl font-bold tracking-wide">Sign In</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-10">
            <Text className="text-slate-500 text-base font-medium">New here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-indigo-400 text-base font-bold">Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
