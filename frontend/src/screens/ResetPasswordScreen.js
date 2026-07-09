import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import client from '../api/client';

// Brutalist shadow wrapper — mirrors LoginScreen
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const ChecklistItem = ({ valid, label }) => (
  <View style={styles.checklistItem}>
    <Ionicons
      name={valid ? 'checkmark-circle' : 'close-circle'}
      size={15}
      color={valid ? '#005c42' : '#c92a2a'}
    />
    <Text style={[styles.checklistText, { color: valid ? '#005c42' : '#c92a2a' }]}>
      {label}
    </Text>
  </View>
);

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, token } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const pwdHasLetter    = /[a-zA-Z]/.test(password);
  const pwdHasMinLength = password.length >= 10;
  const pwdHasExtra     = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = pwdHasLetter && pwdHasMinLength && pwdHasExtra;
  const isConfirmValid  = confirmPassword.length > 0 && confirmPassword === password;

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      setError('Vui lòng tạo mật khẩu đủ mạnh theo yêu cầu.');
      return;
    }
    if (!isConfirmValid) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/reset-password', { email, token, newPassword: password });
      if (res.data.status === 200 || res.data.statusCode === 200 || res.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Đổi mật khẩu thành công!',
          text2: 'Vui lòng đăng nhập lại với mật khẩu mới.',
        });
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f3dc" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headerBadge}>ACCOUNT RECOVERY</Text>
            <Text style={styles.headerTitle}>Tạo mật khẩu</Text>
            <Text style={styles.headerSubtitle}>mới an toàn hơn.</Text>
          </View>

          {/* Main Card */}
          <BrutalistShadow style={styles.card} offset={6}>
            <View style={styles.cardInner}>

              {/* Card header icon + title */}
              <View style={styles.cardHeader}>
                <View style={styles.logoBoxContainer}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                  <View style={styles.logoBox}>
                    <Ionicons name="lock-closed" size={22} color="#fff" />
                  </View>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.cardTitle}>Đặt mật khẩu mới</Text>
                  <Text style={styles.cardSubtitle}>MẬT KHẨU MỚI PHẢI KHÁC CŨ</Text>
                </View>
              </View>

              {/* Error banner */}
              {!!error && (
                <View style={styles.errorBannerContainer}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠ {error}</Text>
                  </View>
                </View>
              )}

              {/* New password input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>MẬT KHẨU MỚI</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                    placeholder="Tạo mật khẩu mạnh"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(''); }}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Checklist */}
                {password.length > 0 && (
                  <View style={styles.checklistBox}>
                    <ChecklistItem valid={pwdHasLetter}    label="Có chữ cái (a-z, A-Z)" />
                    <ChecklistItem valid={pwdHasMinLength} label="Tối thiểu 10 ký tự" />
                    <ChecklistItem valid={pwdHasExtra}     label="Có chữ số hoặc ký tự đặc biệt" />
                  </View>
                )}
              </View>

              {/* Confirm password input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                    placeholder="Nhập lại mật khẩu mới"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); setConfirmTouched(true); setError(''); }}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(v => !v)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={18} color="#666" />
                  </TouchableOpacity>
                </View>
                {confirmTouched && confirmPassword.length > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingLeft: 4 }}>
                    <Ionicons
                      name={isConfirmValid ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={isConfirmValid ? '#005c42' : '#c92a2a'}
                    />
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, marginLeft: 5, color: isConfirmValid ? '#005c42' : '#c92a2a' }}>
                      {isConfirmValid ? 'Mật khẩu trùng khớp' : 'Mật khẩu xác nhận không trùng khớp'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Submit button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleResetPassword}
                disabled={isLoading || !isPasswordValid || !isConfirmValid}
                style={[styles.submitBtnContainer, (!isPasswordValid || !isConfirmValid) && { opacity: 0.5 }]}
              >
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 3, left: 3 }]} />
                <View style={styles.submitBtn}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>ĐỔI MẬT KHẨU 🔐</Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Nhớ mật khẩu rồi? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.footerLink}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>

            </View>
          </BrutalistShadow>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  headerBadge: {
    backgroundColor: '#a7f3d0',
    color: '#005c42',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 32,
    color: '#1b263b',
  },
  headerSubtitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#c92a2a',
  },
  card: {
    backgroundColor: '#fcfbf7',
    borderRadius: 24,
  },
  cardInner: { padding: 24 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBoxContainer: { width: 44, height: 44, marginRight: 16 },
  logoBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#005c42',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: { flex: 1 },
  cardTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 20,
    color: '#1b263b',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: 'rgba(27, 38, 59, 0.7)',
    letterSpacing: 1,
  },
  errorBannerContainer: { marginBottom: 16 },
  errorBanner: {
    backgroundColor: '#ffe3e3',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#c92a2a',
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: 'rgba(27, 38, 59, 0.7)',
    marginBottom: 6,
    marginLeft: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fefefe',
  },
  input: {
    backgroundColor: '#fefefe',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#1b263b',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefefe',
  },
  checklistBox: {
    marginTop: 10,
    backgroundColor: '#f5f3dc',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checklistText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    marginLeft: 6,
  },
  submitBtnContainer: { marginBottom: 24 },
  submitBtn: {
    backgroundColor: '#005c42',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666' },
  footerLink: {
    fontFamily: 'Outfit_900Black',
    fontSize: 13,
    color: '#c92a2a',
    textDecorationLine: 'underline',
  },
});

export default ResetPasswordScreen;
