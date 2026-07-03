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
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import io from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import client from '../api/client';

const DEFAULT_SECTIONS = [
  {
    title: "Part 1: Giới thiệu bản thân",
    passageText: "Hãy nói về sở thích cá nhân của bạn. Bạn thường làm gì vào thời gian rảnh rỗi? Tại sao bạn lại thích điều đó?"
  }
];

const SpeakingScreen = ({ route, navigation }) => {
  const { title = "IELTS Speaking Mock Test", examId } = route.params || {};
  const { user } = useAuthStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const [sections, setSections] = useState([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);

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
              setSections(DEFAULT_SECTIONS);
            }
          } else {
            setSections(DEFAULT_SECTIONS);
          }
        })
        .catch(err => {
          console.error("Error fetching speaking exam:", err);
          setSections(DEFAULT_SECTIONS);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSections(DEFAULT_SECTIONS);
    }
  }, [examId]);

  // Initialize Socket
  useEffect(() => {
    // Get correct backend URL
    const baseURL = client.defaults.baseURL.replace('/api/v1', '');
    socketRef.current = io(baseURL, {
      transports: ['websocket']
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('audio:transcript', (data) => {
      console.log('Transcript received:', data);
    });

    socketRef.current.on('audio:score', (data) => {
      console.log('Score received:', data);
      setIsProcessing(false);
      if (data.success) {
        setResult(data.score);
      } else {
        Alert.alert('Lỗi', data.error || 'Không thể chấm điểm, vui lòng thử lại.');
      }
    });

    socketRef.current.on('audio:error', (data) => {
      setIsProcessing(false);
      Alert.alert('Lỗi server', data.error || 'Có lỗi xảy ra.');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (recording) recording.stopAndUnloadAsync();
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền truy cập microphone để ghi âm bài nói.');
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
      setResult(null);

      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm.');
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      clearInterval(timerRef.current);
      
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (duration < 3) {
        Alert.alert('Quá ngắn', 'Bài nói của bạn quá ngắn (dưới 3 giây). Vui lòng thử lại.');
        return;
      }

      submitAudio(uri);

    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const submitAudio = async (uri) => {
    setIsProcessing(true);
    try {
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const activeSection = sections[activeSectionIndex] || DEFAULT_SECTIONS[0];

      // Emit to server
      socketRef.current.emit('audio:start');
      socketRef.current.emit('audio:chunk', base64Data);
      socketRef.current.emit('audio:stop', {
        userId: user?._id || user?.id || 'guest',
        testId: examId || null,
        prompt: activeSection.passageText || 'Vui lòng trả lời câu hỏi Speaking'
      });

    } catch (err) {
      console.error('Failed to read or submit audio', err);
      setIsProcessing(false);
      Alert.alert('Lỗi', 'Không thể gửi âm thanh.');
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
                  {(sections[activeSectionIndex]?.title || DEFAULT_SECTIONS[0].title).toUpperCase()}
                </Text>
              </View>
              <ScrollView 
                style={S.cardScroll} 
                contentContainerStyle={S.cardScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {renderParsedPassage(sections[activeSectionIndex]?.passageText || DEFAULT_SECTIONS[0].passageText)}
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
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={S.resultContainer}>
              <AppIcon name="success" size={48} color={COLORS.success} />
              <Text style={S.resultTitle}>Chấm điểm hoàn tất!</Text>
              
              <View style={S.resultCard}>
                <View style={S.scoreCircleContainer}>
                  <View style={S.scoreCircle}>
                    <Text style={S.scoreLabel}>Overall Band</Text>
                    <Text style={S.scoreValue}>{result.bandScore}</Text>
                  </View>
                </View>

                <View style={S.criteriaBox}>
                  <View style={S.progressRow}>
                    <View style={S.criteriaInfo}>
                      <Text style={S.criteriaName}>Trôi chảy & Mạch lạc:</Text>
                      <Text style={S.criteriaScore}>{result.fluencyCoherence}</Text>
                    </View>
                    <View style={S.progressBarBg}>
                      <View style={[S.progressBarFill, { width: getProgressWidth(result.fluencyCoherence) }]} />
                    </View>
                  </View>
                  
                  <View style={S.progressRow}>
                    <View style={S.criteriaInfo}>
                      <Text style={S.criteriaName}>Từ vựng:</Text>
                      <Text style={S.criteriaScore}>{result.lexicalResource}</Text>
                    </View>
                    <View style={S.progressBarBg}>
                      <View style={[S.progressBarFill, { width: getProgressWidth(result.lexicalResource) }]} />
                    </View>
                  </View>

                  <View style={S.progressRow}>
                    <View style={S.criteriaInfo}>
                      <Text style={S.criteriaName}>Ngữ pháp:</Text>
                      <Text style={S.criteriaScore}>{result.grammarAccuracy}</Text>
                    </View>
                    <View style={S.progressBarBg}>
                      <View style={[S.progressBarFill, { width: getProgressWidth(result.grammarAccuracy) }]} />
                    </View>
                  </View>

                  <View style={S.progressRow}>
                    <View style={S.criteriaInfo}>
                      <Text style={S.criteriaName}>Phát âm:</Text>
                      <Text style={S.criteriaScore}>{result.pronunciation}</Text>
                    </View>
                    <View style={S.progressBarBg}>
                      <View style={[S.progressBarFill, { width: getProgressWidth(result.pronunciation) }]} />
                    </View>
                  </View>
                </View>
              </View>

              <View style={S.feedbackBox}>
                <Text style={S.feedbackTitle}>Phản hồi từ AI:</Text>
                <Text style={S.feedbackText}>{result.aiFeedback}</Text>
              </View>

              <View style={S.actionsRow}>
                <TouchableOpacity style={S.retryBtn} onPress={() => setResult(null)}>
                  <Text style={S.retryText}>Luyện tập lại</Text>
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
              </View>
            </View>
          </ScrollView>
        )}

      </View>
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

  resultContainer: { flex: 1, alignItems: 'center', paddingTop: SPACING.md },
  resultTitle: { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.success, marginTop: SPACING.sm, marginBottom: SPACING.lg },
  
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
    marginBottom: SPACING.lg,
  },
  scoreCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '35%',
    minWidth: 140,
    paddingVertical: SPACING.sm,
  },
  scoreCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  scoreLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  scoreValue: { fontSize: 32, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.primary },

  criteriaBox: {
    width: '60%',
    minWidth: 260,
    flexGrow: 1,
  },
  progressRow: {
    marginVertical: SPACING.xs,
    width: '100%',
  },
  criteriaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },

  feedbackBox: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: SPACING.xl,
  },
  feedbackTitle: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primaryDark, marginBottom: SPACING.xs },
  feedbackText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.primaryDark, lineHeight: 20 },

  retryBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full },
  retryText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.md,
    alignSelf: 'center',
  },

  partTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  partTabItem: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  partTabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  partTabText: {
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontMedium,
    color: COLORS.textSecondary,
  },
  partTabTextActive: {
    color: COLORS.textInverse,
    fontFamily: TYPOGRAPHY.fontBold,
  },
});

export default SpeakingScreen;
