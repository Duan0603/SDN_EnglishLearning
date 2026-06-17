import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text, StyleSheet, Alert, BackHandler, Image } from 'react-native';
import { TextInput, Button, HelperText, Checkbox } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password real-time validation
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasLength = password.length >= 10;
  const hasNumberOrSpecial = /[\d\W]/.test(password);
  const isPasswordValid = hasLetter && hasLength && hasNumberOrSpecial;

  // Confirm password check
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === password;

  // BackHandler Interceptor
  useEffect(() => {
    const hasData = username || phone || email || password || confirmPassword;
    const backAction = () => {
      if (hasData) {
        Alert.alert(
          'Cảnh báo',
          'Bạn có chắc chắn muốn thoát? Các thông tin bạn vừa nhập sẽ bị mất.',
          [
            { text: 'Hủy', style: 'cancel', onPress: () => {} },
            { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() },
          ]
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [username, phone, email, password, confirmPassword, navigation]);

  // onBlur Handlers
  const handleBlurUsername = async () => {
    if (!username.trim()) return;
    const isAvail = await checkAvailability('username', username.trim());
    setUsernameError(isAvail ? '' : 'Tên đã tồn tại');
  };

  const handleBlurPhone = async () => {
    if (!phone.trim()) return;
    if (!validatePhone(phone)) {
      setPhoneError('Vui lòng nhập đúng SĐT Việt Nam (VD: 09... có 10 số)');
      return;
    }
    const isAvail = await checkAvailability('phone', phone.trim());
    setPhoneError(isAvail ? '' : 'Số điện thoại đã được sử dụng');
  };

  const handleBlurEmail = async () => {
    if (!email.trim()) return;
    if (!validateEmail(email)) {
      setEmailError('Định dạng email chưa chính xác');
      return;
    }
    const isAvail = await checkAvailability('email', email.trim());
    setEmailError(isAvail ? '' : 'Email đã tồn tại');
  };

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
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng ký thất bại, vui lòng thử lại sau.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          
          <View style={[styles.header, { marginTop: insets.top + 20 }]}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.subtitle}>Đăng ký để trải nghiệm ứng dụng</Text>
          </View>

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
              <TextInput
                mode="outlined"
                label="Tên người dùng"
                value={username}
                onChangeText={(txt) => { setUsername(txt); setUsernameError(''); }}
                onBlur={handleBlurUsername}
                error={!!usernameError}
                outlineColor="#E5E7EB"
                activeOutlineColor="#00c495"
                style={styles.input}
                theme={{ roundness: 12 }}
              />
              {!!usernameError && <HelperText type="error" visible={true}>{usernameError}</HelperText>}
            </View>

            {/* Phone */}
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                label="Số điện thoại"
                value={phone}
                onChangeText={(txt) => { setPhone(txt); setPhoneError(''); }}
                onBlur={handleBlurPhone}
                keyboardType="numeric"
                error={!!phoneError}
                outlineColor="#E5E7EB"
                activeOutlineColor="#00c495"
                style={styles.input}
                theme={{ roundness: 12 }}
              />
              {!!phoneError && <HelperText type="error" visible={true}>{phoneError}</HelperText>}
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                label="Email"
                value={email}
                onChangeText={(txt) => { setEmail(txt); setEmailError(''); }}
                onBlur={handleBlurEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!emailError}
                outlineColor="#E5E7EB"
                activeOutlineColor="#00c495"
                style={styles.input}
                theme={{ roundness: 12 }}
              />
              {!!emailError && <HelperText type="error" visible={true}>{emailError}</HelperText>}
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                outlineColor="#E5E7EB"
                activeOutlineColor="#00c495"
                style={styles.input}
                theme={{ roundness: 12 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                      </TouchableOpacity>
                    )}
                  />
                }
              />
              {/* Password Criteria */}
              <View style={styles.criteriaContainer}>
                <PasswordCriteria text="Có chữ cái" isValid={hasLetter} isEmpty={password.length === 0} />
                <PasswordCriteria text="Tối thiểu 10 ký tự" isValid={hasLength} isEmpty={password.length === 0} />
                <PasswordCriteria text="Có chữ số hoặc ký tự đặc biệt" isValid={hasNumberOrSpecial} isEmpty={password.length === 0} />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <TextInput
                mode="outlined"
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                outlineColor="#E5E7EB"
                activeOutlineColor="#00c495"
                style={styles.input}
                theme={{ roundness: 12 }}
                right={
                  <TextInput.Icon
                    icon={() => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        {confirmPassword.length > 0 ? (
                          isConfirmValid ? (
                            <AntDesign name="checkcircle" size={20} color="#00c495" />
                          ) : (
                            <AntDesign name="closecircle" size={20} color="#EF4444" />
                          )
                        ) : null}
                      </View>
                    )}
                  />
                }
              />
              {confirmPassword.length > 0 && !isConfirmValid && (
                <HelperText type="error" visible={true}>Mật khẩu không khớp.</HelperText>
              )}
            </View>

            {/* Checkboxes */}
            <View style={styles.checkboxSection}>
              {/* Recaptcha Mock */}
              <TouchableOpacity activeOpacity={0.8} onPress={() => setIsRobot(!isRobot)} style={styles.recaptchaWrapper}>
                <View style={styles.recaptchaContent}>
                  <Checkbox.Android status={isRobot ? 'checked' : 'unchecked'} color="#00c495" />
                  <Text style={styles.recaptchaText}>Tôi không phải là người máy</Text>
                </View>
                <Image source={{ uri: 'https://www.gstatic.com/recaptcha/api2/logo_48.png' }} style={{ width: 32, height: 32 }} />
              </TouchableOpacity>

              {/* Terms */}
              <TouchableOpacity activeOpacity={0.8} onPress={() => setAgreeTerms(!agreeTerms)} style={styles.termsWrapper}>
                <Checkbox.Android status={agreeTerms ? 'checked' : 'unchecked'} color="#00c495" />
                <Text style={styles.termsText}>
                  Tôi đồng ý với <Text style={styles.linkText}>Điều khoản dịch vụ</Text> & <Text style={styles.linkText}>Chính sách bảo mật</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              loading={isLoading}
              onPress={handleSubmit}
              contentStyle={styles.btnContent}
              labelStyle={styles.btnLabel}
              style={styles.submitBtn}
            >
              Tạo Tài Khoản
            </Button>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24, marginBottom: 12, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280', fontFamily: 'Outfit_500Medium', fontSize: 16 }}>
                Đã có tài khoản? <Text style={{ color: '#00c495', fontFamily: 'Outfit_700Bold' }}>Đăng nhập</Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#111827',
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
  },
  criteriaContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Outfit_500Medium',
  },
  checkboxSection: {
    marginTop: 8,
    marginBottom: 24,
    gap: 16,
  },
  recaptchaWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recaptchaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recaptchaText: {
    marginLeft: 8,
    fontFamily: 'Outfit_500Medium',
    fontSize: 15,
    color: '#374151',
  },
  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 24,
  },
  termsText: {
    marginLeft: 8,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  linkText: {
    color: '#00c495',
    fontFamily: 'Outfit_600SemiBold',
  },
  submitBtn: {
    borderRadius: 12,
    backgroundColor: '#00c495',
  },
  btnContent: {
    height: 56,
  },
  btnLabel: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: '#FFFFFF',
  }
});

export default RegisterScreen;
