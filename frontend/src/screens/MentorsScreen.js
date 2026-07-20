import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import client from '../api/client';
import useAuthStore from '../store/useAuthStore';
import { socket } from '../utils/socket';
import { useNotificationStore } from '../store/useNotificationStore';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const BrutalistSelect = ({ label, value, options, onValueChange }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, marginRight: 6 }}>
        <Text style={styles.inputLabel}>{label}</Text>
        {React.createElement('select', {
          value: value,
          onChange: (e) => onValueChange(e.target.value),
          style: {
            backgroundColor: '#fff',
            border: '2px solid #1b263b',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '14px',
            fontFamily: 'Outfit_700Bold, sans-serif',
            color: '#1b263b',
            width: '100%',
            outline: 'none',
            cursor: 'pointer',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }
        }, options.map(opt => 
          React.createElement('option', { key: opt, value: opt }, opt)
        ))}
      </View>
    );
  } else {
    return (
      <View style={{ flex: 1, marginRight: 6 }}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              `Select ${label}`,
              '',
              options.map(opt => ({
                text: opt,
                onPress: () => onValueChange(opt)
              })),
              { cancelable: true }
            );
          }}
          style={[styles.input, { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }]}
        >
          <Text style={{ fontFamily: 'Outfit_700Bold', color: '#1b263b', fontSize: 13 }}>
            {value}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const MentorsScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const isMentor = user?.role === 'MENTOR';
  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const navigate = (screen, params) => navigation.navigate(screen, params);

  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);

  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // States for Student view tabs
  const [activeStudentTab, setActiveStudentTab] = useState('directory'); // 'directory' or 'my_bookings'
  const [myBookings, setMyBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // States for Mentor Create Slot
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [startPeriod, setStartPeriod] = useState('AM');
  const [endPeriod, setEndPeriod] = useState('AM');
  const [slotMeetingLink, setSlotMeetingLink] = useState('https://meet.google.com/');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  // States for Mentor View Slot Detail & Notes
  const [showSlotDetailModal, setShowSlotDetailModal] = useState(false);
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState(null);
  const [mentorNotesEdit, setMentorNotesEdit] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // States for cancellation reasons
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showCancelReasonForm, setShowCancelReasonForm] = useState(false);

  // States for student rating / comment
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // States and Ref for Custom Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const confirmCallbackRef = useRef(null);

  // States for Chat Real-time
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const chatFlatListRef = useRef(null);

  // States for Notifications Bell dropdown & Streak Stats
  const { readNotifIds, loadReadNotifIds, markAsRead, markAllAsRead } = useNotificationStore();
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setNotifications(prev => 
      prev.map(n => ({
        ...n,
        isRead: readNotifIds.includes(n.id) || n.isRead
      }))
    );
  }, [readNotifIds]);

  const fetchStats = async () => {
    try {
      const res = await client.get('/users/me/stats', { hideToast: true });
      if (res.data?.success) {
        const data = res.data.data || res.data.metadata || null;
        setStats(data);
        fetchNotifications(data);
        return data;
      }
    } catch (err) {
      console.log('Error fetching stats in MentorsScreen:', err);
    }
    return null;
  };

  const handleCheckIn = async () => {
    try {
      const res = await client.post('/users/me/checkin');
      if (res.data?.success) {
        setSuccessMessage(`Điểm danh thành công! Streak của bạn đã tăng lên: ${res.data.data.currentStreak} ngày 🔥`);
        fetchStats();
      }
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Không thể điểm danh lúc này.');
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
    const statsObj = checkinStats || stats;
    if (statsObj) {
      if (statsObj.hasCheckedInToday) {
        list.push({
          id: 'streak-today',
          text: `Bạn đã điểm danh hôm nay thành công! Chuỗi streak hiện tại: ${statsObj.currentStreak || 1} ngày 🔥`,
          isRead: readNotifIds.includes('streak-today') || true,
          createdAt: statsObj.lastCheckIn || new Date()
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
          action: () => handleOpenChat(b)
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
    try {
      const statsObj = currentStats || stats;
      if (isMentor) {
        const res = await client.get('/mentors/availabilities', { hideToast: true });
        const slotsList = res.data?.data || [];
        const mentorBookings = slotsList
          .filter(s => s.booking)
          .map(s => ({
            ...s.booking,
            availability: { startTime: s.startTime, endTime: s.endTime },
            mentor: { fullName: user?.fullName }
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

  const showCustomConfirm = (title, message, onConfirm) => {
    setConfirmModalTitle(title);
    setConfirmModalMessage(message);
    confirmCallbackRef.current = onConfirm;
    setShowConfirmModal(true);
  };

  const handleExecuteConfirm = () => {
    setShowConfirmModal(false);
    if (confirmCallbackRef.current) {
      confirmCallbackRef.current();
    }
  };

  const fetchMentors = useCallback(async () => {
    setIsLoadingMentors(true);
    try {
      const response = await client.get('/mentors');
      setMentors(response.data.data || []);
    } catch (error) {
      console.log('Error fetching mentors:', error);
      setMentors([]);
    } finally {
      setIsLoadingMentors(false);
    }
  }, []);

  const fetchMySlots = useCallback(async () => {
    setIsLoadingSlots(true);
    try {
      const response = await client.get('/mentors/availabilities');
      setSlots(response.data.data || []);
    } catch (error) {
      console.log('Error fetching my slots:', error);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const response = await client.get('/bookings');
      setMyBookings(response.data.data || []);
    } catch (error) {
      console.log('Error fetching my bookings:', error);
      setMyBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Connect socket and register listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('slot:update', (data) => {
      console.log('[Socket] Received slot:update event:', data);
      const { slotId, isBooked } = data;
      setSlots((prevSlots) =>
        prevSlots.map((s) => (s.id === slotId ? { ...s, isBooked } : s))
      );
      
      // Push real-time notification
      setNotifications(prev => [
        {
          id: String(Date.now()),
          text: `Trạng thái khung giờ học của gia sư vừa được cập nhật hệ thống.`,
          isRead: false,
          createdAt: new Date()
        },
        ...prev
      ]);

      // Re-fetch bookings if student is viewing their tab
      if (!isMentor && activeStudentTab === 'my_bookings') {
        fetchMyBookings();
      }
    });

    const handleBookingUpdate = (data) => {
      console.log('[Socket] Received booking:update event on MentorsScreen:', data);
      const { studentId, mentorId } = data;

      // If the update belongs to the current logged-in user (student or mentor)
      const currentUserId = user?._id || user?.id;
      if (user && (currentUserId === studentId || currentUserId === mentorId)) {
        fetchStats(); // This calls fetchNotifications under the hood, updating the bell!
        
        if (isMentor) {
          fetchMySlots();
        } else {
          fetchMyBookings();
        }
      }
    };

    socket.on('booking:update', handleBookingUpdate);

    return () => {
      socket.off('slot:update');
      socket.off('booking:update', handleBookingUpdate);
    };
  }, [isMentor, activeStudentTab, fetchMyBookings, user]);

  // Listen for real-time chat messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      console.log('[Socket] Received chat:receive_message event:', message);
      if (selectedBookingForChat && message.bookingId === selectedBookingForChat.id) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on('chat:receive_message', handleReceiveMessage);

    return () => {
      socket.off('chat:receive_message', handleReceiveMessage);
    };
  }, [selectedBookingForChat]);

  // Scroll to bottom of chat list when messages change
  useEffect(() => {
    if (chatMessages.length > 0 && chatFlatListRef.current) {
      setTimeout(() => {
        chatFlatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  // Fetch initial directory data & notifications & stats
  useEffect(() => {
    loadReadNotifIds();
    if (isMentor) {
      fetchMySlots();
    } else {
      fetchMentors();
    }
    fetchStats();
  }, [isMentor, fetchMentors, fetchMySlots]);

  // Fetch bookings when switching tabs & reload notifications & stats
  useEffect(() => {
    if (!isMentor && activeStudentTab === 'my_bookings') {
      fetchMyBookings();
    }
    fetchStats();
  }, [isMentor, activeStudentTab, fetchMyBookings]);

  const fetchMentorSlots = async (mentorId) => {
    setIsLoadingSlots(true);
    try {
      const response = await client.get(`/mentors/${mentorId}/availabilities`);
      setSlots(response.data.data || []);
    } catch (error) {
      console.log('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleOpenMentorDetail = (mentor) => {
    setSelectedMentor(mentor);
    fetchMentorSlots(mentor.id);
    setShowMentorModal(true);
  };

  const handleOpenBookingModal = (slot) => {
    setSelectedSlotForBooking(slot);
    setBookingNotes('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlotForBooking) return;
    setIsSubmittingBooking(true);
    try {
      await client.post('/bookings', {
        availabilityId: selectedSlotForBooking.id,
        notes: bookingNotes,
      });

      setNotifications(prev => [
        {
          id: String(Date.now()),
          text: `Bạn đã gửi yêu cầu đăng ký lịch học thành công. Đang chờ gia sư duyệt.`,
          isRead: false,
          createdAt: new Date()
        },
        ...prev
      ]);

      setSuccessMessage('Đăng ký lịch thành công! Vui lòng chờ gia sư phê duyệt.');
      setShowBookingModal(false);
      if (selectedMentor) fetchMentorSlots(selectedMentor.id);
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Failed to book session. Please try again.');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    showCustomConfirm(
      'Hủy đặt lịch',
      'Bạn có chắc chắn muốn hủy lịch học này?',
      async () => {
        try {
          await client.patch(`/bookings/${bookingId}/cancel`);
          
          setNotifications(prev => [
            {
              id: String(Date.now()),
              text: `Bạn đã hủy đặt lịch học thành công. Lịch rảnh đã được giải phóng.`,
              isRead: false,
              createdAt: new Date()
            },
            ...prev
          ]);

          setSuccessMessage('Hủy đặt lịch học thành công!');
          fetchMyBookings();
          if (selectedMentor) fetchMentorSlots(selectedMentor.id);
        } catch (err) {
          console.error('Cancel booking error:', err);
          if (err.response?.data?.message) {
            setErrorMessage(err.response.data.message);
          } else {
            setErrorMessage('Không thể hủy đặt lịch.');
          }
        }
      }
    );
  };

  // Mentor slot actions
  const handleOpenCreateSlot = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setSlotDate(`${year}-${month}-${day}`);
    setSlotStartTime('09:00');
    setSlotEndTime('10:00');
    setStartPeriod('AM');
    setEndPeriod('AM');
    setSlotMeetingLink('https://meet.google.com/');
    setShowCreateSlotModal(true);
  };

  const convertTo24h = (timeStr, period) => {
    const parts = timeStr.split(':');
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    if (period === 'PM' && hour < 12) {
      hour += 12;
    }
    if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    return `${String(hour).padStart(2, '0')}:${minute}`;
  };

  const handleConfirmCreateSlot = async () => {
    if (!slotDate || !slotStartTime || !slotEndTime) {
      setErrorMessage('Vui lòng nhập đầy đủ Ngày, Giờ bắt đầu và Giờ kết thúc.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(slotDate)) {
      setErrorMessage('Ngày không đúng định dạng YYYY-MM-DD.');
      return;
    }
    if (!timeRegex.test(slotStartTime) || !timeRegex.test(slotEndTime)) {
      setErrorMessage('Giờ không đúng định dạng HH:MM.');
      return;
    }

    const computedStartTime = convertTo24h(slotStartTime, startPeriod);
    const computedEndTime = convertTo24h(slotEndTime, endPeriod);

    setIsSubmittingSlot(true);
    try {
      const startDateTime = new Date(`${slotDate}T${computedStartTime}:00`);
      const endDateTime = new Date(`${slotDate}T${computedEndTime}:00`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        setErrorMessage('Ngày hoặc giờ không hợp lệ.');
        setIsSubmittingSlot(false);
        return;
      }

      if (startDateTime <= new Date()) {
        setErrorMessage('Giờ bắt đầu phải ở tương lai.');
        setIsSubmittingSlot(false);
        return;
      }

      if (endDateTime <= startDateTime) {
        setErrorMessage('Giờ kết thúc phải sau giờ bắt đầu.');
        setIsSubmittingSlot(false);
        return;
      }

      await client.post('/mentors/availabilities', {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingLink: slotMeetingLink || undefined,
      });

      setSuccessMessage('Tạo khung giờ rảnh thành công!');
      setShowCreateSlotModal(false);
      fetchMySlots();
    } catch (err) {
      console.error('Create slot error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Không thể tạo khung giờ rảnh. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    showCustomConfirm(
      'Xóa khung giờ',
      'Bạn có chắc chắn muốn xóa khung giờ rảnh này?',
      async () => {
        try {
          await client.delete(`/mentors/availabilities/${slotId}`);
          setSuccessMessage('Xóa khung giờ rảnh thành công!');
          fetchMySlots();
        } catch (err) {
          console.error('Delete slot error:', err);
          if (err.response?.data?.message) {
            setErrorMessage(err.response.data.message);
          } else {
            setErrorMessage('Không thể xóa khung giờ rảnh.');
          }
        }
      }
    );
  };

  const handleOpenSlotDetail = (slot) => {
    setSelectedSlotForDetail(slot);
    setMentorNotesEdit(slot.booking?.mentorNotes || '');
    setCancelReasonInput('');
    setShowCancelReasonForm(false);
    setShowSlotDetailModal(true);
  };

  const handleAcceptBooking = async (bookingId) => {
    setIsAccepting(true);
    try {
      await client.patch(`/bookings/${bookingId}/accept`);
      
      setNotifications(prev => [
        {
          id: String(Date.now()),
          text: `Bạn đã phê duyệt thành công yêu cầu đặt lịch hẹn học của học viên.`,
          isRead: false,
          createdAt: new Date()
        },
        ...prev
      ]);

      setSuccessMessage('Duyệt lịch đặt hẹn của học viên thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err) {
      console.error('Accept booking error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Phê duyệt lịch đặt thất bại.');
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    setIsCompleting(true);
    try {
      await client.patch(`/bookings/${bookingId}/complete`);
      
      setNotifications(prev => [
        {
          id: String(Date.now()),
          text: `Bạn đã đánh dấu HOÀN THÀNH lớp học thành công.`,
          isRead: false,
          createdAt: new Date()
        },
        ...prev
      ]);

      setSuccessMessage('Hoàn thành buổi học thành công! Bạn hiện đã có quyền nhận xét học viên.');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err) {
      console.error('Complete booking error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Đánh dấu hoàn thành lịch học thất bại.');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelBookingByMentor = async (bookingId) => {
    showCustomConfirm(
      'Hủy lịch học',
      'Bạn có chắc chắn muốn hủy lịch hẹn học này?',
      async () => {
        try {
          await client.patch(`/bookings/${bookingId}/cancel`);
          
          setNotifications(prev => [
            {
              id: String(Date.now()),
              text: `Bạn đã từ chối/hủy lịch hẹn học chờ duyệt của học viên thành công.`,
              isRead: false,
              createdAt: new Date()
            },
            ...prev
          ]);

          setSuccessMessage('Hủy lịch hẹn thành công!');
          setShowSlotDetailModal(false);
          fetchMySlots();
        } catch (err) {
          console.error('Cancel booking by mentor error:', err);
          if (err.response?.data?.message) {
            setErrorMessage(err.response.data.message);
          } else {
            setErrorMessage('Không thể hủy lịch học.');
          }
        }
      }
    );
  };

  const handleConfirmCancelBookingWithReason = async () => {
    if (!selectedSlotForDetail || !selectedSlotForDetail.booking) return;
    if (!cancelReasonInput.trim()) {
      setErrorMessage('Vui lòng nhập lý do hủy lịch.');
      return;
    }
    
    try {
      await client.patch(`/bookings/${selectedSlotForDetail.booking.id}/cancel`, {
        cancelReason: cancelReasonInput.trim()
      });

      setNotifications(prev => [
        {
          id: String(Date.now()),
          text: `Bạn đã hủy lịch học đã duyệt thành công. Lý do: "${cancelReasonInput.trim()}"`,
          isRead: false,
          createdAt: new Date()
        },
        ...prev
      ]);

      setSuccessMessage('Hủy lịch hẹn thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err) {
      console.error('Cancel booking with reason error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Không thể hủy lịch học.');
      }
    }
  };

  const handleSaveMentorNotes = async () => {
    if (!selectedSlotForDetail || !selectedSlotForDetail.booking) return;
    setIsSavingNotes(true);
    try {
      await client.patch(`/bookings/${selectedSlotForDetail.booking.id}/notes`, {
        mentorNotes: mentorNotesEdit,
      });
      setSuccessMessage('Lưu nhận xét thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err) {
      console.error('Save notes error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Không thể lưu nhận xét. Vui lòng thử lại.');
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleOpenRatingModal = (booking) => {
    setSelectedBookingForRating(booking);
    setRatingValue(5);
    setCommentInput('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedBookingForRating) return;
    setIsSubmittingRating(true);
    try {
      await client.patch(`/bookings/${selectedBookingForRating.id}/rate`, {
        rating: ratingValue,
        comment: commentInput.trim(),
      });
      setSuccessMessage('Đánh giá buổi học thành công! Cảm ơn ý kiến đóng góp của bạn. ❤️');
      setShowRatingModal(false);
      fetchMyBookings();
    } catch (err) {
      console.error('Submit rating error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Không thể gửi đánh giá. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenChat = async (booking) => {
    setSelectedBookingForChat(booking);
    setChatMessages([]);
    setChatInput('');
    setShowChatModal(true);
    setIsLoadingChatHistory(true);

    try {
      const res = await client.get(`/bookings/${booking.id}/messages`);
      if (res.data?.success) {
        setChatMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setErrorMessage('Không thể tải lịch sử chat.');
    } finally {
      setIsLoadingChatHistory(false);
    }

    socket.emit('chat:join_room', { bookingId: booking.id });
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim() || !selectedBookingForChat) return;
    const messageContent = chatInput.trim();
    setChatInput('');

    socket.emit('chat:send_message', {
      bookingId: selectedBookingForChat.id,
      senderId: user._id || user.id,
      content: messageContent
    });
  };

  const convertUriToBase64 = async (uri, mimeType) => {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType?.Base64 || 'base64',
      });
      return `data:${mimeType || 'application/octet-stream'};base64,${base64}`;
    }
  };

  const handlePickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Alert.alert('Lỗi', 'Tệp tin vượt quá dung lượng giới hạn 5MB.');
        return;
      }

      setIsSendingChatMessage(true);
      const base64Data = await convertUriToBase64(asset.uri, asset.mimeType);

      const res = await client.post(`/bookings/${selectedBookingForChat.id}/upload-file`, {
        file: base64Data,
        fileName: asset.name,
        fileSize: asset.size || 0
      });

      if (res.data?.success) {
        const newMsg = res.data.data;
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }
    } catch (err) {
      console.error('File pick/upload error:', err);
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể gửi tệp tin.');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  const filteredMentors = mentors.filter((m) =>
    m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.expertise?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* Header */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>
          {isMentor ? 'LỊCH RẢNH CỦA TÔI' : 'DANH SÁCH GIA SƯ'}
        </Text>
        
        {/* Notifications Bell and User Profile Avatar */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Bell Icon with Red Dot */}
          <TouchableOpacity 
            onPress={() => {
              fetchNotifications();
              setShowNotificationsDropdown(!showNotificationsDropdown);
              if (!showNotificationsDropdown) {
                const ids = notifications.map(n => n.id);
                markAllAsRead(ids);
              }
            }}
            style={{ position: 'relative', marginRight: 14, padding: 4 }}
          >
            <Ionicons name="notifications-outline" size={24} color="#1b263b" />
            {notifications.some(n => !n.isRead) && (
              <View style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#c92a2a',
                borderWidth: 1.5,
                borderColor: '#fcfbf7'
              }} />
            )}
          </TouchableOpacity>

          {/* User Profile Avatar */}
          {user ? (
            <TouchableOpacity 
              onPress={openMenu}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#a7f3d0',
                borderWidth: 2,
                borderColor: '#1b263b',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontFamily: 'Outfit_900Black',
                fontSize: 14,
                color: '#005c42'
              }}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={{
                backgroundColor: '#1b263b',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }} 
              onPress={() => navigate('Login')}
            >
              <Text style={{ color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 10 }}>SIGN IN</Text>
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

      {/* Student Sub Tabs */}
      {!isMentor && (
        <View style={{ flexDirection: 'row', backgroundColor: '#fcfbf7', borderBottomWidth: 2, borderBottomColor: '#1b263b' }}>
          <TouchableOpacity 
            onPress={() => setActiveStudentTab('directory')}
            style={{ 
              flex: 1, 
              paddingVertical: 14, 
              alignItems: 'center', 
              borderRightWidth: 2, 
              borderRightColor: '#1b263b',
              backgroundColor: activeStudentTab === 'directory' ? '#ffd54f' : '#fcfbf7'
            }}
          >
            <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' }}>
              DANH SÁCH GIA SƯ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveStudentTab('my_bookings')}
            style={{ 
              flex: 1, 
              paddingVertical: 14, 
              alignItems: 'center',
              backgroundColor: activeStudentTab === 'my_bookings' ? '#ffd54f' : '#fcfbf7'
            }}
          >
            <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' }}>
              LỊCH HỌC CỦA TÔI
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Input (Students directory only) */}
      {!isMentor && activeStudentTab === 'directory' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={20} color="#1b263b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or expertise..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </View>
      )}

      {/* Mentors list / My slots list / My Bookings (Student) */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isMentor ? (
          // MENTOR VIEW
          <View>
            {/* Create Slot Button */}
            <TouchableOpacity onPress={handleOpenCreateSlot} activeOpacity={0.9} style={{ marginBottom: 20 }}>
              <BrutalistShadow style={{ borderRadius: 12, backgroundColor: '#ffd54f' }} offset={4}>
                <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add-circle-outline" size={24} color="#1b263b" style={{ marginRight: 8 }} />
                  <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 14, color: '#1b263b' }}>
                    THÊM KHUNG GIỜ RẢNH MỚI
                  </Text>
                </View>
              </BrutalistShadow>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>DANH SÁCH KHUNG GIỜ RẢNH</Text>

            {isLoadingSlots ? (
              <ActivityIndicator size="large" color="#1b263b" style={{ marginTop: 40 }} />
            ) : slots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>📅</Text>
                <Text style={styles.emptyText}>Chưa có khung giờ rảnh nào được tạo.</Text>
              </View>
            ) : (
              slots.map((slot) => {
                const CardComponent = slot.isBooked ? TouchableOpacity : View;
                
                // Determine color based on booking status
                let cardBg = '#fff';
                let dotColor = '#d97706';
                let textColor = '#d97706';
                let btnBg = '#f8d7da'; // default delete button background
                
                if (slot.isBooked) {
                  if (slot.booking?.status === 'CONFIRMED') {
                    cardBg = '#e6fcf5'; // light mint green
                    dotColor = '#005c42';
                    textColor = '#005c42';
                    btnBg = '#a7f3d0';
                  } else if (slot.booking?.status === 'COMPLETED') {
                    cardBg = '#e0e7ff'; // light indigo
                    dotColor = '#4338ca';
                    textColor = '#4338ca';
                    btnBg = '#c7d2fe';
                  } else {
                    cardBg = '#fffbeb'; // warm light yellow
                    dotColor = '#d97706';
                    textColor = '#b45309';
                    btnBg = '#fde68a';
                  }
                }

                return (
                  <View key={slot.id} style={{ marginBottom: 16 }}>
                    <CardComponent
                      disabled={!slot.isBooked}
                      onPress={() => handleOpenSlotDetail(slot)}
                      activeOpacity={0.9}
                    >
                      <BrutalistShadow style={{ borderRadius: 12, backgroundColor: cardBg }} offset={3}>
                        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 }}>
                              {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime).split(' ').pop()}
                            </Text>
                            {slot.isBooked && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#1b263b' }}>
                                  👤 Học viên: {slot.booking?.student?.fullName || 'Ẩn danh'}
                                </Text>
                                {slot.booking?.hasUnreadMessages && (
                                  <View style={{
                                    width: 8, height: 8, borderRadius: 4,
                                    backgroundColor: '#c92a2a',
                                    marginLeft: 6
                                  }} />
                                )}
                              </View>
                            )}
                            {slot.meetingLink && (
                              <Text style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#4682b4', marginBottom: 4 }} numberOfLines={1}>
                                🔗 {slot.meetingLink}
                              </Text>
                            )}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={{
                                width: 8, height: 8, borderRadius: 4,
                                backgroundColor: dotColor,
                                marginRight: 6
                              }} />
                              <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: textColor }}>
                                {slot.isBooked ? `ĐÃ ĐƯỢC ĐẶT HẸN (${
                                  slot.booking?.status === 'PENDING' ? 'CHỜ DUYỆT' :
                                  slot.booking?.status === 'COMPLETED' ? 'HOÀN THÀNH' : 'ĐÃ DUYỆT'
                                })` : 'ĐANG TRỐNG'}
                              </Text>
                            </View>
                          </View>
                          
                          {slot.isBooked ? (
                            <TouchableOpacity 
                              onPress={() => handleOpenSlotDetail(slot)}
                              style={{
                                backgroundColor: btnBg,
                                borderWidth: 2,
                                borderColor: '#1b263b',
                                borderRadius: 8,
                                padding: 8,
                              }}
                            >
                              <Ionicons name="eye-outline" size={16} color="#1b263b" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              onPress={() => handleDeleteSlot(slot.id)}
                              style={{
                                backgroundColor: btnBg,
                                borderWidth: 2,
                                borderColor: '#1b263b',
                                borderRadius: 8,
                                padding: 8,
                              }}
                            >
                              <Ionicons name="trash-outline" size={16} color="#c92a2a" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </BrutalistShadow>
                    </CardComponent>
                  </View>
                );
              })
            )}
          </View>
        ) : activeStudentTab === 'directory' ? (
          // STUDENT: MENTORS DIRECTORY TAB
          <View>
            {isLoadingMentors ? (
              <ActivityIndicator size="large" color="#1b263b" style={{ marginTop: 40 }} />
            ) : filteredMentors.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
                <Text style={styles.emptyText}>No mentors found.</Text>
              </View>
            ) : (
              filteredMentors.map((mentor) => (
                <TouchableOpacity key={mentor.id} onPress={() => handleOpenMentorDetail(mentor)} activeOpacity={0.9} style={styles.mentorCardWrap}>
                  <BrutalistShadow style={styles.mentorCard} offset={4}>
                    <View style={styles.mentorCardInner}>
                      <View style={styles.mentorHeader}>
                        <View style={styles.mentorAvatar}>
                          <Text style={styles.mentorAvatarText}>{mentor.fullName?.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.mentorInfo}>
                          <Text style={styles.mentorName}>{mentor.fullName}</Text>
                          {mentor.expertise && (
                            <View style={styles.expertiseBadge}>
                              <Text style={styles.expertiseText}>{mentor.expertise}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {mentor.bio && (
                        <Text style={styles.mentorBio} numberOfLines={2}>{mentor.bio}</Text>
                      )}
                      <View style={styles.mentorFooter}>
                        <Text style={styles.mentorFooterText}>VIEW AVAILABLE SLOTS</Text>
                        <Ionicons name="arrow-forward" size={16} color="#c92a2a" />
                      </View>
                    </View>
                  </BrutalistShadow>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          // STUDENT: MY BOOKINGS TAB
          <View>
            {isLoadingBookings ? (
              <ActivityIndicator size="large" color="#1b263b" style={{ marginTop: 40 }} />
            ) : myBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>🗓️</Text>
                <Text style={styles.emptyText}>Bạn chưa đặt lịch học nào.</Text>
              </View>
            ) : (
              myBookings.map((booking) => (
                <View key={booking.id} style={{ marginBottom: 16 }}>
                  <BrutalistShadow style={{ borderRadius: 12, backgroundColor: '#fff' }} offset={3}>
                    <View style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>
                            Gia sư: {booking.mentor?.fullName || 'Gia sư ẩn danh'}
                          </Text>
                          {booking.hasUnreadMessages && (
                            <View style={{
                              width: 8, height: 8, borderRadius: 4,
                              backgroundColor: '#c92a2a',
                              marginLeft: 6
                            }} />
                          )}
                        </View>
                        <View style={{ 
                          paddingHorizontal: 8, 
                          paddingVertical: 4, 
                          borderRadius: 6, 
                          borderWidth: 2, 
                          borderColor: '#1b263b',
                          backgroundColor: 
                            booking.status === 'CONFIRMED' ? '#a7f3d0' : 
                            booking.status === 'COMPLETED' ? '#c7d2fe' : 
                            booking.status === 'PENDING' ? '#ffd54f' : '#f8d7da'
                        }}>
                          <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>
                            {booking.status === 'CONFIRMED' ? 'ĐÃ DUYỆT' : 
                             booking.status === 'COMPLETED' ? 'HOÀN THÀNH' : 
                             booking.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 4 }}>
                        📅 Thời gian: {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' ').pop()}
                      </Text>

                      {booking.availability?.meetingLink && (
                        <Text style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#4682b4', marginBottom: 4 }} numberOfLines={1}>
                          🔗 Lớp học: {booking.availability.meetingLink}
                        </Text>
                      )}

                      {booking.notes && (
                        <Text style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#888', marginBottom: 12 }}>
                          📝 Mục tiêu: "{booking.notes}"
                        </Text>
                      )}

                      {booking.mentorNotes && (
                        <View style={{ backgroundColor: '#fcfbf7', borderWidth: 2, borderColor: '#1b263b', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#005c42', marginBottom: 4 }}>NHẬN XÉT CỦA GIA SƯ:</Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#555' }}>{booking.mentorNotes}</Text>
                        </View>
                      )}

                      {booking.cancelReason && (
                        <View style={{ backgroundColor: '#fff5f5', borderWidth: 2, borderColor: '#c92a2a', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginBottom: 4 }}>LÝ DO HỦY LỊCH CỦA GIA SƯ:</Text>
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#c92a2a' }}>"{booking.cancelReason}"</Text>
                        </View>
                      )}

                      {/* Rated comment display */}
                      {booking.rating ? (
                        <View style={{ backgroundColor: '#fffbeb', borderWidth: 2, borderColor: '#1b263b', borderRadius: 8, padding: 10, marginBottom: 12 }}>
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#b45309', marginBottom: 4 }}>
                            ĐÁNH GIÁ CỦA BẠN: {'⭐'.repeat(booking.rating)}
                          </Text>
                          {booking.comment ? (
                            <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#555' }}>"{booking.comment}"</Text>
                          ) : null}
                        </View>
                      ) : null}

                      {/* If COMPLETED, let student rate/comment */}
                      {booking.status === 'COMPLETED' && !booking.rating && (
                        <TouchableOpacity 
                          onPress={() => handleOpenRatingModal(booking)}
                          style={{
                            backgroundColor: '#ffd54f',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 10,
                            paddingVertical: 10,
                            alignItems: 'center',
                            marginTop: 4
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>
                            ĐÁNH GIÁ BUỔI HỌC ⭐
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Only allow student to cancel when status is PENDING */}
                      {booking.status === 'PENDING' && (
                        <TouchableOpacity 
                          onPress={() => handleCancelBooking(booking.id)}
                          style={{
                            backgroundColor: '#f8d7da',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 10,
                            paddingVertical: 10,
                            alignItems: 'center',
                            marginTop: 4
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#c92a2a' }}>
                            HỦY ĐẶT LỊCH
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Chat button for student */}
                      {booking.status !== 'CANCELLED' && (
                        <TouchableOpacity 
                          onPress={() => handleOpenChat(booking)}
                          style={{
                            backgroundColor: '#e0f2fe',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 10,
                            paddingVertical: 10,
                            alignItems: 'center',
                            marginTop: 4
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#0284c7' }}>
                            NHẮN TIN TRÒ CHUYỆN 💬
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </BrutalistShadow>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* MENTOR SLOTS MODAL (STUDENT ONLY) */}
      {!isMentor && (
        <Modal visible={showMentorModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Session</Text>
                <TouchableOpacity onPress={() => setShowMentorModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              {selectedMentor && (
                <View style={styles.selectedMentorRow}>
                  <View style={[styles.mentorAvatar, { width: 48, height: 48, borderRadius: 12 }]}>
                    <Text style={[styles.mentorAvatarText, { fontSize: 24 }]}>{selectedMentor.fullName?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.mentorInfo}>
                    <Text style={styles.mentorName}>{selectedMentor.fullName}</Text>
                    <Text style={styles.mentorSub}>{selectedMentor.expertise || 'Professional Mentor'}</Text>
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>AVAILABLE SCHEDULES</Text>
              
              {isLoadingSlots ? (
                <ActivityIndicator size="small" color="#1b263b" style={{ padding: 40 }} />
              ) : slots.length === 0 ? (
                <Text style={styles.emptyTextCenter}>No slots available at the moment.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {slots.map((slot) => (
                    <View 
                      key={slot.id} 
                      style={[
                        styles.slotRow, 
                        slot.isBooked && { opacity: 0.5, borderBottomColor: 'rgba(27,38,59,0.05)' }
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.slotTime,
                          slot.isBooked && { color: '#888', textDecorationLine: 'line-through' }
                        ]}>
                          {formatDateTime(slot.startTime)} {slot.isBooked ? '(Hết chỗ)' : ''}
                        </Text>
                      </View>
                      {slot.isBooked ? (
                        <View style={[styles.bookBtn, { backgroundColor: '#e5e5e5', borderColor: '#888' }]}>
                          <Text style={[styles.bookBtnText, { color: '#888' }]}>HẾT CHỖ</Text>
                        </View>
                      ) : (
                        <TouchableOpacity onPress={() => handleOpenBookingModal(slot)} style={styles.bookBtn}>
                          <Text style={styles.bookBtnText}>BOOK NOW</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* CONFIRM BOOKING MODAL (STUDENT ONLY) */}
      {!isMentor && (
        <Modal visible={showBookingModal} transparent={true} animationType="fade">
          <View style={styles.modalOverlayCenter}>
            <BrutalistShadow style={{ width: '90%', maxWidth: 400, borderRadius: 16 }} offset={6}>
              <View style={styles.bookingModalInner}>
                <Text style={styles.modalTitle}>Confirm Booking</Text>
                
                {selectedSlotForBooking && (
                  <View style={styles.slotCard}>
                    <Text style={styles.slotCardLabel}>SELECTED TIME</Text>
                    <Text style={styles.slotCardTime}>{formatDateTime(selectedSlotForBooking.startTime)}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>YOUR MESSAGE / GOALS</Text>
                <TextInput
                  multiline
                  numberOfLines={4}
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                  placeholder="What do you want to focus on?"
                  placeholderTextColor="#999"
                  style={styles.textArea}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>CANCEL</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity onPress={handleConfirmBooking} disabled={isSubmittingBooking} style={styles.confirmBtn}>
                    {isSubmittingBooking ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>CONFIRM</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </BrutalistShadow>
          </View>
        </Modal>
      )}

      {/* MENTOR CREATE SLOT MODAL */}
      {isMentor && (
        <Modal visible={showCreateSlotModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo Khung Giờ Rảnh</Text>
                <TouchableOpacity onPress={() => setShowCreateSlotModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.inputLabel}>NGÀY (YYYY-MM-DD)</Text>
                  <TextInput
                    value={slotDate}
                    onChangeText={setSlotDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                    style={[styles.input, { marginBottom: 16 }]}
                  />

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.inputLabel}>GIỜ BẮT ĐẦU (HH:MM)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={slotStartTime}
                          onChangeText={setSlotStartTime}
                          placeholder="09:00"
                          placeholderTextColor="#999"
                          style={[styles.input, { flex: 1 }]}
                        />
                        <TouchableOpacity
                          onPress={() => setStartPeriod(startPeriod === 'AM' ? 'PM' : 'AM')}
                          style={{
                            backgroundColor: startPeriod === 'AM' ? '#ffd54f' : '#a7f3d0',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 8,
                            minWidth: 50
                          }}
                        >
                          <Text style={{ fontFamily: 'Outfit_900Black', color: '#1b263b', fontSize: 12 }}>
                            {startPeriod}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.inputLabel}>GIỜ KẾT THÚC (HH:MM)</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={slotEndTime}
                          onChangeText={setSlotEndTime}
                          placeholder="10:00"
                          placeholderTextColor="#999"
                          style={[styles.input, { flex: 1 }]}
                        />
                        <TouchableOpacity
                          onPress={() => setEndPeriod(endPeriod === 'AM' ? 'PM' : 'AM')}
                          style={{
                            backgroundColor: endPeriod === 'AM' ? '#ffd54f' : '#a7f3d0',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 8,
                            minWidth: 50
                          }}
                        >
                          <Text style={{ fontFamily: 'Outfit_900Black', color: '#1b263b', fontSize: 12 }}>
                            {endPeriod}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>LINK PHÒNG HỌC (MEETING LINK)</Text>
                <TextInput
                  value={slotMeetingLink}
                  onChangeText={setSlotMeetingLink}
                  placeholder="https://meet.google.com/..."
                  placeholderTextColor="#999"
                  style={[styles.input, { marginBottom: 24 }]}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setShowCreateSlotModal(false)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>HỦY BỎ</Text>
                  </TouchableOpacity>
                  <View style={{ width: 12 }} />
                  <TouchableOpacity onPress={handleConfirmCreateSlot} disabled={isSubmittingSlot} style={styles.confirmBtn}>
                    {isSubmittingSlot ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>XÁC NHẬN</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* MENTOR SLOT DETAIL MODAL */}
      {isMentor && (
        <Modal visible={showSlotDetailModal} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi Tiết Lịch Hẹn</Text>
                <TouchableOpacity onPress={() => setShowSlotDetailModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              {selectedSlotForDetail && selectedSlotForDetail.booking && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  
                  {/* Status Badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.inputLabel}>TRẠNG THÁI: </Text>
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: '#1b263b',
                      backgroundColor:
                        selectedSlotForDetail.booking.status === 'CONFIRMED' ? '#a7f3d0' :
                        selectedSlotForDetail.booking.status === 'COMPLETED' ? '#c7d2fe' :
                        selectedSlotForDetail.booking.status === 'PENDING' ? '#ffd54f' : '#f8d7da'
                    }}>
                      <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>
                        {selectedSlotForDetail.booking.status === 'CONFIRMED' ? 'ĐÃ PHÊ DUYỆT (CONFIRMED)' :
                         selectedSlotForDetail.booking.status === 'COMPLETED' ? 'HOÀN THÀNH (COMPLETED)' :
                         selectedSlotForDetail.booking.status === 'PENDING' ? 'CHỜ DUYỆT (PENDING)' : 'ĐÃ HỦY (CANCELLED)'}
                      </Text>
                    </View>
                  </View>

                  {/* Time Card */}
                  <View style={[styles.slotCard, { backgroundColor: '#ffd54f', marginBottom: 20 }]}>
                    <Text style={styles.slotCardLabel}>THỜI GIAN HỌC</Text>
                    <Text style={styles.slotCardTime}>
                      {formatDateTime(selectedSlotForDetail.startTime)} - {formatDateTime(selectedSlotForDetail.endTime).split(' ').pop()}
                    </Text>
                  </View>

                  {/* Student Card */}
                  <Text style={styles.inputLabel}>THÔNG TIN HỌC VIÊN</Text>
                  <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 8 }}>
                      👤 {selectedSlotForDetail.booking.student?.fullName || 'Học viên ẩn danh'}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 4 }}>
                      ✉️ Email: {selectedSlotForDetail.booking.student?.email || 'Chưa cung cấp'}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 8 }}>
                      📞 SĐT: {selectedSlotForDetail.booking.student?.phone || 'Chưa cung cấp'}
                    </Text>
                    {selectedSlotForDetail.booking.status !== 'CANCELLED' && (
                      <TouchableOpacity
                        onPress={() => {
                          const bookingObj = {
                            ...selectedSlotForDetail.booking,
                            startTime: selectedSlotForDetail.startTime,
                            endTime: selectedSlotForDetail.endTime
                          };
                          handleOpenChat(bookingObj);
                        }}
                        style={{
                          backgroundColor: '#e0f2fe',
                          borderWidth: 2,
                          borderColor: '#1b263b',
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: 'center',
                          marginTop: 8
                        }}
                      >
                        <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#0284c7' }}>
                          TRÒ CHUYỆN VỚI HỌC VIÊN 💬
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Student Notes Card */}
                  <Text style={styles.inputLabel}>GHI CHÚ CỦA HỌC VIÊN</Text>
                  <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#1b263b', lineHeight: 18 }}>
                      {selectedSlotForDetail.booking.notes || '(Không có ghi chú)'}
                    </Text>
                  </View>

                  {/* Meeting Link */}
                  {selectedSlotForDetail.meetingLink && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={styles.inputLabel}>LINK LỚP HỌC</Text>
                      <View style={{ backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#4682b4' }}>
                          🔗 {selectedSlotForDetail.meetingLink}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Student Rating & Comment */}
                  {selectedSlotForDetail.booking.status === 'COMPLETED' && selectedSlotForDetail.booking.rating && (
                    <View style={{ marginBottom: 20 }}>
                      <Text style={styles.inputLabel}>ĐÁNH GIÁ & NHẬN XÉT CỦA HỌC VIÊN</Text>
                      <View style={{ backgroundColor: '#fffbeb', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#b45309', marginBottom: 6 }}>
                          {'⭐'.repeat(selectedSlotForDetail.booking.rating)} ({selectedSlotForDetail.booking.rating}/5)
                        </Text>
                        {selectedSlotForDetail.booking.comment ? (
                          <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#555', fontStyle: 'italic', lineHeight: 18 }}>
                            "{selectedSlotForDetail.booking.comment}"
                          </Text>
                        ) : (
                          <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#888', fontStyle: 'italic' }}>
                            (Học viên không để lại bình luận)
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Approval / Cancellation Actions */}
                  {showCancelReasonForm ? (
                    <View style={{ backgroundColor: '#fff5f5', borderWidth: 2, borderColor: '#c92a2a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                      <Text style={{ fontSize: 13, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginBottom: 8 }}>
                        LÝ DO HỦY LỊCH (BẮT BUỘC CHO HỌC VIÊN):
                      </Text>
                      <TextInput
                        multiline
                        numberOfLines={3}
                        value={cancelReasonInput}
                        onChangeText={setCancelReasonInput}
                        placeholder="Nhập lý do hủy lớp học..."
                        placeholderTextColor="#999"
                        style={[styles.textArea, { borderColor: '#c92a2a', marginBottom: 12 }]}
                      />
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity 
                          onPress={() => {
                            setShowCancelReasonForm(false);
                            setCancelReasonInput('');
                          }}
                          style={[styles.cancelBtn, { flex: 1, backgroundColor: '#fff', borderColor: '#1b263b', marginRight: 6 }]}
                        >
                          <Text style={styles.cancelBtnText}>QUAY LẠI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={handleConfirmCancelBookingWithReason}
                          style={{
                            flex: 1,
                            backgroundColor: '#c92a2a',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 6
                          }}
                        >
                          <Text style={{ fontSize: 11, fontFamily: 'Outfit_900Black', color: '#fff' }}>
                            XÁC NHẬN HỦY
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                      {selectedSlotForDetail.booking.status === 'PENDING' && (
                        <>
                          <TouchableOpacity 
                            onPress={() => handleAcceptBooking(selectedSlotForDetail.booking.id)}
                            disabled={isAccepting}
                            style={[styles.confirmBtn, { flex: 1, backgroundColor: '#a7f3d0' }]}
                          >
                            {isAccepting ? <ActivityIndicator color="#005c42" /> : <Text style={[styles.confirmBtnText, { color: '#005c42' }]}>PHÊ DUYỆT</Text>}
                          </TouchableOpacity>
                          <View style={{ width: 12 }} />
                          <TouchableOpacity 
                            onPress={() => handleCancelBookingByMentor(selectedSlotForDetail.booking.id)}
                            style={[styles.cancelBtn, { flex: 1, backgroundColor: '#f8d7da', borderColor: '#c92a2a' }]}
                          >
                            <Text style={[styles.cancelBtnText, { color: '#c92a2a' }]}>HỦY LỊCH HẸN</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      {selectedSlotForDetail.booking.status === 'CONFIRMED' && (
                        <>
                          <TouchableOpacity 
                            onPress={() => handleCompleteBooking(selectedSlotForDetail.booking.id)}
                            disabled={isCompleting}
                            style={[styles.confirmBtn, { flex: 1, backgroundColor: '#a7f3d0' }]}
                          >
                            {isCompleting ? <ActivityIndicator color="#005c42" /> : <Text style={[styles.confirmBtnText, { color: '#005c42' }]}>HOÀN THÀNH</Text>}
                          </TouchableOpacity>
                          <View style={{ width: 12 }} />
                          <TouchableOpacity 
                            onPress={() => setShowCancelReasonForm(true)}
                            style={[styles.cancelBtn, { flex: 1, backgroundColor: '#f8d7da', borderColor: '#c92a2a' }]}
                          >
                            <Text style={[styles.cancelBtnText, { color: '#c92a2a' }]}>HỦY LỊCH HẸN</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}

                  {/* Mentor notes */}
                  {selectedSlotForDetail.booking.status === 'COMPLETED' ? (
                    <>
                      <Text style={styles.inputLabel}>NHẬN XÉT CỦA BẠN (MENTOR NOTES)</Text>
                      <TextInput
                        multiline
                        numberOfLines={4}
                        value={mentorNotesEdit}
                        onChangeText={setMentorNotesEdit}
                        placeholder="Nhập nhận xét hoặc feedback sau buổi học..."
                        placeholderTextColor="#999"
                        style={[styles.textArea, { marginBottom: 24 }]}
                      />

                      <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setShowSlotDetailModal(false)} style={styles.cancelBtn}>
                          <Text style={styles.cancelBtnText}>ĐÓNG</Text>
                        </TouchableOpacity>
                        <View style={{ width: 12 }} />
                        <TouchableOpacity 
                          onPress={handleSaveMentorNotes} 
                          disabled={isSavingNotes} 
                          style={[styles.confirmBtn, { backgroundColor: '#005c42' }]}
                        >
                          {isSavingNotes ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>LƯU NHẬN XÉT</Text>}
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={{ backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#d1d5db', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center' }}>
                          🔒 Nhận xét học viên chỉ khả dụng sau khi gia sư bấm HOÀN THÀNH lịch học.
                        </Text>
                      </View>
                      <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setShowSlotDetailModal(false)} style={[styles.cancelBtn, { flex: 1 }]}>
                          <Text style={styles.cancelBtnText}>ĐÓNG</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* STUDENT RATING & COMMENT MODAL */}
      <Modal visible={showRatingModal} transparent={true} animationType="slide" onRequestClose={() => setShowRatingModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh Giá Buổi Học</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#1b263b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center' }}>
                Vui lòng đánh giá chất lượng buổi học và đóng góp ý kiến để gia sư hoàn thiện hơn nhé!
              </Text>

              {/* Star rating selection */}
              <Text style={styles.inputLabel}>ĐÁNH GIÁ (SAO)</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 24 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRatingValue(star)} style={{ marginHorizontal: 8 }}>
                    <Ionicons 
                      name={star <= ratingValue ? "star" : "star-outline"} 
                      size={36} 
                      color="#f59e0b" 
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Comment text area */}
              <Text style={styles.inputLabel}>NHẬN XÉT CỦA BẠN (Ý KIẾN ĐÓNG GÓP)</Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder="Nhập nhận xét hoặc cảm nghĩ về buổi học..."
                placeholderTextColor="#999"
                style={[styles.textArea, { marginBottom: 24 }]}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowRatingModal(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>ĐÓNG</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity 
                  onPress={handleSubmitRating} 
                  disabled={isSubmittingRating} 
                  style={[styles.confirmBtn, { backgroundColor: '#ffd54f' }]}
                >
                  {isSubmittingRating ? <ActivityIndicator color="#1b263b" /> : <Text style={[styles.confirmBtnText, { color: '#1b263b' }]}>GỬI ĐÁNH GIÁ</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Error Message Modal */}
      <Modal visible={!!errorMessage} transparent animationType="fade" onRequestClose={() => setErrorMessage('')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,38,59,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <Ionicons name="alert-circle" size={32} color="#c92a2a" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16, textAlign: 'center' }}>Lỗi Cập Nhật</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 }}>{errorMessage}</Text>
            <TouchableOpacity style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#c92a2a', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b' }} onPress={() => setErrorMessage('')}>
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#fff' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Message Modal */}
      <Modal visible={!!successMessage} transparent animationType="fade" onRequestClose={() => setSuccessMessage('')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,38,59,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <Ionicons name="checkmark-circle" size={32} color="#005c42" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16, textAlign: 'center' }}>Thành Công</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 }}>{successMessage}</Text>
            <TouchableOpacity style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#a7f3d0', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b' }} onPress={() => setSuccessMessage('')}>
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#005c42' }}>Tiếp Tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,38,59,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <Ionicons name="help-circle" size={36} color="#ffd54f" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 12, textAlign: 'center' }}>
              {confirmModalTitle}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 }}>
              {confirmModalMessage}
            </Text>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', marginRight: 6 }} 
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#ffd54f', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', marginLeft: 6 }} 
                onPress={handleExecuteConfirm}
              >
                <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHAT MODAL */}
      {selectedBookingForChat && (
        <Modal visible={showChatModal} transparent={true} animationType="slide" onRequestClose={() => setShowChatModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { height: '80%', paddingBottom: 0 }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    Chat: {isMentor ? selectedBookingForChat.student?.fullName || 'Học viên' : selectedBookingForChat.mentor?.fullName || 'Gia sư'}
                  </Text>
                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#666', marginTop: 2 }}>
                    Lịch: {formatDateTime(selectedBookingForChat.startTime)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              {/* Chat Messages List */}
              <View style={{ flex: 1, backgroundColor: '#fcfbf7', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                {isLoadingChatHistory ? (
                  <ActivityIndicator size="large" color="#1b263b" style={{ flex: 1, justifyContent: 'center' }} />
                ) : chatMessages.length === 0 ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
                    <Text style={{ fontFamily: 'Outfit_700Bold', color: '#888', fontSize: 12 }}>Hãy gửi lời chào đầu tiên!</Text>
                  </View>
                ) : (
                  <FlatList
                    ref={chatFlatListRef}
                    data={chatMessages}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 10 }}
                    renderItem={({ item }) => {
                      const isMe = item.senderId === (user?._id || user?.id);
                      return (
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          marginBottom: 12,
                        }}>
                          <View style={{
                            backgroundColor: isMe ? '#a7f3d0' : '#fff',
                            borderWidth: 2,
                            borderColor: '#1b263b',
                            borderRadius: 12,
                            padding: 10,
                            maxWidth: '80%',
                            shadowColor: '#1b263b',
                            shadowOffset: { width: 2, height: 2 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 2,
                          }}>
                            {!isMe && (
                              <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 9, color: '#4338ca', marginBottom: 2 }}>
                                {item.sender?.fullName || 'Đối phương'}
                              </Text>
                            )}
                            {item.fileUrl ? (
                              <TouchableOpacity
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    window.open(item.fileUrl, '_blank');
                                  } else {
                                    Linking.openURL(item.fileUrl).catch(err => 
                                      Alert.alert('Lỗi', 'Không thể mở liên kết này.')
                                    );
                                  }
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  backgroundColor: '#f3f4f6',
                                  borderWidth: 1.5,
                                  borderColor: '#1b263b',
                                  borderRadius: 8,
                                  padding: 8,
                                  marginTop: 4,
                                }}
                              >
                                <Ionicons name="document-text" size={24} color="#1b263b" style={{ marginRight: 8 }} />
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 11, color: '#1b263b' }} numberOfLines={1}>
                                    {item.fileName || 'Tài liệu'}
                                  </Text>
                                  <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 9, color: '#666' }}>
                                    {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : 'Tệp đính kèm'}
                                  </Text>
                                </View>
                                <Ionicons name="download-outline" size={16} color="#1b263b" style={{ marginLeft: 8 }} />
                              </TouchableOpacity>
                            ) : (
                              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#1b263b', lineHeight: 18 }}>
                                {item.content}
                              </Text>
                            )}
                            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 8, color: '#999', alignSelf: 'flex-end', marginTop: 4 }}>
                              {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </View>

               {/* Chat Input Area */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={handlePickAndUploadFile}
                  disabled={isSendingChatMessage}
                  style={{
                    backgroundColor: '#a7f3d0',
                    borderWidth: 2,
                    borderColor: '#1b263b',
                    borderRadius: 12,
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8,
                  }}
                >
                  {isSendingChatMessage ? (
                    <ActivityIndicator size="small" color="#1b263b" />
                  ) : (
                    <Ionicons name="attach" size={20} color="#1b263b" />
                  )}
                </TouchableOpacity>
                <TextInput
                  value={chatInput}
                  onChangeText={setChatInput}
                  placeholder="Nhập tin nhắn..."
                  placeholderTextColor="#999"
                  style={[styles.input, { flex: 1, marginBottom: 0, marginRight: 8 }]}
                />
                <TouchableOpacity
                  onPress={handleSendChatMessage}
                  style={{
                    backgroundColor: '#ffd54f',
                    borderWidth: 2,
                    borderColor: '#1b263b',
                    borderRadius: 12,
                    padding: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="send" size={20} color="#1b263b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontFamily: 'Outfit_900Black', fontSize: 24, color: '#1b263b', lineHeight: 28 },
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 1 },
  menuItem: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' },
  
  searchContainer: { padding: 16, backgroundColor: '#f5f3dc' },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  mentorCardWrap: { marginBottom: 20 },
  mentorCard: { borderRadius: 16 },
  mentorCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mentorAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#005c42', borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center' },
  mentorAvatarText: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#fff' },
  mentorInfo: { marginLeft: 16, flex: 1 },
  mentorName: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 },
  expertiseBadge: { alignSelf: 'flex-start', backgroundColor: '#a7f3d0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#1b263b' },
  expertiseText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#005c42' },
  mentorBio: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', lineHeight: 18, marginBottom: 16 },
  mentorFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: 'rgba(27,38,59,0.1)', paddingTop: 12 },
  mentorFooterText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#c92a2a', letterSpacing: 1 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTextCenter: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fcfbf7', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 2, borderColor: '#1b263b', padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  closeBtn: { padding: 4 },
  
  selectedMentorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: 'rgba(27,38,59,0.1)' },
  mentorSub: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', marginTop: 4 },
  
  sectionTitle: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', letterSpacing: 2, marginBottom: 12 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(27,38,59,0.1)' },
  slotTime: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  bookBtn: { backgroundColor: '#c92a2a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 2, borderColor: '#1b263b' },
  bookBtnText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 10 },

  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bookingModalInner: { backgroundColor: '#fcfbf7', padding: 24 },
  slotCard: { backgroundColor: '#ffd54f', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', marginBottom: 20 },
  slotCardLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b', opacity: 0.7, marginBottom: 4 },
  slotCardTime: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  
  inputLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', marginBottom: 8, letterSpacing: 1 },
  textArea: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16, fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#1b263b', height: 100, textAlignVertical: 'top', marginBottom: 24 },
  
  modalActions: { flexDirection: 'row' },
  cancelBtn: { flex: 1, backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' },
  confirmBtn: { flex: 1, backgroundColor: '#005c42', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#fff' },

  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#1b263b',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#666',
    textAlign: 'center',
  },
});

export default MentorsScreen;
