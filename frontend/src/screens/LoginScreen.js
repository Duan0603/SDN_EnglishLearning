// ============================================================
// LoginScreen - Mobile First, Full Screen
// NO web layouts, NO dual columns, NO desktop cards
// Design: Duolingo / ELSA Speak inspired
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Svg, { Path, Circle } from 'react-native-svg';

import { AppTextInput, AppButton } from '../shared/components';
import AppIcon from '../shared/icons/AppIcon';
import useAuthStore from '../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail]       = useState(route?.params?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [touched, setTouched]   = useState({ email: !!route?.params?.prefillEmail, password: false });

  const { login, googleLogin, clearError, isLoading, error } = useAuthStore();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    webClientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      googleLogin(response.params.id_token);
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      // Clear any leftover error so it doesn't confuse email/password login
      clearError?.();
    }
  }, [response]);

  // ── Validation ──────────────────────────────────────────
  const isEmailValid   = email.includes('@') ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) : email.trim().length >= 3;
  const isPasswordValid = password.length >= 6;

  const emailError    = touched.email && !isEmailValid ? 'Email hoặc tên người dùng không hợp lệ' : '';
  const passwordError = touched.password && !isPasswordValid ? 'Mật khẩu phải có ít nhất 6 ký tự' : '';

  const handleLogin = () => {
    clearError?.();                          // xóa error cũ trước khi thử lại
    setTouched({ email: true, password: true });
    if (!isEmailValid || !isPasswordValid) return;
    login(email.trim(), password);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

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
          {/* ── Logo & Branding ─────────────────────────── */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L2 7l10 5 10-5-10-5z" fill={COLORS.primary} />
                <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill={COLORS.accent} />
              </Svg>
            </View>
            <Text style={styles.appName}>Apex IELTS</Text>
            <Text style={styles.appTagline}>Master IELTS with AI</Text>
          </View>

          {/* ── Heading ─────────────────────────────────── */}
          <View style={styles.headingSection}>
            <Text style={styles.heading}>Welcome Back 👋</Text>
            <Text style={styles.subheading}>
              Đăng nhập để tiếp tục hành trình chinh phục IELTS của bạn
            </Text>
          </View>

          {/* ── Error Banner ─────────────────────────────── */}
          {!!error && (
            <View style={styles.errorBanner}>
              <AppIcon name="error-outline" size={16} color={COLORS.error} />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* ── Form ────────────────────────────────────── */}
          <View style={styles.form}>
            <AppTextInput
              label="Email hoặc tên người dùng"
              placeholder="Nhập email hoặc tên người dùng"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIconName="email"
              touched={touched.email}
              error={emailError}
            />

            <AppTextInput
              label="Mật khẩu"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              leftIconName="password"
              isPassword
              touched={touched.password}
              error={passwordError}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* ── Sign In Button ───────────────────────────── */}
          <AppButton
            title="Đăng nhập"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginBtn}
          />

          {/* ── Divider ──────────────────────────────────── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Social Logins ────────────────────────────── */}
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() => promptAsync()}
            disabled={!request || isLoading}
            activeOpacity={0.8}
          >
            <AppIcon name="google" size={22} color="#DB4437" />
            <Text style={styles.socialBtnText}>Tiếp tục với Google</Text>
          </TouchableOpacity>

          {/* ── Sign Up Link ─────────────────────────────── */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },

  // ── Logo ───────────────────────────────────────────────
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  appName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontFamily: TYPOGRAPHY.fontBlack,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textTertiary,
    marginTop: 4,
  },

  // ── Heading ────────────────────────────────────────────
  headingSection: {
    marginBottom: SPACING.xl,
  },
  heading: {
    fontSize: TYPOGRAPHY['3xl'],
    fontFamily: TYPOGRAPHY.fontBlack,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.base * TYPOGRAPHY.normal,
  },

  // ── Error ──────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.error,
  },

  // ── Form ───────────────────────────────────────────────
  form: {
    marginBottom: SPACING.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.base,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontSemiBold,
    color: COLORS.primary,
  },

  // ── Buttons ────────────────────────────────────────────
  loginBtn: {
    marginBottom: SPACING.lg,
  },

  // ── Divider ────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textTertiary,
  },

  // ── Social ─────────────────────────────────────────────
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray50,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  socialBtnText: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontSemiBold,
    color: COLORS.textPrimary,
  },

  // ── Sign Up ────────────────────────────────────────────
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupText: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontBold,
    color: COLORS.primary,
  },
});

export default LoginScreen;
