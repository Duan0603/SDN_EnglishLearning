import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { apiClient } from '../../services/api.client';

export default function SpeakingWorkspace() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [activeExamLoading, setActiveExamLoading] = useState(false);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any | null>(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);
  const [speakingResults, setSpeakingResults] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    if (examId) {
      const fetchActiveExam = async () => {
        setActiveExamLoading(true);
        try {
          const response = await apiClient.get(`/exams/${examId}`);
          if (response.data && response.data.success) {
            setActiveExam(response.data.data);
            setActiveSectionIdx(0);
            setSpeakingResults({});
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUriRef = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleToggleRecording = async () => {
    if (!isRecording) {
      // Bắt đầu ghi
      audioChunksRef.current = [];
      audioUriRef.current = null;
      setSpeakingResults(prev => {
        const newResults = { ...prev };
        delete newResults[activeSectionIdx];
        return newResults;
      });
      setErrorMessage('');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
        mr.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioUriRef.current = URL.createObjectURL(blob);
        };
        mr.start(500);
        mediaRecorderRef.current = mr;

        setIsRecording(true);
        setRecordingSeconds(0);
        const interval = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        setRecordingInterval(interval);
      } catch (err) {
        console.error('Failed to start recording', err);
        setErrorMessage('Không thể bắt đầu ghi âm. Vui lòng cấp quyền Microphone.');
      }
    } else {
      // Dừng ghi
      setIsRecording(false);
      if (recordingInterval) clearInterval(recordingInterval);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach(t => t.stop());
    }
  };

  const handleEvaluateSpeaking = async () => {
    if (!audioUriRef.current) {
      setErrorMessage('Chưa có bài ghi âm. Vui lòng ghi âm trước khi nộp bài.');
      return;
    }

    setSpeakingLoading(true);
    setErrorMessage('');
    try {
      // Đọc blob từ URL
      const fetchRes = await fetch(audioUriRef.current);
      const blob = await fetchRes.blob();
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const activeSection = activeExam?.sections[activeSectionIdx] || {};
      const response = await apiClient.post('/exams/evaluate-speaking', {
        testId: examId,
        prompt: activeSection.passageText || activeSection.title || 'IELTS Speaking Test',
        audioBase64: base64Data,
        mimeType: 'audio/webm',
        durationSeconds: recordingSeconds,
        partNumber: activeSectionIdx + 1,
      }, { timeout: 60000 });

      if (response.data && response.data.success) {
        setSpeakingResults(prev => ({ ...prev, [activeSectionIdx]: response.data.data }));
      } else {
        setErrorMessage('Không thể chấm điểm, vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Submit audio error:', err);
      const backendError = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      setErrorMessage(`Lỗi: ${backendError || 'Không thể gửi âm thanh'}`);
    } finally {
      setSpeakingLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleSectionChange = (idx: number) => {
    setActiveSectionIdx(idx);
    setIsRecording(false);
    if (recordingInterval) clearInterval(recordingInterval);
    setRecordingSeconds(0);
  };

  const handleRetry = () => {
    setSpeakingResults(prev => {
      const newResults = { ...prev };
      delete newResults[activeSectionIdx];
      return newResults;
    });
    setIsRecording(false);
    if (recordingInterval) clearInterval(recordingInterval);
    setRecordingSeconds(0);
  };

  const currentResult = speakingResults[activeSectionIdx];

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

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
                    {errorMessage}
                  </div>
                )}

                {!currentResult && (
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
                )}

                {currentResult && (
                  <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-3">
                      <h4 className="font-serif text-lg font-bold text-[#1b263b]">Kết Quả AI Đánh Giá</h4>
                      <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                        Band {currentResult.bandScore?.toFixed(1) || 0}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Fluency', score: currentResult.fluencyCoherence },
                        { label: 'Vocabulary', score: currentResult.lexicalResource },
                        { label: 'Grammar', score: currentResult.grammarAccuracy },
                        { label: 'Pronunciation', score: currentResult.pronunciation },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-lg font-mono font-black text-[#1b263b]">{item.score?.toFixed(1) || 0}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase text-gray-400">Audio Transcript:</p>
                      <p className="text-xs text-gray-600 font-mono bg-gray-50 p-3.5 rounded-xl border border-gray-200 italic">
                        "{currentResult.transcription || 'Không nhận diện được giọng nói.'}"
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <p className="text-[10px] font-black uppercase text-gray-400">Phản hồi chi tiết:</p>
                      {currentResult.aiFeedback?.general && (
                        <p className="text-xs text-gray-700 font-semibold leading-relaxed font-serif">
                          {currentResult.aiFeedback.general}
                        </p>
                      )}
                      
                      <div className="pt-2 space-y-2">
                        {[
                          { key: 'fluencyCoherence', label: '🗣 Trôi chảy & Mạch lạc' },
                          { key: 'lexicalResource', label: '📚 Từ vựng' },
                          { key: 'grammarAccuracy', label: '✏️ Ngữ pháp' },
                          { key: 'pronunciation', label: '🔊 Phát âm' },
                        ].map(({ key, label }) => currentResult.aiFeedback?.[key] && (
                          <div key={key} className="text-xs">
                            <span className="font-bold text-[#1b263b]">{label}: </span>
                            <span className="text-gray-600">{currentResult.aiFeedback[key]}</span>
                          </div>
                        ))}
                      </div>

                      {Array.isArray(currentResult.aiFeedback?.suggestions) && currentResult.aiFeedback.suggestions.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[10px] font-black uppercase text-[#c92a2a] mb-1">💡 Gợi ý cải thiện</p>
                          <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
                            {currentResult.aiFeedback.suggestions.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Hành động sau chấm điểm */}
                    <div className="flex flex-col gap-3 pt-4 border-t-2 border-dashed border-gray-200 mt-4">
                      <button
                        onClick={handleRetry}
                        className="w-full bg-white text-[#1b263b] border-2 border-[#1b263b] py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                      >
                        🔄 Luyện lại từ đầu
                      </button>

                      {activeSectionIdx < (activeExam?.sections?.length || 0) - 1 ? (
                        <button
                          onClick={() => handleSectionChange(activeSectionIdx + 1)}
                          className="w-full bg-[#4682b4] text-white border-2 border-[#1b263b] py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#366890] transition-all shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                        >
                          Part Tiếp Theo →
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/practice?tab=speaking')}
                          className="w-full bg-[#005c42] text-white border-2 border-[#1b263b] py-3 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-[#004732] transition-all shadow-[2px_2px_0px_0px_#1b263b] flex items-center justify-center gap-2"
                        >
                          ✅ Hoàn Thành Đề Thi
                        </button>
                      )}
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
