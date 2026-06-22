// ============================================================
// ProfileScreen - Mobile First Dashboard
// NO web layouts, NO nativewind
// ============================================================

import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
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

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();

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
  });

  const initials = useMemo(() => {
    const parts = profileName.trim().split(/\s+/).filter(Boolean);
    const selected = parts.length >= 2 ? parts.slice(-2) : parts.slice(0, 2);
    return selected.map((part) => part[0]?.toUpperCase()).join('') || 'MA';
  }, [profileName]);

  const stats = [
    { icon: 'flame', value: '42 ngày', label: 'Chuỗi học', color: '#F97316' },
    { icon: 'book', value: '34 bài', label: 'Đã thi thử', color: '#6366F1' },
    { icon: 'chatbubbles', value: '28 lần', label: 'AI Feedback', color: '#10B981' },
    { icon: 'medal', value: '3 huy hiệu', label: 'Thành tích', color: '#F59E0B' },
  ];

  const tabs = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'achievements', label: 'Thành tích' },
    { key: 'settings', label: 'Cài đặt' },
  ];

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
            </Svg>

            <View style={S.headerContent}>
              <View style={S.avatarRow}>
                <View style={S.avatarWrap}>
                  <View style={S.avatar}>
                    <Text style={S.avatarText}>{initials}</Text>
                  </View>
                  <TouchableOpacity style={S.cameraBtn} activeOpacity={0.8}>
                    <AppIcon name="camera" size={14} color={COLORS.textInverse} />
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
            </View>
          </View>
        </View>
      </Modal>

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
