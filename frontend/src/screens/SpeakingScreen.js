import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Modal
} from 'react-native';
import { Audio } from 'expo-av';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import client from '../api/client';

const SpeakingScreen = ({ route, navigation }) => {
  const { title = "IELTS Speaking Test", examId } = route.params || {};
  const { user } = useAuthStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const [sections, setSections] = useState([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationRef = useRef(0);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      client.get(`/exams/${examId}`)
        .then(response => {
          if (response.data && response.data.success) {
            const test = response.data.data;
            if (test.sections && test.sections.length > 0) {
              setSections(test.sections);
            } else {
              setErrorMessage('Không tìm thấy dữ liệu bài thi Speaking này.');
              navigation.goBack();
            }
          } else {
            setErrorMessage('Lỗi khi tải bài thi.');
            navigation.goBack();
          }
        })
        .catch(err => {
          console.error("Error fetching speaking exam:", err);
          setErrorMessage('Đã xảy ra lỗi tải bài thi.');
          navigation.goBack();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setErrorMessage('Không có Exam ID.');
      navigation.goBack();
    }
  }, [examId]);

  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const uri = URL.createObjectURL(blob);
          handleStopCompletion(uri);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      } else {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
          Toast.show({ type: 'error', text1: 'Quyền bị từ chối', text2: 'Ứng dụng cần quyền truy cập microphone để ghi âm bài nói.' });
          return;
        }
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
      }

      setIsRecording(true);
      setDuration(0);
      durationRef.current = 0;
      setResult(null);

      // We use a local variable to update state properly
      if (timerRef.current) clearInterval(timerRef.current);
      let currentDuration = 0;
      timerRef.current = setInterval(() => {
        currentDuration += 1;
        setDuration(currentDuration);
        durationRef.current = currentDuration;
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      setErrorMessage('Không thể bắt đầu ghi âm. Vui lòng cấp quyền Microphone.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      clearInterval(timerRef.current);
      
      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } else {
        if (!recording) return;
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        handleStopCompletion(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const handleStopCompletion = (uri) => {
    if (durationRef.current < 3) {
      setErrorMessage('Bài nói của bạn quá ngắn (dưới 3 giây). Vui lòng thử lại.');
      return;
    }
    submitAudio(uri);
  };

  const submitAudio = async (uri) => {
    setIsProcessing(true);
    try {
      let base64Data = '';
      if (Platform.OS === 'web') {
        const fetchRes = await fetch(uri);
        const blob = await fetchRes.blob();
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            resolve(dataUrl.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      const activeSection = sections[activeSectionIndex] || {};
      const currentDuration = durationRef.current;

      const response = await client.post('/exams/evaluate-speaking', {
        testId: examId,
        prompt: activeSection.passageText || activeSection.title || 'IELTS Speaking Test',
        audioBase64: base64Data,
        durationSeconds: currentDuration,
        partNumber: activeSectionIndex + 1,
      });

      if (response.data && response.data.success) {
        setResult(response.data.data);
      } else {
        setErrorMessage('Không thể chấm điểm, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Failed to read or submit audio', err);
      const backendMessage = err.response?.data?.message || err.message;
      setErrorMessage(`Lỗi: ${backendMessage || 'Không thể gửi âm thanh'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getProgressWidth = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return '0%';
    return `${Math.min(100, Math.max(0, (num / 9) * 100))}%`;
  };

  const renderParsedPassage = (passageText) => {
    if (!passageText) return null;
    const lines = passageText.split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <View key={index} style={{ height: 8 }} />;
      
      if (trimmed.toLowerCase().startsWith('topic') || trimmed.toLowerCase().startsWith('discussion topics')) {
        return (
          <Text key={index} style={S.passageTopicHeader}>
            {trimmed}
          </Text>
        );
      }
      
      if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const questionText = trimmed.substring(1).trim();
        return (
          <View key={index} style={S.passageQuestionRow}>
            <View style={S.passageQuestionBullet} />
            <Text style={S.passageQuestionText}>{questionText}</Text>
          </View>
        );
      }
      
      const isFirstLine = index === 0;
      return (
        <Text 
          key={index} 
          style={[
            S.passageParagraph, 
            isFirstLine && S.passageFirstLine
          ]}
        >
          {trimmed}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={S.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => navigation.goBack()}>
          <AppIcon name="back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Content ────────────────────────────────────── */}
      <View style={S.content}>
        
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontFamily: TYPOGRAPHY.fontMedium }}>
              Đang tải nội dung đề thi...
            </Text>
          </View>
        ) : !result ? (
          <View style={S.recordingContainer}>
            {sections.length > 1 && (
              <View style={S.partTabsContainer}>
                {sections.map((sec, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setActiveSectionIndex(idx);
                      setResult(null);
                      setIsRecording(false);
                      setDuration(0);
                    }}
                    style={[
                      S.partTabItem,
                      idx === activeSectionIndex && S.partTabItemActive
                    ]}
                  >
                    <Text style={[
                      S.partTabText,
                      idx === activeSectionIndex && S.partTabTextActive
                    ]}>
                      Part {idx + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Prompt Card */}
            <View style={S.promptCard}>
              <View style={S.cardBadge}>
                <Text style={S.cardBadgeText}>
                  {(sections[activeSectionIndex]?.title || 'SPEAKING SECTION').toUpperCase()}
                </Text>
              </View>
              <ScrollView 
                style={S.cardScroll} 
                contentContainerStyle={S.cardScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {renderParsedPassage(sections[activeSectionIndex]?.passageText || '')}
              </ScrollView>
            </View>

            <View style={[S.timerBadge, isRecording && S.timerBadgeRecording]}>
              {isRecording && <View style={S.timerDot} />}
              <Text style={[S.timerText, isRecording && S.timerTextRecording]}>
                {formatTime(duration)}
              </Text>
            </View>

            {isProcessing ? (
              <View style={S.processingBox}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={S.processingText}>AI đang phân tích và chấm điểm bài nói của bạn...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[S.micButton, isRecording && S.micButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <AppIcon 
                  name={isRecording ? 'stop' : 'mic-active'} 
                  size={32} 
                  color={COLORS.textInverse} 
                />
              </TouchableOpacity>
            )}

            {!isProcessing && (
              <Text style={S.micInstruction}>
                {isRecording ? 'Bấm để kết thúc nộp bài' : 'Bấm để bắt đầu thu âm'}
              </Text>
            )}
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}>
            <View style={S.resultContainer}>
              {/* Band Score Header */}
              <View style={S.resultHeader}>
                <View style={S.bandCircle}>
                  <Text style={S.bandLabel}>Band</Text>
                  <Text style={S.bandScore}>{result.bandScore?.toFixed(1)}</Text>
                  <Text style={S.bandSub}>/ 9.0</Text>
                </View>
                <View style={S.resultMeta}>
                  <Text style={S.resultTitle}>Part {activeSectionIndex + 1} — {sections[activeSectionIndex]?.title || 'Speaking'}</Text>
                  <Text style={S.resultSubtitle}>✅ Chấm điểm hoàn tất</Text>
                  {result.wordCount > 0 && (
                    <Text style={S.wordCountBadge}>💬 {result.wordCount} từ được nhận diện</Text>
                  )}
                </View>
              </View>

              {/* Criteria Scores */}
              <View style={S.criteriaSection}>
                <Text style={S.sectionHeading}>TIÊU CHÍ ĐÁNH GIÁ</Text>
                {[
                  { key: 'fluencyCoherence', label: 'Trôi chảy & Mạch lạc', color: '#4682b4' },
                  { key: 'lexicalResource', label: 'Từ vựng', color: '#005c42' },
                  { key: 'grammarAccuracy', label: 'Ngữ pháp', color: '#d97706' },
                  { key: 'pronunciation', label: 'Phát âm', color: '#c92a2a' },
                ].map(({ key, label, color }) => (
                  <View key={key} style={S.criteriaRow}>
                    <View style={S.criteriaHeader}>
                      <Text style={S.criteriaName}>{label}</Text>
                      <Text style={[S.criteriaScore, { color }]}>{result[key]?.toFixed(1)}</Text>
                    </View>
                    <View style={S.progressBarBg}>
                      <View style={[S.progressBarFill, { width: getProgressWidth(result[key]), backgroundColor: color }]} />
                    </View>
                  </View>
                ))}
              </View>

              {/* AI Feedback */}
              {result.aiFeedback && (
                <View style={S.feedbackSection}>
                  <Text style={S.sectionHeading}>NHẬN XÉT TỪ AI EXAMINER</Text>
                  {result.aiFeedback.general && (
                    <View style={S.generalFeedback}>
                      <Text style={S.feedbackText}>{result.aiFeedback.general}</Text>
                    </View>
                  )}
                  {[
                    { key: 'fluencyCoherence', label: '🗣 Trôi chảy & Mạch lạc' },
                    { key: 'lexicalResource', label: '📚 Từ vựng' },
                    { key: 'grammarAccuracy', label: '✏️ Ngữ pháp' },
                    { key: 'pronunciation', label: '🔊 Phát âm' },
                  ].map(({ key, label }) => result.aiFeedback[key] && (
                    <View key={key} style={S.feedbackItem}>
                      <Text style={S.feedbackLabel}>{label}</Text>
                      <Text style={S.feedbackDetail}>{result.aiFeedback[key]}</Text>
                    </View>
                  ))}
                  {Array.isArray(result.aiFeedback.suggestions) && result.aiFeedback.suggestions.length > 0 && (
                    <View style={S.suggestionsBox}>
                      <Text style={S.feedbackLabel}>💡 Gợi ý cải thiện</Text>
                      {result.aiFeedback.suggestions.map((s, i) => (
                        <Text key={i} style={S.suggestionItem}>• {s}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Transcript */}
              {result.transcript && result.transcript.trim().length > 5 && (
                <View style={S.transcriptSection}>
                  <Text style={S.sectionHeading}>📝 TRANSCRIPT (Bài nói của bạn)</Text>
                  <ScrollView style={S.transcriptScroll} nestedScrollEnabled>
                    <Text style={S.transcriptText}>{result.transcript}</Text>
                  </ScrollView>
                </View>
              )}

              {/* Action Buttons */}
              <View style={S.actionsRow}>
                <TouchableOpacity style={S.retryBtn} onPress={() => setResult(null)}>
                  <Text style={S.retryText}>🔄 Luyện lại</Text>
                </TouchableOpacity>

                {activeSectionIndex < sections.length - 1 && (
                  <TouchableOpacity
                    style={[S.retryBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                    onPress={() => {
                      setActiveSectionIndex(activeSectionIndex + 1);
                      setResult(null);
                      setIsRecording(false);
                      setDuration(0);
                    }}
                  >
                    <Text style={[S.retryText, { color: COLORS.textInverse }]}>Part Tiếp Theo →</Text>
                  </TouchableOpacity>
                )}

                {activeSectionIndex === sections.length - 1 && (
                  <TouchableOpacity
                    style={[S.retryBtn, { backgroundColor: '#005c42', borderColor: '#005c42' }]}
                    onPress={() => navigation.goBack()}
                  >
                    <Text style={[S.retryText, { color: '#fff' }]}>✅ Hoàn thành</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        )}

      </View>
      
      {/* Footer */}
      <View style={{
        backgroundColor: '#c92a2a',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 2,
        borderTopColor: '#1b263b',
      }}>
        <TouchableOpacity 
          style={{ width: '100%', alignItems: 'center' }}
          onPress={() => setShowSubmitModal(true)}
        >
          <Text style={{
            fontSize: 14,
            fontFamily: 'Outfit_900Black',
            color: '#fff',
            letterSpacing: 1,
            textTransform: 'uppercase'
          }}>SUBMIT EXAM</Text>
        </TouchableOpacity>
      </View>
      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(27, 38, 59, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={32} color="#c92a2a" />
              <Text style={{ fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginLeft: 10 }}>Submit Exam?</Text>
            </View>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#333', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              Bạn có chắc chắn muốn nộp bài thi Speaking không?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#e0e0e0', borderWidth: 2, borderColor: '#1b263b' }} 
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#c92a2a', borderWidth: 2, borderColor: '#1b263b' }} 
                onPress={() => {
                  setShowSubmitModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#fff' }}>Nộp bài</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Message Modal */}
      <Modal
        visible={!!errorMessage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setErrorMessage('')}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(27, 38, 59, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="alert-circle" size={32} color="#c92a2a" />
              <Text style={{ fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginLeft: 10 }}>Thông Báo</Text>
            </View>
            <Text style={{ fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#333', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              {errorMessage}
            </Text>
            <TouchableOpacity 
              style={{ width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#c92a2a', borderWidth: 2, borderColor: '#1b263b' }} 
              onPress={() => setErrorMessage('')}
            >
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#fff' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  
  content: { flex: 1, padding: SPACING.lg },
  
  recordingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  promptCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxWidth: 680,
    height: 340,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardBadge: {
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryBorder,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  cardBadgeText: {
    color: COLORS.primaryDark,
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontBold,
    letterSpacing: 0.5,
  },
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    padding: SPACING.lg,
  },
  
  passageTopicHeader: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontBold,
    color: COLORS.primaryDark,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  passageQuestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  passageQuestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: SPACING.sm,
  },
  passageQuestionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  passageParagraph: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontRegular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  passageFirstLine: {
    fontSize: TYPOGRAPHY.base,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.full,
    paddingVertical: 6,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  timerBadgeRecording: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBg,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING.sm,
  },
  timerText: {
    fontSize: TYPOGRAPHY.xl,
    fontFamily: TYPOGRAPHY.fontBold,
    color: COLORS.textPrimary,
  },
  timerTextRecording: {
    color: COLORS.error,
  },

  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.surface,
    ...SHADOWS.md,
  },
  micButtonActive: {
    backgroundColor: COLORS.error,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.error,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  micInstruction: { marginTop: SPACING.lg, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },

  processingBox: { alignItems: 'center', marginTop: SPACING.xl },
  processingText: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.primary },

  resultContainer: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center', paddingTop: SPACING.sm },
  resultHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  bandCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.lg },
  bandLabel: { fontSize: 10, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  bandScore: { fontSize: 26, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.primary, lineHeight: 30 },
  bandSub: { fontSize: 10, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  resultMeta: { flex: 1 },
  resultTitle: { fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: 4 },
  resultSubtitle: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: '#005c42', marginBottom: 4 },
  wordCountBadge: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },

  criteriaSection: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  sectionHeading: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SPACING.md },
  criteriaRow: { marginBottom: SPACING.md },
  criteriaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  criteriaName: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textPrimary },
  criteriaScore: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary },
  progressBarBg: { height: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.gray100, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: RADIUS.full, backgroundColor: COLORS.primary },

  feedbackSection: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  generalFeedback: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  feedbackItem: { borderLeftWidth: 3, borderLeftColor: COLORS.primary, paddingLeft: SPACING.md, marginBottom: SPACING.md },
  feedbackLabel: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: 4 },
  feedbackDetail: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, lineHeight: 20 },
  feedbackText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.primaryDark, lineHeight: 20 },
  suggestionsBox: { backgroundColor: '#fffbeb', borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1, borderColor: '#fde68a' },
  suggestionItem: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: '#92400e', lineHeight: 20, marginTop: 4 },

  transcriptSection: { backgroundColor: '#f8f8f8', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  transcriptScroll: { maxHeight: 150 },
  transcriptText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, lineHeight: 22, fontStyle: 'italic' },

  retryBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full },
  retryText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: SPACING.md, alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'center', marginBottom: SPACING.xl },

  partTabsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg },
  partTabItem: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, marginHorizontal: SPACING.xs, backgroundColor: COLORS.surface },
  partTabItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  partTabText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  partTabTextActive: { color: COLORS.textInverse, fontFamily: TYPOGRAPHY.fontBold },
});

export default SpeakingScreen;
