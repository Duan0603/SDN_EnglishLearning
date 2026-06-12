import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  useWindowDimensions
} from 'react-native';
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
    // Circumference for R=15 is 2 * Math.PI * 15 = 94.2
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

  const pillWidth = (screenWidth - 48 - 8) / 2; // padding px-6 = 24*2 = 48; inner spacing 8

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
        className="flex-1 py-3 items-center z-10 rounded-xl"
        activeOpacity={0.8}
      >
        <Text className={`text-xs font-black tracking-wide ${activeTab === 'passage' ? 'text-[#005C42]' : 'text-[#6B7280]'}`}>
          📖 Read Passage
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => setActiveTab('questions')}
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

  // Screen layout: screenWidth - page padding(48) - card inner padding(40) = screenWidth - 88
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
        {/* Backdrop overlay */}
        <Animated.View 
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' }, animatedBackdropStyle]}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Sliding Bottom Sheet */}
        <Animated.View 
          style={[animatedSheetStyle]} 
          className="bg-white p-6 rounded-t-[36px] border-t border-[#E5E7EB] shadow-2xl pb-10"
        >
          {/* Handlebar */}
          <View className="w-12 h-1.5 bg-[#E5E7EB] rounded-full self-center mb-6" />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

// --- Main ExamScreen Component ---
const ExamScreen = ({ route, navigation }) => {
  const { testType } = route.params || { testType: 'Reading' };
  const { width: screenWidth } = useWindowDimensions();

  // Tabs for Reading Simulation
  const [activeTab, setActiveTab] = useState('passage'); 

  // Countdown timer
  const initialTime = testType === 'Reading' ? 3600 : 1800;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // User answers
  const [answers, setAnswers] = useState({
    q1: '', 
    q2: '', 
    q3: '', 
    q4: '', 
    q5: '', 
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Audio Player State (Listening)
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0.35); 

  // Vocabulary Lookup Helper State
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  const { token } = useAuthStore();

  // 1. TẢI DỮ LIỆU CŨ khi người dùng vào màn hình
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const savedData = await AsyncStorage.getItem(`exam_progress_${testType}`);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setAnswers(parsed.answers);
          setTimeLeft(parsed.timeLeft);
        }
      } catch (e) {
        console.log('Lỗi tải dữ liệu cũ:', e);
      }
    };
    loadSavedProgress();
  }, [testType]);

  // 2. LƯU DỮ LIỆU MỚI mỗi khi `answers` hoặc `timeLeft` thay đổi
  useEffect(() => {
    const saveProgress = async () => {
      try {
        const dataToSave = JSON.stringify({ answers, timeLeft });
        await AsyncStorage.setItem(`exam_progress_${testType}`, dataToSave);
      } catch (e) {
        console.log('Lỗi lưu dữ liệu:', e);
      }
    };
    
    const saveTimer = setTimeout(saveProgress, 3000); 
    return () => clearTimeout(saveTimer);
  }, [answers, timeLeft, testType]);

  // Timer runner
  useEffect(() => {
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
  }, []);

  const handleAutoSubmit = () => {
    Alert.alert("Time's Up!", "Your answers have been automatically submitted.", [
      { text: "View Results", onPress: () => handleSubmit() }
    ]);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        timeTaken: initialTime - timeLeft,
        answers: [
          { questionId: 'q1', studentAnswer: answers.q1 },
          { questionId: 'q2', studentAnswer: answers.q2 },
          { questionId: 'q3', studentAnswer: answers.q3 },
          { questionId: 'q4', studentAnswer: answers.q4 },
          { questionId: 'q5', studentAnswer: answers.q5 }
        ]
      };

      const EXAM_ID = '64f1a2b3c4d5e6f7g8h9i0j1'; // Dummy exam ID

      const response = await fetch(`http://localhost:5000/api/v1/exams/${EXAM_ID}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const responseData = await response.json();

      if (response.ok || response.status === 201) {
        await AsyncStorage.removeItem(`exam_progress_${testType}`);
        setShowSubmitModal(false);
        
        navigation.navigate('Practice', { 
          screen: testType === 'Reading' ? 'ReadingAnalysis' : 'WritingAI',
          score: responseData?.data?.bandScore || '8.5'
        });
      } else {
        Alert.alert('Lỗi nộp bài', responseData.message || 'Có lỗi xảy ra');
        
        // Fallback cho FE test (nếu server không chạy)
        await AsyncStorage.removeItem(`exam_progress_${testType}`);
        setShowSubmitModal(false);
        navigation.navigate('Practice', { 
          screen: testType === 'Reading' ? 'ReadingAnalysis' : 'WritingAI',
          score: '8.5'
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server nộp bài');
      
      // Fallback
      await AsyncStorage.removeItem(`exam_progress_${testType}`);
      setShowSubmitModal(false);
      navigation.navigate('Practice', { 
        screen: testType === 'Reading' ? 'ReadingAnalysis' : 'WritingAI',
        score: '8.5'
      });
    }
  };

  const handleWordPress = (word, definition, ipa) => {
    setSelectedWord({ word, definition, ipa });
    setShowVocabModal(true);
  };

  // Reanimated Tab Offset (Reading simulation sliding pages)
  const tabOffset = useSharedValue(0);
  useEffect(() => {
    tabOffset.value = withSpring(activeTab === 'passage' ? 0 : -screenWidth, { damping: 18, stiffness: 120 });
  }, [activeTab, screenWidth]);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabOffset.value }],
    };
  });

  // 3D scale and fade-in/fade-out page transition effects
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

  // Satisfying bottom navigation progress bar width logic
  const answeredCount = Object.values(answers).filter(v => v !== '').length;
  const bottomProgress = useSharedValue(0);

  useEffect(() => {
    bottomProgress.value = withSpring(answeredCount / 5, { damping: 15 });
  }, [answeredCount]);

  const bottomProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${bottomProgress.value * 100}%`,
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB]">
        {/* Animated back button */}
        <AnimatedButton 
          onPress={() => {
            Alert.alert("Quit Test?", "All your progress in this session will be lost.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => navigation.goBack() }
            ]);
          }}
          className="w-10 h-10 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB]"
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </AnimatedButton>

        <View className="items-center">
          <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">{testType} Simulation</Text>
          <Text className="text-base font-bold text-[#1E1E1E] mt-0.5 font-sans">IELTS Prep - Test 08</Text>
        </View>

        {/* Custom Circular Pulse Timer */}
        <CircularTimer timeLeft={timeLeft} initialTime={initialTime} />
      </View>

      {/* Switch Tab cho Reading */}
      {testType === 'Reading' && (
        <SlidingSegmentedControl activeTab={activeTab} setActiveTab={setActiveTab} screenWidth={screenWidth} />
      )}

      {/* Audio Player (Listening) - Premium Dark Media Card */}
      {testType === 'Listening' && (
        <View className="bg-white px-6 py-4 border-b border-[#E5E7EB]">
          <View className="bg-[#1E293B] p-5 rounded-[28px] shadow-lg shadow-slate-300">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <AnimatedButton 
                  onPress={() => setIsPlaying(!isPlaying)}
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
                <View className="ml-4">
                  <Text className="text-sm font-bold text-white font-sans">Section 1: Rental Inquiry</Text>
                  <Text className="text-xs text-slate-400 mt-1 font-sans">IELTS Listening Band 8.5 Practice</Text>
                </View>
              </View>
              <Text className="text-xs font-mono font-black text-[#00CC99]">09:12 / 30:00</Text>
            </View>

            {/* Glowing progress line */}
            <View className="w-full h-2 bg-slate-700/50 rounded-full mt-5 overflow-hidden">
              <View className="h-full bg-[#00CC99] rounded-full shadow-sm shadow-emerald-400" style={{ width: `${audioProgress * 100}%` }} />
            </View>
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
                      <Text className="text-xs font-extrabold text-[#00CC99] uppercase tracking-widest">READING PASSAGE 1</Text>
                      <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                        <Text className="text-[9px] font-extrabold text-[#005C42]">💡 Tap underlined words to translate</Text>
                      </View>
                    </View>
                    <Text className="text-2xl font-black text-[#1E1E1E] leading-8 mb-5 tracking-tight font-sans">
                      The Rise of Creative Urban Spaces
                    </Text>
                    
                    {/* Paragraph A Card */}
                    <View className="bg-white p-5 rounded-2xl border border-[#F1F5F9] mb-5 shadow-xs border-l-4 border-l-[#00CC99]">
                      <View className="flex-row items-center mb-3">
                        <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                          <Text className="text-[10px] font-extrabold text-[#005C42] tracking-wider uppercase font-sans">Paragraph A</Text>
                        </View>
                      </View>
                      <Text className="text-sm text-[#4B5563] leading-7 font-medium font-sans">
                        In the early decades of the twenty-first century, cities around the world have undergone a radical 
                        <Text 
                          onPress={() => handleWordPress("transformation", "A marked change in form, nature, or appearance.", "/ˌtræns.fəˈmeɪ.ʃən/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        > transformation</Text>. Formerly industrial districts, once filled with abandoned warehouses and dusty factories, have been reborn as vibrant hubs of culture and technology. This trend, often referred to as the 
                        <Text 
                          onPress={() => handleWordPress("creative", "Relating to or involving the imagination or original ideas.", "/kriˈeɪ.tɪv/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        > creative</Text> city movement, is not merely about aesthetic remodeling; it represents a fundamental shift in how urban economies operate. Instead of relying on traditional manufacturing, cities now compete to attract highly skilled workers in software development, design, and biomedical engineering.
                      </Text>
                    </View>
                    
                    {/* Paragraph B Card */}
                    <View className="bg-white p-5 rounded-2xl border border-[#F1F5F9] mb-5 shadow-xs border-l-4 border-l-[#00CC99]">
                      <View className="flex-row items-center mb-3">
                        <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                          <Text className="text-[10px] font-extrabold text-[#005C42] tracking-wider uppercase font-sans">Paragraph B</Text>
                        </View>
                      </View>
                      <Text className="text-sm text-[#4B5563] leading-7 font-medium font-sans">
                        At the heart of this rebirth are shared infrastructure projects. Shared workspaces, local maker spaces, and public-private innovation hubs have sprung up globally. Research shows that geographic 
                        <Text 
                          onPress={() => handleWordPress("proximity", "Closeness in space, time, or relationship.", "/prɒkˈsɪm.ə.ti/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        > proximity</Text> between diverse industries sparks spontaneous collaboration and knowledge sharing. When developers work in close proximity to fashion designers and visual artists, new and unexpected ideas are forged. This cross-pollination has led to the emergence of multi-disciplinary fields, such as wearable technology and digital architecture.
                      </Text>
                    </View>

                    {/* Paragraph C Card */}
                    <View className="bg-white p-5 rounded-2xl border border-[#F1F5F9] mb-5 shadow-xs border-l-4 border-l-[#00CC99]">
                      <View className="flex-row items-center mb-3">
                        <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
                          <Text className="text-[10px] font-extrabold text-[#005C42] tracking-wider uppercase font-sans">Paragraph C</Text>
                        </View>
                      </View>
                      <Text className="text-sm text-[#4B5563] leading-7 font-medium font-sans">
                        However, the creative urban revolution is not without critics. Many sociologists point out that the influx of high-earning tech professionals leads to skyrocketing property values, forcing out long-term residents and local businesses. This 
                        <Text 
                          onPress={() => handleWordPress("gentrification", "The process of renovating and improving a house or district so that it conforms to middle-class taste.", "/ˌdʒen.trɪ.fɪˈkeɪ.ʃən/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        > gentrification</Text> can strip a neighborhood of its original cultural diversity, the very element that attracted the creative class in the first place. Urban planners are now faced with the monumental task of fostering economic innovation while ensuring affordable housing and social equity.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>

              {/* PAGE 2: Questions Sheet column */}
              <Animated.View style={[{ width: screenWidth, flex: 1 }, questionsStyle]}>
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                  <View className="mb-28">
                    {/* Q1 Card (MCQ) */}
                    <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                      <View className="flex-row items-start mb-4">
                        <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                          <Text className="text-sm font-extrabold text-[#005C42]">1</Text>
                        </View>
                        <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                          What is the main driver behind the creative city movement as described in Paragraph A?
                        </Text>
                      </View>

                      <AnimatedOption 
                        optionKey="A"
                        text="To restore historically significant manufacturing factories."
                        isSelected={answers.q1 === 'A'}
                        onPress={() => setAnswers({ ...answers, q1: 'A' })}
                      />
                      <AnimatedOption 
                        optionKey="B"
                        text="To shift the urban economy from manufacturing to knowledge-based industries."
                        isSelected={answers.q1 === 'B'}
                        onPress={() => setAnswers({ ...answers, q1: 'B' })}
                      />
                      <AnimatedOption 
                        optionKey="C"
                        text="To decrease the density of high-skilled professionals in cities."
                        isSelected={answers.q1 === 'C'}
                        onPress={() => setAnswers({ ...answers, q1: 'C' })}
                      />
                    </View>

                    {/* Q2 & Q3 Card (TFNG with Smooth Pill Sliders) */}
                    <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                      <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                        Questions 2-3: True/False/Not Given
                      </Text>
                      
                      <View className="mb-5 border-b border-[#F3F4F6] pb-5">
                        <View className="flex-row items-start mb-3">
                          <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-sm font-extrabold text-[#005C42]">2</Text>
                          </View>
                          <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                            Geographic proximity between different industries prevents spontaneous collaboration.
                          </Text>
                        </View>
                        <SlidingTFNG 
                          selectedValue={answers.q2}
                          onSelect={(choice) => setAnswers({ ...answers, q2: choice })}
                          screenWidth={screenWidth}
                        />
                      </View>

                      <View className="mb-2">
                        <View className="flex-row items-start mb-3">
                          <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-sm font-extrabold text-[#005C42]">3</Text>
                          </View>
                          <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                            Rising property prices are causing some long-term residents to leave creative districts.
                          </Text>
                        </View>
                        <SlidingTFNG 
                          selectedValue={answers.q3}
                          onSelect={(choice) => setAnswers({ ...answers, q3: choice })}
                          screenWidth={screenWidth}
                        />
                      </View>
                    </View>

                    {/* Q4 & Q5 Card (Fill-in-the-blanks) */}
                    <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                      <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                        Questions 4-5: Complete the Summary
                      </Text>

                      <View className="bg-[#F7F9FA] p-4 rounded-2xl border border-[#E5E7EB] mb-4">
                        <Text className="text-xs text-[#4B5563] leading-6 font-medium font-sans">
                          The creative city movement has triggered criticism due to the risk of gentrification. The arrival of high-earning 
                          <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [4] </Text> 
                          tends to drive up real estate prices. This eventually forces older residents out of their original 
                          <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [5] </Text>.
                        </Text>
                      </View>

                      <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 mb-3 focus-within:border-[#00CC99]">
                        <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-xs font-extrabold text-[#005C42] font-sans">4</Text>
                        </View>
                        <TextInput
                          value={answers.q4}
                          onChangeText={(text) => setAnswers({ ...answers, q4: text })}
                          placeholder="Enter answer for Question 4"
                          placeholderTextColor="#9CA3AF"
                          className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>

                      <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 focus-within:border-[#00CC99]">
                        <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-xs font-extrabold text-[#005C42] font-sans">5</Text>
                        </View>
                        <TextInput
                          value={answers.q5}
                          onChangeText={(text) => setAnswers({ ...answers, q5: text })}
                          placeholder="Enter answer for Question 5"
                          placeholderTextColor="#9CA3AF"
                          className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </View>
        ) : (
          // Listening simulation (single column scroll)
          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            <View className="mb-28">
              {/* Q1 Card */}
              <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                <View className="flex-row items-start mb-4">
                  <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-sm font-extrabold text-[#005C42]">1</Text>
                  </View>
                  <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                    What does the speaker identify as the main goal of the local community center project?
                  </Text>
                </View>

                <AnimatedOption 
                  optionKey="A"
                  text="To increase the city tourism revenue."
                  isSelected={answers.q1 === 'A'}
                  onPress={() => setAnswers({ ...answers, q1: 'A' })}
                />
                <AnimatedOption 
                  optionKey="B"
                  text="To provide affordable creative workspaces for local residents."
                  isSelected={answers.q1 === 'B'}
                  onPress={() => setAnswers({ ...answers, q1: 'B' })}
                />
                <AnimatedOption 
                  optionKey="C"
                  text="To construct large industrial warehouses."
                  isSelected={answers.q1 === 'C'}
                  onPress={() => setAnswers({ ...answers, q1: 'C' })}
                />
              </View>

              {/* Q2 & Q3 (TFNG) */}
              <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                  Questions 2-3: True/False/Not Given
                </Text>
                
                <View className="mb-5 border-b border-[#F3F4F6] pb-5">
                  <View className="flex-row items-start mb-3">
                    <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-sm font-extrabold text-[#005C42]">2</Text>
                    </View>
                    <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                      Geographic proximity between different industries prevents spontaneous collaboration.
                    </Text>
                  </View>
                  <SlidingTFNG 
                    selectedValue={answers.q2}
                    onSelect={(choice) => setAnswers({ ...answers, q2: choice })}
                    screenWidth={screenWidth}
                  />
                </View>

                <View className="mb-2">
                  <View className="flex-row items-start mb-3">
                    <View className="bg-[#E6F9F5] w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-sm font-extrabold text-[#005C42]">3</Text>
                    </View>
                    <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                      Rising property prices are causing some long-term residents to leave creative districts.
                    </Text>
                  </View>
                  <SlidingTFNG 
                    selectedValue={answers.q3}
                    onSelect={(choice) => setAnswers({ ...answers, q3: choice })}
                    screenWidth={screenWidth}
                  />
                </View>
              </View>

              {/* Q4 & Q5 Card */}
              <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-4 shadow-xs">
                <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                  Questions 4-5: Complete the Summary
                </Text>

                <View className="bg-[#F7F9FA] p-4 rounded-2xl border border-[#E5E7EB] mb-4">
                  <Text className="text-xs text-[#4B5563] leading-6 font-medium font-sans">
                    The creative city movement has triggered criticism due to the risk of gentrification. The arrival of high-earning 
                    <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [4] </Text> 
                    tends to drive up real estate prices. This eventually forces older residents out of their original 
                    <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [5] </Text>.
                  </Text>
                </View>

                <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 mb-3 focus-within:border-[#00CC99]">
                  <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-xs font-extrabold text-[#005C42] font-sans">4</Text>
                  </View>
                  <TextInput
                    value={answers.q4}
                    onChangeText={(text) => setAnswers({ ...answers, q4: text })}
                    placeholder="Enter answer for Question 4"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 focus-within:border-[#00CC99]">
                  <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-xs font-extrabold text-[#005C42] font-sans">5</Text>
                  </View>
                  <TextInput
                    value={answers.q5}
                    onChangeText={(text) => setAnswers({ ...answers, q5: text })}
                    placeholder="Enter answer for Question 5"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* Floating Bottom Navigation Bar chứa nút Submit Test với progress mượt mà */}
      <View className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-[#E5E7EB] px-6 pb-4">
        {/* Satisfying Top Spring Progress Line */}
        <View className="absolute top-0 left-0 right-0 h-1 bg-[#F3F4F6]">
          <Animated.View style={bottomProgressStyle} className="h-full bg-[#00CC99]" />
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <View>
            <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-sans">Progress</Text>
            <Text className="text-sm font-extrabold text-[#1E1E1E] mt-0.5 font-sans">
              {answeredCount} / 5 Answered
            </Text>
          </View>
          
          {/* Custom Animated Bouncy Submit Button */}
          <AnimatedButton
            onPress={() => setShowSubmitModal(true)}
            className="bg-[#00CC99] px-8 py-3.5 rounded-[20px] shadow-md shadow-emerald-500/20 flex-row items-center justify-center"
          >
            <Text className="text-white text-base font-extrabold mr-2 font-sans">Submit Test</Text>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </AnimatedButton>
        </View>
      </View>

      {/* Premium Slide-Up Submit Confirmation Modal */}
      <SlideUpModal visible={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <View className="items-center mb-6 mt-2">
          <View className="w-16 h-16 bg-[#E6F9F5] rounded-full items-center justify-center mb-4 shadow-sm shadow-[#A7F3D0]">
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
              <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text className="text-xl font-bold text-[#1E1E1E] text-center font-sans">Are you ready to submit?</Text>
          <Text className="text-sm text-[#9CA3AF] text-center mt-2 leading-5 px-6 font-sans">
            You have completed {answeredCount} out of 5 questions. AI Engine will instantly grade your test.
          </Text>
        </View>

        <View className="flex-row space-x-4">
          <AnimatedButton
            onPress={() => setShowSubmitModal(false)}
            className="bg-[#F7F9FA] border border-[#E5E7EB] py-4 rounded-2xl items-center justify-center"
            style={{ flex: 1 }}
          >
            <Text className="text-[#1E1E1E] text-sm font-bold font-sans">Keep Reviewing</Text>
          </AnimatedButton>
          <View className="w-4" />
          <AnimatedButton
            onPress={handleSubmit}
            className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-500/10"
            style={{ flex: 1 }}
          >
            <Text className="text-white text-sm font-bold font-sans">Submit Now</Text>
          </AnimatedButton>
        </View>
      </SlideUpModal>

      {/* Tra cứu từ vựng thông minh (AI Vocab Helper Slide-up) */}
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
          <Text className="text-white text-sm font-extrabold font-sans">Got it, thanks!</Text>
        </AnimatedButton>
      </SlideUpModal>

    </SafeAreaView>
  );
};

export default ExamScreen;
