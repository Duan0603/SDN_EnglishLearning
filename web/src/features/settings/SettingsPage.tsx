import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/store';
import { logout, loginSuccess } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';

// Dynamic translations for instant localized testing
const translations = {
  vi: {
    title: "⚙️ Cài đặt hệ thống",
    subtitle: "Cấu hình tùy chọn tài khoản cá nhân, thông báo học tập, thuật toán đề xuất AI & giao diện màu sắc của bạn",
    loading: "⚙️ Đang tải cấu hình hệ thống...",
    saved: "✓ Cập nhật cài đặt tài khoản thành công!",
    sidebar: {
      account: "👤 Thông tin tài khoản",
      notifications: "🔔 Thông báo & Âm thanh",
      appearance: "🎨 Giao diện & Ngôn ngữ",
      security: "🛡️ Bảo mật & Thuật toán",
      terms: "📄 Điều khoản sử dụng",
      back: "⬅ Quay lại Hồ sơ"
    },
    account: {
      title: "Thông tin tài khoản",
      desc: "Cập nhật hồ sơ công khai hiển thị trên hệ thống",
      fullName: "Họ và tên",
      email: "Email liên hệ",
      phone: "Số điện thoại",
      birthday: "Ngày sinh",
      bio: "Tiểu sử cá nhân (Bio)",
      bioPlaceholder: "Chia sẻ một chút về mục tiêu điểm IELTS của bạn...",
      save: "Lưu Thay Đổi 💾"
    },
    notifications: {
      title: "Thông báo & Âm thanh",
      desc: "Tùy chọn tần suất gửi thông báo nhắc nhở & hiệu ứng âm thanh bài thi",
      reminder: "Nhắc nhở học tập hàng ngày",
      reminderDesc: "Gửi email/thông báo nhắc lịch làm bài thi thử hoặc ôn tập bài thi yếu.",
      streak: "Cảnh báo Streak liên tiếp",
      streakDesc: "Thông báo khẩn cấp trước khi kết thúc ngày để bạn hoàn thành điểm danh bảo vệ streak.",
      ai: "Đề xuất lộ trình AI thông minh",
      aiDesc: "AI tự động gợi ý đề thi IELTS Reading/Listening phù hợp với trình độ kỹ năng hiện tại.",
      sound: "Hiệu ứng âm thanh hệ thống",
      soundDesc: "Bật âm thanh chúc mừng khi làm bài đạt điểm cao hoặc kết thúc bài nghe Listening.",
      volume: "Âm lượng âm thanh hiệu ứng"
    },
    appearance: {
      title: "Giao diện & Ngôn ngữ",
      desc: "Tùy biến ngôn ngữ hệ thống & cấu hình giao diện tối/sáng",
      theme: "Chủ đề giao diện",
      themeLight: "☀️ Sáng",
      themeDark: "🌙 Tối",
      themeSystem: "🖥️ Hệ thống",
      lang: "Ngôn ngữ hiển thị chính",
      langVi: "Tiếng Việt (Vietnamese)",
      langEn: "English (United States)"
    },
    security: {
      title: "Bảo mật & Thuật toán gợi ý",
      desc: "Xác thực đăng nhập và điều khiển mô hình AI đề xuất học tập",
      twoFactor: "Xác thực đăng nhập 2 lớp (2FA)",
      twoFactorDesc: "Tự động gửi mã bảo mật đăng nhập qua email khi có thiết bị mới truy cập tài khoản.",
      algoTitle: "Mô hình định hướng ôn tập AI",
      algoAdaptive: "Adaptive Learning (Học máy thích ứng)",
      algoAdaptiveDesc: "AI tự động tối ưu hóa mức độ khó của đề thi IELTS dựa trên lịch sử điểm số của bạn.",
      algoRandom: "Randomized Prep (Luyện tập ngẫu nhiên)",
      algoRandomDesc: "Gợi ý các đề thi IELTS đa dạng, ngẫu nhiên để rèn luyện kỹ năng giải đề tổng thể.",
      algoWeakness: "Weak-Skill Focus (Ưu tiên phần kỹ năng yếu)",
      algoWeaknessDesc: "Tập trung triệt để vào các kỹ năng nghe/đọc bạn đang đạt điểm thấp nhất.",
      changePwd: "Thay đổi mật khẩu",
      oldPwd: "Mật khẩu hiện tại",
      newPwd: "Mật khẩu mới",
      confirmPwd: "Xác nhận mật khẩu mới",
      pwdSuccess: "Đổi mật khẩu thành công!",
      pwdError: "Mật khẩu mới và xác nhận mật khẩu không khớp!",
      pwdLoading: "Đang cập nhật mật khẩu...",
      pwdSave: "Cập nhật mật khẩu bảo mật 🔑"
    },
    terms: {
      title: "Điều khoản dịch vụ & Chính sách",
      desc: "Cam kết bảo mật thông tin & chính sách bản quyền luyện thi",
      welcome: "CHÀO MỪNG BẠN ĐẾN VỚI APEX IELTS",
      welcomeDesc: "Chào mừng bạn đến với Hệ thống Luyện thi IELTS Thông minh Apex. Khi sử dụng các dịch vụ học tập trực tuyến, thi thử trực tuyến, đánh giá bài viết và giọng nói AI của chúng tôi, bạn đồng ý tuân thủ các điều khoản dịch vụ và chính sách bảo mật này.",
      ownership: "1. QUYỀN SỞ HỮU TRÍ TUỆ",
      ownershipDesc: "Mọi tài liệu luyện thi, đề thi mẫu, thuật toán chấm điểm AI, và cấu trúc thiết kế giao diện đều thuộc quyền sở hữu độc quyền của hệ thống. Người dùng không được sao chép, phát tán trái phép dưới mọi hình thức thương mại hoặc phi thương mại.",
      privacy: "2. CAM KẾT BẢO MẬT DỮ LIỆU CÁ NHÂN",
      privacyDesc: "Chúng tôi tôn trọng và bảo mật tuyệt đối thông tin tài khoản, điểm số, bài viết, tệp ghi âm giọng nói luyện nói và tiến trình học tập của bạn. Mọi dữ liệu thu âm chỉ được sử dụng để phân tích cải thiện kỹ năng nói trực tiếp của bạn bằng AI.",
      supportText: "Bạn có thắc mắc hoặc cần hỗ trợ thêm?",
      supportBtn: "✉ Liên hệ bộ phận hỗ trợ",
      dangerZone: "Vùng nguy hiểm",
      deleteAccount: "❌ Yêu cầu xoá tài khoản vĩnh viễn"
    }
  },
  en: {
    title: "⚙️ System Settings",
    subtitle: "Configure personal account preferences, study notifications, AI recommender system & color interface themes",
    loading: "⚙️ Loading system settings...",
    saved: "✓ Account settings updated successfully!",
    sidebar: {
      account: "👤 Account Information",
      notifications: "🔔 Notifications & Sounds",
      appearance: "🎨 Theme & Language",
      security: "🛡️ Security & Algorithms",
      terms: "📄 Terms of Service",
      back: "⬅ Back to Profile"
    },
    account: {
      title: "Account Information",
      desc: "Update your public profile displayed across the system",
      fullName: "Full Name",
      email: "Contact Email",
      phone: "Phone Number",
      birthday: "Date of Birth",
      bio: "Personal Biography (Bio)",
      bioPlaceholder: "Share a little about your IELTS target scores...",
      save: "Save Changes 💾"
    },
    notifications: {
      title: "Notifications & Sounds",
      desc: "Manage notification frequency and examination sound effects",
      reminder: "Daily Study Reminder",
      reminderDesc: "Receive emails/notifications to remind you to take practice exams or review weak skills.",
      streak: "Continuous Streak Alarm",
      streakDesc: "Receive urgent warnings before the day ends to complete your daily activity and protect your streak.",
      ai: "AI Smart Pathway recommendation",
      aiDesc: "AI automatically recommends IELTS Reading/Listening exams tailored to your current skill level.",
      sound: "System Sound Effects",
      soundDesc: "Enable celebratory sound effects on high scores or completion of Listening audio tests.",
      volume: "Effects Sound Volume"
    },
    appearance: {
      title: "Theme & Language",
      desc: "Customize display language & choose light or dark page mode",
      theme: "Interface Theme",
      themeLight: "☀️ Light",
      themeDark: "🌙 Dark",
      themeSystem: "🖥️ System",
      lang: "Primary Display Language",
      langVi: "Tiếng Việt (Vietnamese)",
      langEn: "English (United States)"
    },
    security: {
      title: "Security & AI Recommendation",
      desc: "Manage authentication security and direct the AI recommendation engine",
      twoFactor: "Two-Factor Authentication (2FA)",
      twoFactorDesc: "Automatically send security codes to your email when logging in from a new device.",
      algoTitle: "AI Study Recommendation Model",
      algoAdaptive: "Adaptive Learning",
      algoAdaptiveDesc: "AI automatically optimizes the difficulty of IELTS mock exams based on your score history.",
      algoRandom: "Randomized Prep",
      algoRandomDesc: "Suggests a diverse, randomized selection of mock exams to train comprehensive skills.",
      algoWeakness: "Weak-Skill Focus",
      algoWeaknessDesc: "Strictly focus recommendations on the Reading/Listening skills where you scored lowest.",
      changePwd: "Change Password",
      oldPwd: "Current Password",
      newPwd: "New Password",
      confirmPwd: "Confirm New Password",
      pwdSuccess: "Password changed successfully!",
      pwdError: "New password and password confirmation do not match!",
      pwdLoading: "Updating password...",
      pwdSave: "Update Security Password 🔑"
    },
    terms: {
      title: "Terms of Service & Policies",
      desc: "Commitment to information security & mock exam copyright rules",
      welcome: "WELCOME TO APEX IELTS",
      welcomeDesc: "Welcome to the Apex IELTS Smart Prep System. By using our online learning portal, mock test platform, AI text writing scoring, and speech analysis systems, you agree to comply with these terms of service and privacy policies.",
      ownership: "1. INTELLECTUAL PROPERTY RIGHTS",
      ownershipDesc: "All study materials, exam questions, AI scoring models, and user interface layouts are the exclusive property of the system. Users may not copy or distribute content without permission.",
      privacy: "2. PERSONAL DATA PRIVACY COMMITMENT",
      privacyDesc: "We respect and secure your account credentials, scores, essays, speech recordings, and learning progress. Audio recordings are analyzed solely to improve your speaking skills using AI.",
      supportText: "Have questions or need further assistance?",
      supportBtn: "✉ Contact Support Department",
      dangerZone: "Danger Zone",
      deleteAccount: "❌ Request Permanent Account Deletion"
    }
  }
};

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Active settings sidebar section
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'appearance' | 'security' | 'terms'>('account');

  // Loading & data states
  const [loading, setLoading] = useState(true);
  const [formSaved, setFormSaved] = useState(false);

  // Form states for account info
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBirthDate, setFormBirthDate] = useState('');
  const [formBio, setFormBio] = useState('');
  const [form2FA, setForm2FA] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Local preferences states
  const [settingsReminder, setSettingsReminder] = useState<boolean>(() => {
    return localStorage.getItem('set_reminder') !== 'false';
  });
  const [settingsStreakAlert, setSettingsStreakAlert] = useState<boolean>(() => {
    return localStorage.getItem('set_streak') !== 'false';
  });
  const [settingsAIRecommend, setSettingsAIRecommend] = useState<boolean>(() => {
    return localStorage.getItem('set_airecommend') !== 'false';
  });
  const [settingsSoundEffects, setSettingsSoundEffects] = useState<boolean>(() => {
    return localStorage.getItem('set_sound') !== 'false';
  });
  const [settingsVolume, setSettingsVolume] = useState<number>(() => {
    const val = localStorage.getItem('set_volume');
    return val ? parseInt(val, 10) : 80;
  });
  const [settingsTheme, setSettingsTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('set_theme') as any) || 'light';
  });
  const [settingsLanguage, setSettingsLanguage] = useState<'vi' | 'en'>(() => {
    return (localStorage.getItem('set_lang') as any) || 'vi';
  });
  const [settingsAlgorithm, setSettingsAlgorithm] = useState<'adaptive' | 'random' | 'weakness'>(() => {
    return (localStorage.getItem('set_algo') as any) || 'adaptive';
  });

  // Load account data on mount
  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/profile');
      const profile = res.data.metadata || res.data;
      if (profile) {
        setFormFullName(profile.fullName || '');
        setFormEmail(profile.email || '');
        setFormPhone(profile.phone || '');
        setFormBirthDate(profile.birthday || '');
        setFormBio(profile.bio || '');
        setForm2FA(profile.isTwoFactorEnabled || false);
      }
    } catch (err) {
      console.error('Failed to load settings profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Save local preferences on change
  useEffect(() => {
    localStorage.setItem('set_reminder', String(settingsReminder));
  }, [settingsReminder]);

  useEffect(() => {
    localStorage.setItem('set_streak', String(settingsStreakAlert));
  }, [settingsStreakAlert]);

  useEffect(() => {
    localStorage.setItem('set_airecommend', String(settingsAIRecommend));
  }, [settingsAIRecommend]);

  useEffect(() => {
    localStorage.setItem('set_sound', String(settingsSoundEffects));
  }, [settingsSoundEffects]);

  useEffect(() => {
    localStorage.setItem('set_volume', String(settingsVolume));
  }, [settingsVolume]);

  useEffect(() => {
    localStorage.setItem('set_theme', settingsTheme);
    if (settingsTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settingsTheme]);

  useEffect(() => {
    localStorage.setItem('set_lang', settingsLanguage);
  }, [settingsLanguage]);

  useEffect(() => {
    localStorage.setItem('set_algo', settingsAlgorithm);
  }, [settingsAlgorithm]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Submit profile details to API
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.patch('/auth/profile', {
        fullName: formFullName,
        email: formEmail,
        phone: formPhone,
        birthday: formBirthDate,
        bio: formBio,
        isTwoFactorEnabled: form2FA
      });

      const updatedUser = res.data.metadata || res.data;
      const token = localStorage.getItem('auth_token') || '';
      localStorage.setItem('auth_user', JSON.stringify({
        ...updatedUser,
        id: updatedUser._id
      }));

      dispatch(loginSuccess({
        user: { ...updatedUser, id: updatedUser._id },
        token
      }));

      setFormSaved(true);
      setTimeout(() => {
        setFormSaved(false);
      }, 2000);

      loadProfile();
    } catch (err: any) {
      console.error("Save settings profile failed:", err);
      alert("Lỗi khi lưu thông tin: " + (err.response?.data?.error?.message || err.response?.data?.message || err.message));
    }
  };

  // Password submission handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: t.security.pwdError });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      setPasswordMessage({ type: 'success', text: t.security.pwdSuccess });
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

  // Setup translation helper
  const t = translations[settingsLanguage] || translations.vi;

  // Setup premium Dark Mode inline styles
  const isDark = settingsTheme === 'dark';
  const themeBg = isDark ? 'bg-[#181c26]' : 'bg-[#f6f3db]';
  const themeText = isDark ? 'text-slate-100' : 'text-[#1b263b]';
  const themeBorder = isDark ? 'border-slate-700' : 'border-[#1b263b]';
  const themeCardBg = isDark ? 'bg-[#212836]' : 'bg-[#fcfbf7]';
  const themeLineColor = isDark ? '#2d3648' : '#eae6ca';
  const themeHeaderBg = isDark ? 'bg-[#1c2230]' : 'bg-[#f6f3db]';
  const themeSubText = isDark ? 'text-slate-400' : 'text-gray-500';
  const themeHeaderBorder = isDark ? 'border-slate-800' : 'border-[#1b263b]/10';
  const themeInputBg = isDark ? 'bg-[#171c26]' : 'bg-white';
  const themeInputText = isDark ? 'text-slate-200' : 'text-[#1b263b]';
  const themeInputBorder = isDark ? 'border-slate-600' : 'border-[#1b263b]';
  const themeLabelColor = isDark ? 'text-slate-400' : 'text-gray-500';
  const themeSpiralColor1 = isDark ? 'bg-slate-700' : 'bg-gray-300';
  const themeSpiralColor2 = isDark ? 'border-slate-800/50' : 'border-gray-400/50';
  const themeSpiralRing = isDark ? 'from-slate-600 via-slate-500 to-slate-700' : 'from-gray-400 via-gray-300 to-gray-500';

  return (
    <div
      className={`min-h-screen ${themeBg} ${themeText} font-sans antialiased relative overflow-x-hidden custom-pencil-cursor flex flex-col transition-all duration-300`}
      style={{
        backgroundImage: `linear-gradient(${themeLineColor} 1px, transparent 1px)`,
        backgroundSize: '100% 2.75rem'
      }}
    >
      {/* Real Spiral Binder Graphic on the Left side */}
      <div className="absolute left-3 top-0 bottom-0 w-10 flex flex-col justify-around pointer-events-none z-20 opacity-90 select-none py-6">
        {Array.from({ length: 32 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5 h-6">
            <div className={`w-4 h-4 rounded-full ${themeSpiralColor1} border ${themeSpiralColor2} shadow-inner`} />
            <div className={`w-8 h-2 bg-gradient-to-r ${themeSpiralRing} rounded-full shadow-md border-t border-white/20 transform -translate-x-1`} />
          </div>
        ))}
      </div>

      {/* Red vertical margin line of notebook paper */}
      <div className="absolute left-[79px] top-0 bottom-0 w-0.5 bg-[#e0565b]/50 pointer-events-none z-10" />

      {/* HEADER SECTION */}
      <div className={`${themeHeaderBg} border-b-2 ${themeHeaderBorder} z-30 transition-all duration-300`}>
        <header className="max-w-7xl mx-auto pl-[110px] pr-6 md:pr-12 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-[#b03030] border-2 ${isDark ? 'border-slate-700' : 'border-[#1b263b]'} rounded flex items-center justify-center text-white font-serif font-black text-xl shadow-[2px_2px_0px_0px_#1b263b]`}>
                A
              </div>
              <span className={`text-xl font-serif font-black tracking-tight ${themeText}`}>
                Apex IELTS
              </span>
            </Link>
          </div>

          <nav className={`hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-[#1b263b]/80'}`}>
            <Link to="/" className="hover:text-[#b03030] transition-colors">Home</Link>
            <Link to="/practice" className="hover:text-[#b03030] transition-colors">Practice</Link>
            <Link to="/profile" className="hover:text-[#b03030] transition-colors">Profile</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className={`${isDark ? 'bg-[#293245] text-slate-200 border-slate-700 hover:bg-[#343e56]' : 'bg-white text-[#1b263b] border-[#1b263b] hover:bg-gray-50'} border-2 px-5 py-2 rounded-xl text-xs font-black transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer`}
            >
              Sign Out
            </button>
            <Link
              to="/practice"
              className={`bg-[#b03030] text-white border-2 ${isDark ? 'border-slate-700' : 'border-[#1b263b]'} px-5 py-2 rounded-xl text-xs font-black hover:bg-[#902020] transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center gap-1`}
            >
              📖 OPEN NOTEBOOK
            </Link>
          </div>
        </header>
      </div>

      {/* BODY CONTENT */}
      <div className="max-w-4xl w-full mx-auto pl-[110px] pr-6 md:pr-12 py-10 flex-1 flex flex-col gap-6 z-10">
        
        {loading ? (
          <div className={`py-20 text-center text-sm font-black ${themeText} animate-pulse`}>
            {t.loading}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Title header */}
            <div className={`border-b-2 ${isDark ? 'border-slate-800' : 'border-[#1b263b]/15'} pb-4 text-left`}>
              <h1 className={`font-serif font-black text-3xl ${themeText}`}>{t.title}</h1>
              <p className={`text-xs font-bold ${themeSubText} mt-1 uppercase tracking-wide`}>
                {t.subtitle}
              </p>
            </div>

            {/* Main panel layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Settings Sidebar navigation */}
              <div className="md:col-span-4 space-y-2">
                {[
                  { id: 'account', label: t.sidebar.account },
                  { id: 'notifications', label: t.sidebar.notifications },
                  { id: 'appearance', label: t.sidebar.appearance },
                  { id: 'security', label: t.sidebar.security },
                  { id: 'terms', label: t.sidebar.terms },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between border-2 cursor-pointer ${
                      activeSection === sec.id
                        ? `${isDark ? 'bg-slate-200 text-[#181c26] border-slate-200 shadow-[3px_3px_0px_0px_#2d3648]' : 'bg-[#1b263b] text-[#f6f3db] border-[#1b263b] shadow-[3px_3px_0px_0px_#1b263b]'} translate-y-[-2px]`
                        : `${themeCardBg} ${themeText} ${themeBorder} shadow-[2px_2px_0px_0px_#1b263b] hover:bg-opacity-80`
                    }`}
                  >
                    <span>{sec.label}</span>
                    <span className="text-[10px] opacity-60">➔</span>
                  </button>
                ))}

                <Link
                  to="/profile"
                  className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between border-2 ${themeBorder} ${themeCardBg} ${themeText} hover:bg-opacity-80 shadow-[2px_2px_0px_0px_#1b263b] block`}
                >
                  <span>{t.sidebar.back}</span>
                  <span>👤</span>
                </Link>
              </div>

              {/* Settings Detail Pane */}
              <div className={`md:col-span-8 ${themeCardBg} border-2 ${themeBorder} rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#1b263b] text-left transition-all duration-300`}>
                
                {formSaved && (
                  <div className="mb-6 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b] animate-bounce">
                    {t.saved}
                  </div>
                )}

                {/* 1. ACCOUNT SUB-PANEL */}
                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <div className={`border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pb-3`}>
                      <h3 className={`font-serif font-black text-xl ${themeText}`}>{t.account.title}</h3>
                      <p className={`text-[10px] font-black ${themeSubText} uppercase mt-0.5`}>{t.account.desc}</p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-1">
                        <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.account.fullName}</label>
                        <input
                          type="text"
                          required
                          value={formFullName}
                          onChange={(e) => setFormFullName(e.target.value)}
                          className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2.5 text-xs font-bold ${themeInputText} outline-none`}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.account.email}</label>
                        <input
                          type="email"
                          required
                          disabled
                          value={formEmail}
                          className={`w-full ${isDark ? 'bg-slate-800/40 text-slate-500 border-slate-700/50' : 'bg-gray-100 text-gray-400 border-[#1b263b]/20'} border-2 rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-not-allowed`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.account.phone}</label>
                          <input
                            type="text"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2.5 text-xs font-bold ${themeInputText} outline-none`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.account.birthday}</label>
                          <input
                            type="text"
                            value={formBirthDate}
                            placeholder="Ví dụ: 15/09/2000"
                            onChange={(e) => setFormBirthDate(e.target.value)}
                            className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2.5 text-xs font-bold ${themeInputText} outline-none`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.account.bio}</label>
                        <textarea
                          value={formBio}
                          onChange={(e) => setFormBio(e.target.value)}
                          rows={3}
                          className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2.5 text-xs font-bold ${themeInputText} outline-none resize-none`}
                          placeholder={t.account.bioPlaceholder}
                        />
                      </div>

                      <button
                        type="submit"
                        className={`w-full bg-[#ffd54f] text-[#1b263b] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#ffe082] transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer mt-4`}
                      >
                        {t.account.save}
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. NOTIFICATIONS & SOUND SUB-PANEL */}
                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div className={`border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pb-3`}>
                      <h3 className={`font-serif font-black text-xl ${themeText}`}>{t.notifications.title}</h3>
                      <p className={`text-[10px] font-black ${themeSubText} uppercase mt-0.5`}>{t.notifications.desc}</p>
                    </div>

                    <div className="space-y-5">
                      <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/5'} pb-3`}>
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase tracking-wider block">{t.notifications.reminder}</label>
                          <span className={`text-[10px] font-bold ${themeSubText} block mt-0.5`}>
                            {t.notifications.reminderDesc}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsReminder}
                            onChange={(e) => setSettingsReminder(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${isDark ? 'bg-slate-700' : 'bg-[#eae6ca]'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 ${isDark ? 'border-slate-600' : 'border-[#1b263b]'}`}></div>
                        </label>
                      </div>

                      <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/5'} pb-3`}>
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase tracking-wider block">{t.notifications.streak}</label>
                          <span className={`text-[10px] font-bold ${themeSubText} block mt-0.5`}>
                            {t.notifications.streakDesc}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsStreakAlert}
                            onChange={(e) => setSettingsStreakAlert(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${isDark ? 'bg-slate-700' : 'bg-[#eae6ca]'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 ${isDark ? 'border-slate-600' : 'border-[#1b263b]'}`}></div>
                        </label>
                      </div>

                      <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/5'} pb-3`}>
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase tracking-wider block">{t.notifications.ai}</label>
                          <span className={`text-[10px] font-bold ${themeSubText} block mt-0.5`}>
                            {t.notifications.aiDesc}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsAIRecommend}
                            onChange={(e) => setSettingsAIRecommend(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${isDark ? 'bg-slate-700' : 'bg-[#eae6ca]'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 ${isDark ? 'border-slate-600' : 'border-[#1b263b]'}`}></div>
                        </label>
                      </div>

                      <div className={`flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/5'} pb-3`}>
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase tracking-wider block">{t.notifications.sound}</label>
                          <span className={`text-[10px] font-bold ${themeSubText} block mt-0.5`}>
                            {t.notifications.soundDesc}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsSoundEffects}
                            onChange={(e) => setSettingsSoundEffects(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 ${isDark ? 'bg-slate-700' : 'bg-[#eae6ca]'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 ${isDark ? 'border-slate-600' : 'border-[#1b263b]'}`}></div>
                        </label>
                      </div>

                      {settingsSoundEffects && (
                        <div className="space-y-2 pt-2 animate-fadeIn">
                          <div className="flex justify-between items-center text-xs font-black">
                            <span>{t.notifications.volume}</span>
                            <span>{settingsVolume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settingsVolume}
                            onChange={(e) => setSettingsVolume(Number(e.target.value))}
                            className={`w-full accent-[#b03030] h-2.5 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-[#eae6ca] border-[#1b263b]'} rounded-lg appearance-none cursor-pointer border`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. APPEARANCE & LANGUAGE SUB-PANEL */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <div className={`border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pb-3`}>
                      <h3 className={`font-serif font-black text-xl ${themeText}`}>{t.appearance.title}</h3>
                      <p className={`text-[10px] font-black ${themeSubText} uppercase mt-0.5`}>{t.appearance.desc}</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider block mb-2`}>{t.appearance.theme}</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'light', label: t.appearance.themeLight },
                            { id: 'dark', label: t.appearance.themeDark },
                            { id: 'system', label: t.appearance.themeSystem },
                          ].map((themeOpt) => (
                            <button
                              key={themeOpt.id}
                              type="button"
                              onClick={() => setSettingsTheme(themeOpt.id as any)}
                              className={`py-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                                settingsTheme === themeOpt.id
                                  ? 'bg-[#ffd54f] text-[#1b263b] border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]'
                                  : `${isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`
                              }`}
                            >
                              {themeOpt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider block`}>{t.appearance.lang}</label>
                        <select
                          value={settingsLanguage}
                          onChange={(e) => setSettingsLanguage(e.target.value as any)}
                          className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2.5 text-xs font-bold ${themeInputText} outline-none cursor-pointer`}
                        >
                          <option value="vi">{t.appearance.langVi}</option>
                          <option value="en">{t.appearance.langEn}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SECURITY & ALGORITHM SUB-PANEL */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <div className={`border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pb-3`}>
                      <h3 className={`font-serif font-black text-xl ${themeText}`}>{t.security.title}</h3>
                      <p className={`text-[10px] font-black ${themeSubText} uppercase mt-0.5`}>{t.security.desc}</p>
                    </div>

                    {/* 2FA Section */}
                    <div className={`border-2 ${themeBorder} rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-between ${isDark ? 'bg-slate-800/40' : 'bg-[#fdfaf2]'}`}>
                      <div className="text-left max-w-[75%]">
                        <label className="text-xs font-black uppercase tracking-wider block">{t.security.twoFactor}</label>
                        <span className={`text-[10px] font-bold ${themeSubText} block mt-0.5`}>
                          {t.security.twoFactorDesc}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form2FA}
                          onChange={async (e) => {
                            setForm2FA(e.target.checked);
                            try {
                              await apiClient.patch('/auth/profile', { isTwoFactorEnabled: e.target.checked });
                            } catch (err) {
                              console.error("Failed to toggle 2FA:", err);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 ${isDark ? 'bg-slate-700' : 'bg-[#eae6ca]'} rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 ${isDark ? 'border-slate-600' : 'border-[#1b263b]'}`}></div>
                      </label>
                    </div>

                    {/* AI Recommendation Algorithm */}
                    <div className="space-y-3">
                      <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider block`}>{t.security.algoTitle}</label>
                      <div className="space-y-2">
                        {[
                          { id: 'adaptive', title: t.security.algoAdaptive, desc: t.security.algoAdaptiveDesc },
                          { id: 'random', title: t.security.algoRandom, desc: t.security.algoRandomDesc },
                          { id: 'weakness', title: t.security.algoWeakness, desc: t.security.algoWeaknessDesc }
                        ].map((algo) => (
                          <label
                            key={algo.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              settingsAlgorithm === algo.id
                                ? `${isDark ? 'bg-slate-800 border-slate-200' : 'bg-white border-[#1b263b]'} shadow-[2px_2px_0px_0px_#1b263b]`
                                : `${isDark ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600' : 'bg-white/40 border-[#1b263b]/10 hover:border-[#1b263b]/30'}`
                            }`}
                          >
                            <input
                              type="radio"
                              name="ai_algo"
                              checked={settingsAlgorithm === algo.id}
                              onChange={() => setSettingsAlgorithm(algo.id as any)}
                              className="mt-0.5 accent-[#1b263b]"
                            />
                            <div className="text-left leading-tight">
                              <span className="text-xs font-black block">{algo.title}</span>
                              <span className={`text-[10px] ${themeSubText} block mt-0.5`}>{algo.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className={`border-t ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pt-4 space-y-4`}>
                      <h4 className="font-serif font-black text-lg">{t.security.changePwd}</h4>
                      
                      {passwordMessage && (
                        <div className={`p-3.5 rounded-xl border-2 text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b] ${
                          passwordMessage.type === 'success'
                            ? 'bg-emerald-100 border-emerald-800 text-emerald-800'
                            : 'bg-rose-100 border-rose-800 text-rose-800'
                        }`}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <form onSubmit={handleChangePassword} className="space-y-3">
                        <div className="space-y-1">
                          <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.security.oldPwd}</label>
                          <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2 text-xs font-bold ${themeInputText} outline-none`}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.security.newPwd}</label>
                            <input
                              type="password"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2 text-xs font-bold ${themeInputText} outline-none`}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`text-[9px] font-black uppercase ${themeLabelColor} tracking-wider`}>{t.security.confirmPwd}</label>
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full ${themeInputBg} border-2 ${themeInputBorder} rounded-xl px-4 py-2 text-xs font-bold ${themeInputText} outline-none`}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-full bg-[#fbcfe8] text-[#c92a2a] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase hover:bg-[#f9a8d4] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer mt-2"
                        >
                          {passwordLoading ? t.security.pwdLoading : t.security.pwdSave}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 5. TERMS SUB-PANEL */}
                {activeSection === 'terms' && (
                  <div className="space-y-5">
                    <div className={`border-b ${isDark ? 'border-slate-800' : 'border-[#1b263b]/10'} pb-3`}>
                      <h3 className={`font-serif font-black text-xl ${themeText}`}>{t.terms.title}</h3>
                      <p className={`text-[10px] font-black ${themeSubText} uppercase mt-0.5`}>{t.terms.desc}</p>
                    </div>

                    <div className={`border-2 ${isDark ? 'bg-slate-900 border-slate-700/80 text-slate-400' : 'bg-white border-[#1b263b]/20 text-gray-500'} rounded-xl p-4 h-[180px] overflow-y-auto text-[10px] leading-relaxed space-y-3 font-bold select-none text-left`}>
                      <p className={`font-black ${isDark ? 'text-slate-100' : 'text-[#1b263b]'} text-xs`}>{t.terms.welcome}</p>
                      <p>{t.terms.welcomeDesc}</p>
                      <p className={`font-black ${isDark ? 'text-slate-100' : 'text-[#1b263b]'}`}>{t.terms.ownership}</p>
                      <p>{t.terms.ownershipDesc}</p>
                      <p className={`font-black ${isDark ? 'text-slate-100' : 'text-[#1b263b]'}`}>{t.terms.privacy}</p>
                      <p>{t.terms.privacyDesc}</p>
                    </div>

                    <div className="pt-2 text-center">
                      <span className={`text-[10px] font-bold ${themeSubText} block mb-3`}>{t.terms.supportText}</span>
                      <a
                        href="mailto:support@apexielts.com"
                        className="inline-block bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] px-4 py-2.5 rounded-xl text-xs font-black hover:bg-[#91e8c1] transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                      >
                        {t.terms.supportBtn}
                      </a>
                    </div>

                    <div className="pt-4 border-t border-red-500/10 flex flex-col items-center">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider block mb-2">{t.terms.dangerZone}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("CẢNH BÁO: Hành động này là vĩnh viễn và không thể khôi phục. Tất cả dữ liệu bài làm, streak và danh hiệu của bạn sẽ bị xoá vĩnh viễn. Bạn có chắc chắn muốn xoá tài khoản?")) {
                            alert("Yêu cầu xoá tài khoản đã được ghi nhận. Vui lòng liên hệ Admin để được hỗ trợ xoá tài khoản chính thức.");
                          }
                        }}
                        className="bg-[#fecaca] text-[#dc2626] border-2 border-[#dc2626]/40 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#fee2e2] transition-all cursor-pointer"
                      >
                        {t.terms.deleteAccount}
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
