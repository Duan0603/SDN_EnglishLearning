// ============================================================
// PracticeScreen - Mobile First Dashboard
// NO web layouts, NO nativewind
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  StatusBar
} from 'react-native';

import AppIcon from '../shared/icons/AppIcon';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';

const PracticeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reading');

  const tabs = [
    { key: 'reading', label: 'Reading', icon: 'book' },
    { key: 'listening', label: 'Listening', icon: 'headset' },
    { key: 'writing', label: 'Writing', icon: 'edit' },
    { key: 'speaking', label: 'Speaking', icon: 'mic' },
  ];

  const exams = [
    { id: '1', title: 'IELTS Cambridge 18 - Test 1', time: '60 Phút', type: 'reading', level: 'Hard' },
    { id: '2', title: 'IELTS Cambridge 18 - Test 2', time: '60 Phút', type: 'reading', level: 'Medium' },
    { id: '3', title: 'IELTS Cambridge 17 - Test 1', time: '60 Phút', type: 'reading', level: 'Hard' },
    { id: '4', title: 'IELTS Listening Practice 1', time: '30 Phút', type: 'listening', level: 'Medium' },
    { id: '5', title: 'IELTS Writing Task 1 & 2', time: '60 Phút', type: 'writing', level: 'Hard' },
    { id: '6', title: 'IELTS Speaking Mock Test', time: '15 Phút', type: 'speaking', level: 'Medium' },
  ];

  const filteredExams = exams.filter(e => e.type === activeTab);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      
      {/* ── App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <Text style={S.appBarTitle}>Luyện Tập IELTS</Text>
      </View>

      {/* ── Tabs ──────────────────────────────────────── */}
      <View style={S.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.tabsScroll}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[S.tabItem, isActive && S.tabItemActive]}
              >
                <AppIcon name={tab.icon} size={16} color={isActive ? COLORS.textInverse : COLORS.textSecondary} />
                <Text style={[S.tabText, isActive && S.tabTextActive, { marginLeft: 6 }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={S.headerCard}>
          <View style={S.headerIcon}>
            <AppIcon name="award" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={S.headerTitle}>Sẵn sàng bứt phá?</Text>
            <Text style={S.headerSub}>Chọn bài thi và bắt đầu làm bài ngay trên điện thoại của bạn.</Text>
          </View>
        </View>

        <Text style={S.sectionTitle}>Bài thi đề xuất</Text>

        {filteredExams.map((exam) => (
          <TouchableOpacity 
            key={exam.id}
            style={S.examCard}
            onPress={() => {
              if (exam.type === 'speaking') {
                navigation.navigate('Speaking', { title: exam.title });
              } else {
                navigation.navigate('Exam', { testType: activeTab });
              }
            }}
          >
            <View style={S.examCardTop}>
              <View style={[S.badge, { backgroundColor: exam.level === 'Hard' ? COLORS.dangerLight : COLORS.warningLight }]}>
                <Text style={[S.badgeText, { color: exam.level === 'Hard' ? COLORS.danger : COLORS.warning }]}>
                  {exam.level}
                </Text>
              </View>
              <Text style={S.examTime}>{exam.time}</Text>
            </View>
            <Text style={S.examTitle}>{exam.title}</Text>
            <View style={S.examAction}>
              <Text style={S.examActionText}>Bắt đầu thi</Text>
              <AppIcon name="chevron-right" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        ))}

        {filteredExams.length === 0 && (
          <View style={S.emptyState}>
            <AppIcon name="folder" size={40} color={COLORS.textMuted} />
            <Text style={S.emptyText}>Chưa có bài tập cho kỹ năng này.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  appBar: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: 'center',
  },
  appBarTitle: { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  
  tabsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabsScroll: { gap: SPACING.sm, paddingHorizontal: SPACING.xs },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.background,
  },
  tabItemActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.textInverse, fontFamily: TYPOGRAPHY.fontBold },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.base, paddingBottom: SPACING['3xl'] },

  headerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primaryDark, marginBottom: 4 },
  headerSub: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.primary },

  sectionTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.md },

  examCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.sm },
  badgeText: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold },
  examTime: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontMedium, color: COLORS.textSecondary },
  examTitle: { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary, marginBottom: SPACING.md },
  examAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  examActionText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primary, marginRight: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: SPACING['3xl'] },
  emptyText: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.sm, color: COLORS.textSecondary },
});

export default PracticeScreen;
