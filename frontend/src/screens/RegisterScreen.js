import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// Validation Rules based on AI Prompt
const validateName = (text) => text.trim().length >= 2;
const validatePhone = (text) => /^(03|05|07|08|09)\d{8}$/.test(text.replace(/\s+/g, ''));
const validateEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
const validatePassword = (text) => text.length >= 10 && /[A-Za-z]/.test(text) && /[\d\W]/.test(text);

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
    return '#6366F1'; // Indigo for focus
  };

  return (
    <View style={{ marginBottom: 16 }}>
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
        style={{ backgroundColor: isValid === false ? 'rgba(254, 226, 226, 0.5)' : 'rgba(255, 255, 255, 0.7)', fontSize: 16 }}
        theme={{ roundness: 16, colors: { error: '#EF4444', primary: '#6366F1' } }}
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

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validators
  const isNameValid = name.length === 0 ? null : validateName(name);
  const isPhoneValid = phone.length === 0 ? null : validatePhone(phone);
  const isEmailValid = email.length === 0 ? null : validateEmail(email);
  const isPasswordValid = password.length === 0 ? null : validatePassword(password);

  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isPasswordValid;

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
    if (isFormValid) {
      register({
        username: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          <View style={[styles.glassCard, { marginTop: insets.top + 40, marginBottom: insets.bottom + 20 }]}>
            
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View style={styles.iconContainer}>
                <Feather name="zap" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Tạo tài khoản</Text>
              <Text style={styles.subtitle}>Bắt đầu hành trình của bạn</Text>
            </View>

            {!!authError && (
              <View style={styles.errorContainer}>
                <AntDesign name="closecircle" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <ValidatedInput
              label="Tên người dùng"
              placeholder="Nhập họ và tên"
              value={name}
              onChangeText={setName}
              icon="user"
              isValid={isNameValid}
              errorMessage="Tên phải có ít nhất 2 ký tự."
              autoCapitalize="words"
            />

            <ValidatedInput
              label="Số điện thoại"
              placeholder="VD: 0912345678"
              value={phone}
              onChangeText={setPhone}
              icon="phone"
              isValid={isPhoneValid}
              errorMessage="Vui lòng nhập đúng SĐT Việt Nam (VD: 09...)"
              keyboardType="numeric"
            />

            <ValidatedInput
              label="Địa chỉ Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              icon="mail"
              isValid={isEmailValid}
              errorMessage="Email không hợp lệ."
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ValidatedInput
              label="Mật khẩu"
              placeholder="Tối thiểu 10 ký tự"
              value={password}
              onChangeText={setPassword}
              icon="lock"
              isValid={isPasswordValid}
              errorMessage="Tối thiểu 10 ký tự, gồm 1 chữ cái và 1 số/ký tự đặc biệt."
              isPassword={true}
            />

            <Button 
              mode="contained" 
              onPress={handleRegister}
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 18, fontFamily: 'Outfit_700Bold' }}
              style={[styles.submitBtn, { backgroundColor: isFormValid ? '#6366F1' : '#E5E7EB' }]}
              textColor={isFormValid ? '#FFFFFF' : '#9CA3AF'}
            >
              Đăng ký ngay
            </Button>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc kết nối với</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button 
              mode="outlined" 
              onPress={() => promptAsync()}
              disabled={!request || isLoading}
              icon={() => <AntDesign name="google" size={20} color="#DB4437" />}
              contentStyle={{ height: 56 }}
              labelStyle={{ fontSize: 16, color: '#374151', fontFamily: 'Outfit_500Medium' }}
              style={styles.googleBtn}
            >
              Google Account
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontFamily: 'Outfit_500Medium', fontSize: 16 }}>
                Đã có tài khoản? <Text style={{ color: '#6366F1', fontFamily: 'Outfit_700Bold' }}>Đăng nhập ngay</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF', // light indigo background
  },
  blob1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#C7D2FE',
    opacity: 0.5,
  },
  blob2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#E0E7FF',
    opacity: 0.6,
  },
  glassCard: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: '#111827',
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontFamily: 'Outfit_500Medium',
    marginLeft: 8,
    flex: 1,
  },
  submitBtn: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 0,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontFamily: 'Outfit_500Medium',
  },
  googleBtn: {
    borderRadius: 16,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  }
});

export default RegisterScreen;
