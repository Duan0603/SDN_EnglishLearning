import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/store'
import { initializeAuth } from './features/auth/authSlice'
import LoginScreen from './features/auth/LoginScreen'
import AdminDashboard from './features/admin/AdminDashboard'
import HomeNewTests from './features/landing/HomeNewTests'
import PracticeWorkspace from './features/practice/PracticeWorkspace'

// Protected Route Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

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


function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(initializeAuth())
  }, [dispatch])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeNewTests />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <PracticeWorkspace />
            </ProtectedRoute>
          }
        />
        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
