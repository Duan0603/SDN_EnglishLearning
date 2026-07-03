import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import examService from '../api/exam.service';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const ExamScreen = ({ route, navigation }) => {
  const { examId, testType = 'READING', examTitle = 'IELTS Mock Exam' } = route.params || {};
  const { user } = useAuthStore();

  // Exam data from API
  const [exam, setExam] = useState(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Exam UI state
  const [activeTab, setActiveTab] = useState('passage');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(3600);
  const timerRef = useRef(null);

  // Answers: { [questionId]: userAnswerString }
  const [answers, setAnswers] = useState({});

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const storageKey = `exam_progress_${examId}`;

  // ── Load exam from API ────────────────────────────────────────────
  useEffect(() => {
    const loadExam = async () => {
      setIsLoadingExam(true);
      setLoadError(null);
      try {
        // Try restoring saved progress first
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          const p = JSON.parse(saved);
          if (p.answers) setAnswers(p.answers);
          if (p.timeLeft) setTimeLeft(p.timeLeft);
        }

        if (!examId) {
          setLoadError('Không có ID bài thi. Quay lại và chọn lại bài thi.');
          setIsLoadingExam(false);
          return;
        }

        const res = await examService.getById(examId);
        const examData = res.data?.data;
        if (!examData) throw new Error('Không tìm thấy bài thi.');

        setExam(examData);
        // Init timer from exam duration (minutes → seconds)
        if (!saved && examData.duration) {
          setTimeLeft(examData.duration * 60);
        }
      } catch (err) {
        setLoadError(err.message || 'Không thể tải bài thi. Vui lòng thử lại.');
      } finally {
        setIsLoadingExam(false);
      }
    };
    loadExam();
  }, [examId]);

  // ── Countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (isLoadingExam || result) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isLoadingExam, result]);

  // ── Auto-save progress ─────────────────────────────────────────────
  useEffect(() => {
    if (!exam || isLoadingExam) return;
    const save = async () => {
      await AsyncStorage.setItem(storageKey, JSON.stringify({ answers, timeLeft }));
    };
    save();
  }, [answers, timeLeft, exam]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // ── Submit exam ───────────────────────────────────────────────────
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting || result) return;

    const doSubmit = async () => {
      clearInterval(timerRef.current);
      setIsSubmitting(true);

      try {
        // Build answers array for API
        const answersPayload = Object.entries(answers).map(([questionId, userAnswer]) => ({
          questionId,
          userAnswer: String(userAnswer),
        }));

        const initialTime = exam?.duration ? exam.duration * 60 : 3600;
        const timeTaken = initialTime - timeLeft;

        const res = await examService.submit(examId, answersPayload, timeTaken);
        const resultData = res.data?.data;

        await AsyncStorage.removeItem(storageKey);
        setResult(resultData);
      } catch (err) {
        Alert.alert('Lỗi nộp bài', 'Không thể nộp bài. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isAutoSubmit) {
      await doSubmit();
    } else {
      Alert.alert('Nộp bài?', 'Bạn có chắc muốn nộp bài không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nộp bài', onPress: doSubmit },
      ]);
    }
  }, [answers, isSubmitting, result, exam, examId, timeLeft]);

  // ── Render helpers ────────────────────────────────────────────────
  const renderOption = (question, optionKey) => {
    const options = question.options || {};
    const text = options[optionKey];
    if (!text) return null;
    const isSelected = answers[question.id] === optionKey;
    return (
      <TouchableOpacity
        key={optionKey}
        style={[styles.optionCard, isSelected && styles.optionCardActive]}
        onPress={() => setAnswer(question.id, optionKey)}
        activeOpacity={0.8}
      >
        <View style={[styles.radio, isSelected && styles.radioActive]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
          {optionKey}. {text}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFillBlank = (question) => {
    const val = answers[question.id] || '';
    return (
      <View style={styles.fillBlankBox} key={question.id}>
        <Text style={styles.fillBlankLabel}>Điền vào chỗ trống:</Text>
        <TouchableOpacity
          style={styles.fillBlankInput}
          onPress={() => {
            Alert.prompt
              ? Alert.prompt('Trả lời', question.content, (text) => setAnswer(question.id, text), 'plain-text', val)
              : Alert.alert('Chức năng nhập', 'Vui lòng nhập đáp án của bạn.');
          }}
        >
          <Text style={[styles.fillBlankText, !val && { color: '#999' }]}>
            {val || 'Bấm để nhập đáp án...'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentSection = exam?.sections?.[activeSectionIndex];

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoadingExam) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1b263b" />
          <Text style={styles.centerText}>Đang tải bài thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  if (loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerState}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <TouchableOpacity style={styles.backFromError} onPress={() => navigation.goBack()}>
            <Text style={styles.backFromErrorText}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Result state ──────────────────────────────────────────────────
  if (result) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
        <View style={styles.appBar}>
          <Text style={styles.headerTitle}>KẾT QUẢ BÀI THI</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="home" size={22} color="#1b263b" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {/* Band score banner */}
          <BrutalistShadow style={{ borderRadius: 20, marginBottom: 20 }} offset={6}>
            <View style={{ backgroundColor: '#fcfbf7', padding: 28, alignItems: 'center' }}>
              <Text style={styles.resultLabel}>BAND SCORE</Text>
              <Text style={styles.resultScore}>{result.bandScore?.toFixed(1) || '—'}</Text>
              <Text style={styles.resultMeta}>
                {result.correctCount}/{result.totalQuestions} câu đúng
              </Text>
            </View>
          </BrutalistShadow>

          {/* Graded answers */}
          {result.gradedAnswers?.map((ans, i) => (
            <View key={i} style={[styles.gradedRow, ans.isCorrect ? styles.gradedCorrect : styles.gradedWrong]}>
              <View style={styles.gradedIcon}>
                <Ionicons name={ans.isCorrect ? 'checkmark-circle' : 'close-circle'} size={22} color={ans.isCorrect ? '#005c42' : '#c92a2a'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gradedAnswer}>Bạn chọn: {ans.userAnswer || '(bỏ trống)'}</Text>
                {!ans.isCorrect && <Text style={styles.gradedCorrectAnswer}>Đáp án đúng: {ans.correctAnswer}</Text>}
                {ans.explanation && <Text style={styles.gradedExplanation}>{ans.explanation}</Text>}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.submitBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.submitBtnText}>QUAY VỀ DANH SÁCH ĐỀ THI</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main exam UI ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          Alert.alert('Thoát bài thi?', 'Tiến độ đã được lưu lại.', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() },
          ]);
        }}>
          <Ionicons name="close" size={28} color="#1b263b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>{testType} Test</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{exam?.title || examTitle}</Text>
        </View>

        <View style={styles.timerBox}>
          <Ionicons name="time" size={16} color="#c92a2a" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Section tabs (if multiple sections) */}
      {exam?.sections?.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionTabBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {exam.sections.map((sec, i) => (
            <TouchableOpacity
              key={sec.id}
              style={[styles.sectionTab, activeSectionIndex === i && styles.sectionTabActive]}
              onPress={() => setActiveSectionIndex(i)}
            >
              <Text style={[styles.sectionTabText, activeSectionIndex === i && styles.sectionTabTextActive]}>
                Part {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Passage / Questions tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'passage' && styles.tabItemActive]}
          onPress={() => setActiveTab('passage')}
        >
          <Text style={[styles.tabText, activeTab === 'passage' && styles.tabTextActive]}>📖 PASSAGE</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'questions' && styles.tabItemActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>
            ✏️ QUESTIONS {currentSection ? `(${Object.keys(answers).length}/${currentSection.questions?.length || 0})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.scroll}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Passage Tab */}
          {activeTab === 'passage' && currentSection && (
            <BrutalistShadow style={styles.passageCard} offset={6}>
              <View style={styles.passageCardInner}>
                <View style={styles.redMarginLine} />
                {currentSection.title && (
                  <Text style={styles.passageTitle}>{currentSection.title}</Text>
                )}
                {currentSection.passageText ? (
                  <Text style={styles.passageText}>{currentSection.passageText}</Text>
                ) : currentSection.audioUrl ? (
                  <View style={styles.audioBox}>
                    <Ionicons name="musical-notes" size={40} color="#005c42" />
                    <Text style={styles.audioText}>Bài nghe Listening</Text>
                    <Text style={styles.audioUrl} numberOfLines={1}>{currentSection.audioUrl}</Text>
                  </View>
                ) : (
                  <Text style={styles.passageText}>Không có nội dung passage cho section này.</Text>
                )}
              </View>
            </BrutalistShadow>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && currentSection?.questions?.map((q, qi) => (
            <BrutalistShadow key={q.id} style={styles.questionCard} offset={4}>
              <View style={styles.questionCardInner}>
                <Text style={styles.questionNum}>CÂU {q.questionNumber || (qi + 1)}</Text>
                <Text style={styles.questionText}>{q.content}</Text>

                {/* Multiple choice */}
                {q.type === 'MCQ' && q.options && (
                  <View>
                    {['A', 'B', 'C', 'D'].map(key => renderOption(q, key))}
                  </View>
                )}

                {/* Fill in blank */}
                {(q.type === 'FILL_BLANK' || q.type === 'SHORT_ANSWER' || !q.options) && renderFillBlank(q)}

                {/* True/False/Not Given */}
                {q.type === 'TRUE_FALSE_NG' && (
                  <View>
                    {['True', 'False', 'Not Given'].map(opt => (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.optionCard, answers[q.id] === opt && styles.optionCardActive]}
                        onPress={() => setAnswer(q.id, opt)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.radio, answers[q.id] === opt && styles.radioActive]}>
                          {answers[q.id] === opt && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.optionText, answers[q.id] === opt && styles.optionTextActive]}>{opt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </BrutalistShadow>
          ))}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)} disabled={isSubmitting}>
          {isSubmitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>NỘP BÀI THI</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#666', marginTop: 16 },
  errorText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#c92a2a', textAlign: 'center', marginBottom: 20 },
  backFromError: { backgroundColor: '#1b263b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  backFromErrorText: { fontFamily: 'Outfit_900Black', fontSize: 14, color: '#fff' },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 8 },
  headerSub: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', textTransform: 'uppercase' },
  headerTitle: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  
  timerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3dc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 2, borderColor: '#1b263b' },
  timerText: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginLeft: 6 },

  sectionTabBar: { backgroundColor: '#fcfbf7', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(27,38,59,0.15)' },
  sectionTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5, borderColor: '#1b263b', backgroundColor: '#f5f3dc' },
  sectionTabActive: { backgroundColor: '#c92a2a', borderColor: '#c92a2a' },
  sectionTabText: { fontFamily: 'Outfit_900Black', fontSize: 11, color: '#1b263b' },
  sectionTabTextActive: { color: '#fff' },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fcfbf7',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b' },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  tabTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  passageCard: { borderRadius: 16 },
  passageCardInner: { backgroundColor: '#fcfbf7', padding: 24, paddingLeft: 40, minHeight: 300 },
  redMarginLine: { position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(224,86,91,0.3)' },
  passageTitle: { fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16, lineHeight: 26 },
  passageText: { fontSize: 15, fontFamily: 'Outfit_700Bold', color: '#333', lineHeight: 26 },

  audioBox: { alignItems: 'center', paddingVertical: 32 },
  audioText: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#005c42', marginTop: 12, marginBottom: 8 },
  audioUrl: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#999', maxWidth: '90%' },

  questionCard: { borderRadius: 16, marginBottom: 20 },
  questionCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  questionNum: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginBottom: 8, letterSpacing: 1 },
  questionText: { fontSize: 15, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 20, lineHeight: 22 },
  
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', marginBottom: 10, backgroundColor: '#fff' },
  optionCardActive: { backgroundColor: '#ffd54f' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center', marginRight: 14, backgroundColor: '#fff' },
  radioActive: { borderColor: '#1b263b' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1b263b' },
  optionText: { flex: 1, fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#1b263b', lineHeight: 20 },
  optionTextActive: { fontFamily: 'Outfit_900Black' },

  fillBlankBox: { marginBottom: 12 },
  fillBlankLabel: { fontFamily: 'Outfit_900Black', fontSize: 11, color: '#666', marginBottom: 6 },
  fillBlankInput: { borderWidth: 2, borderColor: '#1b263b', borderRadius: 10, padding: 14, backgroundColor: '#fefefe' },
  fillBlankText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' },

  footer: { padding: 20, backgroundColor: '#fcfbf7', borderTopWidth: 2, borderTopColor: '#1b263b' },
  submitBtn: { backgroundColor: '#c92a2a', paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 15, letterSpacing: 1 },

  // Result UI
  resultLabel: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#666', letterSpacing: 2, marginBottom: 8 },
  resultScore: { fontSize: 80, fontFamily: 'Outfit_900Black', color: '#c92a2a', lineHeight: 85 },
  resultMeta: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#666', marginTop: 4 },

  gradedRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10 },
  gradedCorrect: { backgroundColor: '#d1fae5', borderColor: '#005c42' },
  gradedWrong: { backgroundColor: '#fee2e2', borderColor: '#c92a2a' },
  gradedIcon: { marginRight: 12, marginTop: 2 },
  gradedAnswer: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#1b263b' },
  gradedCorrectAnswer: { fontFamily: 'Outfit_900Black', fontSize: 13, color: '#005c42', marginTop: 4 },
  gradedExplanation: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#555', marginTop: 6, lineHeight: 18 },
});

export default ExamScreen;
