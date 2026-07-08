import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { apiClient } from '../../services/api.client';

export default function SpeakingWorkspace() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [activeExamLoading, setActiveExamLoading] = useState(false);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any | null>(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);
  const [speakingResult, setSpeakingResult] = useState<any | null>(null);

  useEffect(() => {
    if (examId) {
      const fetchActiveExam = async () => {
        setActiveExamLoading(true);
        try {
          const response = await apiClient.get(`/exams/${examId}`);
          if (response.data && response.data.success) {
            setActiveExam(response.data.data);
            setActiveSectionIdx(0);
            setSpeakingResult(null);
            setIsRecording(false);
          }
        } catch (err) {
          console.error('Error fetching active speaking exam:', err);
        } finally {
          setActiveExamLoading(false);
        }
      };
      fetchActiveExam();
    }
  }, [examId]);

  useEffect(() => {
    return () => {
      if (recordingInterval) clearInterval(recordingInterval);
    };
  }, [recordingInterval]);

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
      // Mock AI Evaluation response based on the active part
      const partTitle = activeExam?.sections[activeSectionIdx]?.title || 'Part';
      setSpeakingResult({
        overall: 7.0,
        criteria: {
          fluency: 7.5,
          vocabulary: 6.5,
          grammar: 7.0,
          pronunciation: 7.0,
        },
        feedback: `Phát âm rõ ràng trong ${partTitle}. Cần chú ý ngắt nghỉ tự nhiên hơn, tránh lặp từ và bổ sung thêm các cụm từ kết nối (linking words) nâng cao để đạt điểm Fluency cao hơn.`,
        transcript: 'Honestly speaking, this is a topic that I am very passionate about. In my opinion, it is extremely crucial to develop this skill because it benefits our career in the long run.'
      });
      setSpeakingLoading(false);
    }, 1800);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSectionChange = (idx: number) => {
    setActiveSectionIdx(idx);
    setSpeakingResult(null);
    setIsRecording(false);
    if (recordingInterval) clearInterval(recordingInterval);
    setRecordingSeconds(0);
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
                Apex Speaking Portal<span className="text-[#c92a2a]">.</span>
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
              to="/practice?tab=speaking"
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
                  🗣️ AI Speaking Practice
                </span>
                <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight">{activeExam.title}</h2>
              </div>
            </div>

            {/* Part switcher (tabs) */}
            <div className="flex gap-2 border-b-2 border-[#1b263b] pb-0">
              {activeExam.sections.map((sec: any, idx: number) => {
                const isSelected = activeSectionIdx === idx;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSectionChange(idx)}
                    className={`px-6 py-2.5 border-t-2 border-l-2 border-r-2 border-[#1b263b] rounded-t-xl text-xs font-black uppercase tracking-wider transition-all -mb-[2px] ${
                      isSelected
                        ? 'bg-[#fcfbf7] border-b-2 border-b-[#fcfbf7] z-10 text-[#c92a2a]'
                        : 'bg-gray-100 hover:bg-gray-50 text-gray-500'
                    }`}
                  >
                    Part {sec.sectionOrder}
                  </button>
                );
              })}
            </div>

            {/* Split View */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Cue Card / Prompt Detail (grid 6/12) */}
              <div className="lg:col-span-6 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[4px_4px_0px_0px_#1b263b] space-y-6 min-h-[400px]">
                <h3 className="font-bold text-[#c92a2a] text-xs uppercase tracking-wider">
                  {activeExam.sections[activeSectionIdx]?.title || `Speaking Part ${activeSectionIdx + 1}`}
                </h3>
                
                <div 
                  className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line text-left italic bg-[#ffd54f]/10 p-5 rounded-2xl border-2 border-dashed border-[#1b263b]/30"
                  dangerouslySetInnerHTML={{
                    __html: activeExam.sections[activeSectionIdx]?.passageText?.replace(/\\n/g, '<br/>') || ''
                  }}
                />

                {/* Speaks cue card image prompt if any */}
                {activeExam.sections[activeSectionIdx]?.images && activeExam.sections[activeSectionIdx].images.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">Visual Aid Prompt</p>
                    <img
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${activeExam.sections[activeSectionIdx].images[0]}`}
                      alt="Speaking cue card illustration"
                      className="max-w-full max-h-[300px] object-contain border border-gray-300 rounded-xl mx-auto shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Audio Recorder & AI Grader (grid 6/12) */}
              <div className="lg:col-span-6 space-y-6">
                {/* Microphone Record Card */}
                <div className="flex flex-col items-center justify-center py-10 space-y-4 bg-white border-2 border-[#1b263b] rounded-3xl shadow-inner relative">
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-100 border border-red-500 px-3 py-1 rounded-full text-red-600 text-xs font-black animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      RECORDING
                    </div>
                  )}

                  <button
                    onClick={handleToggleRecording}
                    className={`w-24 h-24 rounded-full border-4 border-[#1b263b] flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#1b263b] active:scale-95 transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-[#1b263b] hover:bg-gray-200'
                    }`}
                  >
                    🎙️
                  </button>

                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold">{formatTime(recordingSeconds)}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-1">
                      {isRecording ? 'Click to stop recording' : 'Click microphone to start practice'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEvaluateSpeaking}
                  disabled={speakingLoading || recordingSeconds === 0}
                  className="w-full bg-[#c92a2a] disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-2 border-[#1b263b] py-4 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#b01e1e] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                >
                  {speakingLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Nộp Bài Để AI Chấm Điểm ✍️'
                  )}
                </button>

                {speakingResult && (
                  <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4 animate-fade-in">
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

                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase text-gray-400">Audio Transcript:</p>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3.5 rounded-xl border border-gray-200 italic">
                        "{speakingResult.transcript}"
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase text-gray-400">Phản hồi chi tiết:</p>
                      <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                        {speakingResult.feedback}
                      </p>
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
