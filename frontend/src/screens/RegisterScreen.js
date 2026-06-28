import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import client from '../api/client';
import { Ionicons } from '@expo/vector-icons';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ username: '', phone: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const isValidUsername = (v) => /^[\p{L}\s]{2,50}$/u.test(v.trim());
  const isValidPhone = (v) => /^(03|05|07|08|09)\d{8}$/.test(v.trim());
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const pwdHasLetter = /[a-zA-Z]/.test(form.password);
  const pwdHasMinLength = form.password.length >= 10;
  const pwdHasExtra = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password);
  const isPasswordValid = pwdHasLetter && pwdHasMinLength && pwdHasExtra;
  const isConfirmValid = form.confirm.length > 0 && form.confirm === form.password;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (!touched[field]) setTouched((prev) => ({ ...prev, [field]: true }));
    setServerErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleBlur = async (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let isValidFormat = false;
    if (field === 'email') isValidFormat = isValidEmail(value);
    if (field === 'phone') isValidFormat = isValidPhone(value);
    if (field === 'username') isValidFormat = isValidUsername(value);

    if (isValidFormat) {
      try {
        const response = await client.post('/auth/check-exists', { [field]: value.trim() });
        if (response.data?.metadata?.exists) {
          setServerErrors((prev) => ({ ...prev, [field]: true }));
        } else {
          setServerErrors((prev) => ({ ...prev, [field]: false }));
        }
      } catch (error) {}
    }
  };

  const handleRegister = async () => {
    setTouched({ username: true, phone: true, email: true, password: true, confirm: true });

    if (!isValidUsername(form.username) || !isValidPhone(form.phone) || 
        !isValidEmail(form.email) || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);
    try {
      await client.post('/auth/signup', {
        username: form.username.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      }, { hideToast: true });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đăng ký tài khoản thành công!',
      });
      setTimeout(() => {
        navigation.navigate('Login', { prefillEmail: form.email.trim() });
      }, 2000);

    } catch (error) {
      const status = error.response?.status;
      const message = (error.response?.data?.error?.message || error.response?.data?.message || '').toLowerCase();

      if (status === 400 && message.includes('email')) {
        setServerErrors({ email: true });
      } else if (status === 400 && (message.includes('điện thoại') || message.includes('phone') || message.includes('sđt'))) {
        setServerErrors({ phone: true });
      } else if (status === 400 && (message.includes('tên người dùng') || message.includes('username'))) {
        setServerErrors({ username: true });
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Hệ thống đang bận. Vui lòng thử lại!' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusIcon = (field, isValidFunc) => {
    if (!touched[field]) return null;
    const isValid = typeof isValidFunc === 'function' ? isValidFunc(form[field]) : isValidFunc;
    const hasServerError = !!serverErrors[field];
    
    if (!isValid || hasServerError) {
      return <Ionicons name="close-circle" size={18} color="#c92a2a" />;
    }
    return <Ionicons name="checkmark-circle" size={18} color="#005c42" />;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f3dc" />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Create Workspace</Text>
      </View>

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
                  <Text style={styles.cardTitle}>Registration</Text>
                  <Text style={styles.cardSubtitle}>AI-POWERED EXAM DASHBOARD</Text>
                </View>
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>TÊN NGƯỜI DÙNG / HỌ TÊN</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#999"
                    value={form.username}
                    onChangeText={(txt) => handleChange('username', txt)}
                    onBlur={() => handleBlur('username', form.username)}
                  />
                  <View style={styles.statusIcon}>{renderStatusIcon('username', isValidUsername)}</View>
                </View>
                {touched.username && !isValidUsername(form.username) && <Text style={styles.errorText}>2-50 ký tự, không chứa số/kí tự đặc biệt.</Text>}
                {touched.username && isValidUsername(form.username) && serverErrors.username && <Text style={styles.errorText}>Tên này đã tồn tại.</Text>}
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="0912345678"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={form.phone}
                    onChangeText={(txt) => handleChange('phone', txt)}
                    onBlur={() => handleBlur('phone', form.phone)}
                  />
                  <View style={styles.statusIcon}>{renderStatusIcon('phone', isValidPhone)}</View>
                </View>
                {touched.phone && !isValidPhone(form.phone) && <Text style={styles.errorText}>Số điện thoại không hợp lệ.</Text>}
                {touched.phone && isValidPhone(form.phone) && serverErrors.phone && <Text style={styles.errorText}>Số điện thoại đã tồn tại.</Text>}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>ĐỊA CHỈ EMAIL</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="example@domain.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(txt) => handleChange('email', txt)}
                    onBlur={() => handleBlur('email', form.email)}
                  />
                  <View style={styles.statusIcon}>{renderStatusIcon('email', isValidEmail)}</View>
                </View>
                {touched.email && !isValidEmail(form.email) && <Text style={styles.errorText}>Email không hợp lệ.</Text>}
                {touched.email && isValidEmail(form.email) && serverErrors.email && <Text style={styles.errorText}>Email đã được sử dụng.</Text>}
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>MẬT KHẨU</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Tối thiểu 10 ký tự..."
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(txt) => handleChange('password', txt)}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  />
                  <TouchableOpacity style={styles.statusIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#1b263b" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.checklist}>
                  <View style={styles.checkItem}>
                    <Ionicons name={pwdHasLetter ? 'checkmark-circle' : 'close-circle'} size={14} color={pwdHasLetter ? '#005c42' : '#c92a2a'} />
                    <Text style={[styles.checkText, { color: pwdHasLetter ? '#005c42' : '#c92a2a' }]}>Có chữ cái</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name={pwdHasMinLength ? 'checkmark-circle' : 'close-circle'} size={14} color={pwdHasMinLength ? '#005c42' : '#c92a2a'} />
                    <Text style={[styles.checkText, { color: pwdHasMinLength ? '#005c42' : '#c92a2a' }]}>Tối thiểu 10 ký tự</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Ionicons name={pwdHasExtra ? 'checkmark-circle' : 'close-circle'} size={14} color={pwdHasExtra ? '#005c42' : '#c92a2a'} />
                    <Text style={[styles.checkText, { color: pwdHasExtra ? '#005c42' : '#c92a2a' }]}>Số hoặc kí tự đặc biệt</Text>
                  </View>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>XÁC NHẬN MẬT KHẨU</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={form.confirm}
                    onChangeText={(txt) => handleChange('confirm', txt)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                  />
                  <View style={styles.statusIcon}>{renderStatusIcon('confirm', isConfirmValid)}</View>
                </View>
                {touched.confirm && !isConfirmValid && <Text style={styles.errorText}>Mật khẩu không khớp.</Text>}
              </View>

              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={handleRegister}
                disabled={isLoading}
                style={styles.registerBtnContainer}
              >
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: 12, top: 3, left: 3 }]} />
                <View style={styles.registerBtn}>
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.registerBtnText}>TẠO TÀI KHOẢN HỌC VIÊN ✎</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Đã có tài khoản? </Text>
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
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
    backgroundColor: '#fcfbf7',
  },
  backBtn: {
    marginRight: 16,
  },
  backBtnText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 24,
    color: '#1b263b',
    lineHeight: 28,
  },
  topBarTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    color: '#1b263b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
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
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
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
    paddingRight: 40,
  },
  statusIcon: {
    position: 'absolute',
    right: 12,
  },
  errorText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 10,
    color: '#c92a2a',
    marginTop: 4,
    marginLeft: 4,
  },
  checklist: {
    marginTop: 8,
    backgroundColor: '#f5f3dc',
    borderWidth: 1,
    borderColor: '#1b263b',
    borderRadius: 8,
    padding: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    marginLeft: 6,
  },
  registerBtnContainer: {
    marginTop: 10,
    marginBottom: 24,
  },
  registerBtn: {
    backgroundColor: '#c92a2a',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerBtnText: {
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
});
