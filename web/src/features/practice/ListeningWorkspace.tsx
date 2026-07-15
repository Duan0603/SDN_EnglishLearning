import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { apiClient } from '../../services/api.client';
import { useModal } from '../shared/ModalProvider';

export default function ListeningWorkspace() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { showAlert, showConfirm } = useModal();

  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [readingResult, setReadingResult] = useState<any>(null);
  const [activeExamLoading, setActiveExamLoading] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(1800);

  // Audio player state for Listening practice
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    if (examId) {
      const fetchActiveExam = async () => {
        setActiveExamLoading(true);
        setReadingResult(null);
        try {
          const response = await apiClient.get(`/exams/${examId}`);
          if (response.data && response.data.success) {
            const exam = response.data.data;
            setActiveExam(exam);
            setExamTimeLeft((exam.duration || 30) * 60);
            
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
    }
  }, [examId]);

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
  }, [activeExam, activeSectionIdx]);

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

  const handleAutoSubmit = async () => {
    await showAlert('Hết giờ làm bài! Bài thi sẽ tự động được nộp.');
    submitListeningExam();
  };

  const submitListeningExam = async () => {
    if (!activeExam) return;
    
    setSubmittingExam(true);
    
    const payload = Object.keys(readingAnswers).map(qId => ({
      questionId: qId,
      userAnswer: readingAnswers[qId] || ''
    }));
    
    const timeTaken = (activeExam.duration || 30) * 60 - examTimeLeft;
    
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
      await showAlert('Không thể nộp bài thi. Vui lòng thử lại sau.');
    } finally {
      setSubmittingExam(false);
    }
  };

  const handleSubmitListening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await showConfirm('Bạn có chắc chắn muốn nộp bài thi không?')) {
      submitListeningExam();
    }
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
      <div className="pl-[95px] pr-6 md:pr-12 max-w-[95%] xl:max-w-[1440px] mx-auto pb-24">
        {/* HEADER */}
        <header className="border-b-2 border-[#1b263b] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-[2px_2px_0px_0px_#1b263b]">
              A
            </div>
            <div>
              <span className="text-3xl font-handwriting font-bold tracking-tight text-[#1b263b]" style={{ fontFamily: "'Caveat', cursive" }}>
                Apex Listening Portal<span className="text-[#c92a2a]">.</span>
              </span>
              <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-widest font-black">Student Practice Area</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#a7f3d0] border-2 border-[#1b263b] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-sans font-black text-[#005c42] normal-case text-[10px]">{user?.fullName || 'IELTS Student'}</span>
            </div>
            <Link
              to="/practice?tab=listening"
              className="bg-gray-100 hover:bg-gray-200 border-2 border-[#1b263b] px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b]"
            >
              ← Back to List
            </Link>
          </div>
        </header>

        {activeExamLoading || !activeExam ? (
          <div className="flex flex-col items-center justify-center py-24 mt-12 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[6px_6px_0px_0px_#1b263b] min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-bold uppercase mt-4">Đang tải đề thi...</p>
          </div>
        ) : (
          <div className="space-y-6 mt-12">
            {/* Exam Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b] gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#4682b4] font-black">
                  🎧 Listening Practice Mode
                </span>
                <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight">{activeExam.title}</h2>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-red-50 border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-[#c92a2a] text-lg flex items-center gap-2">
                  ⏱️ {formatTime(examTimeLeft)}
                </div>
              </div>
            </div>

            {/* Section Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeExam.sections.map((sec: any, idx: number) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionIdx(idx)}
                  className={`px-6 py-2.5 rounded-xl border-2 border-[#1b263b] text-xs font-black transition-all shadow-[2px_2px_0px_0px_#1b263b] ${
                    activeSectionIdx === idx
                      ? 'bg-[#1b263b] text-white shadow-[2px_2px_0px_0px_#ffd54f]'
                      : 'bg-[#fcfbf7] text-[#1b263b] hover:bg-gray-50'
                  }`}
                >
                  Section {sec.sectionOrder}
                </button>
              ))}
            </div>

            {/* Workspace Split View */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Audio and context */}
              <div className="lg:col-span-6 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[4px_4px_0px_0px_#1b263b] space-y-6">
                <h3 className="font-serif font-black text-xl border-b border-gray-200 pb-3 text-left">
                  {activeExam.sections[activeSectionIdx].title || `Section ${activeExam.sections[activeSectionIdx].sectionOrder}`}
                </h3>
                <div 
                  className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line text-left"
                  dangerouslySetInnerHTML={{
                    __html: activeExam.sections[activeSectionIdx].passageText?.replace(/\\n/g, '<br/>') || ''
                  }}
                />

                {activeExam.sections[activeSectionIdx].audioUrl && (
                  <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 flex flex-col gap-4 shadow-[3px_3px_0px_0px_#1b263b] mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-500 uppercase">🎵 Section Audio Player</span>
                      <span className="text-xs font-mono font-bold text-gray-600">
                        {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration || 0)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={toggleAudioPlay}
                        className="w-12 h-12 rounded-full bg-[#1b263b] text-white flex items-center justify-center text-lg hover:bg-gray-800 transition-all border-2 border-[#1b263b] shrink-0 shadow-[2px_2px_0px_0px_#ffd54f]"
                      >
                        {audioPlaying ? '⏸' : '▶'}
                      </button>
                      
                      <input
                        type="range"
                        min={0}
                        max={audioDuration || 100}
                        value={audioCurrentTime}
                        onChange={handleAudioSeek}
                        className="flex-grow accent-[#c92a2a] cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Scrollable Questions */}
              <div className="lg:col-span-6 space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                {readingResult ? (
                  /* If results submitted, show results review */
                  <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[4px_4px_0px_0px_#1b263b] space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-4">
                      <h4 className="font-serif text-xl font-bold text-[#1b263b]">Kết Quả Chấm Điểm</h4>
                      <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                        Band {readingResult.bandScore}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-left">
                      Bạn đã hoàn thành đúng {readingResult.correctCount} / {readingResult.totalQuestions} câu hỏi.
                    </p>
                    <button
                      onClick={() => navigate('/practice?tab=listening')}
                      className="w-full bg-[#1b263b] text-white py-3 rounded-xl text-xs font-black uppercase hover:bg-gray-800 transition-all border-2 border-[#1b263b] shadow-[3px_3px_0px_0px_#1b263b]"
                    >
                      Quay lại danh sách đề thi 📑
                    </button>
                  </div>
                ) : (
                  /* Questions Form */
                  <form onSubmit={handleSubmitListening} className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[4px_4px_0px_0px_#1b263b] space-y-6">
                    <h3 className="font-bold text-sm uppercase text-[#c92a2a] border-b border-gray-100 pb-3 flex justify-between">
                      <span>Questions Pool</span>
                      <span>Section {activeExam.sections[activeSectionIdx].sectionOrder}</span>
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
                      className="w-full bg-[#c92a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-[#1b263b] py-3.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                    >
                      {submittingExam ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Nộp Bài Thi Listening ✓'
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
                          <div key={ans.questionId} className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-5 shadow-[2px_2px_0px_0px_#1b263b] text-left space-y-2">
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
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-2">
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
    </div>
  );
}
