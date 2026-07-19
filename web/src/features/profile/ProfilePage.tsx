import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout, loginSuccess, updateUser } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';
import { useModal } from '../shared/ModalProvider';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showAlert } = useModal();

  // Active tab state matching real IELTS learning features: 'overview' | 'profile' | 'history' | 'achievements' | 'mentorRegister'
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'history' | 'achievements' | 'mentorRegister'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Loaders & Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Avatar Upload States
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form states for Settings (fully synced with database)
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formIdentityNumber, setFormIdentityNumber] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formExpertise, setFormExpertise] = useState('');
  const [form2FA, setForm2FA] = useState(false);
  const [formSaved, setFormSaved] = useState(false);

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Mentor request states
  const [mentorRequest, setMentorRequest] = useState<any>(null);
  const [mentorReqBio, setMentorReqBio] = useState('');
  const [mentorReqExpertise, setMentorReqExpertise] = useState('');
  const [mentorReqCerts, setMentorReqCerts] = useState<{ filename: string; base64Data: string }[]>([]);
  const [mentorReqSubmitting, setMentorReqSubmitting] = useState(false);

  const handleCertificatesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        await showAlert(`File ${file.name} vượt quá dung lượng cho phép (tối đa 10MB)`);
        continue;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result as string;
        setMentorReqCerts((prev) => [...prev, { filename: file.name, base64Data }]);
      };
      reader.onerror = async () => {
        await showAlert(`Không thể đọc file: ${file.name}`);
      };
    }
  };

  const removeCertificateFile = (index: number) => {
    setMentorReqCerts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMentorRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorReqCerts.length === 0) {
      await showAlert('Vui lòng chọn ít nhất một chứng chỉ tiếng Anh!');
      return;
    }

    setMentorReqSubmitting(true);
    try {
      const res = await apiClient.post('/users/me/mentor-request', {
        bio: mentorReqBio,
        expertise: mentorReqExpertise,
        certificates: mentorReqCerts
      });

      if (res.data?.success) {
        await showAlert('Gửi yêu cầu đăng ký Mentor thành công!');
        setMentorReqBio('');
        setMentorReqExpertise('');
        setMentorReqCerts([]);
        loadData(); // reload status
      } else {
        await showAlert('Gửi yêu cầu thất bại.');
      }
    } catch (err: any) {
      console.error('Mentor register submit failed:', err);
      await showAlert('Lỗi: ' + (err.response?.data?.error?.message || err.response?.data?.message || err.message));
    } finally {
      setMentorReqSubmitting(false);
    }
  };

  // Interactive Tasks list inside the Checklist Card
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Luyện tập Reading hoặc Listening', progress: '1/1 bài', done: true },
    { id: 2, text: 'Stream âm thanh bài nói Speaking AI', progress: '0/1 bài', done: false },
    { id: 3, text: 'Luyện viết IELTS Writing Task 2', progress: '0/1 bài', done: false },
    { id: 4, text: 'Kiểm tra lịch sử & phản hồi từ Mentor', progress: '1/1', done: true },
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newDone = !t.done;
        return {
          ...t,
          done: newDone,
          progress: t.id === 1 ? (newDone ? '1/1 bài' : '0/1 bài') :
                    t.id === 2 ? (newDone ? '1/1 bài' : '0/1 bài') :
                    t.id === 3 ? (newDone ? '1/1 bài' : '0/1 bài') :
                    t.id === 4 ? (newDone ? '1/1' : '0/1') : t.progress
        };
      }
      return t;
    }));
  };

  const completedTasksCount = tasks.filter(t => t.done).length;

  // Fetch all profile details, stats, exam results, and mentor bookings from backend
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile Info
      const profileRes = await apiClient.get('/auth/profile');
      const profile = profileRes.data.metadata || profileRes.data;
      if (profile) {
        dispatch(updateUser(profile));
        setFormFullName(profile.fullName || '');
        setFormEmail(profile.email || '');
        setFormPhone(profile.phone || '');
        setFormBirthDate(profile.birthday || '');
        setFormIdentityNumber(profile.identityNumber || '');
        setFormBio(profile.bio || '');
        setFormExpertise(profile.expertise || '');
        setForm2FA(profile.isTwoFactorEnabled || false);
      }

      // 2. Fetch Aggregated Exam Stats
      const statsRes = await apiClient.get('/users/me/stats');
      setStats(statsRes.data?.data || null);

      // 3. Fetch Completed Exam History
      const resultsRes = await apiClient.get('/users/me/results');
      setResults(resultsRes.data?.data?.results || []);

      // 4. Fetch Mentor Request status if student
      if (profile && (profile.role === 'STUDENT' || user?.role === 'STUDENT')) {
        try {
          const reqRes = await apiClient.get('/users/me/mentor-request');
          setMentorRequest(reqRes.data?.data || null);
        } catch (e) {
          console.error('Failed to load mentor request status:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync tab with search parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'profile') {
      setActiveTab('profile');
    } else if (tabParam === 'history') {
      setActiveTab('history');
    } else if (tabParam === 'achievements') {
      setActiveTab('achievements');
    } else if (tabParam === 'mentorRegister') {
      setActiveTab('mentorRegister');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      await showAlert("Kích thước ảnh phải nhỏ hơn 5MB");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      setUploadingAvatar(true);

      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        if (!token || !userStr) {
          throw new Error("Bạn cần đăng nhập để tải ảnh đại diện");
        }
        const currentUser = JSON.parse(userStr);
        const userId = currentUser.id || currentUser._id;

        const res = await apiClient.post('/auth/upload-avatar', 
          { image: base64Image },
          {
            headers: {
              'x-client-id': userId,
              'authorization': `Bearer ${token}`
            }
          }
        );

        const newAvatarUrl = res.data.metadata.avatar;
        
        // Update user state in Redux & LocalStorage
        dispatch(loginSuccess({ 
          user: { ...currentUser, avatar: newAvatarUrl }, 
          token 
        }));
        
        await showAlert("Cập nhật ảnh đại diện thành công!");
        loadData(); // Reload details
      } catch (err: any) {
        console.error("Avatar upload failed:", err);
        await showAlert("Lỗi khi tải ảnh đại diện lên: " + (err.response?.data?.error?.message || err.response?.data?.message || err.message));
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.onerror = async () => {
      await showAlert("Không thể đọc tệp tin hình ảnh");
    };
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.patch('/auth/profile', {
        fullName: formFullName,
        email: formEmail,
        phone: formPhone,
        birthday: formBirthDate,
        identityNumber: formIdentityNumber,
        bio: formBio,
        expertise: formExpertise,
        isTwoFactorEnabled: form2FA
      });

      const updatedUser = res.data.metadata || res.data;
      
      // Update Redux state and LocalStorage
      const token = localStorage.getItem('auth_token') || '';
      localStorage.setItem('auth_user', JSON.stringify({
        ...updatedUser,
        id: updatedUser._id // Normalize ID structure
      }));

      dispatch(loginSuccess({ 
        user: { ...updatedUser, id: updatedUser._id }, 
        token 
      }));

      setFormSaved(true);
      setTimeout(() => {
        setFormSaved(false);
        setIsEditing(false);
      }, 1500);

      loadData(); // reload stats and text
    } catch (err: any) {
      console.error("Save profile settings failed:", err);
      await showAlert("Lỗi khi lưu thông tin: " + (err.response?.data?.error?.message || err.response?.data?.message || err.message));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp!' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error("Change password failed:", err);
      setPasswordMessage({ 
        type: 'error', 
        text: err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Lỗi khi đổi mật khẩu!' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Stats values derived dynamically
  const studyHours = stats?.studyHours !== null && stats?.studyHours !== undefined ? stats.studyHours : 0;

  const initials = formFullName
    ? formFullName.split(' ').slice(-1)[0][0]?.toUpperCase()
    : 'A';

  // XP level calculation
  const computedXp = (stats?.totalTests || 0) * 120 + Math.round((stats?.studyHours || 0) * 50);
  const totalXp = 520 + computedXp;
  const currentLevel = Math.floor(totalXp / 500) + 1;
  const progressXp = totalXp % 500;
  const xpPercent = Math.min(Math.round((progressXp / 500) * 100), 100);

  // Active days grid cells calculation
  const totalDays = 42;
  const currentStreakVal = stats?.currentStreak || 1;
  const gridCells = Array.from({ length: totalDays }).map((_, idx) => {
    const isCurrentStreak = idx >= totalDays - currentStreakVal;
    const isHistoricalActive = idx < totalDays - 7 && (idx % 3 === 0 || idx % 7 === 2);
    const isActive = isCurrentStreak || isHistoricalActive;
    return { isActive, isCurrentStreak };
  });

  const friends = [
    { id: 1, name: 'Admin Apex IELTS', initials: 'AD', school: 'Đại học Bách Khoa Hà Nội', streak: 1 },
    { id: 2, name: 'Lam Vu', initials: 'LA', school: 'Đại học Sư phạm Hà Nội', streak: 11 },
    { id: 3, name: 'Nguyễn Văn Anh', initials: 'NA', school: 'Đại học Ngoại thương', streak: 1, image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' },
    { id: 4, name: 'Vy Vũ', initials: 'VY', school: 'Đại học Kinh tế Quốc dân', streak: 4 },
  ];

  const subjectProgress = [
    { name: 'IELTS Reading', score: stats?.readingBand ? `${stats.readingBand} Band` : 'N/A', progress: stats?.readingBand ? Math.min(Math.round((stats.readingBand / 9) * 100), 100) : 0, color: 'bg-emerald-500' },
    { name: 'IELTS Listening', score: stats?.listeningBand ? `${stats.listeningBand} Band` : 'N/A', progress: stats?.listeningBand ? Math.min(Math.round((stats.listeningBand / 9) * 100), 100) : 0, color: 'bg-sky-500' },
    { name: 'IELTS Writing', score: stats?.writingBand ? `${stats.writingBand} Band` : 'N/A', progress: stats?.writingBand ? Math.min(Math.round((stats.writingBand / 9) * 100), 100) : 0, color: 'bg-amber-500' },
    { name: 'IELTS Speaking', score: stats?.speakingBand ? `${stats.speakingBand} Band` : 'N/A', progress: stats?.speakingBand ? Math.min(Math.round((stats.speakingBand / 9) * 100), 100) : 0, color: 'bg-purple-500' },
  ];

  const achievements = [
    { id: 1, title: 'Kỷ Luật Thép', desc: 'Đạt chuỗi streak học tập liên tiếp 5 ngày', earned: (stats?.currentStreak || 0) >= 5 },
    { id: 2, title: 'Chăm Chỉ Học Tập', desc: 'Tích lũy 3 giờ học trên hệ thống', earned: (stats?.studyHours || 0) >= 3 },
    { id: 3, title: 'Chiến binh IELTS', desc: 'Hoàn thành bài thi thử đầu tiên', earned: (stats?.totalTests || 0) >= 1 },
    { id: 4, title: 'Vượt Ải Listening', desc: 'Đạt điểm Listening đầu tiên', earned: (stats?.listeningBand || 0) > 0 },
    { id: 5, title: 'Nhà Văn IELTS', desc: 'Hoàn thành 1 bài viết Writing', earned: (stats?.writingBand || 0) > 0 },
    { id: 6, title: 'Diễn Thuyết AI', desc: 'Hoàn thành 1 bài nói Speaking AI', earned: (stats?.speakingBand || 0) > 0 },
  ];


  return (
    <div 
      className="min-h-screen bg-[#f6f3db] text-[#1b263b] font-sans antialiased relative overflow-x-hidden custom-pencil-cursor flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(#eae6ca 1px, transparent 1px)',
        backgroundSize: '100% 2.75rem'
      }}
    >
      
      {/* Real Spiral Binder Graphic on the Left side */}
      <div className="absolute left-3 top-0 bottom-0 w-10 flex flex-col justify-around pointer-events-none z-20 opacity-90 select-none py-6">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 h-6">
            <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400/50 shadow-inner" />
            <div className="w-8 h-2 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full shadow-md border-t border-white/20 transform -translate-x-1" />
          </div>
        ))}
      </div>

      {/* Red vertical margin line of notebook paper */}
      <div className="absolute left-[79px] top-0 bottom-0 w-0.5 bg-[#e0565b]/50 pointer-events-none z-10" />

      {/* HEADER SECTION - Solid Background */}
      <div className="bg-[#f6f3db] border-b-2 border-[#1b263b]/10 z-30">
        <header className="max-w-7xl mx-auto pl-[110px] pr-6 md:pr-12 py-5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#b03030] border-2 border-[#1b263b] rounded flex items-center justify-center text-white font-serif font-black text-xl shadow-[2px_2px_0px_0px_#1b263b]">
                A
              </div>
              <span className="text-xl font-serif font-black tracking-tight text-[#1b263b]">
                Apex IELTS
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black text-[#1b263b]/80 uppercase tracking-wider">
            <Link to="/" className="hover:text-[#b03030] transition-colors">Home</Link>
            <Link to="/practice" className="hover:text-[#b03030] transition-colors">Practice</Link>
          </nav>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="bg-white border-2 border-[#1b263b] px-5 py-2 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b]"
            >
              Sign Out
            </button>
            <Link
              to="/practice"
              className="bg-[#b03030] text-white border-2 border-[#1b263b] px-5 py-2 rounded-xl text-xs font-black hover:bg-[#902020] transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center gap-1"
            >
              📖 OPEN NOTEBOOK
            </Link>
          </div>

        </header>
      </div>

      {/* BODY CONTENT */}
      <div className="max-w-7xl w-full mx-auto pl-[110px] pr-6 md:pr-12 py-10 flex-1 flex flex-col gap-6 z-10">
        
        {loading ? (
          <div className="py-20 text-center text-sm font-black text-[#1b263b] animate-pulse">
            📝 Loading profile workspace...
          </div>
        ) : (
          <>
            {/* TOP PROFILE CARD BANNER */}
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-[24px] shadow-[4px_4px_0px_0px_#1b263b] overflow-hidden relative text-left">
              {/* Green Header Banner Block */}
              <div className="h-32 bg-[#005c42] relative border-b-2 border-[#1b263b]">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>

              {/* Overlapping Info Block */}
              <div className="px-6 pb-6 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 -mt-16 relative z-10">
                  {/* Avatar Container */}
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-[#1b263b] border-4 border-[#fcfbf7] flex items-center justify-center text-white font-serif font-black text-4xl shadow-[3px_3px_0px_0px_#1b263b] relative group cursor-pointer overflow-hidden select-none shrink-0"
                    title="Nhấn để đổi ảnh đại diện"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <span className="text-[9px] text-white font-black animate-pulse">UPLOADING...</span>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    onChange={handleAvatarChange} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  {/* User credentials */}
                  <div className="space-y-1.5 md:pt-12 text-left">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-2xl font-serif font-black text-[#1b263b] leading-tight">
                        {formFullName || user?.username || 'Nguyen Van A'}
                      </h2>
                      <span className="bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        PRO
                      </span>
                      <span className="bg-[#dbeafe] border border-[#1b263b] text-[#1e40af] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Cấp {currentLevel}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 font-bold">@{user?.username || 'nguyenvana'}</p>
                    
                    {/* Level Progress */}
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] font-black text-gray-500 whitespace-nowrap">
                        Tiến trình Cấp {currentLevel}
                      </span>
                      <div className="w-36 h-2.5 bg-[#eae6ca]/50 rounded-full border border-[#1b263b] overflow-hidden shadow-inner">
                        <div className="bg-[#10b981] h-full" style={{ width: `${xpPercent}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-[#1b263b]/70">
                        {progressXp}/500 XP ({xpPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit & Share buttons */}
                <div className="flex gap-2 self-stretch md:self-auto pt-2 md:pt-8">
                  <button 
                    onClick={async () => await showAlert("Link profile: " + window.location.href)}
                    className="flex-1 md:flex-none bg-white border-2 border-[#1b263b] px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🔗</span> Chia sẻ
                  </button>
                  <button 
                    onClick={() => {
                      setSearchParams({ tab: 'profile' });
                      setActiveTab('profile');
                      setIsEditing(true);
                    }}
                    className="flex-1 md:flex-none bg-[#1b263b] text-white border-2 border-[#1b263b] px-4 py-2 rounded-xl text-xs font-black hover:bg-[#324566] transition-all shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>✏️</span> Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_#1b263b] flex items-center gap-3.5 text-left">
                <div className="p-2 bg-[#dbeafe] border border-[#1b263b] rounded-xl text-xl shadow-[1px_1px_0px_0px_#1b263b] select-none">
                  🎯
                </div>
                <div>
                  <p className="text-base font-serif font-black text-[#1b263b] leading-tight">
                    {stats?.overallBand ? `${stats.overallBand.toFixed(1)} Overall` : 'N/A Overall'}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Điểm IELTS trung bình</p>
                </div>
              </div>

              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_#1b263b] flex items-center gap-3.5 text-left">
                <div className="p-2 bg-[#fce7f3] border border-[#1b263b] rounded-xl text-xl shadow-[1px_1px_0px_0px_#1b263b] select-none">
                  📚
                </div>
                <div>
                  <p className="text-base font-serif font-black text-[#1b263b] leading-tight">{stats?.totalTests || 0} bài Test</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Đã hoàn thành</p>
                </div>
              </div>

              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_#1b263b] flex items-center gap-3.5 text-left">
                <div className="p-2 bg-[#ffedd5] border border-[#1b263b] rounded-xl text-xl shadow-[1px_1px_0px_0px_#1b263b] select-none">
                  🔥
                </div>
                <div>
                  <p className="text-base font-serif font-black text-[#1b263b]">{stats?.currentStreak || 0} ngày</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
                    Streak liên tiếp
                  </p>
                </div>
              </div>

              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-4.5 shadow-[3px_3px_0px_0px_#1b263b] flex items-center gap-3.5 text-left">
                <div className="p-2 bg-[#e2f0d9] border border-[#1b263b] rounded-xl text-xl shadow-[1px_1px_0px_0px_#1b263b] select-none">
                  ⏱️
                </div>
                <div>
                  <p className="text-base font-serif font-black text-[#1b263b]">{stats?.studyHours || 0} giờ</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-0.5">Thời gian học tập</p>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* HABIT STREAK TRACKER */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1b263b] text-left relative">
                  <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-3 mb-4">
                    <h3 className="font-serif font-black text-sm text-[#1b263b] flex items-center gap-1.5">
                      🔥 Streak ngày học
                    </h3>
                    <span className="bg-[#ffedd5] border border-orange-500/30 text-orange-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      🔥 {stats?.currentStreak || 1} ngày
                    </span>
                  </div>

                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">6 tuần gần đây</p>
                  
                  <div className="space-y-1">
                    <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                        <span key={day} className="text-[10px] font-black text-gray-400">{day}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {gridCells.map((cell, idx) => (
                        <div key={idx} className="flex justify-center items-center">
                          <div 
                            className={`w-[26px] h-[26px] rounded-full flex items-center justify-center transition-all ${
                              cell.isActive 
                                ? 'bg-gradient-to-br from-[#ffd54f] to-[#f97316] border border-[#1b263b] shadow-inner text-white' 
                                : 'bg-gray-100 border border-gray-200 text-transparent'
                            }`}
                            title={cell.isActive ? "Học tập tích cực" : "Chưa học"}
                          >
                            {cell.isActive && <span className="text-[11px] select-none">🔥</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1b263b]/10 text-center">
                    <div>
                      <p className="text-sm font-serif font-black text-[#1b263b]">{stats?.currentStreak || 1} ngày</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Streak hiện tại</p>
                    </div>
                    <div>
                      <p className="text-sm font-serif font-black text-[#1b263b]">{stats?.hasCheckedInToday ? 'Đã học' : 'Chưa học'}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Hôm nay</p>
                    </div>
                    <div>
                      <p className="text-sm font-serif font-black text-[#1b263b]">{Math.max(0, 100 - (stats?.currentStreak || 1))} ngày</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Cần thêm</p>
                    </div>
                  </div>
                </div>

                {/* STUDY STATS */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1b263b] text-left">
                  <h3 className="font-serif font-black text-sm text-[#1b263b] border-b border-[#1b263b]/10 pb-3 mb-4 flex items-center gap-1.5">
                    📊 Thống kê học tập
                  </h3>

                  <div className="space-y-2.5">
                    {[
                      { label: 'Tổng thời gian học', val: `${studyHours} giờ`, bg: 'bg-[#eefcf3] text-[#005c42]' },
                      { label: 'Đề Listening đã làm', val: `${results.filter((r: any) => r.type === 'LISTENING').length} bài`, bg: 'bg-[#eef6ff] text-[#1e40af]' },
                      { label: 'Đề Reading đã làm', val: `${results.filter((r: any) => r.type === 'READING').length} bài`, bg: 'bg-[#faf5ff] text-[#6b21a8]' },
                      { label: 'Bài Writing đã viết', val: `${results.filter((r: any) => r.type === 'WRITING').length} bài`, bg: 'bg-[#fffbeb] text-[#854d0e]' },
                      { label: 'Bài Speaking đã nói', val: `${results.filter((r: any) => r.type === 'SPEAKING').length} bài`, bg: 'bg-[#fff5f5] text-[#9d174d]' },
                      { label: 'Tổng số đề hoàn thành', val: `${stats?.totalTests || results.length} đề`, bg: 'bg-[#f9fafb] text-[#374151]' }
                    ].map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl border border-[#1b263b]/15 ${item.bg}`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>
                        <span className="text-xs font-black">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* NAVIGATION TABS */}
                <div className="bg-[#eae6ca]/60 border-2 border-[#1b263b] p-1 rounded-2xl flex flex-wrap gap-1 shadow-sm text-left">
                  {[
                    { id: 'overview', label: 'Tổng quan' },
                    { id: 'profile', label: 'Hồ sơ' },
                    { id: 'history', label: 'Lịch sử làm bài' },
                    { id: 'achievements', label: 'Thành tích' },
                    ...(user?.role === 'STUDENT' || user?.role === 'MENTOR' ? [{ id: 'mentorRegister', label: 'Đăng ký Mentor' }] : [])
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSearchParams({ tab: tab.id });
                        setActiveTab(tab.id as any);
                        if (tab.id !== 'profile') setIsEditing(false);
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#1b263b] text-[#f6f3db] shadow-md'
                          : 'text-[#1b263b] hover:bg-[#1b263b]/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB SPECIFIC CONTAINER */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] min-h-[460px] text-left">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      
                      {/* ACTIVITY LINE CHART */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif font-black text-lg text-[#1b263b] flex items-center gap-1.5">
                            📈 Hoạt động 7 ngày qua
                          </h4>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Phút học
                          </span>
                        </div>

                        <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-2xl p-4 relative">
                          <div className="flex gap-4">
                            <div className="flex flex-col justify-between text-[9px] font-black text-gray-400 py-1.5 text-right w-8 select-none">
                              <span>16 ph</span>
                              <span>12 ph</span>
                              <span>8 ph</span>
                              <span>4 ph</span>
                              <span>0 ph</span>
                            </div>
                            
                            <div className="flex-1 relative h-48 border-l border-b border-[#1b263b]/25">
                              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                                <defs>
                                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                
                                <line x1="10" y1="30" x2="490" y2="30" stroke="#1b263b" strokeOpacity="0.06" strokeDasharray="3 3" />
                                <line x1="10" y1="70" x2="490" y2="70" stroke="#1b263b" strokeOpacity="0.06" strokeDasharray="3 3" />
                                <line x1="10" y1="110" x2="490" y2="110" stroke="#1b263b" strokeOpacity="0.06" strokeDasharray="3 3" />
                                <line x1="10" y1="150" x2="490" y2="150" stroke="#1b263b" strokeOpacity="0.06" strokeDasharray="3 3" />

                                <path 
                                  d="M 50,190 L 110,190 L 170,190 L 230,190 L 290,190 L 350,190 C 395,190 410,170 430,50 L 430,190 Z" 
                                  fill="url(#chartGradient)" 
                                />

                                <path 
                                  d="M 50,190 L 110,190 L 170,190 L 230,190 L 290,190 L 350,190 C 395,190 410,170 430,50" 
                                  fill="none" 
                                  stroke="#10b981" 
                                  strokeWidth="3.5" 
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                <circle cx="50" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="110" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="170" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="230" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="290" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="350" cy="190" r="4.5" fill="white" stroke="#10b981" strokeWidth="2.5" />
                                <circle cx="430" cy="50" r="6" fill="#10b981" stroke="white" strokeWidth="2" />
                              </svg>
                            </div>
                          </div>

                          <div className="flex justify-between pl-12 text-[10px] font-black text-gray-400 pt-2 select-none">
                            <span>Thứ 3</span>
                            <span>Thứ 4</span>
                            <span>Thứ 5</span>
                            <span>Thứ 6</span>
                            <span>Thứ 7</span>
                            <span>Chủ Nhật</span>
                            <span>Thứ 2</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                          <div className="bg-white border border-[#1b263b]/10 rounded-xl p-3">
                            <p className="text-lg font-serif font-black text-[#1b263b]">14 phút</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Tổng tuần này</p>
                          </div>
                          <div className="bg-white border border-[#1b263b]/10 rounded-xl p-3">
                            <p className="text-lg font-serif font-black text-[#1b263b]">2 phút</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Trung bình / ngày</p>
                          </div>
                          <div className="bg-white border border-[#1b263b]/10 rounded-xl p-3">
                            <p className="text-lg font-serif font-black text-[#1b263b]">Thứ 2 (14 ph)</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5 leading-none">Nhiều nhất</p>
                          </div>
                        </div>
                      </div>

                      {/* LEVEL / XP BAR CHART */}
                      <div className="space-y-3 pt-2">
                        <h4 className="font-serif font-black text-lg text-[#1b263b] text-left">
                          🎯 Trình độ môn học
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {subjectProgress.map((sub, idx) => (
                            <div key={idx} className="bg-white border border-[#1b263b]/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                              <div className="flex-1 space-y-1.5 text-left">
                                <p className="text-xs font-black text-[#1b263b]">{sub.name}</p>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                  <div className={`h-full ${sub.color}`} style={{ width: `${sub.progress}%` }} />
                                </div>
                              </div>
                              <span className="text-xs font-black text-[#b03030] bg-red-50 border border-red-100 px-2.5 py-1 rounded-xl whitespace-nowrap">
                                {sub.score}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PROFILE DETAILS TAB */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      {!isEditing ? (
                        <>
                          <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-6 relative">
                            <div className="flex justify-between items-start gap-4 border-b border-[#1b263b]/10 pb-4 mb-5">
                              <div className="text-left">
                                <h4 className="font-serif font-black text-lg text-[#1b263b]">👤 Thông tin cá nhân</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Chi tiết thông tin tài khoản của bạn</p>
                              </div>
                              <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-white border border-[#1b263b] hover:bg-gray-50 text-[11px] font-black px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] transition-all flex items-center gap-1 cursor-pointer"
                              >
                                ✏️ Chỉnh sửa
                              </button>
                            </div>

                            <div className="space-y-3.5 text-xs text-left">
                              <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Họ và tên</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">{formFullName || user?.fullName || 'Nguyen Van A'}</span>
                              </div>
                              <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Học vấn / Trường</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">{formExpertise || 'Đại học Quốc gia Hà Nội'}</span>
                              </div>
                              <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Địa chỉ</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">{formIdentityNumber || 'Hà Nội, Việt Nam'}</span>
                              </div>
                              <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Ngày tham gia</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">
                                  {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }) : 'tháng 6 năm 2026'}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Email liên hệ</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">{formEmail || user?.email || 'hocvien@apexielts.com'}</span>
                              </div>
                              <div className="grid grid-cols-3">
                                <span className="font-black text-gray-400 uppercase text-[10px]">Số điện thoại</span>
                                <span className="col-span-2 font-bold text-[#1b263b]">{formPhone || 'Chưa cập nhật'}</span>
                              </div>
                            </div>
                          </div>

                        </>
                      ) : (
                        <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-6 text-left">
                          <h4 className="font-serif font-black text-xl text-[#1b263b] mb-1">Chỉnh sửa thông tin cá nhân</h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-6">Modify your profile details. They will be saved to your dashboard cloud account.</p>

                          {formSaved && (
                            <div className="mb-6 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b]">
                              ✓ Saved changes successfully!
                            </div>
                          )}

                          <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Họ và tên</label>
                              <input
                                type="text"
                                required
                                value={formFullName}
                                onChange={(e) => setFormFullName(e.target.value)}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Email liên hệ</label>
                              <input
                                type="email"
                                required
                                value={formEmail}
                                onChange={(e) => setFormEmail(e.target.value)}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Số điện thoại</label>
                                <input
                                  type="text"
                                  value={formPhone}
                                  onChange={(e) => setFormPhone(e.target.value)}
                                  placeholder="0912 345 678"
                                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Ngày sinh</label>
                                <input
                                  type="text"
                                  value={formBirthDate}
                                  onChange={(e) => setFormBirthDate(e.target.value)}
                                  placeholder="15/08/2002"
                                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Địa chỉ / CCCD</label>
                                <input
                                  type="text"
                                  value={formIdentityNumber}
                                  onChange={(e) => setFormIdentityNumber(e.target.value)}
                                  placeholder="Hà Nội, Việt Nam"
                                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Học vấn / Target</label>
                                <input
                                  type="text"
                                  value={formExpertise}
                                  onChange={(e) => setFormExpertise(e.target.value)}
                                  placeholder="Đại học Quốc gia Hà Nội"
                                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Tiểu sử (Bio / Châm ngôn)</label>
                              <textarea
                                value={formBio}
                                onChange={(e) => setFormBio(e.target.value)}
                                placeholder="Learning is sharpest when the pencil is, too."
                                rows={2}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none resize-none"
                              />
                            </div>

                            <div className="bg-[#fdfaf2] border-2 border-[#1b263b] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-between mt-6">
                              <div className="text-left">
                                <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Xác thực 2 lớp (2FA)</label>
                                <span className="text-[9px] font-bold text-gray-400 block mt-0.5">Nhận mã xác thực qua email mỗi khi đăng nhập.</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={form2FA}
                                  onChange={(e) => setForm2FA(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                              </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                              <button
                                type="submit"
                                className="flex-1 bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#91e8c1] transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer"
                              >
                                Save Changes 💾
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-white border-2 border-[#1b263b] px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-50 transition-all text-center cursor-pointer text-[#1b263b]"
                              >
                                Huỷ
                              </button>
                            </div>
                          </form>

                          {/* CHANGE PASSWORD */}
                          <div className="mt-8 pt-8 border-t border-[#1b263b]/10 text-left">
                            <h4 className="font-serif font-black text-lg text-[#1b263b] mb-1">Đổi mật khẩu</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Cập nhật mật khẩu mới cho tài khoản của bạn.</p>

                            {passwordMessage && (
                              <div className={`mb-6 border-2 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b] ${
                                passwordMessage.type === 'success' 
                                  ? 'bg-emerald-100 border-emerald-800 text-emerald-800' 
                                  : 'bg-red-100 border-red-800 text-red-800'
                              }`}>
                                {passwordMessage.text}
                              </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Mật khẩu hiện tại</label>
                                <input
                                  type="password"
                                  required
                                  value={oldPassword}
                                  onChange={(e) => setOldPassword(e.target.value)}
                                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Mật khẩu mới</label>
                                  <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Xác nhận mật khẩu mới</label>
                                  <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                                  />
                                </div>
                              </div>

                              <div className="pt-2 flex">
                                <button
                                  type="submit"
                                  disabled={passwordLoading}
                                  className="flex-1 bg-[#fbcfe8] text-[#c92a2a] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#f9a8d4] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer"
                                >
                                  {passwordLoading ? 'Đang đổi...' : 'Đổi mật khẩu 🔑'}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PRACTICE HISTORY TAB */}
                  {activeTab === 'history' && (
                    <div className="space-y-6">
                      <div className="border-b border-[#1b263b]/10 pb-4 text-left">
                        <h4 className="font-serif font-black text-lg text-[#1b263b]">📝 Lịch sử luyện tập & thi thử</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Danh sách các bài làm IELTS của bạn</p>
                      </div>

                      {results.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-[#1b263b]/10 rounded-2xl p-6">
                          <p className="text-xs font-bold text-gray-400">Bạn chưa thực hiện bài thi thử nào trên hệ thống.</p>
                          <Link 
                            to="/practice"
                            className="inline-block mt-4 bg-[#1b263b] text-[#f6f3db] border-2 border-[#1b263b] px-5 py-2 rounded-xl text-xs font-black hover:bg-[#1b263b]/90 transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                          >
                            Luyện tập ngay ➔
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {results.map((resItem) => {
                            const dateStr = new Date(resItem.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            let typeBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200/50';
                            let typeIcon = '🎧';
                            if (resItem.type === 'READING') {
                              typeBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
                              typeIcon = '📖';
                            } else if (resItem.type === 'WRITING') {
                              typeBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200/50';
                              typeIcon = '✍️';
                            } else if (resItem.type === 'SPEAKING') {
                              typeBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200/50';
                              typeIcon = '🗣️';
                            }

                            return (
                              <div 
                                key={resItem.id}
                                className="bg-white border border-[#1b263b]/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-y-[-1px] transition-all"
                              >
                                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                  <div className={`p-2.5 rounded-xl text-lg shrink-0 border ${typeBadgeColor}`}>
                                    {typeIcon}
                                  </div>
                                  <div className="flex-1 min-w-0 text-left space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h5 className="font-bold text-sm text-[#1b263b] truncate leading-none">{resItem.title}</h5>
                                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded leading-none uppercase border ${typeBadgeColor}`}>
                                        {resItem.type}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                      <span>Thời gian nộp: {dateStr}</span>
                                      {resItem.timeTaken !== null && resItem.timeTaken > 0 && (
                                        <span>• Làm trong: {Math.ceil(resItem.timeTaken / 60)} phút</span>
                                      )}
                                      {resItem.correctCount !== null && resItem.correctCount !== undefined && (
                                        <span>• Kết quả: {resItem.correctCount}/40 câu</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                  <div className="text-right">
                                    <span className="text-xs font-black text-[#1b263b] bg-[#eae6ca] border border-[#1b263b]/20 px-2.5 py-1 rounded-lg">
                                      Band {resItem.bandScore !== null && resItem.bandScore !== undefined ? resItem.bandScore.toFixed(1) : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACHIEVEMENTS TAB */}
                  {activeTab === 'achievements' && (
                    <div className="space-y-6">
                      <div className="border-b border-[#1b263b]/10 pb-4 text-left">
                        <h4 className="font-serif font-black text-lg text-[#1b263b]">🏆 Danh hiệu & Thành tích</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Những cột mốc học tập bạn đã vượt qua</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {achievements.map((ach) => (
                          <div 
                            key={ach.id} 
                            className={`border border-[#1b263b]/10 rounded-2xl p-4.5 flex flex-col justify-between min-h-[120px] transition-all ${
                              ach.earned 
                                ? 'bg-white shadow-[2px_2px_0px_0px_#1b263b] opacity-100 border-[#1b263b]' 
                                : 'bg-gray-50/50 opacity-60'
                            }`}
                          >
                            <div className="text-left space-y-1">
                              <div className="flex justify-between items-start">
                                <h5 className="font-serif font-black text-sm text-[#1b263b] leading-tight">{ach.title}</h5>
                                <span className="text-lg select-none">{ach.earned ? '🥇' : '🔒'}</span>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 leading-tight">{ach.desc}</p>
                            </div>

                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded w-max mt-3 block ${
                              ach.earned 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              {ach.earned ? 'Đã đạt' : 'Chưa đạt'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* XP STATS CARD */}
                      <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-5 text-left mt-6">
                        <h4 className="font-serif font-black text-base text-[#1b263b] border-b border-[#1b263b]/10 pb-3 mb-4">
                          🎖️ Điểm XP của bạn
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-white border border-[#1b263b]/10 rounded-2xl p-4">
                            <p className="text-2xl font-serif font-black text-[#1b263b]">{totalXp}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Tổng XP</p>
                          </div>
                          <div className="bg-white border border-[#1b263b]/10 rounded-2xl p-4">
                            <p className="text-2xl font-serif font-black text-[#1b263b]">Cấp {currentLevel}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-1">Cấp hiện tại</p>
                          </div>
                          <div className="bg-white border border-[#1b263b]/10 rounded-2xl p-4">
                            <p className="text-2xl font-serif font-black text-[#1b263b]">{xpPercent}%</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase mt-1">{progressXp}/500 XP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MENTOR REGISTER TAB */}
                  {activeTab === 'mentorRegister' && (
                    <div className="space-y-6">
                      <div className="border-b border-[#1b263b]/10 pb-4 text-left">
                        <h4 className="font-serif font-black text-lg text-[#1b263b]">✍️ Đăng ký làm Mentor</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Nâng cấp tài khoản của bạn để trở thành người hướng dẫn</p>
                      </div>

                      {user?.role === 'MENTOR' ? (
                        <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-6 text-left space-y-4">
                          <div className="flex items-center gap-3 bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 p-4 rounded-2xl">
                            <span className="text-2xl">✨</span>
                            <div>
                              <h5 className="font-bold text-sm text-emerald-800">Bạn đã được phê duyệt và đã trở thành Mentor rồi!</h5>
                              <p className="text-xs text-emerald-700/80">Yêu cầu nâng cấp tài khoản của bạn đã thành công. Tài khoản của bạn hiện đã có đầy đủ các quyền của một Mentor trên hệ thống.</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2 text-xs text-[#1b263b]/70 font-medium leading-relaxed">
                            <p>
                              Cảm ơn bạn đã đăng ký làm Người hướng dẫn (Mentor) của Apex IELTS. Bạn hiện có thể truy cập khu vực Luyện tập/Lịch trình học tập của mình để chấp nhận đặt lịch hẹn học, đánh giá phản hồi bài nói/bài viết của các học viên khác, và quản lý các lịch học trực tuyến.
                            </p>
                          </div>
                        </div>
                      ) : mentorRequest && mentorRequest.status === 'PENDING' ? (
                        <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-6 text-left space-y-4">
                          <div className="flex items-center gap-3 bg-yellow-500/10 border-2 border-yellow-500/40 text-yellow-800 p-4 rounded-2xl">
                            <span className="text-2xl">⏳</span>
                            <div>
                              <h5 className="font-bold text-sm">Yêu cầu nâng cấp đang chờ phê duyệt</h5>
                              <p className="text-xs text-yellow-700/80">Chúng tôi đang kiểm duyệt chứng chỉ và thông tin của bạn. Vui lòng quay lại sau.</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2 text-xs">
                            <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                              <span className="font-black text-gray-400 uppercase text-[10px]">Chuyên môn</span>
                              <span className="col-span-2 font-bold text-[#1b263b]">{mentorRequest.expertise || 'Không có'}</span>
                            </div>
                            <div className="grid grid-cols-3 border-b border-[#1b263b]/5 pb-2.5">
                              <span className="font-black text-gray-400 uppercase text-[10px]">Giới thiệu ngắn</span>
                              <span className="col-span-2 font-bold text-[#1b263b]">{mentorRequest.bio || 'Không có'}</span>
                            </div>
                            <div className="grid grid-cols-3">
                              <span className="font-black text-gray-400 uppercase text-[10px]">Chứng chỉ đính kèm</span>
                              <div className="col-span-2 space-y-1">
                                {mentorRequest.certificates?.map((cert: string, idx: number) => (
                                  <a key={idx} href={cert} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline block truncate">
                                    📄 Chứng chỉ {idx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#fdfbf6] border border-[#1b263b]/15 rounded-3xl p-6 text-left">
                          {mentorRequest && mentorRequest.status === 'REJECTED' && (
                            <div className="mb-6 flex items-start gap-3 bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-2xl">
                              <span className="text-2xl">❌</span>
                              <div>
                                <h5 className="font-bold text-sm">Yêu cầu trước đó bị từ chối</h5>
                                <p className="text-xs text-red-700/80 mt-1">Lý do từ chối: <strong className="text-red-900">{mentorRequest.adminComment || 'Không có lý do chi tiết.'}</strong></p>
                                <p className="text-xs text-red-700/50 mt-0.5">Vui lòng cập nhật thông tin chính xác và gửi lại yêu cầu mới.</p>
                              </div>
                            </div>
                          )}

                          <form onSubmit={handleMentorRegisterSubmit} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Lĩnh vực chuyên môn / Bằng cấp nổi bật</label>
                              <input
                                type="text"
                                required
                                placeholder="Ví dụ: IELTS 8.0 overall, 2 năm kinh nghiệm giảng dạy..."
                                value={mentorReqExpertise}
                                onChange={(e) => setMentorReqExpertise(e.target.value)}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Tiểu sử ngắn (Giới thiệu bản thân)</label>
                              <textarea
                                required
                                placeholder="Hãy chia sẻ ngắn gọn về phương pháp giảng dạy hoặc mục tiêu của bạn khi làm mentor..."
                                value={mentorReqBio}
                                onChange={(e) => setMentorReqBio(e.target.value)}
                                rows={3}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none resize-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">Tải lên chứng chỉ tiếng Anh (File ảnh hoặc PDF)</label>
                              
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('cert-upload-input')?.click()}
                                  className="bg-white border-2 border-[#1b263b] px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center gap-1.5 cursor-pointer"
                                >
                                  📎 Chọn chứng chỉ
                                </button>
                                <input
                                  type="file"
                                  id="cert-upload-input"
                                  multiple
                                  accept="image/*,application/pdf"
                                  className="hidden"
                                  onChange={handleCertificatesSelect}
                                />
                                <span className="text-[10px] font-bold text-gray-400">Yêu cầu ít nhất 1 chứng chỉ để đăng ký.</span>
                              </div>

                              {mentorReqCerts.length > 0 && (
                                <div className="mt-3 space-y-1.5 bg-[#f5f3dc]/30 border border-[#1b263b]/10 rounded-xl p-3">
                                  {mentorReqCerts.map((cert, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs bg-white border border-[#1b263b]/15 px-3 py-1.5 rounded-lg">
                                      <span className="font-bold text-[#1b263b] truncate max-w-[80%]">{cert.filename}</span>
                                      <button
                                        type="button"
                                        onClick={() => removeCertificateFile(idx)}
                                        className="text-[#c92a2a] hover:text-red-700 font-bold"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="pt-4 flex">
                              <button
                                type="submit"
                                disabled={mentorReqSubmitting || mentorReqCerts.length === 0}
                                className="flex-1 bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#91e8c1] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer"
                              >
                                {mentorReqSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu nâng cấp 🚀'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}
