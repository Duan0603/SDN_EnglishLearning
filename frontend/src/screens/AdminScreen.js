// ============================================================
// AdminScreen - Mobile First Dashboard
// NO web layouts, NO nativewind
// ============================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';

import AppIcon from '../shared/icons/AppIcon';
import { AppButton, AppTextInput } from '../shared/components';
import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';
import Toast from 'react-native-toast-message';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const AdminScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'exams'
  const [searchQuery, setSearchQuery] = useState('');
  
  // ── Users state ─────────────────────────────────────────
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Exams state
  const [examsList, setExamsList] = useState([
    { id: '1', title: 'IELTS Cambridge 18 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
    { id: '2', title: 'IELTS Cambridge 18 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
    { id: '3', title: 'IELTS Cambridge 17 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
  ]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminUserService.getAll();
      const raw = res.data?.metadata?.users || [];
      setUsersList(raw.map(u => ({ ...u, id: u._id || u.id })));
    } catch (err) {
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersList, searchQuery]);

  const filteredExams = useMemo(() => {
    return examsList.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [examsList, searchQuery]);

  const adminName = user?.fullName || 'Admin User';

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={S.appBarTitle}>Admin Panel</Text>
        <TouchableOpacity 
          style={S.backBtn} 
          onPress={() => {
            if (Platform.OS === 'web') {
              if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
                logout();
                navigation.replace('Login');
              }
            } else {
              Alert.alert(
                "Đăng xuất",
                "Bạn có chắc chắn muốn đăng xuất không?",
                [
                  { text: "Hủy", style: "cancel" },
                  { 
                    text: "Đăng xuất", 
                    style: "destructive",
                    onPress: () => {
                      logout();
                      navigation.replace('Login');
                    }
                  }
                ]
              );
            }
          }}
        >
          <AppIcon name="logout" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      {/* ── Tabs ──────────────────────────────────────── */}
      <View style={S.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabsScroll}>
          {[
            { key: 'dashboard', label: 'Tổng quan', icon: 'pie-chart' },
            { key: 'users', label: 'Người dùng', icon: 'user' },
            { key: 'exams', label: 'Đề thi', icon: 'book' },
          ].map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[S.tabItem, isActive && S.tabItemActive]}
              >
                <AppIcon name={tab.icon} size={16} color={isActive ? COLORS.textInverse : COLORS.textSecondary} />
                <Text style={[S.tabText, isActive && S.tabTextActive, { marginLeft: 6 }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ==================== DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <View>
            <Text style={S.sectionTitle}>Xin chào, {adminName}</Text>
            <View style={S.kpiGrid}>
              {[
                { label: 'Tổng người dùng', value: usersList.length, color: COLORS.primary },
                { label: 'Đang hoạt động', value: usersList.filter(u => u.status === 'active').length, color: COLORS.success },
                { label: 'Bị khóa', value: usersList.filter(u => u.status === 'inactive').length, color: COLORS.danger },
                { label: 'Đề thi', value: examsList.length, color: COLORS.warning },
              ].map((kpi, idx) => (
                <View key={idx} style={S.kpiCard}>
                  <Text style={S.kpiLabel}>{kpi.label}</Text>
                  <Text style={[S.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                </View>
              ))}
            </View>

            <View style={S.recentCard}>
              <Text style={S.recentTitle}>Hoạt động gần đây</Text>
              {[
                { title: 'Tài khoản mới đăng ký', time: '2 phút trước' },
                { title: 'Đơn hàng thành công', time: '1 giờ trước' },
              ].map((act, idx) => (
                <View key={idx} style={S.recentItem}>
                  <View style={S.recentDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={S.recentText}>{act.title}</Text>
                    <Text style={S.recentTime}>{act.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ==================== USERS ==================== */}
        {activeTab === 'users' && (
          <View>
            <AppTextInput
              placeholder="Tìm kiếm người dùng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIconName="search"
              containerStyle={{ marginBottom: SPACING.md }}
            />
            
            {usersLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
              filteredUsers.map((u) => (
                <View key={u.id} style={S.listCard}>
                  <View style={S.listCardHeader}>
                    <Text style={S.listCardTitle}>{u.fullName}</Text>
                    <View style={[S.badge, { backgroundColor: u.status === 'active' ? COLORS.successLight : COLORS.dangerLight }]}>
                      <Text style={[S.badgeText, { color: u.status === 'active' ? COLORS.success : COLORS.danger }]}>
                        {u.status === 'active' ? 'Active' : 'Locked'}
                      </Text>
                    </View>
                  </View>
                  <Text style={S.listCardSub}>{u.email}</Text>
                  <Text style={S.listCardSub}>Role: {u.role}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* ==================== EXAMS ==================== */}
        {activeTab === 'exams' && (
          <View>
            <AppTextInput
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIconName="search"
              containerStyle={{ marginBottom: SPACING.md }}
            />

            <AppButton
              title="Tạo đề thi mới"
              onPress={() => Toast.show({ type: 'info', text1: 'Thông báo', text2: 'Tính năng đang phát triển.' })}
              style={{ marginBottom: SPACING.lg }}
              leftIconName="book"
            />

            {filteredExams.map((e) => (
              <View key={e.id} style={S.listCard}>
                <View style={S.listCardHeader}>
                  <Text style={S.listCardTitle}>{e.title}</Text>
                  <View style={S.badge}>
                    <Text style={S.badgeText}>{e.type}</Text>
                  </View>
                </View>
                <Text style={S.listCardSub}>{e.duration} Phút • {e.questionsCount} Câu hỏi</Text>
              </View>
            ))}
          </View>
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
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
  
  tabsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsScroll: { gap: SPACING.sm, paddingHorizontal: SPACING.xs },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  tabItemActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textInverse, fontFamily: TYPOGRAPHY.fontBold },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },

  sectionTitle: { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.md },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  kpiLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary, marginBottom: 4 },
  kpiValue: { fontSize: TYPOGRAPHY['2xl'], fontFamily: TYPOGRAPHY.fontBlack },

  recentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  recentTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  recentItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  recentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: SPACING.sm },
  recentText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textPrimary },
  recentTime: { fontSize: TYPOGRAPHY.xs, color: COLORS.textSecondary },

  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  listCardTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, flex: 1 },
  listCardSub: { fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary, marginTop: 2 },
  badge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm, alignSelf: 'flex-start' },
  badgeText: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary },
});

export default AdminScreen;
