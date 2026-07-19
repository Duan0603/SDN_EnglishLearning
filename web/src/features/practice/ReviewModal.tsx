import React, { useEffect, useState } from 'react';
import { apiClient } from '../../services/api.client';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  type: string; // 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING'
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, submissionId, type }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (type === 'READING' || type === 'LISTENING') {
          url = `/users/me/results/test/${submissionId}`;
        } else if (type === 'WRITING') {
          url = `/users/me/results/writing/${submissionId}`;
        } else if (type === 'SPEAKING') {
          url = `/users/me/results/speaking/${submissionId}`;
        }

        const res = await apiClient.get(url);
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi tải chi tiết bài làm.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, submissionId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1b263b]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-3xl p-6 shadow-[8px_8px_0px_0px_#1b263b] w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b-2 border-[#1b263b] pb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-black text-[#1b263b] uppercase">
              CHI TIẾT BÀI {type === 'READING' ? 'ĐỌC' : type === 'LISTENING' ? 'NGHE' : type === 'WRITING' ? 'VIẾT' : 'NÓI'}
            </h2>
            <p className="text-xs font-bold text-gray-500 mt-1">
              Band Score: <span className="text-[#c92a2a]">{data?.bandScore || '0.0'}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border-2 border-[#1b263b] rounded-full bg-rose-200 hover:bg-rose-300 transition-colors font-black text-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1b263b] border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#1b263b]">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-rose-600 border-2 border-rose-600 bg-rose-50 p-4 rounded-xl">{error}</p>
            </div>
          ) : data ? (
            <div>
              {/* READING / LISTENING REVIEW */}
              {(type === 'READING' || type === 'LISTENING') && (
                <div className="space-y-6">
                  <div className="flex gap-4 mb-6">
                    <div className="bg-white border-2 border-[#1b263b] px-4 py-2 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                      <p className="text-[10px] font-black uppercase text-gray-500">Số câu đúng</p>
                      <p className="text-lg font-black text-emerald-600">{data.correctCount} / {data.test?.sections?.reduce((acc: number, sec: any) => acc + sec.questions.length, 0) || '?'}</p>
                    </div>
                  </div>

                  {data.test?.sections?.map((section: any, sIdx: number) => (
                    <div key={section.id} className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b]">
                      <h3 className="font-black text-sm uppercase mb-4 border-b border-gray-200 pb-2">{section.title || `Section ${sIdx + 1}`}</h3>
                      <div className="space-y-4">
                        {section.questions.map((q: any) => {
                          const userAnsObj = data.answers?.find((a: any) => a.questionId === q.id);
                          const userAns = userAnsObj ? userAnsObj.userAnswer : '';
                          const isCorrect = userAns.toLowerCase().trim() === q.answer.toLowerCase().trim();

                          return (
                            <div key={q.id} className={`p-4 border-2 rounded-xl ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-rose-500 bg-rose-50'}`}>
                              <p className="text-xs font-bold text-gray-800 mb-2">Câu {q.questionNumber}: {q.content}</p>
                              
                              <div className="grid grid-cols-2 gap-4 text-[11px] font-bold">
                                <div className="bg-white p-2 rounded border border-gray-300">
                                  <span className="text-gray-500 block mb-1 uppercase text-[9px]">Bạn đã chọn:</span>
                                  <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{userAns || '(Trống)'}</span>
                                </div>
                                <div className="bg-white p-2 rounded border border-emerald-300">
                                  <span className="text-emerald-700 block mb-1 uppercase text-[9px]">Đáp án đúng:</span>
                                  <span className="text-emerald-700">{q.answer}</span>
                                </div>
                              </div>
                              
                              {q.explanation && (
                                <div className="mt-3 text-[10px] bg-sky-50 text-sky-800 p-2 rounded border border-sky-200">
                                  <span className="font-black">Giải thích:</span> {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* WRITING REVIEW */}
              {type === 'WRITING' && (
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-2">Đề bài (Prompt)</h3>
                    <p className="text-xs font-bold text-[#1b263b] mb-6">{data.prompt || data.test?.title}</p>
                    
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-2">Bài viết của bạn</h3>
                    <div className="text-xs leading-relaxed whitespace-pre-wrap bg-amber-50 p-4 border border-amber-200 rounded-xl">
                      {data.essayText}
                    </div>
                  </div>
                  
                  <div className="bg-[#1b263b] text-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b]">
                    <h3 className="font-black text-sm uppercase text-[#ffd54f] mb-4">Nhận xét từ Giám khảo AI</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Task Achievement</p>
                        <p className="text-lg font-black text-emerald-400">{data.taskAchievement}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Coherence & Cohesion</p>
                        <p className="text-lg font-black text-emerald-400">{data.coherenceCohesion}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Lexical Resource</p>
                        <p className="text-lg font-black text-emerald-400">{data.lexicalResource}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Grammar</p>
                        <p className="text-lg font-black text-emerald-400">{data.grammarAccuracy}</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      {data.aiFeedback && (
                        <>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Nhận xét tổng quan:</span>
                            <p className="text-gray-300">{data.aiFeedback.general}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Task Achievement (Đáp ứng yêu cầu):</span>
                            <p className="text-gray-300">{data.aiFeedback.taskAchievement}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Coherence & Cohesion (Mạch lạc & Liên kết):</span>
                            <p className="text-gray-300">{data.aiFeedback.coherenceCohesion}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Lexical Resource (Từ vựng):</span>
                            <p className="text-gray-300">{data.aiFeedback.lexicalResource}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Grammar Accuracy (Ngữ pháp):</span>
                            <p className="text-gray-300">{data.aiFeedback.grammarAccuracy}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SPEAKING REVIEW */}
              {type === 'SPEAKING' && (
                <div className="grid lg:grid-cols-2 gap-6 items-start">
                  <div className="bg-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b]">
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-2">Chủ đề (Prompt)</h3>
                    <p className="text-xs font-bold text-[#1b263b] mb-6">{data.prompt || data.test?.title}</p>
                    
                    <h3 className="font-black text-xs uppercase text-gray-500 mb-2">Bản ghi âm của bạn</h3>
                    <div className="mb-4">
                      <audio controls src={data.audioUrl} className="w-full h-10 outline-none" />
                    </div>

                    <h3 className="font-black text-xs uppercase text-gray-500 mb-2">Văn bản nhận diện (Transcription)</h3>
                    <div className="text-xs leading-relaxed whitespace-pre-wrap bg-sky-50 p-4 border border-sky-200 rounded-xl">
                      {data.transcription || 'Không nhận diện được nội dung.'}
                    </div>
                  </div>
                  
                  <div className="bg-[#1b263b] text-white border-2 border-[#1b263b] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1b263b]">
                    <h3 className="font-black text-sm uppercase text-[#ffd54f] mb-4">Nhận xét từ Giám khảo AI</h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Fluency</p>
                        <p className="text-lg font-black text-emerald-400">{data.fluencyCoherence}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Pronunciation</p>
                        <p className="text-lg font-black text-emerald-400">{data.pronunciation}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Lexical Resource</p>
                        <p className="text-lg font-black text-emerald-400">{data.lexicalResource}</p>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                        <p className="text-[9px] uppercase text-gray-400">Grammar</p>
                        <p className="text-lg font-black text-emerald-400">{data.grammarAccuracy}</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs">
                      {data.aiFeedback && (
                        <>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Nhận xét tổng quan:</span>
                            <p className="text-gray-300">{data.aiFeedback.general}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Fluency & Coherence (Trôi chảy & Mạch lạc):</span>
                            <p className="text-gray-300">{data.aiFeedback.fluencyCoherence}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Pronunciation (Phát âm):</span>
                            <p className="text-gray-300">{data.aiFeedback.pronunciation}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Lexical Resource (Từ vựng):</span>
                            <p className="text-gray-300">{data.aiFeedback.lexicalResource}</p>
                          </div>
                          <div>
                            <span className="font-black text-amber-400 block mb-1">Grammar Accuracy (Ngữ pháp):</span>
                            <p className="text-gray-300">{data.aiFeedback.grammarAccuracy}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
