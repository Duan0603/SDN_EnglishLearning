import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../store/useAuthStore';
import Toast from 'react-native-toast-message';
import client from '../api/client';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import mentorRequestService from '../api/mentorRequest.service';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => {
  const flattened = StyleSheet.flatten(style) || {};
  const borderRadius = flattened.borderRadius || 0;
  const backgroundColor = flattened.backgroundColor || '#fff';
  return (
    <View style={[style, { position: 'relative' }]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius, top: offset, left: offset }]} />
      <View style={{ backgroundColor, borderWidth: 2, borderColor: '#1b263b', borderRadius, overflow: 'hidden' }}>
        {children}
      </View>
    </View>
  );
};

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  birthDate: z.string().min(1, 'Vui lòng nhập ngày sinh'),
  identityNumber: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
  expertise: z.string().optional().or(z.literal('')),
});

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useAuthStore();

  const profileName = user?.fullName || user?.name || 'Nguyễn Minh Anh';
  const profileEmail = user?.email || 'minhanh@gmail.com';
  const profilePhone = user?.phone || '0912345678';
  const profileBirthDate = user?.birthday || user?.dateOfBirth || '15/08/2002';
  const profileTrack = user?.role || 'IELTS Academic';

  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form2FA, setForm2FA] = useState(user?.is2FAEnabled || false);

  // Mentor Upgrade request state
  const [mentorRequest, setMentorRequest] = useState(null);
  const [fetchingRequest, setFetchingRequest] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchMentorRequest = async () => {
    if (user?.role !== 'STUDENT') return;
    setFetchingRequest(true);
    try {
      const res = await mentorRequestService.getMyRequest();
      if (res.data?.success) {
        setMentorRequest(res.data.data);
        if (res.data.data) {
          setBioInput(res.data.data.bio || '');
          setExpertiseInput(res.data.data.expertise || '');
        }
      }
    } catch (err) {
      console.log('Error fetching mentor request:', err);
    } finally {
      setFetchingRequest(false);
    }
  };

  React.useEffect(() => {
    fetchMentorRequest();
  }, [user]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || 'image/jpeg',
          size: file.size,
        });
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể chọn tệp.' });
    }
  };

  const handlePickAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAvatarLoading(true);

        let base64Data = '';
        if (Platform.OS === 'web') {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          base64Data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = reader.result;
              const base64 = result.split(',')[1] || '';
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          base64Data = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType?.Base64 || 'base64',
          });
        }

        const mimeType = file.mimeType || 'image/jpeg';
        const base64Image = `data:${mimeType};base64,${base64Data}`;

        const res = await client.post('/auth/upload-avatar', { image: base64Image });
        if (res.data?.success || res.data?.metadata) {
          const newAvatar = res.data.metadata?.avatar || res.data.data?.avatar;
          if (newAvatar) {
            useAuthStore.setState((state) => ({
              user: { ...state.user, avatar: newAvatar }
            }));
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật ảnh đại diện thành công!' });
          }
        }
      }
    } catch (err) {
      console.log('Error updating avatar:', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.response?.data?.error?.message || err.message || 'Không thể cập nhật ảnh đại diện.'
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSubmittingUpgrade = async () => {
    if (!selectedFile) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một chứng chỉ tiếng Anh!');
      return;
    }
    if (!bioInput.trim() || !expertiseInput.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ giới thiệu bản thân và chuyên môn!');
      return;
    }

    setSubmittingRequest(true);
    try {
      let base64Data = '';
      if (Platform.OS === 'web') {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            const base64 = result.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
      }

      const payload = {
        bio: bioInput,
        expertise: expertiseInput,
        certificates: [
          {
            filename: selectedFile.name,
            base64Data: base64Data,
          }
        ]
      };

      const res = await mentorRequestService.submitRequest(payload);
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Gửi yêu cầu nâng cấp Mentor thành công!' });
        setMentorRequest(res.data.data);
        setSelectedFile(null);
      }
    } catch (err) {
      console.log('Error submitting mentor request:', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi gửi yêu cầu',
        text2: err.response?.data?.error?.message || err.message || 'Gửi yêu cầu thất bại.'
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthday || user?.dateOfBirth || '',
      identityNumber: user?.identityNumber || '',
      bio: user?.bio || '',
      expertise: user?.expertise || '',
    },
  });

  React.useEffect(() => {
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthday || user?.dateOfBirth || '',
      identityNumber: user?.identityNumber || '',
      bio: user?.bio || '',
      expertise: user?.expertise || '',
    });
  }, [user, reset]);

  const initials = useMemo(() => {
    const parts = profileName.trim().split(/\s+/).filter(Boolean);
    const selected = parts.length >= 2 ? parts.slice(-2) : parts.slice(0, 2);
    return selected.map((part) => part[0]?.toUpperCase()).join('') || 'MA';
  }, [profileName]);

  const [apiStats, setApiStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, resultsRes] = await Promise.all([
          client.get('/users/me/stats', { hideToast: true }),
          client.get('/users/me/results?limit=50', { hideToast: true })
        ]);
        
        if (statsRes.data?.success) {
          setApiStats(statsRes.data.data || statsRes.data.metadata || null);
        }
        if (resultsRes.data?.success) {
          setRecentActivities(resultsRes.data.data.results || []);
        }
      } catch (err) {
        console.log('Error fetching data for profile:', err);
      }
    };
    fetchData();
  }, []);

  const overallBand = apiStats?.overallBand || 0;
  const readingBand = apiStats?.readingBand || 0;
  const listeningBand = apiStats?.listeningBand || 0;
  const writingBand = apiStats?.writingBand || 0;
  const speakingBand = apiStats?.speakingBand || 0;
  const totalTests = apiStats?.totalTests || 0;
  const currentStreak = apiStats?.currentStreak || 0;
  const weeksActive = apiStats?.weeksActive || 0;

  const getStreakColorStyles = (streak) => {
    if (streak >= 100) return { color: '#ec4899', bg: '#fce7f3' }; // Pink
    if (streak >= 60) return { color: '#a855f7', bg: '#f3e8ff' }; // Purple
    if (streak >= 30) return { color: '#3b82f6', bg: '#dbeafe' }; // Blue
    if (streak >= 14) return { color: '#eab308', bg: '#fef08a' }; // Yellow
    if (streak >= 7) return { color: '#f97316', bg: '#ffedd5' }; // Orange
    return { color: '#ef4444', bg: '#fee2e2' }; // Red
  };

  const streakStyles = getStreakColorStyles(currentStreak);

  const stats = [
    { icon: 'flame', value: `${currentStreak} Days`, label: 'Streak', color: streakStyles.color, bg: streakStyles.bg },
    { icon: 'book', value: `${totalTests} Tests`, label: 'Completed', color: '#4682b4', bg: '#dbeafe' },
    { icon: 'time', value: `${weeksActive} Wks`, label: 'Active', color: '#005c42', bg: '#d1fae5' },
    { icon: 'medal', value: `${apiStats?.topScore || 0} Band`, label: 'Top Score', color: '#d97706', bg: '#fef08a' },
  ];

  const tabs = useMemo(() => {
    const list = [
      { key: 'overview', label: 'TỔNG QUAN' },
      { key: 'profile', label: 'HỒ SƠ' },
      { key: 'history', label: 'LỊCH SỬ' },
      { key: 'achievements', label: 'THÀNH TÍCH' },
    ];
    if (user?.role === 'STUDENT') {
      list.push({ key: 'become_mentor', label: 'ĐĂNG KÝ MENTOR' });
    }
    return list;
  }, [user]);

  const onSubmit = async (data) => {
    try {
      const apiData = {
        fullName: data.fullName,
        phone: data.phone,
        birthday: data.birthDate,
        identityNumber: data.identityNumber,
        bio: data.bio,
        expertise: data.expertise,
      };
      await updateProfile(apiData);
      setSuccessMessage('Hồ sơ của bạn đã được cập nhật thành công!');
      setIsEditing(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Cập nhật thất bại.' });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match!');
      return;
    }
    setPasswordLoading(true);
    try {
      await client.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Change password failed:", err);
      Alert.alert('Error', err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Error changing password!');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdate2FA = async (value) => {
    setForm2FA(value);
    try {
      await client.patch('/auth/profile', { isTwoFactorEnabled: value });
      Toast.show({ type: 'success', text1: 'Thành công', text2: `Đã ${value ? 'bật' : 'tắt'} xác thực 2 bước qua Email.` });
      // Update store
      useAuthStore.setState((state) => ({
        user: { ...state.user, isTwoFactorEnabled: value }
      }));
    } catch (err) {
      console.log('Update 2FA failed:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể cập nhật 2FA.' });
      setForm2FA(!value);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigation.replace('Login');
  };

  // Achievements dynamic list
  const achievements = useMemo(() => {
    return [
      { id: 1, title: 'Kỷ Luật Thép', desc: 'Đạt chuỗi streak học tập liên tiếp 5 ngày', earned: currentStreak >= 5, icon: 'flame', color: '#f97316' },
      { id: 2, title: 'Chiến Binh IELTS', desc: 'Hoàn thành bài thi thử đầu tiên', earned: totalTests >= 1, icon: 'shield-checkmark', color: '#3b82f6' },
      { id: 3, title: 'Chuyên Gia Luyện Đề', desc: 'Hoàn thành từ 5 bài thi trở lên', earned: totalTests >= 5, icon: 'trophy', color: '#eab308' },
      { id: 4, title: 'Vượt Ải Reading', desc: 'Đạt điểm Reading đầu tiên', earned: readingBand > 0, icon: 'book', color: '#10b981' },
      { id: 5, title: 'Vượt Ải Listening', desc: 'Đạt điểm Listening đầu tiên', earned: listeningBand > 0, icon: 'headset', color: '#a855f7' },
      { id: 6, title: 'Nhà Văn IELTS', desc: 'Hoàn thành bài thi Writing đầu tiên', earned: writingBand > 0, icon: 'create', color: '#ec4899' },
      { id: 7, title: 'Diễn Giả Tiếng Anh', desc: 'Hoàn thành bài thi Speaking đầu tiên', earned: speakingBand > 0, icon: 'mic', color: '#ef4444' },
    ];
  }, [currentStreak, totalTests, readingBand, listeningBand, writingBand, speakingBand]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>HỒ SƠ CÁ NHÂN</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        {/* Spiral binder loops on the left side (Fixed) */}
        <View style={styles.binderContainer} pointerEvents="none">
          {Array.from({ length: 22 }).map((_, i) => (
            <View key={i} style={styles.binderLoop}>
              <View style={styles.hole} />
              <View style={styles.ring} />
            </View>
          ))}
        </View>

        {/* Red vertical margin line of notebook paper (Fixed) */}
        <View style={styles.notebookRedLine} pointerEvents="none" />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Profile Card */}
          <BrutalistShadow style={styles.profileCard} offset={6}>
            <View style={styles.profileCardInner}>
              <View style={styles.avatarRow}>
                <TouchableOpacity style={styles.avatarWrap} onPress={handlePickAvatar} disabled={avatarLoading}>
                  <View style={styles.avatar}>
                    {avatarLoading ? (
                      <ActivityIndicator size="small" color="#005c42" />
                    ) : user?.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>{initials}</Text>
                    )}
                  </View>
                  <View style={styles.cameraBtn}>
                    <Ionicons name="camera" size={12} color="#fff" />
                  </View>
                </TouchableOpacity>

                <View style={styles.infoWrap}>
                  <Text style={styles.nameText}>{profileName}</Text>
                  <Text style={styles.emailText}>{profileEmail}</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{profileTrack.toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.targetRow}>
                <View style={styles.targetBox}>
                  <Text style={styles.targetLabel}>CURRENT BAND</Text>
                  <Text style={[styles.targetValue, { color: '#c92a2a' }]}>{overallBand > 0 ? overallBand.toFixed(1) : '—'}</Text>
                </View>
                <View style={[styles.targetBox, styles.targetBoxDashed]}>
                  <Text style={styles.targetLabel}>TARGET BAND</Text>
                  <Text style={styles.targetValue}>7.5</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                {stats.map((item) => (
                  <View key={item.label} style={styles.statItemContainer}>
                    <BrutalistShadow style={{ borderRadius: 12, backgroundColor: item.bg }} offset={2}>
                      <View style={styles.statItem}>
                        <View style={[styles.statIcon, { backgroundColor: item.color + '20', borderColor: item.color }]}>
                          <Ionicons name={item.icon} size={15} color={item.color} />
                        </View>
                        <Text style={styles.statValue}>{item.value}</Text>
                        <Text style={styles.statLabel}>{item.label.toUpperCase()}</Text>
                      </View>
                    </BrutalistShadow>
                  </View>
                ))}
              </View>
            </View>
          </BrutalistShadow>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => {
                      setActiveTab(tab.key);
                      if (tab.key !== 'profile') setIsEditing(false);
                    }}
                    style={[styles.tabItem, isActive && styles.tabItemActive]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <View style={styles.overviewContainer}>
              
              {/* Sticky Note for AI Feedback */}
              <View style={styles.stickyNoteContainer}>
                <View style={styles.stickyNote}>
                  <View style={styles.tape} />
                  <Text style={styles.stickyTitle}>AI Advisor Feedback 🤖</Text>
                  <Text style={styles.stickyContent}>
                    {overallBand > 0 
                      ? `Your overall band is ${overallBand.toFixed(1)}. ${
                          Math.min(readingBand, listeningBand, writingBand, speakingBand) === readingBand && readingBand > 0 ? "Focus more on Reading practice to improve your vocabulary!" :
                          Math.min(readingBand, listeningBand, writingBand, speakingBand) === listeningBand && listeningBand > 0 ? "Try listening to more English podcasts to boost your Listening score!" :
                          Math.min(readingBand, listeningBand, writingBand, speakingBand) === writingBand && writingBand > 0 ? "Make sure to practice Writing task 2 structuring to raise your Writing band!" :
                          Math.min(readingBand, listeningBand, writingBand, speakingBand) === speakingBand && speakingBand > 0 ? "Your Speaking needs a bit of work. Try recording yourself and analyzing pronunciation!" :
                          "You're doing great! Keep maintaining your study streak!"
                        }`
                      : "Welcome to Apex IELTS! Complete some practice tests to get your first AI personalized feedback."}
                  </Text>
                  <View style={styles.stickyFooter}>
                    <Text style={styles.stickyFooterText}>Apex AI Coach • Updated today</Text>
                  </View>
                </View>
              </View>

              {/* Detailed Skill Breakdown */}
              <BrutalistShadow style={styles.scoreCard} offset={4}>
                <View style={styles.scoreCardInner}>
                  <Text style={styles.sectionTitle}>Detailed Skill Breakdown</Text>
                  
                  {[
                    { label: 'Reading', score: readingBand > 0 ? readingBand.toFixed(1) : '—', progress: readingBand > 0 ? (readingBand / 9) * 100 : 0, color: '#4682b4', icon: 'book' },
                    { label: 'Listening', score: listeningBand > 0 ? listeningBand.toFixed(1) : '—', progress: listeningBand > 0 ? (listeningBand / 9) * 100 : 0, color: '#005c42', icon: 'headset' },
                    { label: 'Writing', score: writingBand > 0 ? writingBand.toFixed(1) : '—', progress: writingBand > 0 ? (writingBand / 9) * 100 : 0, color: '#d97706', icon: 'create' },
                    { label: 'Speaking', score: speakingBand > 0 ? speakingBand.toFixed(1) : '—', progress: speakingBand > 0 ? (speakingBand / 9) * 100 : 0, color: '#c92a2a', icon: 'mic' },
                  ].map((skill) => (
                    <View key={skill.label} style={styles.skillRow}>
                      <View style={styles.skillInfo}>
                        <View style={styles.skillLabelContainer}>
                          <Ionicons name={skill.icon} size={14} color={skill.color} style={{ marginRight: 6 }} />
                          <Text style={styles.skillLabel}>{skill.label}</Text>
                        </View>
                        <Text style={[styles.skillScore, { color: skill.color }]}>{skill.score}</Text>
                      </View>
                      <View style={styles.skillBarTrack}>
                        <View style={[styles.skillBarFill, { width: `${skill.progress}%`, backgroundColor: skill.color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </BrutalistShadow>
            </View>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <View style={{ gap: 20 }}>
              {isEditing ? (
                // Edit profile details form
                <BrutalistShadow style={styles.settingsCard} offset={4}>
                  <View style={styles.settingsCardInner}>
                    <Text style={styles.sectionTitle}>Chỉnh Sửa Hồ Sơ</Text>

                    <Controller
                      control={control}
                      name="fullName"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>FULL NAME</Text>
                          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Full name" placeholderTextColor="#999" />
                          {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="phone"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>PHONE NUMBER</Text>
                          <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="Phone number" placeholderTextColor="#999" />
                          {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="birthDate"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>DATE OF BIRTH</Text>
                          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="DD/MM/YYYY" placeholderTextColor="#999" />
                          {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate.message}</Text>}
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="identityNumber"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>IDENTITY NUMBER / CCCD</Text>
                          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="CCCD hoặc CMND..." placeholderTextColor="#999" />
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="expertise"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>TEACHING EXPERTISE</Text>
                          <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="e.g. IELTS 8.0, IELTS Speaking Expert" placeholderTextColor="#999" />
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="bio"
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>INTRODUCTION / BIO</Text>
                          <TextInput 
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                            value={value} 
                            onChangeText={onChange} 
                            placeholder="Giới thiệu bản thân và kinh nghiệm..." 
                            placeholderTextColor="#999" 
                            multiline 
                            numberOfLines={3} 
                          />
                        </View>
                      )}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <TouchableOpacity style={[styles.saveBtn, { flex: 1, backgroundColor: '#fcd34d' }]} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.saveBtnText}>LƯU THAY ĐỔI</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.logoutBtn, { flex: 1, height: 48, justifyContent: 'center' }]} onPress={() => setIsEditing(false)}>
                        <Text style={[styles.logoutBtnText, { color: '#1b263b' }]}>HỦY</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BrutalistShadow>
              ) : (
                // Read-only profile details
                <BrutalistShadow style={styles.settingsCard} offset={4}>
                  <View style={styles.settingsCardInner}>
                    <Text style={styles.sectionTitle}>Thông Tin Tài Khoản</Text>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>HỌ TÊN</Text>
                      <Text style={styles.infoFieldValue}>{user?.fullName || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>EMAIL (TÊN ĐĂNG NHẬP)</Text>
                      <Text style={[styles.infoFieldValue, { color: '#666' }]}>{user?.email || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>SỐ ĐIỆN THOẠI</Text>
                      <Text style={styles.infoFieldValue}>{user?.phone || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>NGÀY SINH</Text>
                      <Text style={styles.infoFieldValue}>{user?.birthday || user?.dateOfBirth || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>IDENTITY NUMBER / CCCD</Text>
                      <Text style={styles.infoFieldValue}>{user?.identityNumber || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>CHUYÊN MÔN</Text>
                      <Text style={styles.infoFieldValue}>{user?.expertise || '—'}</Text>
                    </View>

                    <View style={styles.infoFieldItem}>
                      <Text style={styles.infoFieldLabel}>GIỚI THIỆU / BIO</Text>
                      <Text style={styles.infoFieldValue}>{user?.bio || '—'}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.saveBtn, { backgroundColor: '#a7f3d0', marginTop: 12 }]} 
                      onPress={() => setIsEditing(true)}
                    >
                      <Text style={styles.saveBtnText}>CHỈNH SỬA THÔNG TIN ✏️</Text>
                    </TouchableOpacity>
                  </View>
                </BrutalistShadow>
              )}

              {/* Password & Security Card */}
              <BrutalistShadow style={styles.settingsCard} offset={4}>
                <View style={styles.settingsCardInner}>
                  <Text style={styles.sectionTitle}>Đổi Mật Khẩu</Text>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CURRENT PASSWORD</Text>
                    <TextInput 
                      style={styles.input} 
                      value={oldPassword} 
                      onChangeText={setOldPassword} 
                      placeholder="Enter current password" 
                      placeholderTextColor="#999" 
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>NEW PASSWORD</Text>
                    <TextInput 
                      style={styles.input} 
                      value={newPassword} 
                      onChangeText={setNewPassword} 
                      placeholder="Enter new password" 
                      placeholderTextColor="#999" 
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                    <TextInput 
                      style={styles.input} 
                      value={confirmPassword} 
                      onChangeText={setConfirmPassword} 
                      placeholder="Confirm new password" 
                      placeholderTextColor="#999" 
                      secureTextEntry
                    />
                  </View>

                  <TouchableOpacity 
                    style={[styles.saveBtn, { backgroundColor: '#fbcfe8', borderColor: '#1b263b' }]} 
                    onPress={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <ActivityIndicator size="small" color="#c92a2a" />
                    ) : (
                      <Text style={[styles.saveBtnText, { color: '#c92a2a' }]}>CHANGE PASSWORD 🔑</Text>
                    )}
                  </TouchableOpacity>

                  <View style={{ height: 1, backgroundColor: '#1b263b', opacity: 0.2, marginVertical: 20 }} />

                  <Text style={styles.sectionTitle}>Xác Thực 2 Bước (2FA)</Text>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#666', marginBottom: 12 }}>
                    Nhận mã xác thực qua Email mỗi khi bạn đăng nhập tài khoản.
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      padding: 12, backgroundColor: '#fdfaf2', borderWidth: 2, borderColor: '#1b263b',
                      borderRadius: 12
                    }}
                    onPress={() => handleUpdate2FA(!form2FA)}
                  >
                    <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 13, color: '#1b263b' }}>Enable 2FA</Text>
                    <View style={{
                      width: 44, height: 24, borderRadius: 12, backgroundColor: form2FA ? '#00cc99' : '#eae6ca',
                      borderWidth: 2, borderColor: '#1b263b', justifyContent: 'center', paddingHorizontal: 2
                    }}>
                      <View style={{
                        width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff',
                        borderWidth: 1, borderColor: '#1b263b',
                        transform: [{ translateX: form2FA ? 20 : 0 }]
                      }} />
                    </View>
                  </TouchableOpacity>
                  
                  {user?.role === 'ADMIN' && (
                    <TouchableOpacity 
                      style={[styles.logoutBtn, { marginTop: 20, borderColor: '#005c42', backgroundColor: '#e8f5e9' }]} 
                      onPress={() => navigation.navigate('Admin')}
                    >
                      <Text style={[styles.logoutBtnText, { color: '#005c42' }]}>ADMIN PANEL 🛠️</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={[styles.logoutBtn, { marginTop: 20 }]} onPress={() => setShowLogoutModal(true)}>
                    <Text style={styles.logoutBtnText}>LOG OUT</Text>
                  </TouchableOpacity>
                </View>
              </BrutalistShadow>
            </View>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <BrutalistShadow style={styles.settingsCard} offset={4}>
              <View style={styles.settingsCardInner}>
                <Text style={styles.sectionTitle}>Lịch Sử Làm Bài</Text>
                
                {recentActivities.length > 0 ? (
                  recentActivities.map((item, index) => {
                    const iconMap = {
                      'READING': 'book',
                      'LISTENING': 'headset',
                      'WRITING': 'create',
                      'SPEAKING': 'mic',
                    };
                    const colorMap = {
                      'READING': '#4682b4',
                      'LISTENING': '#005c42',
                      'WRITING': '#d97706',
                      'SPEAKING': '#c92a2a',
                    };
                    const typeIcon = iconMap[item.type] || 'document-text';
                    const typeColor = colorMap[item.type] || '#1b263b';
                    const itemDate = item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—';

                    return (
                      <View key={item.id || index} style={styles.historyRow}>
                        <View style={[styles.historyIconBox, { borderColor: typeColor, backgroundColor: typeColor + '15' }]}>
                          <Ionicons name={typeIcon} size={18} color={typeColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyTitle} numberOfLines={1}>
                            {item.title || `${item.type} practice test`}
                          </Text>
                          <Text style={styles.historyTime}>
                            {itemDate}
                          </Text>
                        </View>
                        {item.bandScore > 0 && (
                          <View style={[styles.historyScoreBadge, { borderColor: typeColor }]}>
                            <Text style={[styles.historyScoreText, { color: typeColor }]}>
                              {item.bandScore.toFixed(1)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View style={{ py: 20, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', textAlign: 'center' }}>
                      Bạn chưa thực hiện bài thi thử nào trên thiết bị này.
                    </Text>
                  </View>
                )}
              </View>
            </BrutalistShadow>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <BrutalistShadow style={styles.settingsCard} offset={4}>
              <View style={styles.settingsCardInner}>
                <Text style={styles.sectionTitle}>Thành Tích Đạt Được</Text>
                
                <View style={styles.achieveGrid}>
                  {achievements.map((item) => (
                    <View key={item.id} style={[styles.achieveCard, { borderColor: item.earned ? item.color : '#ccc', backgroundColor: item.earned ? item.color + '0a' : '#f9f9f9' }]}>
                      <View style={[styles.achieveIconWrap, { backgroundColor: item.earned ? item.color + '18' : '#e0e0e0', borderColor: item.earned ? item.color : '#999' }]}>
                        <Ionicons name={item.earned ? item.icon : 'lock-closed'} size={24} color={item.earned ? item.color : '#777'} />
                      </View>
                      <Text style={[styles.achieveTitle, { color: item.earned ? '#1b263b' : '#777' }]}>
                        {item.title}
                      </Text>
                      <Text style={styles.achieveDesc}>
                        {item.desc}
                      </Text>
                      {item.earned && (
                        <View style={[styles.achieveTag, { backgroundColor: item.color }]}>
                          <Text style={styles.achieveTagText}>ĐÃ ĐẠT</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </BrutalistShadow>
          )}

          {/* Become Mentor Tab */}
          {activeTab === 'become_mentor' && (
            <BrutalistShadow style={styles.settingsCard} offset={4}>
              <View style={styles.settingsCardInner}>
                <Text style={styles.sectionTitle}>Become a Mentor</Text>
                
                {fetchingRequest ? (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1b263b" />
                  </View>
                ) : mentorRequest?.status === 'PENDING' ? (
                  <View style={{ gap: 16 }}>
                    <View style={[styles.stickyNote, { backgroundColor: '#ffe082', rotate: '0deg', transform: [] }]}>
                      <Text style={[styles.stickyTitle, { color: '#b58100' }]}>Application Pending ⏳</Text>
                      <Text style={styles.stickyContent}>
                        Your upgrade request has been submitted successfully and is currently under review.
                        We will check your certificates and respond as soon as possible.
                      </Text>
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>REGISTERED EXPERTISE</Text>
                      <TextInput style={[styles.input, { backgroundColor: '#e5e7eb', color: '#6b7280' }]} value={expertiseInput} editable={false} />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>INTRODUCTION / BIO</Text>
                      <TextInput style={[styles.input, { backgroundColor: '#e5e7eb', color: '#6b7280' }]} value={bioInput} multiline numberOfLines={3} editable={false} />
                    </View>
                    {mentorRequest.certificates?.map((url, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Ionicons name="document-text" size={16} color="#005c42" />
                        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#005c42', textDecorationLine: 'underline' }} numberOfLines={1}>
                          Certificate {idx + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : mentorRequest?.status === 'REJECTED' ? (
                  <View style={{ gap: 16 }}>
                    <View style={[styles.stickyNote, { backgroundColor: '#ffcdd2', rotate: '0deg', transform: [] }]}>
                      <Text style={[styles.stickyTitle, { color: '#c62828' }]}>Application Rejected ❌</Text>
                      <Text style={[styles.stickyContent, { color: '#c62828' }]}>
                        Unfortunately, your account upgrade request has been rejected.
                      </Text>
                      <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 13, color: '#1b263b', marginTop: 8 }}>
                        Reason from Admin:
                      </Text>
                      <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#333', marginTop: 4, fontStyle: 'italic' }}>
                        "{mentorRequest.adminComment || 'No detailed reason provided.'}"
                      </Text>
                    </View>
                    
                    <TouchableOpacity style={styles.saveBtn} onPress={() => setMentorRequest(null)}>
                      <Text style={styles.saveBtnText}>CREATE NEW REQUEST</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', marginBottom: 20 }}>
                      Submit your English certificates (IELTS, TOEFL...) and a brief introduction. Admin will review and upgrade your account to Mentor.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>TEACHING EXPERTISE</Text>
                      <TextInput 
                        style={styles.input} 
                        value={expertiseInput} 
                        onChangeText={setExpertiseInput} 
                        placeholder="e.g. IELTS 8.0, IELTS Speaking Expert" 
                        placeholderTextColor="#999" 
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>INTRODUCTION / EXPERIENCE</Text>
                      <TextInput 
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                        value={bioInput} 
                        onChangeText={setBioInput} 
                        placeholder="Briefly introduce yourself and your teaching experience..." 
                        placeholderTextColor="#999" 
                        multiline
                        numberOfLines={4}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>ENGLISH CERTIFICATES (IMAGE OR PDF)</Text>
                      
                      {selectedFile ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 12, backgroundColor: '#fcfbf7' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <Ionicons name="document-attach" size={20} color="#1b263b" />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 13, color: '#1b263b' }} numberOfLines={1}>
                                {selectedFile.name}
                              </Text>
                              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#666' }}>
                                {selectedFile.size ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Ionicons name="trash-outline" size={20} color="#c92a2a" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={[styles.logoutBtn, { borderStyle: 'dashed', backgroundColor: '#fff' }]} onPress={handlePickDocument}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="cloud-upload-outline" size={18} color="#1b263b" />
                            <Text style={[styles.logoutBtnText, { color: '#1b263b' }]}>CHOOSE CERTIFICATE FILE</Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity 
                      style={[styles.saveBtn, { marginTop: 12, opacity: submittingRequest ? 0.7 : 1 }]} 
                      onPress={handleSubmittingUpgrade}
                      disabled={submittingRequest}
                    >
                      {submittingRequest ? (
                        <ActivityIndicator size="small" color="#005c42" />
                      ) : (
                        <Text style={styles.saveBtnText}>SUBMIT REQUEST</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BrutalistShadow>
          )}
        </ScrollView>
      </View>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={{ borderRadius: 16, width: '90%', maxWidth: 400 }} offset={6}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="log-out" size={32} color="#c92a2a" />
              </View>
              <Text style={styles.modalTitle}>Sign Out?</Text>
              <Text style={styles.modalDesc}>Are you sure you want to log out of your session?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)}>
                  <Text style={styles.modalBtnCancelText}>CANCEL</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity style={styles.modalBtnDanger} onPress={confirmLogout}>
                  <Text style={styles.modalBtnDangerText}>SIGN OUT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={!!successMessage} transparent animationType="fade" onRequestClose={() => setSuccessMessage('')}>
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={{ borderRadius: 16, width: '90%', maxWidth: 400 }} offset={6}>
            <View style={styles.modalContainer}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#a7f3d0' }]}>
                <Ionicons name="checkmark-circle" size={32} color="#005c42" />
              </View>
              <Text style={styles.modalTitle}>Thành Công</Text>
              <Text style={styles.modalDesc}>{successMessage}</Text>
              <TouchableOpacity style={[styles.saveBtn, { width: '100%', marginTop: 12, backgroundColor: '#a7f3d0' }]} onPress={() => setSuccessMessage('')}>
                <Text style={[styles.saveBtnText, { color: '#005c42' }]}>TIẾP TỤC</Text>
              </TouchableOpacity>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
    zIndex: 10,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontFamily: 'Outfit_900Black', fontSize: 24, color: '#1b263b', lineHeight: 28 },
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 1 },
  
  // Notebook elements style
  binderContainer: {
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 5,
    paddingVertical: 10,
  },
  binderLoop: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
  },
  hole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    borderWidth: 1.5,
    borderColor: '#1b263b',
  },
  ring: {
    width: 14,
    height: 4,
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    marginLeft: -2,
    borderWidth: 1,
    borderColor: '#1b263b',
  },
  notebookRedLine: {
    position: 'absolute',
    left: 48,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(224, 86, 91, 0.4)',
    zIndex: 3,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingLeft: 64, paddingRight: 20, paddingTop: 20, paddingBottom: 40 },

  profileCard: { borderRadius: 24, marginBottom: 24 },
  profileCardInner: { backgroundColor: '#fcfbf7', padding: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 72, height: 72, borderRadius: 16, backgroundColor: '#a7f3d0',
    borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#005c42' },
  cameraBtn: {
    position: 'absolute', bottom: -6, right: -6, width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#1b263b', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fcfbf7',
  },
  infoWrap: { marginLeft: 16, flex: 1 },
  nameText: { fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 2 },
  emailText: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 6 },
  roleBadge: {
    backgroundColor: '#ffd54f', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1.5, borderColor: '#1b263b', alignSelf: 'flex-start',
  },
  roleText: { fontSize: 9, fontFamily: 'Outfit_900Black', color: '#1b263b' },

  targetRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  targetBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 2, borderColor: '#1b263b',
  },
  targetBoxDashed: { borderStyle: 'dashed' },
  targetLabel: { fontSize: 9, fontFamily: 'Outfit_900Black', color: '#666' },
  targetValue: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#1b263b', marginTop: 4 },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: '#1b263b', paddingTop: 16,
  },
  statItemContainer: {
    width: '48%',
    marginBottom: 10,
  },
  statItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: { 
    width: 32, height: 32, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 6, borderWidth: 1.5, borderColor: '#1b263b' 
  },
  statValue: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  statLabel: { fontSize: 9, fontFamily: 'Outfit_700Bold', color: '#666', marginTop: 2 },

  // Tabs
  tabsContainer: {
    flexDirection: 'row', backgroundColor: '#fcfbf7', borderRadius: 12,
    borderWidth: 2, borderColor: '#1b263b', padding: 4, marginBottom: 24,
  },
  tabItem: { paddingHorizontal: 16, alignItems: 'center', paddingVertical: 10, borderRadius: 8 },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  tabTextActive: { color: '#fff' },

  // Overview Tab Styles
  overviewContainer: {
    gap: 20,
  },
  stickyNoteContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  stickyNote: {
    backgroundColor: '#ffd54f',
    width: '100%',
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1b263b',
    transform: [{ rotate: '1.5deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tape: {
    position: 'absolute',
    top: -10, left: '50%',
    marginLeft: -35,
    width: 70, height: 20,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1, borderColor: '#ccc',
    transform: [{ rotate: '-2deg' }],
  },
  stickyTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
    color: '#c92a2a',
    marginBottom: 6,
  },
  stickyContent: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#1b263b',
    lineHeight: 18,
    marginBottom: 10,
  },
  stickyFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,38,59,0.15)',
    paddingTop: 8,
  },
  stickyFooterText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 9,
    color: 'rgba(27,38,59,0.5)',
  },

  scoreCard: { borderRadius: 20, marginBottom: 20 },
  scoreCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  skillRow: {
    marginBottom: 14,
  },
  skillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 13,
    color: '#1b263b',
  },
  skillScore: {
    fontFamily: 'Outfit_900Black',
    fontSize: 15,
  },
  skillBarTrack: {
    height: 8,
    backgroundColor: '#f5f3dc',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%',
  },

  // Settings Tab Styles
  settingsCard: { borderRadius: 24 },
  settingsCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },
  
  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Outfit_900Black', fontSize: 9, color: '#666', marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#1b263b',
  },
  errorText: { fontFamily: 'Outfit_700Bold', fontSize: 9, color: '#c92a2a', marginTop: 4, marginLeft: 4 },

  saveBtn: { backgroundColor: '#a7f3d0', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  saveBtnText: { color: '#005c42', fontFamily: 'Outfit_900Black', fontSize: 13 },
  logoutBtn: { backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutBtnText: { color: '#c92a2a', fontFamily: 'Outfit_900Black', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fcfbf7', padding: 20, alignItems: 'center' },
  modalIconWrap: { marginBottom: 12 },
  modalTitle: { fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 6 },
  modalDesc: { fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnCancelText: { fontFamily: 'Outfit_900Black', fontSize: 11, color: '#1b263b' },
  modalBtnDanger: { flex: 1, backgroundColor: '#c92a2a', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalBtnDangerText: { fontFamily: 'Outfit_900Black', fontSize: 11, color: '#fff' },

  // Read-only Info List Styles
  infoFieldItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(27,38,59,0.1)',
    paddingVertical: 12,
    marginBottom: 8,
  },
  infoFieldLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
  },
  infoFieldValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: '#1b263b',
  },

  // History Tab Styles
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#1b263b',
    gap: 12,
  },
  historyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
    color: '#1b263b',
    marginBottom: 2,
  },
  historyTime: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#999',
  },
  historyScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  historyScoreText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
  },

  // Achievements Tab Styles
  achieveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  achieveCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  achieveIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achieveTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  achieveDesc: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 9,
    color: '#777',
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 10,
  },
  achieveTag: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  achieveTagText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 7,
    color: '#fff',
  },
});

export default ProfileScreen;
