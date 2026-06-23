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
<<<<<<< HEAD
  SafeAreaView,
=======
  useWindowDimensions,
>>>>>>> origin/main
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
<<<<<<< HEAD

import AppIcon from '../shared/icons/AppIcon';
import { AppButton, AppTextInput } from '../shared/components';
import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
=======
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';
import examService from '../api/exam.service';

const customAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      const confirmText = `${title}\n\n${message}`;
      const result = window.confirm(confirmText);
      if (result) {
        const actionBtn = buttons.find(b => b.style !== 'cancel' && b.text !== 'Hủy');
        if (actionBtn && actionBtn.onPress) actionBtn.onPress();
      } else {
        const cancelBtn = buttons.find(b => b.style === 'cancel' || b.text === 'Hủy');
        if (cancelBtn && cancelBtn.onPress) cancelBtn.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
>>>>>>> origin/main

const AdminScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'exams'
  const [searchQuery, setSearchQuery] = useState('');
  
  // ── Users state ─────────────────────────────────────────
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

<<<<<<< HEAD
  // Exams state
  const [examsList, setExamsList] = useState([
    { id: '1', title: 'IELTS Cambridge 18 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
    { id: '2', title: 'IELTS Cambridge 18 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
    { id: '3', title: 'IELTS Cambridge 17 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
  ]);
=======
  // Create User Modal
  const EMPTY_USER_FORM = { fullName: '', username: '', email: '', password: '', role: 'STUDENT', birthday: '', phone: '', identityNumber: '' };
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(EMPTY_USER_FORM);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit User Modal
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Delete User Modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Exams state ──────────────────────────────────────────
  const [examsList, setExamsList] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [examsError, setExamsError] = useState(null);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamType, setNewExamType] = useState('Reading');
  const [newExamDuration, setNewExamDuration] = useState('60');
  const [newExamQuestions, setNewExamQuestions] = useState('40');
>>>>>>> origin/main

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

  const fetchExams = useCallback(async () => {
    setExamsLoading(true);
    setExamsError(null);
    try {
      const res = await examService.getAll();
      const raw = res.data?.data?.exams || res.data?.exams || [];
      setExamsList(raw.map(e => ({
        ...e,
        id: e._id || e.id,
        type: e.type === 'READING' ? 'Reading' : e.type === 'LISTENING' ? 'Listening' : e.type
      })));
    } catch (err) {
      setExamsList([]);
      setExamsError('Không thể tải danh sách đề thi từ database.');
    } finally {
      setExamsLoading(false);
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    fetchUsers();
  }, [fetchUsers]);
=======
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'exams') {
      fetchExams();
    }
  }, [activeTab, fetchUsers, fetchExams]);
>>>>>>> origin/main

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => 
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersList, searchQuery]);

  const filteredExams = useMemo(() => {
    return examsList.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [examsList, searchQuery]);

<<<<<<< HEAD
  const adminName = user?.fullName || 'Admin User';
=======
  // ── CRUD Handlers ────────────────────────────────────────
  const handleCreateUser = async () => {
    const { fullName, username, email, password, role, birthday, phone, identityNumber } = createUserForm;
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      customAlert('Lỗi nhập liệu', 'Vui lòng điền đầy đủ Họ tên, Username, Email và Mật khẩu.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await adminUserService.create({ fullName, username, email, password, role, birthday, phone, identityNumber });
      const newUser = res.data?.metadata;
      setUsersList(prev => [{ ...newUser, id: newUser._id || newUser.id }, ...prev]);
      setShowCreateUserModal(false);
      setCreateUserForm(EMPTY_USER_FORM);
      customAlert('✅ Thành công', 'Đã tạo tài khoản mới thành công.');
    } catch (err) {
      // Handled globally
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditTarget(item);
    setEditUserForm({
      fullName: item.fullName || '',
      username: item.username || '',
      email: item.email || '',
      role: item.role || 'STUDENT',
      birthday: item.birthday || '',
      phone: item.phone || '',
      identityNumber: item.identityNumber || '',
      password: '',
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const payload = { ...editUserForm };
      if (!payload.password) delete payload.password;
      const res = await adminUserService.update(editTarget.id, payload);
      const updated = res.data?.metadata;
      setUsersList(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...updated, id: u.id } : u));
      setShowEditUserModal(false);
      customAlert('✅ Thành công', 'Đã cập nhật thông tin tài khoản.');
    } catch (err) {
      // Handled globally
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = (item) => {
    setUserToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await adminUserService.remove(userToDelete.id);
      setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteConfirmModal(false);
      setUserToDelete(null);
      customAlert('✅ Đã xóa', 'Đã loại bỏ tài khoản thành công.');
    } catch (err) {
      // Handled globally
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleUserStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await adminUserService.toggleStatus(item.id, nextStatus);
      setUsersList(prev => prev.map(u => u.id === item.id ? { ...u, status: nextStatus } : u));
    } catch (err) { }
  };

  const handleApproveMentor = async (item) => {
    try {
      await adminUserService.approveMentor(item.id);
      setUsersList(prev => prev.map(u => u.id === item.id ? { ...u, status: 'active' } : u));
      customAlert('✅ Đã phê duyệt', `${item.fullName} hiện đã trở thành Mentor chính thức.`);
    } catch (err) { }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await examService.remove(examId);
      setExamsList(prev => prev.filter(e => e.id !== examId));
      customAlert('✅ Thành công', 'Đã xóa đề thi thành công.');
    } catch (err) {
      // Handled globally
    }
  };

  const handleCreateExamSubmit = async () => {
    if (!newExamTitle.trim()) {
      customAlert('Lỗi nhập liệu', 'Vui lòng điền tiêu đề đề thi.');
      return;
    }
    try {
      const payload = {
        title: newExamTitle.trim(),
        type: newExamType.toUpperCase(),
        duration: parseInt(newExamDuration, 10) || 60,
        sections: []
      };
      const res = await examService.create(payload);
      if (res.data?.success) {
        fetchExams();
        setShowCreateExamModal(false);
        setNewExamTitle('');
        customAlert('✅ Tạo thành công', 'Đề thi mới đã được thêm vào hệ thống.');
      }
    } catch (err) {
      // Handled globally
    }
  };

  const handleUnsupportedTab = (tabName) => {
    customAlert('Chức năng chưa phát triển', `Mục "${tabName}" là giao diện mẫu theo khuôn thiết kế của bạn.`);
  };

  const adminName = user?.fullName || 'Minh Phúc';
  const adminRole = user?.role === 'ADMIN' ? 'Super Admin' : 'Admin';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';
>>>>>>> origin/main

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={S.appBarTitle}>Admin Panel</Text>
        <View style={S.backBtn} />
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
              onPress={() => Alert.alert('Tính năng đang phát triển')}
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
<<<<<<< HEAD
        )}
        
      </ScrollView>
=======

          {/* Scrollable Workspace Container */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
            <View style={styles.contentWorkspace}>

              {/* ==================== TỔNG QUAN (DASHBOARD) VIEW ==================== */}
              {activeTab === 'dashboard' && (
                <View>
                  {/* Four KPI cards row */}
                  <View style={[styles.kpiRow, { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
                    {[
                      { label: 'Tổng người dùng', value: String(usersList.length), change: '+12.5% so với tháng trước', color: '#3B82F6', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z' },
                      { label: 'Đang hoạt động', value: String(usersList.filter(u => u.status === 'active').length), change: '+8.2% so với tháng trước', color: '#10B981', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
                      { label: 'Tài khoản bị khóa', value: String(usersList.filter(u => u.status === 'inactive' || u.status === 'suspended').length), change: '-3.1% so với tháng trước', color: '#EF4444', icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z', isDown: true },
                      { label: 'Doanh thu tháng', value: '128.5M đ', change: '+21.3% so với tháng trước', color: '#8B5CF6', icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z' }
                    ].map((stat, i) => (
                      <View key={i} style={[styles.kpiCardTemplate, { width: isDesktop ? 'calc(25% - 12px)' : '47%' }]}>
                        <View style={styles.kpiCardTop}>
                          <View>
                            <Text style={styles.kpiCardLabel}>{stat.label}</Text>
                            <Text style={styles.kpiCardValue}>{stat.value}</Text>
                          </View>
                          <View style={[styles.kpiCardIconWrapper, { backgroundColor: stat.color + '18' }]}>
                            <Svg width="18" height="18" viewBox="0 0 24 24" fill={stat.color}>
                              <Path d={stat.icon} />
                            </Svg>
                          </View>
                        </View>
                        <View style={styles.kpiCardBottom}>
                          <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stat.isDown ? '#EF4444' : '#10B981'} strokeWidth="3" style={{ marginRight: 4 }}>
                            {stat.isDown ? (
                              <Path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                            ) : (
                              <Path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                          </Svg>
                          <Text style={[styles.kpiCardChangeText, { color: stat.isDown ? '#EF4444' : '#10B981' }]}>
                            {stat.change}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Dual Chart Row */}
                  <View style={[styles.chartGridContainer, { flexDirection: isDesktop ? 'row' : 'column', gap: 16 }]}>
                    
                    {/* User Growth Line Chart */}
                    <View style={styles.chartBlockCard}>
                      <View style={styles.chartBlockHeader}>
                        <View>
                          <Text style={styles.chartBlockTitle}>Tăng trưởng người dùng</Text>
                          <Text style={styles.chartBlockSubtitle}>6 tháng gần nhất</Text>
                        </View>
                        <View style={styles.chartBlockLegend}>
                          <View style={styles.legendIndicatorItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#111827' }]} />
                            <Text style={styles.legendLabelText}>Người dùng</Text>
                          </View>
                          <View style={[styles.legendIndicatorItem, { marginLeft: 16 }]}>
                            <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
                            <Text style={styles.legendLabelText}>Đơn hàng</Text>
                          </View>
                        </View>
                      </View>

                      {/* Smooth vector SVG lines chart */}
                      <View style={styles.svgChartWrapper}>
                        <Svg width="100%" height="160" viewBox="0 0 500 160" preserveAspectRatio="none">
                          <Defs>
                            <LinearGradient id="gradientBlack" x1="0" y1="0" x2="0" y2="1">
                              <Stop offset="0%" stopColor="#111827" stopOpacity="0.1" />
                              <Stop offset="100%" stopColor="#111827" stopOpacity="0.0" />
                            </LinearGradient>
                            <LinearGradient id="gradientPurple" x1="0" y1="0" x2="0" y2="1">
                              <Stop offset="0%" stopColor="#A855F7" stopOpacity="0.1" />
                              <Stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                            </LinearGradient>
                          </Defs>

                          {/* Grid background lines */}
                          <Path d="M 0 40 L 500 40 M 0 80 L 500 80 M 0 120 L 500 120" stroke="#F1F5F9" strokeWidth="1" />

                          {/* Purple Line Fill */}
                          <Path d="M 10 130 Q 100 120, 200 115 T 300 105 T 400 98 T 490 90 L 490 150 L 10 150 Z" fill="url(#gradientPurple)" />
                          {/* Black Line Fill */}
                          <Path d="M 10 115 Q 100 100, 200 95 T 300 80 T 400 65 T 490 55 L 490 150 L 10 150 Z" fill="url(#gradientBlack)" />

                          {/* Purple Line path */}
                          <Path d="M 10 130 Q 100 120, 200 115 T 300 105 T 400 98 T 490 90" fill="none" stroke="#A855F7" strokeWidth="2.5" />
                          {/* Black Line path */}
                          <Path d="M 10 115 Q 100 100, 200 95 T 300 80 T 400 65 T 490 55" fill="none" stroke="#111827" strokeWidth="2.5" />

                          {/* Graph Dots */}
                          <Circle cx="490" cy="55" r="4" fill="#111827" />
                          <Circle cx="490" cy="90" r="4" fill="#A855F7" />
                        </Svg>
                        {/* X-axis labels */}
                        <View style={styles.xAxisRow}>
                          {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((t, idx) => (
                            <Text key={idx} style={styles.axisLabelText}>{t}</Text>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Weekly Users Double Bar Chart */}
                    <View style={[styles.chartBlockCard, { flex: 1 }]}>
                      <View style={styles.chartBlockHeader}>
                        <View>
                          <Text style={styles.chartBlockTitle}>Người dùng tuần này</Text>
                          <Text style={styles.chartBlockSubtitle}>Mới vs Quay lại</Text>
                        </View>
                      </View>

                      {/* Double bar heights manually styled */}
                      <View style={styles.barGraphWrapper}>
                        <View style={styles.barChartPlot}>
                          {[
                            { day: 'T2', main: 30, sec: 68 },
                            { day: 'T3', main: 40, sec: 78 },
                            { day: 'T4', main: 20, sec: 58 },
                            { day: 'T5', main: 50, sec: 88 },
                            { day: 'T6', main: 30, sec: 70 },
                            { day: 'T7', main: 60, sec: 95 },
                            { day: 'CN', main: 15, sec: 40 },
                          ].map((b, idx) => (
                            <View key={idx} style={styles.barPairCol}>
                              <View style={styles.barPairGraphics}>
                                <View style={[styles.barPrimaryUnit, { height: b.main }]} />
                                <View style={[styles.barSecondaryUnit, { height: b.sec }]} />
                              </View>
                              <Text style={styles.barAxisText}>{b.day}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Recent Activity List Card */}
                  <View style={styles.recentActivityCard}>
                    <View style={styles.recentActivityHeader}>
                      <Text style={styles.recentActivityTitle}>Hoạt động gần đây</Text>
                      <TouchableOpacity onPress={() => handleUnsupportedTab('Hoạt động gần đây')}>
                        <Text style={styles.viewAllTextText}>Xem tất cả</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.recentActivityList}>
                      {[
                        { text: 'Tài khoản mới đăng ký', target: 'Nguyễn Hải Nam', time: '2 phút trước', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' },
                        { text: 'Tài khoản bị khóa', target: 'Lê Thị Cúc', time: '15 phút trước', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', path: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z' },
                        { text: 'Vai trò được cập nhật', target: 'Phạm Văn Dũng', time: '1 giờ trước', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z' },
                        { text: 'Đặt hàng thành công', target: 'Trần Minh Tuấn', time: '2 giờ trước', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', path: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25' }
                      ].map((act, idx) => (
                        <View key={idx} style={[styles.activityItemRow, idx === 3 && { borderBottomWidth: 0 }]}>
                          <View style={styles.activityItemLeft}>
                            <View style={[styles.activityCircle, { backgroundColor: act.bg }]}>
                              <Svg width="14" height="14" viewBox="0 0 24 24" fill={act.color}>
                                <Path d={act.path} />
                              </Svg>
                            </View>
                            <Text style={styles.activityMainText}>
                              {act.text} <Text style={{ fontWeight: '750', color: '#1E293B' }}>{act.target}</Text>
                            </Text>
                          </View>
                          <Text style={styles.activityTimeText}>{act.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {/* ==================== QUẢN LÝ NGƯỜI DÙNG VIEW ==================== */}
              {activeTab === 'users' && (
                <View style={styles.whitePanelCard}>
                  {/* Search and filters row */}
                  <View style={[styles.sectionHeaderRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 16 }]}>
                    <View style={styles.workspaceSearchBox}>
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                        <Circle cx="11" cy="11" r="8" />
                        <Path d="M21 21l-4.3-4.3" />
                      </Svg>
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Tìm kiếm người dùng bằng tên, email..."
                        placeholderTextColor="#94A3B8"
                        style={styles.workspaceSearchInput}
                      />
                    </View>

                    <View style={[styles.workspaceActionsGroup, { flexDirection: isDesktop ? 'row' : 'column', gap: 12 }]}>
                      {/* Filter pills */}
                      <View style={styles.pillsFilterBox}>
                        {['ALL', 'STUDENT', 'MENTOR', 'PENDING'].map((pill) => {
                          const isPillActive = roleFilter === pill;
                          return (
                            <TouchableOpacity
                              key={pill}
                              onPress={() => setRoleFilter(pill)}
                              style={[styles.pillBtn, isPillActive && styles.pillBtnActive]}
                            >
                              <Text style={[styles.pillBtnText, isPillActive && styles.pillBtnTextActive]}>
                                {pill}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Create User Trigger */}
                      <TouchableOpacity
                        onPress={() => setShowCreateUserModal(true)}
                        style={styles.workspacePrimaryBtn}
                      >
                        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" style={{ marginRight: 6 }}>
                          <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={styles.workspacePrimaryBtnText}>Thêm người dùng</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Users Grid Table */}
                  <View style={styles.dataTableBox}>
                    <View style={styles.dataTableHeaderRow}>
                      <Text style={[styles.headerCell, { width: '28%' }]}>Chi tiết thành viên</Text>
                      <Text style={[styles.headerCell, { width: '22%' }]}>Liên hệ</Text>
                      <Text style={[styles.headerCell, { width: '18%' }]}>Thông tin định danh</Text>
                      <Text style={[styles.headerCell, { width: '14%' }]}>Vai trò & Trạng thái</Text>
                      <Text style={[styles.headerCell, { width: '18%', textAlign: 'right' }]}>Hành động</Text>
                    </View>

                    {usersLoading ? (
                      <View style={styles.centerLoadingWrapper}>
                        <ActivityIndicator size="large" color="#111827" />
                      </View>
                    ) : filteredUsers.length === 0 ? (
                      <View style={styles.centerEmptyWrapper}>
                        <Text style={styles.emptyStateText}>Không tìm thấy dữ liệu người dùng nào.</Text>
                      </View>
                    ) : (
                      filteredUsers.map((item) => (
                        <View key={item.id} style={styles.dataTableRow}>
                          {/* Name & Username */}
                          <View style={{ width: '28%', paddingRight: 8 }}>
                            <Text style={styles.cellMainTextTemplate} numberOfLines={1}>{item.fullName}</Text>
                            <Text style={styles.cellSubTextTemplate} numberOfLines={1}>@{item.username}</Text>
                          </View>

                          {/* Contact */}
                          <View style={{ width: '22%', paddingRight: 8 }}>
                            <Text style={styles.cellMainTextTemplate} numberOfLines={1}>{item.email}</Text>
                            <Text style={styles.cellSubTextTemplate} numberOfLines={1}>{item.phone || 'N/A'}</Text>
                          </View>

                          {/* Identity Card & Birthday */}
                          <View style={{ width: '18%', paddingRight: 8 }}>
                            <Text style={styles.cellMainTextTemplate} numberOfLines={1}>{item.identityNumber || 'N/A'}</Text>
                            <Text style={styles.cellSubTextTemplate} numberOfLines={1}>{item.birthday || 'N/A'}</Text>
                          </View>

                          {/* Role tag & Status Dot */}
                          <View style={{ width: '14%', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[
                              styles.roleBadgeTemplate,
                              {
                                backgroundColor: item.role === 'MENTOR'
                                  ? 'rgba(139, 92, 246, 0.1)'
                                  : item.role === 'ADMIN'
                                    ? 'rgba(11, 59, 47, 0.1)'
                                    : 'rgba(0, 209, 160, 0.1)'
                              }
                            ]}>
                              <Text style={[
                                styles.roleBadgeTextTemplate,
                                {
                                  color: item.role === 'MENTOR'
                                    ? '#8B5CF6'
                                    : item.role === 'ADMIN'
                                      ? '#0B3B2F'
                                      : '#00CC99'
                                }
                              ]}>
                                {item.role}
                              </Text>
                            </View>
                            <View style={[styles.statusIndicatorDot, { backgroundColor: item.status === 'active' ? '#00CC99' : '#EF4444' }]} />
                          </View>

                          {/* Row operations */}
                          <View style={{ width: '18%', flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 6 }}>
                            {item.role === 'MENTOR' && item.status === 'pending' && (
                              <TouchableOpacity
                                onPress={() => handleApproveMentor(item)}
                                style={styles.rowApproveBtn}
                              >
                                <Text style={styles.rowApproveBtnText}>Duyệt</Text>
                              </TouchableOpacity>
                            )}
                            {item.role !== 'ADMIN' && (
                              <>
                                <TouchableOpacity
                                  onPress={() => handleToggleUserStatus(item)}
                                  style={[styles.rowSecondaryBtn, { borderColor: item.status === 'active' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)' }]}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '750', color: item.status === 'active' ? '#EF4444' : '#10B981' }}>
                                    {item.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                                  </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => openEditModal(item)}
                                  style={styles.rowSecondaryBtn}
                                >
                                  <Text style={styles.rowSecondaryBtnText}>Sửa</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => handleDeleteUser(item)}
                                  style={[styles.rowSecondaryBtn, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '750', color: '#EF4444' }}>Xóa</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

              {/* ==================== QUẢN LÝ ĐỀ THI VIEW ==================== */}
              {activeTab === 'exams' && (
                <View style={styles.whitePanelCard}>
                  {/* Header tools */}
                  <View style={[styles.sectionHeaderRow, { flexDirection: isDesktop ? 'row' : 'column', gap: 16, marginBottom: 20 }]}>
                    <View style={styles.workspaceSearchBox}>
                      <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                        <Circle cx="11" cy="11" r="8" />
                        <Path d="M21 21l-4.3-4.3" />
                      </Svg>
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Tìm kiếm đề thi IELTS..."
                        placeholderTextColor="#94A3B8"
                        style={styles.workspaceSearchInput}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowCreateExamModal(true)}
                      style={styles.workspacePrimaryBtn}
                    >
                      <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" style={{ marginRight: 6 }}>
                        <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={styles.workspacePrimaryBtnText}>Tạo đề thi mới</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Grid elements */}
                  <View style={[styles.examsGridBox, { flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%' }]}>
                    {examsLoading ? (
                      <View style={styles.centerLoadingWrapper}>
                        <ActivityIndicator size="large" color="#111827" />
                      </View>
                    ) : examsError ? (
                      <View style={styles.centerEmptyWrapper}>
                        <Text style={[styles.emptyStateText, { color: '#EF4444' }]}>{examsError}</Text>
                      </View>
                    ) : filteredExams.length === 0 ? (
                      <View style={styles.centerEmptyWrapper}>
                        <Text style={styles.emptyStateText}>Không có đề thi nào trong danh sách.</Text>
                      </View>
                    ) : (
                      filteredExams.map((item) => (
                        <View key={item.id} style={[styles.examBlockCard, { width: isDesktop ? '48.5%' : '100%' }]}>
                          <View style={styles.examBlockCardHeader}>
                            <View style={styles.examCategoryTagBox}>
                              <Text style={styles.examCategoryTagText}>{item.type}</Text>
                            </View>
                            <Text style={styles.examDurationTextLabel}>{item.duration} Phút</Text>
                          </View>

                          <Text style={styles.examTitleLabel}>{item.title}</Text>

                          <View style={styles.examBlockCardFooter}>
                            <Text style={styles.questionsCountLabel}>{item.questionsCount} Câu hỏi</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity style={styles.examCardEditBtn}>
                                <Text style={styles.examCardEditBtnText}>Sửa đề</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  customAlert('Xóa đề thi', `Bạn có chắc muốn xóa đề ${item.title}?`, [
                                    { text: 'Hủy', style: 'cancel' },
                                    { text: 'Xóa', style: 'destructive', onPress: () => handleDeleteExam(item.id) }
                                  ]);
                                }}
                                style={styles.examCardDeleteBtn}
                              >
                                <Text style={styles.examCardDeleteBtnText}>Xóa</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

            </View>
          </ScrollView>
        </View>
      </View>

      {/* ==================== MODALS ==================== */}
      {/* 1. CREATE USER MODAL */}
      <Modal
        visible={showCreateUserModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }} style={{ width: '100%' }}>
            <View style={[styles.templateModalCard, { maxWidth: 600 }]}>
              <View style={styles.templateModalHeader}>
                <Text style={styles.templateModalTitle}>Thêm người dùng mới</Text>
                <TouchableOpacity onPress={() => setShowCreateUserModal(false)}>
                  <Text style={styles.templateModalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.templateModalBody}>
                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Họ và tên</Text>
                    <TextInput
                      value={createUserForm.fullName}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, fullName: val }))}
                      placeholder="Nguyễn Văn A"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Tên tài khoản (Username)</Text>
                    <TextInput
                      value={createUserForm.username}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, username: val }))}
                      placeholder="username123"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Email</Text>
                    <TextInput
                      value={createUserForm.email}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, email: val }))}
                      placeholder="email@example.com"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Mật khẩu</Text>
                    <TextInput
                      value={createUserForm.password}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, password: val }))}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Số điện thoại</Text>
                    <TextInput
                      value={createUserForm.phone}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, phone: val }))}
                      placeholder="0912345678"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Ngày sinh</Text>
                    <TextInput
                      value={createUserForm.birthday}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, birthday: val }))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Số CMND/CCCD</Text>
                    <TextInput
                      value={createUserForm.identityNumber}
                      onChangeText={(val) => setCreateUserForm(prev => ({ ...prev, identityNumber: val }))}
                      placeholder="00120200..."
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Vai trò</Text>
                    <View style={styles.templateRoleSelectorBox}>
                      {['STUDENT', 'MENTOR', 'ADMIN'].map(r => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setCreateUserForm(prev => ({ ...prev, role: r }))}
                          style={[styles.roleSelectOption, createUserForm.role === r && styles.roleSelectOptionActive]}
                        >
                          <Text style={[styles.roleSelectOptionText, createUserForm.role === r && styles.roleSelectOptionTextActive]}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateUser}
                  disabled={createLoading}
                  style={styles.templateSubmitModalBtn}
                >
                  {createLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.templateSubmitModalBtnText}>Tạo người dùng</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 2. EDIT USER MODAL */}
      <Modal
        visible={showEditUserModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEditUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }} style={{ width: '100%' }}>
            <View style={[styles.templateModalCard, { maxWidth: 600 }]}>
              <View style={styles.templateModalHeader}>
                <Text style={styles.templateModalTitle}>Chỉnh sửa thông tin thành viên</Text>
                <TouchableOpacity onPress={() => setShowEditUserModal(false)}>
                  <Text style={styles.templateModalCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.templateModalBody}>
                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Họ và tên</Text>
                    <TextInput
                      value={editUserForm.fullName}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, fullName: val }))}
                      placeholder="Nguyễn Văn A"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Tên tài khoản (Username)</Text>
                    <TextInput
                      value={editUserForm.username}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, username: val }))}
                      placeholder="username123"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Email</Text>
                    <TextInput
                      value={editUserForm.email}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, email: val }))}
                      placeholder="email@example.com"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      keyboardType="email-address"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Mật khẩu (để trống để giữ nguyên)</Text>
                    <TextInput
                      value={editUserForm.password}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, password: val }))}
                      placeholder="••••••••"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Số điện thoại</Text>
                    <TextInput
                      value={editUserForm.phone}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, phone: val }))}
                      placeholder="0912345678"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Ngày sinh</Text>
                    <TextInput
                      value={editUserForm.birthday}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, birthday: val }))}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                </View>

                <View style={styles.templateFormRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Số CMND/CCCD</Text>
                    <TextInput
                      value={editUserForm.identityNumber}
                      onChangeText={(val) => setEditUserForm(prev => ({ ...prev, identityNumber: val }))}
                      placeholder="00120200..."
                      placeholderTextColor="#94A3B8"
                      style={styles.templateTextInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateFormLabel}>Vai trò</Text>
                    <View style={styles.templateRoleSelectorBox}>
                      {['STUDENT', 'MENTOR', 'ADMIN'].map(r => (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setEditUserForm(prev => ({ ...prev, role: r }))}
                          style={[styles.roleSelectOption, editUserForm.role === r && styles.roleSelectOptionActive]}
                        >
                          <Text style={[styles.roleSelectOptionText, editUserForm.role === r && styles.roleSelectOptionTextActive]}>{r}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleUpdateUser}
                  disabled={editLoading}
                  style={styles.templateSubmitModalBtn}
                >
                  {editLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.templateSubmitModalBtnText}>Lưu thay đổi</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 2.5 DELETE CONFIRMATION MODAL */}
      <Modal
        visible={showDeleteConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.templateModalCard, { maxWidth: 440 }]}>
            <View style={styles.templateModalHeader}>
              <Text style={styles.templateModalTitle}>🗑️ Xóa tài khoản</Text>
              <TouchableOpacity onPress={() => setShowDeleteConfirmModal(false)}>
                <Text style={styles.templateModalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.templateModalBody}>
              <Text style={{ fontSize: 14, color: '#334155', lineHeight: 22, marginBottom: 20, fontFamily: 'Outfit_500Medium' }}>
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <Text style={{ fontWeight: '700', color: '#0B3B2F' }}>"{userToDelete?.fullName}"</Text>? Hành động này sẽ xóa vĩnh viễn dữ liệu người dùng và không thể hoàn tác.
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirmModal(false)}
                  style={[styles.rowSecondaryBtn, { paddingHorizontal: 16, paddingVertical: 8 }]}
                >
                  <Text style={styles.rowSecondaryBtnText}>Hủy bỏ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmDeleteUser}
                  disabled={deleteLoading}
                  style={[styles.templateSubmitModalBtn, { backgroundColor: '#EF4444', marginTop: 0, paddingHorizontal: 16, paddingVertical: 8 }]}
                >
                  {deleteLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={[styles.templateSubmitModalBtnText, { color: '#FFFFFF' }]}>Xác nhận xóa</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. CREATE EXAM MODAL */}
      <Modal
        visible={showCreateExamModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateExamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.templateModalCard}>
            <View style={styles.templateModalHeader}>
              <Text style={styles.templateModalTitle}>Tạo đề thi thử mới</Text>
              <TouchableOpacity onPress={() => setShowCreateExamModal(false)}>
                <Text style={styles.templateModalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.templateModalBody}>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.templateFormLabel}>Tiêu đề đề thi</Text>
                <TextInput
                  value={newExamTitle}
                  onChangeText={setNewExamTitle}
                  placeholder="Ví dụ: IELTS Cambridge 18 - Test 3"
                  placeholderTextColor="#94A3B8"
                  style={styles.templateTextInput}
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.templateFormLabel}>Thể loại đề thi</Text>
                <View style={styles.templateRoleSelectorBox}>
                  {['Reading', 'Listening'].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewExamType(t)}
                      style={[styles.roleSelectOption, newExamType === t && styles.roleSelectOptionActive]}
                    >
                      <Text style={[styles.roleSelectOptionText, newExamType === t && styles.roleSelectOptionTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.templateFormRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.templateFormLabel}>Thời lượng (Phút)</Text>
                  <TextInput
                    value={newExamDuration}
                    onChangeText={setNewExamDuration}
                    keyboardType="numeric"
                    style={styles.templateTextInput}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.templateFormLabel}>Số câu hỏi</Text>
                  <TextInput
                    value={newExamQuestions}
                    onChangeText={setNewExamQuestions}
                    keyboardType="numeric"
                    style={styles.templateTextInput}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCreateExamSubmit}
                style={styles.templateSubmitModalBtn}
              >
                <Text style={styles.templateSubmitModalBtnText}>Đăng tải nội dung đề</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

>>>>>>> origin/main
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
