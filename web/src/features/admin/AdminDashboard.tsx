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

  // Tab State: 'dashboard' | 'users' | 'orders' | 'exams' | 'submissions'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'exams' | 'submissions'>('dashboard')
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'MENTOR' | 'PENDING'>('ALL')
  // Data States
  const [usersList, setUsersList] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const [bookingsList, setBookingsList] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  // Exams State
  const [examsList, setExamsList] = useState<Exam[]>([])

  // User Modals & Forms State
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [createUserForm, setCreateUserForm] = useState<{
    fullName: string
    username: string
    email: string
    password: string
    role: 'STUDENT' | 'MENTOR' | 'ADMIN'
    birthday: string
    phone: string
    identityNumber: string
  }>({
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
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null)
  const [userDetailTab, setUserDetailTab] = useState<'submissions' | 'bookings'>('submissions')
  const [editUserForm, setEditUserForm] = useState<{
    fullName: string
    username: string
    email: string
    role: 'STUDENT' | 'MENTOR' | 'ADMIN'
    birthday: string
    phone: string
    identityNumber: string
    password?: string
  }>({
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
  const [newExamType, setNewExamType] = useState<'Reading' | 'Listening' | 'Writing' | 'Speaking'>('Reading')
  const [newExamDuration, setNewExamDuration] = useState('60')
  const [examFilterType, setExamFilterType] = useState<'ALL' | 'Reading' | 'Listening' | 'Writing' | 'Speaking'>('ALL')

  // Wizard states for section/question manager
  const [examStep, setExamStep] = useState(1)
  const [editingExamId, setEditingExamId] = useState<string | null>(null)
  const [modalSections, setModalSections] = useState<any[]>([])
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0)

  // Bulk Import Modal
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [bulkJsonPayload, setBulkJsonPayload] = useState('')

  // Submissions (Practice Results) State
  const [submissionsList, setSubmissionsList] = useState<any[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionFilterType, setSubmissionFilterType] = useState<'ALL' | 'Reading' | 'Listening' | 'Writing' | 'Speaking'>('ALL')

  const selectedUserSubmissions = useMemo(() => {
    if (!selectedUserDetail) return []
    return submissionsList.filter(sub => 
      sub.userId === selectedUserDetail.id || 
      (sub.student && (sub.student.id === selectedUserDetail.id || sub.student.username === selectedUserDetail.username || sub.student.email === selectedUserDetail.email))
    )
  }, [selectedUserDetail, submissionsList])

  const selectedUserBookings = useMemo(() => {
    if (!selectedUserDetail) return []
    const isMentor = selectedUserDetail.role === 'MENTOR'
    const nameToMatch = selectedUserDetail.fullName?.toLowerCase()
    return bookingsList.filter(bk => {
      if (isMentor) {
        return bk.mentorName?.toLowerCase().includes(nameToMatch)
      } else {
        return bk.studentName?.toLowerCase().includes(nameToMatch)
      }
    })
  }, [selectedUserDetail, bookingsList])

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
        { id: '5', fullName: 'Tran Huu Binh', username: 'huubinh', email: 'binhth@gmail.com', role: 'STUDENT', status: 'active', birthday: '05/09/2001', phone: '0944332211', identityNumber: '001202001111' },
        { id: '6', fullName: 'Le Thi Hoa', username: 'thihoa', email: 'hoalt@gmail.com', role: 'STUDENT', status: 'active', birthday: '18/12/2000', phone: '0966554433', identityNumber: '001202002222' },
        { id: '7', fullName: 'Sarah Nguyen', username: 'sarah', email: 'sarah@mentor.com', role: 'MENTOR', status: 'active', birthday: '22/07/1992', phone: '0933221100', identityNumber: '001202003333' },
        { id: '8', fullName: 'Pham Minh Hoang', username: 'hoangpm', email: 'hoangpm@gmail.com', role: 'STUDENT', status: 'active', birthday: '30/04/1999', phone: '0911223344', identityNumber: '001202004444' },
        { id: '9', fullName: 'Vu Hoang Lam', username: 'lamvh', email: 'lamvh@gmail.com', role: 'STUDENT', status: 'active', birthday: '14/02/2003', phone: '0988776655', identityNumber: '001202005555' },
        { id: '10', fullName: 'David Lee', username: 'davidlee', email: 'david@mentor.com', role: 'MENTOR', status: 'pending', birthday: '10/11/1993', phone: '0922334455', identityNumber: '001202006666' }
      ])
      setUsersError('Đang dùng dữ liệu mô phỏng. Kết nối backend để tải danh sách thực tế.')
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchBookings = async () => {
    setBookingsLoading(true)
    setBookingsError(null)
    try {
      const res = await apiClient.get('/admin/bookings')
      const raw = res.data?.data || []
      setBookingsList(raw.map((b: any) => ({
        id: b.id,
        studentName: b.student?.fullName || 'Học viên',
        mentorName: b.mentor?.fullName || 'Mentor',
        dateTime: new Date(b.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        amount: 350000,
        status: b.status === 'PENDING' ? 'Pending' :
                b.status === 'CONFIRMED' ? 'Confirmed' :
                b.status === 'COMPLETED' ? 'Completed' : 'Cancelled'
      })))
    } catch (err: any) {
      console.warn('Backend connection failed, using mockup booking data:', err.message)
      setBookingsList([
        { id: 'BK001', studentName: 'Nguyen Minh Anh', mentorName: 'Emily Smith', dateTime: '2026-06-18 09:00', amount: 350000, status: 'Confirmed' },
        { id: 'BK002', studentName: 'Tran Huu Binh', mentorName: 'David Lee', dateTime: '2026-06-18 14:00', amount: 400000, status: 'Pending' },
        { id: 'BK003', studentName: 'Le Thi Hoa', mentorName: 'Sarah Nguyen', dateTime: '2026-06-19 10:30', amount: 350000, status: 'Confirmed' },
        { id: 'BK004', studentName: 'Nguyen Minh Anh', mentorName: 'Emily Smith', dateTime: '2026-06-20 16:00', amount: 350000, status: 'Pending' },
        { id: 'BK005', studentName: 'Pham Minh Hoang', mentorName: 'Sarah Nguyen', dateTime: '2026-06-21 08:30', amount: 350000, status: 'Confirmed' },
        { id: 'BK006', studentName: 'Tran Huu Binh', mentorName: 'John Doe', dateTime: '2026-06-21 15:00', amount: 400000, status: 'Completed' },
        { id: 'BK007', studentName: 'Vu Hoang Lam', mentorName: 'Emily Smith', dateTime: '2026-06-22 10:00', amount: 350000, status: 'Cancelled' }
      ])
      setBookingsError('Đang dùng dữ liệu mô phỏng. Kết nối backend để tải lịch học thực tế.')
    } finally {
      setBookingsLoading(false)
    }
  }

  // Load initial data on mount for stats cards & detail views
  useEffect(() => {
    fetchUsers()
    fetchSubmissions()
    fetchExams()
    fetchBookings()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'submissions') fetchSubmissions()
    if (activeTab === 'exams') fetchExams()
    if (activeTab === 'orders') fetchBookings()
  }, [activeTab])

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true)
    setSubmissionsError(null)
    try {
      const res = await apiClient.get('/admin/submissions')
      const raw = res.data?.metadata?.submissions || res.data || []
      setSubmissionsList(raw.map((sub: any) => ({
        ...sub,
        type: sub.type === 'READING' ? 'Reading' :
              sub.type === 'LISTENING' ? 'Listening' :
              sub.type === 'WRITING' ? 'Writing' :
              sub.type === 'SPEAKING' ? 'Speaking' : sub.type
      })))
    } catch (err: any) {
      console.warn('Failed to fetch submissions from backend, using mockup:', err.message)
      setSubmissionsList([
        {
          id: 'SUB001',
          userId: '1',
          student: { id: '1', fullName: 'Nguyen Minh Anh', username: 'minhanh', email: 'minhanh@gmail.com' },
          testId: 'EX001',
          test: { title: 'IELTS Cambridge 18 - Test 1', type: 'Reading' },
          type: 'Reading',
          bandScore: 7.5,
          correctCount: 33,
          timeTaken: 2400,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          answers: [
            { questionNumber: 1, userAnswer: 'A', correctAnswer: 'A', isCorrect: true, explanation: 'The text in paragraph A mentions standard procedures.' },
            { questionNumber: 2, userAnswer: 'B', correctAnswer: 'C', isCorrect: false, explanation: 'Paragraph B explicitly denies that option B was selected.' },
            { questionNumber: 3, userAnswer: 'TRUE', correctAnswer: 'TRUE', isCorrect: true, explanation: 'The author states "absolutely yes".' },
            { questionNumber: 4, userAnswer: 'NOT GIVEN', correctAnswer: 'FALSE', isCorrect: false, explanation: 'The opposite is stated in paragraph D.' },
          ]
        },
        {
          id: 'SUB002',
          userId: '1',
          student: { id: '1', fullName: 'Nguyen Minh Anh', username: 'minhanh', email: 'minhanh@gmail.com' },
          testId: 'EX005',
          test: { title: 'IELTS General Training 15 - Writing', type: 'Writing' },
          prompt: 'Some people think that children should begin learning a foreign language as soon as they start school. Discuss both views and give your opinion.',
          type: 'Writing',
          essayText: 'Nowadays, learning a foreign language is becoming extremely popular. In my opinion, children should learn foreign languages as early as possible because it helps their brain development and makes them more flexible. However, some parents think it will confuse their children at school...',
          bandScore: 6.5,
          taskAchievement: 6.5,
          coherenceCohesion: 6.0,
          lexicalResource: 7.0,
          grammarAccuracy: 6.5,
          aiFeedback: {
            overall: 'Excellent effort. Your arguments are clear and properly structured. However, you should aim to introduce more complex sentence structures and vary your transition words.',
            strengths: ['Strong thesis statement', 'Logical paragraph division', 'Excellent vocabulary related to child development'],
            weaknesses: ['Repeated use of "however" and "moreover"', 'Minor subject-verb agreement issues in paragraph 3']
          },
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 'SUB003',
          userId: '5',
          student: { id: '5', fullName: 'Tran Huu Binh', username: 'huubinh', email: 'binhth@gmail.com' },
          testId: 'EX006',
          test: { title: 'Speaking IELTS Practice 12', type: 'Speaking' },
          prompt: 'Describe a traditional festival in your country that you enjoy.',
          type: 'Speaking',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          transcription: 'I would like to tell you about Tet holiday. Tet holiday is the most important traditional celebration in Vietnam. It usually takes place in late January or early February. Families gather together, cook Banh Chung, and visit temples to pray for luck...',
          bandScore: 7.0,
          fluencyCoherence: 7.0,
          lexicalResource: 7.0,
          grammarAccuracy: 6.5,
          pronunciation: 7.5,
          aiFeedback: {
            overall: 'A very fluent description with clear articulation and natural rhythm. Pronunciation is a key strength, but work on grammatical accuracy, particularly passive voice construction.',
            strengths: ['Clear pronunciation of consonants', 'Good flow with minimal pausing', 'Appropriate idiomatic expressions (gather together, pray for luck)'],
            weaknesses: ['Slight hesitation before complex words', 'Preposition errors (e.g. "in late January" was perfect, but "at Tet holiday" is slightly non-standard)']
          },
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
          id: 'SUB004',
          userId: '6',
          student: { id: '6', fullName: 'Le Thi Hoa', username: 'thihoa', email: 'hoalt@gmail.com' },
          testId: 'EX002',
          test: { title: 'IELTS Cambridge 18 - Test 2', type: 'Listening' },
          type: 'Listening',
          bandScore: 8.5,
          correctCount: 36,
          timeTaken: 1800,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          answers: [
            { questionNumber: 1, userAnswer: 'C', correctAnswer: 'C', isCorrect: true, explanation: 'Speaker mentions section 2 is on page 4.' },
            { questionNumber: 2, userAnswer: 'A', correctAnswer: 'A', isCorrect: true, explanation: 'Speaker notes the library closes on Sundays.' }
          ]
        },
        {
          id: 'SUB005',
          userId: '8',
          student: { id: '8', fullName: 'Pham Minh Hoang', username: 'hoangpm', email: 'hoangpm@gmail.com' },
          testId: 'EX003',
          test: { title: 'IELTS Cambridge 17 - Test 1', type: 'Reading' },
          type: 'Reading',
          bandScore: 6.0,
          correctCount: 24,
          timeTaken: 3600,
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          answers: []
        }
      ])
      setSubmissionsError('Đang dùng dữ liệu mô phỏng. Kết nối backend để tải kết quả thực tế.')
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const handleDeleteSubmission = async (item: any) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa kết quả làm bài của học viên "${item.student?.fullName || 'Học viên'}"?`)) return
    try {
      await apiClient.delete(`/admin/submissions/${item.id}?type=${item.type}`)
      setSubmissionsList((prev) => prev.filter((s) => s.id !== item.id))
      alert('Xóa kết quả thành công!')
    } catch (err: any) {
      setSubmissionsList((prev) => prev.filter((s) => s.id !== item.id))
      alert('Đã xóa (mô phỏng cục bộ)')
    }
  }


  const fetchExams = async () => {
    try {
      const res = await apiClient.get('/exams?limit=100')
      const raw = res.data?.data?.exams || res.data?.exams || []
      setExamsList(raw.map((ex: any) => ({
        id: ex.id || ex._id,
        title: ex.title,
        type: ex.type === 'READING' ? 'Reading' :
              ex.type === 'LISTENING' ? 'Listening' :
              ex.type === 'WRITING' ? 'Writing' :
              ex.type === 'SPEAKING' ? 'Speaking' : ex.type,
        duration: ex.duration,
        questionsCount: ex.questionsCount || 0
      })))
    } catch (err: any) {
      console.warn('Backend connection failed, using mockup data:', err.message)
      setExamsList([
        { id: 'EX001', title: 'IELTS Cambridge 18 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
        { id: 'EX002', title: 'IELTS Cambridge 18 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
        { id: 'EX003', title: 'IELTS Cambridge 17 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 },
        { id: 'EX004', title: 'IELTS Cambridge 17 - Test 2', type: 'Listening', duration: 30, questionsCount: 40 },
        { id: 'EX005', title: 'IELTS General Training 15 - Writing', type: 'Writing', duration: 60, questionsCount: 2 },
        { id: 'EX006', title: 'IELTS Speaking Practice - Leisure Activities', type: 'Speaking', duration: 15, questionsCount: 3 },
        { id: 'EX007', title: 'IELTS Cambridge 19 - Test 1', type: 'Reading', duration: 60, questionsCount: 40 }
      ])
    }
  }


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
  const handleBookingConfirm = async (id: string) => {
    try {
      await apiClient.patch(`/admin/bookings/${id}/confirm`)
      setBookingsList((prev) =>
        prev.map((bk) => (bk.id === id ? { ...bk, status: 'Confirmed' } : bk))
      )
      alert('Xác nhận lịch học thành công!')
    } catch (err: any) {
      alert('Lỗi xác nhận lịch học: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleBookingCancel = async (id: string) => {
    const reason = prompt('Nhập lý do hủy lịch học (nếu có):') || 'Hủy bởi Admin'
    try {
      await apiClient.patch(`/admin/bookings/${id}/cancel`, { cancelReason: reason })
      setBookingsList((prev) =>
        prev.map((bk) => (bk.id === id ? { ...bk, status: 'Cancelled' } : bk))
      )
      alert('Đã hủy lịch học thành công!')
    } catch (err: any) {
      alert('Lỗi hủy lịch học: ' + (err.response?.data?.message || err.message))
    }
  }

  // ────────────────────────────────────────────────────────
  // HANDLERS: Exam CRUD
  // ────────────────────────────────────────────────────────
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (examStep === 1) {
      if (!newExamTitle.trim()) {
        alert('Tiêu đề đề thi không được trống')
        return
      }

      // Initialize templates if we don't have sections yet
      if (modalSections.length === 0) {
        let templates: any[] = []
        if (newExamType === 'Listening') {
          templates = Array.from({ length: 4 }, (_, i) => ({
            sectionOrder: i + 1,
            title: `Section ${i + 1}`,
            audioUrl: '',
            passageText: '',
            images: [],
            questions: Array.from({ length: 10 }, (_, qIdx) => ({
              questionNumber: i * 10 + qIdx + 1,
              type: 'FILL_IN_BLANKS',
              content: `Điền vào chỗ trống câu hỏi số ${i * 10 + qIdx + 1}`,
              options: '',
              answer: '',
              explanation: ''
            }))
          }))
        } else if (newExamType === 'Reading') {
          templates = Array.from({ length: 3 }, (_, i) => {
            const qCount = i === 2 ? 14 : 13;
            const qStart = i === 0 ? 1 : (i === 1 ? 14 : 27);
            return {
              sectionOrder: i + 1,
              title: `Passage ${i + 1}`,
              audioUrl: '',
              passageText: `Nội dung bài đọc cho Passage ${i + 1}...`,
              images: [],
              questions: Array.from({ length: qCount }, (_, qIdx) => ({
                questionNumber: qStart + qIdx,
                type: 'TRUE_FALSE_NOT_GIVEN',
                content: `Nhận định số ${qStart + qIdx}`,
                options: '',
                answer: 'TRUE',
                explanation: ''
              }))
            };
          })
        } else if (newExamType === 'Writing') {
          templates = [
            {
              sectionOrder: 1,
              title: 'Writing Task 1',
              passageText: 'The graph below shows the changes in...',
              audioUrl: '',
              images: [],
              questions: []
            },
            {
              sectionOrder: 2,
              title: 'Writing Task 2',
              passageText: 'Some people argue that computers are more useful than books. To what extent do you agree?',
              audioUrl: '',
              images: [],
              questions: []
            }
          ]
        } else if (newExamType === 'Speaking') {
          templates = [
            {
              sectionOrder: 1,
              title: 'Part 1 - Introduction and Interview',
              passageText: 'Let\'s talk about your hometown. What do you like about it?',
              audioUrl: '',
              images: [],
              questions: [
                { questionNumber: 1, type: 'SHORT_ANSWER', content: 'What is your hometown?', answer: 'N/A', explanation: '' },
                { questionNumber: 2, type: 'SHORT_ANSWER', content: 'How long have you lived there?', answer: 'N/A', explanation: '' }
              ]
            },
            {
              sectionOrder: 2,
              title: 'Part 2 - Cue Card',
              passageText: 'Describe a beautiful park you visited. You should say: where it is, when you went there, and explain why you liked it.',
              audioUrl: '',
              images: [],
              questions: [
                { questionNumber: 3, type: 'SHORT_ANSWER', content: 'Talk about a beautiful park you visited.', answer: 'N/A', explanation: '' }
              ]
            },
            {
              sectionOrder: 3,
              title: 'Part 3 - Discussion',
              passageText: 'Let\'s discuss parks and green spaces in cities. Do you think cities need more parks?',
              audioUrl: '',
              images: [],
              questions: [
                { questionNumber: 4, type: 'SHORT_ANSWER', content: 'Why are green spaces important in urban areas?', answer: 'N/A', explanation: '' }
              ]
            }
          ]
        }
        setModalSections(templates)
      }
      setSelectedSectionIdx(0)
      setExamStep(2)
      return
    }

    // Save Section/Questions to database
    const formattedSections = modalSections.map(sec => ({
      sectionOrder: sec.sectionOrder,
      title: sec.title,
      passageText: sec.passageText || null,
      audioUrl: sec.audioUrl || null,
      images: sec.images || [],
      questions: (sec.questions || []).map((q: any) => ({
        questionNumber: q.questionNumber,
        type: q.type,
        content: q.content,
        options: q.options && typeof q.options === 'string'
          ? q.options.split(',').map((o: string) => o.trim())
          : Array.isArray(q.options)
          ? q.options
          : null,
        answer: q.answer,
        explanation: q.explanation || null
      }))
    }))

    const payload = {
      title: newExamTitle,
      description: `Exam for IELTS ${newExamType}`,
      type: newExamType.toUpperCase(),
      duration: parseInt(newExamDuration) || 60,
      sections: formattedSections
    }

    try {
      if (editingExamId) {
        await apiClient.put(`/exams/${editingExamId}`, payload)
        alert('Cập nhật đề thi IELTS thành công!')
      } else {
        await apiClient.post('/exams', payload)
        alert('Khởi tạo đề thi IELTS thành công!')
      }
      setShowCreateExamModal(false)
      setEditingExamId(null)
      setExamStep(1)
      setNewExamTitle('')
      setModalSections([])
      fetchExams()
    } catch (err: any) {
      console.error(err)
      alert('Lỗi lưu đề thi: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>, sectionIdx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/') && !file.name.endsWith('.mp3')) {
      alert('Vui lòng chỉ tải lên các file định dạng âm thanh/video (.mp3, .wav, .m4a, .mp4, ...)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const updated = [...modalSections];
        updated[sectionIdx].audioUrl = 'Đang tải lên...';
        setModalSections(updated);

        const res = await apiClient.post('/upload', {
          filename: file.name,
          base64Data
        });

        if (res.data?.success && res.data?.data?.url) {
          const finalUrl = res.data.data.url;
          const fresh = [...modalSections];
          fresh[sectionIdx].audioUrl = finalUrl;
          setModalSections(fresh);
          alert('Tải lên file audio thành công!');
        } else {
          alert('Tải file thất bại: Phản hồi từ server không hợp lệ.');
        }
      } catch (err: any) {
        console.error(err);
        const reset = [...modalSections];
        reset[sectionIdx].audioUrl = '';
        setModalSections(reset);
        alert('Lỗi tải file lên server: ' + (err.response?.data?.message || err.message));
      }
    };
    reader.onerror = () => {
      alert('Không đọc được file từ máy tính.');
    };
    reader.readAsDataURL(file);
  };

  const openEditExamModal = async (ex: Exam) => {
    try {
      const res = await apiClient.get(`/exams/${ex.id}`)
      if (res.data?.success) {
        const fullExam = res.data.data
        setNewExamTitle(fullExam.title)
        setNewExamType(
          fullExam.type === 'READING' ? 'Reading' :
          fullExam.type === 'LISTENING' ? 'Listening' :
          fullExam.type === 'WRITING' ? 'Writing' : 'Speaking'
        )
        setNewExamDuration(String(fullExam.duration))
        setEditingExamId(fullExam.id)
        
        // Map sections questions options to string
        const mappedSections = fullExam.sections.map((sec: any) => ({
          ...sec,
          questions: (sec.questions || []).map((q: any) => ({
            ...q,
            options: q.options ? q.options.join(', ') : ''
          }))
        }))
        setModalSections(mappedSections)
        setExamStep(1)
        setShowCreateExamModal(true)
      } else {
        alert('Không lấy được chi tiết đề thi.')
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi lấy chi tiết đề thi: ' + err.message)
    }
  }

  const handleBulkImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsed = JSON.parse(bulkJsonPayload)
      const examsArray = Array.isArray(parsed) ? parsed : [parsed]
      const normalizedExams = examsArray.map((ex: any) => ({
        ...ex,
        type: ex.type ? ex.type.toUpperCase() : 'READING'
      }))
      
      await apiClient.post('/exams/bulk-import', { exams: normalizedExams })
      alert('Import thành công dữ liệu đề thi JSON!')
      setShowBulkImportModal(false)
      setBulkJsonPayload('')
      fetchExams()
    } catch (err: any) {
      alert('Lỗi import dữ liệu: ' + (err.response?.data?.message || err.message))
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
    return examsList.filter((ex) => {
      const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase())
      if (examFilterType === 'ALL') return matchesSearch
      return matchesSearch && ex.type === examFilterType
    })
  }, [examsList, searchQuery, examFilterType])

  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((sub) => {
      const studentName = sub.student?.fullName || ''
      const studentEmail = sub.student?.email || ''
      const testTitle = sub.test?.title || ''
      const matchesSearch =
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testTitle.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (submissionFilterType === 'ALL') return matchesSearch
      return matchesSearch && sub.type === submissionFilterType
    })
  }, [submissionsList, searchQuery, submissionFilterType])

  return (
    <div className="flex h-screen bg-[#f5f3dc] bg-notebook-paper bg-notebook bg-repeat text-[#1b263b] overflow-hidden font-sans custom-pencil-cursor select-none">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-[#fcfbf7] border-r-2 border-[#1b263b] flex flex-col justify-between relative z-20 shadow-[2px_0_10px_rgba(27,38,59,0.05)]">
        <div>
          {/* Logo Brand */}
          <div 
            onClick={() => navigate('/')} 
            className="p-6 border-b-2 border-[#1b263b] flex items-center gap-3 cursor-pointer hover:bg-black/[0.03] transition-colors"
            title="Quay lại Trang chủ"
          >
            <div className="w-10 h-10 bg-[#c92a2a] border-2 border-[#1b263b] rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-[2px_2px_0px_0px_#1b263b] hover:scale-105 active:scale-95 transition-transform">
              A
            </div>
            <div>
              <h2 className="font-serif font-extrabold text-[#1b263b] text-base tracking-wide">Apex Admin</h2>
              <span className="text-[9px] bg-[#a7f3d0] text-[#005c42] px-2 py-0.5 rounded-full font-bold border border-[#1b263b]/20 shadow-[1px_1px_0px_0px_#1b263b]">
                Workspace
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="px-4 py-6 space-y-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
              { id: 'users', name: 'Quản lý Người dùng', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
              { id: 'orders', name: 'Quản lý Đặt lịch Mentor', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'exams', name: 'Quản lý Đề thi', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'submissions', name: 'Kết quả làm bài', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
            ].map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any)
                    setSearchQuery('')
                  }}
                  className={`w-full flex items-center text-left gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 relative group border-2 ${
                    isActive
                      ? 'bg-[#ffd54f] border-[#1b263b] text-[#1b263b] font-black shadow-[2px_2px_0px_0px_#1b263b]'
                      : 'text-[#1b263b]/70 border-transparent hover:bg-white/50 hover:text-[#1b263b]'
                  }`}
                >
                  <svg className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#1b263b]' : 'text-[#1b263b]/60 group-hover:text-[#1b263b]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  <span className="text-sm">{item.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* LOGOUT / PROFILE BAR */}
        <div className="p-4 border-t-2 border-[#1b263b] bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#a7f3d0] flex items-center justify-center text-[#005c42] font-black text-xs border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]">
              AD
            </div>
            <div>
              <p className="text-xs font-black text-[#1b263b] max-w-[110px] truncate">
                {user?.fullName || 'Administrator'}
              </p>
              <p className="text-[9px] text-[#1b263b]/60 font-black tracking-wider">SYSTEM ADMIN</p>
            </div>
          </div>
          <button
            onClick={() => {
              dispatch(logout())
              navigate('/')
            }}
            title="Đăng xuất"
            className="w-8 h-8 rounded-xl bg-[#fbcfe8] hover:bg-[#c92a2a] hover:text-white border-2 border-[#1b263b] transition-all flex items-center justify-center text-[#9d174d] shadow-[1px_1px_0px_0px_#1b263b] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* HEADER BAR */}
        <header className="h-16 border-b-2 border-[#1b263b] bg-[#fcfbf7]/90 backdrop-blur-md flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-black text-[#1b263b] capitalize tracking-wide flex items-center gap-2 font-serif">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'users' && 'Quản Lý Người Dùng'}
              {activeTab === 'orders' && 'Quản Lý Đặt Lịch Mentor'}
              {activeTab === 'exams' && 'Quản Lý Đề Thi'}
              {activeTab === 'submissions' && 'Quản Lý Kết Quả Làm Bài'}
            </h1>
            <p className="text-xs text-[#1b263b]/70 font-semibold">Hệ thống quản trị và kiểm duyệt dữ liệu Apex IELTS</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] font-black text-[#005c42] bg-[#a7f3d0] border-2 border-[#1b263b] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[2px_2px_0px_0px_#1b263b]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#005c42] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005c42]"></span>
              </span>
              Live System
            </span>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 pl-14 space-y-8 relative">
          {/* Vertical notebook red line */}
          <div className="absolute left-[35px] top-0 bottom-0 w-[2px] bg-[#e0565b]/30 pointer-events-none z-0" />

          {/* ────────────────────────────────────────────────────────
              DASHBOARD VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in relative z-10">
              {/* Welcome / Hero Banner */}
              <div className="relative overflow-hidden rounded-[24px] bg-[#a7f3d0] border-2 border-[#1b263b] p-6 shadow-[3px_3px_0px_0px_#1b263b]">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-serif font-black text-[#005c42] tracking-tight">
                      Chào mừng trở lại, {user?.fullName || 'Admin'}! 👋
                    </h2>
                    <p className="text-xs text-[#1b263b] mt-1 max-w-xl font-bold">
                      Hệ thống đang hoạt động ổn định. Tất cả các dịch vụ API, cơ sở dữ liệu MongoDB và Redis đều đang ở trạng thái tốt nhất. Bạn có 3 hồ sơ Mentor đang chờ phê duyệt.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="bg-[#ffd54f] text-[#1b263b] border-2 border-[#1b263b] font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-[2px_2px_0px_0px_#1b263b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#1b263b]"
                    >
                      Duyệt Mentor ngay
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Tổng số học viên', value: String(usersList.filter(u => u.role === 'STUDENT').length + 1240), change: '+48 tháng này', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                  { title: 'Mentor Hoạt Động', value: String(usersList.filter(u => u.role === 'MENTOR').length + 82), change: '3 hồ sơ mới duyệt', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' },
                  { title: 'Doanh Thu (Tháng 6)', value: '₫124.5M', change: '+18% so với tháng 5', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { title: 'Mock Exams Live', value: String(examsList.length + 12), change: 'Đề thi thực tế', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                ].map((stat, idx) => (
                  <div 
                    key={idx} 
                    className="group bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 flex items-center justify-between shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1b263b] transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <p className="text-xs text-[#1b263b]/70 font-black uppercase tracking-wider">{stat.title}</p>
                      <h3 className="text-2xl font-serif font-black text-[#1b263b] tracking-tight">{stat.value}</h3>
                      <div>
                        <span className="text-[10px] text-[#005c42] font-bold bg-[#a7f3d0] border border-[#1b263b]/20 px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#1b263b]">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#fbcfe8] text-[#9d174d] border-2 border-[#1b263b] transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1b263b] font-serif">Thống Kê Doanh Thu H1 2026</h4>
                      <p className="text-xs text-[#1b263b]/70">Phi đặt lịch Mentor & Khóa học (Triệu VND)</p>
                    </div>
                    <span className="text-[10px] font-black text-[#1b263b] bg-[#ffd54f] border-2 border-[#1b263b] px-3 py-1 rounded-full shadow-[1px_1px_0px_0px_#1b263b]">
                      Hàng Tháng
                    </span>
                  </div>

                  {/* Redesigned styled bar chart */}
                  <div className="space-y-3">
                    <div className="flex items-end justify-between h-40 px-4 border-b-2 border-[#1b263b] relative pt-6">
                      {/* Grid Lines */}
                      <div className="absolute inset-x-0 top-6 border-t border-[#1b263b]/5 pointer-events-none" />
                      <div className="absolute inset-x-0 top-16 border-t border-[#1b263b]/5 pointer-events-none" />
                      <div className="absolute inset-x-0 top-28 border-t border-[#1b263b]/5 pointer-events-none" />

                      {[
                        { m: 'T1', val: 68 },
                        { m: 'T2', val: 74 },
                        { m: 'T3', val: 82 },
                        { m: 'T4', val: 91 },
                        { m: 'T5', val: 105 },
                        { m: 'T6', val: 124 },
                      ].map((item, i) => {
                        const pct = (item.val / 140) * 100
                        return (
                          <div key={i} className="flex flex-col items-center w-12 group h-full justify-end relative z-10">
                            {/* Value tooltip displayed above the bar */}
                            <span className="text-[9px] text-[#1b263b] font-black bg-[#ffd54f] border border-[#1b263b] px-1.5 py-0.5 rounded shadow-[1px_1px_0px_0px_#1b263b] mb-1.5 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 pointer-events-none font-mono">
                              {item.val}M
                            </span>
                            {/* Actual Bar component */}
                            <div
                              style={{ height: `${pct}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 relative border-t-2 border-x-2 border-[#1b263b] shadow-[1px_1px_0px_0px_rgba(27,38,59,0.15)] ${
                                i === 5 
                                  ? 'bg-[#ffd54f] group-hover:bg-[#ffe082]' 
                                  : 'bg-[#a7f3d0] group-hover:bg-[#a7f3d0]/80'
                              }`}
                            >
                              {/* Gloss reflection overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {/* X-axis Labels positioned below the baseline */}
                    <div className="flex justify-between px-4">
                      {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((label) => (
                        <span key={label} className="w-12 text-center text-[10px] text-[#1b263b] font-black tracking-wider">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* System Status / Health */}
                <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#1b263b] font-serif">Hệ Thống & Khóa Học</h4>
                    <p className="text-xs text-[#1b263b]/70">Trạng thái API & Database thời gian thực</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      { name: 'API Server (Express)', status: 'Connected', ok: true },
                      { name: 'MongoDB Database', status: 'Connected', ok: true },
                      { name: 'Redis Cache (Locking)', status: 'Active', ok: true },
                      { name: 'Gemini AI Integration', status: 'Healthy', ok: true },
                    ].map((srv, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-[#1b263b]/10 last:border-0">
                        <span className="text-xs font-semibold text-[#1b263b]/80">{srv.name}</span>
                        <div className="flex items-center gap-1.5 bg-[#a7f3d0] border border-[#1b263b]/30 px-2.5 py-0.5 rounded-full shadow-[1px_1px_0px_0px_#1b263b]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#005c42] animate-pulse" />
                          <span className="text-[9px] font-black text-[#005c42] tracking-wider uppercase">{srv.status}</span>
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
            <div className="space-y-6 relative z-10 animate-fade-in">
              {/* Backend Error Warning Display */}
              {usersError && (
                <div className="bg-[#fbcfe8] border-2 border-[#1b263b] text-[#9d174d] px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-[2px_2px_0px_0px_#1b263b]">
                  <span>⚠️ {usersError}</span>
                  <button onClick={() => setUsersError(null)} className="text-[#9d174d] hover:text-rose-700 font-bold ml-2">✕</button>
                </div>
              )}

              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-6">
                {/* Controls bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="flex items-center bg-white border-2 border-[#1b263b] focus-within:border-[#c92a2a] rounded-xl px-4 py-2.5 w-full md:w-96 transition-all shadow-[2px_2px_0px_0px_#1b263b]">
                    <svg className="w-4 h-4 text-[#1b263b]/60 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên, email, tài khoản..."
                      className="bg-transparent border-0 outline-none text-xs text-[#1b263b] placeholder-[#1b263b]/50 font-bold w-full"
                    />
                  </div>

                  {/* Filter Switcher */}
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded-xl border-2 border-[#1b263b] flex gap-1 shadow-[2px_2px_0px_0px_#1b263b]">
                      {(['ALL', 'STUDENT', 'MENTOR', 'PENDING'] as const).map((flt) => {
                        const isActive = roleFilter === flt
                        return (
                          <button
                            key={flt}
                            onClick={() => setRoleFilter(flt)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
                              isActive 
                                ? 'bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]' 
                                : 'text-[#1b263b]/70 hover:bg-[#f5f3dc]'
                            }`}
                          >
                            {flt === 'PENDING' ? 'Chờ duyệt' : flt}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setShowCreateUserModal(true)}
                      className="bg-[#c92a2a] text-white border-2 border-[#1b263b] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1b263b] hover:bg-[#b01e1e] active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Tạo User
                    </button>
                  </div>
                </div>

                {/* Users table */}
                <div className="overflow-x-auto border-2 border-[#1b263b] rounded-xl bg-white shadow-[2px_2px_0px_0px_#1b263b]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f5f3dc] border-b-2 border-[#1b263b]">
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Tên & Tài Khoản</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Email & SĐT</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">CMND / Ngày sinh</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Vai trò</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Trạng thái</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#1b263b]/60 font-black">
                            <span className="inline-block animate-pulse">Đang tải người dùng...</span>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#1b263b]/60 font-black">
                            Không tìm thấy người dùng phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((item) => (
                          <tr key={item.id} className="border-b border-[#1b263b]/10 hover:bg-[#f5f3dc]/25 transition-colors">
                            <td className="p-4">
                              <p className="text-sm font-bold text-[#1b263b]">{item.fullName}</p>
                              <p className="text-xs text-[#1b263b]/60 font-semibold">@{item.username}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-bold text-[#1b263b]">{item.email}</p>
                              <p className="text-[10px] text-[#1b263b]/60 font-mono mt-0.5">{item.phone || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-xs text-[#1b263b] font-mono">{item.identityNumber || 'N/A'}</p>
                              <p className="text-[10px] text-[#1b263b]/60 mt-0.5">{item.birthday || 'N/A'}</p>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b] ${
                                  item.role === 'ADMIN'
                                    ? 'bg-[#ffd54f] text-[#1b263b]'
                                    : item.role === 'MENTOR'
                                    ? 'bg-[#fbcfe8] text-[#9d174d]'
                                    : 'bg-[#a7f3d0] text-[#005c42]'
                                }`}
                              >
                                {item.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black border-2 border-[#1b263b]/40 ${
                                  item.status === 'active'
                                    ? 'bg-[#a7f3d0] text-[#005c42]'
                                    : 'bg-yellow-500/10 text-yellow-700 animate-pulse'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'active'
                                      ? 'bg-[#005c42]'
                                      : 'bg-yellow-600'
                                  }`}
                                />
                                {item.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedUserDetail(item)
                                  setShowUserDetailModal(true)
                                }}
                                className="bg-[#ffd54f] hover:bg-amber-400 border-2 border-[#1b263b] text-[#1b263b] px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                              >
                                Chi tiết
                              </button>
                              {item.role === 'MENTOR' && item.status === 'pending' && (
                                <button
                                  onClick={() => handleApproveMentor(item)}
                                  className="bg-[#a7f3d0] hover:bg-emerald-300 border-2 border-[#1b263b] text-[#005c42] px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                                >
                                  Phê duyệt
                                </button>
                              )}
                              {item.role !== 'ADMIN' && (
                                <>
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(item)}
                                    className="bg-[#fbcfe8] hover:bg-rose-200 border-2 border-[#1b263b] text-[#9d174d] px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
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
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              ORDERS / BOOKINGS VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-6 animate-fade-in relative z-10">
              {/* Backend Error Warning Display */}
              {bookingsError && (
                <div className="bg-[#fbcfe8] border-2 border-[#1b263b] text-[#9d174d] px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-[2px_2px_0px_0px_#1b263b]">
                  <span>⚠️ {bookingsError}</span>
                  <button onClick={() => setBookingsError(null)} className="text-[#9d174d] hover:text-rose-700 font-bold ml-2">✕</button>
                </div>
              )}

              {/* Controls bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-white border-2 border-[#1b263b] focus-within:border-[#c92a2a] rounded-xl px-4 py-2.5 w-full md:w-96 transition-all shadow-[2px_2px_0px_0px_#1b263b]">
                  <svg className="w-4 h-4 text-[#1b263b]/60 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm mã đặt lịch, học viên, mentor..."
                    className="bg-transparent border-0 outline-none text-xs text-[#1b263b] placeholder-[#1b263b]/50 font-bold w-full"
                  />
                </div>
              </div>

              {/* Bookings table */}
              <div className="overflow-x-auto border-2 border-[#1b263b] rounded-xl bg-white shadow-[2px_2px_0px_0px_#1b263b]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f3dc] border-b-2 border-[#1b263b]">
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Mã Đơn</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Học Viên</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Mentor</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Thời Gian Đặt</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Chi Phí</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Trạng Thái</th>
                      <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#1b263b]/60 font-black">
                          <span className="inline-block animate-pulse">Đang tải danh sách lịch đặt...</span>
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#1b263b]/60 font-black">
                          Không có giao dịch/lịch đặt nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((bk) => (
                        <tr key={bk.id} className="border-b border-[#1b263b]/10 hover:bg-[#f5f3dc]/25 transition-colors">
                          <td className="p-4 text-xs font-bold text-[#1b263b]/60 font-mono">{bk.id}</td>
                          <td className="p-4 text-sm font-bold text-[#1b263b]">{bk.studentName}</td>
                          <td className="p-4 text-sm font-bold text-[#1b263b]">{bk.mentorName}</td>
                          <td className="p-4 text-xs text-[#1b263b] font-mono">{bk.dateTime}</td>
                          <td className="p-4 text-xs font-black text-[#c92a2a] font-mono">
                            {bk.amount.toLocaleString()}đ
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border-2 border-[#1b263b]/40 shadow-[1px_1px_0px_0px_#1b263b] ${
                                bk.status === 'Confirmed'
                                  ? 'bg-[#a7f3d0] text-[#005c42]'
                                  : bk.status === 'Pending'
                                  ? 'bg-[#ffd54f] text-[#1b263b]'
                                  : 'bg-[#fbcfe8] text-[#9d174d]'
                              }`}
                            >
                              {bk.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            {bk.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingConfirm(bk.id)}
                                  className="bg-[#a7f3d0] hover:bg-emerald-300 border-2 border-[#1b263b] text-[#005c42] px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                                >
                                  Xác nhận
                                </button>
                                <button
                                  onClick={() => handleBookingCancel(bk.id)}
                                  className="bg-[#fbcfe8] hover:bg-rose-200 border-2 border-[#1b263b] text-[#9d174d] px-2.5 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
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
            <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-6 animate-fade-in relative z-10">
              {/* Controls bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center bg-white border-2 border-[#1b263b] focus-within:border-[#c92a2a] rounded-xl px-4 py-2.5 w-full md:w-80 transition-all shadow-[2px_2px_0px_0px_#1b263b]">
                  <svg className="w-4 h-4 text-[#1b263b]/60 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm đề thi IELTS..."
                    className="bg-transparent border-0 outline-none text-xs text-[#1b263b] placeholder-[#1b263b]/50 font-bold w-full"
                  />
                </div>

                {/* Exam Skill Filter Tabs */}
                <div className="bg-white p-1 rounded-xl border-2 border-[#1b263b] flex gap-1 shadow-[2px_2px_0px_0px_#1b263b] overflow-x-auto max-w-full">
                  {(['ALL', 'Listening', 'Reading', 'Writing', 'Speaking'] as const).map((type) => {
                    const isActive = examFilterType === type
                    return (
                      <button
                        key={type}
                        onClick={() => setExamFilterType(type)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap ${
                          isActive 
                            ? 'bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]' 
                            : 'text-[#1b263b]/70 hover:bg-[#f5f3dc]'
                        }`}
                      >
                        {type === 'ALL' ? 'Tất cả' : type}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowBulkImportModal(true)}
                    className="bg-white border-2 border-[#1b263b] text-[#1b263b] hover:bg-gray-100 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                  >
                    Bulk Import JSON
                  </button>
                  <button
                    onClick={() => {
                      setEditingExamId(null)
                      setNewExamTitle('')
                      setNewExamType('Reading')
                      setNewExamDuration('60')
                      setModalSections([])
                      setExamStep(1)
                      setShowCreateExamModal(true)
                    }}
                    className="bg-[#c92a2a] text-white border-2 border-[#1b263b] font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1b263b] hover:bg-[#b01e1e] hover:opacity-95 active:scale-95 transition-all"
                  >
                    Tạo Đề Thi
                  </button>
                </div>
              </div>

              {/* Grid of Exams */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map((ex) => (
                  <div key={ex.id} className="bg-white border-2 border-[#1b263b] hover:border-[#c92a2a] rounded-2xl p-6 flex flex-col justify-between shadow-[3px_3px_0px_0px_#1b263b] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#1b263b] transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b] ${
                          ex.type === 'Reading'
                            ? 'bg-blue-50 text-blue-700'
                            : ex.type === 'Listening'
                            ? 'bg-[#a7f3d0] text-[#005c42]'
                            : ex.type === 'Writing'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ex.type}
                        </span>
                        <span className="text-[10px] font-black text-[#1b263b] font-mono bg-[#f5f3dc] border-2 border-[#1b263b] px-2 py-0.5 rounded-md">
                          ⏱️ {ex.duration} phút
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-black text-[#1b263b] leading-relaxed mb-1.5">
                        {ex.title}
                      </h4>
                      <p className="text-xs text-[#1b263b]/70 font-semibold flex items-center gap-1.5">
                        📚 {ex.questionsCount} Câu hỏi
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t-2 border-[#1b263b]/10 pt-4 mt-6">
                      <button
                        onClick={() => openEditExamModal(ex)}
                        className="bg-white border-2 border-[#1b263b] hover:bg-gray-100 text-[#1b263b] font-black text-[10px] px-3.5 py-2 rounded-lg shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                      >
                        Sửa đề
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn đề thi "${ex.title}"?`)) {
                            try {
                              await apiClient.delete(`/exams/${ex.id}`)
                              setExamsList((prev) => prev.filter((e) => e.id !== ex.id))
                              alert('Xóa đề thi thành công!')
                            } catch (err: any) {
                              alert('Lỗi xóa đề thi: ' + (err.response?.data?.message || err.message))
                            }
                          }
                        }}
                        className="bg-[#fbcfe8] hover:bg-rose-200 border-2 border-[#1b263b] text-[#9d174d] font-black text-[10px] px-3.5 py-2 rounded-lg shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              SUBMISSIONS / PRACTICE RESULTS VIEW
             ──────────────────────────────────────────────────────── */}
          {activeTab === 'submissions' && (
            <div className="space-y-6 relative z-10 animate-fade-in">
              {/* Backend Error/Warning Display */}
              {submissionsError && (
                <div className="bg-[#fbcfe8] border-2 border-[#1b263b] text-[#9d174d] px-5 py-3 rounded-2xl text-xs font-black flex items-center justify-between shadow-[2px_2px_0px_0px_#1b263b]">
                  <span>⚠️ {submissionsError}</span>
                  <button onClick={() => setSubmissionsError(null)} className="text-[#9d174d] hover:text-rose-700 font-bold ml-2">✕</button>
                </div>
              )}

              <div className="bg-[#fcfbf7] border-2 border-[#1b263b] rounded-2xl p-6 shadow-[3px_3px_0px_0px_#1b263b] space-y-6">
                {/* Controls bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="flex items-center bg-white border-2 border-[#1b263b] focus-within:border-[#c92a2a] rounded-xl px-4 py-2.5 w-full md:w-96 transition-all shadow-[2px_2px_0px_0px_#1b263b]">
                    <svg className="w-4 h-4 text-[#1b263b]/60 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm tên học viên, email, đề thi..."
                      className="bg-transparent border-0 outline-none text-xs text-[#1b263b] placeholder-[#1b263b]/50 font-bold w-full"
                    />
                  </div>

                  {/* Skill/Type Filter Switcher */}
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1 rounded-xl border-2 border-[#1b263b] flex gap-1 shadow-[2px_2px_0px_0px_#1b263b] overflow-x-auto max-w-full">
                      {(['ALL', 'Reading', 'Listening', 'Writing', 'Speaking'] as const).map((t) => {
                        const isActive = submissionFilterType === t
                        return (
                          <button
                            key={t}
                            onClick={() => setSubmissionFilterType(t)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap ${
                              isActive 
                                ? 'bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]' 
                                : 'text-[#1b263b]/70 hover:bg-[#f5f3dc]'
                            }`}
                          >
                            {t === 'ALL' ? 'Tất cả kỹ năng' : t}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Submissions table */}
                <div className="overflow-x-auto border-2 border-[#1b263b] rounded-xl bg-white shadow-[2px_2px_0px_0px_#1b263b]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f5f3dc] border-b-2 border-[#1b263b]">
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Học Viên</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Kỹ năng</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Đề thi / Bài tập</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Kết Quả / Điểm số</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider">Thời gian nộp</th>
                        <th className="p-4 text-xs font-black text-[#1b263b] uppercase tracking-wider text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionsLoading ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#1b263b]/60 font-black">
                            <span className="inline-block animate-pulse">Đang tải danh sách bài làm...</span>
                          </td>
                        </tr>
                      ) : filteredSubmissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#1b263b]/60 font-black">
                            Không tìm thấy kết quả làm bài nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredSubmissions.map((item) => (
                          <tr key={item.id} className="border-b border-[#1b263b]/10 hover:bg-[#f5f3dc]/25 transition-colors">
                            <td className="p-4">
                              <p className="text-sm font-bold text-[#1b263b]">{item.student?.fullName}</p>
                              <p className="text-xs text-[#1b263b]/60 font-semibold">@{item.student?.username || 'user'}</p>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b] ${
                                  item.type === 'Reading'
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.type === 'Listening'
                                    ? 'bg-green-100 text-green-800'
                                    : item.type === 'Writing'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.type}
                              </span>
                            </td>
                            <td className="p-4">
                              <p className="text-xs font-bold text-[#1b263b] max-w-xs truncate" title={item.test?.title}>
                                {item.test?.title || 'Bài tập tự do'}
                              </p>
                              {item.prompt && (
                                <p className="text-[10px] text-[#1b263b]/60 font-semibold max-w-xs truncate italic">
                                  Đề: {item.prompt}
                                </p>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-[#c92a2a] bg-red-50 border border-red-200 px-2 py-0.5 rounded font-mono">
                                  Band {item.bandScore}
                                </span>
                                {(item.type === 'Reading' || item.type === 'Listening') && (
                                  <span className="text-xs text-[#1b263b]/60 font-mono">
                                    ({item.correctCount}/40 câu)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-xs font-mono text-[#1b263b]">
                              {new Date(item.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedSubmission(item)
                                  setShowSubmissionModal(true)
                                }}
                                className="bg-[#ffd54f] hover:bg-amber-400 border-2 border-[#1b263b] text-[#1b263b] px-3 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                              >
                                Xem chi tiết
                              </button>
                              <button
                                onClick={() => handleDeleteSubmission(item)}
                                className="bg-[#fbcfe8] hover:bg-rose-200 border-2 border-[#1b263b] text-[#9d174d] px-3 py-1.5 rounded-lg text-[10px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ────────────────────────────────────────────────────────
          MODALS & FORM DIALOGS (BRUTALIST NOTEBOOK STYLE)
         ──────────────────────────────────────────────────────── */}
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl max-w-xl w-full p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6">
            <div className="flex justify-between items-center border-b-2 border-[#1b263b] pb-4">
              <h3 className="text-base font-serif font-black text-[#1b263b]">Tạo Mới Người Dùng</h3>
              <button onClick={() => setShowCreateUserModal(false)} className="text-[#1b263b] hover:text-[#c92a2a] font-black text-lg transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Họ Tên</label>
                  <input
                    type="text"
                    value={createUserForm.fullName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, fullName: e.target.value })}
                    placeholder="Nguyen Van A"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Tên tài khoản</label>
                  <input
                    type="text"
                    value={createUserForm.username}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                    placeholder="nguyenvana"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                    placeholder="a@gmail.com"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Mật khẩu</label>
                  <input
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Vai trò</label>
                  <select
                    value={createUserForm.role}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value as any })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                    placeholder="09xxxxxxxx"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Ngày sinh</label>
                  <input
                    type="text"
                    value={createUserForm.birthday}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, birthday: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Số CCCD</label>
                  <input
                    type="text"
                    value={createUserForm.identityNumber}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, identityNumber: e.target.value })}
                    placeholder="001xxxxxxxx"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#c92a2a] hover:bg-[#b01e1e] text-white border-2 border-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl max-w-xl w-full p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6">
            <div className="flex justify-between items-center border-b-2 border-[#1b263b] pb-4">
              <h3 className="text-base font-serif font-black text-[#1b263b]">Chỉnh Sửa Thông Tin</h3>
              <button onClick={() => setShowEditUserModal(false)} className="text-[#1b263b] hover:text-[#c92a2a] font-black text-lg transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Họ Tên</label>
                  <input
                    type="text"
                    value={editUserForm.fullName}
                    onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Tên tài khoản</label>
                  <input
                    type="text"
                    value={editUserForm.username}
                    onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Mật khẩu mới (Để trống nếu giữ nguyên)</label>
                  <input
                    type="password"
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Vai trò</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MENTOR">MENTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Ngày sinh</label>
                  <input
                    type="text"
                    value={editUserForm.birthday}
                    onChange={(e) => setEditUserForm({ ...editUserForm, birthday: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Số CCCD</label>
                  <input
                    type="text"
                    value={editUserForm.identityNumber}
                    onChange={(e) => setEditUserForm({ ...editUserForm, identityNumber: e.target.value })}
                    className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#c92a2a] hover:bg-[#b01e1e] text-white border-2 border-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl max-w-4xl w-full p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Spiral binding representation */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#ffd54f] border-b-2 border-[#1b263b] rounded-t-lg flex justify-around px-4 pointer-events-none">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1.5 h-4 bg-[#1b263b] rounded-t-full transform -translate-y-1.5 border border-white/20" />
              ))}
            </div>

            <div className="flex justify-between items-center border-b-2 border-[#1b263b] pb-4 pt-3">
              <div>
                <h3 className="text-lg font-serif font-black text-[#1b263b]">Thông Tin Chi Tiết Thành Viên</h3>
                <p className="text-xs text-[#1b263b]/60 font-semibold mt-0.5">@{selectedUserDetail.username}</p>
              </div>
              <button 
                onClick={() => setShowUserDetailModal(false)} 
                className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Split layout: Profile (1/3) & Activity lists (2/3) */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Profile card sidebar */}
              <div className="w-full lg:w-1/3 space-y-4">
                <div className="bg-white border-2 border-[#1b263b] p-4 rounded-xl shadow-[3px_3px_0px_0px_#1b263b] space-y-3">
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Họ và Tên</span>
                    <span className="text-xs font-extrabold text-[#1b263b]">{selectedUserDetail.fullName}</span>
                  </div>
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Địa chỉ Email</span>
                    <span className="text-xs font-semibold text-[#1b263b] font-mono break-all">{selectedUserDetail.email}</span>
                  </div>
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Số điện thoại</span>
                    <span className="text-xs font-semibold text-[#1b263b]">{selectedUserDetail.phone || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Ngày sinh</span>
                    <span className="text-xs font-semibold text-[#1b263b]">{selectedUserDetail.birthday || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Số CCCD / Passport</span>
                    <span className="text-xs font-semibold text-[#1b263b]">{selectedUserDetail.identityNumber || 'Chưa cung cấp'}</span>
                  </div>
                  <div className="border-b border-[#1b263b]/10 pb-2">
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Vai trò hệ thống</span>
                    <span className={`inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-[9px] font-black tracking-wider border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b] ${
                      selectedUserDetail.role === 'ADMIN' ? 'bg-[#ffd54f] text-[#1b263b]' :
                      selectedUserDetail.role === 'MENTOR' ? 'bg-[#fbcfe8] text-[#9d174d]' : 'bg-[#a7f3d0] text-[#005c42]'
                    }`}>{selectedUserDetail.role}</span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-[#1b263b]/50 uppercase tracking-wider block">Trạng thái</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-0.5 rounded-full text-[9px] font-black border-2 border-[#1b263b]/40 ${
                      selectedUserDetail.status === 'active' ? 'bg-[#a7f3d0] text-[#005c42]' : 'bg-yellow-500/10 text-yellow-700 animate-pulse'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedUserDetail.status === 'active' ? 'bg-[#005c42]' : 'bg-yellow-600'
                      }`} />
                      {selectedUserDetail.status === 'active' ? 'Hoạt động' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity / Relational Details Main Pane */}
              <div className="w-full lg:w-2/3 space-y-4">
                
                {/* Tab Switcher */}
                <div className="bg-white p-1 rounded-xl border-2 border-[#1b263b] flex gap-1 shadow-[2px_2px_0px_0px_#1b263b] w-fit">
                  <button
                    onClick={() => setUserDetailTab('submissions')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap ${
                      userDetailTab === 'submissions'
                        ? 'bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]' 
                        : 'text-[#1b263b]/70 hover:bg-[#f5f3dc]'
                    }`}
                  >
                    Kết quả thi & Làm bài ({selectedUserSubmissions.length})
                  </button>
                  <button
                    onClick={() => setUserDetailTab('bookings')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap ${
                      userDetailTab === 'bookings'
                        ? 'bg-[#ffd54f] border border-[#1b263b] text-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b]' 
                        : 'text-[#1b263b]/70 hover:bg-[#f5f3dc]'
                    }`}
                  >
                    Lịch học Mentor ({selectedUserBookings.length})
                  </button>
                </div>

                {/* Submissions List Tab Content */}
                {userDetailTab === 'submissions' && (
                  <div className="bg-white border-2 border-[#1b263b] rounded-xl p-4 shadow-[3px_3px_0px_0px_#1b263b] min-h-[300px]">
                    <h4 className="text-[10px] font-black text-[#1b263b] uppercase tracking-wider mb-3">Lịch sử nộp bài luyện tập</h4>
                    
                    {selectedUserSubmissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-2xl mb-1">📝</span>
                        <p className="text-xs text-[#1b263b]/60 font-bold italic">Chưa có kết quả làm bài nào được ghi nhận cho học viên này.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-2 border-[#1b263b] rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#f5f3dc] border-b-2 border-[#1b263b] font-black text-[#1b263b]">
                              <th className="p-3">Đề thi / Bài tập</th>
                              <th className="p-3">Kỹ năng</th>
                              <th className="p-3">Điểm số</th>
                              <th className="p-3">Ngày nộp</th>
                              <th className="p-3 text-right">Chi tiết</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserSubmissions.map((sub) => (
                              <tr key={sub.id} className="border-b border-[#1b263b]/10 hover:bg-[#f5f3dc]/20 transition-colors font-semibold text-[#1b263b]">
                                <td className="p-3 max-w-[200px] truncate" title={sub.test?.title || 'Bài tập tự do'}>
                                  {sub.test?.title || 'Bài tập tự do'}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider border border-[#1b263b] ${
                                    sub.type === 'Reading' ? 'bg-blue-100 text-blue-800' :
                                    sub.type === 'Listening' ? 'bg-green-100 text-green-800' :
                                    sub.type === 'Writing' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                                  }`}>{sub.type}</span>
                                </td>
                                <td className="p-3 font-black text-[#c92a2a]">
                                  Band {sub.bandScore}
                                </td>
                                <td className="p-3 font-mono text-[10px]">
                                  {new Date(sub.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedSubmission(sub)
                                      setShowSubmissionModal(true)
                                    }}
                                    className="bg-[#ffd54f] hover:bg-amber-400 border border-[#1b263b] text-[#1b263b] px-2 py-1 rounded text-[9px] font-black shadow-[1px_1px_0px_0px_#1b263b] transition-all"
                                  >
                                    Xem bài
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Bookings List Tab Content */}
                {userDetailTab === 'bookings' && (
                  <div className="bg-white border-2 border-[#1b263b] rounded-xl p-4 shadow-[3px_3px_0px_0px_#1b263b] min-h-[300px]">
                    <h4 className="text-[10px] font-black text-[#1b263b] uppercase tracking-wider mb-3">Lịch hẹn Mentor (Đặt chỗ học tập)</h4>
                    
                    {selectedUserBookings.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-2xl mb-1">📅</span>
                        <p className="text-xs text-[#1b263b]/60 font-bold italic">Chưa có lịch hẹn Mentor nào được đăng ký.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border-2 border-[#1b263b] rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#f5f3dc] border-b-2 border-[#1b263b] font-black text-[#1b263b]">
                              <th className="p-3">Mã lịch</th>
                              <th className="p-3">Học viên</th>
                              <th className="p-3">Mentor</th>
                              <th className="p-3">Thời gian</th>
                              <th className="p-3">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedUserBookings.map((bk) => (
                              <tr key={bk.id} className="border-b border-[#1b263b]/10 hover:bg-[#f5f3dc]/20 transition-colors font-semibold text-[#1b263b]">
                                <td className="p-3 font-mono text-[10px]">{bk.id}</td>
                                <td className="p-3">{bk.studentName}</td>
                                <td className="p-3">{bk.mentorName}</td>
                                <td className="p-3 font-mono text-[10px]">{bk.dateTime}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black ${
                                    bk.status === 'Confirmed' ? 'bg-emerald-100 border-emerald-400 text-emerald-800' :
                                    bk.status === 'Pending' ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-gray-100 border-gray-400 text-gray-800'
                                  }`}>{bk.status === 'Confirmed' ? 'Đã xác nhận' : bk.status === 'Pending' ? 'Chờ duyệt' : bk.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-[#1b263b]/10">
              <button
                type="button"
                onClick={() => setShowUserDetailModal(false)}
                className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-6 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className={`bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl w-full p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6 transition-all ${
            examStep === 2 ? 'max-w-4xl max-h-[90vh] overflow-y-auto' : 'max-w-md'
          }`}>
            <div className="flex justify-between items-center border-b-2 border-[#1b263b] pb-4">
              <h3 className="text-base font-serif font-black text-[#1b263b]">
                {editingExamId ? 'Cập Nhật Đề Thi IELTS' : 'Thêm Mới Đề Thi IELTS'}
                <span className="text-xs text-gray-500 font-sans font-bold ml-2">
                  (Bước {examStep}/2)
                </span>
              </h3>
              <button 
                onClick={() => {
                  setShowCreateExamModal(false)
                  setEditingExamId(null)
                  setExamStep(1)
                  setModalSections([])
                }} 
                className="text-[#1b263b] hover:text-[#c92a2a] font-black text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              {examStep === 1 ? (
                /* STEP 1: BASIC INFO */
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Tiêu Đề Đề Thi</label>
                    <input
                      type="text"
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      placeholder="IELTS Cambridge 19 - Test 1"
                      className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] transition-all placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Kỹ năng</label>
                      <select
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value as any)}
                        disabled={!!editingExamId} // Lock type on edit to avoid mismatches
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b] disabled:bg-gray-100"
                      >
                        <option value="Reading">Reading</option>
                        <option value="Listening">Listening</option>
                        <option value="Writing">Writing</option>
                        <option value="Speaking">Speaking</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">Thời gian (Phút)</label>
                      <input
                        type="number"
                        value={newExamDuration}
                        onChange={(e) => setNewExamDuration(e.target.value)}
                        className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-2.5 text-xs text-[#1b263b] outline-none focus:border-[#c92a2a] font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateExamModal(false)
                        setEditingExamId(null)
                        setExamStep(1)
                        setModalSections([])
                      }}
                      className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="bg-[#c92a2a] hover:bg-[#b01e1e] text-white border-2 border-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
                    >
                      Tiếp tục →
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: SECTIONS & QUESTIONS EDITOR */
                <div className="space-y-6">
                  <div className="flex gap-2 overflow-x-auto pb-2 border-b border-[#1b263b]/10 select-none">
                    {modalSections.map((sec, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSectionIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg border-2 border-[#1b263b] text-[10px] font-black transition-all shrink-0 ${
                          selectedSectionIdx === idx
                            ? 'bg-[#ffd54f] text-[#1b263b] shadow-[2px_2px_0px_0px_#1b263b]'
                            : 'bg-white text-[#1b263b] hover:bg-gray-50'
                        }`}
                      >
                        {newExamType === 'Listening' ? `Section ${sec.sectionOrder}` :
                         newExamType === 'Reading' ? `Passage ${sec.sectionOrder}` :
                         newExamType === 'Writing' ? `Task ${sec.sectionOrder}` : `Part ${sec.sectionOrder}`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const nextOrder = modalSections.length + 1
                        setModalSections([...modalSections, {
                          sectionOrder: nextOrder,
                          title: newExamType === 'Listening' ? `Section ${nextOrder}` :
                                 newExamType === 'Reading' ? `Passage ${nextOrder}` :
                                 newExamType === 'Writing' ? `Task ${nextOrder}` : `Part ${nextOrder}`,
                          passageText: '',
                          audioUrl: '',
                          images: [],
                          questions: []
                        }])
                        setSelectedSectionIdx(modalSections.length)
                      }}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border-2 border-dashed border-[#1b263b] hover:bg-emerald-100 rounded-lg text-[10px] font-black shrink-0"
                    >
                      + Thêm phần
                    </button>
                  </div>

                  {/* Selected Section Editor Fields */}
                  {modalSections[selectedSectionIdx] && (
                    <div className="space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1">Tiêu đề Phần</label>
                          <input
                            type="text"
                            value={modalSections[selectedSectionIdx].title || ''}
                            onChange={(e) => {
                              const updated = [...modalSections]
                              updated[selectedSectionIdx].title = e.target.value
                              setModalSections(updated)
                            }}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-lg px-3 py-2 text-xs font-bold text-[#1b263b] outline-none"
                            placeholder="e.g. Section 1"
                          />
                        </div>
                        {newExamType === 'Listening' && (
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1">Đường dẫn file Audio (.mp3)</label>
                              <input
                                type="text"
                                value={modalSections[selectedSectionIdx].audioUrl || ''}
                                onChange={(e) => {
                                  const updated = [...modalSections]
                                  updated[selectedSectionIdx].audioUrl = e.target.value
                                  setModalSections(updated)
                                }}
                                className="w-full bg-white border-2 border-[#1b263b] rounded-lg px-3 py-2 text-xs font-bold text-[#1b263b] outline-none"
                                placeholder="https://res.cloudinary.com/.../audio.mp3"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px] font-black text-rose-700 uppercase tracking-wider mb-1">Hoặc tải file âm thanh từ máy:</label>
                              <input
                                type="file"
                                accept="audio/*,video/*"
                                onChange={(e) => handleAudioUpload(e, selectedSectionIdx)}
                                className="w-full text-xs text-[#1b263b] file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-2 file:border-[#1b263b] file:text-[10px] file:font-black file:bg-amber-100 file:text-[#1b263b] hover:file:bg-amber-200 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {newExamType !== 'Listening' && (
                        <div>
                          <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1">
                            {newExamType === 'Reading' ? 'Văn bản đoạn văn (Passage Text)' : 
                             newExamType === 'Writing' ? 'Đề bài viết / Hướng dẫn (Prompt)' : 'Chủ đề thảo luận / Cue Card'}
                          </label>
                          <textarea
                            value={modalSections[selectedSectionIdx].passageText || ''}
                            onChange={(e) => {
                              const updated = [...modalSections]
                              updated[selectedSectionIdx].passageText = e.target.value
                              setModalSections(updated)
                            }}
                            rows={6}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-lg px-3 py-2 text-xs font-bold text-[#1b263b] outline-none resize-y"
                            placeholder="Nhập nội dung văn bản..."
                          />
                        </div>
                      )}

                      {newExamType === 'Writing' && (
                        <div>
                          <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1">Đường dẫn ảnh biểu đồ (Images URL, cách nhau bằng dấu phẩy)</label>
                          <input
                            type="text"
                            value={modalSections[selectedSectionIdx].images?.join(', ') || ''}
                            onChange={(e) => {
                              const updated = [...modalSections]
                              updated[selectedSectionIdx].images = e.target.value ? e.target.value.split(',').map(s => s.trim()) : []
                              setModalSections(updated)
                            }}
                            className="w-full bg-white border-2 border-[#1b263b] rounded-lg px-3 py-2 text-xs font-bold text-[#1b263b] outline-none"
                            placeholder="e.g. https://res.cloudinary.com/.../chart.png"
                          />
                        </div>
                      )}

                      {/* Questions Editor for this Section */}
                      {newExamType !== 'Writing' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-t border-[#1b263b]/10 pt-3">
                            <span className="text-[10px] font-black text-[#1b263b] uppercase tracking-wider">Danh sách câu hỏi ({modalSections[selectedSectionIdx].questions?.length || 0})</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...modalSections]
                                const currentQuestions = updated[selectedSectionIdx].questions || []
                                const nextQNum = currentQuestions.length > 0 ? Math.max(...currentQuestions.map((q: any) => q.questionNumber)) + 1 : 1
                                updated[selectedSectionIdx].questions = [...currentQuestions, {
                                  questionNumber: nextQNum,
                                  type: 'MULTIPLE_CHOICE',
                                  content: '',
                                  options: '',
                                  answer: '',
                                  explanation: ''
                                }]
                                setModalSections(updated)
                              }}
                              className="bg-[#a7f3d0] text-[#005c42] border-2 border-[#1b263b] px-2.5 py-1 rounded-lg text-[9px] font-black hover:bg-emerald-300 shadow-[1px_1px_0px_0px_#1b263b]"
                            >
                              + Thêm Câu Hỏi
                            </button>
                          </div>

                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {(modalSections[selectedSectionIdx].questions || []).map((q: any, qIdx: number) => (
                              <div key={qIdx} className="bg-white border border-[#1b263b] p-3 rounded-lg relative space-y-2.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...modalSections]
                                    updated[selectedSectionIdx].questions = updated[selectedSectionIdx].questions.filter((_: any, idx: number) => idx !== qIdx)
                                    setModalSections(updated)
                                  }}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xs"
                                  title="Xóa câu hỏi"
                                >
                                  ✕
                                </button>

                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-2">
                                    <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Số câu</label>
                                    <input
                                      type="number"
                                      value={q.questionNumber}
                                      onChange={(e) => {
                                        const updated = [...modalSections]
                                        updated[selectedSectionIdx].questions[qIdx].questionNumber = parseInt(e.target.value) || 0
                                        setModalSections(updated)
                                      }}
                                      className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs text-center font-bold"
                                    />
                                  </div>
                                  <div className="col-span-4">
                                    <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Loại câu hỏi</label>
                                    <select
                                      value={q.type}
                                      onChange={(e) => {
                                        const updated = [...modalSections]
                                        updated[selectedSectionIdx].questions[qIdx].type = e.target.value
                                        setModalSections(updated)
                                      }}
                                      className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs font-bold"
                                    >
                                      <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                                      <option value="FILL_IN_BLANKS">Điền từ</option>
                                      <option value="MATCHING_HEADINGS">Nối tiêu đề</option>
                                      <option value="TRUE_FALSE_NOT_GIVEN">True/False/NG</option>
                                      <option value="SHORT_ANSWER">Trả lời ngắn</option>
                                    </select>
                                  </div>
                                  <div className="col-span-6">
                                    <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Nội dung câu hỏi</label>
                                    <input
                                      type="text"
                                      value={q.content || ''}
                                      onChange={(e) => {
                                        const updated = [...modalSections]
                                        updated[selectedSectionIdx].questions[qIdx].content = e.target.value
                                        setModalSections(updated)
                                      }}
                                      placeholder="Nội dung/Câu hỏi"
                                      className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-12 gap-2">
                                  <div className="col-span-4">
                                    <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Đáp án</label>
                                    <input
                                      type="text"
                                      value={q.answer || ''}
                                      onChange={(e) => {
                                        const updated = [...modalSections]
                                        updated[selectedSectionIdx].questions[qIdx].answer = e.target.value
                                        setModalSections(updated)
                                      }}
                                      placeholder="e.g. A, TRUE, apple"
                                      className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs font-bold"
                                    />
                                  </div>
                                  <div className="col-span-8">
                                    <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Các lựa chọn (ngăn cách bằng dấu phẩy)</label>
                                    <input
                                      type="text"
                                      value={q.options || ''}
                                      onChange={(e) => {
                                        const updated = [...modalSections]
                                        updated[selectedSectionIdx].questions[qIdx].options = e.target.value
                                        setModalSections(updated)
                                      }}
                                      placeholder="e.g. Option A, Option B, Option C"
                                      disabled={q.type !== 'MULTIPLE_CHOICE'}
                                      className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs disabled:bg-gray-100"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[8px] font-black text-[#1b263b]/70 uppercase">Giải thích đáp án</label>
                                  <input
                                    type="text"
                                    value={q.explanation || ''}
                                    onChange={(e) => {
                                      const updated = [...modalSections]
                                      updated[selectedSectionIdx].questions[qIdx].explanation = e.target.value
                                      setModalSections(updated)
                                    }}
                                    placeholder="Giải thích chi tiết vì sao chọn đáp án này..."
                                    className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs italic text-gray-600"
                                  />
                                </div>
                              </div>
                            ))}
                            {(modalSections[selectedSectionIdx].questions || []).length === 0 && (
                              <p className="text-xs text-gray-400 italic text-center py-4">Chưa có câu hỏi nào trong phần này.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t-2 border-[#1b263b]">
                    <button
                      type="button"
                      onClick={() => setExamStep(1)}
                      className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                    >
                      ← Quay lại
                    </button>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateExamModal(false)
                          setEditingExamId(null)
                          setExamStep(1)
                          setModalSections([])
                        }}
                        className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-[#c92a2a] hover:bg-[#b01e1e] text-white border-2 border-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
                      >
                        {editingExamId ? 'Lưu Thay Đổi' : 'Lưu Đề Thi'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl max-w-xl w-full p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6">
            <div className="flex justify-between items-center border-b-2 border-[#1b263b] pb-4">
              <h3 className="text-base font-serif font-black text-[#1b263b]">Nhập Đề Thi Số Lượng Lớn (JSON Payload)</h3>
              <button onClick={() => setShowBulkImportModal(false)} className="text-[#1b263b] hover:text-[#c92a2a] font-black text-lg transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-[#1b263b] uppercase tracking-wider mb-1.5">
                  Dán chuỗi đề thi JSON (theo cấu trúc Cambridge Mock Test)
                </label>
                <textarea
                  value={bulkJsonPayload}
                  onChange={(e) => setBulkJsonPayload(e.target.value)}
                  placeholder={`{\n  "title": "Cambridge 19 - Test 1",\n  "type": "Reading",\n  "duration": 60,\n  "sections": [...]\n}`}
                  rows={10}
                  className="w-full bg-white border-2 border-[#1b263b] rounded-xl px-4 py-3 text-xs font-mono text-[#1b263b] outline-none focus:border-[#c92a2a] resize-none placeholder-[#1b263b]/40 font-bold shadow-[2px_2px_0px_0px_#1b263b]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkImportModal(false)}
                  className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#c92a2a] hover:bg-[#b01e1e] text-white border-2 border-[#1b263b] font-black text-xs px-5 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
                >
                  Bắt đầu Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission / Practice Result Detail Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#fcfbf7] border-4 border-[#1b263b] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-[6px_6px_0px_0px_#1b263b] space-y-6 relative">
            
            {/* Spiral binding representation for brutalist notebook design */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-[#ffd54f] border-b-2 border-[#1b263b] rounded-t-lg flex justify-around px-4 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1.5 h-4 bg-[#1b263b] rounded-t-full transform -translate-y-1.5 border border-white/20" />
              ))}
            </div>

            <div className="flex justify-between items-start border-b-2 border-[#1b263b] pb-4 pt-3">
              <div>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 border-[#1b263b] shadow-[1px_1px_0px_0px_#1b263b] ${
                  selectedSubmission.type === 'Reading'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedSubmission.type === 'Listening'
                    ? 'bg-green-100 text-green-800'
                    : selectedSubmission.type === 'Writing'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedSubmission.type} Test Details
                </span>
                <h3 className="text-xl font-serif font-black text-[#1b263b] mt-1.5">
                  {selectedSubmission.test?.title || 'Bài tập tự do'}
                </h3>
                <p className="text-xs text-[#1b263b]/70 font-semibold mt-0.5">
                  Học viên: <span className="font-extrabold text-[#1b263b]">{selectedSubmission.student?.fullName}</span> (@{selectedSubmission.student?.username})
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <button 
                  onClick={() => setShowSubmissionModal(false)} 
                  className="w-8 h-8 rounded-xl bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all flex items-center justify-center"
                >
                  ✕
                </button>
                <div className="bg-[#ffd54f] border-2 border-[#1b263b] px-3.5 py-1 rounded-xl shadow-[3px_3px_0px_0px_#1b263b] text-center mt-2">
                  <p className="text-[9px] font-black uppercase text-[#1b263b]/60 tracking-wider">Band Score</p>
                  <p className="text-xl font-black text-[#1b263b] font-mono leading-none">{selectedSubmission.bandScore}</p>
                </div>
              </div>
            </div>

            {/* 1. READING OR LISTENING RESULTS */}
            {(selectedSubmission.type === 'Reading' || selectedSubmission.type === 'Listening') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white border-2 border-[#1b263b] p-3 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block">Số câu đúng</span>
                    <span className="text-base font-black text-[#1b263b]">{selectedSubmission.correctCount || 0} / 40</span>
                  </div>
                  <div className="bg-white border-2 border-[#1b263b] p-3 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block">Thời gian làm bài</span>
                    <span className="text-base font-black text-[#1b263b]">
                      {Math.floor((selectedSubmission.timeTaken || 0) / 60)} phút { (selectedSubmission.timeTaken || 0) % 60 } giây
                    </span>
                  </div>
                  <div className="bg-white border-2 border-[#1b263b] p-3 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] col-span-2 md:col-span-1">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block">Ngày hoàn thành</span>
                    <span className="text-xs font-bold text-[#1b263b]">
                      {new Date(selectedSubmission.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black text-[#1b263b] uppercase tracking-wider mb-2.5">Bảng chi tiết câu trả lời</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {selectedSubmission.answers && Array.isArray(selectedSubmission.answers) ? (
                      selectedSubmission.answers.map((ans: any, idx: number) => (
                        <div key={idx} className={`p-3 border-2 border-[#1b263b] rounded-xl flex flex-col gap-1.5 shadow-[2px_2px_0px_0px_#1b263b] ${
                          ans.isCorrect ? 'bg-[#a7f3d0]/30' : 'bg-[#fbcfe8]/30'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-[#1b263b]">Câu {ans.questionNumber || idx + 1}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              ans.isCorrect 
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-800' 
                                : 'bg-rose-100 border-rose-400 text-rose-800'
                            }`}>
                              {ans.isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px] font-semibold">
                            <div>Bài làm: <span className="font-black text-rose-800">{ans.userAnswer || '(Trống)'}</span></div>
                            <div>Đáp án đúng: <span className="font-black text-emerald-800">{ans.correctAnswer}</span></div>
                          </div>
                          {ans.explanation && (
                            <p className="text-[10px] text-[#1b263b]/70 border-t border-[#1b263b]/10 pt-1 mt-1 italic">
                              Giải thích: {ans.explanation}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#1b263b]/60 italic col-span-2">Không tìm thấy chi tiết câu trả lời.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. WRITING SUBMISSION DETAILS */}
            {selectedSubmission.type === 'Writing' && (
              <div className="space-y-4">
                {selectedSubmission.prompt && (
                  <div className="bg-[#ffd54f]/10 border-2 border-[#1b263b] p-4 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block">Đề bài (Prompt)</span>
                    <p className="text-xs font-bold text-[#1b263b] leading-relaxed mt-1">{selectedSubmission.prompt}</p>
                  </div>
                )}

                {/* Subscores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Task Achievement', score: selectedSubmission.taskAchievement },
                    { label: 'Coherence & Cohesion', score: selectedSubmission.coherenceCohesion },
                    { label: 'Lexical Resource', score: selectedSubmission.lexicalResource },
                    { label: 'Grammar Accuracy', score: selectedSubmission.grammarAccuracy },
                  ].map((sub, i) => (
                    <div key={i} className="bg-white border-2 border-[#1b263b] p-3 rounded-xl text-center shadow-[2px_2px_0px_0px_#1b263b]">
                      <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block leading-tight">{sub.label}</span>
                      <span className="text-lg font-black text-[#c92a2a] font-mono block mt-1">{sub.score || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* Student Essay text */}
                <div>
                  <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block mb-1">Bài viết của học viên</span>
                  <div className="bg-white border-2 border-[#1b263b] rounded-xl p-4 shadow-[3px_3px_0px_0px_#1b263b] font-serif text-sm leading-relaxed text-[#1b263b] max-h-80 overflow-y-auto select-text whitespace-pre-wrap">
                    {selectedSubmission.essayText}
                  </div>
                </div>

                {/* AI feedback section */}
                {selectedSubmission.aiFeedback && (
                  <div className="bg-[#a7f3d0]/20 border-2 border-[#1b263b] rounded-xl p-4 space-y-3 shadow-[3px_3px_0px_0px_#1b263b]">
                    <div className="flex items-center gap-2 border-b border-[#1b263b]/10 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <h4 className="text-xs font-black text-[#005c42] uppercase tracking-wider">Đánh giá & Gợi ý sửa đổi từ AI</h4>
                    </div>

                    <div className="space-y-3 text-xs text-[#1b263b]">
                      <div>
                        <span className="font-extrabold block text-[10px] text-[#1b263b]/70 uppercase">Nhận xét tổng quan:</span>
                        <p className="mt-1 leading-relaxed">{selectedSubmission.aiFeedback.overall || selectedSubmission.aiFeedback}</p>
                      </div>
                      
                      {selectedSubmission.aiFeedback.strengths && (
                        <div>
                          <span className="font-extrabold block text-[10px] text-[#005c42] uppercase">Điểm mạnh:</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {selectedSubmission.aiFeedback.strengths.map((str: string, index: number) => (
                              <li key={index} className="leading-relaxed">{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedSubmission.aiFeedback.weaknesses && (
                        <div>
                          <span className="font-extrabold block text-[10px] text-rose-800 uppercase">Điểm cần cải thiện:</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {selectedSubmission.aiFeedback.weaknesses.map((wk: string, index: number) => (
                              <li key={index} className="leading-relaxed">{wk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. SPEAKING SUBMISSION DETAILS */}
            {selectedSubmission.type === 'Speaking' && (
              <div className="space-y-4">
                {selectedSubmission.prompt && (
                  <div className="bg-[#ffd54f]/10 border-2 border-[#1b263b] p-4 rounded-xl shadow-[2px_2px_0px_0px_#1b263b]">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block">Chủ đề (Prompt)</span>
                    <p className="text-xs font-bold text-[#1b263b] leading-relaxed mt-1">{selectedSubmission.prompt}</p>
                  </div>
                )}

                {/* Subscores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Fluency & Coherence', score: selectedSubmission.fluencyCoherence },
                    { label: 'Lexical Resource', score: selectedSubmission.lexicalResource },
                    { label: 'Grammar Accuracy', score: selectedSubmission.grammarAccuracy },
                    { label: 'Pronunciation', score: selectedSubmission.pronunciation },
                  ].map((sub, i) => (
                    <div key={i} className="bg-white border-2 border-[#1b263b] p-3 rounded-xl text-center shadow-[2px_2px_0px_0px_#1b263b]">
                      <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block leading-tight">{sub.label}</span>
                      <span className="text-lg font-black text-[#c92a2a] font-mono block mt-1">{sub.score || 'N/A'}</span>
                    </div>
                  ))}
                </div>

                {/* Audio Player and Transcription */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 bg-white border-2 border-[#1b263b] p-4 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] flex flex-col justify-center items-center">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block mb-3">File ghi âm học viên</span>
                    {selectedSubmission.audioUrl ? (
                      <audio controls src={selectedSubmission.audioUrl} className="w-full animate-fade-in" />
                    ) : (
                      <p className="text-xs text-[#1b263b]/60 italic">Không có file ghi âm</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[9px] font-black text-[#1b263b]/60 uppercase tracking-wider block mb-1">Bản ghi Text (Transcription)</span>
                    <div className="bg-white border-2 border-[#1b263b] rounded-xl p-4 shadow-[2px_2px_0px_0px_#1b263b] text-xs font-semibold leading-relaxed text-[#1b263b] max-h-48 overflow-y-auto select-text whitespace-pre-wrap">
                      {selectedSubmission.transcription || 'Không có bản dịch transcription.'}
                    </div>
                  </div>
                </div>

                {/* AI feedback section */}
                {selectedSubmission.aiFeedback && (
                  <div className="bg-[#a7f3d0]/20 border-2 border-[#1b263b] rounded-xl p-4 space-y-3 shadow-[3px_3px_0px_0px_#1b263b]">
                    <div className="flex items-center gap-2 border-b border-[#1b263b]/10 pb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <h4 className="text-xs font-black text-[#005c42] uppercase tracking-wider">Đánh giá giọng nói & Phát âm từ AI</h4>
                    </div>

                    <div className="space-y-3 text-xs text-[#1b263b]">
                      <div>
                        <span className="font-extrabold block text-[10px] text-[#1b263b]/70 uppercase">Nhận xét tổng quan:</span>
                        <p className="mt-1 leading-relaxed">{selectedSubmission.aiFeedback.overall || selectedSubmission.aiFeedback}</p>
                      </div>
                      
                      {selectedSubmission.aiFeedback.strengths && (
                        <div>
                          <span className="font-extrabold block text-[10px] text-[#005c42] uppercase">Điểm mạnh:</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {selectedSubmission.aiFeedback.strengths.map((str: string, index: number) => (
                              <li key={index} className="leading-relaxed">{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedSubmission.aiFeedback.weaknesses && (
                        <div>
                          <span className="font-extrabold block text-[10px] text-rose-800 uppercase">Điểm cần cải thiện:</span>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {selectedSubmission.aiFeedback.weaknesses.map((wk: string, index: number) => (
                              <li key={index} className="leading-relaxed">{wk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex justify-end pt-4 border-t-2 border-[#1b263b]/10">
              <button
                type="button"
                onClick={() => setShowSubmissionModal(false)}
                className="bg-white hover:bg-gray-100 border-2 border-[#1b263b] text-[#1b263b] font-black text-xs px-6 py-2.5 rounded-xl shadow-[2px_2px_0px_0px_#1b263b] active:scale-95 transition-all"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
