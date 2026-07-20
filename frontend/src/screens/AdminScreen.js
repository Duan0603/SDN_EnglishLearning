// ============================================================
// AdminScreen - Mobile First Dashboard with Brutalist Styling
// Redesigned to match the Brutalist aesthetics of HomeScreen
// ============================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
  Linking,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../store/useAuthStore';
import adminUserService from '../api/adminUser.service';
import examService from '../api/exam.service';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import client from '../api/client';

// Brutalist Shadow Wrapper matching HomeScreen / ProgressScreen
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style?.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style?.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style?.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const createExamTemplate = (type) => {
  const t = type.toUpperCase();
  if (t === 'LISTENING') {
    return Array.from({ length: 4 }, (_, i) => ({
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
    }));
  } else if (t === 'READING') {
    return Array.from({ length: 3 }, (_, i) => {
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
    });
  } else if (t === 'WRITING') {
    return [
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
    ];
  } else if (t === 'SPEAKING') {
    return [
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
    ];
  }
  return [];
};

const reindexQuestions = (sections) => {
  let currentNumber = 1;
  return (sections || []).map(sec => {
    const updatedQuestions = (sec.questions || []).map(q => {
      const newQ = { ...q, questionNumber: currentNumber };
      currentNumber++;
      return newQ;
    });
    return { ...sec, questions: updatedQuestions };
  });
};

const QuestionEditCard = ({ question, onChange, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.qCard}>
      <View style={[styles.qCardHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <TouchableOpacity 
          style={{ flex: 1, paddingVertical: 10 }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.qCardTitle}>
            Câu {question.questionNumber}: {question.content ? question.content.substring(0, 30) + (question.content.length > 30 ? '...' : '') : '(Chưa nhập nội dung)'}
          </Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={16} color="#c92a2a" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ padding: 4 }}>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#1b263b" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <View style={styles.qCardBody}>
          <Text style={styles.inputLabel}>Nội dung câu hỏi *</Text>
          <TextInput
            style={styles.modalInput}
            value={question.content}
            onChangeText={(val) => onChange('content', val)}
            placeholder="Nhập câu hỏi..."
          />

          <Text style={styles.inputLabel}>Loại câu hỏi / Question Type</Text>
          <View style={styles.typeSelectorRow}>
            {['FILL_IN_BLANKS', 'TRUE_FALSE_NOT_GIVEN', 'MULTIPLE_CHOICE', 'SHORT_ANSWER'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.qTypeBtn,
                  question.type === t && styles.qTypeBtnActive
                ]}
                onPress={() => onChange('type', t)}
              >
                <Text style={[
                  styles.qTypeBtnText,
                  question.type === t && styles.qTypeBtnActiveText
                ]}>
                  {t.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {question.type === 'MULTIPLE_CHOICE' && (
            <View>
              <Text style={styles.inputLabel}>Lựa chọn (Cách nhau bởi dấu phẩy)</Text>
              <TextInput
                style={styles.modalInput}
                value={question.options}
                onChangeText={(val) => onChange('options', val)}
                placeholder="A, B, C, D"
              />
            </View>
          )}

          <Text style={styles.inputLabel}>Đáp án đúng *</Text>
          <TextInput
            style={styles.modalInput}
            value={question.answer}
            onChangeText={(val) => onChange('answer', val)}
            placeholder="Ví dụ: TRUE, A, hoặc từ cần điền..."
          />

          <Text style={styles.inputLabel}>Giải thích đáp án</Text>
          <TextInput
            style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
            value={question.explanation}
            onChangeText={(val) => onChange('explanation', val)}
            placeholder="Nhập giải thích chi tiết..."
            multiline
          />
        </View>
      )}
    </View>
  );
};

const AdminScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'mentor_requests', 'submissions', 'exams', 'bookings'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSkillFilter, setActiveSkillFilter] = useState('ALL');

  // Lists State
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [examsList, setExamsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  // Modals state
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null if creating, user object if editing
  const [userForm, setUserForm] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'STUDENT'
  });

  const [examModalVisible, setExamModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null); // null if creating, exam object if editing
  const [examForm, setExamForm] = useState({
    title: '',
    type: 'READING',
    duration: '60',
    questionsCount: '40'
  });
  const [examStep, setExamStep] = useState(1); // 1: Info, 2: Sections & Questions
  const [modalSections, setModalSections] = useState([]);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handlePickAudioFile = async (sectionIdx) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedFile = result.assets[0];
      setUploadingAudio(true);

      let base64Data = '';
      if (Platform.OS === 'web') {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result || '').split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType?.Base64 || 'base64',
        });
      }

      const res = await client.post('/upload', {
        filename: selectedFile.name || `audio_${Date.now()}.mp3`,
        base64Data
      });

      if (res.data && res.data.success && res.data.data?.url) {
        const uploadedUrl = res.data.data.url;
        const updated = [...modalSections];
        updated[sectionIdx].audioUrl = uploadedUrl;
        setModalSections(updated);
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã tải lên file audio MP3 thành công!'
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tải lên file audio.');
      }
    } catch (err) {
      console.error('Pick and upload audio error:', err);
      Alert.alert('Lỗi', err.response?.data?.message || err.message || 'Lỗi khi tải file audio mp3.');
    } finally {
      setUploadingAudio(false);
    }
  };

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Fetch all administrative data
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [usersRes, requestsRes, subRes, examsRes, bookingsRes] = await Promise.allSettled([
        adminUserService.getAll(),
        adminUserService.getMentorRequests('PENDING'),
        adminUserService.getSubmissions(),
        examService.getAll(),
        adminUserService.getAllBookings()
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsersList(usersRes.value.data?.metadata?.users || usersRes.value.data?.data?.users || []);
      }
      if (requestsRes.status === 'fulfilled') {
        setRequestsList(requestsRes.value.data?.data || requestsRes.value.data?.metadata || []);
      }
      if (subRes.status === 'fulfilled') {
        setSubmissionsList(subRes.value.data?.metadata?.submissions || subRes.value.data?.data?.submissions || []);
      }
      if (examsRes.status === 'fulfilled') {
        // Handle paginated exams payload
        const rawExams = examsRes.value.data?.data?.exams || examsRes.value.data?.data || [];
        setExamsList(rawExams);
      }
      if (bookingsRes.status === 'fulfilled') {
        setBookingsList(bookingsRes.value.data?.data || bookingsRes.value.data?.metadata || []);
      }
    } catch (err) {
      console.log('Error loading administrative data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Actions for Users
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', fullName: '', email: '', phone: '', password: '', role: 'STUDENT' });
    setUserModalVisible(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({
      username: u.username || '',
      fullName: u.fullName || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '', // leave empty to avoid changing
      role: u.role || 'STUDENT'
    });
    setUserModalVisible(true);
  };

  const handleSaveUser = async () => {
    const { username, fullName, email, phone, password, role } = userForm;
    if (!username || !fullName || !email) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên đăng nhập, Họ tên và Email!');
      return;
    }

    try {
      setIsLoading(true);
      if (editingUser) {
        // Edit flow
        const updateData = { username, fullName, email, phone, role };
        if (password) updateData.password = password;
        const res = await adminUserService.update(editingUser.id || editingUser._id, updateData);
        if (res.data?.success) {
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật người dùng thành công!' });
          setUserModalVisible(false);
          fetchAllData(true);
        }
      } else {
        // Create flow
        if (!password) {
          Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cho người dùng mới!');
          setIsLoading(false);
          return;
        }
        const res = await adminUserService.create({ username, fullName, email, phone, password, role });
        if (res.data?.success) {
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Tạo người dùng mới thành công!' });
          setUserModalVisible(false);
          fetchAllData(true);
        }
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err.response?.data?.error?.message || err.response?.data?.message || 'Không thể lưu người dùng.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (u) => {
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'active' ? 'mở khóa' : 'khóa';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${actionLabel} tài khoản ${u.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await adminUserService.toggleStatus(u.id || u._id, nextStatus);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: `Đã ${actionLabel} tài khoản!` });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Thay đổi trạng thái thất bại.' });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (u) => {
    Alert.alert(
      'Cảnh báo xóa',
      `Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ${u.fullName}? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await adminUserService.remove(u.id || u._id);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Xóa tài khoản thành công!' });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: err.response?.data?.error?.message || err.response?.data?.message || 'Không thể xóa tài khoản.'
              });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Actions for Mentor Requests
  const handleApproveRequest = async (id) => {
    Alert.alert(
      'Xác nhận duyệt',
      'Bạn có chắc chắn phê duyệt tài khoản này làm Mentor?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Phê duyệt',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await adminUserService.approveMentorRequest(id);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Phê duyệt Mentor thành công!' });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Duyệt yêu cầu thất bại.' });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleOpenRejectRequest = (req) => {
    setSelectedRequest(req);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleRejectRequestSubmit = async () => {
    if (!rejectReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền lý do từ chối!');
      return;
    }
    try {
      setIsLoading(true);
      const res = await adminUserService.rejectMentorRequest(selectedRequest.id || selectedRequest._id, rejectReason);
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã từ chối yêu cầu thành công.' });
        setRejectModalVisible(false);
        fetchAllData(true);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Từ chối yêu cầu thất bại.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Actions for Exams
  const handleOpenCreateExam = () => {
    setEditingExam(null);
    setExamForm({ title: '', type: 'READING', duration: '60', questionsCount: '40' });
    setModalSections([]);
    setSelectedSectionIdx(0);
    setExamStep(1);
    setExamModalVisible(true);
  };

  const handleOpenEditExam = async (exam) => {
    try {
      setIsLoading(true);
      const res = await examService.getById(exam.id || exam._id);
      const fullExam = res.data?.data;
      if (!fullExam) {
        Alert.alert('Lỗi', 'Không thể tải chi tiết đề thi.');
        return;
      }
      setEditingExam(fullExam);
      setExamForm({
        title: fullExam.title || '',
        type: fullExam.type || 'READING',
        duration: fullExam.duration?.toString() || '60',
        questionsCount: fullExam.questionsCount?.toString() || '40'
      });
      // Standardize sections & questions
      const formatted = (fullExam.sections || []).map(sec => ({
        sectionOrder: sec.sectionOrder,
        title: sec.title || '',
        passageText: sec.passageText || '',
        audioUrl: sec.audioUrl || '',
        images: sec.images || [],
        questions: (sec.questions || []).map(q => ({
          questionNumber: q.questionNumber,
          type: q.type || 'FILL_IN_BLANKS',
          content: q.content || '',
          options: q.options ? q.options.join(', ') : '',
          answer: q.answer || '',
          explanation: q.explanation || ''
        }))
      }));
      setModalSections(formatted);
      setSelectedSectionIdx(0);
      setExamStep(1);
      setExamModalVisible(true);
    } catch (err) {
      console.log('Error opening edit exam:', err);
      Alert.alert('Lỗi', 'Không thể kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextExamStep = () => {
    const { title, type } = examForm;
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề đề thi!');
      return;
    }
    if (modalSections.length === 0) {
      const templates = createExamTemplate(type);
      setModalSections(templates);
    }
    setSelectedSectionIdx(0);
    setExamStep(2);
  };

  const handleSaveExam = async () => {
    const { title, type, duration } = examForm;
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề đề thi!');
      return;
    }

    // Save Section/Questions to database
    const formattedSections = modalSections.map(sec => ({
      sectionOrder: sec.sectionOrder,
      title: sec.title,
      passageText: sec.passageText || null,
      audioUrl: sec.audioUrl || null,
      images: sec.images || [],
      questions: (sec.questions || []).map((q) => ({
        questionNumber: parseInt(q.questionNumber, 10),
        type: q.type,
        content: q.content,
        options: q.options && typeof q.options === 'string'
          ? q.options.split(',').map((o) => o.trim()).filter(Boolean)
          : Array.isArray(q.options)
          ? q.options
          : null,
        answer: q.answer,
        explanation: q.explanation || null
      }))
    }));

    const payload = {
      title,
      description: `Exam for IELTS ${type}`,
      type: type.toUpperCase(),
      duration: parseInt(duration, 10) || 60,
      sections: formattedSections
    };

    try {
      setIsLoading(true);
      if (editingExam) {
        const res = await examService.update(editingExam.id || editingExam._id, payload);
        if (res.data?.success) {
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Cập nhật đề thi thành công!' });
          setExamModalVisible(false);
          fetchAllData(true);
        }
      } else {
        const res = await examService.create(payload);
        if (res.data?.success) {
          Toast.show({ type: 'success', text1: 'Thành công', text2: 'Tạo đề thi mới thành công!' });
          setExamModalVisible(false);
          fetchAllData(true);
        }
      }
    } catch (err) {
      console.log('Error saving exam:', err);
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lưu đề thi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (exam) => {
    Alert.alert(
      'Cảnh báo xóa',
      `Bạn có chắc muốn xóa đề thi: "${exam.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await examService.remove(exam.id || exam._id);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Xóa đề thi thành công!' });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Xóa đề thi thất bại.' });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Actions for Submissions (Grades)
  const handleDeleteSubmission = async (sub) => {
    Alert.alert(
      'Xác nhận xóa',
      'Xóa kết quả thi này khỏi bảng xếp hạng của học viên?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const type = sub.type || 'Reading';
              const res = await adminUserService.deleteSubmission(sub.id, type);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Xóa kết quả thi thành công!' });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Xóa kết quả thất bại.' });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Actions for Bookings
  const handleConfirmBooking = async (id) => {
    try {
      setIsLoading(true);
      const res = await adminUserService.confirmBooking(id);
      if (res.data?.success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã xác nhận buổi học!' });
        fetchAllData(true);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xác nhận lịch học.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    Alert.alert(
      'Hủy lịch học',
      'Bạn có chắc chắn muốn hủy lịch học này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý hủy',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await adminUserService.cancelBooking(id);
              if (res.data?.success) {
                Toast.show({ type: 'success', text1: 'Thành công', text2: 'Hủy lịch học thành công.' });
                fetchAllData(true);
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Hủy lịch thất bại.' });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Memoized lists filtered by search and tabs
  const filteredUsers = useMemo(() => {
    return usersList.filter(u =>
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [usersList, searchQuery]);

  const filteredExams = useMemo(() => {
    let list = examsList;
    if (activeSkillFilter !== 'ALL') {
      list = list.filter(e => e.type?.toUpperCase() === activeSkillFilter);
    }
    return list.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [examsList, searchQuery, activeSkillFilter]);

  const filteredSubmissions = useMemo(() => {
    let list = submissionsList;
    if (activeSkillFilter !== 'ALL') {
      list = list.filter(s => s.type?.toUpperCase() === activeSkillFilter);
    }
    return list.filter(s =>
      s.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.test?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [submissionsList, searchQuery, activeSkillFilter]);

  const filteredBookings = useMemo(() => {
    return bookingsList.filter(b =>
      b.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mentor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookingsList, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const getRoleColor = (role) => {
    if (role === 'ADMIN') return '#c92a2a';
    if (role === 'MENTOR') return '#005c42';
    return '#4682b4';
  };

  const getSkillColor = (type) => {
    const t = type?.toUpperCase();
    if (t === 'READING') return '#4682b4';
    if (t === 'LISTENING') return '#005c42';
    if (t === 'WRITING') return '#d97706';
    if (t === 'SPEAKING') return '#c92a2a';
    return '#1b263b';
  };

  const adminName = user?.fullName?.split(' ').slice(-1)[0] || 'Admin';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* App Bar (Brutalist style matching HomeScreen) */}
      <View style={styles.appBar}>
        <TouchableOpacity 
          style={styles.appBarBtn} 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.replace('Main');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#1b263b" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>ADMIN PANEL</Text>
        <TouchableOpacity 
          style={styles.appBarBtn} 
          onPress={() => {
            Alert.alert(
              'Đăng xuất',
              'Bạn có chắc chắn muốn đăng xuất không?',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Đăng xuất',
                  style: 'destructive',
                  onPress: () => { logout(); navigation.replace('Login'); }
                }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#c92a2a" />
        </TouchableOpacity>
      </View>

      {/* Tabs Menu in high contrast brutalist styles */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { key: 'dashboard', label: 'TỔNG QUAN', icon: 'grid-outline' },
            { key: 'users', label: 'NGƯỜI DÙNG', icon: 'people-outline' },
            { key: 'mentor_requests', label: 'DUYỆT MENTOR', icon: 'ribbon-outline' },
            { key: 'submissions', label: 'ĐIỂM SỐ', icon: 'trophy-outline' },
            { key: 'exams', label: 'ĐỀ THI', icon: 'book-outline' },
            { key: 'bookings', label: 'LỊCH HỌC', icon: 'calendar-outline' },
          ].map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  setSearchQuery('');
                }}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Ionicons name={tab.icon} size={15} color={isActive ? '#fff' : '#1b263b'} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1b263b" />
          <Text style={styles.loadingText}>Đang đồng bộ dữ liệu hệ thống...</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchAllData(true);
              setRefreshing(false);
            }}
            tintColor="#1b263b"
          />
        }
      >
        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <View>
            {/* Greeting Sticky Note with tape effect */}
            <View style={styles.heroSection}>
              <View style={styles.stickyNote}>
                <View style={styles.tape} />
                <Text style={styles.stickyGreeting}>Hey {adminName} –</Text>
                <Text style={styles.stickyText}>
                  Hệ thống đang chạy ổn định. Dưới đây là báo cáo tổng quát các hoạt động và cơ sở dữ liệu Apex IELTS của bạn ngày hôm nay.
                </Text>
                <View style={styles.stickyFooter}>
                  <Text style={styles.stickyBadge}>SYSTEM ACTIVE</Text>
                  <View style={styles.streakBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#005c42" />
                    <Text style={styles.streakText}>Secure Connection</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* KPI Cards Wrapper */}
            <Text style={styles.sectionBadge}>✎ METRICS</Text>
            <Text style={styles.sectionTitle}>Database Overview</Text>

            <View style={styles.kpiGrid}>
              {[
                { label: 'TỔNG USER', value: usersList.length, color: '#4682b4', emoji: '👥' },
                { label: 'MENTOR CHỜ', value: requestsList.length, color: '#c92a2a', emoji: '🎖️' },
                { label: 'BÀI LÀM', value: submissionsList.length, color: '#d97706', emoji: '📝' },
                { label: 'ĐỀ THI', value: examsList.length, color: '#1b263b', emoji: '📖' },
                { label: 'LỊCH HỌC', value: bookingsList.length, color: '#7b2cbf', emoji: '🗓️' },
                { label: 'GIA SƯ', value: usersList.filter(u => u.role === 'MENTOR').length, color: '#005c42', emoji: '👨‍🏫' },
              ].map((kpi, idx) => (
                <BrutalistShadow key={idx} style={styles.kpiCard} offset={4}>
                  <View style={styles.kpiInner}>
                    <View style={styles.kpiHeader}>
                      <Text style={styles.kpiEmoji}>{kpi.emoji}</Text>
                      <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
                    </View>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  </View>
                </BrutalistShadow>
              ))}
            </View>

            {/* Recent Log Activities */}
            <Text style={styles.sectionBadge}>✎ LOGS</Text>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            <BrutalistShadow style={styles.logCard} offset={4}>
              <View style={styles.logCardInner}>
                {submissionsList.slice(0, 4).map((sub, idx) => (
                  <View key={idx} style={styles.logItem}>
                    <View style={[styles.logDot, { backgroundColor: getSkillColor(sub.type) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logText}>
                        <Text style={styles.logBold}>{sub.student?.fullName || 'Học viên'}</Text> nộp bài thi{' '}
                        <Text style={styles.logBold}>{sub.test?.title || 'Practice Test'}</Text> đạt{' '}
                        <Text style={[styles.logBold, { color: getSkillColor(sub.type) }]}>Band {sub.bandScore?.toFixed(1) || '—'}</Text>
                      </Text>
                      <Text style={styles.logTime}>{formatDate(sub.createdAt)}</Text>
                    </View>
                  </View>
                ))}
                {requestsList.slice(0, 2).map((req, idx) => (
                  <View key={`req-${idx}`} style={styles.logItem}>
                    <View style={[styles.logDot, { backgroundColor: '#c92a2a' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logText}>
                        Yêu cầu nâng cấp Mentor mới từ <Text style={styles.logBold}>{req.user?.fullName || 'Người dùng'}</Text> đang chờ phê duyệt.
                      </Text>
                      <Text style={styles.logTime}>{formatDate(req.createdAt)}</Text>
                    </View>
                  </View>
                ))}
                {submissionsList.length === 0 && requestsList.length === 0 && (
                  <Text style={styles.emptyText}>Chưa ghi nhận hoạt động nào gần đây.</Text>
                )}
              </View>
            </BrutalistShadow>
          </View>
        )}

        {/* ==================== USERS TAB ==================== */}
        {activeTab === 'users' && (
          <View>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.brutalistInput}
                placeholder="Tìm kiếm theo Tên, Email..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.actionBtnContainer}
              onPress={handleOpenCreateUser}
            >
              <BrutalistShadow style={styles.createBtn} offset={3}>
                <View style={styles.createBtnInner}>
                  <Ionicons name="person-add-outline" size={16} color="#1b263b" />
                  <Text style={styles.createBtnText}>THÊM USER MỚI</Text>
                </View>
              </BrutalistShadow>
            </TouchableOpacity>

            <Text style={styles.sectionBadge}>✎ MEMBERSHIP</Text>
            <Text style={styles.sectionTitle}>User Database ({filteredUsers.length})</Text>

            {filteredUsers.map((u) => (
              <View key={u.id || u._id} style={styles.listCardContainer}>
                <BrutalistShadow style={styles.listCard} offset={4}>
                  <View style={styles.listCardInner}>
                    <View style={styles.listCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listCardTitle}>{u.fullName}</Text>
                        <Text style={styles.listCardSub}>@{u.username || 'unknown'} • {u.email}</Text>
                        {u.phone ? <Text style={styles.listCardSub}>SĐT: {u.phone}</Text> : null}
                      </View>
                      
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={[styles.badge, { backgroundColor: getRoleColor(u.role) }]}>
                          <Text style={styles.badgeText}>{u.role}</Text>
                        </View>
                        
                        <View style={[styles.badge, { backgroundColor: u.status === 'active' ? '#e6f9f5' : '#fee2e2', borderColor: u.status === 'active' ? '#00A87E' : '#EF4444' }]}>
                          <Text style={[styles.badgeText, { color: u.status === 'active' ? '#00A87E' : '#EF4444' }]}>
                            {u.status === 'active' ? 'Active' : 'Locked'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Actions button group */}
                    <View style={styles.cardActionsGroup}>
                      <TouchableOpacity 
                        style={[styles.brutalistMiniBtn, { backgroundColor: u.status === 'active' ? '#ffeb3b' : '#a7f3d0' }]}
                        onPress={() => handleToggleUserStatus(u)}
                      >
                        <Ionicons name={u.status === 'active' ? 'lock-closed-outline' : 'lock-open-outline'} size={14} color="#1b263b" />
                        <Text style={styles.brutalistMiniBtnText}>{u.status === 'active' ? 'KHÓA' : 'MỞ KHÓA'}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.brutalistMiniBtn, { backgroundColor: '#e1f5fe' }]}
                        onPress={() => handleOpenEditUser(u)}
                      >
                        <Ionicons name="create-outline" size={14} color="#1b263b" />
                        <Text style={styles.brutalistMiniBtnText}>SỬA</Text>
                      </TouchableOpacity>

                      {u.role !== 'ADMIN' && (
                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#fee2e2' }]}
                          onPress={() => handleDeleteUser(u)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#c92a2a" />
                          <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>XÓA</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>
                </BrutalistShadow>
              </View>
            ))}

            {filteredUsers.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy người dùng nào phù hợp.</Text>
            )}
          </View>
        )}

        {/* ==================== MENTOR REQUESTS TAB ==================== */}
        {activeTab === 'mentor_requests' && (
          <View>
            <Text style={styles.sectionBadge}>✎ APPLICANTS</Text>
            <Text style={styles.sectionTitle}>Upgrade Requests ({requestsList.length})</Text>

            {requestsList.map((req) => (
              <View key={req.id || req._id} style={styles.listCardContainer}>
                <BrutalistShadow style={styles.listCard} offset={4}>
                  <View style={styles.listCardInner}>
                    <View style={styles.listCardHeader}>
                      <View>
                        <Text style={styles.listCardTitle}>{req.user?.fullName || 'Người dùng'}</Text>
                        <Text style={styles.listCardSub}>Email: {req.user?.email}</Text>
                        <Text style={styles.listCardSub}>Số điện thoại: {req.user?.phone || 'Chưa cung cấp'}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: '#ffe082' }]}>
                        <Text style={[styles.badgeText, { color: '#b58100' }]}>PENDING</Text>
                      </View>
                    </View>

                    <View style={styles.requestDetailBox}>
                      <Text style={styles.requestDetailHeader}>Chuyên môn:</Text>
                      <Text style={styles.requestDetailContent}>{req.expertise}</Text>

                      <Text style={styles.requestDetailHeader}>Tiểu sử / Bio:</Text>
                      <Text style={styles.requestDetailContent}>{req.bio}</Text>

                      <Text style={styles.requestDetailHeader}>Chứng chỉ đính kèm:</Text>
                      {req.certificates && req.certificates.length > 0 ? (
                        req.certificates.map((url, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.certificateBtn}
                            onPress={() => Linking.openURL(url)}
                          >
                            <Ionicons name="document-attach-outline" size={16} color="#4682b4" />
                            <Text style={styles.certificateBtnText}>Xem chứng chỉ {idx + 1}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.requestDetailContent}>Không tải lên tài liệu.</Text>
                      )}
                    </View>

                    <View style={styles.cardActionsGroup}>
                      <TouchableOpacity 
                        style={[styles.brutalistMiniBtn, { backgroundColor: '#a7f3d0', flex: 1 }]}
                        onPress={() => handleApproveRequest(req.id || req._id)}
                      >
                        <Ionicons name="checkmark-circle-outline" size={15} color="#005c42" />
                        <Text style={[styles.brutalistMiniBtnText, { color: '#005c42' }]}>PHÊ DUYỆT</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.brutalistMiniBtn, { backgroundColor: '#fee2e2', flex: 1 }]}
                        onPress={() => handleOpenRejectRequest(req)}
                      >
                        <Ionicons name="close-circle-outline" size={15} color="#c92a2a" />
                        <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>TỪ CHỐI</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                </BrutalistShadow>
              </View>
            ))}

            {requestsList.length === 0 && (
              <Text style={styles.emptyText}>Hiện không có yêu cầu nâng cấp Mentor nào.</Text>
            )}
          </View>
        )}

        {/* ==================== SUBMISSIONS (GRADES) TAB ==================== */}
        {activeTab === 'submissions' && (
          <View>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.brutalistInput}
                placeholder="Tìm học viên, đề thi..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Skill type selector buttons */}
            <View style={styles.subFilterRow}>
              {['ALL', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.subFilterBtn, activeSkillFilter === skill && styles.subFilterBtnActive]}
                  onPress={() => setActiveSkillFilter(skill)}
                >
                  <Text style={[styles.subFilterText, activeSkillFilter === skill && styles.subFilterTextActive]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionBadge}>✎ REPORT CARD</Text>
            <Text style={styles.sectionTitle}>Exam Submissions ({filteredSubmissions.length})</Text>

            {filteredSubmissions.map((sub) => {
              const color = getSkillColor(sub.type);
              return (
                <View key={sub.id} style={styles.listCardContainer}>
                  <BrutalistShadow style={styles.listCard} offset={4}>
                    <View style={styles.listCardInner}>
                      <View style={styles.listCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listCardTitle} numberOfLines={1}>{sub.test?.title || 'Luyện tập tự do'}</Text>
                          <Text style={styles.listCardSub}>Học viên: {sub.student?.fullName || 'Học viên ẩn danh'}</Text>
                          <Text style={styles.listCardSub}>Email: {sub.student?.email || '—'}</Text>
                          <Text style={styles.listCardSub}>Ngày thi: {formatDate(sub.createdAt)}</Text>
                        </View>
                        
                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                          <View style={[styles.badge, { backgroundColor: color }]}>
                            <Text style={styles.badgeText}>{sub.type?.toUpperCase()}</Text>
                          </View>
                          
                          <View style={styles.brutalistScoreBadge}>
                            <Text style={styles.brutalistScoreLabel}>BAND</Text>
                            <Text style={[styles.brutalistScoreValue, { color }]}>{sub.bandScore?.toFixed(1) || '—'}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Small stats summary inside */}
                      <View style={styles.subStatsRow}>
                        {sub.correctCount != null && (
                          <Text style={styles.subStatText}>✅ {sub.correctCount}/40 câu đúng</Text>
                        )}
                        {sub.timeTaken != null && (
                          <Text style={styles.subStatText}>⏱️ {Math.round(sub.timeTaken / 60)} phút làm bài</Text>
                        )}
                      </View>

                      <View style={styles.cardActionsGroup}>
                        {(sub.type?.toUpperCase() === 'WRITING' || sub.type?.toUpperCase() === 'SPEAKING') && (
                          <TouchableOpacity 
                            style={[styles.brutalistMiniBtn, { backgroundColor: '#ffd54f', flex: 1.5 }]}
                            onPress={() => {
                              setSelectedSubmission(sub);
                              setSubmissionModalVisible(true);
                            }}
                          >
                            <Ionicons name="analytics-outline" size={14} color="#1b263b" />
                            <Text style={styles.brutalistMiniBtnText}>XEM AI FEEDBACK</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#fee2e2', flex: 1 }]}
                          onPress={() => handleDeleteSubmission(sub)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#c92a2a" />
                          <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>XÓA ĐIỂM</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  </BrutalistShadow>
                </View>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy kết quả làm bài nào.</Text>
            )}
          </View>
        )}

        {/* ==================== EXAMS TAB ==================== */}
        {activeTab === 'exams' && (
          <View>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.brutalistInput}
                placeholder="Tìm tên đề thi..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.subFilterRow}>
              {['ALL', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.subFilterBtn, activeSkillFilter === skill && styles.subFilterBtnActive]}
                  onPress={() => setActiveSkillFilter(skill)}
                >
                  <Text style={[styles.subFilterText, activeSkillFilter === skill && styles.subFilterTextActive]}>
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.actionBtnContainer}
              onPress={handleOpenCreateExam}
            >
              <BrutalistShadow style={styles.createBtn} offset={3}>
                <View style={styles.createBtnInner}>
                  <Ionicons name="add-circle-outline" size={16} color="#1b263b" />
                  <Text style={styles.createBtnText}>TẠO ĐỀ THI MỚI</Text>
                </View>
              </BrutalistShadow>
            </TouchableOpacity>

            <Text style={styles.sectionBadge}>✎ STORAGE</Text>
            <Text style={styles.sectionTitle}>Practice Exams ({filteredExams.length})</Text>

            {filteredExams.map((exam) => {
              const color = getSkillColor(exam.type);
              return (
                <View key={exam.id || exam._id} style={styles.listCardContainer}>
                  <BrutalistShadow style={styles.listCard} offset={4}>
                    <View style={styles.listCardInner}>
                      <View style={styles.listCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listCardTitle} numberOfLines={2}>{exam.title}</Text>
                          <Text style={styles.listCardSub}>Thời gian: {exam.duration || 0} Phút</Text>
                          {exam.questionsCount != null ? (
                            <Text style={styles.listCardSub}>Số câu hỏi: {exam.questionsCount} câu</Text>
                          ) : null}
                        </View>
                        
                        <View style={[styles.badge, { backgroundColor: color }]}>
                          <Text style={styles.badgeText}>{exam.type?.toUpperCase()}</Text>
                        </View>
                      </View>

                      <View style={styles.cardActionsGroup}>
                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#e1f5fe', flex: 1 }]}
                          onPress={() => handleOpenEditExam(exam)}
                        >
                          <Ionicons name="create-outline" size={14} color="#1b263b" />
                          <Text style={styles.brutalistMiniBtnText}>SỬA ĐỀ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#fee2e2', flex: 1 }]}
                          onPress={() => handleDeleteExam(exam)}
                        >
                          <Ionicons name="trash-outline" size={14} color="#c92a2a" />
                          <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>XÓA ĐỀ</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  </BrutalistShadow>
                </View>
              );
            })}

            {filteredExams.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy đề thi nào phù hợp.</Text>
            )}
          </View>
        )}

        {/* ==================== BOOKINGS TAB ==================== */}
        {activeTab === 'bookings' && (
          <View>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.brutalistInput}
                placeholder="Tìm gia sư, học sinh..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.sectionBadge}>✎ SCHEDULES</Text>
            <Text style={styles.sectionTitle}>Active Bookings ({filteredBookings.length})</Text>

            {filteredBookings.map((b) => (
              <View key={b.id || b._id} style={styles.listCardContainer}>
                <BrutalistShadow style={styles.listCard} offset={4}>
                  <View style={styles.listCardInner}>
                    <View style={styles.listCardHeader}>
                      <View>
                        <Text style={styles.listCardTitle}>
                          🎙️ {b.mentor?.fullName || 'Gia sư'} & {b.student?.fullName || 'Học viên'}
                        </Text>
                        <Text style={styles.listCardSub}>Bắt đầu: {formatDate(b.availability?.startTime)}</Text>
                        <Text style={styles.listCardSub}>Kết thúc: {formatDate(b.availability?.endTime)}</Text>
                      </View>
                      
                      <View style={[styles.badge, { 
                        backgroundColor: b.status === 'CONFIRMED' ? '#e6f9f5' : b.status === 'PENDING' ? '#ffe082' : '#fee2e2'
                      }]}>
                        <Text style={[styles.badgeText, { 
                          color: b.status === 'CONFIRMED' ? '#005c42' : b.status === 'PENDING' ? '#b58100' : '#c92a2a'
                        }]}>
                          {b.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActionsGroup}>
                      {b.status === 'PENDING' && (
                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#a7f3d0', flex: 1 }]}
                          onPress={() => handleConfirmBooking(b.id || b._id)}
                        >
                          <Ionicons name="checkmark-circle-outline" size={14} color="#005c42" />
                          <Text style={[styles.brutalistMiniBtnText, { color: '#005c42' }]}>XÁC NHẬN</Text>
                        </TouchableOpacity>
                      )}

                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <TouchableOpacity 
                          style={[styles.brutalistMiniBtn, { backgroundColor: '#fee2e2', flex: 1 }]}
                          onPress={() => handleCancelBooking(b.id || b._id)}
                        >
                          <Ionicons name="close-circle-outline" size={14} color="#c92a2a" />
                          <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>HỦY LỊCH</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                  </View>
                </BrutalistShadow>
              </View>
            ))}

            {filteredBookings.length === 0 && (
              <Text style={styles.emptyText}>Không tìm thấy lịch học nào.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* ==================== USER MODAL (CREATE / EDIT) ==================== */}
      <Modal visible={userModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={styles.modalContainer} offset={6}>
            <View style={styles.modalInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingUser ? 'Cập nhật User' : 'Tạo User Mới'}</Text>
                <TouchableOpacity onPress={() => setUserModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 400 }}>
                <Text style={styles.inputLabel}>Tên đăng nhập / Username *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={userForm.username}
                  onChangeText={(val) => setUserForm({ ...userForm, username: val })}
                  placeholder="Nhập username..."
                />

                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={userForm.fullName}
                  onChangeText={(val) => setUserForm({ ...userForm, fullName: val })}
                  placeholder="Nhập họ và tên..."
                />

                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={userForm.email}
                  onChangeText={(val) => setUserForm({ ...userForm, email: val })}
                  placeholder="Nhập email..."
                  keyboardType="email-address"
                />

                <Text style={styles.inputLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.modalInput}
                  value={userForm.phone}
                  onChangeText={(val) => setUserForm({ ...userForm, phone: val })}
                  placeholder="Nhập số điện thoại..."
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Vai trò / Role</Text>
                <View style={styles.rolePickerRow}>
                  {['STUDENT', 'MENTOR', 'ADMIN'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleSelectBtn, userForm.role === r && styles.roleSelectBtnActive]}
                      onPress={() => setUserForm({ ...userForm, role: r })}
                    >
                      <Text style={[styles.roleSelectText, userForm.role === r && styles.roleSelectTextActive]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>
                  Mật khẩu {editingUser ? '(Để trống nếu giữ nguyên)' : '*'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={userForm.password}
                  onChangeText={(val) => setUserForm({ ...userForm, password: val })}
                  placeholder="Nhập mật khẩu..."
                  secureTextEntry
                />
              </ScrollView>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.modalSaveBtnContainer}
                onPress={handleSaveUser}
              >
                <BrutalistShadow style={styles.modalSaveBtn} offset={3}>
                  <View style={styles.modalSaveBtnInner}>
                    <Text style={styles.modalSaveBtnText}>LƯU THÔNG TIN</Text>
                  </View>
                </BrutalistShadow>
              </TouchableOpacity>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* ==================== EXAM MODAL (CREATE / EDIT) ==================== */}
      <Modal visible={examModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={styles.modalContainer} offset={6}>
            <View style={styles.modalInner}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingExam ? 'Sửa Đề Thi' : 'Tạo Đề Thi Mới'} {examStep === 2 ? '(Bước 2/2)' : '(Bước 1/2)'}
                </Text>
                <TouchableOpacity onPress={() => setExamModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              {examStep === 1 ? (
                <View>
                  <ScrollView style={{ maxHeight: 380 }}>
                    <Text style={styles.inputLabel}>Tiêu đề đề thi *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={examForm.title}
                      onChangeText={(val) => setExamForm({ ...examForm, title: val })}
                      placeholder="Ví dụ: Cambridge 18 - Reading Test 1"
                    />

                    <Text style={styles.inputLabel}>Kỹ năng / Skill Type</Text>
                    <View style={styles.rolePickerRow}>
                      {['READING', 'LISTENING', 'WRITING', 'SPEAKING'].map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={[styles.roleSelectBtn, examForm.type === t && styles.roleSelectBtnActive]}
                          onPress={() => setExamForm({ ...examForm, type: t })}
                        >
                          <Text style={[styles.roleSelectText, examForm.type === t && styles.roleSelectTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.inputLabel}>Thời gian làm bài (Phút)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={examForm.duration}
                      onChangeText={(val) => setExamForm({ ...examForm, duration: val })}
                      placeholder="60"
                      keyboardType="number-pad"
                    />
                  </ScrollView>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    style={styles.modalSaveBtnContainer}
                    onPress={handleNextExamStep}
                  >
                    <BrutalistShadow style={styles.modalSaveBtn} offset={3}>
                      <View style={styles.modalSaveBtnInner}>
                        <Text style={styles.modalSaveBtnText}>TIẾP TỤC (CẤU HÌNH ĐỀ)</Text>
                      </View>
                    </BrutalistShadow>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Step 2: Section / Questions Wizard */}
                  <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                    {/* Section Horizontal tabs and Add button */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.sectionTabsScroll, { marginBottom: 0 }]}>
                        {modalSections.map((sec, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={[
                              styles.sectionTabBtn,
                              selectedSectionIdx === idx && styles.sectionTabBtnActive
                            ]}
                            onPress={() => setSelectedSectionIdx(idx)}
                          >
                            <Text style={[
                              styles.sectionTabBtnText,
                              selectedSectionIdx === idx && styles.sectionTabBtnActiveText
                            ]}>
                              {sec.title || `Phần ${idx + 1}`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      
                      <TouchableOpacity
                        style={[styles.sectionTabBtn, { backgroundColor: '#ffd54f', marginLeft: 6, minWidth: 32, alignItems: 'center', justifyContent: 'center' }]}
                        onPress={() => {
                          const newOrder = modalSections.length + 1;
                          const type = examForm.type.toUpperCase();
                          let defaultTitle = `Section ${newOrder}`;
                          if (type === 'READING') defaultTitle = `Passage ${newOrder}`;
                          else if (type === 'WRITING') defaultTitle = `Writing Task ${newOrder}`;
                          else if (type === 'SPEAKING') defaultTitle = `Part ${newOrder}`;

                          const newSec = {
                            sectionOrder: newOrder,
                            title: defaultTitle,
                            audioUrl: '',
                            passageText: '',
                            images: [],
                            questions: []
                          };
                          setModalSections([...modalSections, newSec]);
                          setSelectedSectionIdx(modalSections.length); // Select new section
                        }}
                      >
                        <Ionicons name="add" size={14} color="#1b263b" />
                      </TouchableOpacity>
                    </View>

                    {modalSections[selectedSectionIdx] && (
                      <View style={styles.sectionEditArea}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={styles.inputLabel}>Tiêu đề phần / Section Title</Text>
                          {modalSections.length > 1 && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2, paddingHorizontal: 6 }}
                              onPress={() => {
                                Alert.alert(
                                  'Xác nhận xóa',
                                  `Bạn có chắc chắn muốn xóa phần "${modalSections[selectedSectionIdx].title || `Phần ${selectedSectionIdx + 1}`}" và toàn bộ câu hỏi bên trong?`,
                                  [
                                    { text: 'Hủy', style: 'cancel' },
                                    {
                                      text: 'Xóa',
                                      style: 'destructive',
                                      onPress: () => {
                                        const updated = modalSections.filter((_, sIdx) => sIdx !== selectedSectionIdx);
                                        // Re-index sectionOrder
                                        const standardized = updated.map((sec, sIdx) => ({
                                          ...sec,
                                          sectionOrder: sIdx + 1
                                        }));
                                        const reindexed = reindexQuestions(standardized);
                                        setModalSections(reindexed);
                                        setSelectedSectionIdx(Math.max(0, selectedSectionIdx - 1));
                                      }
                                    }
                                  ]
                                );
                              }}
                            >
                              <Ionicons name="trash-outline" size={12} color="#c92a2a" />
                              <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#c92a2a' }}>Xóa phần này</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <TextInput
                          style={styles.modalInput}
                          value={modalSections[selectedSectionIdx].title}
                          onChangeText={(val) => {
                            const updated = [...modalSections];
                            updated[selectedSectionIdx].title = val;
                            setModalSections(updated);
                          }}
                          placeholder="Nhập tiêu đề phần..."
                        />

                        {/* Section Audio URL (Listening only) */}
                        {examForm.type === 'LISTENING' && (
                          <View style={{ gap: 6 }}>
                            <Text style={styles.inputLabel}>Audio URL (File .mp3)</Text>
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                              <TextInput
                                style={[styles.modalInput, { flex: 1, marginBottom: 0 }]}
                                value={modalSections[selectedSectionIdx].audioUrl || ''}
                                onChangeText={(val) => {
                                  const updated = [...modalSections];
                                  updated[selectedSectionIdx].audioUrl = val;
                                  setModalSections(updated);
                                }}
                                placeholder="Nhập link hoặc chọn file .mp3..."
                              />
                              <TouchableOpacity
                                style={{
                                  backgroundColor: '#1b263b',
                                  paddingHorizontal: 12,
                                  paddingVertical: 10,
                                  borderRadius: 8,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                                onPress={() => handlePickAudioFile(selectedSectionIdx)}
                                disabled={uploadingAudio}
                              >
                                {uploadingAudio ? (
                                  <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                  <>
                                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Tải MP3</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {/* Section Passage Text (Reading, Writing, Speaking) */}
                        {examForm.type !== 'LISTENING' && (
                          <View>
                            <Text style={styles.inputLabel}>
                              {examForm.type === 'READING' ? 'Bài đọc / Passage Text' :
                               examForm.type === 'WRITING' ? 'Mô tả đề bài / Task Prompt' :
                               'Gợi ý phần nói / Part Prompt'}
                            </Text>
                            <TextInput
                              style={[styles.modalInput, { height: 120, textAlignVertical: 'top' }]}
                              value={modalSections[selectedSectionIdx].passageText || ''}
                              onChangeText={(val) => {
                                const updated = [...modalSections];
                                updated[selectedSectionIdx].passageText = val;
                                setModalSections(updated);
                              }}
                              placeholder="Nhập nội dung văn bản..."
                              multiline
                            />
                          </View>
                        )}

                        {/* Questions List (Listening, Reading, Speaking only) */}
                        {examForm.type !== 'WRITING' && (
                          <View style={{ marginTop: 15 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <Text style={[styles.inputLabel, { fontSize: 13, marginBottom: 0, fontFamily: 'Outfit_700Bold' }]}>
                                Danh sách câu hỏi ({modalSections[selectedSectionIdx].questions?.length || 0})
                              </Text>
                              <TouchableOpacity
                                style={[styles.brutalistMiniBtn, { backgroundColor: '#ffd54f', paddingVertical: 4, paddingHorizontal: 8 }]}
                                onPress={() => {
                                  const updated = [...modalSections];
                                  const currentSec = updated[selectedSectionIdx];
                                  const newQ = {
                                    questionNumber: 1, // Will be reindexed
                                    type: 'FILL_IN_BLANKS',
                                    content: '',
                                    options: '',
                                    answer: '',
                                    explanation: ''
                                  };
                                  currentSec.questions = [...(currentSec.questions || []), newQ];
                                  const reindexed = reindexQuestions(updated);
                                  setModalSections(reindexed);
                                }}
                              >
                                <Ionicons name="add" size={12} color="#1b263b" />
                                <Text style={[styles.brutalistMiniBtnText, { fontSize: 8 }]}>THÊM CÂU HỎI</Text>
                              </TouchableOpacity>
                            </View>
                            
                            {(modalSections[selectedSectionIdx].questions || []).map((q, qIdx) => (
                              <QuestionEditCard
                                key={qIdx}
                                question={q}
                                onChange={(field, val) => {
                                  const updated = [...modalSections];
                                  updated[selectedSectionIdx].questions[qIdx][field] = val;
                                  setModalSections(updated);
                                }}
                                onDelete={() => {
                                  Alert.alert(
                                    'Xác nhận xóa câu hỏi',
                                    `Bạn có chắc chắn muốn xóa Câu ${q.questionNumber}?`,
                                    [
                                      { text: 'Hủy', style: 'cancel' },
                                      {
                                        text: 'Xóa',
                                        style: 'destructive',
                                        onPress: () => {
                                          const updated = [...modalSections];
                                          updated[selectedSectionIdx].questions = updated[selectedSectionIdx].questions.filter((_, qIdx2) => qIdx2 !== qIdx);
                                          const reindexed = reindexQuestions(updated);
                                          setModalSections(reindexed);
                                        }
                                      }
                                    ]
                                  );
                                }}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={{ flex: 1 }}
                      onPress={() => setExamStep(1)}
                    >
                      <BrutalistShadow style={[styles.modalSaveBtn, { backgroundColor: '#e5e7eb' }]} offset={2}>
                        <View style={styles.modalSaveBtnInner}>
                          <Text style={[styles.modalSaveBtnText, { color: '#1b263b' }]}>QUAY LẠI</Text>
                        </View>
                      </BrutalistShadow>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      activeOpacity={0.8}
                      style={{ flex: 1.5 }}
                      onPress={handleSaveExam}
                    >
                      <BrutalistShadow style={styles.modalSaveBtn} offset={2}>
                        <View style={styles.modalSaveBtnInner}>
                          <Text style={styles.modalSaveBtnText}>LƯU ĐỀ THI</Text>
                        </View>
                      </BrutalistShadow>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* ==================== REJECT REQUEST MODAL ==================== */}
      <Modal visible={rejectModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={styles.modalContainer} offset={5}>
            <View style={styles.modalInner}>
              <Text style={[styles.modalTitle, { marginBottom: 12 }]}>Từ chối yêu cầu nâng cấp</Text>
              <Text style={styles.inputLabel}>Lý do từ chối (Gửi qua email cho người dùng):</Text>
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Nhập lý do chi tiết..."
                multiline
              />
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity 
                  style={[styles.brutalistMiniBtn, { flex: 1, backgroundColor: '#e5e7eb' }]}
                  onPress={() => setRejectModalVisible(false)}
                >
                  <Text style={styles.brutalistMiniBtnText}>HỦY</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.brutalistMiniBtn, { flex: 1, backgroundColor: '#fee2e2' }]}
                  onPress={handleRejectRequestSubmit}
                >
                  <Text style={[styles.brutalistMiniBtnText, { color: '#c92a2a' }]}>GỬI TỪ CHỐI</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* ==================== SUBMISSION DETAIL MODAL (AI FEEDBACK) ==================== */}
      <Modal visible={submissionModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={styles.modalContainer} offset={6}>
            <View style={[styles.modalInner, { paddingHorizontal: 16 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>AI Detailed Evaluation</Text>
                <TouchableOpacity onPress={() => setSubmissionModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#1b263b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>🎯 OVERALL BAND SCORE: {selectedSubmission?.bandScore?.toFixed(1) || '—'}</Text>
                
                {/* Score breakdown metrics */}
                <View style={styles.scoreDetailsGrid}>
                  {selectedSubmission?.type?.toUpperCase() === 'WRITING' ? (
                    <>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.taskAchievement || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Task Achievement</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.coherenceCohesion || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Coherence & Cohesion</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.lexicalResource || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Lexical Resource</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.grammarAccuracy || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Grammatical Accuracy</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.fluencyCoherence || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Fluency & Coherence</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.lexicalResource || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Lexical Resource</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.grammarAccuracy || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Grammatical Accuracy</Text>
                      </View>
                      <View style={styles.scoreDetailBox}>
                        <Text style={styles.scoreDetailVal}>{selectedSubmission?.pronunciation || '—'}</Text>
                        <Text style={styles.scoreDetailLbl}>Pronunciation</Text>
                      </View>
                    </>
                  )}
                </View>

                {selectedSubmission?.prompt ? (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Đề bài / Prompt:</Text>
                    <Text style={styles.feedbackContentText}>{selectedSubmission.prompt}</Text>
                  </View>
                ) : null}

                {selectedSubmission?.essayText ? (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Bài viết của học viên:</Text>
                    <Text style={styles.feedbackContentText}>{selectedSubmission.essayText}</Text>
                  </View>
                ) : null}

                {selectedSubmission?.transcription ? (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Bài nói (Transcription):</Text>
                    <Text style={styles.feedbackContentText}>{selectedSubmission.transcription}</Text>
                  </View>
                ) : null}

                <View style={[styles.feedbackSection, { backgroundColor: '#e8f5e9', borderColor: '#4caf50' }]}>
                  <Text style={[styles.feedbackSectionTitle, { color: '#2e7d32' }]}>AI Evaluation Feedback:</Text>
                  <Text style={[styles.feedbackContentText, { color: '#2e7d32' }]}>
                    {typeof selectedSubmission?.aiFeedback === 'string'
                      ? selectedSubmission.aiFeedback
                      : selectedSubmission?.aiFeedback
                      ? Object.entries(selectedSubmission.aiFeedback)
                          .map(([key, val]) => `${key}: ${typeof val === 'object' ? JSON.stringify(val) : val}`)
                          .join('\n\n')
                      : 'Không có phản hồi chi tiết từ AI.'}
                  </Text>
                </View>
              </ScrollView>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.modalSaveBtnContainer, { marginTop: 12 }]}
                onPress={() => setSubmissionModalVisible(false)}
              >
                <BrutalistShadow style={styles.modalSaveBtn} offset={3}>
                  <View style={styles.modalSaveBtnInner}>
                    <Text style={styles.modalSaveBtnText}>ĐÓNG PHẢN HỒI</Text>
                  </View>
                </BrutalistShadow>
              </TouchableOpacity>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b'
  },
  appBarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 1.5 },
  
  tabsContainer: {
    backgroundColor: '#fcfbf7',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  tabsScroll: { paddingHorizontal: 16, gap: 10 },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fcfbf7',
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b', marginLeft: 6 },
  tabTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },

  sectionBadge: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#c92a2a', letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },

  // Dashboard styles
  heroSection: { marginBottom: 28 },
  stickyNote: {
    backgroundColor: '#fffebc',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    transform: [{ rotate: '-1deg' }]
  },
  tape: {
    position: 'absolute',
    top: -10,
    left: '35%',
    width: 100,
    height: 24,
    backgroundColor: 'rgba(27,38,59,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(27,38,59,0.3)',
    transform: [{ rotate: '2deg' }]
  },
  stickyGreeting: { fontFamily: 'Outfit_900Black', fontSize: 18, color: '#1b263b', marginBottom: 8 },
  stickyText: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#1b263b', lineHeight: 18, marginBottom: 16 },
  stickyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stickyBadge: { backgroundColor: '#1b263b', color: '#fff', fontSize: 9, fontFamily: 'Outfit_900Black', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f9f5', borderWidth: 1.5, borderColor: '#005c42', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  streakText: { fontFamily: 'Outfit_900Black', fontSize: 9, color: '#005c42', marginLeft: 4 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  kpiCard: { width: '46%', borderRadius: 16 },
  kpiInner: { backgroundColor: '#fcfbf7', padding: 16 },
  kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  kpiEmoji: { fontSize: 22 },
  kpiValue: { fontSize: 28, fontFamily: 'Outfit_900Black' },
  kpiLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', letterSpacing: 0.5 },

  logCard: { borderRadius: 16, marginBottom: 20 },
  logCardInner: { backgroundColor: '#fcfbf7', padding: 16 },
  logItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  logText: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#1b263b', lineHeight: 16 },
  logBold: { fontFamily: 'Outfit_700Bold' },
  logTime: { fontSize: 9, fontFamily: 'Outfit_400Regular', color: '#999', marginTop: 2 },

  // Search input and action buttons
  searchRow: { marginBottom: 16 },
  brutalistInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#1b263b'
  },
  actionBtnContainer: { marginBottom: 20 },
  createBtn: { borderRadius: 12 },
  createBtnInner: {
    backgroundColor: '#ffd54f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8
  },
  createBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' },

  // List Cards layouts
  listCardContainer: { marginBottom: 16 },
  listCard: { borderRadius: 16 },
  listCardInner: { backgroundColor: '#fcfbf7', padding: 16 },
  listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  listCardTitle: { fontSize: 15, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  listCardSub: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#666', marginTop: 2 },
  
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#1b263b',
    alignSelf: 'flex-start'
  },
  badgeText: { fontSize: 9, fontFamily: 'Outfit_900Black', color: '#fff', textTransform: 'uppercase' },

  brutalistScoreBadge: {
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 46
  },
  brutalistScoreLabel: { fontSize: 7, fontFamily: 'Outfit_900Black', color: '#666' },
  brutalistScoreValue: { fontSize: 18, fontFamily: 'Outfit_900Black' },

  subStatsRow: { flexDirection: 'row', gap: 16, marginVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(27,38,59,0.08)', paddingTop: 8 },
  subStatText: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#666' },

  cardActionsGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(27,38,59,0.08)',
    paddingTop: 12
  },
  brutalistMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1b263b',
    gap: 4
  },
  brutalistMiniBtnText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' },

  // Mentor applicant specific
  requestDetailBox: {
    backgroundColor: '#f5f3dc',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 10,
    padding: 12,
    marginTop: 6
  },
  requestDetailHeader: { fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b', marginTop: 6 },
  requestDetailContent: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#333', marginTop: 2, lineHeight: 16 },
  certificateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1b263b',
    borderRadius: 6,
    padding: 6,
    alignSelf: 'flex-start'
  },
  certificateBtnText: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#4682b4', textDecorationLine: 'underline' },

  // Skill subfilters
  subFilterRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  subFilterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1b263b',
    backgroundColor: '#fcfbf7',
    alignItems: 'center'
  },
  subFilterBtnActive: { backgroundColor: '#1b263b' },
  subFilterText: { fontSize: 9, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  subFilterTextActive: { color: '#fff' },

  emptyText: { fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#999', textAlign: 'center', paddingVertical: 40 },

  // Loading indicator states
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#f5f3dc'
  },
  loadingText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', marginTop: 12 },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 38, 59, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modalContainer: { width: '100%', maxWidth: 420, borderRadius: 20 },
  modalInner: { backgroundColor: '#fcfbf7', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 2, borderBottomColor: '#1b263b', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#1b263b',
    marginBottom: 12
  },
  inputLabel: { fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 },
  
  rolePickerRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#1b263b',
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  roleSelectBtnActive: { backgroundColor: '#ffd54f' },
  roleSelectText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  roleSelectTextActive: { color: '#1b263b' },

  modalSaveBtnContainer: { marginTop: 8 },
  modalSaveBtn: { borderRadius: 10 },
  modalSaveBtnInner: {
    backgroundColor: '#00c1a0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  modalSaveBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#fff' },

  // Score breakdowns in details modal
  scoreDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  scoreDetailBox: {
    width: '47%',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center'
  },
  scoreDetailVal: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  scoreDetailLbl: { fontSize: 8, fontFamily: 'Outfit_900Black', color: '#666', marginTop: 2, textAlign: 'center' },

  // Exam Wizard Styles
  sectionTabsScroll: { marginBottom: 12, paddingBottom: 6 },
  sectionTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#1b263b',
    backgroundColor: '#fff',
    marginRight: 6,
    borderRadius: 6
  },
  sectionTabBtnActive: { backgroundColor: '#ffd54f' },
  sectionTabBtnText: { fontFamily: 'Outfit_700Bold', color: '#1b263b', fontSize: 10 },
  sectionTabBtnActiveText: { color: '#1b263b' },
  sectionEditArea: { marginTop: 4 },
  qCard: {
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    overflow: 'hidden'
  },
  qCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f3dc'
  },
  qCardTitle: { fontFamily: 'Outfit_700Bold', color: '#1b263b', fontSize: 11, flex: 1 },
  qCardBody: { padding: 10, borderTopWidth: 1.5, borderTopColor: '#1b263b' },
  typeSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8, marginTop: 4 },
  qTypeBtn: {
    borderWidth: 1,
    borderColor: '#1b263b',
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: '#fff'
  },
  qTypeBtnActive: { backgroundColor: '#1b263b' },
  qTypeBtnText: { fontFamily: 'Outfit_700Bold', color: '#1b263b', fontSize: 9 },
  qTypeBtnActiveText: { color: '#fff' },

  feedbackSection: {
    borderWidth: 1.5,
    borderColor: '#1b263b',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12
  },
  feedbackSectionTitle: { fontSize: 11, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 },
  feedbackContentText: { fontSize: 12, fontFamily: 'Outfit_400Regular', color: '#333', lineHeight: 18 }
});

export default AdminScreen;
