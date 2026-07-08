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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../store/useAuthStore';
import Toast from 'react-native-toast-message';
import client from '../api/client';

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
  const [successMessage, setSuccessMessage] = useState('');

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone,
      birthDate: profileBirthDate,
    },
  });

  React.useEffect(() => {
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthday || user?.dateOfBirth || '',
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
          client.get('/users/me/results?limit=4', { hideToast: true })
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

  const stats = [
    { icon: 'flame', value: `${currentStreak} Days`, label: 'Streak', color: '#c92a2a', bg: '#fbcfe8' },
    { icon: 'book', value: `${totalTests} Tests`, label: 'Completed', color: '#4682b4', bg: '#e0f2fe' },
    { icon: 'time', value: `${weeksActive} Wks`, label: 'Active', color: '#005c42', bg: '#a7f3d0' },
    { icon: 'medal', value: `${apiStats?.topScore || 0} Band`, label: 'Top Score', color: '#d97706', bg: '#ffd54f' },
  ];

  const tabs = [
    { key: 'overview', label: 'OVERVIEW' },
    { key: 'settings', label: 'SETTINGS' },
  ];

  const onSubmit = async (data) => {
    try {
      const apiData = {
        fullName: data.fullName,
        phone: data.phone,
        birthday: data.birthDate
      };
      await updateProfile(apiData);
      setSuccessMessage('Thông tin cá nhân của bạn đã được cập nhật thành công!');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message || 'Cập nhật thông tin thất bại.' });
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>STUDENT PROFILE</Text>
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
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                  <TouchableOpacity style={styles.cameraBtn}>
                    <Ionicons name="camera" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>

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
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, isActive && styles.tabItemActive]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

              {/* Recent Activities */}
              <BrutalistShadow style={styles.plannerCard} offset={4}>
                <View style={styles.plannerCardInner}>
                  <Text style={styles.sectionTitle}>Recent Activities</Text>
                  
                  {recentActivities.length > 0 ? recentActivities.map((item, index) => (
                    <View key={item.id || index} style={styles.plannerItem}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={18} 
                        color="#005c42" 
                      />
                      <Text style={[styles.plannerItemText, { flex: 1 }]} numberOfLines={1}>
                        Completed {item.title || `${item.type} Test`}
                      </Text>
                      {item.bandScore > 0 && (
                        <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 11, color: '#c92a2a' }}>
                          Band {item.bandScore}
                        </Text>
                      )}
                    </View>
                  )) : (
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 10 }}>
                      No recent activities found. Start practicing now!
                    </Text>
                  )}
                </View>
              </BrutalistShadow>

              {/* Score Summary Card */}
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

              {/* DEV ONLY BUTTON */}
              <TouchableOpacity 
                style={{
                  backgroundColor: '#ffd54f', borderWidth: 2, borderColor: '#1b263b', 
                  borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20
                }}
                onPress={() => navigation.navigate('StreakTest')}
              >
                <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 13, color: '#c92a2a' }}>
                  🧪 [DEV] TEST STREAK MODE
                </Text>
              </TouchableOpacity>

            </View>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <BrutalistShadow style={styles.settingsCard} offset={4}>
              <View style={styles.settingsCardInner}>
                <Text style={styles.sectionTitle}>Account Details</Text>

                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>HỌ TÊN</Text>
                      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Họ và tên" placeholderTextColor="#999" />
                      {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>EMAIL</Text>
                      <TextInput 
                        style={[styles.input, { backgroundColor: '#e5e7eb', color: '#6b7280' }]} 
                        value={value} 
                        onChangeText={onChange} 
                        keyboardType="email-address" 
                        autoCapitalize="none" 
                        placeholder="Email" 
                        placeholderTextColor="#999" 
                        editable={false}
                      />
                      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                      <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="phone-pad" placeholder="Số điện thoại" placeholderTextColor="#999" />
                      {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                    </View>
                  )}
                />

                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>NGÀY SINH</Text>
                      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Ngày/Tháng/Năm" placeholderTextColor="#999" />
                      {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate.message}</Text>}
                    </View>
                  )}
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)}>
                  <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
                  <Text style={styles.logoutBtnText}>LOG OUT</Text>
                </TouchableOpacity>
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
  },
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
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#1b263b' },
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
  
  plannerCard: { borderRadius: 20, marginBottom: 20 },
  plannerCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  plannerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  plannerItemText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#1b263b',
  },
  plannerItemTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
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
});

export default ProfileScreen;
