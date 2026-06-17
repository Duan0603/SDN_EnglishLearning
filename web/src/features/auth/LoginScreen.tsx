import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/store'
import { loginStart, loginSuccess, loginFailure } from './authSlice'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/api.client'

export default function LoginScreen() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      alert('Vui lòng điền đầy đủ Tên tài khoản và Mật khẩu.')
      return
    }

    dispatch(loginStart())
    try {
      const res = await apiClient.post('/auth/login', { username, password })
      const metadata = res.data?.metadata || res.data
      
      const user = metadata.user
      const token = metadata.tokens?.accessToken || metadata.accessToken || 'mock-token'

      dispatch(loginSuccess({ user, token }))
      
      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login failed, checking credentials locally:', err.message)
      dispatch(loginFailure(err.response?.data?.message || 'Đăng nhập không thành công. Hãy thử nút Demo Admin!'))
    }
  }

  // Quick Admin login bypass for test convenience
  const handleDemoAdminLogin = () => {
    dispatch(loginStart())
    setTimeout(() => {
      dispatch(
        loginSuccess({
          user: {
            id: 'demo-admin-id',
            fullName: 'Quan (Admin)',
            username: 'admin',
            email: 'admin@sdn.com',
            role: 'ADMIN',
            status: 'active',
          },
          token: 'demo-jwt-token-string',
        })
      )
      navigate('/admin')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative font-sans overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00CC99]/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#005C42]/20 blur-3xl" />

      <div className="w-full max-w-md bg-[#1a1a1a]/80 border border-[#2d2d2d] rounded-[32px] p-8 shadow-2xl backdrop-blur-md relative z-10 space-y-8">
        {/* Logo and Greeting */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#00CC99] rounded-2xl flex items-center justify-center mx-auto text-accent-dark font-black text-3xl shadow-xl shadow-[#00cc99]/25 animate-bounce">
            A
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Apex IELTS</h2>
          <p className="text-xs text-gray-500">AI-powered IELTS Online Examination</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 text-xs text-red-400 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
              Tên tài khoản
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập username..."
              className="w-full bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#00cc99] transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:border-[#00cc99] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00cc99] text-[#121212] font-black text-sm py-4 rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#00cc99]/15 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-[#121212] border-t-transparent rounded-full animate-spin" />
            ) : (
              'Đăng Nhập Hệ Thống'
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[#2d2d2d]"></div>
          <span className="flex-shrink mx-4 text-[10px] font-extrabold text-gray-600 uppercase">Hoặc Kiểm Thử</span>
          <div className="flex-grow border-t border-[#2d2d2d]"></div>
        </div>

        {/* Demo Admin bypass */}
        <button
          onClick={handleDemoAdminLogin}
          className="w-full bg-gradient-to-r from-[#005C42] to-[#008F6B] text-white font-bold text-xs py-3.5 rounded-2xl border border-[#00cc99]/30 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
        >
          🔑 Demo Admin Login (Vào nhanh)
        </button>
      </div>
    </div>
  )
}
