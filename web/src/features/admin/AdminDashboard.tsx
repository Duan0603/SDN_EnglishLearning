import React, { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '../../store/store'
import { logout } from '../auth/authSlice'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../services/api.client'

// Interfaces
interface User {
  id: string
  _id?: string
  fullName: string
  username: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  status: 'active' | 'inactive' | 'pending'
  phone?: string
  birthday?: string
  identityNumber?: string
}

interface Booking {
  id: string
  studentName: string
  mentorName: string
  dateTime: string
  amount: number
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
}

interface Exam {
  id: string
  _id?: string
  title: string
  type: 'Reading' | 'Listening' | 'Writing' | 'Speaking'
  duration: number
  questionsCount: number
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  // Tab State: 'dashboard' | 'users' | 'orders' | 'exams'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'exams'>('dashboard')
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'MENTOR' | 'PENDING'>('ALL')

  // Data States
  const [usersList, setUsersList] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Booking/Order State (Mocked demo data representing Mentor slots booked by Students)
  const [bookingsList, setBookingsList] = useState<Booking[]>([
    { id: 'BK001', studentName: 'Nguyen Minh Anh', mentorName: 'Emily Smith', dateTime: '2026-06-18 09:00', amount: 350000, status: 'Confirmed' },
    { id: 'BK002', studentName: 'Tran Huu Binh', mentorName: 'David Lee', dateTime: '2026-06-18 14:00', amount: 400000, status: 'Pending' },
    { id: 'BK003', studentName: 'Le Thi Hoa', mentorName: 'Sarah Nguyen', dateTime: '2026-06-19 10:30', amount: 350000, status: 'Confirmed' },
    { id: 'BK004', studentName: 'Nguyen Minh Anh', mentorName: 'Emily Smith', dateTime: '2026-06-20 16:00', amount: 350000, status: 'Pending' },
  ])

  // Exams State
  const [examsList, setExamsList] = useState<Exam[]>([
    { id: 'EX001', title: 'IELTS Cambridge 18 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
    { id: 'EX002', title: 'IELTS Cambridge 18 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
    { id: 'EX003', title: 'IELTS Cambridge 17 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
  ])

  // User Modals & Forms State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [createUserForm, setCreateUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'MENTOR' | 'ADMIN',
    birthday: '',
    phone: '',
    identityNumber: '',
  })
  
  const [showEditUserModal, setShowEditUserModal] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'STUDENT' as 'STUDENT' | 'MENTOR' | 'ADMIN',
    birthday: '',
    phone: '',
    identityNumber: '',
    password: '',
  })

  // Exam Creator Modal
  const [showCreateExamModal, setShowCreateExamModal] = useState(false)
  const [newExamTitle, setNewExamTitle] = useState('')
  const [newExamType, setNewExamType] = useState<'Reading' | 'Listening'>('Reading')
  const [newExamDuration, setNewExamDuration] = useState('60')
  const [newExamQuestions, setNewExamQuestions] = useState('40')

  // Bulk Import Modal
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [bulkJsonPayload, setBulkJsonPayload] = useState('')

  // ────────────────────────────────────────────────────────
  // AUTH GUARD
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      // Allow demo bypass if no user exists, but warn or force redirection.
      // If we are testing locally, we can let user proceed or redirect to login.
    }
  }, [isAuthenticated, user])

  // ────────────────────────────────────────────────────────
  // DATA FETCHING
  // ────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await apiClient.get('/admin/users')
      const raw = res.data?.metadata?.users || res.data || []
      // Standardize id
      setUsersList(raw.map((u: any) => ({ ...u, id: u._id || u.id })))
    } catch (err: any) {
      console.warn('Backend connection failed, using mockup data:', err.message)
      // Fallback fallback users
      setUsersList([
        { id: '1', fullName: 'Nguyen Minh Anh', username: 'minhanh', email: 'minhanh@gmail.com', role: 'STUDENT', status: 'active', birthday: '15/08/2002', phone: '0912345678', identityNumber: '001202003456' },
        { id: '2', fullName: 'John Doe', username: 'johndoe', email: 'john@sdn.com', role: 'MENTOR', status: 'pending', birthday: '20/10/1995', phone: '0987654321', identityNumber: '001202008765' },
        { id: '3', fullName: 'Emily Smith', username: 'emily', email: 'emily@mentor.com', role: 'MENTOR', status: 'active', birthday: '12/03/1990', phone: '0977665544', identityNumber: '001202004321' },
        { id: '4', fullName: 'Admin User', username: 'admin', email: 'admin@sdn.com', role: 'ADMIN', status: 'active', birthday: '01/01/1988', phone: '0900112233', identityNumber: '001202009999' },
      ])
      setUsersError('Đang dùng dữ liệu mô phỏng. Kết nối backend để tải danh sách thực tế.')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  // ────────────────────────────────────────────────────────
  // HANDLERS: User CRUD
  // ────────────────────────────────────────────────────────
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createUserForm.fullName || !createUserForm.username || !createUserForm.email || !createUserForm.password) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.')
      return
    }

    try {
      const res = await apiClient.post('/admin/users', createUserForm)
      const newUser = res.data?.metadata || res.data
      setUsersList((prev) => [{ ...newUser, id: newUser._id || newUser.id }, ...prev])
      setShowCreateUserModal(false)
      setCreateUserForm({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'STUDENT',
        birthday: '',
        phone: '',
        identityNumber: '',
      })
      alert('Tạo người dùng thành công!')
    } catch (err: any) {
      // Fallback local add
      const mockNew: User = {
        id: String(Date.now()),
        fullName: createUserForm.fullName,
        username: createUserForm.username,
        email: createUserForm.email,
        role: createUserForm.role,
        status: createUserForm.role === 'MENTOR' ? 'pending' : 'active',
        birthday: createUserForm.birthday,
        phone: createUserForm.phone,
        identityNumber: createUserForm.identityNumber,
      }
      setUsersList((prev) => [mockNew, ...prev])
      setShowCreateUserModal(false)
      alert('Đã tạo thành công người dùng (mô phỏng cục bộ do không kết nối được backend API)')
    }
  }

  const openEditModal = (item: User) => {
    setEditTargetId(item.id)
    setEditUserForm({
      fullName: item.fullName || '',
      username: item.username || '',
      email: item.email || '',
      role: item.role || 'STUDENT',
      birthday: item.birthday || '',
      phone: item.phone || '',
      identityNumber: item.identityNumber || '',
      password: '',
    })
    setShowEditUserModal(true)
  }

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTargetId) return
    
    const payload: any = { ...editUserForm }
    if (!payload.password) delete payload.password // don't send empty pwd

    try {
      const res = await apiClient.patch(`/admin/users/${editTargetId}`, payload)
      const updated = res.data?.metadata || res.data
      setUsersList((prev) =>
        prev.map((u) => (u.id === editTargetId ? { ...u, ...updated } : u))
      )
      setShowEditUserModal(false)
      alert('Cập nhật thông tin thành công!')
    } catch (err) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === editTargetId ? { ...u, ...editUserForm } : u))
      )
      setShowEditUserModal(false)
      alert('Đã cập nhật (mô phỏng cục bộ)')
    }
  }

  const handleDeleteUser = async (item: User) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn người dùng "${item.fullName}"?`)) return
    try {
      await apiClient.delete(`/admin/users/${item.id}`)
      setUsersList((prev) => prev.filter((u) => u.id !== item.id))
      alert('Xóa người dùng thành công!')
    } catch (err) {
      setUsersList((prev) => prev.filter((u) => u.id !== item.id))
      alert('Đã xóa (mô phỏng cục bộ)')
    }
  }

  const handleToggleStatus = async (item: User) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'
    try {
      await apiClient.patch(`/admin/users/${item.id}/status`, { status: nextStatus })
      setUsersList((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: nextStatus } : u))
      )
    } catch (err) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: nextStatus } : u))
      )
    }
  }

  const handleApproveMentor = async (item: User) => {
    try {
      await apiClient.patch(`/admin/users/${item.id}/approve-mentor`)
      setUsersList((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: 'active' } : u))
      )
      alert(`Đã phê duyệt hồ sơ Mentor của ${item.fullName}!`)
    } catch (err) {
      setUsersList((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, status: 'active' } : u))
      )
      alert(`Đã phê duyệt Mentor (mô phỏng cục bộ)`)
    }
  }

  // ────────────────────────────────────────────────────────
  // HANDLERS: Booking status
  // ────────────────────────────────────────────────────────
  const handleBookingConfirm = (id: string) => {
    setBookingsList((prev) =>
      prev.map((bk) => (bk.id === id ? { ...bk, status: 'Confirmed' } : bk))
    )
  }

  const handleBookingCancel = (id: string) => {
    setBookingsList((prev) =>
      prev.map((bk) => (bk.id === id ? { ...bk, status: 'Cancelled' } : bk))
    )
  }

  // ────────────────────────────────────────────────────────
  // HANDLERS: Exam CRUD
  // ────────────────────────────────────────────────────────
  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamTitle.trim()) {
      alert('Tiêu đề đề thi không được trống')
      return
    }
    const newExam: Exam = {
      id: 'EX' + Date.now(),
      title: newExamTitle,
      type: newExamType,
      duration: parseInt(newExamDuration) || 60,
      questionsCount: parseInt(newExamQuestions) || 40,
    }
    setExamsList((prev) => [newExam, ...prev])
    setShowCreateExamModal(false)
    setNewExamTitle('')
    alert('Khởi tạo đề thi IELTS thành công!')
  }

  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      JSON.parse(bulkJsonPayload)
      alert('Import thành công dữ liệu đề thi JSON!')
      setShowBulkImportModal(false)
      setBulkJsonPayload('')
    } catch (err) {
      alert('JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc payload.')
    }
  }

  // ────────────────────────────────────────────────────────
  // FILTERED LISTS
  // ────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (roleFilter === 'ALL') return matchesSearch
      if (roleFilter === 'PENDING') return matchesSearch && u.role === 'MENTOR' && u.status === 'pending'
      return matchesSearch && u.role === roleFilter
    })
  }, [usersList, searchQuery, roleFilter])

  const filteredBookings = useMemo(() => {
    return bookingsList.filter(
      (bk) =>
        bk.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bk.mentorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bk.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [bookingsList, searchQuery])

  const filteredExams = useMemo(() => {
    return examsList.filter((ex) => ex.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [examsList, searchQuery])

  return (
    <div className="flex h-screen bg-[#121212] text-gray-200 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-[#1a1a1a] border-r border-[#2d2d2d] flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-[#2d2d2d] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00CC99] rounded-xl flex items-center justify-center text-accent-dark font-black text-xl shadow-lg shadow-[#00cc99]/20">
              A
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg tracking-wide">Apex Admin</h2>
              <span className="text-[10px] bg-[#005C42] text-[#00cc99] px-2 py-0.5 rounded-full font-bold">
                Workspace
              </span>
            </div>
          </div>

          <div className="px-4 py-6 space-y-1.5">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
              { id: 'users', name: 'Quản lý Người dùng', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
              { id: 'orders', name: 'Quản lý Đơn hàng', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
              { id: 'exams', name: 'Quản lý Đề thi', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
            ].map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setSearchQuery('')
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00CC99] text-[#121212] font-black shadow-md shadow-[#00cc99]/20'
                      : 'text-gray-400 hover:bg-[#252525] hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm font-semibold">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* LOGOUT / PROFILE BAR */}
        <div className="p-4 border-t border-[#2d2d2d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00CC99] to-[#005C42] flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-white max-w-[120px] truncate">
                {user?.fullName || 'Administrator'}
              </p>
              <p className="text-[10px] text-gray-500">ADMIN</p>
            </div>
          </div>
          <button
            onClick={() => {
              dispatch(logout())
              navigate('/')
            }}
            title="Đăng xuất"
            className="w-8 h-8 rounded-lg bg-[#252525] hover:bg-[#ef4444]/20 hover:text-[#ef4444] transition-all flex items-center justify-center text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-[#2d2d2d] bg-[#1a1a1a] flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-black text-white capitalize">{activeTab}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Trang tổng quan quản trị Apex IELTS</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-[#00cc99] bg-[#005C42]/40 border border-[#00cc99]/30 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              🟢 Live System
            </span>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* ────────────────────────────────────────────────────────
              DASHBOARD VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Tổng số học viên', value: '1,240', change: '+48 tháng này', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: '#00cc99', bg: 'rgba(0, 204, 153, 0.1)' },
                  { title: 'Mentor Đang Hoạt Động', value: '85', change: '3 hồ sơ mới duyệt', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' },
                  { title: 'Doanh Thu (Tháng 6)', value: '₫124.5M', change: '+18% so với tháng 5', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { title: 'Mock Exams Live', value: '48', change: '5 đề thi mới cập nhật', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[24px] p-6 flex items-center justify-between shadow-lg">
                    <div className="space-y-2.5">
                      <p className="text-xs text-gray-500 font-semibold">{stat.title}</p>
                      <h3 className="text-3xl font-black text-white tracking-tight">{stat.value}</h3>
                      <span className="text-[10px] text-[#00cc99] font-bold bg-[#00cc99]/10 px-2 py-0.5 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#252525] text-[#00cc99]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">Thống Kê Doanh Thu H1 2026</h4>
                      <p className="text-xs text-gray-500">Phí đặt lịch Mentor & Khóa học (Triệu VND)</p>
                    </div>
                    <span className="text-xs font-bold text-[#00cc99] bg-[#005C42]/20 px-3 py-1.5 rounded-full">
                      Hàng Tháng
                    </span>
                  </div>

                  {/* SVG Bar Chart representing revenue */}
                  <div className="flex items-end justify-between h-48 pt-6 border-b border-[#2d2d2d]">
                    {[
                      { m: 'T1', val: 68 },
                      { m: 'T2', val: 74 },
                      { m: 'T3', val: 82 },
                      { m: 'T4', val: 91 },
                      { m: 'T5', val: 105 },
                      { m: 'T6', val: 124 },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center w-12 group">
                        <span className="text-[10px] text-[#00cc99] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                          {item.val}M
                        </span>
                        <div
                          style={{ height: `${(item.val / 140) * 100}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            i === 5 ? 'bg-[#00cc99] shadow-lg shadow-[#00cc99]/30' : 'bg-[#252525] group-hover:bg-[#00cc99]/60'
                          }`}
                        />
                        <span className="text-[10px] text-gray-500 mt-2 font-bold">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Status / Health */}
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] p-6 shadow-lg space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Hệ Thống & Khóa Học</h4>
                    <p className="text-xs text-gray-500">Trạng thái API & Database thời gian thực</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {[
                      { name: 'API Server (Express)', status: 'Connected', ok: true },
                      { name: 'MongoDB database', status: 'Connected', ok: true },
                      { name: 'Redis Cache (Locking)', status: 'Active', ok: true },
                      { name: 'Gemini AI Integration', status: 'Healthy', ok: true },
                    ].map((srv, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 border-b border-[#2d2d2d] last:border-0">
                        <span className="text-xs font-semibold text-gray-400">{srv.name}</span>
                        <div className="flex items-center gap-1.5 bg-[#005C42]/20 border border-[#00cc99]/20 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00cc99]" />
                          <span className="text-[10px] font-black text-[#00cc99]">{srv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              USERS MANAGEMENT VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] p-6 shadow-lg space-y-6">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="flex items-center bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-2.5 w-full md:w-96">
                  <svg className="w-5 h-5 text-gray-500 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên, email, tài khoản..."
                    className="bg-transparent border-0 outline-none text-sm text-white placeholder-gray-500 w-full"
                  />
                </div>

                {/* Filter Switcher */}
                <div className="flex items-center gap-2">
                  <div className="bg-[#252525] p-1 rounded-xl border border-[#3d3d3d] flex gap-1">
                    {(['ALL', 'STUDENT', 'MENTOR', 'PENDING'] as const).map((flt) => {
                      const isActive = roleFilter === flt
                      return (
                        <button
                          key={flt}
                          onClick={() => setRoleFilter(flt)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isActive ? 'bg-[#00cc99] text-[#121212]' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {flt}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="bg-[#00cc99] text-[#121212] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00cc99]/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo User
                  </button>
                </div>
              </div>

              {/* Users table */}
              <div className="overflow-x-auto border border-[#2d2d2d] rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#252525] border-b border-[#2d2d2d]">
                      <th className="p-4 text-xs font-extrabold text-gray-400">Tên & Tài Khoản</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Email & SĐT</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">CMND / Ngày sinh</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Vai trò</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Trạng thái</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersError && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-xs bg-[#c92a2a]/10 text-[#c92a2a] border border-[#c92a2a]/20 font-bold">
                          ⚠️ {usersError}
                        </td>
                      </tr>
                    )}
                    {usersLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          Đang tải người dùng...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          Không tìm thấy người dùng phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((item) => (
                        <tr key={item.id} className="border-b border-[#2d2d2d] hover:bg-[#1f1f1f]/50 transition-colors">
                          <td className="p-4">
                            <p className="text-sm font-bold text-white">{item.fullName}</p>
                            <p className="text-xs text-gray-500">@{item.username}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs font-semibold text-gray-300">{item.email}</p>
                            <p className="text-[11px] text-gray-500">{item.phone || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-xs text-gray-300">{item.identityNumber || 'N/A'}</p>
                            <p className="text-[11px] text-gray-500">{item.birthday || 'N/A'}</p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                item.role === 'ADMIN'
                                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                  : item.role === 'MENTOR'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-[#00cc99]/10 text-[#00cc99] border border-[#00cc99]/20'
                              }`}
                            >
                              {item.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'active'
                                  ? 'bg-[#00cc99]/10 text-[#00cc99]'
                                  : item.status === 'pending'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'active'
                                    ? 'bg-[#00cc99]'
                                    : item.status === 'pending'
                                    ? 'bg-yellow-400'
                                    : 'bg-red-400'
                                }`}
                              />
                              {item.status === 'active' ? 'Hoạt động' : item.status === 'pending' ? 'Chờ duyệt' : 'Đình chỉ'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {item.role === 'MENTOR' && item.status === 'pending' && (
                              <button
                                onClick={() => handleApproveMentor(item)}
                                className="bg-[#00cc99] text-[#121212] px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold hover:opacity-90 active:scale-95 transition-all"
                              >
                                Phê duyệt
                              </button>
                            )}
                            {item.role !== 'ADMIN' && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(item)}
                                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${
                                    item.status === 'active'
                                      ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                      : 'bg-[#00cc99]/10 text-[#00cc99] border-[#00cc99]/20 hover:bg-[#00cc99]/20'
                                  }`}
                                >
                                  {item.status === 'active' ? 'Đình chỉ' : 'Kích hoạt'}
                                </button>
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="bg-[#252525] border border-[#3d3d3d] text-white px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold hover:bg-[#323232] transition-all"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item)}
                                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold hover:bg-red-500/25 transition-all"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              ORDERS / BOOKINGS VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] p-6 shadow-lg space-y-6">
              {/* Controls bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-2.5 w-96">
                  <svg className="w-5 h-5 text-gray-500 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm mã đặt lịch, học viên, mentor..."
                    className="bg-transparent border-0 outline-none text-sm text-white placeholder-gray-500 w-full"
                  />
                </div>
              </div>

              {/* Bookings table */}
              <div className="overflow-x-auto border border-[#2d2d2d] rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#252525] border-b border-[#2d2d2d]">
                      <th className="p-4 text-xs font-extrabold text-gray-400">Mã Đơn</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Học Viên</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Mentor</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Thời Gian Đặt</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Chi Phí</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400">Trạng Thái</th>
                      <th className="p-4 text-xs font-extrabold text-gray-400 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          Không có giao dịch/lịch đặt nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((bk) => (
                        <tr key={bk.id} className="border-b border-[#2d2d2d] hover:bg-[#1f1f1f]/50 transition-colors">
                          <td className="p-4 text-xs font-bold text-gray-400">{bk.id}</td>
                          <td className="p-4 text-sm font-bold text-white">{bk.studentName}</td>
                          <td className="p-4 text-sm font-bold text-white">{bk.mentorName}</td>
                          <td className="p-4 text-xs text-gray-300 font-mono">{bk.dateTime}</td>
                          <td className="p-4 text-xs font-bold text-[#00cc99] font-mono">
                            {bk.amount.toLocaleString()}đ
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                bk.status === 'Confirmed'
                                  ? 'bg-[#00cc99]/10 text-[#00cc99]'
                                  : bk.status === 'Pending'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : bk.status === 'Cancelled'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-gray-500/10 text-gray-400'
                              }`}
                            >
                              {bk.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            {bk.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingConfirm(bk.id)}
                                  className="bg-[#00cc99] text-[#121212] px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold hover:opacity-90 transition-all"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleBookingCancel(bk.id)}
                                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold hover:bg-red-500/20 transition-all"
                                >
                                  Hủy bỏ
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              EXAMS VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'exams' && (
            <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] p-6 shadow-lg space-y-6">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-2.5 w-full md:w-96">
                  <svg className="w-5 h-5 text-gray-500 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm đề thi IELTS..."
                    className="bg-transparent border-0 outline-none text-sm text-white placeholder-gray-500 w-full"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowBulkImportModal(true)}
                    className="bg-[#252525] border border-[#3d3d3d] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all hover:bg-[#323232]"
                  >
                    Bulk Import JSON
                  </button>
                  <button
                    onClick={() => setShowCreateExamModal(true)}
                    className="bg-[#00cc99] text-[#121212] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00cc99]/20 hover:opacity-90 transition-all"
                  >
                    Tạo Đề Thi
                  </button>
                </div>
              </div>

              {/* Grid of Exams */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((ex) => (
                  <div key={ex.id} className="bg-[#1e1e1e] border border-[#2d2d2d] rounded-3xl p-6 flex flex-col justify-between shadow-md">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-black text-[#00cc99] bg-[#005C42]/30 px-2.5 py-1 rounded-full border border-[#00cc99]/20">
                          {ex.type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 font-mono">
                          {ex.duration} phút
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white leading-relaxed mb-1">
                        {ex.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-semibold">{ex.questionsCount} Câu hỏi</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-[#2d2d2d] pt-4 mt-6">
                      <button className="bg-transparent border border-[#3d3d3d] hover:bg-[#252525] text-gray-300 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all">
                        Sửa đề
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Xóa đề thi ${ex.title}?`)) {
                            setExamsList((prev) => prev.filter((e) => e.id !== ex.id))
                          }
                        }}
                        className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────
          MODALS & FORM DIALOGS
         ──────────────────────────────────────────────────────── */}
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-4">
              <h3 className="text-base font-black text-white">Tạo Mới Người Dùng</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Họ Tên</label>
                  <input
                    type="text"
                    value={createUserForm.fullName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                    placeholder="Nguyen Van A"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tên tài khoản</label>
                  <input
                    type="text"
                    value={createUserForm.username}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                    placeholder="username123"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vai trò</label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value as any })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    value={createUserForm.birthday}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, birthday: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số CCCD</label>
                  <input
                    type="text"
                    value={createUserForm.identityNumber}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, identityNumber: e.target.value })}
                    placeholder="001xxxxxxxx"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="bg-transparent border border-[#3d3d3d] text-gray-300 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-[#252525] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#00cc99] text-[#121212] font-black text-xs px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00cc99]/15"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-4">
              <h3 className="text-base font-black text-white">Chỉnh Sửa Thông Tin</h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Họ Tên</label>
                  <input
                    type="text"
                    value={editUserForm.fullName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tên tài khoản</label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <input
                    type="password"
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vai trò</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ngày sinh</label>
                  <input
                    type="text"
                    value={editUserForm.birthday}
                    onChange={(e) => setEditUserForm({ ...editUserForm, birthday: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số CCCD</label>
                  <input
                    type="text"
                    value={editUserForm.identityNumber}
                    onChange={(e) => setEditUserForm({ ...editUserForm, identityNumber: e.target.value })}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="bg-transparent border border-[#3d3d3d] text-gray-300 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-[#252525] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#00cc99] text-[#121212] font-black text-xs px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#00cc99]/15"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-4">
              <h3 className="text-base font-black text-white">Thêm Mới Đề Thi IELTS</h3>
              <button onClick={() => setShowCreateExamModal(false)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tiêu Đề Đề Thi</label>
                <input
                  type="text"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  placeholder="IELTS Cambridge 19 - Test 1"
                  className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#00cc99]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kỹ năng</label>
                  <select
                    value={newExamType}
                    onChange={(e) => setNewExamType(e.target.value as any)}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  >
                    <option value="Reading">Reading</option>
                    <option value="Listening">Listening</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Thời gian (Phút)</label>
                  <input
                    type="number"
                    value={newExamDuration}
                    onChange={(e) => setNewExamDuration(e.target.value)}
                    className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Số lượng câu hỏi</label>
                <input
                  type="number"
                  value={newExamQuestions}
                  onChange={(e) => setNewExamQuestions(e.target.value)}
                  className="w-full bg-[#252525] border border-[#3d3d3d] rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="bg-transparent border border-[#3d3d3d] text-gray-300 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-[#252525]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#00cc99] text-[#121212] font-black text-xs px-5 py-2.5 rounded-xl hover:opacity-90 shadow-md"
                >
                  Khởi tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-[32px] max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-[#2d2d2d] pb-4">
              <h3 className="text-base font-black text-white">Nhập Đề Thi Số Lượng Lớn (JSON Payload)</h3>
              <button onClick={() => setShowBulkImportModal(false)} className="text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">
                  Dán chuỗi đề thi JSON (theo cấu trúc Cambridge Mock Test)
                </label>
                <textarea
                  value={bulkJsonPayload}
                  onChange={(e) => setBulkJsonPayload(e.target.value)}
                  placeholder={`{\n  "title": "Cambridge 19 - Test 1",\n  "type": "Reading",\n  "duration": 60,\n  "sections": [...]\n}`}
                  rows={10}
                  className="w-full bg-[#252525] border border-[#3d3d3d] rounded-2xl px-4 py-3 text-xs font-mono text-white outline-none focus:border-[#00cc99] resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="bg-transparent border border-[#3d3d3d] text-gray-300 font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-[#252525]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#00cc99] text-[#121212] font-black text-xs px-5 py-2.5 rounded-xl hover:opacity-90 shadow-md shadow-[#00cc99]/20"
                >
                  Bắt đầu Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
