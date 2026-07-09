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
  TextInput,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../store/useAuthStore';
import { storage } from '../utils/storage';

const REMEMBER_KEY = 'rememberMe_credentials';

WebBrowser.maybeCompleteAuthSession();

// Brutalist shadow wrapper specifically for mobile
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const LoginScreen = ({ route, navigation }) => {
  const [email, setEmail] = useState(route?.params?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, googleLogin, clearError, isLoading, error, user } = useAuthStore();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    webClientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
  });

  // Load saved credentials on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const raw = await storage.getItem(REMEMBER_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.email) setEmail(saved.email);
          if (saved?.password) setPassword(saved.password);
          setRememberMe(true);
        }
      } catch (_) {}
    };
    loadSaved();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      googleLogin(response.params.id_token);
    } else if (response?.type === 'error' || response?.type === 'dismiss') {
      clearError?.();
    }
  }, [response]);

  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigation.replace('Admin');
      } else {
        navigation.replace('Main');
      }
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    clearError?.();
    if (!email.trim() || !password.trim()) return;
    // Save or clear credentials based on checkbox
    if (rememberMe) {
      await storage.setItem(REMEMBER_KEY, JSON.stringify({ email: email.trim(), password }));
    } else {
      await storage.deleteItem(REMEMBER_KEY);
    }
    login(email.trim(), password);
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
          {/* Memo Header */}
          <View style={styles.headerSection}>
            <Text style={styles.headerBadge}>EXAM PREPARATION PORTAL</Text>
            <Text style={styles.headerTitle}>Practice IELTS inside</Text>
            <Text style={styles.headerSubtitle}>your digital workspace</Text>
          </View>

          {/* Main Brutalist Card */}
          <BrutalistShadow style={styles.card} offset={6}>
            <View style={styles.cardInner}>
              
              <View style={styles.cardHeader}>
                <View style={styles.logoBoxContainer}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                  <View style={styles.logoBox}>
                    <Text style={styles.logoText}>A</Text>
                  </View>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.cardTitle}>Open your workspace</Text>
                  <Text style={styles.cardSubtitle}>AI-POWERED EXAM DASHBOARD</Text>
                </View>
              </View>

              {!!error && (
                <View style={styles.errorBannerContainer}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>⚠ {error}</Text>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>TÊN TÀI KHOẢN HOẶC EMAIL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. student123"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>MẬT KHẨU (PASSWORD)</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(v => !v)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#666" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginTop: 8, marginRight: 4 }}>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#4682b4', textDecorationLine: 'underline' }}>
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Remember Me */}
              <TouchableOpacity
                onPress={() => setRememberMe(v => !v)}
                style={styles.rememberRow}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginBtnContainer}
              >
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 3, left: 3 }]} />
                <View style={styles.loginBtn}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginBtnText}>ĐĂNG NHẬP HỆ THỐNG ✉</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => promptAsync()}
                disabled={!request || isLoading}
                style={styles.googleBtnContainer}
              >
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                <View style={styles.googleBtn}>
                  <Ionicons name="logo-google" size={18} color="#1b263b" />
                  <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Đăng ký ngay</Text>
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
    backgroundColor: '#e0f2fe',
    color: '#4682b4',
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
    fontFamily: 'Outfit_700Bold', // Fallback for cursive
    fontSize: 32,
    color: '#c92a2a',
  },
  card: {
    backgroundColor: '#fcfbf7',
    borderRadius: 24,
  },
  cardInner: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBoxContainer: {
    width: 44,
    height: 44,
    marginRight: 16,
  },
  logoBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#c92a2a',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontFamily: 'Outfit_900Black',
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
  },
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
  errorBannerContainer: {
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: '#ffe3e3',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#c92a2a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: 'rgba(27, 38, 59, 0.7)',
    marginBottom: 6,
    marginLeft: 4,
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
  passwordRow: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fefefe',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefefe',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefefe',
  },
  checkboxActive: {
    backgroundColor: '#c92a2a',
    borderColor: '#1b263b',
  },
  rememberText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#1b263b',
  },
  loginBtnContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#c92a2a',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 2,
    borderColor: 'rgba(27, 38, 59, 0.2)',
    borderStyle: 'dashed',
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: '#999',
  },
  googleBtnContainer: {
    marginBottom: 24,
  },
  googleBtn: {
    backgroundColor: '#fcfbf7',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 13,
    color: '#1b263b',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#666',
  },
  footerLink: {
    fontFamily: 'Outfit_900Black',
    fontSize: 13,
    color: '#c92a2a',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
