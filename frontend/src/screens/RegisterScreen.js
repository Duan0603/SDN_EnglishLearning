import React, { useState, useEffect } from 'react';
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

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { register, isLoading, error } = useAuthStore();

  const clearErrors = () => {
    setValidationError('');
    useAuthStore.setState({ error: null });
  };

  useEffect(() => {
    if (error) {
      if (error.toLowerCase().includes('username')) {
        setStep(1);
      } else if (error.toLowerCase().includes('email')) {
        setStep(2);
      }
    }
  }, [error]);

  const handleNextStep1 = () => {
    if (!username.trim()) {
      setValidationError('Please choose a username.');
      return;
    }
    if (username.trim().length < 3) {
      setValidationError('Username must be at least 3 characters.');
      return;
    }
    clearErrors();
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    clearErrors();
    setStep(3);
  };

  const handleRegister = () => {
    if (!fullName.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    clearErrors();
    register({ 
      username: username.trim(), 
      email: email.trim(), 
      password, 
      fullName: fullName.trim() 
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8 justify-center py-10"
        >
          {/* Logo Brand */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-white rounded-[24px] items-center justify-center shadow-xs border border-[#E5E7EB] mb-3">
              <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00CC99" />
                <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill="#005C42" />
                <Path d="M21.5 10v5.5" stroke="#00CC99" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
            </View>
            <View className="flex-row items-center justify-center">
              <Text className="text-2xl font-bold text-[#1E1E1E]">Apex</Text>
              <Text className="text-2xl font-bold text-[#00CC99] ml-1">IELTS</Text>
            </View>
          </View>

          {/* Form Card */}
          <View className="w-full bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-xs">
            {/* Step Title */}
            <View className="mb-4">
              {step === 1 && (
                <>
                  <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight">Choose a username</Text>
                  <Text className="text-sm text-[#6B7280] mt-1 font-medium">This will be your unique identity on Apex.</Text>
                </>
              )}
              {step === 2 && (
                <>
                  <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight">Secure account</Text>
                  <Text className="text-sm text-[#6B7280] mt-1 font-medium">Enter your email and a strong password.</Text>
                </>
              )}
              {step === 3 && (
                <>
                  <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight">What's your name?</Text>
                  <Text className="text-sm text-[#6B7280] mt-1 font-medium">We'll use this to personalize your study plan.</Text>
                </>
              )}
            </View>

            {/* Progress Bar */}
            <View className="flex-row space-x-2 mb-6 items-center">
              <View className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-[#00CC99]' : 'bg-[#E5E7EB]'}`} />
              <View className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-[#00CC99]' : 'bg-[#E5E7EB]'}`} />
              <View className={`flex-1 h-1.5 rounded-full ${step >= 3 ? 'bg-[#00CC99]' : 'bg-[#E5E7EB]'}`} />
            </View>

            {/* Error Message */}
            {(error || validationError) && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-2xl mb-6">
                <Text className="text-red-600 text-center font-semibold text-sm">
                  {validationError || error}
                </Text>
              </View>
            )}
            
            {/* Step Inputs */}
            {step === 1 && (
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Username</Text>
                  <TextInput
                    className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white"
                    placeholder="e.g. ielts_warrior"
                    placeholderTextColor="#9CA3AF"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      clearErrors();
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <TouchableOpacity 
                  className="bg-[#00CC99] py-4 rounded-2xl items-center shadow-sm active:opacity-90 mt-4"
                  onPress={handleNextStep1}
                >
                  <Text className="text-white text-lg font-bold tracking-wide">Continue</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Email address</Text>
                  <TextInput
                    className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white mb-2"
                    placeholder="name@example.com"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearErrors();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View>
                  <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Password</Text>
                  <TextInput
                    className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white"
                    placeholder="At least 6 characters"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearErrors();
                    }}
                    secureTextEntry
                  />
                </View>

                <View className="flex-row space-x-3 mt-6">
                  <TouchableOpacity 
                    className="bg-[#F7F9FA] border border-[#E5E7EB] py-4 rounded-2xl items-center justify-center w-24 active:opacity-80"
                    onPress={() => {
                      clearErrors();
                      setStep(1);
                    }}
                  >
                    <Text className="text-[#6B7280] text-base font-bold">Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center flex-1 shadow-sm active:opacity-90"
                    onPress={handleNextStep2}
                  >
                    <Text className="text-white text-lg font-bold tracking-wide">Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View className="space-y-4">
                <View>
                  <Text className="text-sm font-bold text-[#1E1E1E] mb-2 ml-1">Full Name</Text>
                  <TextInput
                    className="bg-[#F7F9FA] text-[#1E1E1E] px-5 py-4 rounded-2xl border border-[#E5E7EB] text-base focus:border-[#00CC99] focus:bg-white"
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      clearErrors();
                    }}
                  />
                </View>

                <View className="flex-row space-x-3 mt-6">
                  <TouchableOpacity 
                    className="bg-[#F7F9FA] border border-[#E5E7EB] py-4 rounded-2xl items-center justify-center w-24 active:opacity-80"
                    onPress={() => {
                      clearErrors();
                      setStep(2);
                    }}
                    disabled={isLoading}
                  >
                    <Text className="text-[#6B7280] text-base font-bold">Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center flex-1 shadow-sm active:opacity-90"
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white text-lg font-bold tracking-wide">Register</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-[#6B7280] text-base font-medium">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#00CC99] text-base font-bold">Log in</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
