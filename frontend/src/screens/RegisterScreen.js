import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import useAuthStore from '../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// Validation Rules
const validateFullName = (text) => text.trim().length >= 3;
const validatePhone = (text) => /^\d{9,15}$/.test(text.replace(/\s+/g, ''));
const validateIdentity = (text) => /^\d{9,12}$/.test(text.trim());
const validateUsername = (text) => /^[a-zA-Z0-9_]{3,20}$/.test(text.trim());
const validateEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
const validatePassword = (text) => text.length >= 6;

// Custom Validated Input Component
const ValidatedInput = ({
  label, value, onChangeText, icon, isValid, errorMessage, 
  secureTextEntry, keyboardType, autoCapitalize, isPassword,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const getOutlineColor = () => {
    if (isValid === true) return '#10B981';
    if (isValid === false) return '#EF4444';
    return '#E5E7EB';
  };

  const getActiveOutlineColor = () => {
    if (isValid === true) return '#10B981';
    if (isValid === false) return '#EF4444';
    return '#00D1A0';
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={isPassword ? !isPasswordVisible : false}
        outlineColor={getOutlineColor()}
        activeOutlineColor={getActiveOutlineColor()}
        error={isValid === false}
        style={{ backgroundColor: '#FAFAFA', fontSize: 16 }}
        theme={{ roundness: 12, colors: { error: '#EF4444', primary: '#00D1A0' } }}
        left={
          <TextInput.Icon 
            icon={() => <Feather name={icon} size={20} color={isValid === false ? '#EF4444' : isValid === true ? '#10B981' : '#9CA3AF'} />} 
          />
        }
        right={
          <TextInput.Icon
            icon={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isPassword && (
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={{ marginRight: isValid !== null ? 12 : 0 }}>
                    <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                {isValid === true && <AntDesign name="checkcircle" size={18} color="#10B981" />}
                {isValid === false && <AntDesign name="closecircle" size={18} color="#EF4444" />}
              </View>
            )}
          />
        }
        {...props}
      />
      {isValid === false && errorMessage ? (
        <HelperText type="error" visible={true} style={{ fontFamily: 'Outfit_500Medium', color: '#EF4444', marginTop: -4, paddingLeft: 0 }}>
          {errorMessage}
        </HelperText>
      ) : null}
    </View>
  );
};

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, googleLogin, isLoading, error: authError } = useAuthStore();

  const [step, setStep] = useState(1);

  // Step 1 State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');

  // Step 2 State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validators
  const isFullNameValid = fullName.length === 0 ? null : validateFullName(fullName);
  const isDobValid = dob < new Date() ? true : null;
  const isPhoneValid = phone.length === 0 ? null : validatePhone(phone);
  const isIdentityValid = identityNumber.length === 0 ? null : validateIdentity(identityNumber);

  const isUsernameValid = username.length === 0 ? null : validateUsername(username);
  const isEmailValid = email.length === 0 ? null : validateEmail(email);
  const isPasswordValid = password.length === 0 ? null : validatePassword(password);
  const isConfirmPasswordValid = confirmPassword.length === 0 ? null : (confirmPassword === password && validatePassword(password));

  const isStep1Valid = isFullNameValid && isDobValid && isPhoneValid && isIdentityValid;
  const isStep2Valid = isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;

  // Google OAuth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    webClientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    ...(Platform.OS === 'web' && { redirectUri: 'http://localhost:8081' })
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      googleLogin(id_token);
    }
  }, [response]);

  const handleRegister = () => {
    if (isStep1Valid && isStep2Valid) {
      register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        birthday: dob.toISOString(),
        phone: phone.trim(),
        identityNumber: identityNumber.trim()
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Header Section */}
          <View style={{ backgroundColor: '#F0FDF4', paddingTop: insets.top + 24, paddingHorizontal: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
            <Text style={{ color: '#059669', fontFamily: 'Outfit_700Bold', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Step {step} of 2
            </Text>
            <Text style={{ color: '#111827', fontFamily: 'Outfit_700Bold', fontSize: 32, lineHeight: 36 }}>
              {step === 1 ? 'Personal Info' : 'Account Security'}
            </Text>
            <Text style={{ color: '#6B7280', fontFamily: 'Outfit_400Regular', fontSize: 16, marginTop: 8 }}>
              {step === 1 ? 'Please fill in your valid data to proceed.' : 'Set up your secure login credentials.'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
            {!!authError && (
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                <AntDesign name="infocirlce" size={20} color="#DC2626" />
                <Text style={{ color: '#DC2626', fontFamily: 'Outfit_500Medium', marginLeft: 8, flex: 1 }}>
                  {authError}
                </Text>
              </View>
            )}

            {step === 1 ? (
              <View style={{ gap: 4 }}>
                <ValidatedInput
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChangeText={setFullName}
                  icon="user"
                  isValid={isFullNameValid}
                  errorMessage="Full name must be at least 3 characters."
                  autoCapitalize="words"
                />

                {Platform.OS === 'web' ? (
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'Outfit_500Medium', marginBottom: 4, marginLeft: 4 }}>Date of Birth</Text>
                    <input
                      type="date"
                      value={dob.toISOString().split('T')[0]}
                      onChange={(e) => {
                         const d = new Date(e.target.value);
                         if (!isNaN(d.getTime())) setDob(d);
                      }}
                      style={{
                        width: '100%',
                        height: 56,
                        borderRadius: 12,
                        border: '1px solid ' + (isDobValid ? '#10B981' : '#E5E7EB'),
                        paddingHorizontal: 16,
                        fontSize: 16,
                        fontFamily: 'Outfit_400Regular',
                        color: '#111827',
                        backgroundColor: '#FAFAFA',
                        outlineColor: '#00D1A0'
                      }}
                    />
                  </View>
                ) : (
                  <View>
                    <TouchableOpacity activeOpacity={1} onPress={() => setShowDatePicker(true)}>
                      <View pointerEvents="none">
                        <ValidatedInput
                          label="Date of Birth"
                          value={dob.toLocaleDateString()}
                          icon="calendar"
                          isValid={isDobValid}
                        />
                      </View>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={dob}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) setDob(selectedDate);
                        }}
                      />
                    )}
                  </View>
                )}

                <ValidatedInput
                  label="Phone Number"
                  placeholder="0987654321"
                  value={phone}
                  onChangeText={setPhone}
                  icon="phone"
                  isValid={isPhoneValid}
                  errorMessage="Please enter a valid phone number."
                  keyboardType="numeric"
                />

                <ValidatedInput
                  label="Identity Number"
                  placeholder="123456789"
                  value={identityNumber}
                  onChangeText={setIdentityNumber}
                  icon="credit-card"
                  isValid={isIdentityValid}
                  errorMessage="Identity number must be 9-12 digits."
                  keyboardType="numeric"
                />

                <Button 
                  mode="contained" 
                  onPress={() => setStep(2)}
                  disabled={!isStep1Valid}
                  contentStyle={{ height: 56 }}
                  labelStyle={{ fontSize: 18, fontFamily: 'Outfit_700Bold' }}
                  style={{ borderRadius: 12, marginTop: 8, backgroundColor: isStep1Valid ? '#00D1A0' : '#E5E7EB', elevation: 0 }}
                  textColor={isStep1Valid ? '#FFFFFF' : '#9CA3AF'}
                >
                  Next Step
                </Button>
              </View>
            ) : (
              <View style={{ gap: 4 }}>
                <ValidatedInput
                  label="Username"
                  placeholder="johndoe123"
                  value={username}
                  onChangeText={setUsername}
                  icon="at-sign"
                  isValid={isUsernameValid}
                  errorMessage="Username must be 3-20 alphanumeric characters."
                  autoCapitalize="none"
                />

                <ValidatedInput
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  icon="mail"
                  isValid={isEmailValid}
                  errorMessage="Please enter a valid email address."
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ValidatedInput
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  icon="lock"
                  isValid={isPasswordValid}
                  errorMessage="Password must be at least 6 characters."
                  isPassword={true}
                />

                <ValidatedInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="shield"
                  isValid={isConfirmPasswordValid}
                  errorMessage="Passwords do not match."
                  isPassword={true}
                />

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <Button 
                    mode="outlined" 
                    onPress={() => setStep(1)}
                    contentStyle={{ height: 56 }}
                    style={{ borderRadius: 12, flex: 1, borderColor: '#E5E7EB' }}
                    textColor="#6B7280"
                  >
                    Back
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={handleRegister}
                    loading={isLoading}
                    disabled={!isStep2Valid || isLoading}
                    contentStyle={{ height: 56 }}
                    labelStyle={{ fontSize: 18, fontFamily: 'Outfit_700Bold' }}
                    style={{ borderRadius: 12, flex: 2, backgroundColor: isStep2Valid ? '#00D1A0' : '#E5E7EB', elevation: 0 }}
                    textColor={isStep2Valid ? '#FFFFFF' : '#9CA3AF'}
                  >
                    Sign Up
                  </Button>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                  <Text style={{ marginHorizontal: 16, color: '#9CA3AF', fontFamily: 'Outfit_400Regular' }}>Or sign up with</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                </View>

                <Button 
                  mode="outlined" 
                  onPress={() => promptAsync()}
                  disabled={!request || isLoading}
                  icon={() => <AntDesign name="google" size={20} color="#DB4437" />}
                  contentStyle={{ height: 56 }}
                  labelStyle={{ fontSize: 16, color: '#374151', fontFamily: 'Outfit_500Medium' }}
                  style={{ borderRadius: 12, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' }}
                >
                  Google Account
                </Button>

                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')} 
                  style={{ marginTop: 24, alignItems: 'center' }}
                >
                  <Text style={{ color: '#6B7280', fontFamily: 'Outfit_500Medium', fontSize: 16 }}>
                    Already have an account? <Text style={{ color: '#00D1A0', fontFamily: 'Outfit_700Bold' }}>Log in</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
