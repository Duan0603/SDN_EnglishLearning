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
  StyleSheet
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';

const AdminScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

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
  const [editTarget, setEditTarget] = useState(null);   // the user being edited
  const [editUserForm, setEditUserForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

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
      // Normalise id field: MongoDB returns _id
      setUsersList(raw.map(u => ({ ...u, id: u._id || u.id })));
    } catch (err) {
      // Fallback to demo data if backend not available yet
      setUsersList([
        { id: '1', fullName: 'Nguyen Minh Anh', username: 'minhanh', email: 'minhanh@gmail.com', role: 'STUDENT', status: 'active', birthday: '15/08/2002', phone: '0912345678', identityNumber: '001202003456' },
        { id: '2', fullName: 'John Doe', username: 'johndoe', email: 'john@sdn.com', role: 'MENTOR', status: 'pending', birthday: '20/10/1995', phone: '0987654321', identityNumber: '001202008765' },
        { id: '3', fullName: 'Emily Smith', username: 'emily', email: 'emily@mentor.com', role: 'MENTOR', status: 'active', birthday: '12/03/1990', phone: '0977665544', identityNumber: '001202004321' },
        { id: '4', fullName: 'Admin User', username: 'admin', email: 'admin@sdn.com', role: 'ADMIN', status: 'active', birthday: '01/01/1988', phone: '0900112233', identityNumber: '001202009999' },
      ]);
      setUsersError('Using demo data — connect backend to load live users.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // ── Filtered Users ───────────────────────────────────────
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

  // CREATE user
  const handleCreateUser = async () => {
    const { fullName, username, email, password, role, birthday, phone, identityNumber } = createUserForm;
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Full Name, Username, Email, and Password are required.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await adminUserService.create({ fullName, username, email, password, role, birthday, phone, identityNumber });
      const newUser = res.data?.metadata;
      setUsersList(prev => [{ ...newUser, id: newUser._id || newUser.id }, ...prev]);
      setShowCreateUserModal(false);
      setCreateUserForm(EMPTY_USER_FORM);
      Alert.alert('✅ Success', 'New user has been created.');
    } catch (err) {
      // Error already handled by global interceptor toast
    } finally {
      setCreateLoading(false);
    }
  };

  // OPEN edit modal
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
      password: '', // blank = don't change
    });
    setShowEditUserModal(true);
  };

  // UPDATE user
  const handleUpdateUser = async () => {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      const payload = { ...editUserForm };
      if (!payload.password) delete payload.password; // skip if blank
      const res = await adminUserService.update(editTarget.id, payload);
      const updated = res.data?.metadata;
      setUsersList(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...updated, id: u.id } : u));
      setShowEditUserModal(false);
      Alert.alert('✅ Success', 'User information has been updated.');
    } catch (err) {
      // Error already handled by global interceptor
    } finally {
      setEditLoading(false);
    }
  };

  // DELETE user
  const handleDeleteUser = (item) => {
    Alert.alert(
      '🗑️ Delete User',
      `Are you sure you want to permanently delete "${item.fullName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminUserService.remove(item.id);
              setUsersList(prev => prev.filter(u => u.id !== item.id));
              Alert.alert('✅ Deleted', `${item.fullName} has been removed.`);
            } catch (err) { /* toast shown by interceptor */ }
          },
        },
      ]
    );
  };

  // TOGGLE status
  const handleToggleUserStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await adminUserService.toggleStatus(item.id, nextStatus);
      setUsersList(prev => prev.map(u => u.id === item.id ? { ...u, status: nextStatus } : u));
    } catch (err) { /* toast shown by interceptor */ }
  };

  // APPROVE mentor
  const handleApproveMentor = async (item) => {
    try {
      await adminUserService.approveMentor(item.id);
      setUsersList(prev => prev.map(u => u.id === item.id ? { ...u, status: 'active' } : u));
      Alert.alert('✅ Approved', `${item.fullName} is now an active Mentor.`);
    } catch (err) { /* toast shown by interceptor */ }
  };

  // Exam CRUD
  const handleCreateExamSubmit = () => {
    if (!newExamTitle.trim()) {
      Alert.alert('Validation Error', 'Exam title is required.');
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
    Alert.alert('Exam Created', 'New Mock Test has been added successfully.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FB]">
      {/* Header Bar */}
      <View className="flex-row items-center justify-between px-6 h-16 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            className="w-10 h-10 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB] mr-3"
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text className="text-xl font-black text-[#1E1E1E]">Apex Admin Workspace</Text>
        </View>

        <View className="flex-row items-center bg-[#E6F9F5] px-4 py-1.5 rounded-full border border-[#A7F3D0]">
          <Text className="text-xs font-bold text-[#005C42]">👑 System Administrator</Text>
        </View>
      </View>

      {/* Main Container */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mx-auto w-full max-w-[1400px] px-6 py-6">
          
          {/* Tab Navigation Switches */}
          <View className="flex-row bg-white p-2 rounded-3xl border border-[#E4EAF2] mb-6 shadow-xs">
            {['dashboard', 'users', 'exams'].map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => {
                    setActiveTab(tab);
                    setSearchQuery('');
                  }}
                  className={`py-3 flex-1 items-center rounded-2xl ${isActive ? 'bg-[#00CC99]' : 'bg-transparent'}`}
                >
                  <Text className={`text-sm font-extrabold capitalize ${isActive ? 'text-white' : 'text-[#7A8BA3]'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <View>

              {/* === ROW 1: KPI Cards === */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                {[
                  { icon: '👥', value: '1,240', label: 'Total Students', change: '+48 this month', changeUp: true, accent: '#6366F1', bg: '#EEF2FF' },
                  { icon: '🎓', value: '85', label: 'Active Mentors', change: '+3 approved', changeUp: true, accent: '#00CC99', bg: '#E6F9F5' },
                  { icon: '📝', value: '48', label: 'Mock Exams Live', change: '5 added this week', changeUp: true, accent: '#F59E0B', bg: '#FEF3C7' },
                  { icon: '🎙️', value: '3,420', label: 'AI Speaking Graded', change: '+210 this week', changeUp: true, accent: '#EC4899', bg: '#FCE7F3' },
                  { icon: '💰', value: '₫124M', label: 'Revenue (June)', change: '+18% vs last month', changeUp: true, accent: '#10B981', bg: '#ECFDF5' },
                  { icon: '📅', value: '342', label: 'Bookings This Month', change: '12 pending confirm', changeUp: false, accent: '#F97316', bg: '#FFF7ED' },
                  { icon: '⭐', value: '4.87', label: 'Platform Rating', change: 'From 1,240 reviews', changeUp: true, accent: '#8B5CF6', bg: '#F5F3FF' },
                  { icon: '🔥', value: '73%', label: 'Avg. Completion Rate', change: '+5% vs last month', changeUp: true, accent: '#EF4444', bg: '#FEF2F2' },
                ].map((stat, i) => (
                  <View key={i} style={{
                    width: isDesktop ? 'calc(25% - 12px)' : '47%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#E4EAF2',
                    padding: 20,
                    flex: isDesktop ? undefined : undefined,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18 }}>{stat.icon}</Text>
                      </View>
                      <View style={{ backgroundColor: stat.changeUp ? '#ECFDF5' : '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: stat.changeUp ? '#059669' : '#DC2626' }}>
                          {stat.changeUp ? '▲' : '▼'} {stat.changeUp ? 'UP' : 'DN'}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 26, fontWeight: '900', color: '#1E1E1E', letterSpacing: -1 }}>{stat.value}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 2 }}>{stat.label}</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 4, fontWeight: '600' }}>{stat.change}</Text>
                  </View>
                ))}
              </View>

              {/* === ROW 2: Revenue Chart + Bookings Breakdown === */}
              <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16, marginBottom: 20 }}>

                {/* Revenue Bar Chart (manual SVG bars) */}
                <View style={{ flex: 2, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4EAF2', padding: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1E1E' }}>Monthly Revenue</Text>
                      <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Platform subscription + booking fees (₫ million)</Text>
                    </View>
                    <View style={{ backgroundColor: '#E6F9F5', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#A7F3D0' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#005C42' }}>2026 Year</Text>
                    </View>
                  </View>

                  {/* Bar chart */}
                  {(() => {
                    const bars = [
                      { month: 'Jan', value: 68, color: '#C7D2FE' },
                      { month: 'Feb', value: 74, color: '#C7D2FE' },
                      { month: 'Mar', value: 82, color: '#C7D2FE' },
                      { month: 'Apr', value: 91, color: '#C7D2FE' },
                      { month: 'May', value: 105, color: '#C7D2FE' },
                      { month: 'Jun', value: 124, color: '#6366F1' },
                    ];
                    const maxVal = 140;
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 10 }}>
                        {bars.map((b, i) => (
                          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: b.color === '#6366F1' ? '#6366F1' : '#9CA3AF', marginBottom: 4 }}>
                              {b.value}M
                            </Text>
                            <View style={{
                              width: '100%',
                              height: (b.value / maxVal) * 100,
                              backgroundColor: b.color,
                              borderRadius: 8,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                            }} />
                            <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 6, fontWeight: '600' }}>{b.month}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  })()}

                  <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 20 }}>
                    <View>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Total H1 2026</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E1E1E', marginTop: 2 }}>₫544M</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>YoY Growth</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#00CC99', marginTop: 2 }}>+34%</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Best Month</Text>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#6366F1', marginTop: 2 }}>June</Text>
                    </View>
                  </View>
                </View>

                {/* Bookings & User Growth */}
                <View style={{ flex: 1, gap: 16 }}>
                  {/* User Breakdown donut-style */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4EAF2', padding: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1E1E', marginBottom: 14 }}>User Breakdown</Text>
                    {[
                      { label: 'Students', count: 1240, pct: 93, color: '#00CC99' },
                      { label: 'Mentors', count: 85, pct: 6.4, color: '#6366F1' },
                      { label: 'Admins', count: 8, pct: 0.6, color: '#F59E0B' },
                    ].map((item, i) => (
                      <View key={i} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#374151' }}>{item.label}</Text>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: item.color }}>{item.count.toLocaleString()}</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
                          <View style={{ width: `${item.pct}%`, height: '100%', backgroundColor: item.color, borderRadius: 10 }} />
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Top Mentor Sessions */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4EAF2', padding: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1E1E', marginBottom: 12 }}>Top Mentors by Sessions</Text>
                    {[
                      { name: 'Emily Smith', sessions: 48, rating: 4.9 },
                      { name: 'David Lee', sessions: 41, rating: 4.8 },
                      { name: 'Sarah Nguyen', sessions: 37, rating: 4.7 },
                    ].map((m, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: '#F3F4F6' }}>
                        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: ['#E6F9F5', '#EEF2FF', '#FFF7ED'][i], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                          <Text style={{ fontSize: 12, fontWeight: '900', color: ['#005C42', '#6366F1', '#F97316'][i] }}>#{i + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E1E1E' }}>{m.name}</Text>
                          <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{m.sessions} sessions · ⭐ {m.rating}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* === ROW 3: Activity Feed + System Health === */}
              <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 16, marginBottom: 20 }}>

                {/* Recent Activity Timeline */}
                <View style={{ flex: 2, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4EAF2', padding: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1E1E' }}>Recent Activity</Text>
                    <Text style={{ fontSize: 10, color: '#9CA3AF', fontWeight: '600' }}>Last 24 hours</Text>
                  </View>
                  {[
                    { icon: '🧑‍🎓', action: 'New student registered', detail: 'Tran Huu Binh joined as STUDENT', time: '2 min ago', dot: '#6366F1' },
                    { icon: '📋', action: 'Mentor approval pending', detail: 'John Doe submitted mentor credentials', time: '15 min ago', dot: '#F59E0B' },
                    { icon: '📝', action: 'New mock exam added', detail: 'Cambridge 19 - Test 1 uploaded by Admin', time: '1 hr ago', dot: '#00CC99' },
                    { icon: '🎙️', action: 'AI grading completed', detail: '14 speaking submissions scored by Gemini', time: '2 hr ago', dot: '#EC4899' },
                    { icon: '📅', action: 'Booking confirmed', detail: 'Nguyen Minh Anh booked Emily Smith (Mon 9AM)', time: '3 hr ago', dot: '#10B981' },
                    { icon: '⚠️', action: 'Booking conflict blocked', detail: 'Redis lock prevented duplicate slot booking', time: '4 hr ago', dot: '#EF4444' },
                  ].map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
                      <View style={{ alignItems: 'center', marginRight: 12, width: 32 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                        </View>
                        {i < 5 && <View style={{ width: 1, height: 14, backgroundColor: '#E4EAF2', marginTop: 3 }} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#1E1E1E' }}>{item.action}</Text>
                          <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{item.time}</Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{item.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* System Health Panel */}
                <View style={{ flex: 1, gap: 16 }}>
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4EAF2', padding: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E1E1E', marginBottom: 14 }}>System Health</Text>
                    {[
                      { label: 'API Server (Express)', status: 'Online', ok: true },
                      { label: 'MongoDB Database', status: 'Connected', ok: true },
                      { label: 'Redis Cache', status: 'Online', ok: true },
                      { label: 'Gemini AI (Speaking)', status: 'Online', ok: true },
                      { label: 'Socket.io Server', status: 'Listening', ok: true },
                    ].map((s, i) => (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: '#F3F4F6' }}>
                        <Text style={{ fontSize: 11, color: '#374151', fontWeight: '600' }}>{s.label}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00CC99', marginRight: 5 }} />
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#059669' }}>{s.status}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Pending Actions */}
                  <View style={{ backgroundColor: '#FFFBEB', borderRadius: 24, borderWidth: 1, borderColor: '#FDE68A', padding: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#92400E', marginBottom: 12 }}>⚡ Action Required</Text>
                    {[
                      { text: '1 mentor awaiting credential review', cta: 'Review', onPress: () => { setActiveTab('users'); setRoleFilter('PENDING'); } },
                      { text: '3 student disputes unresolved', cta: 'View', onPress: () => {} },
                    ].map((a, i) => (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: i === 0 ? 10 : 0 }}>
                        <Text style={{ fontSize: 10, color: '#B45309', flex: 1, marginRight: 8 }}>{a.text}</Text>
                        <TouchableOpacity onPress={a.onPress} style={{ backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF' }}>{a.cta}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

            </View>
          )}

          {/* USERS MANAGEMENT VIEW */}
          {activeTab === 'users' && (
            <View className="bg-white p-6 rounded-[28px] border border-[#E4EAF2] shadow-xs">
              
              {/* Header with Search and Role Filter Tabs */}
              <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
                <View className="flex-1 min-w-[280px] flex-row items-center bg-[#F4F7FB] border border-[#E4EAF2] rounded-2xl px-4 py-2">
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="M21 21l-4.3-4.3" />
                  </Svg>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name, username, or email..."
                    placeholderTextColor="#94A3B8"
                    className="flex-1 ml-3 text-sm text-[#111827] p-0"
                  />
                </View>

                {/* Filters */}
                <View className="flex-row bg-[#F4F7FB] p-1.5 rounded-xl border border-[#E4EAF2]">
                  {['ALL', 'STUDENT', 'MENTOR', 'PENDING'].map((filter) => {
                    const isActive = roleFilter === filter;
                    return (
                      <TouchableOpacity
                        key={filter}
                        onPress={() => setRoleFilter(filter)}
                        className={`px-4 py-1.5 rounded-lg ${isActive ? 'bg-[#00CC99]' : 'bg-transparent'}`}
                      >
                        <Text className={`text-[11px] font-extrabold ${isActive ? 'text-white' : 'text-[#7A8BA3]'}`}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Users list table */}
              <View className="border border-[#E4EAF2] rounded-2xl overflow-hidden">
                <View className="flex-row bg-[#F9FAFB] border-b border-[#E4EAF2] p-4">
                  <Text className="w-[30%] text-xs font-bold text-[#7A8BA3]">User Details</Text>
                  <Text className="w-[20%] text-xs font-bold text-[#7A8BA3]">Contact Info</Text>
                  <Text className="w-[15%] text-xs font-bold text-[#7A8BA3]">Identity Info</Text>
                  <Text className="w-[15%] text-xs font-bold text-[#7A8BA3]">Role & Status</Text>
                  <Text className="w-[20%] text-xs font-bold text-[#7A8BA3] text-right">Actions</Text>
                </View>

                {filteredUsers.length === 0 ? (
                  <View className="p-8 items-center justify-center">
                    <Text className="text-sm text-[#9CA3AF]">No users found matching query.</Text>
                  </View>
                ) : (
                  filteredUsers.map((item) => (
                    <View key={item.id} className="flex-row items-center border-b border-[#F3F4F6] p-4 last:border-b-0">
                        </View>
                      </View>

                      {/* Actions Buttons */}
                      <View className="w-[20%] flex-row justify-end gap-2">
                        {item.role === 'MENTOR' && item.status === 'pending' && (
                          <TouchableOpacity 
                            onPress={() => handleApproveMentor(item.id)}
                            className="bg-[#00CC99] px-2.5 py-1.5 rounded-xl active:opacity-90"
                          >
                            <Text className="text-white text-[10px] font-extrabold">Approve</Text>
                          </TouchableOpacity>
                        )}
                        {item.role !== 'ADMIN' && (
                          <TouchableOpacity 
                            onPress={() => handleToggleUserStatus(item.id, item.status)}
                            className={`px-2.5 py-1.5 rounded-xl border ${
                              item.status === 'active' 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-[#E6F9F5] border-[#A7F3D0]'
                            }`}
                          >
                            <Text className={`text-[10px] font-extrabold ${
                              item.status === 'active' ? 'text-red-600' : 'text-[#005C42]'
                            }`}>
                              {item.status === 'active' ? 'Suspend' : 'Activate'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>

                    </View>
                  ))
                )}
              </View>

            </View>
          )}

          {/* EXAMS MANAGEMENT VIEW */}
          {activeTab === 'exams' && (
            <View className="bg-white p-6 rounded-[28px] border border-[#E4EAF2] shadow-xs">
              
              {/* Header with Search and Create button */}
              <View className="flex-row flex-wrap items-center justify-between gap-4 mb-6">
                <View className="flex-1 min-w-[280px] flex-row items-center bg-[#F4F7FB] border border-[#E4EAF2] rounded-2xl px-4 py-2">
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
                    <Circle cx="11" cy="11" r="8" />
                    <Path d="M21 21l-4.3-4.3" />
                  </Svg>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search mock exams..."
                    placeholderTextColor="#94A3B8"
                    className="flex-1 ml-3 text-sm text-[#111827] p-0"
                  />
                </View>

                <TouchableOpacity 
                  onPress={() => setShowCreateExamModal(true)}
                  className="bg-[#00CC99] px-5 py-3 rounded-2xl active:opacity-90 flex-row items-center shadow-xs"
                >
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" className="mr-2">
                    <Path d="M12 5v14M5 12h14" />
                  </Svg>
                  <Text className="text-white text-xs font-bold">Create Mock Test</Text>
                </TouchableOpacity>
              </View>

              {/* Exams list grid */}
              <View className="flex-row flex-wrap gap-4">
                {filteredExams.length === 0 ? (
                  <View className="w-full p-8 items-center justify-center">
                    <Text className="text-sm text-[#9CA3AF]">No mock exams found matching query.</Text>
                  </View>
                ) : (
                  filteredExams.map((item) => (
                    <View key={item.id} className="w-full md:w-[48.5%] bg-[#F8FAFC] border border-[#E4EAF2] p-5 rounded-[24px]">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                          <Text className="text-[10px] font-extrabold text-[#005C42]">{item.type}</Text>
                        </View>
                        <Text className="text-xs text-[#9CA3AF] font-bold font-mono">{item.duration} Mins</Text>
                      </View>
                      
                      <Text className="text-base font-black text-[#1E1E1E] leading-6 mb-2" numberOfLines={2}>
                        {item.title}
                      </Text>
                      
                      <View className="flex-row items-center justify-between border-t border-[#E5E7EB]/50 pt-3 mt-3">
                        <Text className="text-xs text-[#7A8BA3] font-semibold">{item.questionsCount} Questions</Text>
                        
                        <View className="flex-row gap-2">
                          <TouchableOpacity 
                            className="bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-xl active:opacity-85"
                          >
                            <Text className="text-[#4B5563] text-[10px] font-extrabold">Edit Test</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              Alert.alert('Delete Exam', `Are you sure you want to delete ${item.title}?`, [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => setExamsList(prev => prev.filter(e => e.id !== item.id)) }
                              ]);
                            }}
                            className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl active:opacity-85"
                          >
                            <Text className="text-red-600 text-[10px] font-extrabold">Delete</Text>
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

      {/* CREATE MOCK EXAM MODAL */}
      <Modal
        visible={showCreateExamModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateExamModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Mock Test</Text>
              <TouchableOpacity onPress={() => setShowCreateExamModal(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View className="mb-4">
                <Text className="mb-1 text-[11px] font-bold text-[#7A8BA3] uppercase tracking-wider">Exam Title</Text>
                <TextInput
                  value={newExamTitle}
                  onChangeText={setNewExamTitle}
                  placeholder="e.g. IELTS Cambridge 18 - Test 3"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
              </View>

              <View className="mb-4 flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-bold text-[#7A8BA3] uppercase tracking-wider">Exam Category</Text>
                  <View style={styles.typeSelectorRow}>
                    {['Reading', 'Listening'].map(t => (
                      <TouchableOpacity
                        key={t}
                        onPress={() => setNewExamType(t)}
                        style={[styles.typeSelectBtn, newExamType === t && styles.typeSelectBtnActive]}
                      >
                        <Text style={[styles.typeSelectText, newExamType === t && styles.typeSelectTextActive]}>{t}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View className="mb-4 flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-bold text-[#7A8BA3] uppercase tracking-wider">Duration (Minutes)</Text>
                  <TextInput
                    value={newExamDuration}
                    onChangeText={setNewExamDuration}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
                
                <View className="flex-1">
                  <Text className="mb-1 text-[11px] font-bold text-[#7A8BA3] uppercase tracking-wider">Total Questions</Text>
                  <TextInput
                    value={newExamQuestions}
                    onChangeText={setNewExamQuestions}
                    keyboardType="numeric"
                    style={styles.textInput}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleCreateExamSubmit}
                className="bg-[#00CC99] py-3.5 rounded-2xl items-center active:opacity-90 mt-2"
              >
                <Text className="text-white text-xs font-extrabold uppercase tracking-wider">Upload Exam Content</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    justifyContent: 'space-between'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1E1E'
  },
  closeText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700'
  },
  modalBody: {
    padding: 24
  },
  textInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111827'
  },
  typeSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#D8E0EA'
  },
  typeSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  typeSelectBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  typeSelectText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A8BA3'
  },
  typeSelectTextActive: {
    color: '#00CC99'
  }
});

export default AdminScreen;
