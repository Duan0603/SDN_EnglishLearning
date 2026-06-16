import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/store'
import { initializeAuth } from './features/auth/authSlice'
import LoginScreen from './features/auth/LoginScreen'
import AdminDashboard from './features/admin/AdminDashboard'

// Strict Admin Role Guard
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-red-500/20 rounded-[32px] p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-red-500/20">
            ⚠️
          </div>
          <h1 className="text-xl font-black text-white">Truy Cập Bị Từ Chối</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Tài khoản của bạn không có quyền Quản trị viên (ADMIN) để truy cập khu vực này.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              to="/"
              className="bg-[#252525] hover:bg-[#323232] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all"
            >
              Về Trang Chủ
            </Link>
            <Link
              to="/login"
              className="bg-[#00cc99] text-[#121212] text-xs font-black px-5 py-3 rounded-xl transition-all"
            >
              Đăng Nhập Khác
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Modern Interactive Landing Page (HomePage)
const HomePage = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-[#121212] text-gray-200 flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00cc99]/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#005C42]/10 blur-3xl" />

      <div className="card max-w-lg w-full mx-4 p-8 bg-[#1a1a1a]/90 border border-[#2d2d2d] rounded-[32px] text-center shadow-2xl relative z-10 space-y-6">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#00CC99] to-[#005C42] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#00cc99]/15">
          <span className="text-white text-3xl font-black">A</span>
        </div>
        
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Apex IELTS</h1>
          <p className="text-xs text-gray-500 mt-1.5">AI-powered IELTS Learning Platform</p>
        </div>

        <div className="flex gap-2.5 justify-center py-2">
          <span className="bg-[#005C42]/30 text-[#00cc99] text-[10px] font-bold border border-[#00cc99]/20 px-3 py-1 rounded-full uppercase">
            ✓ Backend Live
          </span>
          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 px-3 py-1 rounded-full uppercase">
            ✓ Vite + React + TS
          </span>
        </div>

        <div className="pt-4 space-y-3">
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="bg-[#252525] border border-[#3d3d3d] rounded-2xl p-4 text-left">
                <p className="text-xs text-gray-500">Đăng nhập với vai trò:</p>
                <p className="text-sm font-bold text-white mt-1">{user.fullName}</p>
                <p className="text-xs text-[#00cc99] font-mono mt-0.5">Role: {user.role}</p>
              </div>

              <div className="flex gap-3">
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="flex-1 bg-[#00cc99] text-[#121212] font-black text-xs py-3.5 rounded-2xl text-center hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#00cc99]/10"
                  >
                    Vào Trang Admin 👑
                  </Link>
                )}
                <Link
                  to="/login"
                  className="flex-1 bg-[#252525] hover:bg-[#323232] text-white font-bold text-xs py-3.5 rounded-2xl text-center active:scale-[0.98] transition-all border border-[#3d3d3d]"
                >
                  Đổi Tài Khoản
                </Link>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="block w-full bg-[#00cc99] text-[#121212] font-black text-sm py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#00cc99]/15"
            >
              Đăng Nhập Hệ Thống
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
