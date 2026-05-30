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
import Svg, { Path } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = () => {
    login(email, password);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8 justify-center py-10"
        >
          {/* Logo Brand */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-white rounded-[28px] items-center justify-center shadow-sm border border-[#E5E7EB] mb-4">
              <Svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M12 2L2 7l10 5 10-5-10-5z" 
                  fill="#00CC99" 
                />
                <Path 
                  d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" 
                  fill="#005C42" 
                />
                <Path 
                  d="M21.5 10v5.5" 
                  stroke="#00CC99" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <View className="flex-row items-center justify-center">
              <Text className="text-3xl font-bold text-[#1E1E1E] tracking-tight">Apex</Text>
              <Text className="text-3xl font-bold text-[#00CC99] tracking-tight ml-1">IELTS</Text>
            </View>
            <Text className="text-base text-[#6B7280] mt-2 font-medium text-center">
              Unleash your full potential, achieve Band 8.0+
            </Text>
          </View>

          {/* Form */}
          <View className="w-full bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-xs">
            <Text className="text-2xl font-bold text-[#1E1E1E] mb-6 tracking-tight">
              Sign In
            </Text>

            {!!error && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6 flex-row items-center">
                <Text className="text-red-600 text-center font-semibold text-sm flex-1">{error}</Text>
              </View>
            )}

            <View className="space-y-4 mb-6">
              <View>
                <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Email or Username</Text>
                <TextInput
                  className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white"
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Password</Text>
                <TextInput
                  className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              className="bg-[#00CC99] py-4 rounded-2xl items-center shadow-sm active:opacity-90"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-lg font-bold tracking-wide">Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-[#6B7280] text-base font-medium">New to Apex IELTS? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-[#00CC99] text-base font-bold">Create account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
