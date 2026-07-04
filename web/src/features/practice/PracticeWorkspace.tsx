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

  // Mentors Booking State
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);

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

  const handleBookMentor = (mentorName: string) => {
    if (bookedSessions.includes(mentorName)) {
      setBookedSessions(bookedSessions.filter((s) => s !== mentorName));
    } else {
      setBookedSessions([...bookedSessions, mentorName]);
      alert(`Đã đặt lịch thành công với Mentor ${mentorName}! Hãy kiểm tra email để nhận link họp Zoom.`);
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

            {/* TAB CONTENT: MENTORS */}
            {activeTab === 'mentors' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📅 certified mentors</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Book 1-on-1 IELTS Sessions</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Đặt lịch học tập trực tiếp cùng chuyên gia IELTS để sửa lỗi và nhận tư vấn định hướng ôn thi.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { name: 'Emily Smith', title: 'Certified IELTS Examiner (Ex-British Council)', score: '9.0 Overall', desc: 'Chuyên gia luyện Nói & Viết cốt lõi với hơn 10 năm kinh nghiệm.', color: 'bg-emerald-50 border-emerald-300' },
                    { name: 'David Lee', title: 'Senior Writing Expert & Author', score: '8.5 overall', desc: 'Chuyên trị Writing Task 1 & 2 với cấu trúc lập luận sắc bén.', color: 'bg-indigo-50 border-indigo-300' }
                  ].map((mentor) => (
                    <div key={mentor.name} className={`${mentor.color} border-2 rounded-2xl p-5 flex flex-col justify-between min-h-[200px] shadow-sm`}>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-black text-lg text-[#1b263b]">{mentor.name}</h3>
                          <span className="text-[10px] bg-white border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider">{mentor.score}</span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase">{mentor.title}</p>
                        <p className="text-xs text-gray-700 leading-relaxed font-semibold">{mentor.desc}</p>
                      </div>

                      <button
                        onClick={() => handleBookMentor(mentor.name)}
                        className={`w-full mt-4 border-2 border-[#1b263b] py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#1b263b] ${
                          bookedSessions.includes(mentor.name)
                            ? 'bg-[#c92a2a] text-white hover:bg-[#b01e1e]'
                            : 'bg-white text-[#1b263b] hover:bg-gray-50'
                        }`}
                      >
                        {bookedSessions.includes(mentor.name) ? 'Hủy lịch đã đặt ✖' : 'Đặt lịch hẹn Zoom 📅'}
                      </button>
                    </div>
                  ))}
                </div>
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
