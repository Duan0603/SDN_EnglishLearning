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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../store/useAuthStore';

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
  const { testType } = route.params || { testType: 'Reading' };
  const [activeTab, setActiveTab] = useState('passage'); 
  const initialTime = 3600;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const saved = await AsyncStorage.getItem(`exam_${testType}`);
        if (saved) {
          const p = JSON.parse(saved);
          setAnswers(p.answers);
          setTimeLeft(p.timeLeft);
        }
      } catch (e) {}
    };
    loadProgress();
  }, [testType]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    Alert.alert('Mock Exam Finished', 'Your answers have been submitted.', [
      { text: 'View Results', onPress: () => navigation.goBack() }
    ]);
    await AsyncStorage.removeItem(`exam_${testType}`);
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const renderOption = (key, text) => {
    const isSelected = answers.q1 === key;
    return (
      <TouchableOpacity 
        style={[styles.optionCard, isSelected && styles.optionCardActive]} 
        onPress={() => setAnswers({...answers, q1: key})}
        activeOpacity={0.8}
      >
        <View style={[styles.radio, isSelected && styles.radioActive]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{key}. {text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {
          Alert.alert("Exit Exam", "Your progress will be lost.", [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", style: "destructive", onPress: () => navigation.goBack() }
          ]);
        }}>
          <Ionicons name="close" size={28} color="#1b263b" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerSub}>{testType} Test</Text>
          <Text style={styles.headerTitle}>IELTS Mock 01</Text>
        </View>

        <View style={styles.timerBox}>
          <Ionicons name="time" size={16} color="#c92a2a" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'passage' && styles.tabItemActive]}
          onPress={() => setActiveTab('passage')}
        >
          <Text style={[styles.tabText, activeTab === 'passage' && styles.tabTextActive]}>📖 READING PASSAGE</Text>
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'questions' && styles.tabItemActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>✏️ QUESTIONS</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.scroll}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'passage' && (
            <BrutalistShadow style={styles.passageCard} offset={6}>
              <View style={styles.passageCardInner}>
                <View style={styles.redMarginLine} />
                <Text style={styles.passageTitle}>The Rise of Creative Urban Spaces</Text>
                <Text style={styles.passageText}>
                  In the early decades of the twenty-first century, cities around the world have undergone a radical transformation. Formerly industrial districts, once filled with abandoned warehouses and dusty factories, have been reborn as vibrant hubs of culture and technology...
                </Text>
                <Text style={styles.passageText}>
                  At the heart of this rebirth are shared infrastructure projects. Shared workspaces, local maker spaces, and public-private innovation hubs have sprung up globally. Research shows that geographic proximity between diverse industries sparks spontaneous collaboration...
                </Text>
              </View>
            </BrutalistShadow>
          )}

          {activeTab === 'questions' && (
            <View>
              <BrutalistShadow style={styles.questionCard} offset={4}>
                <View style={styles.questionCardInner}>
                  <Text style={styles.questionNum}>QUESTION 1</Text>
                  <Text style={styles.questionText}>What is the main driver behind the creative city movement?</Text>
                  {renderOption('A', 'To restore historically significant manufacturing factories.')}
                  {renderOption('B', 'To shift the urban economy from manufacturing to knowledge-based industries.')}
                  {renderOption('C', 'To decrease the density of high-skilled professionals in cities.')}
                </View>
              </BrutalistShadow>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>SUBMIT EXAM</Text>
        </TouchableOpacity>
      </View>

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
});

export default ExamScreen;
