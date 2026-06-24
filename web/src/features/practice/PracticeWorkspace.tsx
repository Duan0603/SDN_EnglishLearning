import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { logout } from '../auth/authSlice';

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

  // State for Reading Practice
  const [readingAnswers, setReadingAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [readingResult, setReadingResult] = useState<any>(null);

  // State for Listening Practice
  const [listeningAnswers, setListeningAnswers] = useState({ q1: '', q2: '' });
  const [listeningResult, setListeningResult] = useState<any>(null);

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

  // Reading handlers
  const handleSubmitReading = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = { q1: 'B', q2: 'C', q3: 'A' };
    let score = 0;
    if (readingAnswers.q1 === correct.q1) score += 9;
    if (readingAnswers.q2 === correct.q2) score += 9;
    if (readingAnswers.q3 === correct.q3) score += 9;
    const band = score === 27 ? 9.0 : score === 18 ? 6.5 : score === 9 ? 5.0 : 3.5;
    
    setReadingResult({
      score: `${score / 9}/3`,
      band,
      correct: correct
    });
  };

  // Listening handlers
  const handleSubmitListening = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = { q1: 'education', q2: 'thursday' };
    let score = 0;
    if (listeningAnswers.q1.toLowerCase().trim() === correct.q1) score += 1;
    if (listeningAnswers.q2.toLowerCase().trim() === correct.q2) score += 1;
    const band = score === 2 ? 8.5 : score === 1 ? 6.0 : 4.0;

    setListeningResult({
      score: `${score}/2`,
      band,
      correct: correct
    });
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
            {activeTab === 'reading' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">📖 IELTS Reading simulator</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Reading Practice Simulator</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Đọc đoạn văn bản học thuật bên trái và trả lời các câu hỏi trắc nghiệm bên phải.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-start">
                  {/* Reading Passage Left */}
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-inner max-h-[360px] overflow-y-auto space-y-3">
                    <h3 className="font-serif font-black text-sm border-b border-gray-200 pb-2">Passage: The History of Printing</h3>
                    <p className="text-xs text-gray-700 leading-relaxed font-serif">
                      The history of printing starts as early as 3500 BCE, when the proto-Elamite and Sumerian civilizations used cylinder seals to certify documents in clay. Other early forms included block printing, rag-paper, and woodblock printing on textiles, which originated in China around 220 CE.
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed font-serif">
                      However, the true revolution in communication came in the 15th century. Johannes Gutenberg, a German blacksmith and publisher, introduced the movable-type printing press to Europe. His design utilized a durable metal alloy for types and oil-based inks, enabling mass production of books for the first time in history.
                    </p>
                  </div>

                  {/* Reading Questions Right */}
                  <form onSubmit={handleSubmitReading} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md space-y-4">
                    <h3 className="font-bold text-xs uppercase text-[#c92a2a] border-b border-gray-100 pb-2">Questions Pool</h3>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">Q1. Woodblock printing originated first in which country?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['A. Sumeria', 'B. China', 'C. Germany'].map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100">
                            <input
                              type="radio"
                              name="q1"
                              checked={readingAnswers.q1 === opt.charAt(0)}
                              onChange={() => setReadingAnswers({ ...readingAnswers, q1: opt.charAt(0) })}
                              className="accent-[#c92a2a]"
                              required
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">Q2. Who invented movable type printing press in Europe?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['A. Sumerians', 'B. Chinese', 'C. Gutenberg'].map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100">
                            <input
                              type="radio"
                              name="q2"
                              checked={readingAnswers.q2 === opt.charAt(0)}
                              onChange={() => setReadingAnswers({ ...readingAnswers, q2: opt.charAt(0) })}
                              className="accent-[#c92a2a]"
                              required
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700">Q3. Johannes Gutenberg was originally what by profession?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['A. Blacksmith', 'B. Scholar', 'C. Monk'].map((opt) => (
                          <label key={opt} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100">
                            <input
                              type="radio"
                              name="q3"
                              checked={readingAnswers.q3 === opt.charAt(0)}
                              onChange={() => setReadingAnswers({ ...readingAnswers, q3: opt.charAt(0) })}
                              className="accent-[#c92a2a]"
                              required
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#c92a2a] text-white border-2 border-[#1b263b] py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider hover:bg-[#b01e1e] transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                    >
                      Nộp Bài Thi Reading ✓
                    </button>
                  </form>
                </div>

                {readingResult && (
                  <div className="bg-emerald-50 border-2 border-[#1b263b] rounded-2xl p-5 shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-between animate-fade-in">
                    <div>
                      <h4 className="font-serif font-black text-emerald-800 text-sm">Nộp bài thành công!</h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">Kết quả: {readingResult.score} câu đúng. Band score quy đổi tương đương.</p>
                    </div>
                    <div className="bg-[#a7f3d0] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-emerald-950 text-base">
                      Band {readingResult.band}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LISTENING */}
            {activeTab === 'listening' && (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">🎧 IELTS Listening simulator</span>
                  <h2 className="text-3xl font-serif text-[#1b263b] font-black tracking-tight mt-1">Listening Practice Simulator</h2>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Nghe audio hướng dẫn bên dưới và điền từ thích hợp vào chỗ trống.</p>
                </div>

                <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-md space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div>
                        <p className="text-xs font-bold text-[#1b263b]">IELTS Listening Part 1.mp3</p>
                        <p className="text-[10px] text-gray-400">Duration: 0:45</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Simulating Audio Playback... Audio stream is working!')}
                      className="bg-[#1b263b] text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#121a29]"
                    >
                      ▶ Play Audio
                    </button>
                  </div>

                  <form onSubmit={handleSubmitListening} className="space-y-4">
                    <h3 className="font-bold text-xs uppercase text-[#c92a2a] border-b border-gray-100 pb-2">Fill in the blanks:</h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Q1. The student is enrolling in a course related to ______.</label>
                        <input
                          type="text"
                          required
                          value={listeningAnswers.q1}
                          onChange={(e) => setListeningAnswers({ ...listeningAnswers, q1: e.target.value })}
                          placeholder="e.g. education"
                          className="w-full max-w-md bg-transparent border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-1.5 text-xs font-bold text-[#1b263b]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Q2. The classes will start on ______ afternoon.</label>
                        <input
                          type="text"
                          required
                          value={listeningAnswers.q2}
                          onChange={(e) => setListeningAnswers({ ...listeningAnswers, q2: e.target.value })}
                          placeholder="e.g. thursday"
                          className="w-full max-w-md bg-transparent border-b-2 border-[#1b263b] focus:border-[#c92a2a] outline-none py-1.5 text-xs font-bold text-[#1b263b]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#c92a2a] text-white border-2 border-[#1b263b] py-2.5 rounded-xl font-black uppercase text-[10px] tracking-wider hover:bg-[#b01e1e] transition-all shadow-[2px_2px_0px_0px_#1b263b]"
                    >
                      Nộp Bài Thi Listening ✓
                    </button>
                  </form>
                </div>

                {listeningResult && (
                  <div className="bg-emerald-50 border-2 border-[#1b263b] rounded-2xl p-5 shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-between animate-fade-in">
                    <div>
                      <h4 className="font-serif font-black text-emerald-800 text-sm">Nộp bài thành công!</h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-1">Kết quả: {listeningResult.score} câu đúng. Band score quy đổi tương đương.</p>
                    </div>
                    <div className="bg-[#a7f3d0] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-emerald-950 text-base">
                      Band {listeningResult.band}
                    </div>
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
