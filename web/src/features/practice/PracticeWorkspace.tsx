import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';
import { socket } from '../../services/socket';

export default function PracticeWorkspace() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tabs: 'speaking' | 'writing' | 'reading' | 'listening' | 'mentors' | 'tracker'
  const activeTab = searchParams.get('tab') || 'speaking';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // State for Lists
  const [speakingExams, setSpeakingExams] = useState<any[]>([]);
  const [speakingExamsLoading, setSpeakingExamsLoading] = useState(false);

  const [writingExams, setWritingExams] = useState<any[]>([]);
  const [writingExamsLoading, setWritingExamsLoading] = useState(false);

  const [readingExams, setReadingExams] = useState<any[]>([]);
  const [readingExamsLoading, setReadingExamsLoading] = useState(false);

  const [listeningExams, setListeningExams] = useState<any[]>([]);
  const [listeningExamsLoading, setListeningExamsLoading] = useState(false);

  // Mentors Booking State (real API)
  const isMentor = user?.role === 'MENTOR';
  const [activeStudentTab, setActiveStudentTab] = useState<'directory' | 'my_bookings'>('directory');
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentorSlots, setMentorSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Score Tracker state
  const [userStats, setUserStats] = useState<any>(null);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerError, setTrackerError] = useState<string | null>(null);

  // Mentor Create Slot Form State
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [slotMeetingLink, setSlotMeetingLink] = useState('https://meet.google.com/');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  // Slot Detail Modal (Mentor view)
  const [showSlotDetailModal, setShowSlotDetailModal] = useState(false);
  const [selectedSlotForDetail, setSelectedSlotForDetail] = useState<any>(null);
  const [mentorNotesEdit, setMentorNotesEdit] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Cancel with reason
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showCancelReasonForm, setShowCancelReasonForm] = useState(false);

  // Rating Modal (Student view)
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Chat Modal
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<any>(null);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch lists based on active tab
  useEffect(() => {
    if (activeTab === 'speaking') {
      const fetchSpeakingExams = async () => {
        setSpeakingExamsLoading(true);
        try {
          const response = await apiClient.get('/exams?type=SPEAKING');
          if (response.data && response.data.success) {
            setSpeakingExams(response.data.data.exams);
          }
        } catch (err) {
          console.error('Error fetching speaking exams:', err);
        } finally {
          setSpeakingExamsLoading(false);
        }
      };
      fetchSpeakingExams();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'reading') {
      const fetchReadingExams = async () => {
        setReadingExamsLoading(true);
        try {
          const response = await apiClient.get('/exams?type=READING');
          if (response.data && response.data.success) {
            setReadingExams(response.data.data.exams);
          }
        } catch (err) {
          console.error('Error fetching reading exams:', err);
        } finally {
          setReadingExamsLoading(false);
        }
      };
      fetchReadingExams();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'listening') {
      const fetchListeningExams = async () => {
        setListeningExamsLoading(true);
        try {
          const response = await apiClient.get('/exams?type=LISTENING');
          if (response.data && response.data.success) {
            setListeningExams(response.data.data.exams);
          }
        } catch (err) {
          console.error('Error fetching listening exams:', err);
        } finally {
          setListeningExamsLoading(false);
        }
      };
      fetchListeningExams();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'writing') {
      const fetchWritingExams = async () => {
        setWritingExamsLoading(true);
        try {
          const response = await apiClient.get('/exams?type=WRITING');
          if (response.data && response.data.success) {
            setWritingExams(response.data.data.exams);
          }
        } catch (err) {
          console.error('Error fetching writing exams:', err);
        } finally {
          setWritingExamsLoading(false);
        }
      };
      fetchWritingExams();
    }
  }, [activeTab]);

  const fetchMySlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await apiClient.get('/mentors/availabilities');
      setMentorSlots(response.data.data || []);
    } catch (error) {
      console.log('Error fetching mentor slots:', error);
      setMentorSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const response = await apiClient.get('/bookings');
      setMyBookings(response.data.data || []);
    } catch (error) {
      console.log('Error fetching my bookings:', error);
      setMyBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  // Fetch initial data based on tab & role
  useEffect(() => {
    if (activeTab === 'mentors') {
      if (isMentor) {
        fetchMySlots();
      } else {
        const fetchMentors = async () => {
          setMentorsLoading(true);
          try {
            const res = await apiClient.get('/mentors');
            if (res.data?.success) setMentorsList(res.data.data);
          } catch (err) {
            console.error('Error fetching mentors:', err);
          } finally {
            setMentorsLoading(false);
          }
        };
        fetchMentors();
      }
    }
  }, [activeTab, isMentor]);

  // Fetch bookings when switching tabs
  useEffect(() => {
    if (activeTab === 'mentors' && !isMentor && activeStudentTab === 'my_bookings') {
      fetchMyBookings();
    }
  }, [activeTab, isMentor, activeStudentTab]);

  // Fetch score tracker data when tab switches to tracker
  useEffect(() => {
    if (activeTab === 'tracker') {
      const fetchTrackerData = async () => {
        setTrackerLoading(true);
        setTrackerError(null);
        try {
          const [statsRes, resultsRes] = await Promise.all([
            apiClient.get('/users/me/stats'),
            apiClient.get('/users/me/results?limit=10')
          ]);
          
          if (statsRes.data?.success) {
            setUserStats(statsRes.data.data);
          }
          if (resultsRes.data?.success) {
            setUserResults(resultsRes.data.data.results || []);
          }
        } catch (err: any) {
          console.error('Error fetching tracker stats:', err);
          setTrackerError('Không thể tải dữ liệu tiến trình học tập từ máy chủ.');
        } finally {
          setTrackerLoading(false);
        }
      };
      fetchTrackerData();
    }
  }, [activeTab]);

  // Fetch availability slots when a mentor is selected
  useEffect(() => {
    if (selectedMentor) {
      const fetchSlots = async () => {
        setSlotsLoading(true);
        setMentorSlots([]);
        try {
          const res = await apiClient.get(`/mentors/${selectedMentor.id}/availabilities`);
          if (res.data?.success) setMentorSlots(res.data.data);
        } catch (err) {
          console.error('Error fetching slots:', err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    }
  }, [selectedMentor]);

  // Connect socket and register listeners
  useEffect(() => {
    if (activeTab === 'mentors') {
      if (!socket.connected) {
        socket.connect();
      }

      socket.on('slot:update', (data: any) => {
        console.log('[Socket] Received slot:update event:', data);
        const { slotId, isBooked } = data;
        setMentorSlots((prevSlots) =>
          prevSlots.map((s) => (s.id === slotId ? { ...s, isBooked } : s))
        );
        if (isMentor) {
          fetchMySlots();
        } else {
          fetchMyBookings();
        }
      });

      const handleBookingUpdate = (data: any) => {
        console.log('[Socket] Received booking:update event:', data);
        const { studentId, mentorId } = data;
        const currentUserId = user?.id || user?._id;
        if (currentUserId && (currentUserId === studentId || currentUserId === mentorId)) {
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
    }
  }, [activeTab, isMentor, user]);

  // Listen for real-time chat messages
  useEffect(() => {
    if (showChatModal && selectedBookingForChat) {
      const handleReceiveMessage = (message: any) => {
        console.log('[Socket] Received chat:receive_message event:', message);
        if (message.bookingId === selectedBookingForChat.id) {
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
    }
  }, [showChatModal, selectedBookingForChat]);

  // Scroll to bottom of chat list when messages change
  useEffect(() => {
    if (chatMessages.length > 0 && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleBookSlot = async (availabilityId: string) => {
    setBookingLoading(true);
    setBookingSuccess(null);
    setBookingError(null);
    try {
      const res = await apiClient.post('/bookings', { availabilityId, notes: bookingNotes });
      if (res.data?.success) {
        setBookingSuccess('🎉 Đăng ký lịch thành công! Vui lòng chờ gia sư phê duyệt.');
        if (selectedMentor) {
          const slotsRes = await apiClient.get(`/mentors/${selectedMentor.id}/availabilities`);
          if (slotsRes.data?.success) setMentorSlots(slotsRes.data.data);
        }
        setBookingNotes('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đặt lịch thất bại, vui lòng thử lại.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch học này?')) return;
    try {
      await apiClient.patch(`/bookings/${bookingId}/cancel`);
      setBookingSuccess('Hủy đặt lịch học thành công!');
      fetchMyBookings();
    } catch (err: any) {
      console.error('Cancel booking error:', err);
      setBookingError(err.response?.data?.message || 'Không thể hủy đặt lịch.');
    }
  };

  const handleOpenRatingModal = (booking: any) => {
    setSelectedBookingForRating(booking);
    setRatingValue(5);
    setCommentInput('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedBookingForRating) return;
    setIsSubmittingRating(true);
    try {
      await apiClient.patch(`/bookings/${selectedBookingForRating.id}/rate`, {
        rating: ratingValue,
        comment: commentInput.trim(),
      });
      setBookingSuccess('Đánh giá buổi học thành công! Cảm ơn ý kiến đóng góp của bạn. ❤️');
      setShowRatingModal(false);
      fetchMyBookings();
    } catch (err: any) {
      console.error('Submit rating error:', err);
      setBookingError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenCreateSlot = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setSlotDate(`${year}-${month}-${day}`);
    setSlotStartTime('09:00');
    setSlotEndTime('10:00');
    setSlotMeetingLink('https://meet.google.com/');
    setShowCreateSlotModal(true);
  };

  const handleConfirmCreateSlot = async () => {
    if (!slotDate || !slotStartTime || !slotEndTime) {
      alert('Vui lòng nhập đầy đủ Ngày, Giờ bắt đầu và Giờ kết thúc.');
      return;
    }
    setIsSubmittingSlot(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const startDateTime = new Date(`${slotDate}T${slotStartTime}:00`);
      const endDateTime = new Date(`${slotDate}T${slotEndTime}:00`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        alert('Ngày hoặc giờ không hợp lệ.');
        setIsSubmittingSlot(false);
        return;
      }

      if (startDateTime <= new Date()) {
        alert('Giờ bắt đầu phải ở tương lai.');
        setIsSubmittingSlot(false);
        return;
      }

      if (endDateTime <= startDateTime) {
        alert('Giờ kết thúc phải sau giờ bắt đầu.');
        setIsSubmittingSlot(false);
        return;
      }

      await apiClient.post('/mentors/availabilities', {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        meetingLink: slotMeetingLink || undefined,
      });

      setBookingSuccess('Tạo khung giờ rảnh thành công!');
      setShowCreateSlotModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Create slot error:', err);
      setBookingError(err.response?.data?.message || 'Không thể tạo khung giờ rảnh. Vui lòng thử lại.');
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khung giờ rảnh này?')) return;
    try {
      await apiClient.delete(`/mentors/availabilities/${slotId}`);
      setBookingSuccess('Xóa khung giờ rảnh thành công!');
      fetchMySlots();
    } catch (err: any) {
      console.error('Delete slot error:', err);
      setBookingError(err.response?.data?.message || 'Không thể xóa khung giờ rảnh.');
    }
  };

  const handleOpenSlotDetail = (slot: any) => {
    setSelectedSlotForDetail(slot);
    setMentorNotesEdit(slot.booking?.mentorNotes || '');
    setCancelReasonInput('');
    setShowCancelReasonForm(false);
    setShowSlotDetailModal(true);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    setIsAccepting(true);
    try {
      await apiClient.patch(`/bookings/${bookingId}/accept`);
      setBookingSuccess('Duyệt lịch đặt hẹn của học viên thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Accept booking error:', err);
      alert(err.response?.data?.message || 'Phê duyệt lịch đặt thất bại.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCompleteBooking = async (bookingId: string) => {
    setIsCompleting(true);
    try {
      await apiClient.patch(`/bookings/${bookingId}/complete`);
      setBookingSuccess('Hoàn thành buổi học thành công! Bạn hiện đã có quyền nhận xét học viên.');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Complete booking error:', err);
      alert(err.response?.data?.message || 'Đánh dấu hoàn thành lịch học thất bại.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancelBookingByMentor = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn học này?')) return;
    try {
      await apiClient.patch(`/bookings/${bookingId}/cancel`);
      setBookingSuccess('Hủy lịch hẹn thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Cancel booking by mentor error:', err);
      alert(err.response?.data?.message || 'Không thể hủy lịch học.');
    }
  };

  const handleConfirmCancelBookingWithReason = async () => {
    if (!selectedSlotForDetail || !selectedSlotForDetail.booking) return;
    if (!cancelReasonInput.trim()) {
      alert('Vui lòng nhập lý do hủy lịch.');
      return;
    }
    try {
      await apiClient.patch(`/bookings/${selectedSlotForDetail.booking.id}/cancel`, {
        cancelReason: cancelReasonInput.trim()
      });
      setBookingSuccess('Hủy lịch hẹn thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Cancel booking with reason error:', err);
      alert(err.response?.data?.message || 'Không thể hủy lịch học.');
    }
  };

  const handleSaveMentorNotes = async () => {
    if (!selectedSlotForDetail || !selectedSlotForDetail.booking) return;
    setIsSavingNotes(true);
    try {
      await apiClient.patch(`/bookings/${selectedSlotForDetail.booking.id}/notes`, {
        mentorNotes: mentorNotesEdit,
      });
      setBookingSuccess('Lưu nhận xét thành công!');
      setShowSlotDetailModal(false);
      fetchMySlots();
    } catch (err: any) {
      console.error('Save notes error:', err);
      alert(err.response?.data?.message || 'Không thể lưu nhận xét. Vui lòng thử lại.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleOpenChat = async (booking: any) => {
    setSelectedBookingForChat(booking);
    setChatMessages([]);
    setChatInput('');
    setShowChatModal(true);
    setIsLoadingChatHistory(true);

    try {
      const res = await apiClient.get(`/bookings/${booking.id}/messages`);
      if (res.data?.success) {
        setChatMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
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
      senderId: user?.id || user?._id,
      content: messageContent
    });
  };

  const handleWebFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBookingForChat) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Tệp tin vượt quá dung lượng giới hạn 5MB.');
      return;
    }

    setIsSendingChatMessage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await apiClient.post(`/bookings/${selectedBookingForChat.id}/upload-file`, {
            file: base64Data,
            fileName: file.name,
            fileSize: file.size
          });

          if (res.data?.success) {
            const newMsg = res.data.data;
            setChatMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        } catch (uploadErr: any) {
          console.error('Upload API error:', uploadErr);
          alert(uploadErr.response?.data?.message || 'Không thể gửi tệp tin.');
        } finally {
          setIsSendingChatMessage(false);
        }
      };
      reader.onerror = () => {
        alert('Không thể đọc tệp tin.');
        setIsSendingChatMessage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File read error:', err);
      setIsSendingChatMessage(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f5f3dc] bg-notebook-paper bg-notebook bg-repeat text-[#1b263b] font-sans antialiased relative overflow-x-hidden custom-pencil-cursor">
      {/* Real Spiral Binder Graphic on the Left side */}
      <div className="absolute left-3 top-0 bottom-0 w-10 flex flex-col justify-around pointer-events-none z-20 opacity-90 select-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 h-6">
            <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400/50 shadow-inner" />
            <div className="w-8 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full shadow-md border-t border-white/20 transform -translate-x-1" />
          </div>
        ))}
      </div>

      {/* Red vertical margin line of notebook paper */}
      <div className="absolute left-[79px] top-0 bottom-0 w-0.5 bg-[#e0565b]/50 pointer-events-none z-10" />

      {/* MAIN CONTAINER */}
      <div className="pl-[95px] pr-6 md:pr-12 max-w-7xl mx-auto pb-24">
        {/* HEADER */}
        <header className="border-b-2 border-[#1b263b] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-[2px_2px_0px_0px_#1b263b]">
              A
            </div>
            <div>
              <span className="text-3xl font-handwriting font-bold tracking-tight text-[#1b263b]" style={{ fontFamily: "'Caveat', cursive" }}>
                Apex Portal<span className="text-[#c92a2a]">.</span>
              </span>
              <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-widest font-black">Student Practice Area</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#a7f3d0] border-2 border-[#1b263b] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-sans font-black text-[#005c42] normal-case text-[10px]">{user?.fullName || 'IELTS Student'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#fbcfe8] text-[#9d174d] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#f9a8d4] font-black uppercase text-[10px] tracking-wider transition-all shadow-[2px_2px_0px_0px_#1b263b]"
            >
              Sign Out 🚪
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT GRID */}
        <div className="grid lg:grid-cols-12 gap-8 mt-12 items-start">
          {/* TAB SIDEBAR */}
          <div className="lg:col-span-3 space-y-3">
            {[
              { id: 'speaking', label: '🗣️ AI Speaking', desc: 'Simulated Audio Evaluator' },
              { id: 'writing', label: '✍️ AI Writing', desc: 'Criteria Essay Grader' },
              { id: 'reading', label: '📖 Reading Test', desc: 'Interactive Mock Passage' },
              { id: 'listening', label: '🎧 Listening Test', desc: 'Audio Mock Practice' },
              { id: 'mentors', label: '📅 Book Mentor', desc: 'Zoom Session Scheduler' },
              { id: 'tracker', label: '📊 Score Tracker', desc: 'Student Performance Bands' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 border-[#1b263b] transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#ffd54f] shadow-[3px_3px_0px_0px_#1b263b] translate-x-1 font-black text-[#1b263b]'
                      : 'bg-[#fcfbf7] shadow-[1px_1px_0px_0px_#1b263b] hover:bg-gray-50'
                  }`}
                >
                  <div className="font-serif text-sm">{tab.label}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-0.5 tracking-wider">{tab.desc}</div>
                </button>
              );
            })}

            <div className="pt-6">
              <Link
                to="/"
                className="block text-center border-2 border-[#1b263b] bg-[#fcfbf7] hover:bg-gray-50 text-xs font-black px-4 py-3 rounded-2xl shadow-[2px_2px_0px_0px_#1b263b] uppercase tracking-wider"
              >
                ← Back to Main Page
              </Link>
            </div>
          </div>

          {/* MAIN TAB CONTENT SHEET */}
          <div className="lg:col-span-9 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[6px_6px_0px_0px_#1b263b] min-h-[560px] relative text-left">
            {/* Tear marks */}
            <div className="absolute -top-3.5 left-0 right-0 flex justify-around px-8 pointer-events-none select-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#f5f3dc] border-2 border-[#1b263b] shadow-inner" />
              ))}
            </div>

            {/* TAB CONTENT: SPEAKING LIST */}
            {activeTab === 'speaking' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">🗣️ AI Speaking List</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Đề Thi Speaking Thực Tế</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Luyện tập kỹ năng Nói IELTS qua mô phỏng 3 Parts và nhận phản hồi chi tiết từ AI.</p>
                </div>

                {speakingExamsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3">Đang tải danh sách đề thi...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {speakingExams.map((exam) => (
                      <div key={exam.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 flex flex-col justify-between min-h-[180px] shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif font-black text-lg text-[#1b263b] leading-snug">{exam.title}</h3>
                            <span className="text-[9px] bg-purple-100 text-purple-800 border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                              {exam.duration} Min
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">{exam.description || 'Luyện tập trả lời các câu hỏi IELTS Speaking Part 1, 2, 3.'}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Parts: {exam.sections?.length || 3} sections</p>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/practice/speaking/${exam.id}`)}
                          className="w-full mt-4 bg-purple-700 text-white border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-800 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                        >
                          Bắt Đầu Luyện Nói 🗣️
                        </button>
                      </div>
                    ))}
                    {speakingExams.length === 0 && (
                      <p className="text-sm font-semibold text-gray-500 col-span-2 text-center py-12">Không tìm thấy đề thi nào.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: WRITING LIST */}
            {activeTab === 'writing' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✍️ AI Writing List</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Đề Thi Writing Thực Tế</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Luyện tập viết các Task 1 & 2 và được chấm điểm tự động từ AI.</p>
                </div>

                {writingExamsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3">Đang tải danh sách đề thi...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {writingExams.map((exam) => (
                      <div key={exam.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 flex flex-col justify-between min-h-[180px] shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif font-black text-lg text-[#1b263b] leading-snug">{exam.title}</h3>
                            <span className="text-[9px] bg-pink-100 text-pink-800 border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                              {exam.duration} Min
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">{exam.description || 'Luyện viết Task 1 miêu tả biểu đồ & Task 2 nghị luận.'}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Tasks: {exam.sections?.length || 2} tasks</p>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/practice/writing/${exam.id}`)}
                          className="w-full mt-4 bg-pink-700 text-white border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-pink-800 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                        >
                          Bắt Đầu Viết Bài ✍️
                        </button>
                      </div>
                    ))}
                    {writingExams.length === 0 && (
                      <p className="text-sm font-semibold text-gray-500 col-span-2 text-center py-12">Không tìm thấy đề thi nào.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: READING LIST */}
            {activeTab === 'reading' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📖 IELTS Reading List</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Đề Thi Reading Thực Tế</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Luyện tập các đề thi IELTS Reading chính thức từ thư viện Cambridge.</p>
                </div>
                
                {readingExamsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3">Đang tải danh sách đề thi...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {readingExams.map((exam) => (
                      <div key={exam.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 flex flex-col justify-between min-h-[180px] shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif font-black text-lg text-[#1b263b] leading-snug">{exam.title}</h3>
                            <span className="text-[9px] bg-sky-100 text-sky-800 border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                              {exam.duration} Min
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">{exam.description || 'Practice Reading exam from Cambridge series.'}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Questions: {exam.questionsCount || 40} items</p>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/practice/reading/${exam.id}`)}
                          className="w-full mt-4 bg-[#4682b4] text-white border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#3b6d97] transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                        >
                          Bắt Đầu Làm Bài 📖
                        </button>
                      </div>
                    ))}
                    {readingExams.length === 0 && (
                      <p className="text-sm font-semibold text-gray-500 col-span-2 text-center py-12">Không tìm thấy đề thi nào.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LISTENING LIST */}
            {activeTab === 'listening' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">🎧 IELTS Listening List</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Đề Thi Listening Thực Tế</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Luyện tập các đề thi IELTS Listening chính thức từ thư viện Cambridge.</p>
                </div>
                
                {listeningExamsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3">Đang tải danh sách đề thi...</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {listeningExams.map((exam) => (
                      <div key={exam.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 flex flex-col justify-between min-h-[180px] shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif font-black text-lg text-[#1b263b] leading-snug">{exam.title}</h3>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                              {exam.duration} Min
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold">{exam.description || 'Practice Listening exam from Cambridge series.'}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase">Questions: {exam.questionsCount || 40} items</p>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/practice/listening/${exam.id}`)}
                          className="w-full mt-4 bg-emerald-700 text-white border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-800 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                        >
                          Bắt Đầu Làm Bài 🎧
                        </button>
                      </div>
                    ))}
                    {listeningExams.length === 0 && (
                      <p className="text-sm font-semibold text-gray-500 col-span-2 text-center py-12">Không tìm thấy đề thi nào.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: MENTORS — Real API */}
            {activeTab === 'mentors' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">
                    {isMentor ? '📅 mentor control panel' : '📅 certified mentors'}
                  </span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">
                    {isMentor ? 'Lịch Rảnh & Đặt Hẹn Của Tôi' : 'Book 1-on-1 IELTS Sessions'}
                  </h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">
                    {isMentor 
                      ? 'Tạo các khung giờ rảnh và quản lý yêu cầu đặt lịch học, hoàn thành buổi học hoặc nhận xét học viên.' 
                      : 'Đặt lịch học tập trực tiếp cùng chuyên gia IELTS để sửa lỗi và nhận tư vấn định hướng ôn thi.'}
                  </p>
                </div>

                {/* Global booking feedback */}
                {bookingSuccess && (
                  <div className="bg-emerald-50 border-2 border-emerald-600 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-bold shadow-[2px_2px_0px_0px_#1b263b] flex items-center gap-2">
                    {bookingSuccess}
                    <button onClick={() => setBookingSuccess(null)} className="ml-auto text-emerald-600 hover:text-emerald-800 font-black">✕</button>
                  </div>
                )}
                {bookingError && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-800 px-4 py-3 rounded-2xl text-sm font-bold shadow-[2px_2px_0px_0px_#1b263b] flex items-center gap-2">
                    ⚠ {bookingError}
                    <button onClick={() => setBookingError(null)} className="ml-auto text-red-500 hover:text-red-800 font-black">✕</button>
                  </div>
                )}

                {/* STUDENT VIEW */}
                {!isMentor && (
                  <div className="space-y-6">
                    {/* Sub-tabs */}
                    <div className="flex border-2 border-[#1b263b] rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_#1b263b] bg-white">
                      <button
                        onClick={() => { setActiveStudentTab('directory'); setSelectedMentor(null); }}
                        className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-r-2 border-[#1b263b] ${
                          activeStudentTab === 'directory' ? 'bg-[#ffd54f] text-[#1b263b]' : 'bg-white text-[#1b263b] hover:bg-gray-50'
                        }`}
                      >
                        Danh Sách Gia Sư
                      </button>
                      <button
                        onClick={() => { setActiveStudentTab('my_bookings'); }}
                        className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all ${
                          activeStudentTab === 'my_bookings' ? 'bg-[#ffd54f] text-[#1b263b]' : 'bg-white text-[#1b263b] hover:bg-gray-50'
                        }`}
                      >
                        Lịch Học Của Tôi
                      </button>
                    </div>

                    {/* SUB TAB: MENTORS DIRECTORY */}
                    {activeStudentTab === 'directory' && (
                      <div className="space-y-6">
                        {/* Search Query */}
                        {!selectedMentor && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Tìm gia sư theo tên hoặc chuyên môn..."
                              className="flex-1 bg-white border-2 border-[#1b263b] rounded-2xl px-4 py-3 text-xs font-bold outline-none shadow-[2px_2px_0px_0px_#1b263b] focus:bg-gray-50"
                            />
                          </div>
                        )}

                        {/* Mentors List Grid */}
                        {!selectedMentor && (
                          mentorsLoading ? (
                            <div className="text-center py-16 text-sm font-bold text-gray-400 animate-pulse">⏳ Đang tải danh sách mentor...</div>
                          ) : mentorsList.length === 0 ? (
                            <div className="text-center py-16 text-sm font-bold text-gray-400">Hiện chưa có mentor nào khả dụng.</div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                              {mentorsList
                                .filter(m => 
                                  m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  m.expertise?.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map((mentor, idx) => {
                                  const colors = [
                                    'bg-emerald-50 border-emerald-300',
                                    'bg-indigo-50 border-indigo-300',
                                    'bg-amber-50 border-amber-300',
                                    'bg-rose-50 border-rose-300'
                                  ];
                                  const color = colors[idx % colors.length];
                                  return (
                                    <div key={mentor.id} className={`${color} border-2 rounded-2xl p-5 flex flex-col justify-between min-h-[200px] shadow-sm`}>
                                      <div className="space-y-2 text-left">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full border-2 border-[#1b263b] bg-[#1b263b] text-white flex items-center justify-center font-black text-sm">
                                            {(mentor.fullName || 'M')[0].toUpperCase()}
                                          </div>
                                          <div>
                                            <h3 className="font-serif font-black text-base text-[#1b263b]">{mentor.fullName || mentor.username}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold">{mentor.email}</p>
                                          </div>
                                        </div>
                                        {mentor.expertise && (
                                          <span className="inline-block text-[9px] bg-white border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider">{mentor.expertise}</span>
                                        )}
                                        {mentor.bio && (
                                          <p className="text-xs text-gray-700 leading-relaxed font-semibold line-clamp-3">{mentor.bio}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => { setSelectedMentor(mentor); setBookingSuccess(null); setBookingError(null); }}
                                        className="w-full mt-4 border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white text-[#1b263b] hover:bg-[#1b263b] hover:text-white transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                                      >
                                        Xem lịch trống & Đặt lịch 📅
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          )
                        )}

                        {/* Slot Booking Panel */}
                        {selectedMentor && (
                          <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] space-y-5">
                            <div className="flex items-center gap-3 border-b border-[#1b263b]/10 pb-4">
                              <button
                                onClick={() => { setSelectedMentor(null); setMentorSlots([]); setBookingNotes(''); }}
                                className="text-xs font-black border border-[#1b263b] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                              >← Quay lại</button>
                              <div>
                                <h3 className="font-serif font-black text-base text-[#1b263b]">Đặt lịch với: {selectedMentor.fullName || selectedMentor.username}</h3>
                                <p className="text-[10px] text-gray-500 font-bold">{selectedMentor.email}</p>
                              </div>
                            </div>

                            {/* Notes input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-wider text-gray-500">Mục tiêu buổi học (ghi chú)</label>
                              <textarea
                                value={bookingNotes}
                                onChange={(e) => setBookingNotes(e.target.value)}
                                rows={2}
                                placeholder="Ví dụ: Cần sửa lỗi Writing Task 2 và luyện Speaking Part 2..."
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2 text-xs font-bold text-[#1b263b] outline-none resize-none focus:bg-gray-50"
                              />
                            </div>

                            {/* Available slots */}
                            <div className="space-y-2">
                              <p className="text-[9px] font-black uppercase tracking-wider text-gray-500">Chọn khung giờ học phù hợp</p>
                              {slotsLoading ? (
                                <p className="text-sm font-bold text-gray-400 animate-pulse py-6 text-center">⏳ Đang tải lịch...</p>
                              ) : mentorSlots.length === 0 ? (
                                <p className="text-sm font-bold text-gray-500 py-6 text-center">Mentor chưa có lịch trống nào. Vui lòng thử lại sau.</p>
                              ) : (
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {mentorSlots.map((slot) => {
                                    const start = new Date(slot.startTime);
                                    const end = new Date(slot.endTime);
                                    const dateStr = start.toLocaleDateString('vi-VN', { weekday: 'short', month: 'long', day: 'numeric' });
                                    const timeStr = `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
                                    return (
                                      <div key={slot.id} className={`border-2 border-[#1b263b] rounded-2xl p-4 bg-white space-y-2 shadow-[2px_2px_0px_0px_#1b263b] ${slot.isBooked ? 'opacity-50' : ''}`}>
                                        <div>
                                          <p className="text-[10px] font-black uppercase text-gray-400">{dateStr}</p>
                                          <p className="text-sm font-black text-[#1b263b]">{timeStr}</p>
                                          {slot.meetingLink && (
                                            <p className="text-[10px] text-sky-500 font-bold">🔗 Có link phòng học</p>
                                          )}
                                        </div>
                                        <button
                                          disabled={bookingLoading || slot.isBooked}
                                          onClick={() => handleBookSlot(slot.id)}
                                          className={`w-full text-white border-2 border-[#1b263b] py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                            slot.isBooked 
                                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                              : 'bg-[#1b263b] hover:bg-[#0f1a2a]'
                                          }`}
                                        >
                                          {slot.isBooked ? 'HẾT CHỖ' : bookingLoading ? 'Đang xử lý...' : 'Chọn khung giờ này ✓'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB TAB: MY BOOKINGS */}
                    {activeStudentTab === 'my_bookings' && (
                      <div className="space-y-6">
                        {isLoadingBookings ? (
                          <div className="text-center py-16 text-sm font-bold text-gray-400 animate-pulse">⏳ Đang tải danh sách lịch học...</div>
                        ) : myBookings.length === 0 ? (
                          <div className="text-center py-16 text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                            📅 Bạn chưa đăng ký lịch học nào.
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-6">
                            {myBookings.map((booking) => {
                              const statusColor = 
                                booking.status === 'CONFIRMED' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                                booking.status === 'COMPLETED' ? 'bg-indigo-50 border-indigo-500 text-indigo-800' :
                                booking.status === 'PENDING' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                                'bg-rose-50 border-rose-500 text-rose-800';
                              
                              return (
                                <div key={booking.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_#1b263b]">
                                  <div className="space-y-3 text-left">
                                    <div className="flex justify-between items-center gap-2">
                                      <h3 className="font-serif font-black text-base text-[#1b263b]">
                                        Gia sư: {booking.mentor?.fullName || 'Gia sư ẩn danh'}
                                      </h3>
                                      <span className={`text-[9px] border-2 font-black px-2 py-0.5 rounded uppercase tracking-wider ${statusColor}`}>
                                        {booking.status === 'CONFIRMED' ? 'ĐÃ DUYỆT' :
                                         booking.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                                         booking.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
                                      </span>
                                    </div>

                                    <div className="text-xs font-bold text-gray-600 space-y-1">
                                      <p>📅 {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime).split(' ').pop()}</p>
                                      {booking.availability?.meetingLink && (
                                        <p className="text-sky-600 font-semibold truncate">🔗 Link lớp học: <a href={booking.availability.meetingLink} target="_blank" rel="noreferrer" className="underline hover:text-sky-800">{booking.availability.meetingLink}</a></p>
                                      )}
                                      {booking.notes && (
                                        <p className="text-gray-500 italic bg-gray-50 border border-gray-200 rounded p-2 mt-1">📝 Mục tiêu: "{booking.notes}"</p>
                                      )}
                                      {booking.mentorNotes && (
                                        <div className="bg-emerald-50 border-2 border-[#1b263b] rounded-xl p-3 mt-2">
                                          <p className="text-[10px] font-black text-emerald-800 uppercase">Nhận xét của gia sư:</p>
                                          <p className="text-xs text-gray-700 font-semibold mt-1">{booking.mentorNotes}</p>
                                        </div>
                                      )}
                                      {booking.cancelReason && (
                                        <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-3 mt-2">
                                          <p className="text-[10px] font-black text-rose-800 uppercase">Lý do hủy của gia sư:</p>
                                          <p className="text-xs text-rose-700 font-semibold mt-1">"{booking.cancelReason}"</p>
                                        </div>
                                      )}
                                      {booking.rating && (
                                        <div className="bg-amber-50 border-2 border-[#1b263b] rounded-xl p-3 mt-2 flex flex-col gap-1">
                                          <p className="text-[10px] font-black text-amber-800 uppercase">Đánh giá của bạn: {'⭐'.repeat(booking.rating)}</p>
                                          {booking.comment && <p className="text-xs text-gray-700 font-semibold italic mt-1">"{booking.comment}"</p>}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-col gap-2">
                                    {booking.status !== 'CANCELLED' && (
                                      <button
                                        onClick={() => handleOpenChat(booking)}
                                        className="w-full text-center border-2 border-[#1b263b] bg-sky-100 text-sky-800 hover:bg-sky-200 font-black py-2 rounded-xl text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                                      >
                                        Nhắn Tin Trò Chuyện 💬
                                      </button>
                                    )}
                                    {booking.status === 'COMPLETED' && !booking.rating && (
                                      <button
                                        onClick={() => handleOpenRatingModal(booking)}
                                        className="w-full text-center border-2 border-[#1b263b] bg-[#ffd54f] text-[#1b263b] hover:bg-yellow-400 font-black py-2 rounded-xl text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                                      >
                                        Đánh Giá Buổi Học ⭐
                                      </button>
                                    )}
                                    {booking.status === 'PENDING' && (
                                      <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="w-full text-center border-2 border-[#1b263b] bg-rose-100 text-rose-800 hover:bg-rose-200 font-black py-2 rounded-xl text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                                      >
                                        Hủy Đặt Lịch ✕
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MENTOR VIEW */}
                {isMentor && (
                  <div className="space-y-6">
                    {/* Add Slot Button */}
                    <button
                      onClick={handleOpenCreateSlot}
                      className="w-full bg-[#ffd54f] border-2 border-[#1b263b] py-3 rounded-2xl font-black uppercase text-sm tracking-wider hover:bg-yellow-400 transition-all shadow-[4px_4px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                    >
                      <span>➕ THÊM KHUNG GIỜ RẢNH MỚI</span>
                    </button>

                    <div className="space-y-4">
                      <h3 className="font-serif font-black text-xl text-[#1b263b] border-b-2 border-[#1b263b]/10 pb-2">Danh Sách Khung Giờ Rảnh</h3>

                      {slotsLoading ? (
                        <div className="text-center py-16 text-sm font-bold text-gray-400 animate-pulse">⏳ Đang tải khung giờ rảnh...</div>
                      ) : mentorSlots.length === 0 ? (
                        <div className="text-center py-16 text-sm font-bold text-gray-500 border-2 border-dashed border-gray-300 rounded-2xl bg-white">
                          📅 Bạn chưa tạo khung giờ rảnh nào. Hãy nhấn nút phía trên để tạo!
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          {mentorSlots.map((slot) => {
                            let cardBg = 'bg-white border-[#1b263b]';
                            let statusText = 'ĐANG TRỐNG';
                            let statusColor = 'text-gray-500 border-gray-400 bg-gray-50';
                            
                            if (slot.isBooked) {
                              if (slot.booking?.status === 'CONFIRMED') {
                                cardBg = 'bg-emerald-50 border-emerald-500';
                                statusText = 'ĐÃ DUYỆT';
                                statusColor = 'text-emerald-800 border-emerald-600 bg-emerald-100';
                              } else if (slot.booking?.status === 'COMPLETED') {
                                cardBg = 'bg-indigo-50 border-indigo-500';
                                statusText = 'HOÀN THÀNH';
                                statusColor = 'text-indigo-800 border-indigo-600 bg-indigo-100';
                              } else if (slot.booking?.status === 'PENDING') {
                                cardBg = 'bg-amber-50 border-amber-500';
                                statusText = 'CHỜ DUYỆT';
                                statusColor = 'text-amber-800 border-amber-600 bg-amber-100';
                              } else {
                                cardBg = 'bg-rose-50 border-rose-500';
                                statusText = 'ĐÃ HỦY';
                                statusColor = 'text-rose-800 border-rose-600 bg-rose-100';
                              }
                            }

                            return (
                              <div key={slot.id} className={`border-2 rounded-2xl p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_#1b263b] transition-all ${cardBg}`}>
                                <div className="space-y-3 text-left">
                                  <div className="flex justify-between items-center gap-2">
                                    <h4 className="font-serif font-black text-base text-[#1b263b]">
                                      {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime).split(' ').pop()}
                                    </h4>
                                    <span className={`text-[9px] border-2 font-black px-2 py-0.5 rounded uppercase tracking-wider ${statusColor}`}>
                                      {statusText}
                                    </span>
                                  </div>

                                  <div className="text-xs font-bold text-gray-600 space-y-1">
                                    {slot.isBooked && (
                                      <p className="text-gray-800 font-semibold">👤 Học viên: {slot.booking?.student?.fullName || 'Học viên ẩn danh'}</p>
                                    )}
                                    {slot.meetingLink && (
                                      <p className="text-sky-600 font-semibold truncate">🔗 Lớp học: {slot.meetingLink}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                  {slot.isBooked ? (
                                    <button
                                      onClick={() => handleOpenSlotDetail(slot)}
                                      className="flex-1 text-center border-2 border-[#1b263b] bg-white hover:bg-gray-50 font-black py-2 rounded-xl text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                                    >
                                      Chi Tiết Lịch 👁️
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="flex-1 text-center border-2 border-[#1b263b] bg-rose-50 text-rose-700 hover:bg-rose-100 font-black py-2 rounded-xl text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                                    >
                                      Xóa Khung Giờ 🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TRACKER */}
            {activeTab === 'tracker' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📊 performance tracking</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Personal Band Score Tracker</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Thống kê điểm số IELTS mô phỏng của bạn qua các bài kiểm tra gần nhất.</p>
                </div>

                {trackerLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-[#1b263b] rounded-3xl shadow-[3px_3px_0px_0px_#1b263b]">
                    <div className="w-8 h-8 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-gray-500 font-bold uppercase mt-3">Đang tải dữ liệu tiến trình...</p>
                  </div>
                ) : trackerError ? (
                  <div className="bg-rose-50 border-2 border-rose-500 text-rose-800 p-5 rounded-2xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b] text-center">
                    ⚠️ {trackerError}
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Overall Band Card */}
                      <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 text-center shadow-md space-y-2 flex flex-col justify-center items-center min-h-[140px]">
                        <span className="text-[10px] uppercase font-black text-gray-400">Current Average</span>
                        <h3 className="text-5xl font-serif font-black text-[#c92a2a]">
                          {userStats?.overallBand !== null && userStats?.overallBand !== undefined ? userStats.overallBand : '0.0'}
                        </h3>
                        <div className="bg-emerald-100 text-emerald-800 border border-[#1b263b] text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                          {userStats?.overallBand && userStats.overallBand >= 7.0 ? 'Good User' : 'Keep practicing'}
                        </div>
                      </div>

                      {/* Skills Grid */}
                      <div className="md:col-span-2 bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md grid grid-cols-2 gap-4">
                        {[
                          { skill: 'Reading', score: userStats?.readingBand, color: 'bg-emerald-600' },
                          { skill: 'Listening', score: userStats?.listeningBand, color: 'bg-emerald-600' },
                          { skill: 'Writing', score: userStats?.writingBand, color: 'bg-amber-500' },
                          { skill: 'Speaking', score: userStats?.speakingBand, color: 'bg-emerald-600' },
                        ].map((item) => {
                          const scoreVal = item.score !== null && item.score !== undefined ? parseFloat(item.score) : 0;
                          const pct = Math.min(100, Math.max(0, (scoreVal / 9.0) * 100));
                          return (
                            <div key={item.skill} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold text-gray-700">
                                <span>{item.skill}</span>
                                <span>Band {item.score !== null && item.score !== undefined ? item.score : '0.0'}</span>
                              </div>
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-300">
                                <div className={`${item.color} h-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Checkin / Streak stats */}
                    {userStats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 text-center shadow-md">
                          <p className="text-[9px] uppercase font-black text-gray-400">Streak Điểm Danh</p>
                          <p className="text-xl font-black text-amber-500 mt-1">🔥 {userStats.currentStreak || 0} ngày</p>
                        </div>
                        <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 text-center shadow-md">
                          <p className="text-[9px] uppercase font-black text-gray-400">Tổng Bài Đã Làm</p>
                          <p className="text-xl font-black text-[#1b263b] mt-1">📝 {userStats.totalTests || 0} bài</p>
                        </div>
                        <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 text-center shadow-md">
                          <p className="text-[9px] uppercase font-black text-gray-400">Điểm Lớn Nhất</p>
                          <p className="text-xl font-black text-[#c92a2a] mt-1">🏆 Band {userStats.topScore || '0.0'}</p>
                        </div>
                        <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 text-center shadow-md">
                          <p className="text-[9px] uppercase font-black text-gray-400">Thời Gian Học</p>
                          <p className="text-xl font-black text-sky-600 mt-1">⏱️ {userStats.studyHours || 0} giờ</p>
                        </div>
                      </div>
                    )}

                    {/* Live Practice History */}
                    <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md space-y-3">
                      <h3 className="font-serif font-black text-sm border-b border-gray-100 pb-2">Lịch sử bài thi & Chấm điểm</h3>
                      
                      <div className="space-y-3">
                        {userResults.length === 0 ? (
                          <div className="text-center py-8 text-xs font-bold text-gray-400">
                            Bạn chưa tham gia bài thi/luyện tập nào. Hãy chọn kỹ năng ở menu bên trái để bắt đầu!
                          </div>
                        ) : (
                          userResults.map((history, idx) => {
                            const formattedDate = new Date(history.createdAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            });
                            
                            const skillNames = {
                              READING: 'Reading 📖',
                              LISTENING: 'Listening 🎧',
                              WRITING: 'Writing ✍️',
                              SPEAKING: 'Speaking 🗣️'
                            };
                            
                            const displayType = skillNames[history.type as keyof typeof skillNames] || history.type;

                            return (
                              <div key={history.id || idx} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0">
                                <div>
                                  <p className="font-bold text-gray-800">{history.title}</p>
                                  <p className="text-[10px] text-gray-400">{formattedDate} • Kỹ năng: {displayType}</p>
                                </div>
                                <div className="bg-[#ffd54f] border border-[#1b263b] px-2 py-0.5 rounded-lg font-mono font-bold text-[#1b263b]">
                                  Band {history.bandScore !== null && history.bandScore !== undefined ? history.bandScore : '0.0'}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* ======================================================== */}
            {/* MODALS SECTION */}
            {/* ======================================================== */}

            {/* MENTOR: CREATE SLOT MODAL */}
            {showCreateSlotModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1b263b] max-w-md w-full relative space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1b263b]/10 pb-3">
                    <h3 className="font-serif font-black text-xl text-[#1b263b]">Tạo Khung Giờ Rảnh</h3>
                    <button onClick={() => setShowCreateSlotModal(false)} className="text-xl font-black text-[#1b263b] hover:opacity-75">✕</button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black uppercase text-gray-500">Ngày dạy (YYYY-MM-DD)</label>
                      <input 
                        type="date" 
                        value={slotDate} 
                        onChange={(e) => setSlotDate(e.target.value)}
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase text-gray-500">Giờ bắt đầu</label>
                        <input 
                          type="time" 
                          value={slotStartTime} 
                          onChange={(e) => setSlotStartTime(e.target.value)}
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase text-gray-500">Giờ kết thúc</label>
                        <input 
                          type="time" 
                          value={slotEndTime} 
                          onChange={(e) => setSlotEndTime(e.target.value)}
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-black uppercase text-gray-500">Link phòng học (Meeting link)</label>
                      <input 
                        type="text" 
                        value={slotMeetingLink} 
                        onChange={(e) => setSlotMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/..."
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowCreateSlotModal(false)}
                      className="flex-1 border-2 border-[#1b263b] bg-white py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      disabled={isSubmittingSlot}
                      onClick={handleConfirmCreateSlot}
                      className="flex-1 border-2 border-[#1b263b] bg-[#ffd54f] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_#1b263b] disabled:opacity-50"
                    >
                      {isSubmittingSlot ? 'Đang tạo...' : 'Xác Nhận'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MENTOR: SLOT DETAIL MODAL */}
            {showSlotDetailModal && selectedSlotForDetail && selectedSlotForDetail.booking && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1b263b] max-w-lg w-full relative space-y-4 my-8">
                  <div className="flex justify-between items-center border-b border-[#1b263b]/10 pb-3">
                    <h3 className="font-serif font-black text-xl text-[#1b263b]">Chi Tiết Lịch Hẹn</h3>
                    <button onClick={() => setShowSlotDetailModal(false)} className="text-xl font-black text-[#1b263b] hover:opacity-75">✕</button>
                  </div>

                  <div className="space-y-4 text-left overflow-y-auto max-h-[70vh] pr-2">
                    {/* Status and Time */}
                    <div className="flex justify-between items-center bg-[#ffd54f] border-2 border-[#1b263b] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b]">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500">Thời gian dạy học</p>
                        <p className="text-xs font-black text-[#1b263b]">
                          {formatDateTime(selectedSlotForDetail.startTime)} - {formatDateTime(selectedSlotForDetail.endTime).split(' ').pop()}
                        </p>
                      </div>
                      <span className="text-[10px] font-black border-2 border-[#1b263b] bg-white px-2 py-0.5 rounded uppercase">
                        {selectedSlotForDetail.booking.status === 'CONFIRMED' ? 'ĐÃ DUYỆT' :
                         selectedSlotForDetail.booking.status === 'COMPLETED' ? 'HOÀN THÀNH' :
                         selectedSlotForDetail.booking.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
                      </span>
                    </div>

                    {/* Student Info */}
                    <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 space-y-2">
                      <p className="text-[10px] font-black uppercase text-gray-400">Thông tin học viên</p>
                      <h4 className="font-serif font-black text-base text-[#1b263b]">
                        👤 {selectedSlotForDetail.booking.student?.fullName || 'Học viên ẩn danh'}
                      </h4>
                      <p className="text-xs font-bold text-gray-600">✉ Email: {selectedSlotForDetail.booking.student?.email || 'Chưa cung cấp'}</p>
                      {selectedSlotForDetail.booking.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            const bookingObj = {
                              ...selectedSlotForDetail.booking,
                              startTime: selectedSlotForDetail.startTime,
                              endTime: selectedSlotForDetail.endTime
                            };
                            handleOpenChat(bookingObj);
                          }}
                          className="w-full text-center border-2 border-[#1b263b] bg-sky-100 text-sky-800 font-black py-2 rounded-xl text-xs uppercase tracking-wider hover:bg-sky-200 transition-all mt-2"
                        >
                          Trò chuyện với học viên 💬
                        </button>
                      )}
                    </div>

                    {/* Student Notes */}
                    <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-400">Mục tiêu của học viên</p>
                      <p className="text-xs font-bold text-gray-700 mt-1">{selectedSlotForDetail.booking.notes || '(Không có ghi chú)'}</p>
                    </div>

                    {/* Meeting Link */}
                    {selectedSlotForDetail.meetingLink && (
                      <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase text-gray-400">Link lớp học</p>
                        <p className="text-xs font-bold text-sky-600 mt-1 truncate">
                          🔗 <a href={selectedSlotForDetail.meetingLink} target="_blank" rel="noreferrer" className="underline">{selectedSlotForDetail.meetingLink}</a>
                        </p>
                      </div>
                    )}

                    {/* Rating Feedback */}
                    {selectedSlotForDetail.booking.status === 'COMPLETED' && selectedSlotForDetail.booking.rating && (
                      <div className="bg-amber-50 border-2 border-[#1b263b] rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase text-amber-800">Đánh giá từ học viên: {'⭐'.repeat(selectedSlotForDetail.booking.rating)}</p>
                        {selectedSlotForDetail.booking.comment && (
                          <p className="text-xs font-bold italic text-gray-700 mt-1">"{selectedSlotForDetail.booking.comment}"</p>
                        )}
                      </div>
                    )}

                    {/* Action form for cancel reason */}
                    {showCancelReasonForm ? (
                      <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-black uppercase text-rose-800">Lý do hủy lịch (bắt buộc):</p>
                        <textarea
                          rows={2}
                          value={cancelReasonInput}
                          onChange={(e) => setCancelReasonInput(e.target.value)}
                          placeholder="Lý do hủy..."
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl p-2 text-xs font-bold outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setShowCancelReasonForm(false); setCancelReasonInput(''); }}
                            className="flex-1 bg-white border border-[#1b263b] py-1.5 rounded-lg text-[10px] font-black uppercase"
                          >
                            Quay lại
                          </button>
                          <button
                            onClick={handleConfirmCancelBookingWithReason}
                            className="flex-1 bg-rose-600 text-white border border-[#1b263b] py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-rose-700"
                          >
                            Xác nhận hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        {selectedSlotForDetail.booking.status === 'PENDING' && (
                          <>
                            <button
                              disabled={isAccepting}
                              onClick={() => handleAcceptBooking(selectedSlotForDetail.booking.id)}
                              className="flex-1 border-2 border-[#1b263b] bg-emerald-100 text-emerald-800 hover:bg-emerald-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                            >
                              {isAccepting ? 'Đang duyệt...' : 'Phê Duyệt ✓'}
                            </button>
                            <button
                              onClick={() => handleCancelBookingByMentor(selectedSlotForDetail.booking.id)}
                              className="flex-1 border-2 border-[#1b263b] bg-rose-100 text-rose-800 hover:bg-rose-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                            >
                              Từ chối ✕
                            </button>
                          </>
                        )}
                        {selectedSlotForDetail.booking.status === 'CONFIRMED' && (
                          <>
                            <button
                              disabled={isCompleting}
                              onClick={() => handleCompleteBooking(selectedSlotForDetail.booking.id)}
                              className="flex-1 border-2 border-[#1b263b] bg-emerald-100 text-emerald-800 hover:bg-emerald-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                            >
                              {isCompleting ? 'Đang xử lý...' : 'Hoàn Thành ✓'}
                            </button>
                            <button
                              onClick={() => setShowCancelReasonForm(true)}
                              className="flex-1 border-2 border-[#1b263b] bg-rose-100 text-rose-800 hover:bg-rose-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                            >
                              Hủy Lịch Hẹn ✕
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Mentor notes edit after completed */}
                    {selectedSlotForDetail.booking.status === 'COMPLETED' && (
                      <div className="space-y-2 border-t border-[#1b263b]/10 pt-4">
                        <label className="text-[10px] font-black uppercase text-gray-500">Nhận xét của bạn (Mentor Notes)</label>
                        <textarea
                          rows={3}
                          value={mentorNotesEdit}
                          onChange={(e) => setMentorNotesEdit(e.target.value)}
                          placeholder="Ghi nhận xét của bạn sau buổi dạy..."
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl p-3 text-xs font-bold outline-none"
                        />
                        <button
                          disabled={isSavingNotes}
                          onClick={handleSaveMentorNotes}
                          className="w-full border-2 border-[#1b263b] bg-[#1b263b] text-white hover:bg-gray-800 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                        >
                          {isSavingNotes ? 'Đang lưu...' : 'Lưu Nhận Xét'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STUDENT: RATING MODAL */}
            {showRatingModal && selectedBookingForRating && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1b263b] max-w-md w-full relative space-y-4">
                  <div className="flex justify-between items-center border-b border-[#1b263b]/10 pb-3">
                    <h3 className="font-serif font-black text-xl text-[#1b263b]">Đánh Giá Buổi Học</h3>
                    <button onClick={() => setShowRatingModal(false)} className="text-xl font-black text-[#1b263b] hover:opacity-75">✕</button>
                  </div>

                  <p className="text-xs font-bold text-gray-500 text-center">
                    Vui lòng đánh giá chất lượng buổi học và đóng góp ý kiến để gia sư hoàn thiện hơn nhé!
                  </p>

                  <div className="space-y-4 text-left">
                    <div className="text-center space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-500 block">ĐÁNH GIÁ (SAO)</label>
                      <div className="flex justify-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingValue(star)}
                            className="text-3xl focus:outline-none hover:scale-110 transition-transform"
                          >
                            {star <= ratingValue ? '⭐' : '☆'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-500">Ý kiến đóng góp (Bình luận)</label>
                      <textarea
                        rows={3}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Nhập cảm nghĩ về buổi học..."
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl p-3 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowRatingModal(false)}
                      className="flex-1 border-2 border-[#1b263b] bg-white py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                    >
                      Đóng
                    </button>
                    <button
                      disabled={isSubmittingRating}
                      onClick={handleSubmitRating}
                      className="flex-1 border-2 border-[#1b263b] bg-[#ffd54f] py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-[2px_2px_0px_0px_#1b263b] disabled:opacity-50"
                    >
                      {isSubmittingRating ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT PANEL MODAL (DRAWER / OVERLAY) */}
            {showChatModal && selectedBookingForChat && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1b263b] max-w-lg w-full h-[80vh] flex flex-col relative">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-[#1b263b]/10 pb-3 shrink-0">
                    <div className="text-left">
                      <h3 className="font-serif font-black text-lg text-[#1b263b] truncate max-w-[280px]">
                        Chat: {isMentor ? selectedBookingForChat.student?.fullName || 'Học viên' : selectedBookingForChat.mentor?.fullName || 'Gia sư'}
                      </h3>
                      <p className="text-[9px] font-bold text-gray-500 mt-0.5">Lịch: {formatDateTime(selectedBookingForChat.startTime)}</p>
                    </div>
                    <button onClick={() => setShowChatModal(false)} className="text-xl font-black text-[#1b263b] hover:opacity-75">✕</button>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 overflow-y-auto bg-white border-2 border-[#1b263b] rounded-2xl p-4 my-4 space-y-3">
                    {isLoadingChatHistory ? (
                      <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400 animate-pulse">⏳ Đang tải lịch sử trò chuyện...</div>
                    ) : chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                        <span className="text-4xl">💬</span>
                        <p className="text-xs font-bold">Hãy gửi lời chào đầu tiên!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.senderId === (user?.id || user?._id);
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] border-2 border-[#1b263b] rounded-2xl p-3 shadow-[2px_2px_0px_0px_#1b263b] text-left ${
                              isMe ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-50 text-gray-800'
                            }`}>
                              {!isMe && (
                                <p className="text-[9px] font-black text-indigo-700 uppercase mb-1">
                                  {msg.sender?.fullName || 'Đối phương'}
                                </p>
                              )}
                              
                              {msg.fileUrl ? (
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 bg-white/80 border border-[#1b263b]/20 p-2 rounded-xl hover:bg-white transition-all mt-1"
                                >
                                  <span className="text-2xl">📄</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-[#1b263b] truncate">{msg.fileName || 'Tài liệu'}</p>
                                    <p className="text-[9px] text-gray-500 font-bold">{msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'Tệp đính kèm'}</p>
                                  </div>
                                  <span className="text-lg">📥</span>
                                </a>
                              ) : (
                                <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              )}
                              
                              <span className="block text-[8px] text-gray-400 font-bold mt-1 text-right">
                                {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Send Input Area */}
                  <div className="flex gap-2 shrink-0">
                    <label className={`border-2 border-[#1b263b] ${isSendingChatMessage ? 'bg-gray-200 cursor-not-allowed' : 'bg-emerald-100 hover:bg-emerald-200'} text-[#1b263b] rounded-xl px-4 py-2.5 cursor-pointer shadow-[2px_2px_0px_0px_#1b263b] transition-all flex items-center justify-center`}>
                      <span className="text-base font-bold">{isSendingChatMessage ? '⏳' : '📎'}</span>
                      <input 
                        type="file" 
                        disabled={isSendingChatMessage}
                        onChange={handleWebFileUpload}
                        className="hidden" 
                      />
                    </label>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2 text-xs font-bold outline-none focus:bg-gray-50"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      className="border-2 border-[#1b263b] bg-[#ffd54f] hover:bg-yellow-400 text-[#1b263b] rounded-xl px-4 py-2 font-black shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
