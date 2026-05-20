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
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8 justify-center"
        >
          {/* Header */}
          <View className="mb-10 mt-10">
            <View className="w-16 h-16 bg-emerald-500 rounded-3xl mb-6 items-center justify-center">
              <Text className="text-white text-3xl font-black tracking-tighter">SD</Text>
            </View>
            
            {step === 1 && (
              <>
                <Text className="text-4xl font-black text-white mb-3 tracking-tight">Choose a username</Text>
                <Text className="text-lg text-slate-400 font-medium">This will be your unique identity on SDN.</Text>
              </>
            )}
            {step === 2 && (
              <>
                <Text className="text-4xl font-black text-white mb-3 tracking-tight">Secure account</Text>
                <Text className="text-lg text-slate-400 font-medium">Enter your email and a strong password.</Text>
              </>
            )}
            {step === 3 && (
              <>
                <Text className="text-4xl font-black text-white mb-3 tracking-tight">What's your name?</Text>
                <Text className="text-lg text-slate-400 font-medium">We'll use this to personalize your IELTS study plan.</Text>
              </>
            )}
          </View>

          <View className="w-full">
            {/* Progress Bar */}
            <View className="flex-row space-x-2 mb-8 items-center">
              <View className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <View className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              <View className={`flex-1 h-1.5 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
            </View>

            {/* Error Message */}
            {(error || validationError) && (
              <View className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-6">
                <Text className="text-red-400 text-center font-medium">
                  {validationError || error}
                </Text>
              </View>
            )}
            
            {/* Step Inputs */}
            {step === 1 && (
              <View className="space-y-6">
                <TextInput
                  className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                  placeholder="Username"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    clearErrors();
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  className="bg-emerald-500 p-5 rounded-2xl items-center active:scale-[0.98] transition-transform mt-4"
                  onPress={handleNextStep1}
                >
                  <Text className="text-white text-xl font-bold tracking-wide">Next</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View className="space-y-6">
                <TextInput
                  className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors mb-4"
                  placeholder="Email address"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearErrors();
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TextInput
                  className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                  placeholder="Password"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearErrors();
                  }}
                  secureTextEntry
                />

                <View className="flex-row space-x-4 mt-6">
                  <TouchableOpacity 
                    className="bg-slate-900 border border-slate-800 p-5 rounded-2xl items-center justify-center w-24 active:scale-[0.98] transition-transform"
                    onPress={() => {
                      clearErrors();
                      setStep(1);
                    }}
                  >
                    <Text className="text-slate-400 text-lg font-bold">Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-emerald-500 p-5 rounded-2xl items-center justify-center flex-1 active:scale-[0.98] transition-transform"
                    onPress={handleNextStep2}
                  >
                    <Text className="text-white text-xl font-bold tracking-wide">Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View className="space-y-6">
                <TextInput
                  className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-lg focus:border-emerald-500 focus:bg-slate-900/80 transition-colors"
                  placeholder="Full Name"
                  placeholderTextColor="#64748b"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    clearErrors();
                  }}
                />

                <View className="flex-row space-x-4 mt-6">
                  <TouchableOpacity 
                    className="bg-slate-900 border border-slate-800 p-5 rounded-2xl items-center justify-center w-24 active:scale-[0.98] transition-transform"
                    onPress={() => {
                      clearErrors();
                      setStep(2);
                    }}
                    disabled={isLoading}
                  >
                    <Text className="text-slate-400 text-lg font-bold">Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="bg-emerald-500 p-5 rounded-2xl items-center justify-center flex-1 active:scale-[0.98] transition-transform"
                    onPress={handleRegister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text className="text-white text-xl font-bold tracking-wide">Sign Up</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bottom Navigation */}
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
