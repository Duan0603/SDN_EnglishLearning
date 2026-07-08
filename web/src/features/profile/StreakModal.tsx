import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api.client';
import { useAppSelector } from '../../store/store';

export default function StreakModal() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [show, setShow] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      apiClient.get('/users/me/stats').then(res => {
        if (res.data?.success) {
          const data = res.data.data || res.data.metadata;
          setStats(data);
          if (data && data.hasCheckedInToday === false) {
            setShow(true);
            setCheckedIn(false);
          } else if (data && data.hasCheckedInToday === true) {
            // Optional: You could show it for testing if you want, but normally keep it hidden
            // setShow(false); 
          }
        }
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated, user]);

  if (!show || !stats) return null;

  const currentStreak = stats.currentStreak || 0;

  const getStreakTier = (streak: number) => {
    if (streak >= 100) return { name: 'Cầu vồng', color: '#ec4899', bg: '#fce7f3' };
    if (streak >= 60) return { name: 'Lửa tím', color: '#a855f7', bg: '#f3e8ff' };
    if (streak >= 30) return { name: 'Lửa xanh', color: '#3b82f6', bg: '#dbeafe' };
    if (streak >= 14) return { name: 'Lửa vàng', color: '#eab308', bg: '#fef08a' };
    if (streak >= 7) return { name: 'Lửa cam', color: '#f97316', bg: '#ffedd5' };
    return { name: 'Tia lửa', color: '#ef4444', bg: '#fee2e2' };
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 7) return 7;
    if (streak < 14) return 14;
    if (streak < 30) return 30;
    if (streak < 60) return 60;
    return 100;
  };

  const tier = getStreakTier(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);
  const nextTier = getStreakTier(nextMilestone);

  let progressMin = 0;
  if (currentStreak >= 60) progressMin = 60;
  else if (currentStreak >= 30) progressMin = 30;
  else if (currentStreak >= 14) progressMin = 14;
  else if (currentStreak >= 7) progressMin = 7;

  const range = nextMilestone - progressMin;
  const progress = currentStreak - progressMin;
  const progressPercent = range > 0 ? (progress / range) * 100 : 100;

  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const todayIdx = (new Date().getDay() + 6) % 7;

  const handleCheckIn = async () => {
    if (checkedIn || loading) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/users/me/checkin');
      if (res.data?.success) {
        setStats({
          ...stats,
          currentStreak: res.data.data.currentStreak,
          hasCheckedInToday: true
        });
        setCheckedIn(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FBF6EC]/95 transition-all">
      {/* CSS Animations */}
      <style>{`
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(-1deg); }
          50% { transform: scale(0.98) rotate(1deg); }
          75% { transform: scale(1.01) rotate(-0.5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1.2); }
          50% { opacity: 0.7; transform: scale(1.35); }
        }
        .animate-flicker {
          animation: flicker 2.5s infinite ease-in-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s infinite ease-in-out;
        }
        .tier-transition {
          transition: background-color 0.6s ease, color 0.6s ease, border-color 0.6s ease;
        }
      `}</style>

      <div className="bg-white rounded-[28px] shadow-2xl p-8 w-full max-w-[380px] relative overflow-hidden flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tier-transition" style={{ color: tier.color }}>
            <path d="M12 2C12 2 5 9 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2ZM12 18C10.3431 18 9 16.6569 9 15C9 13.5 12 10 12 10C12 10 15 13.5 15 15C15 16.6569 13.6569 18 12 18Z" fill="currentColor"/>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'sans-serif', fontWeight: 800 }}>Chuỗi ngày học</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8 font-medium">
          {checkedIn ? "Quay lại vào ngày mai để giữ lửa nhé!" : "Điểm danh mỗi ngày để giữ lửa"}
        </p>

        {/* Big Flame */}
        <div className="relative flex justify-center items-center mb-6">
          <div 
            className="absolute rounded-full blur-2xl animate-pulse-glow tier-transition" 
            style={{ backgroundColor: tier.color, width: '100px', height: '100px', zIndex: 0 }}
          />
          <div className="relative z-10 animate-flicker">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="tier-transition" style={{ color: tier.color, filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))' }}>
              <path d="M11.66 2.37C11.83 2.14 12.17 2.14 12.34 2.37C13.26 3.63 15.68 7.07 17.75 10.45C19.78 13.76 21 16.6 21 18.5C21 23.19 16.97 27 12 27C7.03 27 3 23.19 3 18.5C3 16.6 4.22 13.76 6.25 10.45C8.32 7.07 10.74 3.63 11.66 2.37ZM12 23.5C14.76 23.5 17 21.26 17 18.5C17 16 14.89 12.33 12.28 8.87C11.6 7.97 10.87 7.01 10.15 6.07C8.6 8 7 10.14 7 12.5C7 12.78 7.22 13 7.5 13C7.78 13 8 12.78 8 12.5C8 10.97 9.17 9.47 10.36 8C9.51 9.4 9 10.88 9 12.5C9 15.26 11.24 17.5 14 17.5C14.55 17.5 15 17.95 15 18.5C15 19.05 14.55 19.5 14 19.5C12.35 19.5 11 18.15 11 16.5C11 16.22 10.78 16 10.5 16C10.22 16 10 16.22 10 16.5C10 19.26 12.24 21.5 15 21.5C15.83 21.5 16.5 20.83 16.5 20C16.5 18 14.5 15.5 13 13.5C12.7 13.1 12.3 12.6 12 12.2C10.3 14.4 9 16.6 9 18.5C9 20.16 10.34 21.5 12 21.5Z" fill="currentColor" transform="translate(0, -2) scale(1)"/>
            </svg>
          </div>
        </div>

        {/* Streak Number */}
        <div className="text-[64px] leading-none font-black text-gray-900 tracking-tighter mb-2" style={{ fontFamily: 'sans-serif' }}>
          {currentStreak}
        </div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">
          Ngày liên tiếp
        </div>

        <div className="px-5 py-1.5 rounded-full font-bold text-sm tier-transition mb-8" style={{ backgroundColor: tier.color, color: 'white' }}>
          {tier.name}
        </div>

        {/* 7 Days Row */}
        <div className="flex justify-between w-full mb-6">
          {daysOfWeek.map((day, idx) => {
            const daysAgo = todayIdx - idx;
            const isChecked = daysAgo >= 0 && currentStreak > daysAgo && (daysAgo > 0 || checkedIn);
            const isToday = idx === todayIdx;

            return (
              <div key={day} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">{day}</span>
                <div 
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center tier-transition"
                  style={{
                    backgroundColor: isChecked ? tier.color : '#f3f4f6',
                    border: isToday ? `2px solid ${tier.color}` : '2px solid transparent',
                  }}
                >
                  {isChecked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C12 2 5 9 5 14C5 17.866 8.13401 21 12 21C15.866 21 19 17.866 19 14C19 9 12 2 12 2ZM12 18C10.3431 18 9 16.6569 9 15C9 13.5 12 10 12 10C12 10 15 13.5 15 15C15 16.6569 13.6569 18 12 18Z" fill="white"/>
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
            <span>{currentStreak}/{nextMilestone} ngày</span>
            {currentStreak < 100 && <span>→ {nextTier.name}</span>}
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full tier-transition" 
              style={{ width: `${progressPercent}%`, backgroundColor: tier.color, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.6s ease' }}
            />
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleCheckIn}
          disabled={checkedIn || loading}
          className={`w-full py-3.5 rounded-[16px] font-bold text-[15px] transition-all duration-500 ${
            checkedIn 
              ? 'bg-[#E5E5E5] text-[#9A9A9A] cursor-not-allowed shadow-none' 
              : 'text-white hover:opacity-90 hover:scale-[1.02] shadow-[0px_4px_14px_rgba(0,0,0,0.15)] active:scale-95'
          }`}
          style={!checkedIn ? { backgroundColor: tier.color } : {}}
        >
          {checkedIn ? "✓ Đã điểm danh hôm nay" : (loading ? "Đang điểm danh..." : "Điểm danh hôm nay")}
        </button>
        
        {/* Close Button / Reset link */}
        <div className="mt-4 flex gap-4 text-xs font-medium text-gray-400">
          <button onClick={() => setShow(false)} className="hover:text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors">
            Đóng
          </button>
          {!checkedIn && (
            <button 
              onClick={async () => {
                await apiClient.post('/users/me/test-streak', { checkInStreak: 0, lastCheckIn: new Date(Date.now() - 86400000 * 2).toISOString() });
                window.location.reload();
              }} 
              className="hover:text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors"
            >
              Đặt lại demo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
