import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import io from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';
import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';
import client from '../api/client';

const SpeakingScreen = ({ route, navigation }) => {
  const { title = "IELTS Speaking Mock Test" } = route.params || {};
  const { user } = useAuthStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);

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

      // Emit to server
      socketRef.current.emit('audio:start');
      socketRef.current.emit('audio:chunk', base64Data);
      socketRef.current.emit('audio:stop', {
        userId: user?._id || 'guest',
        prompt: 'Vui lòng mô tả sở thích của bạn (IELTS Speaking Part 1)' // sample prompt
      });

    } catch (err) {
      console.error('Failed to read or submit audio', err);
      setIsProcessing(false);
      Alert.alert('Lỗi', 'Không thể gửi âm thanh.');
    }
  };

  return (
    <SafeAreaView style={S.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
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
        
        {!result ? (
          <View style={S.recordingContainer}>
            <Text style={S.promptTitle}>Part 1: Giới thiệu bản thân</Text>
            <Text style={S.promptDesc}>
              Hãy nói về sở thích cá nhân của bạn. Bạn thường làm gì vào thời gian rảnh rỗi? Tại sao bạn lại thích điều đó?
            </Text>

            <View style={S.timerBox}>
              <Text style={[S.timerText, isRecording && { color: COLORS.danger }]}>
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
                  size={40} 
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
          <View style={S.resultContainer}>
            <AppIcon name="success" size={60} color={COLORS.success} />
            <Text style={S.resultTitle}>Chấm điểm hoàn tất!</Text>
            
            <View style={S.scoreCircle}>
              <Text style={S.scoreLabel}>Overall Band</Text>
              <Text style={S.scoreValue}>{result.bandScore}</Text>
            </View>

            <View style={S.criteriaBox}>
              <View style={S.criteriaRow}>
                <Text style={S.criteriaName}>Trôi chảy & Mạch lạc:</Text>
                <Text style={S.criteriaScore}>{result.fluencyCoherence}</Text>
              </View>
              <View style={S.criteriaRow}>
                <Text style={S.criteriaName}>Từ vựng:</Text>
                <Text style={S.criteriaScore}>{result.lexicalResource}</Text>
              </View>
              <View style={S.criteriaRow}>
                <Text style={S.criteriaName}>Ngữ pháp:</Text>
                <Text style={S.criteriaScore}>{result.grammarAccuracy}</Text>
              </View>
              <View style={S.criteriaRow}>
                <Text style={S.criteriaName}>Phát âm:</Text>
                <Text style={S.criteriaScore}>{result.pronunciation}</Text>
              </View>
            </View>

            <View style={S.feedbackBox}>
              <Text style={S.feedbackTitle}>Phản hồi từ AI:</Text>
              <Text style={S.feedbackText}>{result.aiFeedback}</Text>
            </View>

            <TouchableOpacity style={S.retryBtn} onPress={() => setResult(null)}>
              <Text style={S.retryText}>Thử lại bài khác</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  
  content: { flex: 1, padding: SPACING.lg },
  
  recordingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptTitle: { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center' },
  promptDesc: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING['3xl'], paddingHorizontal: SPACING.md },
  
  timerBox: { marginBottom: SPACING['2xl'] },
  timerText: { fontSize: 48, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary },
  
  micButton: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.md
  },
  micButtonActive: {
    backgroundColor: COLORS.danger,
    transform: [{ scale: 1.1 }]
  },
  micInstruction: { marginTop: SPACING.lg, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },

  processingBox: { alignItems: 'center', marginTop: SPACING.xl },
  processingText: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.primary },

  resultContainer: { flex: 1, alignItems: 'center', paddingTop: SPACING.xl },
  resultTitle: { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.success, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  scoreLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  scoreValue: { fontSize: 36, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.primary },

  criteriaBox: { width: '100%', backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, ...SHADOWS.sm, marginBottom: SPACING.lg },
  criteriaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  criteriaName: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  criteriaScore: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },

  feedbackBox: { width: '100%', backgroundColor: COLORS.primaryLight, padding: SPACING.lg, borderRadius: RADIUS.lg, marginBottom: SPACING.xl },
  feedbackTitle: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primaryDark, marginBottom: SPACING.xs },
  feedbackText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.primaryDark, lineHeight: 20 },

  retryBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.full },
  retryText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary }
});

export default SpeakingScreen;
