import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../auth/authSlice';
import { apiClient } from '../../services/api.client';

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
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [mentorsLoading, setMentorsLoading] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentorSlots, setMentorSlots] = useState<any[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

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

  // Fetch all active mentors when mentors tab is opened
  useEffect(() => {
    if (activeTab === 'mentors') {
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

  const handleBookSlot = async (availabilityId: string) => {
    setBookingLoading(true);
    setBookingSuccess(null);
    setBookingError(null);
    try {
      const res = await apiClient.post('/bookings', { availabilityId, notes: bookingNotes });
      if (res.data?.success) {
        setBookingSuccess('🎉 Đặt lịch thành công! Kiểm tra Profile để xem lịch học.');
        // Refresh slots
        const slotsRes = await apiClient.get(`/mentors/${selectedMentor.id}/availabilities`);
        if (slotsRes.data?.success) setMentorSlots(slotsRes.data.data);
        setBookingNotes('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Đặt lịch thất bại, vui lòng thử lại.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
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
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📅 certified mentors</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Book 1-on-1 IELTS Sessions</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Đặt lịch học tập trực tiếp cùng chuyên gia IELTS để sửa lỗi và nhận tư vấn định hướng ôn thi.</p>
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

                {/* Mentor List */}
                {!selectedMentor && (
                  mentorsLoading ? (
                    <div className="text-center py-16 text-sm font-bold text-gray-400 animate-pulse">⏳ Đang tải danh sách mentor...</div>
                  ) : mentorsList.length === 0 ? (
                    <div className="text-center py-16 text-sm font-bold text-gray-400">Hiện chưa có mentor nào khả dụng.</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {mentorsList.map((mentor, idx) => {
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
                                {mentor.avatar ? (
                                  <img src={mentor.avatar} alt={mentor.fullName} className="w-10 h-10 rounded-full border-2 border-[#1b263b] object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full border-2 border-[#1b263b] bg-[#1b263b] text-white flex items-center justify-center font-black text-sm">
                                    {(mentor.fullName || 'M')[0].toUpperCase()}
                                  </div>
                                )}
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
                              <div key={slot.id} className="border-2 border-[#1b263b] rounded-2xl p-4 bg-white space-y-2 shadow-[2px_2px_0px_0px_#1b263b]">
                                <div>
                                  <p className="text-[10px] font-black uppercase text-gray-400">{dateStr}</p>
                                  <p className="text-sm font-black text-[#1b263b]">{timeStr}</p>
                                  {slot.meetingLink && (
                                    <p className="text-[10px] text-sky-500 font-bold">🔗 Có link phòng học</p>
                                  )}
                                </div>
                                <button
                                  disabled={bookingLoading}
                                  onClick={() => handleBookSlot(slot.id)}
                                  className="w-full bg-[#1b263b] text-white border-2 border-[#1b263b] py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#0f1a2a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {bookingLoading ? 'Đang xử lý...' : 'Chọn khung giờ này ✓'}
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

            {/* TAB CONTENT: TRACKER */}
            {activeTab === 'tracker' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📊 performance tracking</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Personal Band Score Tracker</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Thống kê điểm số IELTS mô phỏng của bạn qua các bài kiểm tra gần nhất.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Overall Band Card */}
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 text-center shadow-md space-y-2">
                    <span className="text-[10px] uppercase font-black text-gray-400">Current Average</span>
                    <h3 className="text-5xl font-serif font-black text-[#c92a2a]">7.5</h3>
                    <div className="bg-emerald-100 text-emerald-800 border border-[#1b263b] text-[9px] font-black px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">Good User</div>
                  </div>

                  {/* Skills Grid */}
                  <div className="md:col-span-2 bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md grid grid-cols-2 gap-4">
                    {[
                      { skill: 'Reading', score: '7.5', color: 'bg-emerald-600', pct: 75 },
                      { skill: 'Listening', score: '8.5', color: 'bg-emerald-600', pct: 85 },
                      { skill: 'Writing', score: '6.5', color: 'bg-amber-500', pct: 65 },
                      { skill: 'Speaking', score: '7.0', color: 'bg-emerald-600', pct: 70 },
                    ].map((item) => (
                      <div key={item.skill} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-700">
                          <span>{item.skill}</span>
                          <span>Band {item.score}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-300">
                          <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Practice History */}
                <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md space-y-3">
                  <h3 className="font-serif font-black text-sm border-b border-gray-100 pb-2">Lịch sử bài thi & Chấm điểm</h3>
                  
                  <div className="space-y-3">
                    {[
                      { title: 'AI Essay Grader - Universities Function', type: 'Writing', score: '6.5', date: 'Hôm nay' },
                      { title: 'Woodblock & Printing Press History', type: 'Reading', score: '9.0', date: 'Vừa xong' },
                      { title: 'Cue Card Speaking Part 2 - Favorite City', type: 'Speaking', score: '7.0', date: '5 phút trước' },
                      { title: 'IELTS Listening Practice 1', type: 'Listening', score: '8.5', date: '10 phút trước' },
                    ].map((history, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-bold text-gray-800">{history.title}</p>
                          <p className="text-[10px] text-gray-400">{history.date} • Kỹ năng: {history.type}</p>
                        </div>
                        <div className="bg-[#ffd54f] border border-[#1b263b] px-2 py-0.5 rounded-lg font-mono font-bold text-[#1b263b]">
                          Band {history.score}
                        </div>
                      </div>
                    ))}
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
