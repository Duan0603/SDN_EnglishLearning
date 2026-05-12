import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView
} from 'react-native';
import useAuthStore from '../store/useAuthStore';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleRegister = () => {
    register({ email, password, fullName });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="flex-grow">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8 justify-center"
        >
          <View className="mb-12 mt-10">
            <View className="w-16 h-16 bg-emerald-500 rounded-3xl mb-6 items-center justify-center">
              <Text className="text-white text-3xl font-black tracking-tighter">SD</Text>
            </View>
            <Text className="text-4xl font-black text-white mb-3 tracking-tight">Create Account</Text>
            <Text className="text-lg text-slate-400 font-medium">Start your journey to IELTS success.</Text>
          </View>

          <View className="w-full">
            {error && (
              <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-6">
                <Text className="text-red-400 text-center font-medium">{error}</Text>
              </View>
            )}
            
            <View className="space-y-4 mb-8">
              <TextInput
                className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
              />

              <TextInput
                className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                placeholder="Email address"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                placeholder="Password"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              className="bg-emerald-500 p-5 rounded-2xl items-center active:scale-[0.98] transition-transform"
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-xl font-bold tracking-wide">Sign Up</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-10 mb-10">
              <Text className="text-slate-500 text-base font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-emerald-400 text-base font-bold">Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
