import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform } from 'react-native';
import AppTextInput from '../shared/components/AppTextInput';
import AppButton from '../shared/components/AppButton';
import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import Toast from 'react-native-toast-message';
import client from '../api/client';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { email, token } = route.params || {};
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Checklist
  const pwdHasLetter = /[a-zA-Z]/.test(password);
  const pwdHasMinLength = password.length >= 10;
  const pwdHasExtra = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = pwdHasLetter && pwdHasMinLength && pwdHasExtra;
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      setError('Vui lòng tạo mật khẩu đủ mạnh theo yêu cầu');
      return;
    }
    if (!isConfirmValid) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/reset-password', { email, token, newPassword: password });
      if (res.data.status === 200 || res.data.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Đổi mật khẩu thành công!',
          text2: 'Vui lòng đăng nhập lại với mật khẩu mới.',
        });
        // Reset stack and navigate to Login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AppIcon name="lock-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.heading}>Tạo mật khẩu mới</Text>
            <Text style={styles.subheading}>
              Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đó để đảm bảo an toàn.
            </Text>
          </View>

          {!!error && (
            <View style={styles.errorBanner}>
              <AppIcon name="error-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <AppTextInput
              label="Mật khẩu mới"
              placeholder="Tạo mật khẩu mạnh"
              value={password}
              onChangeText={(text) => { setPassword(text); setError(''); }}
              leftIconName="password"
              isPassword
            />

            {/* Password Checklist Realtime */}
            <View style={styles.checklistContainer}>
              <View style={styles.checklistItem}>
                 <AppIcon name={pwdHasLetter ? 'check-circle' : 'x-circle'} size={14} color={pwdHasLetter ? '#00CC99' : '#EF4444'} />
                 <Text style={[styles.checklistText, pwdHasLetter ? styles.textSuccess : styles.textError]}>Có chữ cái</Text>
              </View>
              <View style={[styles.checklistItem, { marginVertical: 6 }]}>
                 <AppIcon name={pwdHasMinLength ? 'check-circle' : 'x-circle'} size={14} color={pwdHasMinLength ? '#00CC99' : '#EF4444'} />
                 <Text style={[styles.checklistText, pwdHasMinLength ? styles.textSuccess : styles.textError]}>Tối thiểu 10 ký tự</Text>
              </View>
              <View style={styles.checklistItem}>
                 <AppIcon name={pwdHasExtra ? 'check-circle' : 'x-circle'} size={14} color={pwdHasExtra ? '#00CC99' : '#EF4444'} />
                 <Text style={[styles.checklistText, pwdHasExtra ? styles.textSuccess : styles.textError]}>Có chữ số hoặc ký tự đặc biệt</Text>
              </View>
            </View>

            <AppTextInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setConfirmTouched(true); setError(''); }}
              leftIconName="password"
              isPassword
              // We do not pass error prop here, so the box won't turn red.
              // We pass isValid to potentially show a checkmark if AppTextInput supports it later.
              isValid={isConfirmValid}
              touched={confirmTouched}
            />

            {/* Notification when confirm password does not match */}
            {confirmTouched && confirmPassword.length > 0 && !isConfirmValid && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -SPACING.md, marginBottom: SPACING.md, paddingHorizontal: SPACING.sm }}>
                 <AppIcon name="close" size={16} color="#EF4444" />
                 <Text style={{ color: '#EF4444', fontSize: 13, fontFamily: TYPOGRAPHY.fontMedium, marginLeft: 6 }}>
                   Mật khẩu xác nhận không trùng khớp.
                 </Text>
              </View>
            )}
          </View>

          <AppButton
            title="Đổi mật khẩu"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={!isPasswordValid || !isConfirmValid || isLoading}
            style={styles.submitBtn}
          />
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING['3xl'], paddingBottom: SPACING['3xl'] },
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  iconContainer: { width: 64, height: 64, borderRadius: RADIUS['2xl'], backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  heading: { fontSize: TYPOGRAPHY['2xl'], fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subheading: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.md },
  form: { marginBottom: SPACING['2xl'] },
  submitBtn: { width: '100%', borderRadius: RADIUS.full },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorBannerText: { flex: 1, marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.error },
  checklistContainer: { marginTop: -SPACING.sm, marginBottom: SPACING.lg, padding: SPACING.md, backgroundColor: '#f9fafb', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#f3f4f6' },
  checklistItem: { flexDirection: 'row', alignItems: 'center' },
  checklistText: { fontSize: 13, fontFamily: TYPOGRAPHY.fontMedium, marginLeft: SPACING.sm },
  textSuccess: { color: '#00CC99' },
  textError: { color: '#EF4444' },
});

export default ResetPasswordScreen;
