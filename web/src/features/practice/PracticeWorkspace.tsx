import React, { useState, useEffect } from 'react';
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

  // State for Speaking Practice
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);
  const [speakingResult, setSpeakingResult] = useState<any>(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);

  // State for Writing Practice
  const [essayText, setEssayText] = useState('');
  const [writingResult, setWritingResult] = useState<any>(null);
  const [writingLoading, setWritingLoading] = useState(false);

  // State for Reading Practice (Real DB integration)
  const [readingExams, setReadingExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [readingResult, setReadingResult] = useState<any>(null);
  const [readingExamsLoading, setReadingExamsLoading] = useState(false);
  const [activeExamLoading, setActiveExamLoading] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(3600);

  const [listeningExams, setListeningExams] = useState<any[]>([]);
  const [listeningExamsLoading, setListeningExamsLoading] = useState(false);

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
    if (selectedExamId) {
      const fetchActiveExam = async () => {
        setActiveExamLoading(true);
        setReadingResult(null);
        try {
          const response = await apiClient.get(`/exams/${selectedExamId}`);
          if (response.data && response.data.success) {
            const exam = response.data.data;
            setActiveExam(exam);
            setExamTimeLeft((exam.duration || 60) * 60);
            
            // Pre-populate answers
            const initialAnswers: Record<string, string> = {};
            exam.sections.forEach((sec: any) => {
              sec.questions.forEach((q: any) => {
                initialAnswers[q.id] = '';
              });
            });
            setReadingAnswers(initialAnswers);
            setActiveSectionIdx(0);
          }
        } catch (err) {
          console.error('Error fetching active exam:', err);
        } finally {
          setActiveExamLoading(false);
        }
      };
      fetchActiveExam();
    } else {
      setActiveExam(null);
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (!activeExam || readingResult) return;
    
    const timer = setInterval(() => {
      setExamTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, readingResult]);

  const handleAutoSubmit = () => {
    alert('Hết giờ làm bài! Bài thi sẽ tự động được nộp.');
    submitReadingExam();
  };

  const submitReadingExam = async () => {
    if (!activeExam) return;
    
    setSubmittingExam(true);
    
    const payload = Object.keys(readingAnswers).map(qId => ({
      questionId: qId,
      userAnswer: readingAnswers[qId] || ''
    }));
    
    const timeTaken = (activeExam.duration || 60) * 60 - examTimeLeft;
    
    try {
      const response = await apiClient.post(`/exams/${activeExam.id}/submit`, {
        answers: payload,
        timeTaken
      });
      if (response.data && response.data.success) {
        setReadingResult(response.data.data);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Không thể nộp bài thi. Vui lòng thử lại sau.');
    } finally {
      setSubmittingExam(false);
    }
  };


  // Audio player state for Listening practice
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const formatAudioTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Clean up previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setAudioCurrentTime(0);
    setAudioDuration(0);

    const currentSection = activeExam?.sections[activeSectionIdx];
    if (activeExam?.type === 'LISTENING' && currentSection?.audioUrl) {
      const audio = new Audio(currentSection.audioUrl);
      audioRef.current = audio;
      
      const handleTimeUpdate = () => {
        setAudioCurrentTime(audio.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
      };
      
      const handleEnded = () => {
        setAudioPlaying(false);
        setAudioCurrentTime(0);
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.pause();
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [activeExam, activeSectionIdx, selectedExamId]);

  const toggleAudioPlay = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Play error:", err));
      setAudioPlaying(true);
    }
  };

  const handleAudioSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setAudioCurrentTime(seekTime);
  };

  // State for Mentors Booking
  const [bookedSessions, setBookedSessions] = useState<string[]>([]);

  // Speaking handlers
  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingSeconds(0);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } else {
      setIsRecording(false);
      if (recordingInterval) clearInterval(recordingInterval);
    }
  };

  const handleEvaluateSpeaking = () => {
    setSpeakingLoading(true);
    setTimeout(() => {
      setSpeakingResult({
        overall: 7.0,
        criteria: {
          fluency: 7.5,
          vocabulary: 6.5,
          grammar: 7.0,
          pronunciation: 7.0,
        },
        feedback: 'Phát âm tương đối rõ ràng. Cần chú ý ngắt nghỉ tự nhiên hơn và bổ sung thêm các cụm từ kết nối (linking words) nâng cao.',
        transcript: 'Today I want to talk about my favorite city... it is Hanoi, the capital of Vietnam. I like Hanoi because it has a lot of historical places and good food.'
      });
      setSpeakingLoading(false);
    }, 1800);
  };

  // Writing handlers
  const handleEvaluateWriting = () => {
    if (essayText.trim().split(/\s+/).length < 20) {
      alert('Bài viết quá ngắn. Vui lòng nhập tối thiểu 20 từ để AI đánh giá.');
      return;
    }
    setWritingLoading(true);
    setTimeout(() => {
      setWritingResult({
        overall: 6.5,
        criteria: {
          taskResponse: 7.0,
          coherence: 6.5,
          vocabulary: 6.0,
          grammar: 6.5,
        },
        feedback: 'Bài viết luận điểm rõ ràng, cấu trúc mạch lạc. Cần đa dạng hóa cấu trúc ngữ pháp phức tạp và sử dụng các từ đồng nghĩa để tránh lặp từ.',
        wordCount: essayText.trim().split(/\s+/).length
      });
      setWritingLoading(false);
    }, 1800);
  };

  // Reading handlers (Real DB Submission)
  const handleSubmitReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn nộp bài thi không?')) {
      submitReadingExam();
    }
  };


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

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
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
          {/* TAB SIDEBAR (Index card style tabs) */}
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

          {/* MAIN PRACTICE WORKSPACE SHEET */}
          <div className="lg:col-span-9 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[6px_6px_0px_0px_#1b263b] min-h-[560px] relative text-left">
            {/* Tear marks at the top of the workspace sheet */}
            <div className="absolute -top-3.5 left-0 right-0 flex justify-around px-8 pointer-events-none select-none">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#f5f3dc] border-2 border-[#1b263b] shadow-inner" />
              ))}
            </div>

            {/* TAB CONTENT: SPEAKING */}
            {activeTab === 'speaking' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">🗣️ AI Speaking coach</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">IELTS Speaking Simulator</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Luyện tập câu hỏi Speaking Part 2 trực tiếp. Ghi âm câu trả lời của bạn để AI chấm điểm và chỉ ra lỗi phát âm.</p>
                </div>

                <div className="bg-[#ffd54f]/15 border-2 border-dashed border-[#1b263b]/30 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-[#c92a2a] text-sm uppercase">Cue Card Question:</h3>
                  <p className="font-serif italic font-semibold text-gray-800 text-sm">
                    "Describe a beautiful city that you have visited. You should say: where it is, when you went there, what you did there, and explain why you think it is beautiful."
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6 space-y-4 bg-white border-2 border-[#1b263b] rounded-2xl shadow-inner relative">
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-100 border border-red-500 px-3 py-1 rounded-full text-red-600 text-xs font-black animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      RECORDING
                    </div>
                  )}

                  <button
                    onClick={handleToggleRecording}
                    className={`w-20 h-20 rounded-full border-4 border-[#1b263b] flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#1b263b] active:scale-95 transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-[#1b263b] hover:bg-gray-200'
                    }`}
                  >
                    🎙️
                  </button>

                  <div className="text-center">
                    <p className="text-xl font-mono font-bold">{formatTime(recordingSeconds)}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      {isRecording ? 'Click to stop recording' : 'Click microphone to start practice'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleEvaluateSpeaking}
                    disabled={speakingLoading || recordingSeconds === 0}
                    className="flex-1 bg-[#c92a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-[#1b263b] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                  >
                    {speakingLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Nộp Bài Để AI Chấm Điểm ✍️'
                    )}
                  </button>
                </div>

                {speakingResult && (
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-3">
                      <h4 className="font-serif text-lg font-bold text-[#1b263b]">Kết Quả AI Đánh Giá</h4>
                      <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                        Band {speakingResult.overall}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Fluency', score: speakingResult.criteria.fluency },
                        { label: 'Vocabulary', score: speakingResult.criteria.vocabulary },
                        { label: 'Grammar', score: speakingResult.criteria.grammar },
                        { label: 'Pronunciation', score: speakingResult.criteria.pronunciation },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-lg font-mono font-black text-[#1b263b]">{item.score}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-gray-400">Audio Transcript:</p>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3 rounded-xl border border-gray-200">
                        "{speakingResult.transcript}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-gray-400">Phản hồi chi tiết:</p>
                      <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                        {speakingResult.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: WRITING */}
            {activeTab === 'writing' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">✍️ AI writing grader</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">IELTS Writing Task 2</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Nhập bài viết luận của bạn dựa trên chủ đề bên dưới để nhận điểm số tiêu chí chi tiết.</p>
                </div>

                <div className="bg-[#ffd54f]/15 border-2 border-dashed border-[#1b263b]/30 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-[#c92a2a] text-sm uppercase">Essay Prompt:</h3>
                  <p className="font-serif italic font-semibold text-gray-800 text-sm">
                    "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both views and give your opinion."
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-500 px-1">
                    <span>Your Essay Response</span>
                    <span className={essayText.trim().split(/\s+/).filter(Boolean).length >= 250 ? 'text-emerald-600' : 'text-amber-600'}>
                      Word Count: {essayText.trim().split(/\s+/).filter(Boolean).length} / 250+ (min)
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Type or paste your IELTS essay here..."
                    className="w-full bg-white border-2 border-[#1b263b] rounded-2xl p-4 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner resize-y font-mono"
                  />
                </div>

                <button
                  onClick={handleEvaluateWriting}
                  disabled={writingLoading || !essayText.trim()}
                  className="w-full bg-[#c92a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-[#1b263b] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                >
                  {writingLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Chấm Điểm Essay Bằng AI ✍️'
                  )}
                </button>

                {writingResult && (
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-3">
                      <h4 className="font-serif text-lg font-bold text-[#1b263b]">Kết Quả Chấm Essay AI</h4>
                      <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                        Band {writingResult.overall}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Task Response', score: writingResult.criteria.taskResponse },
                        { label: 'Coherence', score: writingResult.criteria.coherence },
                        { label: 'Vocabulary', score: writingResult.criteria.vocabulary },
                        { label: 'Grammar', score: writingResult.criteria.grammar },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-lg font-mono font-black text-[#1b263b]">{item.score}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase text-gray-400">Phản hồi chi tiết từ AI:</p>
                      <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                        {writingResult.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: READING */}
            {activeTab === 'reading' && !selectedExamId && (
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
                          onClick={() => setSelectedExamId(exam.id)}
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

            {(activeTab === 'reading' || activeTab === 'listening') && selectedExamId && (
              <div className="space-y-6 animate-fade-in">
                {activeExamLoading || !activeExam ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-10 h-10 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-bold uppercase mt-4">Đang tải đề thi...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Exam Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-dashed border-[#1b263b]/20 pb-4 gap-4">
                      <div>
                        <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">
                          {activeExam.type === 'LISTENING' ? '🎧 Listening Test' : '📖 Reading Test'}
                        </span>
                        <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight">{activeExam.title}</h2>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-red-50 border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-[#c92a2a] text-lg flex items-center gap-2">
                          ⏱️ {formatTime(examTimeLeft)}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Bạn muốn thoát? Kết quả chưa nộp sẽ bị mất.')) {
                              setSelectedExamId(null);
                            }
                          }}
                          className="bg-gray-100 hover:bg-gray-200 border-2 border-[#1b263b] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b]"
                        >
                          Thoát 🚪
                        </button>
                      </div>
                    </div>

                    {/* Passage Selector Tabs */}
                    <div className="flex gap-2 border-b-2 border-[#1b263b] pb-2 overflow-x-auto">
                      {activeExam.sections.map((sec: any, idx: number) => (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSectionIdx(idx)}
                          className={`px-4 py-2 rounded-xl border-2 border-[#1b263b] text-xs font-black transition-all ${
                            activeSectionIdx === idx
                              ? 'bg-[#1b263b] text-white shadow-[2px_2px_0px_0px_#ffd54f]'
                              : 'bg-white text-[#1b263b] hover:bg-gray-50'
                          }`}
                        >
                          {activeExam.type === 'LISTENING' ? 'Section' : 'Passage'} {sec.sectionOrder}
                        </button>
                      ))}
                    </div>

                    {/* Workspace Split View */}
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      {/* Left: Scrollable Reading Passage / Listening Audio */}
                      <div className="bg-white border-2 border-[#1b263b] rounded-3xl p-6 shadow-inner max-h-[500px] overflow-y-auto space-y-4 relative flex flex-col justify-between">
                        <div className="space-y-4">
                          <h3 className="font-serif font-black text-lg border-b border-gray-200 pb-2">
                            {activeExam.sections[activeSectionIdx].title || `${activeExam.type === 'LISTENING' ? 'Section' : 'Passage'} ${activeExam.sections[activeSectionIdx].sectionOrder}`}
                          </h3>
                          <div 
                            className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line text-left"
                            dangerouslySetInnerHTML={{
                              __html: activeExam.sections[activeSectionIdx].passageText?.replace(/\\n/g, '<br/>') || ''
                            }}
                          />
                        </div>

                        {activeExam.type === 'LISTENING' && activeExam.sections[activeSectionIdx].audioUrl && (
                          <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-4 flex flex-col gap-3 shadow-[3px_3px_0px_0px_#1b263b] mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-gray-500 uppercase">🎵 Section Audio Player</span>
                              <span className="text-xs font-mono font-bold text-gray-600">
                                {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration || 0)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={toggleAudioPlay}
                                className="w-10 h-10 rounded-full bg-[#1b263b] text-white flex items-center justify-center text-sm hover:bg-gray-800 transition-all border-2 border-[#1b263b] shrink-0"
                              >
                                {audioPlaying ? '⏸' : '▶'}
                              </button>
                              
                              <input
                                type="range"
                                min={0}
                                max={audioDuration || 100}
                                value={audioCurrentTime}
                                onChange={handleAudioSeek}
                                className="flex-grow accent-[#c92a2a] cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Scrollable Questions */}
                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                        {readingResult ? (
                          /* If results submitted, show results review */
                          <div className="bg-white border-2 border-[#1b263b] rounded-3xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4">
                            <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-3">
                              <h4 className="font-serif text-lg font-bold text-[#1b263b]">Kết Quả Chấm Điểm</h4>
                              <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                                Band {readingResult.bandScore}
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-left">
                              Bạn làm đúng {readingResult.correctCount} / {readingResult.totalQuestions} câu.
                            </p>
                            <button
                              onClick={() => setSelectedExamId(null)}
                              className="w-full bg-[#1b263b] text-white py-2 rounded-xl text-xs font-black uppercase hover:bg-gray-800 transition-all border-2 border-[#1b263b]"
                            >
                              Làm đề thi khác 📑
                            </button>
                          </div>
                        ) : (
                          /* Questions Form */
                          <form onSubmit={handleSubmitReading} className="bg-white border-2 border-[#1b263b] rounded-3xl p-6 shadow-md space-y-6">
                            <h3 className="font-bold text-sm uppercase text-[#c92a2a] border-b border-gray-100 pb-2 flex justify-between">
                              <span>Questions Pool</span>
                              <span>{activeExam.type === 'LISTENING' ? 'Section' : 'Passage'} {activeExam.sections[activeSectionIdx].sectionOrder}</span>
                            </h3>
                            
                            <div className="space-y-6">
                              {activeExam.sections[activeSectionIdx].questions.map((q: any) => (
                                <div key={q.id} className="space-y-3 text-left border-b border-gray-100 pb-4 last:border-0">
                                  <p className="text-xs font-black text-gray-700">Q{q.questionNumber}. {q.content}</p>
                                  
                                  {/* RENDER QUESTIONS BY TYPE */}
                                  {q.type === 'MULTIPLE_CHOICE' && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {q.options?.map((opt: string, optIdx: number) => {
                                        const val = String.fromCharCode(65 + optIdx); // A, B, C...
                                        return (
                                          <label key={optIdx} className={`flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-50 border-2 border-[#1b263b]/10 hover:border-[#1b263b] px-3 py-2 rounded-xl cursor-pointer transition-all ${
                                            readingAnswers[q.id] === val ? 'bg-[#ffd54f]/40 border-[#1b263b]' : ''
                                          }`}>
                                            <input
                                              type="radio"
                                              name={`q-${q.id}`}
                                              checked={readingAnswers[q.id] === val}
                                              onChange={() => setReadingAnswers({ ...readingAnswers, [q.id]: val })}
                                              className="accent-[#c92a2a]"
                                            />
                                            <span>{opt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {(q.type === 'TRUE_FALSE_NOT_GIVEN' || q.type === 'YES_NO_NOT_GIVEN') && (
                                    <div className="flex gap-2">
                                      {(q.type === 'TRUE_FALSE_NOT_GIVEN' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((choice) => (
                                        <button
                                          type="button"
                                          key={choice}
                                          onClick={() => setReadingAnswers({ ...readingAnswers, [q.id]: choice })}
                                          className={`flex-1 border-2 border-[#1b263b] py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                            readingAnswers[q.id] === choice
                                              ? 'bg-[#ffd54f] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]'
                                              : 'bg-white text-gray-700 hover:bg-gray-50'
                                          }`}
                                        >
                                          {choice}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {q.type !== 'MULTIPLE_CHOICE' && q.type !== 'TRUE_FALSE_NOT_GIVEN' && q.type !== 'YES_NO_NOT_GIVEN' && (
                                    <input
                                      type="text"
                                      value={readingAnswers[q.id] || ''}
                                      onChange={(e) => setReadingAnswers({ ...readingAnswers, [q.id]: e.target.value })}
                                      placeholder="Nhập câu trả lời..."
                                      className="w-full bg-gray-50 border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#c92a2a]"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>

                            <button
                              type="submit"
                              disabled={submittingExam}
                              className="w-full bg-[#c92a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-[#1b263b] py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                            >
                              {submittingExam ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                `Nộp Bài Thi ${activeExam.type === 'LISTENING' ? 'Listening' : 'Reading'} ✓`
                              )}
                            </button>
                          </form>
                        )}

                        {/* Question explanations list shown when result is ready */}
                        {readingResult && (
                          <div className="space-y-4">
                            <h4 className="font-serif font-black text-lg text-[#1b263b] text-left">Chi tiết giải thích:</h4>
                            {readingResult.gradedAnswers
                              .filter((ans: any) => {
                                return activeExam.sections[activeSectionIdx].questions.some((q: any) => q.id === ans.questionId);
                              })
                              .map((ans: any) => {
                                const matchedQ = activeExam.sections[activeSectionIdx].questions.find((q: any) => q.id === ans.questionId);
                                return (
                                  <div key={ans.questionId} className="bg-white border-2 border-[#1b263b] rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1b263b] text-left space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-black text-[#c92a2a]">Q{matchedQ?.questionNumber}</span>
                                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border border-[#1b263b] ${
                                        ans.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                      }`}>
                                        {ans.isCorrect ? 'Correct ✓' : 'Incorrect ✖'}
                                      </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{matchedQ?.content}</p>
                                    <p className="text-xs font-semibold text-gray-600">
                                      Câu trả lời của bạn: <span className={ans.isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>{ans.userAnswer || '(Không trả lời)'}</span>
                                    </p>
                                    {!ans.isCorrect && (
                                      <p className="text-xs font-semibold text-emerald-700">
                                        Đáp án đúng: <span className="font-bold">{ans.correctAnswer}</span>
                                      </p>
                                    )}
                                    {ans.explanation && (
                                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 mt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Giải thích:</p>
                                        <p className="text-[11px] text-gray-600 font-medium italic mt-0.5">{ans.explanation}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LISTENING LIST */}
            {activeTab === 'listening' && !selectedExamId && (
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
                          onClick={() => setSelectedExamId(exam.id)}
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
