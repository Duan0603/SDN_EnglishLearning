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
import * as Linking from 'expo-linking';
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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValid) {
      setError('Địa chỉ email không hợp lệ.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const deepLinkBase = Linking.createURL('reset-password');
      const res = await client.post('/auth/forgot-password', { email: email.trim(), deepLinkBase });

      if (res.data.status === 200 || res.data.statusCode === 200 || res.status === 200) {
        setSent(true);
        Toast.show({
          type: 'success',
          text1: 'Email đã được gửi!',
          text2: 'Kiểm tra hộp thư để lấy liên kết đặt lại mật khẩu.',
        });
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
            <Text style={styles.headerTitle}>Quên mật khẩu?</Text>
            <Text style={styles.headerSubtitle}>Đừng lo, chúng tôi giúp bạn.</Text>
          </View>

          {/* Main Card */}
          <BrutalistShadow style={styles.card} offset={6}>
            <View style={styles.cardInner}>

              {/* Card header icon + title */}
              <View style={styles.cardHeader}>
                <View style={styles.logoBoxContainer}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                  <View style={styles.logoBox}>
                    <Ionicons name="mail" size={22} color="#fff" />
                  </View>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.cardTitle}>Đặt lại mật khẩu</Text>
                  <Text style={styles.cardSubtitle}>LINK XÁC NHẬN QUA EMAIL</Text>
                </View>
              </View>

              {/* Sent success state */}
              {sent ? (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={40} color="#005c42" style={{ marginBottom: 12 }} />
                  <Text style={styles.successTitle}>Email đã được gửi!</Text>
                  <Text style={styles.successDesc}>
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu tới{'\n'}
                    <Text style={{ color: '#1b263b', fontFamily: 'Outfit_900Black' }}>{email}</Text>
                    {'\n\n'}Kiểm tra hộp thư (kể cả thư rác) và nhấp vào liên kết để tiếp tục.
                  </Text>
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={() => { setSent(false); setEmail(''); }}
                  >
                    <Text style={styles.resendBtnText}>Gửi lại email khác</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Instruction text */}
                  <View style={styles.instructionBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#4682b4" style={{ marginRight: 8, marginTop: 1 }} />
                    <Text style={styles.instructionText}>
                      Nhập email liên kết với tài khoản của bạn. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
                    </Text>
                  </View>

                  {/* Error banner */}
                  {!!error && (
                    <View style={styles.errorBannerContainer}>
                      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 2, left: 2 }]} />
                      <View style={styles.errorBanner}>
                        <Ionicons name="warning" size={14} color="#c92a2a" style={{ marginRight: 6 }} />
                        <Text style={styles.errorText}>⚠ {error}</Text>
                      </View>
                    </View>
                  )}

                  {/* Email input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>ĐỊA CHỈ EMAIL</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. name@domain.com"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(''); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Submit button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSendLink}
                    disabled={isLoading}
                    style={styles.submitBtnContainer}
                  >
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 3, left: 3 }]} />
                    <View style={styles.submitBtn}>
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitBtnText}>GỬI LIÊN KẾT ĐẶT LẠI ✉</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {/* Back to login footer */}
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
    fontFamily: 'Outfit_700Bold',
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
    marginBottom: 20,
  },
  logoBoxContainer: {
    width: 44,
    height: 44,
    marginRight: 16,
  },
  logoBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4682b4',
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
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e0f2fe',
    borderWidth: 1.5,
    borderColor: '#4682b4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  instructionText: {
    flex: 1,
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#1b263b',
    lineHeight: 18,
  },
  errorBannerContainer: { marginBottom: 16 },
  errorBanner: {
    backgroundColor: '#ffe3e3',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#c92a2a',
    flex: 1,
  },
  inputGroup: { marginBottom: 20 },
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
  submitBtnContainer: {
    marginBottom: 24,
  },
  submitBtn: {
    backgroundColor: '#4682b4',
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
  // Success state
  successBox: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 20,
    color: '#005c42',
    marginBottom: 12,
  },
  successDesc: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resendBtn: {
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f5f3dc',
  },
  resendBtnText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    color: '#1b263b',
  },
});

export default ForgotPasswordScreen;
