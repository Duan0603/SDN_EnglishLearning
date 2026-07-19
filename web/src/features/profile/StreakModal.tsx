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
          }
        }
      }).catch(err => console.error(err));
    }
  }, [isAuthenticated, user]);

  if (!show || !stats) return null;

  const currentStreak = stats.currentStreak || 0;

  // Active days grid cells calculation (6 weeks = 42 cells)
  const totalDays = 42;
  const currentStreakVal = currentStreak;
  const hasCheckedIn = checkedIn || stats?.hasCheckedInToday;
  
  // Compute today's index in the 42-cell grid (last row, column based on day of week)
  const todayDayOfWeek = (new Date().getDay() + 6) % 7; // Monday = 0, ..., Sunday = 6
  const todayIndex = 35 + todayDayOfWeek; // Last row starts at index 35
  
  const gridCells = Array.from({ length: totalDays }).map((_, idx) => {
    // If not checked in today, the streak ended yesterday.
    const streakEndIndex = hasCheckedIn ? todayIndex : todayIndex - 1;
    const streakStartIndex = streakEndIndex - currentStreakVal + 1;
    
    // Cell is active if it falls within the current streak range
    const isActive = idx >= streakStartIndex && idx <= streakEndIndex && currentStreakVal > 0;
    
    // Future days or days before the streak shouldn't be active
    return { isActive, isCurrentStreak: isActive, isToday: idx === todayIndex };
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-all">
      <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-[28px] p-6 w-full max-w-[370px] shadow-[6px_6px_0px_0px_#1b263b] relative overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-3 mb-4">
          <h3 className="font-serif font-black text-base text-[#1b263b] flex items-center gap-1.5">
            🔥 Streak ngày học
          </h3>
          <span className="bg-[#ffedd5] border border-orange-500/30 text-orange-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
            🔥 {currentStreak} ngày
          </span>
        </div>

        {/* Calendar title */}
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2 text-left">6 tuần gần đây</p>

        {/* 42 Days Grid */}
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
                      : cell.isToday
                        ? 'bg-orange-100 border-2 border-orange-400 text-transparent'
                        : 'bg-gray-100 border border-gray-200 text-transparent'
                  }`}
                  title={cell.isActive ? "Học tập tích cực" : cell.isToday ? "Hôm nay" : "Chưa học"}
                >
                  {cell.isActive && <span className="text-[11px] select-none">🔥</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#1b263b]/10 text-center">
          <div>
            <p className="text-xs font-serif font-black text-[#1b263b]">{currentStreak} ngày</p>
            <p className="text-[8px] font-black text-gray-400 uppercase mt-0.5 leading-none">Streak hiện tại</p>
          </div>
          <div>
            <p className="text-xs font-serif font-black text-[#1b263b]">
              {checkedIn || stats?.hasCheckedInToday ? 'Đã học' : 'Chưa học'}
            </p>
            <p className="text-[8px] font-black text-gray-400 uppercase mt-0.5 leading-none">Hôm nay</p>
          </div>
          <div>
            <p className="text-xs font-serif font-black text-[#1b263b]">{Math.max(0, 100 - currentStreak)} ngày</p>
            <p className="text-[8px] font-black text-gray-400 uppercase mt-0.5 leading-none">Cần thêm</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          {!(checkedIn || stats?.hasCheckedInToday) ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full bg-[#1b263b] text-[#f6f3db] border-2 border-[#1b263b] py-3 rounded-2xl font-serif font-black text-xs hover:bg-[#324566] transition-all shadow-[2.5px_2.5px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer"
            >
              {loading ? 'Đang điểm danh...' : 'Điểm danh ngay ➔'}
            </button>
          ) : (
            <div className="w-full text-center bg-emerald-50 text-emerald-700 border border-emerald-200/50 py-3 rounded-2xl font-serif font-black text-xs">
              ✓ Đã điểm danh hôm nay
            </div>
          )}

          <button 
            onClick={() => setShow(false)} 
            className="w-full bg-white text-[#1b263b] border-2 border-[#1b263b] py-2 rounded-2xl font-serif font-black text-xs hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
