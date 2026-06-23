<<<<<<< HEAD
// ============================================================
// ProfileScreen - Mobile First Dashboard
// NO web layouts, NO nativewind
// ============================================================

import React, { useMemo, useState } from 'react';
=======
import React, { useMemo, useState, useEffect } from 'react';
>>>>>>> origin/main
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
<<<<<<< HEAD
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import AppIcon from '../shared/icons/AppIcon';
import { AppButton, AppTextInput } from '../shared/components';
import useAuthStore from '../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

// Validation Schema using Zod
const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  birthDate: z.string().min(1, 'Vui lòng nhập ngày sinh'),
});
=======
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Rect, Stop, Circle } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import client from '../api/client';
>>>>>>> origin/main

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();

<<<<<<< HEAD
  const profileName = user?.fullName || user?.name || 'Nguyễn Minh Anh';
  const profileEmail = user?.email || 'minhanh@gmail.com';
  const profilePhone = user?.phone || '0912345678';
  const profileBirthDate = user?.dateOfBirth || user?.birthday || '15/08/2002';
  const profileTrack = user?.role || 'IELTS Academic';

  const [activeTab, setActiveTab] = useState('settings');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // React Hook Form Setup
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone,
      birthDate: profileBirthDate,
    },
=======
  const profileName = user?.fullName || user?.name || 'User';
  const profileEmail = user?.email || '';
  const profilePhone = user?.phone || '';
  const profileBirthDate = user?.birthday || '';
  const profileCountry = user?.country || 'Việt Nam';
  const profileCity = user?.city || 'Hà Nội';
  const profileTrack = user?.role || 'STUDENT';

  const defaultTab = user?.role === 'MENTOR' ? 'availabilities' : 'bookings';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const [form, setForm] = useState({
    fullName: profileName,
    email: profileEmail,
    phone: profilePhone,
    birthDate: profileBirthDate,
    country: profileCountry,
    city: profileCity,
    bio: user?.bio || '',
    expertise: user?.expertise || '',
>>>>>>> origin/main
  });

  // Availabilities State (Mentor only)
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState(''); // YYYY-MM-DD
  const [newSlotStart, setNewSlotStart] = useState(''); // HH:MM
  const [newSlotEnd, setNewSlotEnd] = useState(''); // HH:MM
  const [newSlotLink, setNewSlotLink] = useState('');

  // Bookings State (Student / Mentor)
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Notes Modal State
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState(null);
  const [mentorNotesText, setMentorNotesText] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const initials = useMemo(() => {
    const parts = profileName.trim().split(/\s+/).filter(Boolean);
    const selected = parts.length >= 2 ? parts.slice(-2) : parts.slice(0, 2);
    return selected.map((part) => part[0]?.toUpperCase()).join('') || 'U';
  }, [profileName]);

  const stats = [
    { icon: 'flame', value: '42 ngày', label: 'Chuỗi học', color: '#F97316' },
    { icon: 'book', value: '34 bài', label: 'Đã thi thử', color: '#6366F1' },
    { icon: 'chatbubbles', value: '28 lần', label: 'AI Feedback', color: '#10B981' },
    { icon: 'medal', value: '3 huy hiệu', label: 'Thành tích', color: '#F59E0B' },
  ];

  const tabs = useMemo(() => {
    const baseTabs = [
      { key: 'settings', label: 'Cài đặt' },
    ];
    if (user?.role === 'MENTOR') {
      return [
        { key: 'availabilities', label: 'Lịch trống' },
        { key: 'bookings', label: 'Lịch hẹn (Mentor)' },
        ...baseTabs,
      ];
    } else {
      return [
        { key: 'bookings', label: 'Lịch hẹn' },
        ...baseTabs,
      ];
    }
  }, [user?.role]);

<<<<<<< HEAD
  const onSubmit = (data) => {
    Alert.alert('Đã lưu', 'Thông tin cá nhân của bạn đã được cập nhật:\n' + JSON.stringify(data, null, 2));
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };
  
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={S.appBarTitle}>Hồ sơ cá nhân</Text>
        <View style={S.backBtn} />
      </View>

      <ScrollView 
        style={S.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* ── Profile Card ─────────────────────────────── */}
        <View style={S.profileCard}>
          <View style={S.headerBg}>
            <Svg width="100%" height="100%" style={S.absoluteFill}>
              <Defs>
                <LinearGradient id="profileHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={COLORS.primaryLight} stopOpacity="1" />
                  <Stop offset="55%" stopColor={COLORS.accent} stopOpacity="0.4" />
                  <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.2" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileHeaderGrad)" />
=======
  // Fetch availabilities
  const fetchAvailabilities = async () => {
    setIsLoadingAvailabilities(true);
    try {
      const response = await client.get('/mentors/availabilities');
      setAvailabilities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch availabilities:', error);
    } finally {
      setIsLoadingAvailabilities(false);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await client.get('/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'availabilities' && user?.role === 'MENTOR') {
      fetchAvailabilities();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab, user?.role]);

  // Update profile
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await client.patch('/auth/profile', {
        fullName: form.fullName,
        birthday: form.birthDate,
        phone: form.phone,
        bio: form.bio,
        expertise: form.expertise,
      });
      useAuthStore.setState({ user: response.data.metadata });
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add availability slot
  const handleAddSlot = async () => {
    if (!newSlotDate || !newSlotStart || !newSlotEnd) {
      Alert.alert('Lỗi', 'Vui lòng điền ngày, giờ bắt đầu và giờ kết thúc.');
      return;
    }
    try {
      const startTime = new Date(`${newSlotDate}T${newSlotStart}:00`);
      const endTime = new Date(`${newSlotDate}T${newSlotEnd}:00`);
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        Alert.alert('Lỗi', 'Định dạng ngày/giờ không hợp lệ.');
        return;
      }
      if (startTime <= new Date()) {
        Alert.alert('Lỗi', 'Giờ bắt đầu phải ở tương lai.');
        return;
      }
      if (endTime <= startTime) {
        Alert.alert('Lỗi', 'Giờ kết thúc phải sau giờ bắt đầu.');
        return;
      }

      await client.post('/mentors/availabilities', {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        meetingLink: newSlotLink || undefined,
      });

      Alert.alert('Thành công', 'Đã tạo lịch rảnh mới.');
      setNewSlotDate('');
      setNewSlotStart('');
      setNewSlotEnd('');
      setNewSlotLink('');
      fetchAvailabilities();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tạo lịch rảnh.');
    }
  };

  // Delete availability slot
  const handleDeleteSlot = async (slotId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa lịch trống này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete(`/mentors/availabilities/${slotId}`);
              Alert.alert('Thành công', 'Đã xóa lịch trống.');
              fetchAvailabilities();
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể xóa lịch trống.');
            }
          },
        },
      ]
    );
  };

  // Cancel booking
  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      'Hủy lịch hẹn',
      'Bạn có muốn hủy lịch hẹn coaching này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.patch(`/bookings/${bookingId}/cancel`);
              Alert.alert('Thành công', 'Lịch hẹn đã được hủy.');
              fetchBookings();
            } catch (err) {
              Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy lịch.');
            }
          },
        },
      ]
    );
  };

  // Open review notes modal
  const openNotesModal = (booking) => {
    setSelectedBookingForNotes(booking);
    setMentorNotesText(booking.mentorNotes || '');
    setShowNotesModal(true);
  };

  // Save mentor notes
  const handleSaveNotes = async () => {
    if (!selectedBookingForNotes) return;
    setIsSavingNotes(true);
    try {
      await client.patch(`/bookings/${selectedBookingForNotes.id}/notes`, {
        mentorNotes: mentorNotesText,
      });
      Alert.alert('Thành công', 'Đã cập nhật nhận xét và phản hồi.');
      setShowNotesModal(false);
      fetchBookings();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể lưu nhận xét.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const InputField = ({ label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'sentences', placeholder = '' }) => (
    <View className={isDesktop ? 'w-[48.5%] mb-5' : 'w-full mb-5'}>
      <Text className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[#7A8BA3]">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="h-[56px] rounded-[18px] border border-[#D8E0EA] bg-[#EDF2F7] px-4 text-[16px] text-[#111827]"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FB]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingVertical: 18 }}>
        <View className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            style={{ zIndex: 50, elevation: 8 }}
            className="mb-4 self-start flex-row items-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2 shadow-lg"
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
              <Path d="M15 18l-6-6 6-6" />
>>>>>>> origin/main
            </Svg>

<<<<<<< HEAD
            <View style={S.headerContent}>
              <View style={S.avatarRow}>
                <View style={S.avatarWrap}>
                  <View style={S.avatar}>
                    <Text style={S.avatarText}>{initials}</Text>
                  </View>
                  <TouchableOpacity style={S.cameraBtn} activeOpacity={0.8}>
                    <AppIcon name="camera" size={14} color={COLORS.textInverse} />
=======
          {/* Profile Header */}
          <View className="overflow-hidden rounded-[28px] border border-[#E4EAF2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <View className="relative min-h-[210px] md:h-[210px] overflow-hidden justify-end">
              <Svg width="100%" height="100%" className="absolute inset-0">
                <Defs>
                  <LinearGradient id="profileHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#A2E8D0" stopOpacity="1" />
                    <Stop offset="55%" stopColor="#B8D8F4" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#B9B4F7" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileHeaderGrad)" />
              </Svg>

              <View className="absolute right-10 top-6 h-20 w-20 rounded-full bg-white/15" />
              <View className="absolute right-16 top-11 h-9 w-9 rounded-full bg-white/10" />

              <View className="px-5 pb-5 pt-8 md:pt-0">
                <View className="flex-col md:flex-row md:items-end justify-between gap-4">
                  <View className="flex-row items-end">
                    <View className="relative">
                      <View className="h-[94px] w-[94px] items-center justify-center rounded-[20px] border-[4px] border-white bg-[#0AA67D] shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                        <Text className="text-[31px] font-semibold tracking-tight text-white">
                          {initials}
                        </Text>
                      </View>
                    </View>

                    <View className="ml-4 pb-2">
                      <Text className="text-[31px] font-extrabold leading-tight text-[#162033]">
                        {profileName}
                      </Text>
                      <View className="mt-1 flex-row flex-wrap items-center">
                        <Text className="text-[16px] text-[#53657F]">{profileEmail}</Text>
                        <Text className="mx-3 text-[#7E8CA1]">•</Text>
                        <View className="rounded-full bg-[#E4FAF3] px-3 py-1">
                          <Text className="text-[14px] font-semibold text-[#0A9C73]">{profileTrack}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="rounded-[18px] bg-[#E7FBF4]/95 px-5 py-3">
                      <Text className="text-[12px] text-[#6D7D95]">Band hiện tại</Text>
                      <Text className="mt-1 text-[28px] font-semibold leading-none text-[#12B889]">6.75</Text>
                    </View>
                    <View className="rounded-[18px] border-2 border-dashed border-[#B0E8DE] bg-white/75 px-5 py-3">
                      <Text className="text-[12px] text-[#6D7D95]">Mục tiêu</Text>
                      <Text className="mt-1 text-[28px] font-semibold leading-none text-[#151A24]">7.5</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View className="border-t border-[#EAF0F5] bg-white px-4 py-5">
              <View className="flex-row flex-wrap justify-between gap-y-5">
                {stats.map((item) => (
                  <View key={item.label} className="w-1/2 items-center">
                    <View className="mb-2 h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFC]">
                      <Text style={{ color: item.color }} className="text-[15px]">{item.icon}</Text>
                    </View>
                    <Text className="text-[19px] font-semibold text-[#1C2432]">{item.value}</Text>
                    <Text className="mt-1 text-[14px] text-[#7A8BA3]">{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Dynamic Tabs switches */}
          <View className="mt-8 rounded-[22px] border border-[#E4EAF2] bg-white p-2 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
            <View className="flex-row flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className={`h-[46px] flex-1 items-center justify-center rounded-[18px] ${isActive ? 'bg-[#12BC8A]' : 'bg-transparent'}`}
                  >
                    <Text className={`text-[16px] font-medium ${isActive ? 'text-white' : 'text-[#7A8BA3]'}`}>
                      {tab.label}
                    </Text>
>>>>>>> origin/main
                  </TouchableOpacity>
                </View>

                <View style={S.infoWrap}>
                  <Text style={S.nameText}>{profileName}</Text>
                  <Text style={S.emailText}>{profileEmail}</Text>
                  <View style={S.roleBadge}>
                    <Text style={S.roleText}>{profileTrack}</Text>
                  </View>
                </View>
              </View>

              <View style={S.targetRow}>
                <View style={S.targetBox}>
                  <Text style={S.targetLabel}>Band hiện tại</Text>
                  <Text style={[S.targetValue, { color: COLORS.primary }]}>6.75</Text>
                </View>
                <View style={[S.targetBox, S.targetBoxDashed]}>
                  <Text style={S.targetLabel}>Mục tiêu</Text>
                  <Text style={S.targetValue}>7.5</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Tab Contents */}
          <View className="mt-8 rounded-[24px] border border-[#E4EAF2] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
            
            {/* 1. AVAILABILITIES TAB (Mentor Only) */}
            {activeTab === 'availabilities' && user?.role === 'MENTOR' && (
              <View>
                <Text className="text-[22px] font-bold text-[#111827] mb-6">Thêm lịch trống (Coaching)</Text>
                <View className="flex-row flex-wrap justify-between">
                  <InputField
                    label="Ngày trống (YYYY-MM-DD)"
                    placeholder="Ví dụ: 2026-06-20"
                    value={newSlotDate}
                    onChangeText={setNewSlotDate}
                  />
                  <View className="w-full flex-row justify-between mb-5 md:w-[48.5%]">
                    <View className="w-[47%]">
                      <Text className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[#7A8BA3]">Giờ bắt đầu</Text>
                      <TextInput
                        placeholder="HH:MM (Ví dụ: 09:00)"
                        placeholderTextColor="#94A3B8"
                        value={newSlotStart}
                        onChangeText={setNewSlotStart}
                        className="h-[56px] rounded-[18px] border border-[#D8E0EA] bg-[#EDF2F7] px-4 text-[16px] text-[#111827]"
                      />
                    </View>
                    <View className="w-[47%]">
                      <Text className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[#7A8BA3]">Giờ kết thúc</Text>
                      <TextInput
                        placeholder="HH:MM (Ví dụ: 10:00)"
                        placeholderTextColor="#94A3B8"
                        value={newSlotEnd}
                        onChangeText={setNewSlotEnd}
                        className="h-[56px] rounded-[18px] border border-[#D8E0EA] bg-[#EDF2F7] px-4 text-[16px] text-[#111827]"
                      />
                    </View>
                  </View>
                  <InputField
                    label="Link phòng họp (Google Meet / Zoom)"
                    placeholder="http://meet.google.com/abc-xyz"
                    value={newSlotLink}
                    onChangeText={setNewSlotLink}
                    autoCapitalize="none"
                  />
                </View>

<<<<<<< HEAD
          {/* Stats Grid */}
          <View style={S.statsGrid}>
            {stats.map((item) => (
              <View key={item.label} style={S.statItem}>
                <View style={S.statIcon}>
                  <AppIcon name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={S.statValue}>{item.value}</Text>
                <Text style={S.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Tabs ──────────────────────────────────────── */}
        <View style={S.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabsScroll}>
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[S.tabItem, isActive && S.tabItemActive]}
                >
                  <Text style={[S.tabText, isActive && S.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Settings Content ──────────────────────────── */}
        {activeTab === 'settings' && (
          <View style={S.settingsCard}>
            <Text style={S.sectionTitle}>Thông tin cá nhân</Text>

            <View style={S.formGrid}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <AppTextInput
                    label="Họ và tên"
                    value={value}
                    onChangeText={onChange}
                    leftIconName="user"
                    containerStyle={S.inputMargin}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <AppTextInput
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    leftIconName="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={S.inputMargin}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <AppTextInput
                    label="Số điện thoại"
                    value={value}
                    onChangeText={onChange}
                    leftIconName="phone"
                    keyboardType="phone-pad"
                    containerStyle={S.inputMargin}
                    error={errors.phone?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <AppTextInput
                    label="Ngày sinh"
                    value={value}
                    onChangeText={onChange}
                    leftIconName="calendar"
                    containerStyle={S.inputMargin}
                    error={errors.birthDate?.message}
                  />
                )}
              />
            </View>

            <View style={S.actionRow}>
              <AppButton
                title="Lưu thay đổi"
                onPress={handleSubmit(onSubmit)}
                style={{ flex: 1 }}
              />
            </View>
            <View style={S.actionRow}>
              <AppButton
                title="Đăng xuất"
                onPress={handleLogout}
                variant="danger"
                style={{ flex: 1 }}
                leftIconName="log-out"
              />
            </View>
          </View>
        )}

      </ScrollView>

      {/* ── Logout Modal ───────────────────────────────── */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={S.modalContainer}>
            <View style={S.modalIconWrap}>
              <AppIcon name="log-out" size={24} color={COLORS.danger} />
            </View>
            <Text style={S.modalTitle}>Đăng xuất</Text>
            <Text style={S.modalDesc}>Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?</Text>
            <View style={S.modalActions}>
              <AppButton 
                title="Hủy" 
                variant="outline" 
                style={{ flex: 1 }} 
                onPress={() => setShowLogoutModal(false)} 
              />
              <View style={{ width: SPACING.md }} />
              <AppButton 
                title="Đăng xuất" 
                variant="danger" 
                style={{ flex: 1 }} 
                onPress={confirmLogout} 
              />
=======
                <TouchableOpacity
                  onPress={handleAddSlot}
                  className="bg-[#12BC8A] h-[52px] rounded-[18px] items-center justify-center self-start px-8 mb-8"
                >
                  <Text className="text-white text-[16px] font-semibold">Tạo Lịch Trống</Text>
                </TouchableOpacity>

                <Text className="text-[20px] font-bold text-[#111827] border-t border-[#EAF0F5] pt-6 mb-4">Danh sách lịch trống của bạn</Text>
                {isLoadingAvailabilities ? (
                  <ActivityIndicator size="small" color="#12BC8A" />
                ) : availabilities.length === 0 ? (
                  <Text className="text-gray-400">Bạn chưa thêm lịch trống nào.</Text>
                ) : (
                  availabilities.map((slot) => (
                    <View key={slot.id} className="flex-row items-center justify-between border-b border-[#F3F4F6] py-4">
                      <View className="flex-1 pr-4">
                        <Text className="text-[16px] font-bold text-[#111827]">{formatDateTime(slot.startTime)} - {new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                        <Text className="text-xs text-[#7A8BA3] mt-1" numberOfLines={1}>Meeting Link: {slot.meetingLink || 'Chưa đính kèm'}</Text>
                      </View>
                      <View className="flex-row items-center gap-3">
                        <View className={`px-3 py-1 rounded-full ${slot.isBooked ? 'bg-orange-100' : 'bg-green-100'}`}>
                          <Text className={`text-xs font-bold ${slot.isBooked ? 'text-orange-600' : 'text-green-600'}`}>
                            {slot.isBooked ? 'Đã được đặt' : 'Đang trống'}
                          </Text>
                        </View>
                        {!slot.isBooked && (
                          <TouchableOpacity
                            onPress={() => handleDeleteSlot(slot.id)}
                            className="bg-red-50 border border-red-200 px-3 py-2 rounded-xl"
                          >
                            <Text className="text-red-600 text-xs font-bold">Xóa</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* 2. BOOKINGS TAB (Students and Mentors) */}
            {activeTab === 'bookings' && (
              <View>
                <Text className="text-[22px] font-bold text-[#111827] mb-6">Lịch hẹn Coaching của bạn</Text>
                {isLoadingBookings ? (
                  <ActivityIndicator size="small" color="#12BC8A" />
                ) : bookings.length === 0 ? (
                  <Text className="text-gray-400">Bạn không có lịch hẹn nào.</Text>
                ) : (
                  bookings.map((booking) => {
                    const isMentor = user?.role === 'MENTOR';
                    const targetUser = isMentor ? booking.student : booking.mentor;
                    const isCancelled = booking.status === 'CANCELLED';
                    return (
                      <View key={booking.id} className="border-b border-[#F3F4F6] py-5">
                        <View className="flex-row flex-wrap justify-between items-start gap-4">
                          <View className="flex-1 min-w-[240px]">
                            <Text className="text-[17px] font-black text-[#111827]">
                              {isMentor ? 'Học viên: ' : 'Mentor: '} {targetUser?.fullName || 'N/A'}
                            </Text>
                            <Text className="text-xs text-[#7A8BA3] mt-1">
                              {targetUser?.email} {targetUser?.phone ? `• ${targetUser.phone}` : ''}
                            </Text>
                            <Text className="text-[14px] font-bold text-[#12BC8A] mt-2">
                              {formatDateTime(booking.startTime)} - {new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {booking.notes && (
                              <Text className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-3">
                                <Text className="font-bold">Ghi chú học viên: </Text>{booking.notes}
                              </Text>
                            )}
                            {booking.mentorNotes && (
                              <Text className="text-sm text-[#005C42] bg-[#E6F9F5] p-2.5 rounded-xl border border-[#A7F3D0] mt-3">
                                <Text className="font-bold">Nhận xét Mentor: </Text>{booking.mentorNotes}
                              </Text>
                            )}
                            {booking.availability?.meetingLink && !isCancelled && (
                              <Text className="text-xs text-[#6366F1] font-bold mt-2">
                                Link phòng họp: {booking.availability.meetingLink}
                              </Text>
                            )}
                          </View>

                          <View className="flex-row items-center gap-2">
                            <View className={`px-3 py-1.5 rounded-full ${isCancelled ? 'bg-red-100' : 'bg-green-100'}`}>
                              <Text className={`text-xs font-bold ${isCancelled ? 'text-red-600' : 'text-green-600'}`}>
                                {booking.status}
                              </Text>
                            </View>
                            {!isCancelled && (
                              <TouchableOpacity
                                onPress={() => handleCancelBooking(booking.id)}
                                className="border border-red-200 bg-red-50 px-3 py-2 rounded-xl"
                              >
                                <Text className="text-red-600 text-xs font-bold">Hủy lịch</Text>
                              </TouchableOpacity>
                            )}
                            {isMentor && !isCancelled && (
                              <TouchableOpacity
                                onPress={() => openNotesModal(booking)}
                                className="bg-[#12BC8A] px-3 py-2 rounded-xl"
                              >
                                <Text className="text-white text-xs font-bold">Nhận xét</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* 3. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <View>
                <Text className="text-[22px] font-bold text-[#111827] mb-6">Thông tin tài khoản</Text>
                
                <View className="flex-row flex-wrap justify-between">
                  <InputField
                    label="Họ và tên"
                    value={form.fullName}
                    onChangeText={(value) => setForm((current) => ({ ...current, fullName: value }))}
                  />

                  <InputField
                    label="Email"
                    value={form.email}
                    onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <InputField
                    label="Số điện thoại"
                    value={form.phone}
                    onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />

                  <InputField
                    label="Ngày sinh"
                    value={form.birthDate}
                    onChangeText={(value) => setForm((current) => ({ ...current, birthDate: value }))}
                    keyboardType="numbers-and-punctuation"
                    autoCapitalize="none"
                  />

                  <InputField
                    label="Quốc gia"
                    value={form.country}
                    onChangeText={(value) => setForm((current) => ({ ...current, country: value }))}
                  />

                  <InputField
                    label="Thành phố"
                    value={form.city}
                    onChangeText={(value) => setForm((current) => ({ ...current, city: value }))}
                  />

                  {user?.role === 'MENTOR' && (
                    <>
                      <InputField
                        label="Lĩnh vực chuyên môn / Điểm IELTS"
                        placeholder="Ví dụ: IELTS Speaking 8.5, 4 năm kinh nghiệm"
                        value={form.expertise}
                        onChangeText={(value) => setForm((current) => ({ ...current, expertise: value }))}
                      />
                      <InputField
                        label="Giới thiệu bản thân (Bio)"
                        placeholder="Hãy viết vài dòng giới thiệu bản thân..."
                        value={form.bio}
                        onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))}
                      />
                    </>
                  )}
                </View>

                <View className="mt-4 flex-row flex-wrap items-center gap-3">
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="h-[48px] items-center justify-center rounded-[18px] bg-[#0DBB86] px-7 shadow-sm"
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text className="text-[16px] font-semibold text-white">Lưu thay đổi</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={logout}
                    className="h-[48px] items-center justify-center rounded-[18px] border border-[#F3C7C7] bg-[#FFF5F5] px-6"
                  >
                    <Text className="text-[16px] font-semibold text-[#D14343]">Đăng xuất</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>
        </View>
      </ScrollView>

      {/* MENTOR NOTES MODAL */}
      <Modal
        visible={showNotesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-[24px] w-full max-w-[500px] p-6 shadow-xl">
            <Text className="text-[20px] font-black text-[#111827] mb-4">Nhận xét & Đánh giá buổi học</Text>
            <Text className="text-sm text-gray-500 mb-2">Đánh giá tiến độ, ưu nhược điểm và lỗi sai của học viên:</Text>
            
            <TextInput
              multiline
              numberOfLines={6}
              value={mentorNotesText}
              onChangeText={setMentorNotesText}
              placeholder="Nhập nhận xét chi tiết cho học viên ở đây..."
              placeholderTextColor="#94A3B8"
              className="border border-[#D8E0EA] bg-[#EDF2F7] rounded-[18px] p-4 text-[16px] text-[#111827] mb-6 h-[150px] textAlignVertical-top"
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowNotesModal(false)}
                className="h-[46px] rounded-[16px] items-center justify-center border border-[#D8E0EA] px-5"
              >
                <Text className="text-gray-600 font-semibold text-sm">Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveNotes}
                disabled={isSavingNotes}
                className="h-[46px] rounded-[16px] bg-[#12BC8A] items-center justify-center px-6"
              >
                {isSavingNotes ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text className="text-white font-semibold text-sm">Lưu nhận xét</Text>
                )}
              </TouchableOpacity>
>>>>>>> origin/main
            </View>
          </View>
        </View>
      </Modal>
<<<<<<< HEAD

=======
>>>>>>> origin/main
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: SPACING['3xl'],
  },

  // App Bar
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },

  // Profile Card
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.sm,
    marginBottom: SPACING.lg,
  },
  headerBg: {
    minHeight: 200,
    position: 'relative',
  },
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  headerContent: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'flex-end',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  avatarText: { fontSize: TYPOGRAPHY['3xl'], fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textInverse },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoWrap: { marginLeft: SPACING.md, flex: 1, paddingBottom: SPACING.xs },
  nameText: { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary, marginBottom: 2 },
  emailText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary },

  targetRow: { flexDirection: 'row', gap: SPACING.sm },
  targetBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  targetBoxDashed: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  targetLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  targetValue: { fontSize: TYPOGRAPHY['2xl'], fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: { width: '50%', alignItems: 'center', paddingVertical: SPACING.md },
  statIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray50,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm
  },
  statValue: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  statLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, marginTop: 2 },

  // Tabs
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  tabsScroll: { paddingHorizontal: 4, gap: SPACING.xs },
  tabItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
  },
  tabItemActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textInverse, fontFamily: TYPOGRAPHY.fontBold },

  // Settings
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  formGrid: { marginBottom: SPACING.lg },
  inputMargin: { marginBottom: SPACING.md },
  actionRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  modalContainer: { backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'], padding: SPACING.xl, width: '100%', maxWidth: 400, alignItems: 'center', ...SHADOWS.lg },
  modalIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.dangerLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  modalTitle: { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  modalDesc: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  modalActions: { flexDirection: 'row', width: '100%' },
});

export default ProfileScreen;
