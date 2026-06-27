import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { logout } from '../auth/authSlice';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('overview');
    }
  }, [searchParams]);

  // Settings form states
  const [formFullName, setFormFullName] = useState(user?.fullName || 'Nguyễn Minh Anh');
  const [formEmail, setFormEmail] = useState(user?.email || 'minhanh@gmail.com');
  const [formPhone, setFormPhone] = useState('0912345678');
  const [formBirthDate, setFormBirthDate] = useState('15/08/2002');
  const [formSaved, setFormSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormFullName(user.fullName);
      setFormEmail(user.email);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, fullName: formFullName, email: formEmail };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setFormSaved(true);
      setTimeout(() => {
        setFormSaved(false);
        window.location.reload();
      }, 1500);
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').slice(-2).map((part) => part[0]?.toUpperCase()).join('')
    : 'MA';

  const stats = [
    { icon: '🔥', label: 'Streak', value: '42 Days', bg: '#fbcfe8', color: '#c92a2a' },
    { icon: '📚', label: 'Completed', value: '34 Tests', bg: '#e0f2fe', color: '#4682b4' },
    { icon: '💬', label: 'AI Scored', value: '28 Logs', bg: '#a7f3d0', color: '#005c42' },
    { icon: '🏅', label: 'Badges', value: '3 Badges', bg: '#ffd54f', color: '#d97706' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f3dc] bg-notebook-paper bg-notebook bg-repeat text-[#1b263b] font-sans antialiased selection:bg-[#ffd54f]/40 relative overflow-x-hidden custom-pencil-cursor pt-8 pb-24">
      
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
      <div className="pl-[95px] pr-6 md:pr-12 max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* HEADER */}
        <header className="border-b-2 border-[#1b263b] pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="w-10 h-10 rounded-xl border-2 border-[#1b263b] bg-white flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#1b263b] hover:bg-[#ffd54f] transition-all cursor-pointer"
            >
              ←
            </Link>
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tight text-[#1b263b]">
                Student Profile
              </h1>
              <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-widest font-black">Marginalia IELTS System</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="border-2 border-[#1b263b] px-4 py-1.5 rounded-xl hover:bg-[#c92a2a] hover:text-white transition-all bg-white font-black text-xs shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b]"
          >
            🚪 Sign Out
          </button>
        </header>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* LEFT SIDE: PROFILE CARD (md:col-span-2) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* User Info card */}
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffd54f]/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-[#a7f3d0] border-2 border-[#1b263b] flex items-center justify-center text-emerald-800 font-serif font-black text-3xl shadow-[3px_3px_0px_0px_#1b263b] relative group">
                  {initials}
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#1b263b] border-2 border-[#fcfbf7] flex items-center justify-center cursor-pointer shadow-sm hover:scale-115 transition-all">
                    <span className="text-[10px] text-white">📷</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-serif font-black text-[#1b263b] leading-tight">
                    {user?.fullName || 'Nguyễn Minh Anh'}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">{user?.email}</p>
                  <span className="inline-block mt-3 bg-[#ffd54f] border-2 border-[#1b263b] text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#1b263b]">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>
              </div>

              {/* Band Score Targets */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b]">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Current Band</p>
                  <p className="text-3xl font-serif font-black text-[#c92a2a] mt-1">6.75</p>
                </div>
                <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 border-dashed">
                  <p className="text-[9px] font-black text-gray-400 uppercase">Target Band</p>
                  <p className="text-3xl font-serif font-black text-[#1b263b] mt-1">7.5</p>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-[#1b263b]/10">
                {stats.map((stat, idx) => (
                  <div 
                    key={idx} 
                    style={{ backgroundColor: stat.bg }} 
                    className="border-2 border-[#1b263b] rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_#1b263b] text-left hover:scale-[1.02] transition-all"
                  >
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-[9px] font-black text-gray-500 uppercase mt-2 tracking-wider">{stat.label}</p>
                    <p className="text-base font-black text-[#1b263b] mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* RIGHT SIDE: TABS CONTAINER (md:col-span-3) */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Tab Triggers */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-2.5 border-2 border-[#1b263b] rounded-t-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1b263b] ${
                  activeTab === 'overview' 
                    ? 'bg-[#1b263b] text-[#f5f3dc]' 
                    : 'bg-[#fcfbf7] text-[#1b263b] hover:bg-gray-50'
                }`}
              >
                📊 Study Overview
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-2.5 border-2 border-[#1b263b] rounded-t-2xl text-xs font-black uppercase transition-all cursor-pointer shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#1b263b] ${
                  activeTab === 'settings' 
                    ? 'bg-[#1b263b] text-[#f5f3dc]' 
                    : 'bg-[#fcfbf7] text-[#1b263b] hover:bg-gray-50'
                }`}
              >
                ⚙️ Account Details
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === 'overview' ? (
              /* OVERVIEW TAB */
              <div className="space-y-6">
                
                {/* AI Advice Sticky Note */}
                <div className="relative transform rotate-[1deg] hover:rotate-0 transition-transform">
                  <div className="absolute top-[-12px] left-[50%] ml-[-45px] w-24 h-6 bg-white/70 border border-gray-300/40 transform -rotate-[2deg] shadow-sm z-10" />
                  <div className="bg-[#ffd54f] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1b263b] text-left">
                    <h4 className="font-serif font-black text-base text-[#c92a2a] mb-2">AI Advisor Feedback 🤖</h4>
                    <p className="text-sm font-bold text-[#1b263b] leading-relaxed">
                      "Your Speaking fluency is improving, but watch out for subject-verb agreement in Writing Task 2. Focus on Reading Section 3 matching headings tomorrow!"
                    </p>
                    <div className="mt-4 pt-3 border-t border-[#1b263b]/10 flex items-center justify-between text-[10px] font-black text-gray-500">
                      <span>Apex AI Coach</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Study Plan */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] text-left">
                  <h4 className="font-serif font-black text-lg text-[#1b263b] mb-4">Weekly Study Plan</h4>
                  <div className="space-y-3">
                    {[
                      { text: 'Practice Part 2 cue cards (AI coach)', done: true },
                      { text: 'Submit Essay on Education System', done: true },
                      { text: 'Complete Cambridge IELTS 17 Test 2', done: false },
                      { text: 'Review writing feedback from Mentor', done: false },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 py-1">
                        <span className={`text-base select-none ${item.done ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {item.done ? '☑️' : '⬜'}
                        </span>
                        <span className={`text-xs font-bold ${item.done ? 'line-through text-gray-400' : 'text-[#1b263b]'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Breakdown */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] text-left">
                  <h4 className="font-serif font-black text-lg text-[#1b263b] mb-4">Detailed Skill Breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Reading', score: '7.5', progress: 75, color: '#4682b4', emoji: '📖' },
                      { label: 'Listening', score: '8.5', progress: 85, color: '#005c42', emoji: '🎧' },
                      { label: 'Writing', score: '6.5', progress: 65, color: '#d97706', emoji: '✍️' },
                      { label: 'Speaking', score: '7.0', progress: 70, color: '#c92a2a', emoji: '🎙️' },
                    ].map((skill) => (
                      <div key={skill.label} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-black">
                          <span className="flex items-center gap-1.5">
                            <span>{skill.emoji}</span>
                            <span>{skill.label}</span>
                          </span>
                          <span style={{ color: skill.color }}>{skill.score}</span>
                        </div>
                        <div className="h-3 bg-[#f5f3dc] border-2 border-[#1b263b] rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} 
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* SETTINGS TAB */
              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1b263b] text-left">
                <h4 className="font-serif font-black text-lg text-[#1b263b] mb-6">Account Details</h4>
                
                {formSaved && (
                  <div className="mb-4 bg-emerald-100 border-2 border-[#1b263b] text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold shadow-[2px_2px_0px_0px_#1b263b]">
                    ✓ Thay đổi đã được lưu thành công!
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Họ và tên</label>
                    <input
                      type="text"
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Email liên hệ</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Số điện thoại</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500">Ngày sinh</label>
                    <input
                      type="text"
                      value={formBirthDate}
                      onChange={(e) => setFormBirthDate(e.target.value)}
                      placeholder="15/08/2002"
                      className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs font-bold text-[#1b263b] outline-none focus:bg-gray-50"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#91e8c1] transition-all shadow-[3px_3px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] text-center cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
