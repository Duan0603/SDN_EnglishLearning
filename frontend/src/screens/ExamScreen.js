// ============================================================
// ExamScreen - Mobile First Dashboard
// NO web layouts, NO nativewind
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../store/useAuthStore';
import AppIcon from '../shared/icons/AppIcon';
import { AppButton } from '../shared/components';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const ExamScreen = ({ route, navigation }) => {
  const { testType } = route.params || { testType: 'Reading' };
  const [activeTab, setActiveTab] = useState('passage'); 
  const initialTime = 3600;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const { token } = useAuthStore();

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
    Alert.alert('Hoàn thành', 'Bài làm của bạn đã được nộp thành công!', [
      { text: 'Xem kết quả', onPress: () => navigation.goBack() }
    ]);
    await AsyncStorage.removeItem(`exam_${testType}`);
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const renderOption = (key, text) => {
    const isSelected = answers.q1 === key;
    return (
      <TouchableOpacity 
        style={[S.optionCard, isSelected && S.optionCardActive]} 
        onPress={() => setAnswers({...answers, q1: key})}
      >
        <View style={[S.radio, isSelected && S.radioActive]}>
          {isSelected && <View style={S.radioInner} />}
        </View>
        <Text style={[S.optionText, isSelected && S.optionTextActive]}>{key}. {text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <TouchableOpacity style={S.backBtn} onPress={() => {
          Alert.alert("Thoát", "Tiến trình sẽ bị hủy bỏ.", [
            { text: "Hủy", style: "cancel" },
            { text: "Thoát", style: "destructive", onPress: () => navigation.goBack() }
          ]);
        }}>
          <AppIcon name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={S.headerCenter}>
          <Text style={S.headerSub}>{testType} Test</Text>
          <Text style={S.headerTitle}>IELTS Mock 01</Text>
        </View>

        <View style={S.timerBox}>
          <AppIcon name="clock" size={14} color={COLORS.danger} />
          <Text style={S.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* ── Tabs ──────────────────────────────────────── */}
      <View style={S.tabsContainer}>
        <TouchableOpacity 
          style={[S.tabItem, activeTab === 'passage' && S.tabItemActive]}
          onPress={() => setActiveTab('passage')}
        >
          <Text style={[S.tabText, activeTab === 'passage' && S.tabTextActive]}>📖 Đọc bài</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[S.tabItem, activeTab === 'questions' && S.tabItemActive]}
          onPress={() => setActiveTab('questions')}
        >
          <Text style={[S.tabText, activeTab === 'questions' && S.tabTextActive]}>✏️ Trả lời</Text>
        </TouchableOpacity>
      </View>

      {/* ── Content ────────────────────────────────────── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.scroll}>
        <ScrollView contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'passage' && (
            <View style={S.passageCard}>
              <Text style={S.passageTitle}>The Rise of Creative Urban Spaces</Text>
              <Text style={S.passageText}>
                In the early decades of the twenty-first century, cities around the world have undergone a radical transformation. Formerly industrial districts, once filled with abandoned warehouses and dusty factories, have been reborn as vibrant hubs of culture and technology...
              </Text>
              <Text style={S.passageText}>
                At the heart of this rebirth are shared infrastructure projects. Shared workspaces, local maker spaces, and public-private innovation hubs have sprung up globally. Research shows that geographic proximity between diverse industries sparks spontaneous collaboration...
              </Text>
            </View>
          )}

          {activeTab === 'questions' && (
            <View>
              <View style={S.questionCard}>
                <Text style={S.questionNum}>Câu 1</Text>
                <Text style={S.questionText}>What is the main driver behind the creative city movement?</Text>
                {renderOption('A', 'To restore historically significant manufacturing factories.')}
                {renderOption('B', 'To shift the urban economy from manufacturing to knowledge-based industries.')}
                {renderOption('C', 'To decrease the density of high-skilled professionals in cities.')}
              </View>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Footer ─────────────────────────────────────── */}
      <View style={S.footer}>
        <AppButton title="Nộp bài" onPress={handleSubmit} />
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
  headerCenter: { alignItems: 'center' },
  headerSub: { fontSize: 10, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textSecondary, textTransform: 'uppercase' },
  headerTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  
  timerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.dangerLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  timerText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.danger, marginLeft: 4 },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.lg },
  tabItemActive: { backgroundColor: COLORS.primaryLight },
  tabText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontFamily: TYPOGRAPHY.fontBold },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },

  passageCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.xl, ...SHADOWS.sm },
  passageTitle: { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  passageText: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.md },

  questionCard: { backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.xl, ...SHADOWS.sm, marginBottom: SPACING.md },
  questionNum: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary, marginBottom: 4 },
  questionText: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.lg },
  
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: SPACING.sm },
  optionCardActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionText: { flex: 1, fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  optionTextActive: { color: COLORS.primaryDark, fontFamily: TYPOGRAPHY.fontBold },

  footer: { padding: SPACING.base, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
});

export default ExamScreen;
