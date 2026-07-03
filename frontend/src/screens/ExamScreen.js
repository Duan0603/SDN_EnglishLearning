import React, { useState, useEffect } from 'react';
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
  Modal,
  ActivityIndicator,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';
import client from '../api/client';
import { Audio } from 'expo-av';

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
  const { examId, testType = 'Reading' } = route.params || {};
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('passage'); // 'passage' | 'questions'
  const [answers, setAnswers] = useState({}); // { [questionId]: '' }
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showExitModal, setShowExitModal] = useState(false);
  const [results, setResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // State for Writing Practice
  const [writingEssays, setWritingEssays] = useState({ 0: '', 1: '' });
  const [writingLoading, setWritingLoading] = useState(false);
  const [writingResults, setWritingResults] = useState({});

  const handleEvaluateWriting = async () => {
    const currentEssay = writingEssays[activeSectionIdx] || '';
    const wordCount = currentEssay.trim().split(/\s+/).filter(Boolean).length;
    const isTask1 = activeSectionIdx === 0;
    const minWords = isTask1 ? 50 : 100;

    if (wordCount < minWords) {
      Alert.alert('Bài viết quá ngắn', `Vui lòng nhập tối thiểu ${minWords} từ để AI đánh giá.`);
      return;
    }

    setWritingLoading(true);
    try {
      const response = await client.post('/exams/evaluate-writing', {
        testId: exam.id,
        prompt: activeSection.passageText,
        essayText: currentEssay
      });

      if (response.data && response.data.success) {
        setWritingResults({
          ...writingResults,
          [activeSectionIdx]: response.data.data
        });
      }
    } catch (err) {
      console.error('Error evaluating writing:', err);
      Alert.alert('Lỗi', 'Không thể đánh giá bài viết lúc này. Vui lòng thử lại sau.');
    } finally {
      setWritingLoading(false);
    }
  };

  // Audio player state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekBarWidth, setSeekBarWidth] = useState(0);

  const formatAudioTime = (millis) => {
    if (!millis || isNaN(millis)) return '00:00';
    const totalSecs = Math.floor(millis / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let activeSound = null;

    const loadSound = async () => {
      const currentSection = exam?.sections[activeSectionIdx];
      if (exam?.type?.toLowerCase() === 'listening' && currentSection?.audioUrl) {
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: currentSection.audioUrl },
            { shouldPlay: false },
            (status) => {
              if (status.isLoaded) {
                setPosition(status.positionMillis);
                setDuration(status.durationMillis);
                setIsPlaying(status.isPlaying);
              }
            }
          );
          activeSound = newSound;
          setSound(newSound);
        } catch (err) {
          console.error('Error loading audio:', err);
        }
      }
    };

    const cleanupSound = async () => {
      if (activeSound) {
        try {
          await activeSound.unloadAsync();
        } catch (e) {
          console.error('Error unloading sound:', e);
        }
      }
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    };

    if (exam) {
      loadSound();
    }

    return () => {
      cleanupSound();
    };
  }, [exam, activeSectionIdx]);

  const togglePlay = async () => {
    if (!sound) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error toggling play:', err);
    }
  };

  const handleSeekBarTouch = async (event) => {
    const { locationX } = event.nativeEvent;
    if (seekBarWidth > 0 && duration > 0) {
      const progress = Math.max(0, Math.min(1, locationX / seekBarWidth));
      const newPositionMillis = progress * duration;
      setPosition(newPositionMillis);
      if (sound) {
        await sound.setPositionAsync(newPositionMillis);
      }
    }
  };

  const handleSeekBarMove = async (event) => {
    const { locationX } = event.nativeEvent;
    if (seekBarWidth > 0 && duration > 0) {
      const progress = Math.max(0, Math.min(1, locationX / seekBarWidth));
      const newPositionMillis = progress * duration;
      setPosition(newPositionMillis);
      if (sound) {
        await sound.setPositionAsync(newPositionMillis);
      }
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await client.get(`/exams/${examId}`);
        if (response.data && response.data.success) {
          const fetchedExam = response.data.data;
          setExam(fetchedExam);
          setTimeLeft((fetchedExam.duration || 60) * 60);
          
          // Pre-populate empty answers
          const initialAnswers = {};
          fetchedExam.sections.forEach(sec => {
            sec.questions.forEach(q => {
              initialAnswers[q.id] = '';
            });
          });
          setAnswers(initialAnswers);
        }
      } catch (err) {
        console.error('Error fetching exam:', err);
        Alert.alert('Error', 'Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (loading || !exam || results) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, exam, results]);

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto) {
      Alert.alert(
        'Nộp bài',
        'Bạn có chắc chắn muốn nộp bài thi không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nộp bài', onPress: () => submitAnswers() }
        ]
      );
    } else {
      Alert.alert('Hết giờ', 'Thời gian làm bài đã hết. Bài thi sẽ tự động được nộp.');
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    // Format answers for backend: array of { questionId, userAnswer }
    const answersPayload = Object.keys(answers).map(qId => ({
      questionId: qId,
      userAnswer: answers[qId] || ''
    }));

    const durationUsed = (exam.duration * 60) - timeLeft;

    setLoading(true);
    try {
      const response = await client.post(`/exams/${examId}/submit`, {
        answers: answersPayload,
        timeTaken: durationUsed
      });

      if (response.data && response.data.success) {
        setResults(response.data.data);
        setShowResultsModal(true);
      }
    } catch (err) {
      console.error('Submit error:', err);
      Alert.alert('Lỗi', 'Không thể nộp bài thi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const renderQuestionInput = (q) => {
    const currentValue = answers[q.id] || '';
    
    if (q.type === 'MULTIPLE_CHOICE') {
      const opts = q.options || [];
      return (
        <View style={{ gap: 8 }}>
          {opts.map((opt, optIdx) => {
            const val = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'...
            const isSelected = currentValue === val;
            return (
              <TouchableOpacity 
                key={optIdx}
                style={[styles.optionCard, isSelected && styles.optionCardActive]} 
                onPress={() => setAnswers({...answers, [q.id]: val})}
                activeOpacity={0.8}
              >
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    
    if (q.type === 'TRUE_FALSE_NOT_GIVEN' || q.type === 'YES_NO_NOT_GIVEN') {
      const choices = q.type === 'TRUE_FALSE_NOT_GIVEN' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
      return (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {choices.map((choice) => {
            const isSelected = currentValue === choice;
            return (
              <TouchableOpacity 
                key={choice}
                style={[styles.tfngBtn, isSelected && styles.tfngBtnActive]} 
                onPress={() => setAnswers({...answers, [q.id]: choice})}
                activeOpacity={0.8}
              >
                <Text style={[styles.tfngText, isSelected && styles.tfngTextActive]}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    
    // Default to text input for FILL_IN_BLANKS, SHORT_ANSWER
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Đáp án của bạn:</Text>
        <TextInput
          style={styles.textInput}
          value={currentValue}
          onChangeText={(text) => setAnswers({...answers, [q.id]: text})}
          placeholder="Nhập câu trả lời..."
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
    );
  };

  if (loading && !exam) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1b263b" />
          <Text style={{ marginTop: 12, fontFamily: 'Outfit_700Bold', color: '#1b263b' }}>Đang tải đề thi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeSection = exam.sections[activeSectionIdx];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowExitModal(true)}>
          <Ionicons name="close" size={28} color="#1b263b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>{testType} Test</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{exam.title}</Text>
        </View>

        <View style={styles.timerBox}>
          <Ionicons name="time" size={16} color="#c92a2a" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Section/Passage Tabs */}
      <View style={styles.sectionTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabsScroll}>
          {exam.sections.map((sec, idx) => (
            <TouchableOpacity 
              key={sec.id}
              style={[styles.sectionTabItem, activeSectionIdx === idx && styles.sectionTabItemActive]}
              onPress={() => {
                setActiveSectionIdx(idx);
                setActiveTab('passage');
              }}
            >
              <Text style={[styles.sectionTabText, activeSectionIdx === idx && styles.sectionTabTextActive]}>
                {exam.type?.toLowerCase() === 'listening' 
                  ? 'Section' 
                  : exam.type?.toLowerCase() === 'writing' 
                    ? 'Task' 
                    : 'Passage'} {sec.sectionOrder}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sub tabs: Reading Passage / Questions */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'passage' && styles.tabItemActive]}
          onPress={() => setActiveTab('passage')}
        >
          <Text style={[styles.tabText, activeTab === 'passage' && styles.tabTextActive]}>
            {exam.type?.toLowerCase() === 'listening' 
              ? '🎧 LISTENING AUDIO' 
              : exam.type?.toLowerCase() === 'writing' 
                ? '📖 TASK PROMPT' 
                : '📖 READING PASSAGE'}
          </Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'questions' && styles.tabItemActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>
            {exam.type?.toLowerCase() === 'writing' ? '✍️ YOUR ESSAY' : '✏️ QUESTIONS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.scroll}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'passage' && (
            <BrutalistShadow style={styles.passageCard} offset={6}>
              <View style={styles.passageCardInner}>
                <View style={styles.redMarginLine} />
                <Text style={styles.passageTitle}>
                  {activeSection.title || `${exam.type?.toLowerCase() === 'listening' ? 'Section' : 'Passage'} ${activeSection.sectionOrder}`}
                </Text>
                
                {exam.type?.toLowerCase() === 'listening' && activeSection.audioUrl && (
                  <View style={styles.audioPlayerCard}>
                    <View style={styles.audioInfo}>
                      <Text style={styles.audioPlayerLabel}>🎵 Section Audio Player</Text>
                      <Text style={styles.audioTimeText}>
                        {formatAudioTime(position)} / {formatAudioTime(duration)}
                      </Text>
                    </View>
                    
                    <View style={styles.audioControlsRow}>
                      <TouchableOpacity 
                        style={styles.playPauseBtn} 
                        onPress={togglePlay}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
                      </TouchableOpacity>
                      
                      <View 
                        style={styles.seekBarBg}
                        onLayout={(e) => setSeekBarWidth(e.nativeEvent.layout.width)}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={handleSeekBarTouch}
                        onResponderMove={handleSeekBarMove}
                      >
                        <View style={[styles.seekBarFill, { width: `${(position / (duration || 1)) * 100}%` }]} />
                        <View style={[styles.seekBarKnob, { left: `${(position / (duration || 1)) * 100}%` }]} />
                      </View>
                    </View>
                  </View>
                )}

                {exam.type?.toLowerCase() === 'writing' ? (
                  <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start', marginTop: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.passageText}>
                        {activeSection.passageText ? activeSection.passageText.replace(/\\n/g, '\n') : ''}
                      </Text>
                    </View>
                    
                    {activeSection.images && activeSection.images.length > 0 && (
                      <View style={{ flex: 2.5, borderLeftWidth: 1, borderColor: '#eee', paddingLeft: 20, alignItems: 'center' }}>
                        <Text style={styles.imageLabel}>Visual Prompt Diagram:</Text>
                        <Image
                          source={{ uri: `${client.defaults.baseURL.replace('/api/v1', '')}${activeSection.images[0]}` }}
                          style={[styles.diagramImage, { height: 480, width: '100%' }]}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={styles.passageText}>
                    {activeSection.passageText ? activeSection.passageText.replace(/\\n/g, '\n') : ''}
                  </Text>
                )}
              </View>
            </BrutalistShadow>
          )}

          {activeTab === 'questions' && (
            <View>
              {exam.type?.toLowerCase() === 'writing' ? (
                <View style={{ gap: 16 }}>
                  <BrutalistShadow style={styles.questionCard} offset={4}>
                    <View style={styles.questionCardInner}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={styles.questionNum}>YOUR ESSAY RESPONSE</Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#666' }}>
                          Words: {(writingEssays[activeSectionIdx] || '').trim().split(/\s+/).filter(Boolean).length} / {activeSectionIdx === 0 ? 150 : 250}+
                        </Text>
                      </View>

                      <TextInput
                        multiline
                        numberOfLines={12}
                        value={writingEssays[activeSectionIdx] || ''}
                        onChangeText={(text) => setWritingEssays({ ...writingEssays, [activeSectionIdx]: text })}
                        placeholder={activeSectionIdx === 0 ? "Viết bài mô tả biểu đồ của bạn tại đây (tối thiểu 150 từ)..." : "Viết bài luận nghị luận xã hội của bạn tại đây (tối thiểu 250 từ)..."}
                        placeholderTextColor="#999"
                        style={[styles.textInput, { height: 220, textAlignVertical: 'top', paddingTop: 12 }]}
                      />
                      
                      <TouchableOpacity 
                        style={[styles.submitWritingBtn, (!writingEssays[activeSectionIdx] || writingLoading) && styles.submitWritingBtnDisabled]}
                        disabled={!writingEssays[activeSectionIdx] || writingLoading}
                        onPress={handleEvaluateWriting}
                      >
                        {writingLoading ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.submitWritingBtnText}>NỘP BÀI & CHẤM ĐIỂM AI ✍️</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </BrutalistShadow>

                  {/* AI Evaluation result for this section */}
                  {writingResults[activeSectionIdx] && (
                    <BrutalistShadow style={styles.questionCard} offset={4}>
                      <View style={[styles.questionCardInner, { backgroundColor: '#fff' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10, marginBottom: 12 }}>
                          <Text style={[styles.questionNum, { color: '#1b263b' }]}>KẾT QUẢ CHẤM ĐIỂM AI</Text>
                          <View style={{ backgroundColor: '#ffd54f', borderWidth: 2, borderColor: '#1b263b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                            <Text style={{ fontFamily: 'Outfit_900Black', fontSize: 14 }}>Band {writingResults[activeSectionIdx].bandScore}</Text>
                          </View>
                        </View>

                        {/* Criteria Scores */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                          {[
                            { name: 'Task Response', score: writingResults[activeSectionIdx].taskAchievement },
                            { name: 'Coherence', score: writingResults[activeSectionIdx].coherenceCohesion },
                            { name: 'Vocabulary', score: writingResults[activeSectionIdx].lexicalResource },
                            { name: 'Grammar', score: writingResults[activeSectionIdx].grammarAccuracy }
                          ].map((item) => (
                            <View key={item.name} style={{ flex: 1, minWidth: '45%', backgroundColor: '#f9f9f9', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center' }}>
                              <Text style={{ fontSize: 9, color: '#666', fontFamily: 'Outfit_700Bold' }}>{item.name}</Text>
                              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b', marginTop: 2 }}>{item.score}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Detailed feedback */}
                        <View style={{ gap: 8 }}>
                          <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666' }}>1. TASK RESPONSE:</Text>
                          <Text style={{ fontSize: 11, color: '#333', fontFamily: 'Outfit_500Medium' }}>{writingResults[activeSectionIdx].aiFeedback?.taskAchievement}</Text>
                          
                          <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', marginTop: 6 }}>2. COHERENCE & COHESION:</Text>
                          <Text style={{ fontSize: 11, color: '#333', fontFamily: 'Outfit_500Medium' }}>{writingResults[activeSectionIdx].aiFeedback?.coherenceCohesion}</Text>

                          <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', marginTop: 6 }}>3. LEXICAL RESOURCE:</Text>
                          <Text style={{ fontSize: 11, color: '#333', fontFamily: 'Outfit_500Medium' }}>{writingResults[activeSectionIdx].aiFeedback?.lexicalResource}</Text>

                          <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', marginTop: 6 }}>4. GRAMMAR RANGE & ACCURACY:</Text>
                          <Text style={{ fontSize: 11, color: '#333', fontFamily: 'Outfit_500Medium' }}>{writingResults[activeSectionIdx].aiFeedback?.grammarAccuracy}</Text>
                          
                          <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, marginTop: 8 }}>
                            <Text style={{ fontSize: 10, fontFamily: 'Outfit_900Black', color: '#c92a2a' }}>AI RECOMMENDATIONS:</Text>
                            <Text style={{ fontSize: 11, color: '#1b263b', fontFamily: 'Outfit_700Bold', fontStyle: 'italic', marginTop: 2 }}>
                              "{writingResults[activeSectionIdx].aiFeedback?.general}"
                            </Text>
                          </View>
                        </View>
                      </View>
                    </BrutalistShadow>
                  )}
                </View>
              ) : (
                activeSection.questions && activeSection.questions.map((q) => (
                  <BrutalistShadow key={q.id} style={styles.questionCard} offset={4}>
                    <View style={styles.questionCardInner}>
                      <Text style={styles.questionNum}>QUESTION {q.questionNumber}</Text>
                      <Text style={styles.questionText}>{q.content}</Text>
                      {renderQuestionInput(q)}
                    </View>
                  </BrutalistShadow>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      {exam && exam.type?.toLowerCase() !== 'writing' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)}>
            <Text style={styles.submitBtnText}>SUBMIT EXAM</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exit Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showExitModal}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentContainer}>
            <BrutalistShadow style={styles.exitModalCard} offset={6}>
              <View style={styles.exitModalInner}>
                <View style={styles.exitModalHeader}>
                  <Ionicons name="warning" size={32} color="#c92a2a" />
                  <Text style={styles.exitModalTitle}>Exit Exam?</Text>
                </View>
                
                <Text style={styles.exitModalText}>
                  Are you sure you want to exit the exam? Your current progress will be lost.
                </Text>

                <View style={styles.exitModalButtons}>
                  <TouchableOpacity 
                    style={[styles.exitModalBtn, styles.cancelBtn]} 
                    onPress={() => setShowExitModal(false)}
                  >
                    <Text style={styles.cancelBtnText}>Continue Test</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.exitModalBtn, styles.confirmExitBtn]} 
                    onPress={() => {
                      setShowExitModal(false);
                      navigation.goBack();
                    }}
                  >
                    <Text style={styles.confirmExitBtnText}>Exit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BrutalistShadow>
          </View>
        </View>
      </Modal>

      {/* Results Modal */}
      <Modal
        visible={showResultsModal}
        animationType="slide"
        onRequestClose={() => {
          setShowResultsModal(false);
          navigation.goBack();
        }}
      >
        <SafeAreaView style={styles.resultsSafe}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsHeaderTitle}>KẾT QUẢ BÀI THI</Text>
            <TouchableOpacity 
              style={styles.closeResultsBtn} 
              onPress={() => {
                setShowResultsModal(false);
                navigation.goBack();
              }}
            >
              <Ionicons name="close" size={28} color="#1b263b" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {results && (
              <>
                <BrutalistShadow style={styles.scoreCard} offset={4}>
                  <View style={styles.scoreCardInner}>
                    <Text style={styles.scoreLabel}>IELTS BAND SCORE</Text>
                    <Text style={styles.scoreBand}>Band {results.bandScore}</Text>
                    <Text style={styles.scoreStats}>
                      Số câu đúng: {results.correctCount} / {results.totalQuestions}
                    </Text>
                  </View>
                </BrutalistShadow>
                
                <Text style={styles.reviewTitle}>Xem lại chi tiết câu hỏi:</Text>
                
                {results.gradedAnswers.map((ans, idx) => {
                  const qNum = idx + 1;
                  return (
                    <BrutalistShadow key={ans.questionId} style={styles.reviewCard} offset={4}>
                      <View style={styles.reviewCardInner}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text style={styles.reviewNum}>CÂU HỎI {qNum}</Text>
                          <Ionicons 
                            name={ans.isCorrect ? "checkmark-circle" : "close-circle"} 
                            size={24} 
                            color={ans.isCorrect ? "#2e7d32" : "#c92a2a"} 
                          />
                        </View>
                        
                        <Text style={styles.reviewUserAns}>
                          Câu trả lời của bạn: <Text style={{ fontFamily: 'Outfit_900Black', color: ans.isCorrect ? '#2e7d32' : '#c92a2a' }}>{ans.userAnswer || '(Không trả lời)'}</Text>
                        </Text>
                        
                        {!ans.isCorrect && (
                          <Text style={styles.reviewCorrectAns}>
                            Đáp án đúng: <Text style={{ fontFamily: 'Outfit_900Black', color: '#2e7d32' }}>{ans.correctAnswer}</Text>
                          </Text>
                        )}
                        
                        {ans.explanation && (
                          <View style={styles.explanationBox}>
                            <Text style={styles.explanationTitle}>Giải thích:</Text>
                            <Text style={styles.explanationText}>{ans.explanation}</Text>
                          </View>
                        )}
                      </View>
                    </BrutalistShadow>
                  );
                })}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
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
    borderBottomColor: '#1b263b',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerSub: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', textTransform: 'uppercase' },
  headerTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  
  timerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3dc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 2, borderColor: '#1b263b' },
  timerText: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginLeft: 6 },

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
  passageCardInner: { backgroundColor: '#fcfbf7', padding: 24, paddingLeft: 40, minHeight: 400 },
  redMarginLine: { position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(224,86,91,0.3)' },
  passageTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 20, lineHeight: 28 },
  passageText: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: '#333', lineHeight: 28, marginBottom: 16 },

  questionCard: { borderRadius: 16, marginBottom: 20 },
  questionCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  questionNum: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#c92a2a', marginBottom: 8, letterSpacing: 1 },
  questionText: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 20, lineHeight: 24 },
  
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', marginBottom: 12, backgroundColor: '#fff' },
  optionCardActive: { backgroundColor: '#ffd54f' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: '#fff' },
  radioActive: { borderColor: '#1b263b' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1b263b' },
  optionText: { flex: 1, fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#1b263b', lineHeight: 20 },
  optionTextActive: { fontFamily: 'Outfit_900Black' },

  footer: { padding: 20, backgroundColor: '#fcfbf7', borderTopWidth: 2, borderTopColor: '#1b263b' },
  submitBtn: { backgroundColor: '#c92a2a', paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 16, letterSpacing: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 38, 59, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  exitModalCard: {
    borderRadius: 16,
  },
  exitModalInner: {
    backgroundColor: '#fcfbf7',
    padding: 24,
    alignItems: 'center',
  },
  exitModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exitModalTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
    marginLeft: 10,
  },
  exitModalText: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exitModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  exitModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1b263b',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f5f3dc',
    marginRight: 10,
  },
  cancelBtnText: {
    color: '#1b263b',
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
  },
  confirmExitBtn: {
    backgroundColor: '#c92a2a',
    marginLeft: 10,
  },
  confirmExitBtnText: {
    color: '#fff',
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
  },
  sectionTabsWrapper: {
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  sectionTabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  sectionTabItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f3dc',
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  sectionTabItemActive: {
    backgroundColor: '#1b263b',
  },
  sectionTabText: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
  },
  sectionTabTextActive: {
    color: '#fff',
  },
  tfngBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1b263b',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tfngBtnActive: {
    backgroundColor: '#ffd54f',
  },
  tfngText: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
  },
  tfngTextActive: {
    fontFamily: 'Outfit_900Black',
  },
  inputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#666',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#1b263b',
    backgroundColor: '#fff',
  },
  resultsSafe: {
    flex: 1,
    backgroundColor: '#f5f3dc',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  resultsHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
  },
  closeResultsBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsScroll: {
    padding: 20,
  },
  scoreCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  scoreCardInner: {
    backgroundColor: '#ffd54f',
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
    marginBottom: 4,
  },
  scoreBand: {
    fontSize: 32,
    fontFamily: 'Outfit_900Black',
    color: '#c92a2a',
    marginBottom: 8,
  },
  scoreStats: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#1b263b',
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
    marginBottom: 12,
  },
  reviewCard: {
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewCardInner: {
    backgroundColor: '#fff',
    padding: 16,
  },
  reviewNum: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#c92a2a',
  },
  reviewUserAns: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#333',
    marginBottom: 4,
  },
  reviewCorrectAns: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  explanationBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  explanationTitle: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#333',
    marginBottom: 2,
  },
  explanationText: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    color: '#666',
    lineHeight: 18,
  },
  audioPlayerCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  audioInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioPlayerLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_900Black',
    color: '#1b263b',
  },
  audioTimeText: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    color: '#666',
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playPauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1b263b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    position: 'relative',
    justifyContent: 'center',
  },
  seekBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#c92a2a',
  },
  seekBarKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1b263b',
    position: 'absolute',
    transform: [{ translateX: -7 }],
  },
  submitWritingBtn: {
    backgroundColor: '#c92a2a',
    borderWidth: 2,
    borderColor: '#1b263b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitWritingBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitWritingBtnText: {
    color: '#fff',
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
  },
  imageContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  imageLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  diagramImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
});

export default ExamScreen;
