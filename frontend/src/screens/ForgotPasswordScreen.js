import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, SafeAreaView, Platform } from 'react-native';
import AppTextInput from '../shared/components/AppTextInput';
import AppButton from '../shared/components/AppButton';
import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import client from '../api/client';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendLink = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const deepLinkBase = Linking.createURL('reset-password');
      const res = await client.post('/auth/forgot-password', { email, deepLinkBase });
      
      if (res.data.status === 200 || res.data.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Thành công!',
          text2: 'Vui lòng kiểm tra email và nhấp vào liên kết để đặt lại mật khẩu.',
        });
        // Không chuyển sang VerifyOTP nữa, chỉ quay về trang đăng nhập
        setTimeout(() => {
            navigation.navigate('Login');
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email này chưa được đăng ký trong hệ thống!');
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <AppIcon name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AppIcon name="email-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.heading}>Quên mật khẩu</Text>
            <Text style={styles.subheading}>
              Nhập email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một liên kết xác nhận để bạn đặt lại mật khẩu mới.
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
              label="Email"
              placeholder="Ví dụ: name@domain.com"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIconName="email"
            />
          </View>

          <AppButton
            title="Gửi liên kết"
            onPress={handleSendLink}
            loading={isLoading}
            disabled={!email || isLoading}
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
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING['3xl'] },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl, ...SHADOWS.sm },
  header: { marginBottom: SPACING.xl, alignItems: 'center' },
  iconContainer: { width: 64, height: 64, borderRadius: RADIUS['2xl'], backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  heading: { fontSize: TYPOGRAPHY['2xl'], fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subheading: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.md },
  form: { marginBottom: SPACING['2xl'] },
  submitBtn: { width: '100%', borderRadius: RADIUS.full },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.errorBg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorBannerText: { flex: 1, marginLeft: SPACING.sm, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.error },
});

export default ForgotPasswordScreen;
