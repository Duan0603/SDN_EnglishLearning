import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/useAuthStore';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import examService from '../api/exam.service';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// --- Sub-components for redone UI ---

// A. General Purpose Animated Squash Button
const AnimatedButton = ({ onPress, children, className, style, activeScale = 0.94 }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(activeScale, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      style={[style, animatedStyle]}
    >
      <View className={className}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

// 1. Circular Animated Timer
const CircularTimer = ({ timeLeft, initialTime }) => {
  const progress = useSharedValue(1);
  const timerScale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(timeLeft / initialTime, { duration: 1000 });
  }, [timeLeft, initialTime]);

  useEffect(() => {
    if (timeLeft < 300) {
      timerScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      timerScale.value = 1;
    }
  }, [timeLeft]);

  const animatedCircleProps = useAnimatedProps(() => {
    const strokeColor = interpolateColor(
      progress.value,
      [0.15, 0.5, 1],
      ['#EF4444', '#F59E0B', '#00CC99']
    );
    const strokeDashoffset = 94.2 * (1 - progress.value);
    return {
      stroke: strokeColor,
      strokeDashoffset: strokeDashoffset,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: timerScale.value }],
    };
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft < 300;

  return (
    <Animated.View 
      style={animatedContainerStyle}
      className={`flex-row items-center px-4 py-2 rounded-2xl border ${
        isLowTime 
          ? 'bg-[#FEF2F2] border-[#EF4444]/20 shadow-sm shadow-red-100' 
          : 'bg-[#F0FDF4] border-[#00CC99]/20'
      }`}
    >
      <View className="relative w-5 h-5 mr-2 items-center justify-center">
        <Svg width="20" height="20" viewBox="0 0 36 36">
          <Circle 
            cx="18" 
            cy="18" 
            r="15" 
            fill="none" 
            stroke={isLowTime ? '#FCA5A5' : '#D1FAE5'} 
            strokeWidth="3.5" 
            style={{ opacity: 0.4 }}
          />
          <AnimatedCircle 
            cx="18" 
            cy="18" 
            r="15" 
            fill="none" 
            strokeWidth="3.5" 
            strokeDasharray="94.2" 
            strokeLinecap="round"
            animatedProps={animatedCircleProps}
            transform="rotate(-90 18 18)"
          />
        </Svg>
      </View>
      <Text className={`text-sm font-extrabold font-mono ${isLowTime ? 'text-[#EF4444]' : 'text-[#005C42]'}`}>
        {formatTime(timeLeft)}
      </Text>
    </Animated.View>
  );
};

// 2. Sliding Segmented Control for Reading Tabs
const SlidingSegmentedControl = ({ activeTab, setActiveTab, screenWidth }) => {
  const pillOffset = useSharedValue(0);

  useEffect(() => {
    pillOffset.value = withSpring(activeTab === 'passage' ? 0 : 1, { damping: 18, stiffness: 120 });
  }, [activeTab]);

  const pillWidth = (screenWidth - 48 - 8) / 2;

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      width: pillWidth,
      transform: [{ translateX: pillOffset.value * (pillWidth + 8) }],
    };
  });

  return (
    <View className="flex-row bg-[#F1F5F9] mx-6 my-3 p-1 rounded-2xl relative border border-[#E5E7EB]">
      <Animated.View 
        style={[{ height: '82%', position: 'absolute', top: 4, left: 4 }, animatedPillStyle]}
        className="bg-white rounded-xl shadow-md shadow-slate-200/50"
      />
      
      <TouchableOpacity 
        onPress={() => setActiveTab('passage')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="flex-1 py-3 items-center z-10 rounded-xl"
        activeOpacity={0.8}
      >
        <Text className={`text-xs font-black tracking-wide ${activeTab === 'passage' ? 'text-[#005C42]' : 'text-[#6B7280]'}`}>
          📖 Read Passage
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('questions')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="flex-1 py-3 items-center z-10 rounded-xl"
        activeOpacity={0.8}
      >
        <Text className={`text-xs font-black tracking-wide ${activeTab === 'questions' ? 'text-[#005C42]' : 'text-[#6B7280]'}`}>
          ✏️ Answer Sheet
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 3. Interactive MCQ Option Cards
const AnimatedOption = ({ optionKey, text, isSelected, onPress }) => {
  const scale = useSharedValue(1);
  const selectVal = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectVal.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
    scale.value = withSpring(isSelected ? 1.025 : 1, { damping: 12 });
  }, [isSelected]);

  const animatedCardStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectVal.value,
      [0, 1],
      ['#E5E7EB', '#00CC99']
    );
    const backgroundColor = interpolateColor(
      selectVal.value,
      [0, 1],
      ['#FFFFFF', '#F0FDF4']
    );
    return {
      transform: [{ scale: scale.value }],
      borderColor,
      backgroundColor,
    };
  });

  const animatedRadioStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectVal.value,
      [0, 1],
      ['#D1D5DB', '#00CC99']
    );
    const backgroundColor = interpolateColor(
      selectVal.value,
      [0, 1],
      ['#FFFFFF', '#00CC99']
    );
    return {
      borderColor,
      backgroundColor,
    };
  });

  const animatedRadioDotStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(selectVal.value) }],
      opacity: selectVal.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      selectVal.value,
      [0, 1],
      ['#4B5563', '#005C42']
    );
    return {
      color: textColor,
    };
  });

  return (
    <Animated.View style={animatedCardStyle} className="border rounded-2xl mb-2.5 overflow-hidden shadow-xs">
      <TouchableOpacity
        onPress={onPress}
        hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        className="flex-row items-center p-4 active:opacity-90"
        activeOpacity={0.9}
      >
        <Animated.View 
          style={animatedRadioStyle} 
          className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
        >
          <Animated.View style={animatedRadioDotStyle} className="w-2.5 h-2.5 rounded-full bg-white" />
        </Animated.View>
        <Animated.Text style={animatedTextStyle} className="text-xs font-semibold flex-1 leading-5 font-sans">
          <Text className="font-extrabold">{optionKey}.</Text> {text}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 4. Sliding True/False/Not Given Pills
const SlidingTFNG = ({ selectedValue, onSelect, screenWidth }) => {
  const index = selectedValue === 'TRUE' ? 0 : selectedValue === 'FALSE' ? 1 : selectedValue === 'NOT GIVEN' ? 2 : -1;
  const slideVal = useSharedValue(index);

  useEffect(() => {
    if (index !== -1) {
      slideVal.value = withSpring(index, { damping: 15, stiffness: 120 });
    }
  }, [index]);

  const containerWidth = screenWidth - 88;
  const itemWidth = (containerWidth - 8) / 3;

  const animatedPillStyle = useAnimatedStyle(() => {
    const opacity = index !== -1 ? 1 : 0;
    return {
      opacity: withTiming(opacity, { duration: 150 }),
      width: itemWidth,
      transform: [{ translateX: slideVal.value * (itemWidth + 4) }],
    };
  });

  return (
    <View className="flex-row bg-[#F1F5F9] p-1 rounded-2xl relative border border-[#E5E7EB] mt-3">
      {index !== -1 && (
        <Animated.View 
          style={[{ height: '82%', position: 'absolute', top: 4, left: 4 }, animatedPillStyle]}
          className="bg-[#00CC99] rounded-xl shadow-xs"
        />
      )}
      
      {['TRUE', 'FALSE', 'NOT GIVEN'].map((choice) => (
        <TouchableOpacity
          key={choice}
          onPress={() => onSelect(choice)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="flex-1 py-3 items-center z-10"
          activeOpacity={0.8}
        >
          <Text className={`text-[10px] font-black tracking-wider ${
            selectedValue === choice ? 'text-white' : 'text-[#9CA3AF]'
          }`}>
            {choice}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 5. Custom Slide-Up Bottom Sheet Modal
const SlideUpModal = ({ visible, onClose, children }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const anim = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      anim.value = withSpring(1, { damping: 20, stiffness: 100 });
    } else {
      anim.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
    }
  }, [visible]);

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: anim.value * 0.5,
    };
  });

  const animatedSheetStyle = useAnimatedStyle(() => {
    const translateY = (1 - anim.value) * 500;
    return {
      transform: [{ translateY }],
    };
  });

  if (!shouldRender) return null;

  return (
    <Modal transparent visible={shouldRender} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View 
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' }, animatedBackdropStyle]}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View 
          style={[animatedSheetStyle]} 
          className="bg-white p-6 rounded-t-[36px] border-t border-[#E5E7EB] shadow-2xl pb-10"
        >
          <View className="w-12 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-6" />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

// HTML content cleaner helper
const cleanHTML = (html) => {
  if (!html) return '';
  return html
    .replace(/<\/p>/g, '\n\n')
    .replace(/<\/div>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '') // Strip other HTML tags
    .replace(/&nbsp;/g, ' ')
    .trim();
};

// --- Main ExamScreen Component ---
const ExamScreen = ({ route, navigation }) => {
  const { examId, testType } = route.params || {};
  const { width: screenWidth } = useWindowDimensions();

  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('passage'); // 'passage' or 'questions'
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const [timeLeft, setTimeLeft] = useState(3600);
  const [answers, setAnswers] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Audio Player State (Listening)
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0.0); 
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const soundRef = useRef(null);

  const currentPosition = isDragging ? dragPosition : position;
  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0;

  const formatAudioTime = (millis) => {
    if (!millis || isNaN(millis)) return "00:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load and play/pause audio helper
  const handlePlayPause = async () => {
    try {
      if (!activeSection?.audioUrl) {
        Alert.alert("Lỗi", "Không tìm thấy file âm thanh cho phần này.");
        return;
      }

      if (!soundRef.current) {
        console.log("Loading and playing sound from:", activeSection.audioUrl);
        const { sound } = await Audio.Sound.createAsync(
          { uri: activeSection.audioUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis || 0);
            setDuration(status.durationMillis || 0);
            if (status.didJustFinish) {
              setIsPlaying(false);
              soundRef.current = null;
              setPosition(0);
            }
          }
        });
      } else {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error("Lỗi phát âm thanh:", err);
      Alert.alert("Lỗi", "Không thể phát âm thanh này.");
    }
  };

  // Clean up sound on unmount or section changes
  useEffect(() => {
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [activeSectionIdx, examId]);

  // Skip backward 10 seconds
  const handleSkipBackward = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.max(0, status.positionMillis - 10000);
          await soundRef.current.setPositionAsync(newPosition);
          console.log(`Rewound 10s. New position: ${newPosition}ms`);
        }
      }
    } catch (err) {
      console.error("Lỗi tua lại:", err);
    }
  };

  // Skip forward 10 seconds
  const handleSkipForward = async () => {
    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          const newPosition = Math.min(status.durationMillis || 0, status.positionMillis + 10000);
          await soundRef.current.setPositionAsync(newPosition);
          console.log(`Forwarded 10s. New position: ${newPosition}ms`);
        }
      }
    } catch (err) {
      console.error("Lỗi tua đi:", err);
    }
  };

  // Gesture handlers for dragging progress bar
  const handleProgressBarGesture = (event) => {
    if (duration <= 0 || progressBarWidth <= 0) return;
    const { locationX } = event.nativeEvent;
    const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekPosition = seekPercentage * duration;
    setDragPosition(seekPosition);
  };

  const handleResponderGrant = (event) => {
    setIsDragging(true);
    handleProgressBarGesture(event);
  };

  const handleResponderMove = (event) => {
    handleProgressBarGesture(event);
  };

  const handleResponderRelease = async (event) => {
    setIsDragging(false);
    if (soundRef.current && duration > 0) {
      const { locationX } = event.nativeEvent;
      const seekPercentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
      const seekPosition = seekPercentage * duration;
      try {
        await soundRef.current.setPositionAsync(seekPosition);
        setPosition(seekPosition);
        console.log(`Seeked to position via drag: ${seekPosition}ms`);
      } catch (err) {
        console.error("Lỗi tua đoạn khi thả tay:", err);
      }
    }
  };

  // Vocabulary Lookup Helper State
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  const { token } = useAuthStore();

  // 1. Fetch exam data on mount
  useEffect(() => {
    const fetchExamDetails = async () => {
      if (!examId) {
        setError('Không tìm thấy thông tin đề thi.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getById(examId);
        const exam = res.data?.data || res.data;
        if (!exam) {
          throw new Error('Không có dữ liệu đề thi.');
        }
        
        if (exam.sections) {
          exam.sections.sort((a, b) => a.sectionOrder - b.sectionOrder);
          exam.sections.forEach(sec => {
            if (sec.questions) {
              sec.questions.sort((a, b) => a.questionNumber - b.questionNumber);
            }
          });
        }

        setExamData(exam);
        
        // Load saved progress or initialize empty answers
        const savedProgress = await AsyncStorage.getItem(`exam_progress_${examId}`);
        const initialAnswers = {};
        
        exam.sections.forEach(sec => {
          if (sec.questions) {
            sec.questions.forEach(q => {
              initialAnswers[q.id] = '';
            });
          }
        });

        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          const mergedAnswers = { ...initialAnswers };
          Object.keys(parsed.answers || {}).forEach(k => {
            if (k in mergedAnswers) {
              mergedAnswers[k] = parsed.answers[k];
            }
          });
          setAnswers(mergedAnswers);
          setTimeLeft(parsed.timeLeft || exam.duration * 60);
        } else {
          setAnswers(initialAnswers);
          setTimeLeft(exam.duration * 60);
        }
      } catch (err) {
        setError('Không thể tải chi tiết đề thi.');
      } finally {
        setLoading(false);
      }
    };
    fetchExamDetails();
  }, [examId]);

  // 2. Save progress on changes
  useEffect(() => {
    if (!examId || loading || error) return;
    const saveProgress = async () => {
      try {
        const dataToSave = JSON.stringify({ answers, timeLeft });
        await AsyncStorage.setItem(`exam_progress_${examId}`, dataToSave);
      } catch (e) {
        console.log('Lỗi lưu dữ liệu:', e);
      }
    };
    
    const saveTimer = setTimeout(saveProgress, 3000); 
    return () => clearTimeout(saveTimer);
  }, [answers, timeLeft, examId, loading, error]);

  // 3. Timer runner
  useEffect(() => {
    if (loading || error) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, error]);

  const handleAutoSubmit = () => {
    Alert.alert("Hết giờ làm bài!", "Bài làm của bạn đã tự động nộp.", [
      { text: "Xem kết quả", onPress: () => handleSubmit() }
    ]);
  };

  const handleSubmit = async () => {
    if (!examData) return;
    try {
      const answerPayload = Object.keys(answers).map(qId => ({
        questionId: qId,
        userAnswer: answers[qId] || ''
      }));

      const res = await examService.submit(examId, answerPayload, (examData.duration * 60) - timeLeft);
      const submitResult = res.data?.data || res.data;

      if (submitResult) {
        await AsyncStorage.removeItem(`exam_progress_${examId}`);
        setShowSubmitModal(false);

        Alert.alert(
          'Nộp bài thành công! 🎉',
          `Kết quả thi:\n• Số câu đúng: ${submitResult.correctCount} / ${submitResult.totalQuestions}\n• Điểm Band: ${submitResult.bandScore}`,
          [
            {
              text: 'Xác nhận',
              onPress: () => {
                navigation.navigate('Practice', { 
                  screen: testType === 'Reading' ? 'ReadingAnalysis' : 'WritingAI'
                });
              }
            }
          ]
        );
      }
    } catch (err) {
      setShowSubmitModal(false);
    }
  };

  const handleWordPress = (word, definition, ipa) => {
    setSelectedWord({ word, definition, ipa });
    setShowVocabModal(true);
  };

  // Reanimated Tab Offset for Reading
  const tabOffset = useSharedValue(0);
  useEffect(() => {
    tabOffset.value = withSpring(activeTab === 'passage' ? 0 : -screenWidth, { damping: 18, stiffness: 120 });
  }, [activeTab, screenWidth]);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabOffset.value }],
    };
  });

  const passageStyle = useAnimatedStyle(() => {
    const progress = 1 + (tabOffset.value / screenWidth);
    return {
      opacity: progress * 0.45 + 0.55, 
      transform: [
        { scale: progress * 0.04 + 0.96 } 
      ]
    };
  });

  const questionsStyle = useAnimatedStyle(() => {
    const progress = -tabOffset.value / screenWidth;
    return {
      opacity: progress * 0.45 + 0.55, 
      transform: [
        { scale: progress * 0.04 + 0.96 } 
      ]
    };
  });

  // Dynamic Progress calculations
  const questionsCount = examData?.sections?.reduce((sum, sec) => sum + (sec.questions?.length || 0), 0) || 1;
  const answeredCount = Object.values(answers).filter(v => v !== '').length;
  const bottomProgress = useSharedValue(0);

  useEffect(() => {
    bottomProgress.value = withSpring(answeredCount / questionsCount, { damping: 15 });
  }, [answeredCount, questionsCount]);

  const bottomProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${bottomProgress.value * 100}%`,
    };
  });

  const renderQuestion = (q, idx) => {
    const isTFNG = q.type === 'TRUE_FALSE_NOT_GIVEN' || 
                   (q.options && q.options.length === 3 && 
                    (q.options.includes('TRUE') || q.options.includes('YES') || q.options.includes('FALSE') || q.options.includes('NO')));

    if (isTFNG) {
      const choices = q.options || ['TRUE', 'FALSE', 'NOT GIVEN'];
      return (
        <View key={q.id} className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
          <View className="flex-row items-start mb-3">
            <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
              <Text className="text-sm font-extrabold text-[#005C42]">{q.questionNumber}</Text>
            </View>
            <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
              {q.content}
            </Text>
          </View>
          <View className="flex-row bg-[#F1F5F9] p-1 rounded-2xl relative border border-[#E5E7EB] mt-3">
            {choices.map((choice) => {
              const isSelected = answers[q.id] === choice;
              return (
                <TouchableOpacity
                  key={choice}
                  onPress={() => setAnswers({ ...answers, [q.id]: choice })}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className={`flex-1 py-3 items-center rounded-xl ${isSelected ? 'bg-[#00CC99]' : ''}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[10px] font-black tracking-wider ${isSelected ? 'text-white' : 'text-[#9CA3AF]'}`}>
                    {choice}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );
    }

    if (q.type === 'MULTIPLE_CHOICE' && q.options && q.options.length > 0) {
      return (
        <View key={q.id} className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
          <View className="flex-row items-start mb-4">
            <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
              <Text className="text-sm font-extrabold text-[#005C42]">{q.questionNumber}</Text>
            </View>
            <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
              {q.content}
            </Text>
          </View>

          {q.options.map((opt, optIdx) => {
            const optionLabel = String.fromCharCode(65 + optIdx);
            const isSelected = answers[q.id] === optionLabel || answers[q.id] === opt;
            return (
              <AnimatedOption
                key={optIdx}
                optionKey={optionLabel}
                text={opt}
                isSelected={isSelected}
                onPress={() => setAnswers({ ...answers, [q.id]: optionLabel })}
              />
            );
          })}
        </View>
      );
    }

    return (
      <View key={q.id} className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
        <View className="flex-row items-start mb-4">
          <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
            <Text className="text-sm font-extrabold text-[#005C42]">{q.questionNumber}</Text>
          </View>
          <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
            {q.content}
          </Text>
        </View>

        <View className="flex-row items-center border border-[#E5E7EB] bg-[#F8FAFC] rounded-2xl p-3">
          <TextInput
            value={answers[q.id] || ''}
            onChangeText={(text) => setAnswers({ ...answers, [q.id]: text })}
            placeholder="Nhập câu trả lời..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#00CC99" />
        <Text className="text-sm font-bold text-[#1E1E1E] mt-4 font-sans">Đang tải đề thi...</Text>
      </SafeAreaView>
    );
  }

  if (error || !examData) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-sm font-bold text-red-500 text-center font-sans">{error || 'Không tìm thấy dữ liệu đề thi.'}</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-6 bg-[#00CC99] px-6 py-3 rounded-2xl"
        >
          <Text className="text-white text-sm font-black">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const activeSection = examData.sections?.[activeSectionIdx];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <AnimatedButton 
          onPress={() => {
            Alert.alert("Thoát làm bài?", "Mọi tiến trình làm bài trong phiên này của bạn sẽ bị mất.", [
              { text: "Hủy", style: "cancel" },
              { text: "Thoát", style: "destructive", onPress: () => navigation.goBack() }
            ]);
          }}
          className="w-10 h-10 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB]"
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </AnimatedButton>

        <View className="items-center max-w-[200px]">
          <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">{testType} Simulation</Text>
          <Text className="text-base font-bold text-[#1E1E1E] mt-0.5 font-sans" numberOfLines={1}>{examData.title}</Text>
        </View>

        <CircularTimer timeLeft={timeLeft} initialTime={examData.duration * 60} />
      </View>

      {/* Switch Tab cho Reading */}
      {testType === 'Reading' && (
        <SlidingSegmentedControl activeTab={activeTab} setActiveTab={setActiveTab} screenWidth={screenWidth} />
      )}

      {/* Section/Passage Selector Tabs Row */}
      {examData.sections && examData.sections.length > 1 && (
        <View className="bg-white border-b border-[#E5E7EB]">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 10 }}
          >
            {examData.sections.map((sec, idx) => {
              const isActive = idx === activeSectionIdx;
              return (
                <TouchableOpacity
                  key={sec.id}
                  onPress={() => {
                    setActiveSectionIdx(idx);
                    if (testType === 'Reading') {
                      setActiveTab('passage');
                    }
                  }}
                  style={{ marginRight: 8 }}
                  className={`px-4 py-2 rounded-2xl border ${
                    isActive ? 'bg-[#00CC99] border-[#00CC99]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <Text className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-[#64748B]'}`}>
                    {testType === 'Reading' ? `Passage ${sec.sectionOrder}` : `Part ${sec.sectionOrder}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Audio Player (Listening) */}
      {testType === 'Listening' && activeSection?.audioUrl && (
        <View className="bg-white px-6 py-4 border-b border-[#E5E7EB]">
          <View className="bg-[#1E293B] p-5 rounded-[28px] shadow-lg shadow-slate-300">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <View className="flex-row items-center mr-4" style={{ gap: 8 }}>
                  {/* Skip Backward Button */}
                  <TouchableOpacity 
                    onPress={handleSkipBackward}
                    className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700 active:bg-slate-705"
                  >
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                      <Path d="M12.5 15L7 11.5L12.5 8V15Z" fill="#FFF" />
                      <Path d="M18.5 15L13 11.5L18.5 8V15Z" fill="#FFF" />
                    </Svg>
                  </TouchableOpacity>

                  {/* Play/Pause Button */}
                  <AnimatedButton 
                    onPress={handlePlayPause}
                    className="w-12 h-12 bg-[#00CC99] rounded-full items-center justify-center border border-[#005C42]/10"
                  >
                    {isPlaying ? (
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#FFF" />
                      </Svg>
                    ) : (
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <Path d="M8 5v14l11-7z" fill="#FFF" />
                      </Svg>
                    )}
                  </AnimatedButton>

                  {/* Skip Forward Button */}
                  <TouchableOpacity 
                    onPress={handleSkipForward}
                    className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center border border-slate-700 active:bg-slate-705"
                  >
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2">
                      <Path d="M11.5 15L17 11.5L11.5 8V15Z" fill="#FFF" />
                      <Path d="M5.5 15L11 11.5L5.5 8V15Z" fill="#FFF" />
                    </Svg>
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white font-sans">
                    {activeSection.title || `Part ${activeSection.sectionOrder}`}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-1 font-sans">
                    {examData.title}
                  </Text>
                </View>
              </View>
              <Text className="text-xs font-mono font-black text-[#00CC99]">
                {isPlaying ? 'Playing' : 'Paused'}
              </Text>
            </View>

            {/* Seekable Progress Bar */}
            {duration > 0 && (
              <View className="mt-4">
                <View 
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={handleResponderGrant}
                  onResponderMove={handleResponderMove}
                  onResponderRelease={handleResponderRelease}
                  onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                  className="h-6 justify-center relative"
                >
                  {/* Track (gray background) */}
                  <View pointerEvents="none" className="h-1.5 w-full bg-slate-700 rounded-full relative">
                    {/* Progress fill */}
                    <View 
                      pointerEvents="none"
                      style={{ width: `${progressPercentage}%` }}
                      className="h-full bg-[#00CC99] rounded-full"
                    />
                  </View>
                  {/* Slider Thumb */}
                  <View 
                    pointerEvents="none"
                    style={{ 
                      position: 'absolute',
                      left: `${progressPercentage}%`,
                      transform: [{ translateX: -7 }],
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#FFFFFF',
                      borderWidth: 2,
                      borderColor: '#00CC99',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-[10px] text-slate-400 font-mono">{formatAudioTime(currentPosition)}</Text>
                  <Text className="text-[10px] text-slate-400 font-mono">{formatAudioTime(duration)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Main quiz sliding view container */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {testType === 'Reading' ? (
          <View style={{ width: screenWidth, flex: 1, overflow: 'hidden' }}>
            <Animated.View style={[{ flexDirection: 'row', width: screenWidth * 2, flex: 1 }, animatedContentStyle]}>
              {/* PAGE 1: Passage reading column */}
              <Animated.View style={[{ width: screenWidth, flex: 1 }, passageStyle]}>
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                  <View className="bg-[#FCFDFD] p-6 rounded-[32px] border border-[#E5E7EB] mb-28 shadow-sm">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-xs font-extrabold text-[#00CC99] uppercase tracking-widest">
                        READING PASSAGE {activeSection?.sectionOrder}
                      </Text>
                    </View>
                    <Text className="text-2xl font-black text-[#1E1E1E] leading-8 mb-5 tracking-tight font-sans">
                      {activeSection?.title || 'No Title'}
                    </Text>
                    
                    <View className="bg-white p-5 rounded-2xl border border-[#F1F5F9] mb-5 shadow-xs border-l-4 border-l-[#00CC99]">
                      <Text className="text-sm text-[#4B5563] leading-7 font-medium font-sans">
                        {cleanHTML(activeSection?.passageText)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>

              {/* PAGE 2: Questions Sheet column */}
              <Animated.View style={[{ width: screenWidth, flex: 1 }, questionsStyle]}>
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                  <View className="mb-28">
                    {activeSection?.questions && activeSection.questions.length > 0 ? (
                      activeSection.questions.map((q, qidx) => renderQuestion(q, qidx))
                    ) : (
                      <View className="items-center justify-center p-10">
                        <Text className="text-sm font-bold text-slate-400">Không có câu hỏi trong phần này.</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </View>
        ) : (
          // Listening simulation
          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            <View className="mb-28">
              {activeSection?.questions && activeSection.questions.length > 0 ? (
                activeSection.questions.map((q, qidx) => renderQuestion(q, qidx))
              ) : (
                <View className="items-center justify-center p-10">
                  <Text className="text-sm font-bold text-slate-400">Không có câu hỏi trong phần này.</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Floating Bottom Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-[#E5E7EB] px-6 pb-4">
        <View className="absolute top-0 left-0 right-0 h-1 bg-[#F3F4F6]">
          <Animated.View style={bottomProgressStyle} className="h-full bg-[#00CC99]" />
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <View>
            <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-sans">Tiến trình</Text>
            <Text className="text-sm font-extrabold text-[#1E1E1E] mt-0.5 font-sans">
              {answeredCount} / {questionsCount} đã trả lời
            </Text>
          </View>
          
          <AnimatedButton
            onPress={() => setShowSubmitModal(true)}
            className="bg-[#00CC99] px-8 py-3.5 rounded-[20px] shadow-md shadow-emerald-500/20 flex-row items-center justify-center"
          >
            <Text className="text-white text-base font-extrabold mr-2 font-sans">Nộp bài</Text>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </AnimatedButton>
        </View>
      </View>

      {/* Submit Confirmation Modal */}
      <SlideUpModal visible={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <View className="items-center mb-6 mt-2">
          <View className="w-16 h-16 bg-[#E6F9F5] rounded-full items-center justify-center mb-4 shadow-sm shadow-[#A7F3D0]">
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
              <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="text-xl font-bold text-[#1E1E1E] text-center font-sans">Xác nhận nộp bài?</Text>
          <Text className="text-sm text-[#9CA3AF] text-center mt-2 leading-5 px-6 font-sans">
            Bạn đã hoàn thành {answeredCount} trên tổng số {questionsCount} câu hỏi. Hệ thống AI sẽ chấm điểm bài thi của bạn ngay lập tức.
          </Text>
        </View>

        <View className="flex-row space-x-4">
          <AnimatedButton
            onPress={() => setShowSubmitModal(false)}
            className="bg-[#F7F9FA] border border-[#E5E7EB] py-4 rounded-2xl items-center justify-center"
            style={{ flex: 1 }}
          >
            <Text className="text-[#1E1E1E] text-sm font-bold font-sans">Xem lại bài</Text>
          </AnimatedButton>
          <View className="w-4" />
          <AnimatedButton
            onPress={handleSubmit}
            className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-500/10"
            style={{ flex: 1 }}
          >
            <Text className="text-white text-sm font-bold font-sans">Nộp bài ngay</Text>
          </AnimatedButton>
        </View>
      </SlideUpModal>

      {/* Vocabulary Helper Slide-up */}
      <SlideUpModal visible={showVocabModal} onClose={() => setShowVocabModal(false)}>
        <View className="mb-4 mt-2">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#F3F4F6]">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-black text-[#1E1E1E]">{selectedWord?.word}</Text>
              <Text className="text-sm text-[#00CC99] font-bold ml-2.5 italic">{selectedWord?.ipa}</Text>
            </View>
          </View>
        </View>

        <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2 font-sans">AI Dictionary Definition</Text>
        <Text className="text-sm text-[#4B5563] leading-6 font-semibold mb-6 bg-[#F7F9FA] p-4.5 rounded-2xl border border-[#E5E7EB] font-sans">
          {selectedWord?.definition}
        </Text>

        <AnimatedButton 
          onPress={() => setShowVocabModal(false)}
          className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-500/10"
        >
          <Text className="text-white text-sm font-extrabold font-sans">Đồng ý</Text>
        </AnimatedButton>
      </SlideUpModal>
    </SafeAreaView>
  );
};

export default ExamScreen;
