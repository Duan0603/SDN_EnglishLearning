import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import Toast from 'react-native-toast-message';

import client from '../api/client';
import useAuthStore from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { socket } from '../utils/socket';

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
  const { readNotifIds, loadReadNotifIds, markAsRead, markAllAsRead } = useNotificationStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStreakModal, setShowStreakModal] = useState(false);

  // Notifications Bell dropdown states
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  useEffect(() => {
    setNotifications(prev => 
      prev.map(n => ({
        ...n,
        isRead: readNotifIds.includes(n.id) || n.isRead
      }))
    );
  }, [readNotifIds]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const generateBookingNotifications = (bookingsList, isUserMentor, checkinStats) => {
    const list = [
      {
        id: 'welcome',
        text: 'Chào mừng bạn đến với hệ thống đặt lịch học gia sư SDN!',
        isRead: readNotifIds.includes('welcome') || true,
        createdAt: new Date()
      }
    ];

    // Add check-in status notification
    if (checkinStats) {
      if (checkinStats.hasCheckedInToday) {
        list.push({
          id: 'streak-today',
          text: `Bạn đã điểm danh hôm nay thành công! Chuỗi streak hiện tại: ${checkinStats.currentStreak || 1} ngày 🔥`,
          isRead: readNotifIds.includes('streak-today') || true,
          createdAt: checkinStats.lastCheckIn || new Date()
        });
      } else {
        list.push({
          id: 'streak-missing',
          text: `Bạn chưa điểm danh hôm nay! Bấm vào đây để điểm danh và nhận streak ngay! ⏳`,
          isRead: readNotifIds.includes('streak-missing') || false,
          createdAt: new Date()
        });
      }
    }

    bookingsList.forEach((b) => {
      const dateStr = formatDateTime(b.availability?.startTime);
      const partnerName = isUserMentor ? b.student?.fullName : b.mentor?.fullName;
      
      // Add chat unread notification
      if (b.hasUnreadMessages) {
        const notifId = `chat-unread-${b.id}`;
        list.push({
          id: notifId,
          text: `💬 Bạn có tin nhắn mới từ ${partnerName || 'đối phương'} liên quan đến buổi học ngày ${dateStr}.`,
          isRead: false,
          createdAt: b.updatedAt || b.createdAt || new Date(),
          action: () => navigation.navigate('Mentors')
        });
      }

      if (b.status === 'PENDING') {
        const notifId = `pending-${b.id}`;
        list.push({
          id: notifId,
          text: isUserMentor 
            ? `Học viên ${partnerName || 'học viên'} đã đặt lịch hẹn ngày ${dateStr} đang chờ bạn duyệt.`
            : `Yêu cầu đặt lịch học ngày ${dateStr} với gia sư ${partnerName || 'gia sư'} đang chờ duyệt.`,
          isRead: readNotifIds.includes(notifId) || false,
          createdAt: b.updatedAt || b.createdAt || new Date()
        });
      } else if (b.status === 'CONFIRMED') {
        const notifId = `confirmed-${b.id}`;
        list.push({
          id: notifId,
          text: isUserMentor
            ? `Bạn đã duyệt thành công lịch dạy với học viên ${partnerName || 'học viên'} ngày ${dateStr}.`
            : `Lịch học ngày ${dateStr} với gia sư ${partnerName || 'gia sư'} đã được PHÊ DUYỆT thành công! 🎉`,
          isRead: readNotifIds.includes(notifId) || true,
          createdAt: b.updatedAt || b.createdAt || new Date()
        });
      } else if (b.status === 'CANCELLED') {
        const reasonText = b.cancelReason ? ` (Lý do: "${b.cancelReason}")` : '';
        const notifId = `cancelled-${b.id}`;
        list.push({
          id: notifId,
          text: isUserMentor
            ? `Lịch dạy với học viên ${partnerName || 'học viên'} ngày ${dateStr} đã bị hủy${reasonText}.`
            : `Lịch học ngày ${dateStr} với gia sư ${partnerName || 'gia sư'} đã bị HỦY${reasonText}. ⚠️`,
          isRead: readNotifIds.includes(notifId) || true,
          createdAt: b.updatedAt || b.createdAt || new Date()
        });
      } else if (b.status === 'COMPLETED') {
        const notifId = `completed-${b.id}`;
        list.push({
          id: notifId,
          text: isUserMentor
            ? `Bạn đã hoàn thành lịch dạy với học viên ${partnerName || 'học viên'} ngày ${dateStr}.`
            : `Lịch học ngày ${dateStr} với gia sư ${partnerName || 'gia sư'} đã hoàn thành. Hãy gửi đánh giá nhé! 🌟`,
          isRead: readNotifIds.includes(notifId) || (isUserMentor ? true : (b.rating ? true : false)),
          createdAt: b.updatedAt || b.createdAt || new Date()
        });
      }
    });
    
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const fetchNotifications = async (currentStats) => {
    if (!user) return;
    try {
      const statsObj = currentStats || stats;
      const isMentor = user.role === 'MENTOR';
      if (isMentor) {
        const res = await client.get('/mentors/availabilities', { hideToast: true });
        const slots = res.data?.data || [];
        const mentorBookings = slots
          .filter(s => s.booking)
          .map(s => ({
            ...s.booking,
            availability: { startTime: s.startTime, endTime: s.endTime },
            mentor: { fullName: user.fullName }
          }));
        const list = generateBookingNotifications(mentorBookings, true, statsObj);
        setNotifications(list.map(n => ({ ...n, isRead: readNotifIds.includes(n.id) || n.isRead })));
      } else {
        const res = await client.get('/bookings', { hideToast: true });
        const bookingsList = res.data?.data || [];
        const list = generateBookingNotifications(bookingsList, false, statsObj);
        setNotifications(list.map(n => ({ ...n, isRead: readNotifIds.includes(n.id) || n.isRead })));
      }
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  const fetchStats = async () => {
    if (!user) return null;
    try {
      const res = await client.get('/users/me/stats', { hideToast: true });
      if (res.data?.success) {
        const data = res.data.data || res.data.metadata || null;
        setStats(data);
        fetchNotifications(data);
        return data;
      }
    } catch (err) {
      console.log('Error fetching home stats:', err);
    }
    return null;
  };

  useEffect(() => {
    loadReadNotifIds();
    fetchStats().then(data => {
      if (data && data.hasCheckedInToday === false && user) {
        setShowStreakModal(true);
      }
    });
    fetchNotifications();
  }, [user]);

  // Connect socket and listen for real-time booking updates
  useEffect(() => {
    if (user) {
      if (!socket.connected) {
        socket.connect();
      }

      const handleBookingUpdate = (data) => {
        console.log('[Socket] Received booking:update event on HomeScreen:', data);
        const { studentId, mentorId } = data;

        // If the update belongs to the current logged-in user (student or mentor)
        const currentUserId = user?._id || user?.id;
        if (currentUserId === studentId || currentUserId === mentorId) {
          fetchStats(); // This calls fetchNotifications under the hood, updating the bell!
        }
      };

      socket.on('booking:update', handleBookingUpdate);

      return () => {
        socket.off('booking:update', handleBookingUpdate);
      };
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchNotifications();
    setRefreshing(false);
  }, [user]);

  const handleCheckIn = async () => {
    if (!user) {
      Toast.show({ type: 'info', text1: 'Thông báo', text2: 'Vui lòng đăng nhập để điểm danh!' });
      return navigate('Login');
    }
    
    if (stats?.hasCheckedInToday) {
      Toast.show({ type: 'info', text1: 'Thông báo', text2: `Bạn đã điểm danh hôm nay rồi!\nStreak hiện tại: ${stats.currentStreak} ngày 🔥` });
      return;
    }

    try {
      const res = await client.post('/users/me/checkin');
      if (res.data?.success) {
        // Optimistic UI Update
        setStats(prev => ({
          ...prev,
          currentStreak: res.data.data.currentStreak,
          hasCheckedInToday: true
        }));
        
        Toast.show({ type: 'success', text1: 'Thành công', text2: `Streak của bạn đã tăng lên: ${res.data.data.currentStreak} ngày 🔥` });
        fetchStats(); // Background refresh
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: error?.response?.data?.message || 'Không thể điểm danh lúc này.' });
    }
  };

  const firstName = user?.fullName?.split(' ').slice(-1)[0] || 'Guest';
  const initial   = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  const navigate = (screen, params) => navigation.navigate(screen, params);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* STREAK MODAL */}
      <Modal visible={showStreakModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(251, 246, 236, 0.9)', justifyContent: 'center', alignItems: 'center' }}>
          
          {(() => {
            const currentStreak = stats?.currentStreak || 0;
            const checkedIn = stats?.hasCheckedInToday || false;
            
            const getStreakTier = (streak) => {
              if (streak >= 100) return { name: 'Cầu vồng', color: '#ec4899', bg: '#fce7f3' };
              if (streak >= 60) return { name: 'Lửa tím', color: '#a855f7', bg: '#f3e8ff' };
              if (streak >= 30) return { name: 'Lửa xanh', color: '#3b82f6', bg: '#dbeafe' };
              if (streak >= 14) return { name: 'Lửa vàng', color: '#eab308', bg: '#fef08a' };
              if (streak >= 7) return { name: 'Lửa cam', color: '#f97316', bg: '#ffedd5' };
              return { name: 'Tia lửa', color: '#ef4444', bg: '#fee2e2' };
            };
            
            const getNextMilestone = (streak) => {
              if (streak < 7) return 7;
              if (streak < 14) return 14;
              if (streak < 30) return 30;
              if (streak < 60) return 60;
              if (streak < 100) return 100;
              return 100;
            };

            const tier = getStreakTier(currentStreak);
            const nextMilestone = getNextMilestone(currentStreak);
            const nextTier = getStreakTier(nextMilestone);
            
            // Progress Calculation
            let progressMin = 0;
            if (currentStreak >= 60) progressMin = 60;
            else if (currentStreak >= 30) progressMin = 30;
            else if (currentStreak >= 14) progressMin = 14;
            else if (currentStreak >= 7) progressMin = 7;
            
            const range = nextMilestone - progressMin;
            const progress = currentStreak - progressMin;
            const progressPercent = range > 0 ? (progress / range) * 100 : 100;

            const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
            // Mocking week logic: highlight last N days up to current day.
            const todayIdx = (new Date().getDay() + 6) % 7; 

            return (
              <View style={{
                backgroundColor: '#fff',
                width: '85%',
                maxWidth: 380,
                borderRadius: 28,
                padding: 24,
                alignItems: 'center',
                shadowColor: '#1b263b',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 10,
              }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="flame" size={16} color={tier.color} />
                  <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 16, color: '#1b263b', marginLeft: 6 }}>Chuỗi ngày học</Text>
                </View>
                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#666', marginBottom: 20 }}>
                  {checkedIn ? "Quay lại vào ngày mai để giữ lửa nhé!" : "Điểm danh mỗi ngày để giữ lửa"}
                </Text>

                {/* Big Flame Area */}
                <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                  <View style={{
                    position: 'absolute',
                    width: 100, height: 100,
                    borderRadius: 50,
                    backgroundColor: tier.color,
                    opacity: 0.15,
                    transform: [{ scale: 1.2 }]
                  }} />
                  <Ionicons name="flame" size={80} color={tier.color} />
                </View>

                <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 48, color: '#1b263b', lineHeight: 56, marginTop: 10 }}>
                  {currentStreak}
                </Text>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#666', letterSpacing: 1, marginBottom: 10 }}>
                  NGÀY LIÊN TIẾP
                </Text>

                <View style={{ backgroundColor: tier.color, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 30 }}>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#fff' }}>{tier.name}</Text>
                </View>

                {/* 7 Days */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10, marginBottom: 20 }}>
                  {daysOfWeek.map((day, idx) => {
                    // Logic: is it checked in? We mock it based on current streak.
                    // If streak >= (todayIdx - idx + 1), it is checked.
                    const daysAgo = todayIdx - idx;
                    const isChecked = daysAgo >= 0 && currentStreak > daysAgo && (daysAgo > 0 || checkedIn);
                    const isToday = idx === todayIdx;

                    return (
                      <View key={day} style={{ alignItems: 'center' }}>
                        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#999', marginBottom: 6 }}>{day}</Text>
                        <View style={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: isChecked ? tier.color : '#f3f4f6',
                          borderWidth: isToday ? 2 : 0,
                          borderColor: isToday ? tier.color : 'transparent',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          {isChecked && <Ionicons name="flame" size={14} color="#fff" />}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Progress */}
                <View style={{ width: '100%', marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: '#666' }}>{currentStreak}/{nextMilestone} ngày</Text>
                    {currentStreak < 100 && (
                      <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: '#666' }}>→ {nextTier.name}</Text>
                    )}
                  </View>
                  <View style={{ height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: tier.color, borderRadius: 3 }} />
                  </View>
                </View>

                {/* CTA */}
                <TouchableOpacity 
                  disabled={checkedIn}
                  onPress={async () => {
                    await handleCheckIn();
                    // State will update, changing UI immediately.
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: checkedIn ? '#e5e7eb' : tier.color,
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    marginBottom: 16
                  }}
                >
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: checkedIn ? '#9ca3af' : '#fff' }}>
                    {checkedIn ? "✓ Đã điểm danh hôm nay" : "Điểm danh hôm nay"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowStreakModal(false)}>
                  <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#9ca3af', textDecorationLine: 'underline' }}>
                    Đóng
                  </Text>
                </TouchableOpacity>

              </View>
            );
          })()}
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
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => {
              fetchNotifications();
              setShowNotificationsDropdown(!showNotificationsDropdown);
              if (!showNotificationsDropdown) {
                const ids = notifications.map(n => n.id);
                markAllAsRead(ids);
              }
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="#1b263b" />
            {notifications.some(n => !n.isRead) && <View style={styles.notifDot} />}
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity style={styles.avatar} onPress={openMenu}>
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigate('Login')}>
              <Text style={styles.loginBtnText}>SIGN IN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications Dropdown Modal */}
      <Modal 
        visible={showNotificationsDropdown} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setShowNotificationsDropdown(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setShowNotificationsDropdown(false)}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        >
          <View style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: 320,
            backgroundColor: '#fcfbf7',
            borderWidth: 2,
            borderColor: '#1b263b',
            borderRadius: 12,
            padding: 16,
            shadowColor: '#1b263b',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 2, borderBottomColor: '#1b263b', paddingBottom: 8 }}>
              <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 13, color: '#1b263b' }}>
                NOTIFICATIONS
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  const ids = notifications.map(n => n.id);
                  markAllAsRead(ids);
                }}
              >
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#4682b4' }}>
                  Mark all as read
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#999', textAlign: 'center', paddingVertical: 16 }}>
                  Không có thông báo nào.
                </Text>
              ) : (
                notifications.map(n => (
                  <TouchableOpacity 
                    key={n.id}
                    onPress={() => {
                      setShowNotificationsDropdown(false);
                      markAsRead(n.id);
                      if (n.id === 'streak-missing') {
                        handleCheckIn();
                      } else if (n.action) {
                        n.action();
                      }
                    }}
                    style={{
                      backgroundColor: n.isRead ? '#fcfbf7' : '#fffebc',
                      padding: 10,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: '#1b263b',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#1b263b', lineHeight: 15 }}>
                      {n.text}
                    </Text>
                    <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 8, color: '#999', marginTop: 4 }}>
                      {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            <TouchableOpacity 
              onPress={() => setShowNotificationsDropdown(false)}
              style={{
                backgroundColor: '#ffd54f',
                borderWidth: 2,
                borderColor: '#1b263b',
                borderRadius: 8,
                paddingVertical: 8,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 10, color: '#1b263b' }}>
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Dropdown Modal */}
      <Modal 
        visible={menuVisible} 
        transparent={true} 
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={closeMenu}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        >
          <View style={{
            position: 'absolute',
            top: 70,
            right: 20,
            width: 200,
            backgroundColor: '#fcfbf7',
            borderWidth: 2,
            borderColor: '#1b263b',
            borderRadius: 12,
            padding: 8,
            shadowColor: '#1b263b',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 8
          }}>
            <TouchableOpacity 
              onPress={() => { closeMenu(); navigate('Profile'); }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' }}>Hồ sơ cá nhân</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => { closeMenu(); navigate('Settings'); }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' }}>Cài đặt</Text>
            </TouchableOpacity>

            <View style={{ height: 2, backgroundColor: '#1b263b', marginHorizontal: 8, marginVertical: 4 }} />

            <TouchableOpacity 
              onPress={() => { closeMenu(); navigate('StreakTestScreen'); }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 14, color: '#ff9800' }}>🔥 Test Streak</Text>
            </TouchableOpacity>

            <View style={{ height: 2, backgroundColor: '#1b263b', marginHorizontal: 8, marginVertical: 4 }} />

            <TouchableOpacity 
              onPress={() => { closeMenu(); logout(); }}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#c92a2a' }}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
