import React, { createContext, useContext, useState, useEffect } from 'react';

interface ModalOptions {
  title?: string;
  message: string;
  type: 'alert' | 'confirm' | 'prompt';
  defaultValue?: string;
  resolve: (value?: any) => void;
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (modal && modal.type === 'prompt') {
      setInputValue(modal.defaultValue || '');
    }
  }, [modal]);

  const showAlert = (message: string, title = 'Thông báo') => {
    return new Promise<void>((resolve) => {
      setModal({
        title,
        message,
        type: 'alert',
        resolve: () => {
          setModal(null);
          resolve();
        },
      });
    });
  };

  const showConfirm = (message: string, title = 'Xác nhận') => {
    return new Promise<boolean>((resolve) => {
      setModal({
        title,
        message,
        type: 'confirm',
        resolve: (value: boolean) => {
          setModal(null);
          resolve(value);
        },
      });
    });
  };

  const showPrompt = (message: string, defaultValue = '', title = 'Nhập thông tin') => {
    return new Promise<string | null>((resolve) => {
      setModal({
        title,
        message,
        type: 'prompt',
        defaultValue,
        resolve: (value: string | null) => {
          setModal(null);
          resolve(value);
        },
      });
    });
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal && modal.type === 'prompt') {
      modal.resolve(inputValue);
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-[28px] p-6 w-full max-w-[400px] shadow-[6px_6px_0px_0px_#1b263b] relative overflow-hidden flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1b263b]/10 pb-3 mb-4">
              <h3 className="font-serif font-black text-base text-[#1b263b] flex items-center gap-2">
                {modal.type === 'confirm' ? '❓' : modal.type === 'prompt' ? '📝' : '💡'} {modal.title}
              </h3>
            </div>

            {/* Message Body */}
            <div className="text-xs font-sans font-black text-[#1b263b]/80 leading-relaxed mb-4 whitespace-pre-wrap">
              {modal.message}
            </div>

            {/* Input Form for Prompt */}
            {modal.type === 'prompt' && (
              <form onSubmit={handlePromptSubmit} className="mb-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#1b263b] rounded-xl font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[#00cc99]/30 bg-white text-[#1b263b]"
                  autoFocus
                  placeholder="Nhập nội dung tại đây..."
                />
              </form>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 justify-end">
              {modal.type === 'confirm' || modal.type === 'prompt' ? (
                <>
                  <button
                    type="button"
                    onClick={() => modal.resolve(modal.type === 'confirm' ? false : null)}
                    className="px-5 py-2.5 rounded-xl border-2 border-[#1b263b] bg-white text-[#1b263b] font-serif font-black text-xs hover:bg-gray-50 transition-all shadow-[2.5px_2.5px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => modal.resolve(modal.type === 'confirm' ? true : inputValue)}
                    className="px-5 py-2.5 rounded-xl border-2 border-[#1b263b] bg-[#1b263b] text-[#f6f3db] font-serif font-black text-xs hover:bg-[#324566] transition-all shadow-[2.5px_2.5px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer"
                  >
                    Đồng ý
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => modal.resolve()}
                  className="w-full px-5 py-2.5 rounded-xl border-2 border-[#1b263b] bg-[#1b263b] text-[#f6f3db] font-serif font-black text-xs hover:bg-[#324566] transition-all shadow-[2.5px_2.5px_0px_0px_#1b263b] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1b263b] cursor-pointer text-center"
                >
                  Đóng
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
