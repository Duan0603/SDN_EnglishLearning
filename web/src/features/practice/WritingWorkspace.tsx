import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/store';
import { apiClient } from '../../services/api.client';
import { useModal } from '../shared/ModalProvider';

export default function WritingWorkspace() {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { showAlert } = useModal();

  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [activeExamLoading, setActiveExamLoading] = useState(false);
  const [writingLoading, setWritingLoading] = useState(false);
  const [essayText, setEssayText] = useState('');
  const [writingEssays, setWritingEssays] = useState<Record<number, string>>({ 0: '', 1: '' });
  const [writingResults, setWritingResults] = useState<Record<number, any>>({});

  useEffect(() => {
    if (examId) {
      const fetchActiveExam = async () => {
        setActiveExamLoading(true);
        try {
          const response = await apiClient.get(`/exams/${examId}`);
          if (response.data && response.data.success) {
            setActiveExam(response.data.data);
            setActiveSectionIdx(0);
            setEssayText('');
            setWritingEssays({ 0: '', 1: '' });
            setWritingResults({});
          }
        } catch (err) {
          console.error('Error fetching active writing exam:', err);
        } finally {
          setActiveExamLoading(false);
        }
      };
      fetchActiveExam();
    }
  }, [examId]);

  const handleSectionChange = (idx: number) => {
    setWritingEssays(prev => ({
      ...prev,
      [activeSectionIdx]: essayText
    }));
    setActiveSectionIdx(idx);
    setEssayText(writingEssays[idx] || '');
  };

  const handleEvaluateWriting = async () => {
    if (!activeExam) return;
    const currentEssay = essayText;
    const wordCount = currentEssay.trim().split(/\s+/).filter(Boolean).length;
    
    const isTask1 = activeSectionIdx === 0;
    const minWords = isTask1 ? 50 : 100;
    
    if (wordCount < minWords) {
      await showAlert(`Bài viết quá ngắn. Vui lòng nhập tối thiểu ${minWords} từ để AI đánh giá.`);
      return;
    }

    setWritingLoading(true);
    try {
      const currentSection = activeExam.sections[activeSectionIdx];
      const response = await apiClient.post('/exams/evaluate-writing', {
        testId: activeExam.id,
        prompt: currentSection.passageText || currentSection.title || 'IELTS Writing Test',
        essayText: currentEssay,
        partNumber: activeSectionIdx + 1,
      }, { timeout: 60000 });

      if (response.data && response.data.success) {
        const result = response.data.data;
        setWritingResults(prev => ({
          ...prev,
          [activeSectionIdx]: result
        }));
      }
    } catch (err) {
      console.error('Error evaluating writing:', err);
      await showAlert('Không thể đánh giá bài viết lúc này. Vui lòng thử lại sau.');
    } finally {
      setWritingLoading(false);
    }
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
                Apex Writing Portal<span className="text-[#c92a2a]">.</span>
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
              to="/practice?tab=writing"
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
                  ✍️ Writing Practice Mode
                </span>
                <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight">{activeExam.title}</h2>
              </div>
            </div>

            {/* Task switcher (tabs) */}
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
                    Task {sec.sectionOrder}
                  </button>
                );
              })}
            </div>

            {/* Workspace Split View */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Scrollable prompt detail (grid 5/12) */}
              <div className="lg:col-span-5 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[4px_4px_0px_0px_#1b263b] space-y-6 max-h-[75vh] overflow-y-auto">
                <h4 className="font-bold text-[#c92a2a] text-xs uppercase tracking-wider">
                  {activeExam.sections[activeSectionIdx]?.title || `Writing Task ${activeSectionIdx + 1}`}
                </h4>
                
                <div 
                  className="text-sm text-gray-700 leading-relaxed font-serif whitespace-pre-line text-left italic"
                  dangerouslySetInnerHTML={{
                    __html: activeExam.sections[activeSectionIdx]?.passageText?.replace(/\\n/g, '<br/>') || ''
                  }}
                />

                {/* Diagrams */}
                {activeExam.sections[activeSectionIdx]?.images && activeExam.sections[activeSectionIdx].images.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mb-2">Diagram Visual Prompt</p>
                    <img
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${activeExam.sections[activeSectionIdx].images[0]}`}
                      alt="Writing prompt illustration"
                      className="max-w-full max-h-[300px] object-contain border border-gray-300 rounded-xl mx-auto shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: User Input and AI evaluation (grid 7/12) */}
              <div className="lg:col-span-7 space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black text-gray-500 px-1">
                    <span>Your Essay Response</span>
                    <span className={essayText.trim().split(/\s+/).filter(Boolean).length >= (activeSectionIdx === 0 ? 150 : 250) ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                      Word Count: {essayText.trim().split(/\s+/).filter(Boolean).length} / {activeSectionIdx === 0 ? 150 : 250}+ (min)
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={essayText}
                    onChange={(e) => {
                      const text = e.target.value;
                      setEssayText(text);
                      setWritingEssays(prev => ({
                        ...prev,
                        [activeSectionIdx]: text
                      }));
                    }}
                    placeholder={activeSectionIdx === 0 ? "Viết bài mô tả biểu đồ của bạn tại đây (tối thiểu 150 từ)..." : "Viết bài luận nghị luận xã hội của bạn tại đây (tối thiểu 250 từ)..."}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-2xl p-5 text-sm font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner resize-y font-mono"
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
                    'Nộp Bài & Chấm Điểm AI ✍️'
                  )}
                </button>

                {/* Result for this section */}
                {writingResults[activeSectionIdx] && (
                  <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4 animate-fade-in text-left">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-3">
                      <h4 className="font-serif text-lg font-bold text-[#1b263b]">Kết Quả Chấm Essay AI</h4>
                      <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-4 py-1.5 rounded-xl font-mono font-black text-lg">
                        Band {writingResults[activeSectionIdx].bandScore}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Task Response', score: writingResults[activeSectionIdx].taskAchievement },
                        { label: 'Coherence', score: writingResults[activeSectionIdx].coherenceCohesion },
                        { label: 'Vocabulary', score: writingResults[activeSectionIdx].lexicalResource },
                        { label: 'Grammar', score: writingResults[activeSectionIdx].grammarAccuracy },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-center">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-lg font-mono font-black text-[#1b263b]">{item.score}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2 text-xs text-gray-700 leading-relaxed font-semibold">
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">1. Task Achievement / Response:</p>
                        <p className="mt-0.5">{writingResults[activeSectionIdx].aiFeedback?.taskAchievement}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">2. Coherence and Cohesion:</p>
                        <p className="mt-0.5">{writingResults[activeSectionIdx].aiFeedback?.coherenceCohesion}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">3. Lexical Resource:</p>
                        <p className="mt-0.5">{writingResults[activeSectionIdx].aiFeedback?.lexicalResource}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400">4. Grammatical Range & Accuracy:</p>
                        <p className="mt-0.5">{writingResults[activeSectionIdx].aiFeedback?.grammarAccuracy}</p>
                      </div>
                      <div className="pt-2 border-t border-dashed border-gray-200">
                        <p className="text-[10px] font-black uppercase text-red-500">General Suggestions:</p>
                        <p className="mt-0.5 text-gray-800 font-serif italic font-bold">"{writingResults[activeSectionIdx].aiFeedback?.general}"</p>
                      </div>
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
