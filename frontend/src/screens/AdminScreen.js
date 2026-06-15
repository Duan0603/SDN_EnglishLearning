import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  useWindowDimensions,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';

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

const AdminScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'exams'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ── Users state ─────────────────────────────────────────
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

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
  const [examsList, setExamsList] = useState([
    { id: '1', title: 'IELTS Cambridge 18 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
    { id: '2', title: 'IELTS Cambridge 18 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
    { id: '3', title: 'IELTS Cambridge 17 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
  ]);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamType, setNewExamType] = useState('Reading');
  const [newExamDuration, setNewExamDuration] = useState('60');
  const [newExamQuestions, setNewExamQuestions] = useState('40');

  // ── Load users from API ──────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await adminUserService.getAll();
      const raw = res.data?.metadata?.users || [];
      setUsersList(raw.map(u => ({ ...u, id: u._id || u.id })));
    } catch (err) {
      setUsersList([]);
      setUsersError('Không thể tải danh sách người dùng từ database.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, activeTab]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (roleFilter === 'ALL') return matchesSearch;
      if (roleFilter === 'PENDING') return matchesSearch && u.role === 'MENTOR' && u.status === 'pending';
      return matchesSearch && u.role === roleFilter;
    });
  }, [usersList, searchQuery, roleFilter]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return examsList.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [examsList, searchQuery]);

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

  const handleCreateExamSubmit = () => {
    if (!newExamTitle.trim()) {
      customAlert('Lỗi nhập liệu', 'Vui lòng điền tiêu đề đề thi.');
      return;
    }
    const newExam = {
      id: String(examsList.length + 1),
      title: newExamTitle.trim(),
      type: newExamType,
      duration: parseInt(newExamDuration) || 60,
      questionsCount: parseInt(newExamQuestions) || 40
    };
    setExamsList(prev => [newExam, ...prev]);
    setShowCreateExamModal(false);
    setNewExamTitle('');
    customAlert('✅ Tạo thành công', 'Đề thi thử mới đã được thêm vào danh sách.');
  };

  const handleUnsupportedTab = (tabName) => {
    customAlert('Chức năng chưa phát triển', `Mục "${tabName}" là giao diện mẫu theo khuôn thiết kế của bạn.`);
  };

  const adminName = user?.fullName || 'Minh Phúc';
  const adminRole = user?.role === 'ADMIN' ? 'Super Admin' : 'Admin';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        {(isDesktop || !isSidebarCollapsed) && (
          <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            {/* Logo area */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>hims</Text>
              </View>
              {!isSidebarCollapsed && (
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logoTitle}>Admin Panel</Text>
                  <Text style={styles.logoSubTitle}>Quản trị hệ thống</Text>
                </View>
              )}
            </View>

            {/* Navigation items list */}
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {[
                { id: 'dashboard', label: 'Tổng quan', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
                { id: 'users', label: 'Người dùng', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z', badge: 3 },
                { id: 'exams', label: 'Quản lý Đề thi', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
                { id: 'profile', label: 'Hồ sơ cá nhân', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', dummy: true },
                { id: 'roles', label: 'Vai trò & Quyền', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z', dummy: true },
                { id: 'products', label: 'Sản phẩm', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z', dummy: true },
                { id: 'orders', label: 'Đơn hàng', icon: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z', dummy: true },
                { id: 'reports', label: 'Báo cáo', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z', dummy: true },
                { id: 'notifications', label: 'Thông báo', icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z', badge: 7, dummy: true },
                { id: 'settings', label: 'Cài đặt', icon: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z', dummy: true }
              ].map((item) => {
                const isActive = item.id === activeTab;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (item.dummy) {
                        handleUnsupportedTab(item.label);
                      } else {
                        setActiveTab(item.id);
                        setSearchQuery('');
                      }
                    }}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                  >
                    <View style={styles.menuItemLeftRow}>
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? "#FFFFFF" : "#64748B"} style={styles.menuIcon}>
                        <Path d={item.icon} />
                      </Svg>
                      {!isSidebarCollapsed && (
                        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                          {item.label}
                        </Text>
                      )}
                    </View>
                    {!isSidebarCollapsed && item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sidebar bottom section */}
            <View style={styles.sidebarBottom}>
              <TouchableOpacity
                onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                style={styles.bottomControlBtn}
              >
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" style={styles.menuIcon}>
                  {isSidebarCollapsed ? (
                    <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </Svg>
                {!isSidebarCollapsed && <Text style={styles.bottomControlText}>Thu gọn</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  customAlert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi hệ thống?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() }
                  ]);
                }}
                style={[styles.bottomControlBtn, { marginTop: 12 }]}
              >
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" style={styles.menuIcon}>
                  <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                {!isSidebarCollapsed && <Text style={[styles.bottomControlText, { color: '#EF4444' }]}>Đăng xuất</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ==================== MAIN PANEL ==================== */}
        <View style={styles.mainPanel}>
          {/* Top Navbar Header */}
          <View style={styles.topNavbar}>
            <View>
              <Text style={styles.navbarTitle}>
                {activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'users' ? 'Quản lý Người dùng' : 'Quản lý Đề thi'}
              </Text>
              <Text style={styles.navbarSubTitle}>Chào mừng trở lại, Admin {adminName}</Text>
            </View>

            <View style={styles.navbarRight}>
              {/* Quick Search */}
              <View style={styles.quickSearchBox}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5">
                  <Circle cx="11" cy="11" r="8" />
                  <Path d="M21 21l-4.3-4.3" />
                </Svg>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Tìm kiếm nhanh..."
                  placeholderTextColor="#94A3B8"
                  style={styles.quickSearchInput}
                />
              </View>

              {/* Notification bell */}
              <TouchableOpacity style={styles.notificationBell}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2">
                  <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </Svg>
                <View style={styles.bellRedDot} />
              </TouchableOpacity>

              {/* User block info */}
              <View style={styles.userProfileBlock}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarCircleText}>{adminInitials}</Text>
                </View>
                {isDesktop && (
                  <View style={styles.userTextMeta}>
                    <Text style={styles.profileNameText}>{adminName}</Text>
                    <Text style={styles.profileRoleText}>{adminRole}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Breadcrumb row */}
          <View style={styles.breadcrumbRow}>
            <Text style={styles.breadcrumbText}>Admin / </Text>
            <Text style={[styles.breadcrumbText, { color: '#1E293B', fontWeight: '700' }]}>
              {activeTab === 'dashboard' ? 'Tổng quan' : activeTab === 'users' ? 'Người dùng' : 'Quản lý Đề thi'}
            </Text>
          </View>

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
                  <View style={[styles.examsGridBox, { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
                    {filteredExams.length === 0 ? (
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
                                  Alert.alert('Xóa đề thi', `Bạn có chắc muốn xóa đề ${item.title}?`, [
                                    { text: 'Hủy', style: 'cancel' },
                                    { text: 'Xóa', style: 'destructive', onPress: () => setExamsList(prev => prev.filter(e => e.id !== item.id)) }
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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC' // Clean background matching light UI
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  
  // Sidebar styling
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20
  },
  sidebarCollapsed: {
    width: 76
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0B3B2F', // Dark forest green
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    fontFamily: 'Outfit_700Bold'
  },
  logoTextContainer: {
    marginLeft: 12
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  logoSubTitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
    fontFamily: 'Outfit_500Medium'
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 10
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4
  },
  menuItemActive: {
    backgroundColor: '#0B3B2F' // Dark forest green background for active item
  },
  menuItemLeftRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuIcon: {
    marginRight: 12
  },
  menuLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Outfit_500Medium'
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },
  menuBadge: {
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'Outfit_700Bold'
  },
  sidebarBottom: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 16,
    paddingHorizontal: 16
  },
  bottomControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8
  },
  bottomControlText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Outfit_500Medium'
  },

  // Main area
  mainPanel: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8F9FC'
  },
  topNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0'
  },
  navbarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0B3B2F', // Dark forest green
    letterSpacing: -0.5,
    fontFamily: 'Outfit_700Bold'
  },
  navbarSubTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '550',
    marginTop: 2,
    fontFamily: 'Outfit_500Medium'
  },
  navbarRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quickSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 200,
    marginRight: 16
  },
  quickSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
    fontFamily: 'Outfit_500Medium'
  },
  notificationBell: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    marginRight: 16
  },
  bellRedDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444'
  },
  userProfileBlock: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00D1A0', // Vibrant green/teal
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarCircleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    fontFamily: 'Outfit_700Bold'
  },
  userTextMeta: {
    marginLeft: 10
  },
  profileNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  profileRoleText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
    fontFamily: 'Outfit_500Medium'
  },
  breadcrumbRow: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 4
  },
  breadcrumbText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium'
  },
  contentWorkspace: {
    paddingHorizontal: 28,
    paddingTop: 16
  },

  // KPI Row
  kpiRow: {
    marginBottom: 20
  },
  kpiCardTemplate: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  kpiCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  kpiCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Outfit_700Bold'
  },
  kpiCardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0B3B2F', // Dark forest green
    marginTop: 6,
    letterSpacing: -0.5,
    fontFamily: 'Outfit_700Bold'
  },
  kpiCardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  kpiCardChangeText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },

  // Charts
  chartGridContainer: {
    marginBottom: 20
  },
  chartBlockCard: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24
  },
  chartBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20
  },
  chartBlockTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  chartBlockSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Outfit_500Medium'
  },
  chartBlockLegend: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendIndicatorItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'Outfit_500Medium'
  },
  svgChartWrapper: {
    width: '100%',
    position: 'relative'
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8
  },
  axisLabelText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '600',
    fontFamily: 'Outfit_500Medium'
  },
  barGraphWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 16
  },
  barChartPlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8
  },
  barPairCol: {
    alignItems: 'center',
    flex: 1
  },
  barPairGraphics: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4
  },
  barPrimaryUnit: {
    width: 6,
    backgroundColor: '#0B3B2F', // Dark forest green bar
    borderRadius: 3
  },
  barSecondaryUnit: {
    width: 6,
    backgroundColor: '#E2E8F0', // Grey bar
    borderRadius: 3
  },
  barAxisText: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '600',
    fontFamily: 'Outfit_500Medium'
  },

  // Recent Activity
  recentActivityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 20
  },
  recentActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  recentActivityTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  viewAllTextText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },
  recentActivityList: {
    flexDirection: 'column'
  },
  activityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  activityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  activityCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  activityMainText: {
    fontSize: 12.5,
    color: '#64748B',
    fontFamily: 'Outfit_500Medium'
  },
  activityTimeText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium'
  },

  // Users Management Panel Style
  whitePanelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24
  },
  sectionHeaderRow: {
    justifyContent: 'space-between',
    marginBottom: 20
  },
  workspaceSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  workspaceSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12.5,
    color: '#0F172A',
    padding: 0,
    fontFamily: 'Outfit_500Medium'
  },
  workspaceActionsGroup: {
    alignItems: 'center'
  },
  pillsFilterBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  pillBtnActive: {
    backgroundColor: '#00D1A0' // Teal Green
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Outfit_700Bold'
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_700Bold'
  },
  workspacePrimaryBtn: {
    backgroundColor: '#0B3B2F', // Dark forest green Button
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  workspacePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },
  dataTableBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden'
  },
  dataTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14
  },
  headerCell: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Outfit_700Bold'
  },
  centerLoadingWrapper: {
    padding: 40,
    alignItems: 'center'
  },
  centerEmptyWrapper: {
    padding: 40,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontFamily: 'Outfit_500Medium'
  },
  dataTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF'
  },
  cellMainTextTemplate: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  cellSubTextTemplate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'Outfit_500Medium'
  },
  roleBadgeTemplate: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  roleBadgeTextTemplate: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Outfit_700Bold'
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  rowApproveBtn: {
    backgroundColor: '#00CC99', // Teal green
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  rowApproveBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Outfit_700Bold'
  },
  rowSecondaryBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF'
  },
  rowSecondaryBtnText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '750',
    fontFamily: 'Outfit_700Bold'
  },

  // Exams View Style
  examsGridBox: {
    marginTop: 8
  },
  examBlockCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    borderRadius: 14
  },
  examBlockCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  examCategoryTagBox: {
    backgroundColor: 'rgba(0, 209, 160, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 160, 0.2)'
  },
  examCategoryTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#00CC99',
    fontFamily: 'Outfit_700Bold'
  },
  examDurationTextLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Outfit_500Medium'
  },
  examTitleLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Outfit_700Bold'
  },
  examBlockCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 12
  },
  questionsCountLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: 'Outfit_500Medium'
  },
  examCardEditBtn: {
    backgroundColor: '#0B3B2F',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 6
  },
  examCardEditBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },
  examCardDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 6
  },
  examCardDeleteBtnText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },

  // Modal overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  templateModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden'
  },
  templateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9'
  },
  templateModalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0B3B2F', // Dark forest green
    fontFamily: 'Outfit_700Bold'
  },
  templateModalCloseBtn: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '700',
    fontFamily: 'Outfit_700Bold'
  },
  templateModalBody: {
    padding: 20
  },
  templateFormRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14
  },
  templateFormLabel: {
    marginBottom: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: 'Outfit_700Bold'
  },
  templateTextInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#0F172A',
    fontFamily: 'Outfit_500Medium'
  },
  templateRoleSelectorBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  roleSelectOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6
  },
  roleSelectOptionActive: {
    backgroundColor: '#E2E8F0'
  },
  roleSelectOptionText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Outfit_700Bold'
  },
  roleSelectOptionTextActive: {
    color: '#00D1A0', // Teal Green
    fontFamily: 'Outfit_700Bold'
  },
  templateSubmitModalBtn: {
    backgroundColor: '#0B3B2F', // Dark forest green
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8
  },
  templateSubmitModalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: 'Outfit_700Bold'
  }
});

export default AdminScreen;
