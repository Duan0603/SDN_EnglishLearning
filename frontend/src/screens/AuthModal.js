import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet,
  Dimensions
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const AuthModal = ({ visible, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  // Basic Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  
  // Custom requested fields
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [isNotRobot, setIsNotRobot] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const validationErrorRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [validationError, setValidationError] = useState('');
  const { login, register, googleLogin, isLoading, error } = useAuthStore();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
    webClientId: '300923489735-b17vb0n3gv3ob3eb81er9v7rh6a8bqb7.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      googleLogin(id_token);
      if (onClose) onClose();
    }
  }, [response]);

  // Reset fields & errors when switching tab or modal visibility changes
  useEffect(() => {
    setValidationError('');
    useAuthStore.setState({ error: null });
    if (!visible) {
      setPassword('');
      setConfirmPassword('');
      setIsNotRobot(false);
    }
  }, [isLogin, visible]);

  const handleAction = () => {
    setValidationError('');
    useAuthStore.setState({ error: null });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    if (isLogin) {
      login(email.trim(), password);
    } else {
      // Sign Up validations
      if (!fullName.trim()) {
        setValidationError('Please enter your full name.');
        return;
      }
      if (!username.trim()) {
        setValidationError('Please choose a username.');
        return;
      }
      if (username.trim().length < 3) {
        setValidationError('Username must be at least 3 characters.');
        return;
      }

      // 1. Birthday validation: (dd/mm/yyyy)
      const bdayRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!birthday.trim() || !bdayRegex.test(birthday.trim())) {
        setValidationError('Birthday must be in dd/mm/yyyy format.');
        return;
      }

      // 2. Phone validation (numbers only)
      const numericRegex = /^\d+$/;
      if (!phone.trim() || !numericRegex.test(phone.trim())) {
        setValidationError('Please enter a valid phone number (digits only).');
        return;
      }

      // 3. Identity number validation (numbers only)
      if (!identityNumber.trim() || !numericRegex.test(identityNumber.trim())) {
        setValidationError('Please enter a valid identity number (digits only).');
        return;
      }

      if (password !== confirmPassword) {
        setValidationError('Passwords do not match.');
        return;
      }

      // 4. Robot validation checkbox
      if (!isNotRobot) {
        setValidationError("Please check 'I'm not a robot'.");
        return;
      }

      if (!agreeTerms) {
        setValidationError('You must agree to the Terms of Service & Privacy Policy.');
        return;
      }

      register({
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        birthday: birthday.trim(),
        phone: phone.trim(),
        identityNumber: identityNumber.trim()
      });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            
            <View style={styles.splitLayout}>
              {/* Visual Left Accent Side */}
              <View style={styles.leftAccentPanel}>
                <View style={styles.accentDecorationCircle1} />
                <View style={styles.accentDecorationCircle2} />
                <View style={styles.accentContent}>
                  <View style={styles.logoContainer}>
                    <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00CC99" />
                      <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill="#005C42" />
                    </Svg>
                  </View>
                  <Text style={styles.accentTitle}>Apex IELTS</Text>
                  <Text style={styles.accentSubtitle}>
                    {isLogin 
                      ? "Welcome back to your personalized elite training workspace." 
                      : "Start your journey to band 8.0+ today with real-time AI grading."
                    }
                  </Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>⭐ Premium Member Workspace</Text>
                  </View>
                </View>
              </View>

              {/* Form Side */}
              <View style={styles.formPanel}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeIconButton} onPress={onClose}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>

                {/* Tab Switcher */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity 
                    style={[styles.tabButton, isLogin && styles.activeTab]} 
                    onPress={() => setIsLogin(true)}
                  >
                    <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Log In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.tabButton, !isLogin && styles.activeTab]} 
                    onPress={() => setIsLogin(false)}
                  >
                    <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.scrollForm} 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.formHeader}>
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </Text>
                  <Text style={styles.formSubheader}>
                    {isLogin ? "Please sign in to continue learning" : "Get started with your free trial today"}
                  </Text>

                  {/* Error Box */}
                  {!!(error || validationError) && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{validationError || error}</Text>
                    </View>
                  )}

                  {/* Form inputs */}
                  {!isLogin && (
                    <>
                      <TextInput
                        mode="outlined"
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor="#00CC99"
                        textColor="#1F2937"
                        left={<TextInput.Icon icon="account-outline" color="#9CA3AF" />}
                      />

                      <TextInput
                        mode="outlined"
                        label="Username"
                        placeholder="Choose a username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor="#00CC99"
                        textColor="#1F2937"
                        left={<TextInput.Icon icon="at" color="#9CA3AF" />}
                      />

                      <TextInput
                        mode="outlined"
                        label="Type your birthday"
                        placeholder="Insert your birthday"
                        value={birthday}
                        onChangeText={setBirthday}
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor="#00CC99"
                        textColor="#1F2937"
                        left={<TextInput.Icon icon="calendar-range" color="#9CA3AF" />}
                      />

                      <TextInput
                        mode="outlined"
                        label="Insert your cell phone"
                        placeholder="Insert your phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor="#00CC99"
                        textColor="#1F2937"
                        left={<TextInput.Icon icon="phone-outline" color="#9CA3AF" />}
                      />

                      <TextInput
                        mode="outlined"
                        label="Insert your identity number to confirm yourself"
                        placeholder="Insert your identity number"
                        value={identityNumber}
                        onChangeText={setIdentityNumber}
                        keyboardType="numeric"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        outlineColor="#E5E7EB"
                        activeOutlineColor="#00CC99"
                        textColor="#1F2937"
                        left={<TextInput.Icon icon="card-account-details-outline" color="#9CA3AF" />}
                      />
                    </>
                  )}

                  <TextInput
                    mode="outlined"
                    label="Email Address"
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#00CC99"
                    textColor="#1F2937"
                    left={<TextInput.Icon icon="email-outline" color="#9CA3AF" />}
                  />

                  <TextInput
                    mode="outlined"
                    label="Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#00CC99"
                    textColor="#1F2937"
                    left={<TextInput.Icon icon="lock-outline" color="#9CA3AF" />}
                  />

                  {!isLogin && (
                    <TextInput
                      mode="outlined"
                      label="Confirm Password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      style={styles.input}
                      outlineColor="#E5E7EB"
                      activeOutlineColor="#00CC99"
                      textColor="#1F2937"
                      left={<TextInput.Icon icon="lock-check-outline" color="#9CA3AF" />}
                    />
                  )}

                  {isLogin ? (
                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.checkboxesContainer}>
                      {/* I'm not a robot requested field */}
                      <TouchableOpacity 
                        style={styles.termsRow}
                        onPress={() => setIsNotRobot(!isNotRobot)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.checkbox, isNotRobot && styles.checkboxActive]}>
                          {isNotRobot && (
                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <Path d="M20 6L9 17l-5-5" />
                            </Svg>
                          )}
                        </View>
                        <View>
                          <Text style={styles.robotLabel}>I'm not a robot</Text>
                          <Text style={styles.robotSublabel}>Click or not</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Terms */}
                      <TouchableOpacity 
                        style={styles.termsRow}
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                          {agreeTerms && (
                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <Path d="M20 6L9 17l-5-5" />
                            </Svg>
                          )}
                        </View>
                        <Text style={styles.termsText}>
                          I agree to the <Text style={styles.termsHighlight}>Terms of Service</Text> & <Text style={styles.termsHighlight}>Privacy Policy</Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Submit Button */}
                  <Button 
                    mode="contained" 
                    onPress={handleAction} 
                    loading={isLoading}
                    disabled={isLoading}
                    contentStyle={styles.submitButtonContent}
                    style={styles.submitBtn}
                    labelStyle={styles.submitButtonLabel}
                  >
                    {isLogin ? 'Sign In to Workspace' : 'Create Account'}
                  </Button>

                  {/* Social Login Separator */}
                  <View style={styles.separatorContainer}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>or continue with</Text>
                    <View style={styles.separatorLine} />
                  </View>

                  {/* Mock Social Buttons */}
                  <View style={styles.socialContainer}>
                    <TouchableOpacity 
                      style={styles.socialButton}
                      onPress={() => promptAsync()}
                      disabled={!request || isLoading}
                    >
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                        <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </Svg>
                      <Text style={styles.socialText}>Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialButton}>
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                        <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.8 16.32 4.67 9.88 9.38 9.6c1.24.07 2.06.72 2.76.71.74-.01 1.8-.78 3.26-.64 1.58.15 2.78.8 3.47 1.94-3.14 1.87-2.61 5.92.54 7.2-.67 1.69-1.53 3.36-2.36 1.47zM15.47 7.04c.05-1.74.87-3.4 2.37-4.04 1.53.66 2.32 2.3 2.12 4.02-1.63.15-3.19-.77-4.49 0.02z" />
                      </Svg>
                      <Text style={styles.socialText}>Apple</Text>
                    </TouchableOpacity>
                  </View>

                </ScrollView>
              </View>

            </View>

          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Translucent slate backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '95%',
    maxWidth: 900,
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    maxHeight: '100%',
  },
  splitLayout: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
  },
  leftAccentPanel: {
    flex: 1,
    backgroundColor: '#005C42', // Deep green accent
    padding: 40,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        display: 'flex',
      },
      default: {
        display: 'none',
      }
    })
  },
  accentDecorationCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#00CC99',
    opacity: 0.15,
    top: -80,
    right: -80,
  },
  accentDecorationCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#A7F3D0',
    opacity: 0.1,
    bottom: -50,
    left: -50,
  },
  accentContent: {
    zIndex: 2,
  },
  logoContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
  },
  accentTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  accentSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#D1FAE5',
    opacity: 0.9,
    marginBottom: 28,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  formPanel: {
    flex: 1.3,
    padding: 36,
    position: 'relative',
  },
  closeIconButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    zIndex: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    width: '100%',
  },
  tabButton: {
    paddingBottom: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#00CC99',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '800',
  },
  scrollForm: {
    flexGrow: 1,
  },
  formHeader: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  formSubheader: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#00CC99',
    fontWeight: '600',
  },
  checkboxesContainer: {
    marginBottom: 20,
    gap: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#00CC99',
    borderColor: '#00CC99',
  },
  robotLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  robotSublabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  termsHighlight: {
    color: '#00CC99',
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 14,
    backgroundColor: '#00CC99',
    shadowColor: '#00CC99',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonContent: {
    height: 52,
  },
  submitButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});

export default AuthModal;
