import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout, loginSuccess } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get active tab from URL or default to 'courses' (Your Shelf)
  const [activeTab, setActiveTab] = useState<'courses' | 'results' | 'bookings' | 'notes' | 'settings'>('courses');

  // Loaders & Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

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
  const [formSaved, setFormSaved] = useState(false);

  // Fetch all profile details, stats, exam results, and mentor bookings from backend
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile Info
      const profileRes = await apiClient.get('/auth/profile');
      const profile = profileRes.data.metadata || profileRes.data;
      if (profile) {
        setFormFullName(profile.fullName || '');
        setFormEmail(profile.email || '');
        setFormPhone(profile.phone || '');
        setFormBirthDate(profile.birthday || '');
        setFormIdentityNumber(profile.identityNumber || '');
        setFormBio(profile.bio || '');
        setFormExpertise(profile.expertise || '');
      }

      // 2. Fetch Aggregated Exam Stats
      const statsRes = await apiClient.get('/users/me/stats');
      setStats(statsRes.data?.data || null);

      // 3. Fetch Completed Exam History
      const resultsRes = await apiClient.get('/users/me/results');
      setResults(resultsRes.data?.data?.results || []);

      // 4. Fetch Mentor Bookings
      const bookingsRes = await apiClient.get('/bookings');
      setBookings(bookingsRes.data?.data || []);
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
    if (tabParam === 'settings') {
      setActiveTab('settings');
    } else if (tabParam === 'results') {
      setActiveTab('results');
    } else if (tabParam === 'bookings') {
      setActiveTab('bookings');
    } else if (tabParam === 'notes') {
      setActiveTab('notes');
    } else {
      setActiveTab('courses');
    }
  }, [searchParams]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh phải nhỏ hơn 5MB");
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
        
        alert("Cập nhật ảnh đại diện thành công!");
        loadData(); // Reload details
      } catch (err: any) {
        console.error("Avatar upload failed:", err);
        alert("Lỗi khi tải ảnh đại diện lên: " + (err.response?.data?.message || err.message));
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.onerror = () => {
      alert("Không thể đọc tệp tin hình ảnh");
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
        expertise: formExpertise
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
      }, 1500);

      loadData(); // reload stats and text
    } catch (err: any) {
      console.error("Save profile settings failed:", err);
      alert("Lỗi khi lưu thông tin: " + (err.response?.data?.message || err.message));
    }
  };

  const initials = formFullName
    ? formFullName.split(' ').slice(-1)[0][0]?.toUpperCase()
    : 'A';

  // Stats values derived dynamically
  const overallBand = stats?.overallBand !== null && stats?.overallBand !== undefined ? stats.overallBand.toFixed(1) : 'N/A';
  const totalTests = stats?.totalTests !== null && stats?.totalTests !== undefined ? stats.totalTests : 0;
  const topScore = stats?.topScore !== null && stats?.topScore !== undefined ? stats.topScore.toFixed(1) : 'N/A';
  const studyHours = stats?.studyHours !== null && stats?.studyHours !== undefined ? stats.studyHours : 0;

  // Stats Card data
  const statsCards = [
    {
      icon: (
        <svg className="w-5 h-5 text-[#b03030]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      value: overallBand,
      label: 'Avg Overall Band',
      bgClass: 'hover:bg-red-50/20'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      value: totalTests,
      label: 'Tests Completed',
      bgClass: 'hover:bg-emerald-50/20'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      value: topScore,
      label: 'Highest Band Score',
      bgClass: 'hover:bg-amber-50/20'
    },
    {
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      value: studyHours + 'h',
      label: 'Total Study Time',
      bgClass: 'hover:bg-blue-50/20'
    }
  ];

  // Dynamic Skills/Courses Shelf Items mapped to database statistics
  const coursesShelf = [
    {
      title: 'Speaking Simulator',
      daysBadge: 'AI Speaking Evaluator',
      grade: stats?.speakingBand !== null && stats?.speakingBand !== undefined ? `${stats.speakingBand.toFixed(1)}` : 'N/A',
      notesCount: 'Fluency & Coherence',
      progress: stats?.speakingBand ? Math.min(Math.round((stats.speakingBand / 9) * 100), 100) : 0,
      accentColor: '#4682b4',
      bgLine: 'bg-sky-400',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      title: 'Writing Evaluator',
      daysBadge: 'AI Essay Evaluation',
      grade: stats?.writingBand !== null && stats?.writingBand !== undefined ? `${stats.writingBand.toFixed(1)}` : 'N/A',
      notesCount: 'Task Achievement & Cohesion',
      progress: stats?.writingBand ? Math.min(Math.round((stats.writingBand / 9) * 100), 100) : 0,
      accentColor: '#d97706',
      bgLine: 'bg-amber-400',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'Reading Practice',
      daysBadge: 'Full IELTS Passage Reading',
      grade: stats?.readingBand !== null && stats?.readingBand !== undefined ? `${stats.readingBand.toFixed(1)}` : 'N/A',
      notesCount: 'Academic Vocabulary & Comprehension',
      progress: stats?.readingBand ? Math.min(Math.round((stats.readingBand / 9) * 100), 100) : 0,
      accentColor: '#005c42',
      bgLine: 'bg-emerald-400',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Listening Practice',
      daysBadge: 'Audio Listening Session',
      grade: stats?.listeningBand !== null && stats?.listeningBand !== undefined ? `${stats.listeningBand.toFixed(1)}` : 'N/A',
      notesCount: 'Spelling Accuracy & Tracking',
      progress: stats?.listeningBand ? Math.min(Math.round((stats.listeningBand / 9) * 100), 100) : 0,
      accentColor: '#c92a2a',
      bgLine: 'bg-pink-400',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-200'
    }
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
                M
              </div>
              <span className="text-xl font-serif font-black tracking-tight text-[#1b263b]">
                Marginalia
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black text-[#1b263b]/80 uppercase tracking-wider">
            <Link to="/" className="hover:text-[#b03030] transition-colors">Planner</Link>
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
      <div className="max-w-7xl w-full mx-auto pl-[110px] pr-6 md:pr-12 py-10 flex-1 flex flex-col gap-10 z-10">
        
        {/* PROFILE CARD */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#1b263b]/10">
          
          {/* Avatar and Info */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => avatarInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-[#b03030] border-2 border-[#1b263b] flex items-center justify-center text-white font-serif font-black text-4xl shadow-[4px_4px_0px_0px_#1b263b] relative group cursor-pointer overflow-hidden select-none shrink-0"
              title="Nhấn để đổi ảnh đại diện"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
              
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <span className="text-[10px] text-white font-black animate-pulse">UPLOADING...</span>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[8px] text-white font-bold tracking-wider mt-1">CHANGE AVATAR</span>
                  </>
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

            <div className="text-left space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-serif font-black text-[#1b263b] leading-tight">
                  {formFullName || user?.username || 'Student User'}
                </h2>
                <span className="bg-[#f0fdf4] border border-emerald-500/30 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  {user?.role || 'STUDENT'}
                </span>
              </div>
              
              {formBio ? (
                <p className="font-handwriting text-[#b03030] text-xl font-medium" style={{ fontFamily: "'Caveat', cursive" }}>
                  "{formBio}"
                </p>
              ) : (
                <p className="font-handwriting text-gray-400 text-lg font-medium" style={{ fontFamily: "'Caveat', cursive" }}>
                  Chưa thiết lập tiểu sử (Bio).
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 flex-wrap pt-1">
                {formExpertise && <span className="flex items-center gap-1">💼 Chuyên môn: {formExpertise}</span>}
                <span className="flex items-center gap-1">📝 {totalTests} bài thi</span>
                <span className="flex items-center gap-1">⭐ Band {overallBand}</span>
                <span className="flex items-center gap-1">🕒 {studyHours} giờ học</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSearchParams({ tab: 'settings' });
              setActiveTab('settings');
            }}
            className="bg-white border-2 border-[#1b263b] px-4.5 py-2 rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#1b263b] hover:bg-gray-50 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-auto"
          >
            ✏️ Edit Profile
          </button>
        </section>

        {/* STATS CARDS GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, idx) => (
            <div 
              key={idx}
              className={`bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b] flex items-start gap-4 transition-all text-left group ${card.bgClass}`}
            >
              <div className="p-2.5 border-2 border-[#1b263b] rounded-xl bg-white shadow-[2px_2px_0px_0px_#1b263b] group-hover:scale-105 transition-transform">
                {card.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-3xl font-serif font-black text-[#1b263b] leading-none">
                  {card.value}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* NAVIGATION PILL TABS */}
        <section className="flex justify-start">
          <div className="bg-[#eae6ca]/60 border-2 border-[#1b263b] p-1 rounded-2xl flex flex-wrap gap-1 shadow-sm">
            <button
              onClick={() => {
                setSearchParams({ tab: 'courses' });
                setActiveTab('courses');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'courses' 
                  ? 'bg-[#1b263b] text-[#f6f3db] shadow-md' 
                  : 'text-[#1b263b] hover:bg-[#1b263b]/5'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => {
                setSearchParams({ tab: 'results' });
                setActiveTab('results');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'results' 
                  ? 'bg-[#1b263b] text-[#f6f3db] shadow-md' 
                  : 'text-[#1b263b] hover:bg-[#1b263b]/5'
              }`}
            >
              Exam History
            </button>
            <button
              onClick={() => {
                setSearchParams({ tab: 'bookings' });
                setActiveTab('bookings');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'bookings' 
                  ? 'bg-[#1b263b] text-[#f6f3db] shadow-md' 
                  : 'text-[#1b263b] hover:bg-[#1b263b]/5'
              }`}
            >
              Mentor Sessions
            </button>
            <button
              onClick={() => {
                setSearchParams({ tab: 'notes' });
                setActiveTab('notes');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'notes' 
                  ? 'bg-[#1b263b] text-[#f6f3db] shadow-md' 
                  : 'text-[#1b263b] hover:bg-[#1b263b]/5'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => {
                setSearchParams({ tab: 'settings' });
                setActiveTab('settings');
              }}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-[#1b263b] text-[#f6f3db] shadow-md' 
                  : 'text-[#1b263b] hover:bg-[#1b263b]/5'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </section>

        {/* TAB SPECIFIC VIEW */}
        <section className="flex-1 flex flex-col">
          {loading ? (
            <div className="py-20 text-center text-sm font-black text-[#1b263b] animate-pulse">
              📝 Loading profile workspace...
            </div>
          ) : (
            <>
              {activeTab === 'courses' && (
                /* COURSES TAB (YOUR SHELF) */
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-4">
                    <span className="text-[#b03030] font-black text-xs uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b03030]" /> Your Skill Progress
                    </span>
                    <Link 
                      to="/practice"
                      className="bg-[#b03030] text-white border-2 border-[#1b263b] px-4 py-1.5 rounded-xl text-xs font-black hover:bg-[#902020] transition-all shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer"
                    >
                      + Practice Exam
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coursesShelf.map((course, index) => (
                      <div 
                        key={index} 
                        className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b] flex flex-col justify-between min-h-[160px] relative hover:translate-y-[-2px] transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-base font-serif font-black text-[#1b263b] leading-snug">
                              {course.title}
                            </h4>
                            
                            <div className="w-10 h-10 rounded-full border-2 border-[#b03030] bg-[#fdfaf2] text-[#b03030] flex flex-col items-center justify-center font-serif shadow-sm select-none shrink-0">
                              <span className="text-[7px] font-black leading-none uppercase">BAND</span>
                              <span className="text-xs font-black leading-tight">{course.grade}</span>
                            </div>
                          </div>

                          <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded border ${course.badgeBg}`}>
                            {course.daysBadge}
                          </span>
                        </div>

                        <div className="mt-6 space-y-2">
                          <div className="h-1.5 w-full bg-[#eae6ca] rounded-full overflow-hidden">
                            <div className={`h-full ${course.bgLine}`} style={{ width: `${course.progress}%` }} />
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-black text-gray-500">
                            <span>{course.notesCount}</span>
                            <span>{course.progress}% target</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                /* EXAM HISTORY TAB */
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-4">
                    <span className="text-sky-700 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" /> Completed Exams History
                    </span>
                  </div>

                  {results.length === 0 ? (
                    <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-10 shadow-[4px_4px_0px_0px_#1b263b] text-center space-y-4">
                      <p className="text-sm font-black text-gray-500">Bạn chưa thực hiện bài kiểm tra nào.</p>
                      <Link
                        to="/practice"
                        className="inline-block bg-[#b03030] text-white border-2 border-[#1b263b] px-6 py-2.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#1b263b] hover:translate-y-[-1px] transition-all"
                      >
                        Làm bài thi thử ngay 📝
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.map((r, index) => {
                        const formattedDate = new Date(r.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        const durationMins = Math.round(r.timeTaken / 60);

                        return (
                          <div 
                            key={r.id || index}
                            className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b] relative flex flex-col justify-between hover:translate-y-[-2px] transition-all"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[9px] font-black uppercase bg-slate-100 border border-[#1b263b] px-2 py-0.5 rounded">
                                  {r.type}
                                </span>
                                <span className="text-[10px] font-black text-gray-400">{formattedDate}</span>
                              </div>
                              <h4 className="text-lg font-serif font-black text-[#1b263b] leading-tight pt-1">
                                {r.title}
                              </h4>
                            </div>

                            <div className="mt-5 pt-3 border-t border-[#1b263b]/10 flex justify-between items-center">
                              <div className="space-y-0.5 text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase">Correct Answers</p>
                                <p className="text-xs font-black text-[#1b263b]">{r.correctCount !== undefined ? `${r.correctCount} câu` : 'N/A'}</p>
                              </div>
                              <div className="space-y-0.5 text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase">Time Taken</p>
                                <p className="text-xs font-black text-[#1b263b]">{durationMins > 0 ? `${durationMins} phút` : `${r.timeTaken} giây`}</p>
                              </div>
                              <div className="w-12 h-12 rounded-full border-2 border-[#b03030] bg-[#fdfaf2] text-[#b03030] flex flex-col items-center justify-center font-serif shadow-sm select-none">
                                <span className="text-[8px] font-black leading-none uppercase">BAND</span>
                                <span className="text-sm font-black leading-tight">{r.bandScore?.toFixed(1) || '0.0'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'bookings' && (
                /* MENTOR SESSIONS TAB */
                <div className="space-y-6 text-left">
                  <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-4">
                    <span className="text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Scheduled Mentor Sessions
                    </span>
                  </div>

                  {bookings.length === 0 ? (
                    <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-10 shadow-[4px_4px_0px_0px_#1b263b] text-center space-y-4">
                      <p className="text-sm font-black text-gray-500">Bạn chưa đặt buổi học nào với Mentor.</p>
                      <Link
                        to="/practice?tab=mentors"
                        className="inline-block bg-[#b03030] text-white border-2 border-[#1b263b] px-6 py-2.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_#1b263b] hover:translate-y-[-1px] transition-all"
                      >
                        Tìm Mentor và Đặt lịch ngay 👥
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {bookings.map((b, index) => {
                        const startDate = new Date(b.startTime);
                        const endDate = new Date(b.endTime);
                        const formattedDate = startDate.toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        });
                        const timeRange = `${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

                        const statusColors = {
                          PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
                          CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          CANCELLED: 'bg-red-50 text-red-700 border-red-200'
                        };

                        return (
                          <div 
                            key={b.id || index}
                            className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] relative flex flex-col md:flex-row gap-6 hover:translate-y-[-1px] transition-all"
                          >
                            <div className="flex-1 space-y-4 text-left">
                              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#1b263b]/10 pb-3">
                                <div>
                                  <h4 className="text-base font-serif font-black text-[#1b263b]">
                                    Mentor Session with {b.mentor?.fullName || 'Mentor'}
                                  </h4>
                                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{b.mentor?.email}</p>
                                </div>
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase ${statusColors[b.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-700'}`}>
                                  {b.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-gray-500">
                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-gray-400">Thời gian học</p>
                                  <p className="text-[#1b263b] text-xs font-black mt-0.5">{formattedDate}</p>
                                  <p className="text-[#b03030] text-[11px] font-black">{timeRange}</p>
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-gray-400">Meeting Link</p>
                                  {b.availability?.meetingLink ? (
                                    <a 
                                      href={b.availability.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sky-600 hover:text-sky-700 font-black text-xs underline flex items-center gap-1 mt-0.5"
                                    >
                                      🔗 Join Classroom Session
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 font-black text-xs italic mt-0.5 block">Chưa cập nhật link phòng</span>
                                  )}
                                </div>
                              </div>

                              <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#1b263b]/10">
                                <div className="bg-[#fefefe]/80 border border-[#1b263b]/15 rounded-xl p-3 text-xs">
                                  <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Ghi chú của học viên (Mục tiêu)</p>
                                  <p className="text-gray-600 italic font-semibold">{b.notes || 'Không có ghi chú'}</p>
                                </div>
                                <div className="bg-[#fefefe]/80 border border-[#1b263b]/15 rounded-xl p-3 text-xs">
                                  <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Nhận xét của Mentor</p>
                                  <p className="text-gray-600 italic font-semibold">{b.mentorNotes || 'Chưa có nhận xét nào từ mentor sau buổi học.'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                /* NOTES LOG TAB - Ruled notebook styling */
                <div className="space-y-6 text-left max-w-4xl mx-auto w-full">
                  <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-4">
                    <span className="text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Study Log & Notes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      {
                        date: 'June 25, 2026',
                        title: 'Speaking cue card: Historical Places 🏛️',
                        content: 'Today I practiced speaking about historical locations. I structured my ideas around the Temple of Literature in Hanoi. Key vocabulary used: "architectural grandeur", "cultural heritage", "intellectual hub". My fluency score reached 7.5!',
                        bgColor: '#fdfbf7',
                        tapeColor: 'rgba(70, 130, 180, 0.2)',
                        rotate: '-1deg'
                      },
                      {
                        date: 'June 23, 2026',
                        title: 'Writing Task 2: Online Learning Feedback ✍️',
                        content: 'Submitted an essay on the comparison between classroom learning and virtual models. AI flagged a few subject-verb agreement issues in paragraph 3. Band score: 6.5. Must review cohesive devices next week.',
                        bgColor: '#ffd54f',
                        tapeColor: 'rgba(201, 42, 42, 0.2)',
                        rotate: '1deg'
                      },
                      {
                        date: 'June 21, 2026',
                        title: 'Reading simulator progress: Headings Match 📖',
                        content: 'Completed matching headings tasks in Section 3 of Cambridge IELTS 17. The vocabulary was dense but checking negative qualifiers and synonyms helped. Accuracy rate: 8/10.',
                        bgColor: '#fdfbf7',
                        tapeColor: 'rgba(5, 150, 105, 0.2)',
                        rotate: '-1.5deg'
                      },
                      {
                        date: 'June 18, 2026',
                        title: 'Vocabulary expansion list 📓',
                        content: 'Adding formal synonyms for essay writing:\n- "Very important" → "Paramount", "Crucial"\n- "In my opinion" → "From my standpoint"\n- "Solve a problem" → "Address/Mitigate an issue"',
                        bgColor: '#a7f3d0',
                        tapeColor: 'rgba(217, 119, 6, 0.2)',
                        rotate: '2deg'
                      }
                    ].map((note, idx) => (
                      <div 
                        key={idx} 
                        style={{ backgroundColor: note.bgColor, transform: `rotate(${note.rotate})` }}
                        className="border-2 border-[#1b263b] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1b263b] relative overflow-hidden transition-all hover:rotate-0 hover:scale-[1.01]"
                      >
                        <div 
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 -translate-y-2 border border-[#1b263b]/10 shadow-sm"
                          style={{ backgroundColor: note.tapeColor }}
                        />
                        
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{note.date}</p>
                        <h5 className="text-base font-serif font-black text-[#1b263b] mt-2 mb-3">
                          {note.title}
                        </h5>
                        <p 
                          className="text-sm font-bold text-gray-600 leading-relaxed font-handwriting"
                          style={{ fontFamily: "'Caveat', cursive", fontSize: '1.25rem', lineHeight: '1.75rem' }}
                        >
                          {note.content.split('\n').map((line, lIdx) => (
                            <span key={lIdx} className="block">{line}</span>
                          ))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                /* EDIT PROFILE TAB */
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[5px_5px_0px_0px_#1b263b] text-left max-w-2xl mx-auto w-full">
                  <h4 className="font-serif font-black text-xl text-[#1b263b] mb-1">Edit profile details</h4>
                  <p className="text-xs font-bold text-gray-500 mb-6">Modify your profile details. They will be saved to your dashboard cloud account.</p>

                  {formSaved && (
                    <div className="mb-6 bg-emerald-100 border-2 border-emerald-800 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b]">
                      ✓ Saved changes successfully!
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Họ và tên</label>
                      <input
                        type="text"
                        required
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner animate-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Email liên hệ</label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner animate-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Số điện thoại</label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="0912 345 678"
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Ngày sinh</label>
                        <input
                          type="text"
                          value={formBirthDate}
                          onChange={(e) => setFormBirthDate(e.target.value)}
                          placeholder="15/08/2002"
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Số CCCD / Hộ chiếu</label>
                        <input
                          type="text"
                          value={formIdentityNumber}
                          onChange={(e) => setFormIdentityNumber(e.target.value)}
                          placeholder="0312xxxxxxxx"
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Chuyên môn / Target</label>
                        <input
                          type="text"
                          value={formExpertise}
                          onChange={(e) => setFormExpertise(e.target.value)}
                          placeholder="IELTS 7.5 Target"
                          className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Tiểu sử (Bio / Châm ngôn)</label>
                      <textarea
                        value={formBio}
                        onChange={(e) => setFormBio(e.target.value)}
                        placeholder="Learning is sharpest when the pencil is, too."
                        rows={2}
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50 shadow-inner resize-none"
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#91e8c1] transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] text-center cursor-pointer"
                      >
                        Save Changes 💾
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchParams({ tab: 'courses' });
                          setActiveTab('courses');
                        }}
                        className="bg-white border-2 border-[#1b263b] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-50 transition-all text-center cursor-pointer text-[#1b263b]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </section>

      </div>

    </div>
  );
}
