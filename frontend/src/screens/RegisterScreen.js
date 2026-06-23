// ============================================================
// RegisterScreen - Mobile First, Full Screen
// Real-time validation, Password Checklist, Mint-Green UI
// ============================================================

<<<<<<< HEAD
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppIcon from '../shared/icons/AppIcon';
import client from '../api/client';
=======
// Validation Rules
const validatePhone = (text) => /^(03|05|07|08|09)\d{8}$/.test(text.replace(/\s+/g, ''));
const validateEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());

// Mock API for availability check
const checkAvailability = async (field, value) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock logic: some specific values are "taken"
      if (field === 'email' && value === 'test@test.com') resolve(false);
      if (field === 'phone' && value === '0912345678') resolve(false);
      if (field === 'username' && value === 'admin') resolve(false);
      resolve(true);
    }, 400);
  });
};

const PasswordCriteria = ({ text, isValid, isEmpty }) => (
  <View style={styles.criteriaRow}>
    {!isEmpty && isValid ? (
      <AntDesign name="checkcircle" size={16} color="#00c495" />
    ) : !isEmpty && !isValid ? (
      <AntDesign name="closecircle" size={16} color="#EF4444" />
    ) : (
      <Feather name="circle" size={16} color="#9CA3AF" />
    )}
    <Text style={[styles.criteriaText, { color: !isEmpty && isValid ? '#00c495' : !isEmpty && !isValid ? '#EF4444' : '#6B7280' }]}>
      {text}
    </Text>
  </View>
);

const RegisterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register, isLoading, error } = useAuthStore();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [validationError, setValidationError] = useState('');

  const [isRobot, setIsRobot] = useState(false); // mock recaptcha: false means IS a robot, checked means NOT a robot
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Error States from onBlur
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
>>>>>>> origin/main

export default function RegisterScreen({ navigation }) {
  // ── States ───────────────────────────────────────────
  const [form, setForm] = useState({ username: '', phone: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  // ── Validators (Realtime) ─────────────────────────────
  // Username: 2-50 chars, no special/number, allows Vietnamese letters
  const isValidUsername = (v) => /^[\p{L}\s]{2,50}$/u.test(v.trim());
  // Phone: VN phone (03, 05, 07, 08, 09), 10 digits
  const isValidPhone = (v) => /^(03|05|07|08|09)\d{8}$/.test(v.trim());
  // Email: Valid format
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // Password Checklist
  const pwdHasLetter = /[a-zA-Z]/.test(form.password);
  const pwdHasMinLength = form.password.length >= 10;
  const pwdHasExtra = /[\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password);
  const isPasswordValid = pwdHasLetter && pwdHasMinLength && pwdHasExtra;

  // Confirm Password
  const isConfirmValid = form.confirm.length > 0 && form.confirm === form.password;

  // ── Handlers ──────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
    setServerErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleBlur = async (field, value) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    let isValidFormat = false;
    if (field === 'email') isValidFormat = isValidEmail(value);
    if (field === 'phone') isValidFormat = isValidPhone(value);
    if (field === 'username') isValidFormat = isValidUsername(value);

<<<<<<< HEAD
    if (isValidFormat) {
      try {
        const response = await client.post('/auth/check-exists', { [field]: value.trim() });
        if (response.data?.metadata?.exists) {
          setServerErrors((prev) => ({ ...prev, [field]: true }));
        } else {
          setServerErrors((prev) => ({ ...prev, [field]: false }));
=======
  const handleSubmit = async () => {
    // Check missing fields
    if (!username || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ các thông tin yêu cầu');
      return;
    }

    // Check Format Errors
    if (usernameError || phoneError || emailError || !isPasswordValid || !isConfirmValid) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng các thông tin yêu cầu');
      return;
    }

    // Check Checkboxes
    if (!isRobot) {
      Alert.alert('Lỗi', 'Vui lòng xác thực bạn không phải là robot');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý điều khoản dịch vụ & chính sách bảo mật');
      return;
    }

    // Register Call
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role: role,
        fullName: username.trim(),
      });
      // Success
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        {
          text: 'OK',
          onPress: () => {
            setUsername('');
            setPhone('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setIsRobot(false);
            setAgreeTerms(false);
            navigation.navigate('Login');
          }
>>>>>>> origin/main
        }
      } catch (error) {
        // ignore network error silently during real-time check
      }
    }
  };

  const showToast = (message, type = 'error') => {
    Toast.show({
      type: type,
      text1: type === 'success' ? 'Thành công' : 'Lỗi',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  };

  const handleRegister = async () => {
    setTouched({ username: true, phone: true, email: true, password: true, confirm: true });

    if (!isValidUsername(form.username) || !isValidPhone(form.phone) || 
        !isValidEmail(form.email) || !isPasswordValid || !isConfirmValid) {
      return;
    }

    setIsLoading(true);
    try {
      // Use client directly so we can parse response errors correctly
      const response = await client.post('/auth/signup', {
        username: form.username.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      }, { hideToast: true });

      // Success
      showToast('🎉 Đăng ký tài khoản thành công! Trải nghiệm luyện thi IELTS cùng AI ngay bây giờ.', 'success');
      setTimeout(() => {
        navigation.navigate('Login', { prefillEmail: form.email.trim() });
      }, 2000);

    } catch (error) {
      const status = error.response?.status;
      const message = (error.response?.data?.error?.message || error.response?.data?.message || '').toLowerCase();

      if (status === 400 && message.includes('email')) {
        setServerErrors({ email: true });
        showToast('❌ Đăng ký thất bại! Email này đã được sử dụng cho một tài khoản khác.', 'error');
      } else if (status === 400 && (message.includes('điện thoại') || message.includes('phone') || message.includes('sđt'))) {
        setServerErrors({ phone: true });
        showToast('❌ Đăng ký thất bại! Số điện thoại này đã tồn tại trên hệ thống.', 'error');
      } else if (status === 400 && (message.includes('tên người dùng') || message.includes('username'))) {
        setServerErrors({ username: true });
        showToast('❌ Đăng ký thất bại! Tên người dùng này đã tồn tại trên hệ thống.', 'error');
      } else {
        showToast('❌ Hệ thống đang bận hoặc gặp sự cố. Vui lòng thử lại sau ít phút!', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render Helpers ────────────────────────────────────
  const getInputClasses = () => {
    return "border-gray-200 bg-white focus:border-[#00CC99]";
  };

  const renderStatusIcon = (field, isValidFunc) => {
    if (!touched[field]) return null;
    const isValid = typeof isValidFunc === 'function' ? isValidFunc(form[field]) : isValidFunc;
    const hasServerError = !!serverErrors[field];
    
    if (!isValid || hasServerError) {
      return <AppIcon name="x-circle" size={18} color="#EF4444" />;
    }
    return <AppIcon name="check-circle" size={18} color="#00CC99" />;
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <AppIcon name="back" size={24} color="#1E1E1E" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 ml-4">Tạo tài khoản</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Text className="text-gray-500 mb-6 text-[15px]">Đăng ký để trải nghiệm luyện thi IELTS cùng AI</Text>

          {/* ── Username ── */}
          <View className="mb-4">
            <Text className="text-[13px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Tên người dùng</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${getInputClasses()}`}>
              <AppIcon name="user" size={18} color={touched.username && isValidUsername(form.username) ? '#00CC99' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-gray-800 text-base ml-3"
                placeholder="Nhập tên người dùng"
                value={form.username}
                onChangeText={(txt) => handleChange('username', txt)}
                onBlur={() => handleBlur('username', form.username)}
                placeholderTextColor="#9CA3AF"
              />
              {renderStatusIcon('username', isValidUsername)}
            </View>
            {touched.username && !isValidUsername(form.username) && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Tên người dùng từ 2-50 ký tự, không chứa số/kí tự đặc biệt.</Text>
            )}
            {touched.username && isValidUsername(form.username) && serverErrors.username && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Tên người dùng này đã tồn tại trên hệ thống.</Text>
            )}
          </View>

<<<<<<< HEAD
          {/* ── Phone ── */}
          <View className="mb-4">
            <Text className="text-[13px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Số điện thoại</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${getInputClasses()}`}>
              <AppIcon name="phone" size={18} color={touched.phone && isValidPhone(form.phone) && !serverErrors.phone ? '#00CC99' : '#9CA3AF'} />
=======
          <View style={styles.form}>
            {/* Role Selector */}
            <Text style={{ fontFamily: 'Outfit_500Medium', color: '#374151', marginBottom: 8, fontSize: 15 }}>Tôi muốn đăng ký làm:</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setRole('STUDENT')}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: role === 'STUDENT' ? '#00c495' : '#E5E7EB',
                  backgroundColor: role === 'STUDENT' ? '#E6F9F5' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Outfit_700Bold', color: role === 'STUDENT' ? '#005C42' : '#737373' }}>Học viên</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('MENTOR')}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: role === 'MENTOR' ? '#00c495' : '#E5E7EB',
                  backgroundColor: role === 'MENTOR' ? '#E6F9F5' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Outfit_700Bold', color: role === 'MENTOR' ? '#005C42' : '#737373' }}>Giáo viên</Text>
              </TouchableOpacity>
            </View>

            {!!(error || validationError) && (
              <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: '#DC2626', textAlign: 'center', fontFamily: 'Outfit_500Medium' }}>
                  {validationError || error}
                </Text>
              </View>
            )}

            {/* Username */}
            <View style={styles.inputWrapper}>
>>>>>>> origin/main
              <TextInput
                className="flex-1 text-gray-800 text-base ml-3"
                placeholder="0912345678"
                keyboardType="numeric"
                value={form.phone}
                onChangeText={(txt) => handleChange('phone', txt)}
                onBlur={() => handleBlur('phone', form.phone)}
                placeholderTextColor="#9CA3AF"
              />
              {renderStatusIcon('phone', isValidPhone)}
            </View>
            {touched.phone && !isValidPhone(form.phone) && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Số điện thoại không hợp lệ (gồm 10 số, đúng đầu số VN).</Text>
            )}
            {touched.phone && isValidPhone(form.phone) && serverErrors.phone && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Số điện thoại này đã tồn tại trên hệ thống.</Text>
            )}
          </View>

          {/* ── Email ── */}
          <View className="mb-4">
            <Text className="text-[13px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Địa chỉ Email</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${getInputClasses()}`}>
              <AppIcon name="email" size={18} color={touched.email && isValidEmail(form.email) && !serverErrors.email ? '#00CC99' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-gray-800 text-base ml-3"
                placeholder="example@domain.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(txt) => handleChange('email', txt)}
                onBlur={() => handleBlur('email', form.email)}
                placeholderTextColor="#9CA3AF"
              />
              {renderStatusIcon('email', isValidEmail)}
            </View>
            {touched.email && !isValidEmail(form.email) && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Email không đúng định dạng.</Text>
            )}
            {touched.email && isValidEmail(form.email) && serverErrors.email && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Email này đã được sử dụng.</Text>
            )}
          </View>

          {/* ── Password ── */}
          <View className="mb-4">
            <Text className="text-[13px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Mật khẩu</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${getInputClasses()}`}>
              <AppIcon name="password" size={18} color={touched.password && isPasswordValid ? '#00CC99' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-gray-800 text-base ml-3"
                placeholder="Tạo mật khẩu mạnh"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(txt) => handleChange('password', txt)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                placeholderTextColor="#9CA3AF"
              />
              <View className="flex-row items-center pr-1">
                {touched.password && (
                  <View className="mr-3">
                    {renderStatusIcon('password', isPasswordValid)}
                  </View>
                )}
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <AppIcon name={showPassword ? 'eye-off' : 'eye-on'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Password Checklist Realtime */}
            <View className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <View className="flex-row items-center mb-1.5">
                 <AppIcon name={pwdHasLetter ? 'check-circle' : 'x-circle'} size={14} color={pwdHasLetter ? '#00CC99' : '#EF4444'} />
                 <Text className={`text-[13px] ml-2 font-medium ${pwdHasLetter ? 'text-[#00CC99]' : 'text-red-500'}`}>Có chữ cái</Text>
              </View>
              <View className="flex-row items-center mb-1.5">
                 <AppIcon name={pwdHasMinLength ? 'check-circle' : 'x-circle'} size={14} color={pwdHasMinLength ? '#00CC99' : '#EF4444'} />
                 <Text className={`text-[13px] ml-2 font-medium ${pwdHasMinLength ? 'text-[#00CC99]' : 'text-red-500'}`}>Tối thiểu 10 ký tự</Text>
              </View>
              <View className="flex-row items-center">
                 <AppIcon name={pwdHasExtra ? 'check-circle' : 'x-circle'} size={14} color={pwdHasExtra ? '#00CC99' : '#EF4444'} />
                 <Text className={`text-[13px] ml-2 font-medium ${pwdHasExtra ? 'text-[#00CC99]' : 'text-red-500'}`}>Có chữ số hoặc ký tự đặc biệt</Text>
              </View>
            </View>
          </View>

          {/* ── Confirm Password ── */}
          <View className="mb-8">
            <Text className="text-[13px] text-gray-500 font-semibold mb-1 uppercase tracking-wider">Xác nhận mật khẩu</Text>
            <View className={`flex-row items-center border rounded-xl px-4 py-3.5 ${getInputClasses()}`}>
              <AppIcon name="password" size={18} color={touched.confirm && isConfirmValid ? '#00CC99' : '#9CA3AF'} />
              <TextInput
                className="flex-1 text-gray-800 text-base ml-3"
                placeholder="Nhập lại mật khẩu"
                secureTextEntry={!showPassword}
                value={form.confirm}
                onChangeText={(txt) => handleChange('confirm', txt)}
                onBlur={() => setTouched(prev => ({ ...prev, confirm: true }))}
                placeholderTextColor="#9CA3AF"
              />
              {renderStatusIcon('confirm', isConfirmValid)}
            </View>
            {touched.confirm && !isConfirmValid && (
               <Text className="text-red-500 text-xs mt-1.5 ml-1 font-medium">❌ Mật khẩu xác nhận không trùng khớp.</Text>
            )}
          </View>

          {/* ── Submit Button ── */}
          <TouchableOpacity 
            onPress={handleRegister} 
            disabled={isLoading}
            activeOpacity={0.8}
            className={`py-4 rounded-xl items-center flex-row justify-center shadow-sm ${isLoading ? 'bg-[#A3E5D4]' : 'bg-[#00CC99]'}`}
          >
            {isLoading ? <ActivityIndicator color="#fff" className="mr-2" /> : null}
            <Text className="text-white font-bold text-[17px]">Đăng ký ngay</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500 text-[15px]">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#00CC99] font-bold text-[15px]">Đăng nhập</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
