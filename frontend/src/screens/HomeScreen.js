import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import client from '../api/client';
import useAuthStore from '../store/useAuthStore';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const ModuleCard = ({ title, tutor, bg, color, onPress, progress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.moduleCardContainer}>
    <BrutalistShadow style={styles.moduleCard} offset={4}>
      <View style={[styles.moduleCardInner, { backgroundColor: bg }]}>
        {/* Red divider margin line */}
        <View style={styles.moduleRedLine} />
        
        <View style={styles.moduleHeader}>
          <Text style={styles.moduleBadge}>MODULE</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={color} />
        </View>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleTutor}>{tutor}</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.progressText}>{progress}% COMPLETE</Text>
        </View>
      </View>
    </BrutalistShadow>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const fetchStats = async () => {
    if (!user) return null;
    try {
      const res = await client.get('/users/me/stats', { hideToast: true });
      if (res.data?.success) {
        const data = res.data.data || res.data.metadata || null;
        setStats(data);
        return data;
      }
    } catch (err) {
      console.log('Error fetching home stats:', err);
    }
    return null;
  };

  useEffect(() => {
    fetchStats().then(data => {
      if (data && data.hasCheckedInToday === false && user) {
        setShowStreakModal(true);
      }
    });
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) {
      Alert.alert('Notice', 'Vui lòng đăng nhập để điểm danh!');
      return navigate('Login');
    }
    
    if (stats?.hasCheckedInToday) {
      Alert.alert('Thành công', `Bạn đã điểm danh hôm nay rồi!\nStreak hiện tại: ${stats.currentStreak} ngày 🔥`);
      return;
    }

    try {
      const res = await client.post('/users/me/checkin');
      if (res.data?.success) {
        setShowStreakModal(false);
        Alert.alert('Điểm danh thành công!', `Streak của bạn đã tăng lên: ${res.data.data.currentStreak} ngày 🔥`);
        fetchStats(); // refresh stats
      }
    } catch (error) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể điểm danh lúc này.');
    }
  };

  const firstName = user?.fullName?.split(' ').slice(-1)[0] || 'Guest';
  const initial   = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  const navigate = (screen, params) => navigation.navigate(screen, params);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* STREAK MODAL */}
      <Modal visible={showStreakModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={styles.modalContent} offset={6}>
            <View style={styles.modalInner}>
              <View style={styles.modalHeaderBox}>
                <Ionicons name="flame" size={50} color="#c92a2a" />
                <Text style={styles.modalTitle}>DAILY CHECK-IN</Text>
              </View>
              
              <Text style={styles.modalSubtitle}>Don't break your streak!</Text>
              <Text style={styles.modalStreakText}>{stats?.currentStreak || 0} Days 🔥</Text>
              <Text style={styles.modalDesc}>Check in today to keep your streak alive and track your consistency.</Text>
              
              <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn}>
                <Text style={styles.checkInBtnText}>CHECK IN NOW</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowStreakModal(false)}>
                <Text style={styles.closeModalText}>LATER</Text>
              </TouchableOpacity>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appBarTitle}>Apex IELTS</Text>
        </View>

        <View style={styles.appBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCheckIn}>
            <Ionicons name="notifications-outline" size={24} color="#1b263b" />
            {!stats?.hasCheckedInToday && <View style={styles.notifDot} />}
          </TouchableOpacity>

          {user ? (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity style={styles.avatar} onPress={openMenu}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: '#fcfbf7', borderRadius: 12, borderWidth: 2, borderColor: '#1b263b' }}
            >
              <Menu.Item onPress={() => { closeMenu(); navigate('Profile'); }} title="Hồ sơ cá nhân" titleStyle={styles.menuItem} />
              <Menu.Item onPress={() => { closeMenu(); navigate('Settings'); }} title="Cài đặt" titleStyle={styles.menuItem} />
              <Divider style={{ backgroundColor: '#1b263b', height: 2 }} />
              <Menu.Item onPress={() => { closeMenu(); logout(); }} title="Đăng xuất" titleStyle={[styles.menuItem, { color: '#c92a2a' }]} />
            </Menu>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigate('Login')}>
              <Text style={styles.loginBtnText}>SIGN IN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1b263b" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Sticky Note Hero Banner */}
        <View style={styles.heroSection}>
          <View style={styles.stickyNote}>
            <View style={styles.tape} />
            <Text style={styles.stickyGreeting}>Hey {firstName} –</Text>
            <Text style={styles.stickyText}>
              Ready to crush your IELTS today? Type sits on the rule, ink lives in the margin.
            </Text>
            <View style={styles.stickyFooter}>
              <Text style={styles.stickyBadge}>IELTS WEEK {stats?.weeksActive ? stats.weeksActive.toString().padStart(2, '0') : '01'}</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={12} color="#c92a2a" />
                <Text style={styles.streakText}>{stats?.currentStreak || 0} Days</Text>
              </View>
            </View>
          </View>
        </View>

        {/* IELTS Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionBadge}>✎ YOUR SHELF</Text>
          <Text style={styles.sectionTitle}>Four modules, one page.</Text>
          
          <View style={styles.grid}>
            <ModuleCard 
              title="AI Speaking" 
              tutor="Whisper & Gemini" 
              bg="#fcfbf7" 
              color="#c92a2a" 
              progress={stats?.speakingBand ? Math.min(100, Math.round((stats.speakingBand / 9) * 100)) : 0}
              onPress={() => navigate(user ? 'Practice' : 'Login', user ? { initialTab: 'SPEAKING' } : undefined)} 
            />
            <ModuleCard 
              title="AI Writing" 
              tutor="Criteria Grader" 
              bg="#fcfbf7" 
              color="#d97706" 
              progress={stats?.writingBand ? Math.min(100, Math.round((stats.writingBand / 9) * 100)) : 0}
              onPress={() => navigate(user ? 'Practice' : 'Login', user ? { initialTab: 'WRITING' } : undefined)} 
            />
            <ModuleCard 
              title="Reading Test" 
              tutor="Cambridge Pool" 
              bg="#fcfbf7" 
              color="#4682b4" 
              progress={stats?.readingBand ? Math.min(100, Math.round((stats.readingBand / 9) * 100)) : 0}
              onPress={() => navigate(user ? 'Practice' : 'Login', user ? { initialTab: 'READING' } : undefined)} 
            />
            <ModuleCard 
              title="Listening Test" 
              tutor="Audio Stream" 
              bg="#fcfbf7" 
              color="#005c42" 
              progress={stats?.listeningBand ? Math.min(100, Math.round((stats.listeningBand / 9) * 100)) : 0}
              onPress={() => navigate(user ? 'Practice' : 'Login', user ? { initialTab: 'LISTENING' } : undefined)} 
            />
          </View>
        </View>

        {/* Score Report Card */}
        <View style={styles.section}>
          <Text style={styles.sectionBadge}>✎ TRACKER</Text>
          <Text style={styles.sectionTitle}>Band score report.</Text>

          <BrutalistShadow style={styles.scoreCard} offset={6}>
            <View style={styles.scoreCardInner}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreTitle}>OVERALL BAND</Text>
                <Text style={styles.scoreDate}>UPDATED TODAY</Text>
              </View>
              
              <View style={styles.scoreMain}>
                <Text style={styles.scoreBig}>{stats?.overallBand ? stats.overallBand.toFixed(1) : '—'}</Text>
                <View style={styles.stampBox}>
                  <Text style={styles.stampText}>{stats?.overallBand >= 8 ? 'A+' : stats?.overallBand >= 7 ? 'A' : stats?.overallBand >= 6 ? 'B' : '?'}</Text>
                </View>
              </View>

              <View style={styles.scoreList}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Reading</Text>
                  <Text style={[styles.scoreItemVal, { color: '#4682b4' }]}>{stats?.readingBand ? stats.readingBand.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Listening</Text>
                  <Text style={[styles.scoreItemVal, { color: '#005c42' }]}>{stats?.listeningBand ? stats.listeningBand.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Writing</Text>
                  <Text style={[styles.scoreItemVal, { color: '#d97706' }]}>{stats?.writingBand ? stats.writingBand.toFixed(1) : '—'}</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreItemLabel}>Speaking</Text>
                  <Text style={[styles.scoreItemVal, { color: '#c92a2a' }]}>{stats?.speakingBand ? stats.speakingBand.toFixed(1) : '—'}</Text>
                </View>
              </View>

            </View>
          </BrutalistShadow>
        </View>

        {/* Admin Quick Access */}
        {user?.role === 'ADMIN' && (
          <TouchableOpacity style={styles.adminBtnContainer} onPress={() => navigate('Admin')} activeOpacity={0.8}>
            <BrutalistShadow style={{ borderRadius: 16 }} offset={4}>
              <View style={styles.adminBtn}>
                <Text style={styles.adminBtnText}>👑 GO TO ADMIN PANEL</Text>
                <Ionicons name="arrow-forward" size={20} color="#1b263b" />
              </View>
            </BrutalistShadow>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  scroll: { flex: 1 },

  // App Bar
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 32, height: 32,
    backgroundColor: '#c92a2a',
    borderWidth: 2, borderColor: '#1b263b',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 18 },
  appBarTitle: { fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { position: 'relative' },
  notifDot: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10,
    borderRadius: 5, backgroundColor: '#c92a2a',
    borderWidth: 2, borderColor: '#fcfbf7',
  },
  avatar: {
    width: 36, height: 36,
    borderRadius: 18, backgroundColor: '#a7f3d0',
    borderWidth: 2, borderColor: '#1b263b',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#005c42' },
  loginBtn: {
    backgroundColor: '#1b263b',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8,
  },
  loginBtnText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 12 },
  menuItem: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' },

  // Hero Section
  heroSection: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  stickyNote: {
    backgroundColor: '#ffd54f',
    width: '90%',
    padding: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1b263b',
    transform: [{ rotate: '2deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tape: {
    position: 'absolute',
    top: -12, left: '50%',
    marginLeft: -40,
    width: 80, height: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1, borderColor: '#ddd',
    transform: [{ rotate: '-3deg' }],
  },
  stickyGreeting: {
    fontFamily: 'Outfit_700Bold', // Handwriting fallback
    fontSize: 24,
    color: '#c92a2a',
    marginBottom: 8,
  },
  stickyText: {
    fontFamily: 'Outfit_700Bold', // Handwriting fallback
    fontSize: 16,
    color: '#1b263b',
    lineHeight: 22,
    marginBottom: 16,
  },
  stickyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,38,59,0.2)',
    paddingTop: 12,
  },
  stickyBadge: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: 'rgba(27,38,59,0.6)',
  },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#1b263b',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontFamily: 'Outfit_900Black', fontSize: 10, color: '#1b263b',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionBadge: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: '#4682b4',
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 24,
    color: '#1b263b',
    marginBottom: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  moduleCard: {
    borderRadius: 16,
  },
  moduleCardInner: {
    padding: 16,
    paddingLeft: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  moduleRedLine: {
    position: 'absolute',
    left: 10, top: 0, bottom: 0,
    width: 2, backgroundColor: 'rgba(224, 86, 91, 0.4)',
  },
  moduleHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  moduleBadge: {
    fontFamily: 'Outfit_900Black', fontSize: 9, color: '#999',
  },
  moduleTitle: {
    fontFamily: 'Outfit_900Black', fontSize: 16, color: '#1b263b',
    lineHeight: 20,
  },
  moduleTutor: {
    fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#666',
    marginTop: 4, marginBottom: 12,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressTrack: {
    height: 6, backgroundColor: '#f5f3dc',
    borderWidth: 1, borderColor: '#1b263b',
    borderRadius: 4, overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontFamily: 'Outfit_900Black', fontSize: 9, color: '#1b263b', textAlign: 'right',
  },

  // Score Card
  scoreCard: { borderRadius: 24 },
  scoreCardInner: {
    backgroundColor: '#fcfbf7',
    padding: 24,
  },
  scoreHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: '#1b263b', paddingBottom: 12, marginBottom: 16,
  },
  scoreTitle: { fontFamily: 'Outfit_900Black', fontSize: 14, color: '#1b263b' },
  scoreDate: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#999' },
  
  scoreMain: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
  },
  scoreBig: {
    fontFamily: 'Outfit_900Black', fontSize: 64, color: '#c92a2a', lineHeight: 70,
  },
  stampBox: {
    borderWidth: 3, borderColor: '#c92a2a',
    borderRadius: 30, width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  stampText: {
    fontFamily: 'Outfit_900Black', fontSize: 24, color: '#c92a2a',
  },

  scoreList: {
    gap: 12,
  },
  scoreItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fefefe', borderWidth: 2, borderColor: '#1b263b',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  scoreItemLabel: { fontFamily: 'Outfit_900Black', fontSize: 14, color: '#1b263b' },
  scoreItemVal: { fontFamily: 'Outfit_900Black', fontSize: 18 },

  // Admin Btn
  adminBtnContainer: {
    marginHorizontal: 20, marginBottom: 20,
  },
  adminBtn: {
    backgroundColor: '#ffd54f',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
  },
  adminBtnText: {
    fontFamily: 'Outfit_900Black', fontSize: 14, color: '#1b263b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 38, 59, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 8,
  },
  modalInner: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
  },
  modalHeaderBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1b263b',
    marginTop: 8,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b263b',
    marginBottom: 8,
  },
  modalStreakText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#c92a2a',
    marginVertical: 16,
  },
  modalDesc: {
    fontSize: 14,
    color: '#1b263b',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  checkInBtn: {
    backgroundColor: '#c92a2a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkInBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeModalBtn: {
    paddingVertical: 8,
  },
  closeModalText: {
    color: '#1b263b',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;
