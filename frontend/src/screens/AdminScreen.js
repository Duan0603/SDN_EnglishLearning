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
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  
  // Mentor requests state
  const [requestsList, setRequestsList] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMentorRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await adminUserService.getMentorRequests('PENDING');
      const raw = res.data?.data || [];
      setRequestsList(raw);
    } catch (err) {
      console.log('Error fetching mentor requests:', err);
      setRequestsList([]);
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'mentor_requests') {
      fetchMentorRequests();
    }
  }, [activeTab, fetchMentorRequests]);

  const handleApprove = async (id) => {
    Alert.alert(
      'Xác nhận duyệt',
      'Bạn có chắc chắn muốn phê duyệt tài khoản này làm Mentor?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await adminUserService.approveMentorRequest(id);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Phê duyệt tài khoản làm Mentor thành công!' });
                fetchMentorRequests();
              }
            } catch (err) {
              console.log('Error approving request:', err);
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: err.response?.data?.error?.message || err.message || 'Phê duyệt thất bại.'
              });
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenReject = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền lý do từ chối!');
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminUserService.rejectMentorRequest(selectedRequest.id || selectedRequest._id, rejectReason);
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã từ chối yêu cầu.' });
        setRejectModalVisible(false);
        fetchMentorRequests();
      }
    } catch (err) {
      console.log('Error rejecting request:', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.response?.data?.error?.message || err.message || 'Từ chối thất bại.'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
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
              if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
                logout();
                navigation.replace('Login');
              }
            } else {
              Alert.alert(
                'Đăng xuất',
                'Bạn có chắc chắn muốn đăng xuất không?',
                [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => { logout(); navigation.replace('Login'); }
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
            { key: 'mentor_requests', label: 'Yêu cầu Mentor', icon: 'ribbon' },
            { key: 'exams', label: 'Đề thi', icon: 'book' },
          ].map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[S.tabItem, isActive && S.tabItemActive]}
              >
                {tab.icon === 'ribbon' ? (
                  <Ionicons name="ribbon-outline" size={16} color={isActive ? COLORS.textInverse : COLORS.textSecondary} />
                ) : (
                  <AppIcon name={tab.icon} size={16} color={isActive ? COLORS.textInverse : COLORS.textSecondary} />
                )}
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

        {/* ==================== MENTOR REQUESTS ==================== */}
        {activeTab === 'mentor_requests' && (
          <View>
            <Text style={S.sectionTitle}>Yêu cầu nâng cấp Mentor đang chờ duyệt</Text>
            
            {requestsLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : requestsList.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 30, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.fontMedium }}>
                Không có yêu cầu nào đang chờ duyệt.
              </Text>
            ) : (
              requestsList.map((req) => (
                <View key={req.id || req._id} style={S.listCard}>
                  <View style={S.listCardHeader}>
                    <Text style={S.listCardTitle}>{req.user?.fullName || req.user?.username || 'Người dùng'}</Text>
                    <View style={[S.badge, { backgroundColor: COLORS.warningLight }]}>
                      <Text style={[S.badgeText, { color: COLORS.warning }]}>PENDING</Text>
                    </View>
                  </View>
                  <Text style={S.listCardSub}>Email: {req.user?.email}</Text>
                  <Text style={S.listCardSub}>SĐT: {req.user?.phone || 'Chưa cung cấp'}</Text>
                  
                  <View style={{ marginTop: 10, padding: 10, backgroundColor: COLORS.background, borderRadius: RADIUS.md }}>
                    <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary }}>Chuyên môn:</Text>
                    <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary, marginTop: 2 }}>{req.expertise}</Text>
                    
                    <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginTop: 6 }}>Giới thiệu:</Text>
                    <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary, marginTop: 2 }}>{req.bio}</Text>

                    <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginTop: 6 }}>Chứng chỉ đính kèm:</Text>
                    {req.certificates?.map((url, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
                        onPress={() => Linking.openURL(url)}
                      >
                        <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                        <Text style={{ fontSize: 12, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary, textDecorationLine: 'underline' }}>
                          Xem chứng chỉ {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity 
                      style={[S.actionBtn, { backgroundColor: COLORS.success }]} 
                      onPress={() => handleApprove(req.id || req._id)}
                    >
                      <Text style={S.actionBtnText}>PHÊ DUYỆT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[S.actionBtn, { backgroundColor: COLORS.danger }]} 
                      onPress={() => handleOpenReject(req)}
                    >
                      <Text style={S.actionBtnText}>TỪ CHỐI</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        
      </ScrollView>

      {/* Reject Modal */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={S.modalOverlay}>
          <View style={[S.modalContainer, { width: '90%', maxWidth: 400, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 2, borderColor: COLORS.borderLight }]}>
            <Text style={[S.modalTitle, { fontSize: 18, fontFamily: TYPOGRAPHY.fontBold, marginBottom: 12 }]}>Từ chối nâng cấp Mentor</Text>
            <Text style={{ fontSize: 13, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary, marginBottom: 10 }}>
              Nhập lý do từ chối yêu cầu của {selectedRequest?.user?.fullName || selectedRequest?.user?.username}:
            </Text>
            <TextInput
              style={{
                width: '100%',
                height: 80,
                borderWidth: 1.5,
                borderColor: COLORS.borderLight,
                borderRadius: RADIUS.md,
                padding: 10,
                backgroundColor: '#fff',
                textAlignVertical: 'top',
                fontFamily: TYPOGRAPHY.fontMedium,
                fontSize: 13,
                marginBottom: 16
              }}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Nhập lý do chi tiết..."
              placeholderTextColor="#999"
              multiline
            />
            <View style={{ flexDirection: 'row', width: '100%', gap: 10 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.borderLight, alignItems: 'center' }} 
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fontBold, fontSize: 13, color: COLORS.textPrimary }}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, backgroundColor: COLORS.danger, alignItems: 'center' }} 
                onPress={handleRejectSubmit}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.fontBold, fontSize: 13, color: '#fff' }}>GỬI TỪ CHỐI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fontBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    color: COLORS.textPrimary,
  },
});

export default AdminScreen;
