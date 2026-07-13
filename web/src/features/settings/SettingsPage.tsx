import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/store';
import { logout, loginSuccess } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';

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

      {/* HEADER SECTION */}
      <div className="bg-[#f6f3db] border-b-2 border-[#1b263b]/10 z-30">
        <header className="max-w-7xl mx-auto pl-[110px] pr-6 md:pr-12 py-5 flex items-center justify-between gap-4">
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

          <nav className="hidden md:flex items-center gap-8 text-xs font-black text-[#1b263b]/80 uppercase tracking-wider">
            <Link to="/" className="hover:text-[#b03030] transition-colors">Home</Link>
            <Link to="/practice" className="hover:text-[#b03030] transition-colors">Practice</Link>
            <Link to="/profile" className="hover:text-[#b03030] transition-colors">Profile</Link>
          </nav>

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
      <div className="max-w-4xl w-full mx-auto pl-[110px] pr-6 md:pr-12 py-10 flex-1 flex flex-col gap-6 z-10">
        
        {loading ? (
          <div className="py-20 text-center text-sm font-black text-[#1b263b] animate-pulse">
            ⚙️ Đang tải cấu hình hệ thống...
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Title header */}
            <div className="border-b-2 border-[#1b263b]/15 pb-4 text-left">
              <h1 className="font-serif font-black text-3xl text-[#1b263b]">⚙️ Cài đặt hệ thống</h1>
              <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wide">
                Cấu hình tùy chọn tài khoản cá nhân, thông báo học tập, thuật toán đề xuất AI & giao diện màu sắc của bạn
              </p>
            </div>

            {/* Main panel layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Settings Sidebar navigation */}
              <div className="md:col-span-4 space-y-2">
                {[
                  { id: 'account', label: '👤 Thông tin tài khoản' },
                  { id: 'notifications', label: '🔔 Thông báo & Âm thanh' },
                  { id: 'appearance', label: '🎨 Giao diện & Ngôn ngữ' },
                  { id: 'security', label: '🛡️ Bảo mật & Thuật toán' },
                  { id: 'terms', label: '📄 Điều khoản sử dụng' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between border-2 cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-[#1b263b] text-[#f6f3db] border-[#1b263b] shadow-[3px_3px_0px_0px_#1b263b] translate-y-[-2px]'
                        : 'bg-[#fcfbf7] text-[#1b263b] border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b] hover:bg-gray-50'
                    }`}
                  >
                    <span>{sec.label}</span>
                    <span className="text-[10px] opacity-60">➔</span>
                  </button>
                ))}

                <Link
                  to="/profile"
                  className="w-full text-left px-4 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-between border-2 border-[#1b263b] bg-white text-[#1b263b] hover:bg-gray-50 shadow-[2px_2px_0px_0px_#1b263b] block"
                >
                  <span>⬅ Quay lại Hồ sơ</span>
                  <span>👤</span>
                </Link>
              </div>

              {/* Settings Detail Pane */}
              <div className="md:col-span-8 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 md:p-8 shadow-[4px_4px_0px_0px_#1b263b] text-left">
                
                {formSaved && (
                  <div className="mb-6 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b] animate-bounce">
                    ✓ Cập nhật cài đặt tài khoản thành công!
                  </div>
                )}

                {/* 1. ACCOUNT SUB-PANEL */}
                {activeSection === 'account' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#1b263b]/10 pb-3">
                      <h3 className="font-serif font-black text-xl text-[#1b263b]">Thông tin tài khoản</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Cập nhật hồ sơ công khai hiển thị trên hệ thống</p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
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
                          disabled
                          value={formEmail}
                          className="w-full bg-gray-100 border-2 border-[#1b263b]/20 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-400 outline-none cursor-not-allowed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Số điện thoại</label>
                          <input
                            type="text"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Ngày sinh</label>
                          <input
                            type="text"
                            value={formBirthDate}
                            placeholder="Ví dụ: 15/09/2000"
                            onChange={(e) => setFormBirthDate(e.target.value)}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Tiểu sử cá nhân (Bio)</label>
                        <textarea
                          value={formBio}
                          onChange={(e) => setFormBio(e.target.value)}
                          rows={3}
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none resize-none"
                          placeholder="Chia sẻ một chút về mục tiêu điểm IELTS của bạn..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#ffd54f] text-[#1b263b] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#ffe082] transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer mt-4"
                      >
                        Lưu Thay Đổi 💾
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. NOTIFICATIONS & SOUND SUB-PANEL */}
                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#1b263b]/10 pb-3">
                      <h3 className="font-serif font-black text-xl text-[#1b263b]">Thông báo & Âm thanh</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Tùy chọn tần suất gửi thông báo nhắc nhở & hiệu ứng âm thanh bài thi</p>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between border-b border-[#1b263b]/5 pb-3">
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Nhắc nhở học tập hàng ngày</label>
                          <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                            Gửi email/thông báo nhắc lịch làm bài thi thử hoặc ôn tập bài thi yếu.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsReminder}
                            onChange={(e) => setSettingsReminder(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#1b263b]/5 pb-3">
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Cảnh báo Streak liên tiếp</label>
                          <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                            Thông báo khẩn cấp trước khi kết thúc ngày để bạn hoàn thành điểm danh bảo vệ streak.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsStreakAlert}
                            onChange={(e) => setSettingsStreakAlert(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#1b263b]/5 pb-3">
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Đề xuất lộ trình AI thông minh</label>
                          <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                            AI tự động gợi ý đề thi IELTS Reading/Listening phù hợp với trình độ kỹ năng hiện tại.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsAIRecommend}
                            onChange={(e) => setSettingsAIRecommend(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between border-b border-[#1b263b]/5 pb-3">
                        <div className="max-w-[75%]">
                          <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Hiệu ứng âm thanh hệ thống</label>
                          <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                            Bật âm thanh chúc mừng khi làm bài đạt điểm cao hoặc kết thúc bài nghe Listening.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settingsSoundEffects}
                            onChange={(e) => setSettingsSoundEffects(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                        </label>
                      </div>

                      {settingsSoundEffects && (
                        <div className="space-y-2 pt-2 animate-fadeIn">
                          <div className="flex justify-between items-center text-xs font-black text-[#1b263b]">
                            <span>Âm lượng âm thanh hiệu ứng</span>
                            <span>{settingsVolume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settingsVolume}
                            onChange={(e) => setSettingsVolume(Number(e.target.value))}
                            className="w-full accent-[#1b263b] h-2.5 bg-[#eae6ca] rounded-lg appearance-none cursor-pointer border border-[#1b263b]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. APPEARANCE & LANGUAGE SUB-PANEL */}
                {activeSection === 'appearance' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#1b263b]/10 pb-3">
                      <h3 className="font-serif font-black text-xl text-[#1b263b]">Giao diện & Ngôn ngữ</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Tùy biến ngôn ngữ hệ thống & cấu hình giao diện tối/sáng</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block mb-2">Chủ đề giao diện</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'light', label: '☀️ Sáng' },
                            { id: 'dark', label: '🌙 Tối' },
                            { id: 'system', label: '🖥️ Hệ thống' },
                          ].map((themeOpt) => (
                            <button
                              key={themeOpt.id}
                              type="button"
                              onClick={() => setSettingsTheme(themeOpt.id as any)}
                              className={`py-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                                settingsTheme === themeOpt.id
                                  ? 'bg-[#ffd54f] text-[#1b263b] border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              {themeOpt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">Ngôn ngữ hiển thị chính</label>
                        <select
                          value={settingsLanguage}
                          onChange={(e) => setSettingsLanguage(e.target.value as any)}
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none"
                        >
                          <option value="vi">Tiếng Việt (Vietnamese)</option>
                          <option value="en">English (United States)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SECURITY & ALGORITHM SUB-PANEL */}
                {activeSection === 'security' && (
                  <div className="space-y-6">
                    <div className="border-b border-[#1b263b]/10 pb-3">
                      <h3 className="font-serif font-black text-xl text-[#1b263b]">Bảo mật & Thuật toán gợi ý</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Xác thực đăng nhập và điều khiển mô hình AI đề xuất học tập</p>
                    </div>

                    {/* 2FA Section */}
                    <div className="bg-[#fdfaf2] border-2 border-[#1b263b] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-between">
                      <div className="text-left max-w-[75%]">
                        <label className="text-xs font-black uppercase text-[#1b263b] tracking-wider block">Xác thực đăng nhập 2 lớp (2FA)</label>
                        <span className="text-[10px] font-bold text-gray-400 block mt-0.5">
                          Tự động gửi mã bảo mật đăng nhập qua email khi có thiết bị mới truy cập tài khoản.
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
                        <div className="w-11 h-6 bg-[#eae6ca] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00CC99] border-2 border-[#1b263b]"></div>
                      </label>
                    </div>

                    {/* AI Recommendation Algorithm */}
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider block">Mô hình định hướng ôn tập AI</label>
                      <div className="space-y-2">
                        {[
                          { id: 'adaptive', title: 'Adaptive Learning (Học máy thích ứng)', desc: 'AI tự động tối ưu hóa mức độ khó của đề thi IELTS dựa trên lịch sử điểm số của bạn.' },
                          { id: 'random', title: 'Randomized Prep (Luyện tập ngẫu nhiên)', desc: 'Gợi ý các đề thi IELTS đa dạng, ngẫu nhiên để rèn luyện kỹ năng giải đề tổng thể.' },
                          { id: 'weakness', title: 'Weak-Skill Focus (Ưu tiên phần kỹ năng yếu)', desc: 'Tập trung triệt để vào các kỹ năng nghe/đọc bạn đang đạt điểm thấp nhất.' }
                        ].map((algo) => (
                          <label
                            key={algo.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              settingsAlgorithm === algo.id
                                ? 'bg-white border-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]'
                                : 'bg-white/40 border-[#1b263b]/10 hover:border-[#1b263b]/30'
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
                              <span className="text-xs font-black text-[#1b263b] block">{algo.title}</span>
                              <span className="text-[10px] text-gray-400 block mt-0.5">{algo.desc}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="border-t border-[#1b263b]/10 pt-4 space-y-4">
                      <h4 className="font-serif font-black text-lg text-[#1b263b]">Thay đổi mật khẩu</h4>
                      
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
                          <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2 text-xs font-bold text-[#1b263b] outline-none"
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
                              className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2 text-xs font-bold text-[#1b263b] outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Xác nhận mật khẩu mới</label>
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2 text-xs font-bold text-[#1b263b] outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="w-full bg-[#fbcfe8] text-[#c92a2a] border-2 border-[#1b263b] py-2.5 rounded-xl font-black text-xs uppercase hover:bg-[#f9a8d4] disabled:opacity-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] text-center cursor-pointer mt-2"
                        >
                          {passwordLoading ? 'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu bảo mật 🔑'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* 5. TERMS SUB-PANEL */}
                {activeSection === 'terms' && (
                  <div className="space-y-5">
                    <div className="border-b border-[#1b263b]/10 pb-3">
                      <h3 className="font-serif font-black text-xl text-[#1b263b]">Điều khoản dịch vụ & Chính sách</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">Cam kết bảo mật thông tin & chính sách bản quyền luyện thi</p>
                    </div>

                    <div className="bg-white border-2 border-[#1b263b]/20 rounded-xl p-4 h-[180px] overflow-y-auto text-gray-500 text-[10px] leading-relaxed space-y-3 font-bold select-none text-left">
                      <p className="font-black text-[#1b263b] text-xs">CHÀO MỪNG BẠN ĐẾN VỚI APEX IELTS</p>
                      <p>
                        Chào mừng bạn đến với Hệ thống Luyện thi IELTS Thông minh Apex. Khi sử dụng các dịch vụ học tập trực tuyến, thi thử trực tuyến, đánh giá bài viết và giọng nói AI của chúng tôi, bạn đồng ý tuân thủ các điều khoản dịch vụ và chính sách bảo mật này.
                      </p>
                      <p className="font-black text-[#1b263b]">1. QUYỀN SỞ HỮU TRÍ TUỆ</p>
                      <p>
                        Mọi tài liệu luyện thi, đề thi mẫu, thuật toán chấm điểm AI, và cấu trúc thiết kế giao diện đều thuộc quyền sở hữu độc quyền của hệ thống. Người dùng không được sao chép, phát tán trái phép dưới mọi hình thức thương mại hoặc phi thương mại.
                      </p>
                      <p className="font-black text-[#1b263b]">2. CAM KẾT BẢO MẬT DỮ LIỆU CÁ NHÂN</p>
                      <p>
                        Chúng tôi tôn trọng và bảo mật tuyệt đối thông tin tài khoản, điểm số, bài viết, tệp ghi âm giọng nói luyện nói và tiến trình học tập của bạn. Mọi dữ liệu thu âm chỉ được sử dụng để phân tích cải thiện kỹ năng nói trực tiếp của bạn bằng AI.
                      </p>
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] font-bold text-gray-400 block mb-3">Bạn có thắc mắc hoặc cần hỗ trợ thêm?</span>
                      <a
                        href="mailto:support@apexielts.com"
                        className="inline-block bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] px-4 py-2.5 rounded-xl text-xs font-black hover:bg-[#91e8c1] transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                      >
                        ✉ Liên hệ bộ phận hỗ trợ
                      </a>
                    </div>

                    <div className="pt-4 border-t border-red-500/10 flex flex-col items-center">
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-wider block mb-2">Vùng nguy hiểm</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("CẢNH BÁO: Hành động này là vĩnh viễn và không thể khôi phục. Tất cả dữ liệu bài làm, streak và danh hiệu của bạn sẽ bị xoá vĩnh viễn. Bạn có chắc chắn muốn xoá tài khoản?")) {
                            alert("Yêu cầu xoá tài khoản đã được ghi nhận. Vui lòng liên hệ Admin để được hỗ trợ xoá tài khoản chính thức.");
                          }
                        }}
                        className="bg-[#fecaca] text-[#dc2626] border-2 border-[#dc2626]/40 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-[#fee2e2] transition-all cursor-pointer"
                      >
                        ❌ Yêu cầu xoá tài khoản vĩnh viễn
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
