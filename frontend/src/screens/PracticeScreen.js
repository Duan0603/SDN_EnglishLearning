import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Animated as RNAnimated,
  Easing,
  useWindowDimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/useAuthStore';
import Svg, { Path, Circle, Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
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

// --- Sub-components for premium animations and design ---

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Star component for twinkling star effect on light grey background
const Star = ({ size, top, left, color }) => {
  const opacity = useSharedValue(0.1 + Math.random() * 0.4);

  useEffect(() => {
    const duration = 1000 + Math.random() * 1200; // Faster frequency for higher sparkling feel
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.05, { duration }),
        withTiming(0.9 + Math.random() * 0.1, { duration })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: opacity.value * 1.3 }],
    };
  });

  const hasShadow = color === '#FFFFFF';

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: `${top}%`,
          left: `${left}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          ...(hasShadow ? {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            elevation: 1,
          } : {}),
        },
        animatedStyle,
      ]}
    />
  );
};

// Custom Reanimated Shooting Star (Meteor) Component
const ShootingStar = ({ screenWidth, screenHeight }) => {
  const translateX = useSharedValue(-100);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const triggerMeteor = () => {
    const startX = Math.random() * (screenWidth - 100);
    const startY = (Math.random() * screenHeight) / 3; // Upper 1/3 of screen
    const length = 250 + Math.random() * 250; // travel longer distance
    const duration = 800 + Math.random() * 600;

    translateX.value = startX;
    translateY.value = startY;
    opacity.value = 0;

    opacity.value = withSequence(
      withTiming(0.8, { duration: duration * 0.2 }),
      withTiming(0.8, { duration: duration * 0.5 }),
      withTiming(0, { duration: duration * 0.3 })
    );

    translateX.value = withTiming(startX + length, { duration });
    translateY.value = withTiming(startY + length * 0.5, { duration }, (finished) => {
      if (finished) {
        // Queue next shooting star after random delay (4s to 10s)
        const delay = 4000 + Math.random() * 6000;
        runOnJS(setTimeout)(triggerMeteor, delay);
      }
    });
  };

  useEffect(() => {
    const initialDelay = 500 + Math.random() * 4000;
    const timer = setTimeout(triggerMeteor, initialDelay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width: 80,
          height: 3,
          backgroundColor: '#00CC99', // Emerald signature trail
          transform: [{ rotate: '25deg' }],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF', position: 'absolute', right: 0 }} />
      </View>
    </Animated.View>
  );
};

// Premium Starry Background Component with smooth twinkling animations and shooting stars
const StarryBackground = () => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [stars] = useState(() => {
    const arr = [];
    const colors = ['#EAB308', '#00CC99', '#FFFFFF', '#94A3B8'];
    for (let i = 0; i < 80; i++) {
      const colorIdx = Math.floor(Math.random() * colors.length);
      arr.push({
        id: i,
        size: Math.random() < 0.2 ? 5.5 : Math.random() < 0.6 ? 4.5 : 3.0, // Enlarged stars for better visibility
        top: Math.random() * 100,
        left: Math.random() * 100,
        color: colors[colorIdx],
      });
    }
    return arr;
  });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      {stars.map((star) => (
        <Star key={star.id} size={star.size} top={star.top} left={star.left} color={star.color} />
      ))}
      <ShootingStar screenWidth={screenWidth} screenHeight={screenHeight} />
      <ShootingStar screenWidth={screenWidth} screenHeight={screenHeight} />
      <ShootingStar screenWidth={screenWidth} screenHeight={screenHeight} />
    </View>
  );
};

// 1. Circular Animated Timer for embedded exams
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
          ? 'bg-[#FEF2F2]/90 border-[#EF4444]/20 shadow-sm shadow-red-100' 
          : 'bg-white/90 border-[#00CC99]/20'
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

// 2. Sliding Segmented Control for Reading Sub-tabs
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
    <View className="flex-row bg-[#F1F5F9]/85 mx-6 my-3 p-1 rounded-2xl relative border border-[#E5E7EB]">
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

// 1. Squash Active Button Touch Control
const AnimatedButton = ({ onPress, children, className, style, activeScale = 0.95 }) => {
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
    <Animated.View style={[style, animatedStyle]} className={className}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        className="w-full h-full items-center justify-center flex-row"
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// 2. Sliding Header Nav Bar Control
const SlidingHeaderTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'ReadingAI', label: 'Reading' },
    { id: 'ListeningAI', label: 'Listening' },
    { id: 'WritingAI', label: 'Writing' },
    { id: 'SpeakingAI', label: 'Speaking' },
    { id: 'ReadingAnalysis', label: 'Analytics' }
  ];
  
  const index = tabs.findIndex(t => t.id === activeTab);
  const slideVal = useSharedValue(index === -1 ? 0 : index);

  useEffect(() => {
    if (index !== -1) {
      slideVal.value = withSpring(index, { damping: 15, stiffness: 120 });
    }
  }, [index]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideVal.value * 84 }],
    };
  });

  return (
    <View 
      style={{ width: 428, height: 40, padding: 4 }}
      className="bg-[#F1F5F9] rounded-full flex-row border border-[#E5E7EB] relative items-center flex-shrink-0"
    >
      <Animated.View 
        style={[{ width: 84, height: 32, position: 'absolute', top: 4, left: 4 }, animatedPillStyle]}
        className="bg-white rounded-full shadow-sm shadow-emerald-500/20"
      />
      
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => setActiveTab(tab.id)}
          style={{ width: 84, height: 32 }}
          className="items-center justify-center z-10"
          activeOpacity={0.8}
        >
          <Text 
            style={{ fontSize: 10.5 }}
            className={`font-black tracking-tight ${
              activeTab === tab.id ? 'text-[#005C42]' : 'text-[#6B7280]'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// 3. Sliding Graph Filter Control
const SlidingGraphFilter = ({ graphFilter, setGraphFilter }) => {
  const index = graphFilter === 'last10' ? 0 : 1;
  const slideVal = useSharedValue(index);

  useEffect(() => {
    slideVal.value = withSpring(index, { damping: 15, stiffness: 120 });
  }, [index]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: slideVal.value * 70 }],
    };
  });

  return (
    <View className="w-[144px] h-8 bg-[#F1F5F9] rounded-xl flex-row p-0.5 border border-[#E5E7EB] relative items-center justify-between">
      <Animated.View 
        style={[{ width: 68, height: 24, position: 'absolute', top: 2, left: 2 }, animatedPillStyle]}
        className="bg-[#1E1E1E] rounded-lg"
      />
      
      <TouchableOpacity
        onPress={() => setGraphFilter('last10')}
        className="w-[68px] py-1.5 items-center justify-center z-10"
        activeOpacity={0.8}
      >
        <Text className={`text-[10px] font-black ${graphFilter === 'last10' ? 'text-white' : 'text-[#6B7280]'}`}>
          Last 10
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setGraphFilter('allTime')}
        className="w-[68px] py-1.5 items-center justify-center z-10"
        activeOpacity={0.8}
      >
        <Text className={`text-[10px] font-black ${graphFilter === 'allTime' ? 'text-white' : 'text-[#6B7280]'}`}>
          All Time
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 4. Milestone card with elastic click scale down
const MilestoneCard = ({ title, date, score, iconType }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="bg-white p-4.5 rounded-[24px] border border-[#E5E7EB] flex-row justify-between items-center px-5 mb-3 active:border-[#00CC99]/30"
      >
        <View className="flex-row items-center flex-1 pr-3">
          <View className="w-9 h-9 bg-[#F0FDF4] rounded-xl items-center justify-center mr-3 border border-[#D1FAE5]">
            {iconType === 'calendar' ? (
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" />
              </Svg>
            ) : (
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </Svg>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-[#1E1E1E]" numberOfLines={1}>{title}</Text>
            <Text className="text-[11px] text-[#9CA3AF] font-semibold mt-1">{date}</Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className={`text-base font-black mr-2 ${score >= 8.0 ? 'text-[#005C42]' : 'text-[#6B7280]'}`}>{score}</Text>
          <View className={`px-2 py-0.5 rounded-md ${score >= 8.0 ? 'bg-[#E6F9F5]' : 'bg-[#F3F4F6]'}`}>
            <Text className={`text-[8px] font-black ${score >= 8.0 ? 'text-[#005C42]' : 'text-[#6B7280]'}`}>
              {score >= 8.0 ? 'ELITE' : 'PASSED'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main PracticeScreen Component ---
const PracticeScreen = ({ navigation, route }) => {
  const initialTab = route?.params?.screen || 'ReadingAI';
  
  const getNormalizedTab = (tabName) => {
    if (tabName === 'WritingSubmit' || tabName === 'WritingAI') {
      return 'WritingAI';
    }
    if (tabName === 'SpeakingSubmit' || tabName === 'SpeakingAI') {
      return 'SpeakingAI';
    }
    if (tabName === 'ReadingAI') {
      return 'ReadingAI';
    }
    if (tabName === 'ListeningAI') {
      return 'ListeningAI';
    }
    if (tabName === 'ReadingAnalysis') {
      return 'ReadingAnalysis';
    }
    return 'ReadingAI';
  };

  const [activeTab, setActiveTab] = useState(getNormalizedTab(initialTab));
  const [graphFilter, setGraphFilter] = useState('last10');
  const { width: screenWidth } = useWindowDimensions();

  const { token } = useAuthStore();

  // Reading Exam States
  const [readingTimeLeft, setReadingTimeLeft] = useState(3600); // 60 minutes
  const [readingAnswers, setReadingAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });
  const [activeReadingSubTab, setActiveReadingSubTab] = useState('passage');

  // Reanimated Tab Offset for Reading
  const readingTabOffset = useSharedValue(0);
  useEffect(() => {
    readingTabOffset.value = withSpring(activeReadingSubTab === 'passage' ? 0 : -screenWidth, { damping: 18, stiffness: 120 });
  }, [activeReadingSubTab, screenWidth]);

  const readingAnimatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: readingTabOffset.value }],
    };
  });

  const readingPassageStyle = useAnimatedStyle(() => {
    const progress = 1 + (readingTabOffset.value / screenWidth);
    return {
      opacity: progress * 0.45 + 0.55, 
      transform: [
        { scale: progress * 0.04 + 0.96 } 
      ]
    };
  });

  const readingQuestionsStyle = useAnimatedStyle(() => {
    const progress = -readingTabOffset.value / screenWidth;
    return {
      opacity: progress * 0.45 + 0.55, 
      transform: [
        { scale: progress * 0.04 + 0.96 } 
      ]
    };
  });

  const readingAnsweredCount = Object.values(readingAnswers).filter(v => v !== '').length;
  const readingBottomProgress = useSharedValue(0);

  useEffect(() => {
    readingBottomProgress.value = withSpring(readingAnsweredCount / 5, { damping: 15 });
  }, [readingAnsweredCount]);

  const readingBottomProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${readingBottomProgress.value * 100}%`,
    };
  });

  // Listening Exam States
  const [listeningTimeLeft, setListeningTimeLeft] = useState(1800); // 30 minutes
  const [listeningAnswers, setListeningAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  });
  const [listeningIsPlaying, setListeningIsPlaying] = useState(false);
  const [listeningAudioProgress, setListeningAudioProgress] = useState(0.35);

  const listeningAnsweredCount = Object.values(listeningAnswers).filter(v => v !== '').length;
  const listeningBottomProgress = useSharedValue(0);

  useEffect(() => {
    listeningBottomProgress.value = withSpring(listeningAnsweredCount / 5, { damping: 15 });
  }, [listeningAnsweredCount]);

  const listeningBottomProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${listeningBottomProgress.value * 100}%`,
    };
  });

  // Shared Modals States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitModalType, setSubmitModalType] = useState('Reading'); // 'Reading' | 'Listening'
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  // Vocabulary Lookup Press Handler
  const handleWordPress = (word, definition, ipa) => {
    setSelectedWord({ word, definition, ipa });
    setShowVocabModal(true);
  };

  // Submit functions
  const handleReadingSubmit = async () => {
    try {
      const payload = {
        timeTaken: 3600 - readingTimeLeft,
        answers: [
          { questionId: 'q1', studentAnswer: readingAnswers.q1 },
          { questionId: 'q2', studentAnswer: readingAnswers.q2 },
          { questionId: 'q3', studentAnswer: readingAnswers.q3 },
          { questionId: 'q4', studentAnswer: readingAnswers.q4 },
          { questionId: 'q5', studentAnswer: readingAnswers.q5 }
        ]
      };

      const EXAM_ID = '64f1a2b3c4d5e6f7g8h9i0j1'; // Dummy Exam ID for reading
      const response = await fetch(`http://localhost:5000/api/v1/exams/${EXAM_ID}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok || response.status === 201) {
        await AsyncStorage.removeItem('practice_reading_progress');
        setShowSubmitModal(false);
        setActiveTab('ReadingAnalysis');
      } else {
        Alert.alert('Lỗi nộp bài', data.message || 'Có lỗi xảy ra');
        // Fallback cho UI Test
        await AsyncStorage.removeItem('practice_reading_progress');
        setShowSubmitModal(false);
        setActiveTab('ReadingAnalysis');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server nộp bài');
      // Fallback cho UI Test
      await AsyncStorage.removeItem('practice_reading_progress');
      setShowSubmitModal(false);
      setActiveTab('ReadingAnalysis');
    }
  };

  const handleListeningSubmit = async () => {
    try {
      const payload = {
        timeTaken: 1800 - listeningTimeLeft,
        answers: [
          { questionId: 'q1', studentAnswer: listeningAnswers.q1 },
          { questionId: 'q2', studentAnswer: listeningAnswers.q2 },
          { questionId: 'q3', studentAnswer: listeningAnswers.q3 },
          { questionId: 'q4', studentAnswer: listeningAnswers.q4 },
          { questionId: 'q5', studentAnswer: listeningAnswers.q5 }
        ]
      };

      const EXAM_ID = '64f1a2b3c4d5e6f7g8h9i0j1'; 
      const response = await fetch(`http://localhost:5000/api/v1/exams/${EXAM_ID}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (response.ok || response.status === 201) {
        await AsyncStorage.removeItem('practice_listening_progress');
        setShowSubmitModal(false);
        setActiveTab('ReadingAnalysis');
      } else {
        Alert.alert('Lỗi nộp bài', data.message || 'Có lỗi xảy ra');
        // Fallback cho UI Test
        await AsyncStorage.removeItem('practice_listening_progress');
        setShowSubmitModal(false);
        setActiveTab('ReadingAnalysis');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server nộp bài');
      // Fallback cho UI Test
      await AsyncStorage.removeItem('practice_listening_progress');
      setShowSubmitModal(false);
      setActiveTab('ReadingAnalysis');
    }
  };

  const handleReadingAutoSubmit = () => {
    Alert.alert("Time's Up!", "Your Reading test answers have been automatically submitted.", [
      { text: "View Results", onPress: () => handleReadingSubmit() }
    ]);
  };

  const handleListeningAutoSubmit = () => {
    Alert.alert("Time's Up!", "Your Listening test answers have been automatically submitted.", [
      { text: "View Results", onPress: () => handleListeningSubmit() }
    ]);
  };

  // Timers Runners
  // Sync Reading with LocalStorage
  useEffect(() => {
    const loadReading = async () => {
      try {
        const saved = await AsyncStorage.getItem('practice_reading_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          setReadingAnswers(parsed.answers);
          setReadingTimeLeft(parsed.timeLeft);
        }
      } catch(e) {}
    };
    loadReading();
  }, []);

  useEffect(() => {
    const saveReading = async () => {
      try {
        await AsyncStorage.setItem('practice_reading_progress', JSON.stringify({ answers: readingAnswers, timeLeft: readingTimeLeft }));
      } catch(e) {}
    };
    const t = setTimeout(saveReading, 3000);
    return () => clearTimeout(t);
  }, [readingAnswers, readingTimeLeft]);

  useEffect(() => {
    if (activeTab !== 'ReadingAI') return;
    const timer = setInterval(() => {
      setReadingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReadingAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Sync Listening with LocalStorage
  useEffect(() => {
    const loadListening = async () => {
      try {
        const saved = await AsyncStorage.getItem('practice_listening_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          setListeningAnswers(parsed.answers);
          setListeningTimeLeft(parsed.timeLeft);
        }
      } catch(e) {}
    };
    loadListening();
  }, []);

  useEffect(() => {
    const saveListening = async () => {
      try {
        await AsyncStorage.setItem('practice_listening_progress', JSON.stringify({ answers: listeningAnswers, timeLeft: listeningTimeLeft }));
      } catch(e) {}
    };
    const t = setTimeout(saveListening, 3000);
    return () => clearTimeout(t);
  }, [listeningAnswers, listeningTimeLeft]);

  useEffect(() => {
    if (activeTab !== 'ListeningAI') return;
    const timer = setInterval(() => {
      setListeningTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleListeningAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Resets
  const handleReadingReset = () => {
    setReadingTimeLeft(3600);
    setReadingAnswers({
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      q5: '',
    });
    setActiveReadingSubTab('passage');
    setActiveTab('ReadingAI');
  };


  useEffect(() => {
    if (route?.params?.screen) {
      setActiveTab(getNormalizedTab(route.params.screen));
    }
  }, [route?.params?.screen]);
  
  // States cho Writing AI
  const [writingInput, setWritingInput] = useState(
    "In recent years, the consumption of fast food has increased dramatically. Some people believe that this trend has a negative impact on individuals and society, and they think that taxes on fast food should be increased to solve this problem. Personally, I am agree with this viewpoint because fast food causes many health issues."
  );
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);
  const [showWritingResult, setShowWritingResult] = useState(false);

  // States cho Speaking AI
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showSpeakingResult, setShowSpeakingResult] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const recordingTimer = useRef(null);

  // Animation cho sóng âm Speaking
  const waveAnim1 = useRef(new RNAnimated.Value(10)).current;
  const waveAnim2 = useRef(new RNAnimated.Value(15)).current;
  const waveAnim3 = useRef(new RNAnimated.Value(8)).current;
  const waveAnim4 = useRef(new RNAnimated.Value(20)).current;

  // Xử lý đếm giờ và sinh text mô phỏng Whisper STT khi ghi âm Speaking
  useEffect(() => {
    if (isRecording) {
      // Loop animations cho sóng âm
      const createWaveAnimation = (anim, toVal) => {
        return RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(anim, {
              toValue: toVal,
              duration: 350,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            RNAnimated.timing(anim, {
              toValue: 5,
              duration: 350,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const anims = [
        createWaveAnimation(waveAnim1, 35),
        createWaveAnimation(waveAnim2, 45),
        createWaveAnimation(waveAnim3, 30),
        createWaveAnimation(waveAnim4, 50),
      ];

      anims.forEach(a => a.start());

      recordingTimer.current = setInterval(() => {
        setRecordingSeconds(prev => {
          const nextSec = prev + 1;
          // Mô phỏng text Whisper nhận diện theo thời gian thực
          if (nextSec === 2) setSpeakingText("Describe a memorable... a memorable event in your life...");
          if (nextSec === 5) setSpeakingText("Describe a memorable event in your life. I would like to talking about...");
          if (nextSec === 8) setSpeakingText("Describe a memorable event in your life. I would like to talking about my graduation day. It was extremely... beautiful day and I feel very proud...");
          return nextSec;
        });
      }, 1000);
    } else {
      clearInterval(recordingTimer.current);
      setRecordingSeconds(0);
      waveAnim1.setValue(10);
      waveAnim2.setValue(15);
      waveAnim3.setValue(8);
      waveAnim4.setValue(20);
    }

    return () => clearInterval(recordingTimer.current);
  }, [isRecording]);

  const handleStartRecording = () => {
    setShowSpeakingResult(false);
    setSpeakingText("");
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setShowSpeakingResult(true);
  };

  const handleWritingAnalyze = () => {
    setIsAnalyzingWriting(true);
    setTimeout(() => {
      setIsAnalyzingWriting(false);
      setShowWritingResult(true);
    }, 2000); 
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F1F5F9]">
      <StarryBackground />
      {/* Premium Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB] flex-wrap gap-y-3">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="flex-row items-center"
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
          <Text className="text-xl font-black text-[#1E1E1E] ml-2 tracking-tight">Apex AI Workspace</Text>
        </TouchableOpacity>
        
        {/* Navigation Tabs - Modern Segmented Sliding Indicator */}
        <SlidingHeaderTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>

      {/* Main Workspace Body */}
      {activeTab === 'ReadingAI' && (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          {/* Sub-Header inside active workspace */}
          <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-[#E5E7EB]">
            <View>
              <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Reading Simulation</Text>
              <Text className="text-sm font-bold text-[#1E1E1E] mt-0.5 font-sans">IELTS Prep - Test 08</Text>
            </View>
            <CircularTimer timeLeft={readingTimeLeft} initialTime={3600} />
          </View>
          
          <SlidingSegmentedControl activeTab={activeReadingSubTab} setActiveTab={setActiveReadingSubTab} screenWidth={screenWidth} />
          
          <View style={{ width: screenWidth, flex: 1, overflow: 'hidden' }}>
            <Animated.View style={[{ flexDirection: 'row', width: screenWidth * 2, flex: 1 }, readingAnimatedContentStyle]}>
              {/* PAGE 1: Passage reading column */}
              <Animated.View style={[{ width: screenWidth, flex: 1 }, readingPassageStyle]}>
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
                        In the early decades of the twenty-first century, cities around the world have undergone a radical{' '}
                        <Text 
                          onPress={() => handleWordPress("transformation", "A marked change in form, nature, or appearance.", "/ˌtræns.fəˈmeɪ.ʃən/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        >transformation</Text>. Formerly industrial districts, once filled with abandoned warehouses and dusty factories, have been reborn as vibrant hubs of culture and technology. This trend, often referred to as the{' '}
                        <Text 
                          onPress={() => handleWordPress("creative", "Relating to or involving the imagination or original ideas.", "/kriˈeɪ.tɪv/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        >creative</Text> city movement, is not merely about aesthetic remodeling; it represents a fundamental shift in how urban economies operate. Instead of relying on traditional manufacturing, cities now compete to attract highly skilled workers in software development, design, and biomedical engineering.
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
                        At the heart of this rebirth are shared infrastructure projects. Shared workspaces, local maker spaces, and public-private innovation hubs have sprung up globally. Research shows that geographic{' '}
                        <Text 
                          onPress={() => handleWordPress("proximity", "Closeness in space, time, or relationship.", "/prɒkˈsɪm.ə.ti/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        >proximity</Text> between diverse industries sparks spontaneous collaboration and knowledge sharing. When developers work in close proximity to fashion designers and visual artists, new and unexpected ideas are forged. This cross-pollination has led to the emergence of multi-disciplinary fields, such as wearable technology and digital architecture.
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
                        However, the creative urban revolution is not without critics. Many sociologists point out that the influx of high-earning tech professionals leads to skyrocketing property values, forcing out long-term residents and local businesses. This{' '}
                        <Text 
                          onPress={() => handleWordPress("gentrification", "The process of renovating and improving a house or district so that it conforms to middle-class taste.", "/ˌdʒen.trɪ.fɪˈkeɪ.ʃən/")}
                          className="text-[#005C42] font-extrabold mx-0.5"
                          style={{ textDecorationLine: 'underline', textDecorationColor: '#00CC99' }}
                        >gentrification</Text> can strip a neighborhood of its original cultural diversity, the very element that attracted the creative class in the first place. Urban planners are now faced with the monumental task of fostering economic innovation while ensuring affordable housing and social equity.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>

              {/* PAGE 2: Questions Sheet column */}
              <Animated.View style={[{ width: screenWidth, flex: 1 }, readingQuestionsStyle]}>
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
                        isSelected={readingAnswers.q1 === 'A'}
                        onPress={() => setReadingAnswers({ ...readingAnswers, q1: 'A' })}
                      />
                      <AnimatedOption 
                        optionKey="B"
                        text="To shift the urban economy from manufacturing to knowledge-based industries."
                        isSelected={readingAnswers.q1 === 'B'}
                        onPress={() => setReadingAnswers({ ...readingAnswers, q1: 'B' })}
                      />
                      <AnimatedOption 
                        optionKey="C"
                        text="To decrease the density of high-skilled professionals in cities."
                        isSelected={readingAnswers.q1 === 'C'}
                        onPress={() => setReadingAnswers({ ...readingAnswers, q1: 'C' })}
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
                          selectedValue={readingAnswers.q2}
                          onSelect={(choice) => setReadingAnswers({ ...readingAnswers, q2: choice })}
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
                          selectedValue={readingAnswers.q3}
                          onSelect={(choice) => setReadingAnswers({ ...readingAnswers, q3: choice })}
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
                          The creative city movement has triggered criticism due to the risk of gentrification. The arrival of high-earning{' '}
                          <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [4] </Text>{' '}
                          tends to drive up real estate prices. This eventually forces older residents out of their original{' '}
                          <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [5] </Text>.
                        </Text>
                      </View>

                      <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 mb-3 focus-within:border-[#00CC99]">
                        <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-xs font-extrabold text-[#005C42] font-sans">4</Text>
                        </View>
                        <TextInput
                          value={readingAnswers.q4}
                          onChangeText={(text) => setReadingAnswers({ ...readingAnswers, q4: text })}
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
                          value={readingAnswers.q5}
                          onChangeText={(text) => setReadingAnswers({ ...readingAnswers, q5: text })}
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

          {/* Floating Bottom Navigation Bar */}
          <View className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-[#E5E7EB] px-6 pb-4">
            {/* Satisfying Top Spring Progress Line */}
            <View className="absolute top-0 left-0 right-0 h-1 bg-[#F3F4F6]">
              <Animated.View style={readingBottomProgressStyle} className="h-full bg-[#00CC99]" />
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <View>
                <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-sans">Progress</Text>
                <Text className="text-sm font-extrabold text-[#1E1E1E] mt-0.5 font-sans">
                  {readingAnsweredCount} / 5 Answered
                </Text>
              </View>
              
              {/* Submit Button */}
              <AnimatedButton
                onPress={() => {
                  setSubmitModalType('Reading');
                  setShowSubmitModal(true);
                }}
                className="bg-[#00CC99] px-8 py-3.5 rounded-[20px] shadow-md shadow-emerald-500/20 flex-row items-center justify-center"
              >
                <Text className="text-white text-base font-extrabold mr-2 font-sans">Submit Test</Text>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                  <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </AnimatedButton>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'ListeningAI' && (
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          {/* Sub-Header inside active workspace */}
          <View className="flex-row items-center justify-between px-6 py-3 bg-white border-b border-[#E5E7EB]">
            <View>
              <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Listening Simulation</Text>
              <Text className="text-sm font-bold text-[#1E1E1E] mt-0.5 font-sans">IELTS Prep - Test 08</Text>
            </View>
            <CircularTimer timeLeft={listeningTimeLeft} initialTime={1800} />
          </View>

          {/* Audio Player Card */}
          <View className="bg-white px-6 py-4 border-b border-[#E5E7EB]">
            <View className="bg-[#1E293B] p-5 rounded-[28px] shadow-lg shadow-slate-300">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 pr-4">
                  <AnimatedButton 
                    onPress={() => setListeningIsPlaying(!listeningIsPlaying)}
                    className="w-12 h-12 bg-[#00CC99] rounded-full items-center justify-center border border-[#005C42]/10"
                  >
                    {listeningIsPlaying ? (
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
                <View className="h-full bg-[#00CC99] rounded-full shadow-sm shadow-emerald-400" style={{ width: `${listeningAudioProgress * 100}%` }} />
              </View>
            </View>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
              <View className="mb-28">
                {/* Q1 Card (MCQ) */}
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
                    isSelected={listeningAnswers.q1 === 'A'}
                    onPress={() => setListeningAnswers({ ...listeningAnswers, q1: 'A' })}
                  />
                  <AnimatedOption 
                    optionKey="B"
                    text="To provide affordable creative workspaces for local residents."
                    isSelected={listeningAnswers.q1 === 'B'}
                    onPress={() => setListeningAnswers({ ...listeningAnswers, q1: 'B' })}
                  />
                  <AnimatedOption 
                    optionKey="C"
                    text="To construct large industrial warehouses."
                    isSelected={listeningAnswers.q1 === 'C'}
                    onPress={() => setListeningAnswers({ ...listeningAnswers, q1: 'C' })}
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
                      selectedValue={listeningAnswers.q2}
                      onSelect={(choice) => setListeningAnswers({ ...listeningAnswers, q2: choice })}
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
                      selectedValue={listeningAnswers.q3}
                      onSelect={(choice) => setListeningAnswers({ ...listeningAnswers, q3: choice })}
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
                      The creative city movement has triggered criticism due to the risk of gentrification. The arrival of high-earning{' '}
                      <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [4] </Text>{' '}
                      tends to drive up real estate prices. This eventually forces older residents out of their original{' '}
                      <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [5] </Text>.
                    </Text>
                  </View>

                  <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 mb-3 focus-within:border-[#00CC99]">
                    <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="text-xs font-extrabold text-[#005C42] font-sans">4</Text>
                    </View>
                    <TextInput
                      value={listeningAnswers.q4}
                      onChangeText={(text) => setListeningAnswers({ ...listeningAnswers, q4: text })}
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
                      value={listeningAnswers.q5}
                      onChangeText={(text) => setListeningAnswers({ ...listeningAnswers, q5: text })}
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
          </KeyboardAvoidingView>

          {/* Floating Bottom Navigation Bar */}
          <View className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-[#E5E7EB] px-6 pb-4">
            {/* Satisfying Top Spring Progress Line */}
            <View className="absolute top-0 left-0 right-0 h-1 bg-[#F3F4F6]">
              <Animated.View style={listeningBottomProgressStyle} className="h-full bg-[#00CC99]" />
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <View>
                <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-sans">Progress</Text>
                <Text className="text-sm font-extrabold text-[#1E1E1E] mt-0.5 font-sans">
                  {listeningAnsweredCount} / 5 Answered
                </Text>
              </View>
              
              {/* Submit Button */}
              <AnimatedButton
                onPress={() => {
                  setSubmitModalType('Listening');
                  setShowSubmitModal(true);
                }}
                className="bg-[#00CC99] px-8 py-3.5 rounded-[20px] shadow-md shadow-emerald-500/20 flex-row items-center justify-center"
              >
                <Text className="text-white text-base font-extrabold mr-2 font-sans">Submit Test</Text>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                  <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </AnimatedButton>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'WritingAI' && (
        <ScrollView className="flex-1 px-6 pt-6" style={{ backgroundColor: 'transparent' }} showsVerticalScrollIndicator={false}>
          {/* Header Title */}
          <View className="mb-6">
            <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-2.5 border border-[#A7F3D0]">
              <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">📝 Task 2 Essay Analyzer</Text>
            </View>
            <Text className="text-3xl font-black text-[#1E1E1E] tracking-tight">Writing AI Grading</Text>
            <Text className="text-sm text-[#6B7280] mt-1.5 leading-5">
              Submit your essay below. Our deep neural networks evaluate grammar, coherence, vocabulary, and task achievement instantly.
            </Text>
          </View>

          {/* Input Area */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs mb-6">
            <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Prompt Input / Topic</Text>
            <Text className="text-sm font-bold text-[#1E1E1E] mb-4 leading-5 bg-[#F7F9FA] p-4 rounded-2xl border border-[#E5E7EB]">
              "Some people believe that fast food should be taxed higher to encourage healthy eating. To what extent do you agree or disagree?"
            </Text>

            <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Essay Response</Text>
            <TextInput
              multiline
              value={writingInput}
              onChangeText={setWritingInput}
              placeholder="Start typing your essay here (minimum 250 words)..."
              className="text-sm text-[#1E1E1E] font-medium min-h-[160px] bg-white border border-[#E5E7EB] rounded-2xl p-4 leading-6"
              textAlignVertical="top"
            />
            
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-xs font-bold text-[#6B7280]">
                Word count: <Text className="text-[#00CC99] font-black">{writingInput.split(/\s+/).filter(Boolean).length}</Text> words
              </Text>
              
              <TouchableOpacity 
                onPress={handleWritingAnalyze}
                disabled={isAnalyzingWriting}
                className="bg-[#00CC99] px-6 py-3 rounded-xl active:opacity-90 flex-row items-center"
              >
                {isAnalyzingWriting ? (
                  <Text className="text-white text-xs font-bold">Analyzing with LLMs...</Text>
                ) : (
                  <>
                    <Text className="text-white text-xs font-bold mr-1.5">Analyze Essay</Text>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                      <Path d="M5 12h14M12 5l7 7-7 7" />
                    </Svg>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Result Section */}
          {showWritingResult && (
            <View className="mb-10 space-y-6">
              {/* Overall & Criteria scores */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-[#F3F4F6]">
                  <View>
                    <Text className="text-xs font-bold text-[#9CA3AF] uppercase">AI Prediction</Text>
                    <Text className="text-2xl font-black text-[#1E1E1E]">Evaluation Report</Text>
                  </View>
                  <View className="bg-[#E6F9F5] border border-[#A7F3D0] rounded-2xl px-5 py-2 items-center flex-row">
                    <Text className="text-xs font-bold text-[#005C42] mr-2">Band</Text>
                    <Text className="text-3xl font-black text-[#00CC99]">7.0</Text>
                  </View>
                </View>

                {/* 4 Standard Criteria Scores */}
                <Text className="text-xs font-black text-[#1E1E1E] uppercase tracking-wider mb-4">IELTS Core Criteria Metrics</Text>
                <View className="space-y-4">
                  {[
                    { name: 'Task Achievement (TA)', score: 7.0, progress: 'w-[70%]', desc: 'Fully addresses all parts of the task with a clear position.' },
                    { name: 'Coherence & Cohesion (CC)', score: 6.5, progress: 'w-[65%]', desc: 'Information is organized logically with clear progression.' },
                    { name: 'Lexical Resource (LR)', score: 7.5, progress: 'w-[75%]', desc: 'Uses a wide range of vocabulary with natural style.' },
                    { name: 'Grammatical Range & Accuracy (GRA)', score: 6.5, progress: 'w-[65%]', desc: 'Good sentence structures but contains slight minor errors.' }
                  ].map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs font-bold text-[#1E1E1E]">{item.name}</Text>
                        <Text className="text-xs font-black text-[#00CC99]">{item.score}</Text>
                      </View>
                      <View className="w-full h-2 bg-[#F7F9FA] rounded-full overflow-hidden mb-1">
                        <View className={`h-full bg-[#00CC99] rounded-full ${item.progress}`} />
                      </View>
                      <Text className="text-[10px] text-[#6B7280] leading-4">{item.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Grammar Corrections */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <Text className="text-base font-extrabold text-[#1E1E1E] mb-4">Detailed Sentence Corrections</Text>
                <View className="space-y-4">
                  {/* Error 1 */}
                  <View className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-red-100 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-[10px] font-extrabold text-red-600">ORIGINAL</Text>
                      </View>
                      <Text className="text-xs text-red-500 font-semibold line-through">"Personally, I am agree with this viewpoint..."</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-[10px] font-extrabold text-emerald-600">CORRECTED</Text>
                      </View>
                      <Text className="text-xs text-emerald-600 font-bold">"Personally, I agree with this viewpoint..."</Text>
                    </View>
                    <Text className="text-[11px] text-[#6B7280] leading-4 mt-2">
                      <Text className="font-extrabold text-[#1E1E1E]">Explanation: </Text>
                      The verb <Text className="font-bold text-[#005C42]">'agree'</Text> is not an adjective; it does not require the auxiliary verb <Text className="text-red-500 font-bold">'am'</Text> in this context.
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Model Rewrite */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row items-center mb-4">
                  <View className="w-7 h-7 bg-[#E6F9F5] rounded-full items-center justify-center border border-[#A7F3D0] mr-2">
                    <Text className="text-xs">✨</Text>
                  </View>
                  <Text className="text-base font-extrabold text-[#1E1E1E]">AI Model Rewrite (Band 8.5+)</Text>
                </View>
                <Text className="text-sm text-[#6B7280] leading-6 italic">
                  "Over the past few decades, fast food consumption has escalated exponentially. While certain demographics suggest this phenomenon poses a significant threat to individual well-being and broader public health, others advocate for raising levies on fast-food products as an effective mitigation strategy. I am strongly aligned with this perspective, as dietary habits heavily dictate long-term societal well-being."
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'SpeakingAI' && (
        <ScrollView className="flex-1 px-6 pt-6" style={{ backgroundColor: 'transparent' }} showsVerticalScrollIndicator={false}>
          {/* Header Title */}
          <View className="mb-6">
            <View className="bg-[#FFF7ED] px-3.5 py-1 rounded-full self-start mb-2.5 border border-[#FED7AA]">
              <Text className="text-[#C2410C] text-[10px] font-extrabold uppercase tracking-widest">🎙️ Whisper Real-Time STT</Text>
            </View>
            <Text className="text-3xl font-black text-[#1E1E1E] tracking-tight">Speaking AI Grading</Text>
            <Text className="text-sm text-[#6B7280] mt-1.5 leading-5">
              Click the microphone button to record your response. Whisper STT detects your pronunciation and LLM evaluates detailed indicators.
            </Text>
          </View>

          {/* Cue Card Question */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs mb-6">
            <Text className="text-xs font-extrabold text-[#F97316] uppercase tracking-wider mb-2">Cue Card Question</Text>
            <Text className="text-base font-extrabold text-[#1E1E1E] mb-2 leading-5">
              Describe a memorable event in your life.
            </Text>
            <Text className="text-xs text-[#6B7280] leading-5">
              You should say:{"\n"}
              • What the event was and when it occurred{"\n"}
              • Who was there with you{"\n"}
              • And explain why it is so memorable to you.
            </Text>
          </View>

          {/* Recording UI */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-xs items-center justify-center mb-6">
            {isRecording ? (
              <View className="items-center">
                {/* Waveform Visualization Mockup */}
                <View className="flex-row items-center justify-center space-x-2 h-16 mb-6 px-10">
                  {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim2, waveAnim1].map((anim, i) => (
                    <RNAnimated.View 
                      key={i} 
                      style={{ height: anim }}
                      className="w-1.5 bg-[#00CC99] rounded-full"
                    />
                  ))}
                </View>

                <Text className="text-2xl font-black text-[#005C42] mb-1">
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                </Text>
                <Text className="text-xs font-bold text-red-500 animate-pulse mb-8 uppercase tracking-widest">
                  🎙️ Recording live stream
                </Text>

                {/* Real-time Whisper STT Display */}
                <View className="w-full bg-[#F7F9FA] border border-[#E5E7EB] p-4 rounded-2xl mb-8 min-w-[280px]">
                  <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Whisper STT Real-Time Transcript</Text>
                  <Text className="text-sm font-semibold text-[#1E1E1E] italic leading-6">
                    {speakingText || "Listening to speech stream..."}
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={handleStopRecording}
                  className="w-16 h-16 bg-red-500 rounded-full items-center justify-center border-4 border-white shadow-lg active:opacity-90"
                >
                  <View className="w-6 h-6 bg-white rounded-md" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center py-6">
                <TouchableOpacity 
                  onPress={handleStartRecording}
                  className="w-20 h-20 bg-[#E6F9F5] border-4 border-white rounded-full items-center justify-center shadow-lg active:opacity-90 mb-4"
                >
                  <View className="w-14 h-14 bg-[#00CC99] rounded-full items-center justify-center">
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                      <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </Svg>
                  </View>
                </TouchableOpacity>
                <Text className="text-base font-extrabold text-[#1E1E1E]">Tap to Record Response</Text>
                <Text className="text-xs text-[#6B7280] mt-1">Make sure you are in a quiet room</Text>
              </View>
            )}
          </View>

          {/* Speaking Result Section */}
          {showSpeakingResult && (
            <View className="mb-10 space-y-6">
              {/* Score card */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-[#F3F4F6]">
                  <View>
                    <Text className="text-xs font-bold text-[#9CA3AF] uppercase">Acoustic Grading</Text>
                    <Text className="text-2xl font-black text-[#1E1E1E]">Overall Band</Text>
                  </View>
                  <View className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-5 py-2 items-center flex-row">
                    <Text className="text-xs font-bold text-[#C2410C] mr-2">Band</Text>
                    <Text className="text-3xl font-black text-[#F97316]">7.5</Text>
                  </View>
                </View>

                {/* Criterion */}
                <Text className="text-xs font-black text-[#1E1E1E] uppercase tracking-wider mb-4">Acoustic & Pronunciation Metrics</Text>
                <View className="space-y-4">
                  {[
                    { name: 'Pronunciation (Phonetics)', score: 7.5, progress: 'w-[75%]', desc: 'Generally clear with minor phoneme issues.' },
                    { name: 'Fluency & Coherence', score: 7.0, progress: 'w-[70%]', desc: 'Sustains speech flow with natural pauses.' },
                    { name: 'Lexical Richness', score: 8.0, progress: 'w-[80%]', desc: 'Demonstrates sophisticated, varied vocabulary.' },
                    { name: 'Grammar Accuracy & Range', score: 7.0, progress: 'w-[70%]', desc: 'Occasional errors but displays high structures.' }
                  ].map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs font-bold text-[#1E1E1E]">{item.name}</Text>
                        <Text className="text-xs font-black text-[#F97316]">{item.score}</Text>
                      </View>
                      <View className="w-full h-2 bg-[#F7F9FA] rounded-full overflow-hidden mb-1">
                        <View className={`h-full bg-[#F97316] rounded-full ${item.progress}`} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Transcript & Highlights */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <Text className="text-base font-extrabold text-[#1E1E1E] mb-3">Pronunciation Review</Text>
                <Text className="text-xs text-[#6B7280] mb-4">
                  We highlighted words that need phonetic adjustment. Click on them to see IPA correction.
                </Text>
                
                {/* Paragraph with highlighting */}
                <View className="p-4 bg-[#F7F9FA] rounded-2xl border border-[#E5E7EB] flex-row flex-wrap">
                  <Text className="text-sm font-semibold text-[#1E1E1E] leading-7">
                    I would like to{" "}
                    <Text className="text-red-500 bg-red-100 px-1 py-0.5 rounded font-black border border-red-200">talking</Text>
                    {" "}about my graduation day. It was an{" "}
                    <Text className="text-red-500 bg-red-100 px-1 py-0.5 rounded font-black border border-red-200">extremely</Text>
                    {" "}beautiful day.
                  </Text>
                </View>

                {/* Highlight Explanation Detail */}
                <View className="mt-5 space-y-3">
                  <View className="bg-red-50/50 border border-red-200 p-4.5 rounded-2xl flex-row items-start">
                    <Text className="text-lg mr-3">❌</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-extrabold text-red-500">talking</Text>
                      <Text className="text-xs font-semibold text-[#1E1E1E] mt-1">
                        Grammar error + Pronunciation: /tɔːk.ɪŋ/ should be simple infinitive <Text className="font-black text-emerald-600">"talk" /tɔːk/</Text> after "would like to".
                      </Text>
                    </View>
                  </View>

                  <View className="bg-red-50/50 border border-red-200 p-4.5 rounded-2xl flex-row items-start">
                    <Text className="text-lg mr-3">❌</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-extrabold text-red-500">extremely</Text>
                      <Text className="text-xs font-semibold text-[#1E1E1E] mt-1">
                        Phonetic stress issue on syllable. Target IPA: <Text className="font-black text-[#005C42]">/ɪkˈstriːm.li/</Text>. You omitted the /k/ sound during high fluency acceleration.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'ListeningPractice' && (
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-2.5 border border-[#A7F3D0]">
              <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">🎧 Practice Mode</Text>
            </View>
            <Text className="text-3xl font-black text-[#1E1E1E] tracking-tight">Listening Practice</Text>
            <Text className="text-sm text-[#6B7280] mt-1.5 leading-5">
              Focus on specific parts. You can pause the timer and toggle transcripts to read along while listening.
            </Text>
          </View>

          {/* Section Selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2 mb-6">
            {['Part 1', 'Part 2', 'Part 3', 'Part 4'].map((part, idx) => (
              <TouchableOpacity key={idx} className={`px-4 py-2 rounded-xl border ${idx === 0 ? 'bg-[#1E1E1E] border-[#1E1E1E]' : 'bg-white border-[#E5E7EB]'}`}>
                <Text className={`font-bold text-sm ${idx === 0 ? 'text-white' : 'text-[#1E1E1E]'}`}>{part}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Audio Player Card */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-5 shadow-xs mb-6">
            <View className="flex-row justify-between items-center mb-4">
               <View className="flex-row items-center">
                 <TouchableOpacity className="w-12 h-12 bg-[#00CC99] rounded-full items-center justify-center mr-3">
                   <Svg width="16" height="16" viewBox="0 0 24 24" fill="white"><Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></Svg>
                 </TouchableOpacity>
                 <View>
                   <Text className="text-sm font-bold text-[#1E1E1E]">A Conversation about a job</Text>
                   <Text className="text-xs text-[#9CA3AF]">01:45 / 04:30</Text>
                 </View>
               </View>
               {/* Timer pausable */}
               <TouchableOpacity className="bg-[#FFF7ED] border border-[#FED7AA] px-3 py-1.5 rounded-lg flex-row items-center">
                 <Text className="text-[#C2410C] font-mono text-xs font-bold mr-1">15:00</Text>
                 <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C2410C" strokeWidth="2.5"><Path d="M10 9v6m4-6v6" strokeLinecap="round"/></Svg>
               </TouchableOpacity>
            </View>
            <View className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
               <View className="h-full bg-[#00CC99] w-1/3 rounded-full" />
            </View>
          </View>

          {/* Transcript Section */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs mb-10">
            <View className="flex-row justify-between items-center mb-4 border-b border-[#F3F4F6] pb-4">
              <Text className="text-base font-extrabold text-[#1E1E1E]">Transcript Sync</Text>
              <TouchableOpacity className="bg-[#F7F9FA] px-3 py-1.5 border border-[#E5E7EB] rounded-full">
                <Text className="text-xs font-bold text-[#6B7280]">Hide Transcript</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-sm leading-8 text-[#4B5563] font-medium">
              <Text className="font-bold text-[#1E1E1E]">Manager: </Text>
              Good morning. Please take a seat. So, you're applying for the position of...
              {"\n"}
              <Text className="font-bold text-[#1E1E1E]">Applicant: </Text>
              <Text className="bg-[#E6F9F5] text-[#005C42] font-semibold px-1 rounded">Yes, the Assistant Manager position.</Text> I have brought my resume as requested.
            </Text>
          </View>
        </ScrollView>
      )}

      {activeTab === 'ReadingAnalysis' && (
        <ScrollView className="flex-1 px-6 pt-6" style={{ backgroundColor: 'transparent' }} showsVerticalScrollIndicator={false}>
          {/* Header section with clean analytics tags */}
          <View className="mb-6 flex-row justify-between items-center bg-white p-6 rounded-[28px] border border-[#E5E7EB] shadow-xs">
            <View>
              <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">Performance Dashboard</Text>
              <Text className="text-2xl font-black text-[#1E1E1E] tracking-tight mt-1">Reading Band: 8.5</Text>
            </View>
            <View className="bg-[#E6F9F5] border border-[#A7F3D0] rounded-2xl px-4 py-2 flex-row items-center">
              <Text className="text-xs font-extrabold text-[#005C42] mr-1">Rank Up</Text>
              <Text className="text-sm font-black text-[#00CC99]">+0.5 Band</Text>
            </View>
          </View>

          {/* Chart Wrapper Card - Beautiful Gradient Graph */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 mb-5 shadow-xs">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Historical Trend</Text>
                <Text className="text-base font-black text-[#1E1E1E] mt-0.5">Score progression</Text>
              </View>
              {/* Sliding Filter Toggle */}
              <SlidingGraphFilter graphFilter={graphFilter} setGraphFilter={setGraphFilter} />
            </View>

            {/* Line Chart with Gradient Fill Area */}
            <View className="h-32 justify-center items-center my-2">
              <Svg width="100%" height="110" viewBox="0 0 300 110">
                <Defs>
                  <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#00CC99" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#00CC99" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>

                {/* Grid Lines */}
                <Path d="M0 25h300M0 55h300M0 85h300" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3" />
                
                {/* Area Gradient Fill */}
                <Path 
                  d="M10 80 L40 73 L70 90 L100 70 L130 72 L160 55 L190 60 L220 40 L250 30 L280 43 L290 28 L290 110 L10 110 Z" 
                  fill="url(#chartGrad)"
                />

                {/* SVG Polyline for reading score progress line */}
                <Path 
                  d="M10 80 L40 73 L70 90 L100 70 L130 72 L160 55 L190 60 L220 40 L250 30 L280 43 L290 28" 
                  fill="none" 
                  stroke="#00CC99" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />

                {/* Draw vertex points/circles */}
                {[
                  { cx: 10, cy: 80 },
                  { cx: 40, cy: 73 },
                  { cx: 70, cy: 90 },
                  { cx: 100, cy: 70 },
                  { cx: 130, cy: 72 },
                  { cx: 160, cy: 55 },
                  { cx: 190, cy: 60 },
                  { cx: 220, cy: 40 },
                  { cx: 250, cy: 30 },
                  { cx: 280, cy: 43 },
                  { cx: 290, cy: 28 }
                ].map((pt, i) => (
                  <Circle 
                    key={i} 
                    cx={pt.cx} 
                    cy={pt.cy} 
                    r={i === 10 ? "4" : "2.5"} 
                    fill={i === 10 ? "#00CC99" : "#FFFFFF"} 
                    stroke="#00CC99" 
                    strokeWidth={i === 10 ? "2" : "1.5"} 
                  />
                ))}
              </Svg>
            </View>

            {/* Timeline tags */}
            <View className="flex-row justify-between mt-3 px-1 border-t border-[#E5E7EB] pt-3">
              <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase">Test 01</Text>
              <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase">Test 10</Text>
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View className="flex-row justify-between mb-5">
            {/* Avg Time Card */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs relative">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Avg Time</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                  <Circle cx="12" cy="12" r="10" />
                  <Path d="M12 6v6l4 2" />
                </Svg>
              </View>
              <Text className="text-2xl font-black text-[#1E1E1E] mt-1 font-sans">18:42</Text>
              <View className="flex-row items-center mt-2.5">
                <View className="bg-[#E6F9F5] px-2 py-0.5 rounded-md flex-row items-center border border-[#A7F3D0]">
                  <Text className="text-[9px] font-extrabold text-[#005C42]">▲ Fast Pace</Text>
                </View>
                <Text className="text-[9px] text-[#9CA3AF] font-bold ml-1.5">-1.2m</Text>
              </View>
            </View>

            {/* Accuracy Card */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs relative">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Accuracy</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#005C42" strokeWidth="2.5">
                  <Circle cx="12" cy="12" r="10" />
                  <Circle cx="12" cy="12" r="6" />
                  <Circle cx="12" cy="12" r="2" />
                </Svg>
              </View>
              <Text className="text-2xl font-black text-[#1E1E1E] mt-1 font-sans">92.4%</Text>
              <View className="flex-row items-center mt-2.5">
                <View className="bg-[#E6F9F5] px-2 py-0.5 rounded-md flex-row items-center border border-[#A7F3D0]">
                  <Text className="text-[9px] font-extrabold text-[#005C42]">▲ Top 5%</Text>
                </View>
                <Text className="text-[9px] text-[#9CA3AF] font-bold ml-1.5">+2.1%</Text>
              </View>
            </View>
          </View>

          {/* Target Gap Card - Circular Indicator Glow */}
          <View className="bg-[#1E293B] p-6 rounded-[28px] flex-row justify-between items-center mb-6 shadow-md shadow-slate-900/10">
            <View className="flex-1 pr-4">
              <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Target Gap Status</Text>
              <Text className="text-xl font-black text-white mt-1.5 tracking-tight">-0.5 to Elite 9.0 Band</Text>
              <Text className="text-[11px] text-slate-400 mt-1 leading-4">Keep practicing reading passages to narrow the gap.</Text>
            </View>
            
            {/* Visual target progress ring */}
            <View className="relative w-12 h-12 items-center justify-center">
              <Svg width="48" height="48" viewBox="0 0 44 44" style={{ position: 'absolute' }}>
                <Circle cx="22" cy="22" r="18" fill="none" stroke="#334155" strokeWidth="4.5" />
                <Circle 
                  cx="22" 
                  cy="22" 
                  r="18" 
                  fill="none" 
                  stroke="#00CC99" 
                  strokeWidth="4.5" 
                  strokeDasharray="113.1" 
                  strokeDashoffset="6.3" // 94.4% progress
                  strokeLinecap="round" 
                  transform="rotate(-90 22 22)" 
                />
              </Svg>
              <Text className="text-[9px] font-black text-[#00CC99] mt-0.5">94%</Text>
            </View>
          </View>

          {/* Historical Milestones List */}
          <View className="mb-4">
            <Text className="text-base font-black text-[#1E1E1E] tracking-tight">Historical Milestones</Text>
            <Text className="text-xs text-[#9CA3AF] mt-0.5">Track your past mock test submissions</Text>
          </View>

          {/* Milestones Cards List */}
          <View className="mb-8">
            <MilestoneCard 
              title="Academic Reading Test 12"
              date="Yesterday • 14:30"
              score={8.5}
              iconType="calendar"
            />
            <MilestoneCard 
              title="True/False/Not Given Drill"
              date="2 days ago"
              score={7.5}
              iconType="refresh"
            />
          </View>

          {/* Action buttons footer */}
          <View className="flex-row space-x-4 mb-16">
            <AnimatedButton 
              onPress={() => setActiveTab('WritingAI')}
              className="flex-1 border-2 border-white rounded-[20px] overflow-hidden bg-transparent"
              style={{ height: 52 }}
            >
              <Text className="text-white text-sm font-black font-sans">Review Errors</Text>
            </AnimatedButton>

            <AnimatedButton 
              onPress={handleReadingReset}
              className="flex-1 bg-[#00CC99] rounded-[20px] overflow-hidden shadow-md shadow-emerald-500/20"
              style={{ height: 52 }}
            >
              <Text className="text-white text-sm font-black font-sans">Practice More</Text>
            </AnimatedButton>
          </View>

          {/* Graded Result & Detailed Explanations */}
          <Text className="text-xl font-bold text-[#1E1E1E] mb-4 tracking-tight border-t border-[#E5E7EB] pt-6">Detailed Question Review</Text>
          
          <View className="space-y-4 mb-12">
            {[
              { 
                qNum: 1,
                qText: "What is the main driver behind the creative city movement?",
                userAnswer: "B", 
                correctAnswer: "B", 
                isCorrect: true, 
                explanation: "Paragraph A states: 'It represents a fundamental shift in how urban economies operate... cities now compete to attract highly skilled workers.'",
                paraphrase: "shift in urban economies -> driver behind creative city"
              },
              { 
                qNum: 2,
                qText: "Rising property prices are causing long-term residents to leave.",
                userAnswer: "NOT GIVEN", 
                correctAnswer: "TRUE", 
                isCorrect: false, 
                explanation: "Paragraph C explicitly mentions 'skyrocketing property values, forcing out long-term residents'. Therefore it is TRUE.",
                paraphrase: "forcing out long-term residents -> causing residents to leave"
              }
            ].map((item, idx) => (
              <View key={idx} className={`bg-white rounded-[24px] border ${item.isCorrect ? 'border-[#A7F3D0]' : 'border-[#FECACA]'} p-5 shadow-xs`}>
                <View className="flex-row items-start mb-3">
                  <View className={`${item.isCorrect ? 'bg-[#E6F9F5]' : 'bg-[#FEF2F2]'} w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5`}>
                    <Text className={`text-sm font-extrabold ${item.isCorrect ? 'text-[#005C42]' : 'text-[#B91C1C]'}`}>Q{item.qNum}</Text>
                  </View>
                  <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">{item.qText}</Text>
                </View>

                <View className="flex-row space-x-2 mb-3">
                  <View className="flex-1 bg-[#F7F9FA] p-3 rounded-xl border border-[#E5E7EB]">
                    <Text className="text-[10px] text-[#9CA3AF] font-bold uppercase mb-1">Your Answer</Text>
                    <Text className={`text-sm font-black ${item.isCorrect ? 'text-[#00CC99]' : 'text-red-500'}`}>{item.userAnswer} {item.isCorrect ? '✓' : '✗'}</Text>
                  </View>
                  {!item.isCorrect && (
                    <View className="flex-1 bg-[#E6F9F5] p-3 rounded-xl border border-[#A7F3D0]">
                      <Text className="text-[10px] text-[#005C42] font-bold uppercase mb-1">Correct Answer</Text>
                      <Text className="text-sm font-black text-[#00CC99]">{item.correctAnswer}</Text>
                    </View>
                  )}
                </View>

                {/* Explanation with Paraphrase highlights */}
                <View className="bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                  <Text className="text-xs font-bold text-[#6B7280] mb-1">Explanation:</Text>
                  <Text className="text-sm text-[#4B5563] leading-6 font-medium">{item.explanation}</Text>
                  
                  <View className="mt-3 pt-3 border-t border-[#E5E7EB]">
                    <Text className="text-xs font-bold text-[#6B7280] mb-1">Paraphrasing recognized:</Text>
                    <Text className="text-xs font-bold text-[#1E1E1E] bg-[#FEF3C7] self-start px-2 py-0.5 rounded">{item.paraphrase}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Submit Confirmation Modal */}
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
            You have completed {submitModalType === 'Reading' ? readingAnsweredCount : listeningAnsweredCount} out of 5 questions. AI Engine will instantly grade your test.
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
            onPress={submitModalType === 'Reading' ? handleReadingSubmit : handleListeningSubmit}
            className="bg-[#00CC99] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-500/10"
            style={{ flex: 1 }}
          >
            <Text className="text-white text-sm font-bold font-sans">Submit Now</Text>
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
          <Text className="text-white text-sm font-extrabold font-sans">Got it, thanks!</Text>
        </AnimatedButton>
      </SlideUpModal>
    </SafeAreaView>
  );
};

export default PracticeScreen;
