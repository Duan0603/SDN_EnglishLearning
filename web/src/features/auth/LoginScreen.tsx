import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { loginStart, loginSuccess, loginFailure } from './authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../../services/api.client';
import { DotLottiePlayer } from '@dotlottie/react-player';

export default function LoginScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Vui lòng điền đầy đủ Tên tài khoản và Mật khẩu.');
      return;
    }

    dispatch(loginStart());
    try {
      const res = await apiClient.post('/auth/login', { username, password });
      const metadata = res.data?.metadata || res.data;
      
      const user = metadata.user;
      const token = metadata.tokens?.accessToken || metadata.accessToken || 'mock-token';

      dispatch(loginSuccess({ user, token }));
      
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login failed:', err.message);
      dispatch(loginFailure(err.response?.data?.message || 'Đăng nhập không thành công. Hãy kiểm tra lại thông tin.'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim() || !email.trim() || !phone.trim()) {
      alert('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    dispatch(loginStart());
    try {
      await apiClient.post('/auth/signup', {
        username,
        email,
        password,
        fullName,
        phone,
        role: 'STUDENT'
      });
      alert('Đăng ký tài khoản thành công! Hãy thực hiện đăng nhập.');
      setIsRegisterMode(false);
      setPassword('');
      dispatch(loginFailure(''));
    } catch (err: any) {
      console.error('Signup failed:', err.message);
      dispatch(loginFailure(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3dc] bg-notebook-paper bg-notebook bg-repeat text-[#1b263b] flex items-center justify-center p-4 md:p-12 relative overflow-hidden custom-pencil-cursor">
      
      {/* Real Spiral Binder Graphic on the Left side */}
      <div className="absolute left-3 top-0 bottom-0 w-10 flex flex-col justify-around pointer-events-none z-20 opacity-90 select-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-1.5 h-12 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full border border-gray-500 shadow-md transform -rotate-12" />
            <div className="w-3 h-3 rounded-full bg-gray-600/30 -mt-1 shadow-inner" />
          </div>
        ))}
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-12 items-center relative z-10 pl-12">
        
        {/* Left Column: Animation & Welcome Memo */}
        <div className="lg:col-span-6 space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-6 shadow-[4px_4px_0px_0px_#1b263b] w-full max-w-lg relative overflow-hidden">
            {/* Red margin vertical line inside the lottie card */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#e0565b]/40 pointer-events-none" />
            
            <div className="pl-8 space-y-4">
              <span className="text-[10px] bg-sky-100 text-[#4682b4] border border-[#1b263b] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Exam Preparation Portal
              </span>
              <h1 className="text-3xl font-serif font-black text-[#1b263b] leading-tight">
                Practice IELTS inside <br />
                your <span className="font-handwriting text-[#c92a2a] text-4xl" style={{ fontFamily: "'Caveat', cursive" }}>digital workspace</span>
              </h1>
              
              {/* Lottie Player container with cross-fade animation */}
              <div className="w-full relative min-h-[290px] py-2 bg-transparent rounded-2xl flex items-center justify-center overflow-hidden">
                {/* Login Animation */}
                <div className={`w-full max-w-[320px] transition-all duration-500 ease-in-out transform ${!isRegisterMode ? 'opacity-100 scale-100 pointer-events-auto relative' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
                  <DotLottiePlayer
                    src="/Login.lottie"
                    autoplay
                    loop
                    style={{ width: '100%', height: '280px' }}
                  />
                </div>

                {/* Register Animation */}
                <div className={`w-full max-w-[320px] transition-all duration-500 ease-in-out transform ${isRegisterMode ? 'opacity-100 scale-100 pointer-events-auto relative' : 'opacity-0 scale-95 pointer-events-none absolute'}`}>
                  <DotLottiePlayer
                    src="/register.json"
                    autoplay
                    loop
                    style={{ width: '100%', height: '280px' }}
                  />
                </div>
              </div>
              
              <p className="text-xs font-semibold text-gray-500 italic">
                ✏️ TIP: Active students achieve a band score improvement of +1.5 using our AI-driven Writing and Speaking modules.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity Login/Register Card with sliding transition */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto relative">
          
          {/* Card header spiral ring holes decoration */}
          <div className="absolute -top-3.5 left-0 right-0 flex justify-around px-8 pointer-events-none select-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-[#f5f3dc] border-2 border-[#1b263b] shadow-inner" />
            ))}
          </div>

          <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-3xl p-8 shadow-[6px_6px_0px_0px_#1b263b] relative overflow-hidden space-y-6">
            
            {/* Return home link */}
            <div className="flex justify-between items-center z-10 relative">
              <Link to="/" className="text-xs font-black text-[#1b263b]/70 hover:text-[#c92a2a] flex items-center gap-1 transition-colors">
                <span>←</span> Back to Home
              </Link>
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Apex IELTS</span>
            </div>

            {error && (
              <div className="bg-[#ffe3e3] border-2 border-[#1b263b] rounded-xl p-3 text-xs text-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b] text-center z-10 relative">
                ⚠ {error}
              </div>
            )}

            {/* Sliding Form Track Wrapper */}
            <div className={`transition-all duration-500 ease-in-out ${!isRegisterMode ? 'max-h-[480px]' : 'max-h-[590px]'}`}>
              <div className="flex w-[200%] transition-transform duration-500 ease-in-out" style={{ transform: isRegisterMode ? 'translateX(-50%)' : 'translateX(0%)' }}>
                
                {/* COLUMN 1: LOGIN FORM (50% of track width) */}
                <div className={`w-1/2 pr-3 space-y-4 transition-opacity duration-500 ${!isRegisterMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  
                  {/* Title & Logo */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-[2px_2px_0px_0px_#1b263b] shrink-0">
                      A
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight leading-tight">Open your workspace</h2>
                      <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-wider font-black">AI-Powered Exam Dashboard</p>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                        Tên tài khoản (Username)
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. student123"
                        className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                        required
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                        Mật khẩu (Password)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#c92a2a] text-white font-black text-xs py-3.5 rounded-xl hover:bg-[#b01e1e] active:scale-[0.98] transition-all shadow-[3px_3px_0px_0px_#1b263b] border-2 border-[#1b263b] flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Đăng Nhập Hệ Thống ✉</>
                      )}
                    </button>
                  </form>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t-2 border-dashed border-[#1b263b]/20"></div>
                    <span className="flex-shrink mx-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t-2 border-dashed border-[#1b263b]/20"></div>
                  </div>

                  {/* Google Login Button */}
                  <button
                    type="button"
                    onClick={() => alert("Google Single Sign-On (SSO) is being configured. Please use local credentials for developer verification.")}
                    className="w-full bg-[#fefefe] text-[#1b263b] font-black text-xs py-3.5 rounded-xl border-2 border-[#1b263b] hover:bg-gray-50 active:scale-[0.98] transition-all shadow-[3px_3px_0px_0px_#1b263b] flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 2.69-.78 3.56l3.11 2.42c1.82-1.68 2.72-4.15 2.72-7.83z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.11-2.42c-.86.58-1.97.92-3.21.92-3.14 0-5.8-2.12-6.75-4.97L1.62 18.16C3.6 22.1 7.6 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.25 14.62c-.25-.76-.39-1.57-.39-2.4 0-.83.14-1.64.39-2.4L1.62 7.29C.8 8.94.33 10.79.33 12.7c0 1.9.47 3.75 1.29 5.4l3.63-2.48z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.6 0 3.6 1.9 1.62 5.84l3.63 2.82c.95-2.85 3.61-4.91 6.75-4.91z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="pt-2 text-center text-xs font-bold text-gray-500">
                    Chưa có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        dispatch(loginFailure(''));
                      }}
                      className="text-[#c92a2a] underline font-black hover:text-[#b01e1e] transition-colors"
                    >
                      Đăng ký ngay
                    </button>
                  </div>
                </div>

                {/* COLUMN 2: REGISTER FORM (50% of track width) */}
                <div className={`w-1/2 pl-3 space-y-4 transition-opacity duration-500 ${isRegisterMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  
                  {/* Title & Logo */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-[2px_2px_0px_0px_#1b263b] shrink-0">
                      A
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#1b263b] font-black tracking-tight leading-tight">Create your workspace</h2>
                      <p className="text-[9px] text-[#1b263b]/70 uppercase tracking-wider font-black">Registration Form</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                          required
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0912345678"
                          className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                        required
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                        Tên tài khoản (Username)
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username mong muốn..."
                        className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                        required
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="block text-[10px] font-black text-[#1b263b]/70 uppercase tracking-wider pl-1">
                        Mật khẩu (Password)
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự..."
                        className="w-full bg-[#fefefe] border-2 border-[#1b263b] rounded-xl px-3 py-2 text-xs font-bold text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all shadow-inner"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#c92a2a] text-white font-black text-xs py-3.5 rounded-xl hover:bg-[#b01e1e] active:scale-[0.98] transition-all shadow-[3px_3px_0px_0px_#1b263b] border-2 border-[#1b263b] flex items-center justify-center gap-2 uppercase tracking-wider"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Tạo Tài Khoản Học Viên ✎</>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 text-center text-xs font-bold text-gray-500">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        dispatch(loginFailure(''));
                      }}
                      className="text-[#c92a2a] underline font-black hover:text-[#b01e1e] transition-colors"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
