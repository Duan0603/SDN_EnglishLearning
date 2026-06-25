import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

const PracticeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('reading');

  const tabs = [
    { key: 'reading', label: 'Reading', icon: 'book' },
    { key: 'listening', label: 'Listening', icon: 'headset' },
    { key: 'writing', label: 'Writing', icon: 'pencil' },
    { key: 'speaking', label: 'Speaking', icon: 'mic' },
  ];

  const exams = [
    { id: '1', title: 'IELTS Cambridge 18 - Test 1', time: '60 Phút', type: 'reading', level: 'Hard', color: '#4682b4' },
    { id: '2', title: 'IELTS Cambridge 18 - Test 2', time: '60 Phút', type: 'reading', level: 'Medium', color: '#4682b4' },
    { id: '3', title: 'IELTS Cambridge 17 - Test 1', time: '60 Phút', type: 'reading', level: 'Hard', color: '#4682b4' },
    { id: '4', title: 'IELTS Listening Practice 1', time: '30 Phút', type: 'listening', level: 'Medium', color: '#005c42' },
    { id: '5', title: 'IELTS Writing Task 1 & 2', time: '60 Phút', type: 'writing', level: 'Hard', color: '#d97706' },
    { id: '6', title: 'IELTS Speaking Mock Test', time: '15 Phút', type: 'speaking', level: 'Medium', color: '#c92a2a' },
  ];

  const filteredExams = exams.filter(e => e.type === activeTab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>PRACTICE PORTAL</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Ionicons name={tab.icon} size={16} color={isActive ? '#fff' : '#1b263b'} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Card */}
        <BrutalistShadow style={styles.headerCard} offset={4}>
          <View style={styles.headerCardInner}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: 24 }}>🎯</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.headerTitle}>Ready to start?</Text>
              <Text style={styles.headerSub}>Select an exam and begin taking the mock test immediately.</Text>
            </View>
          </View>
        </BrutalistShadow>

        <Text style={styles.sectionBadge}>✎ {activeTab.toUpperCase()} EXAMS</Text>
        <Text style={styles.sectionTitle}>Available Tests</Text>

        {filteredExams.map((exam) => (
          <TouchableOpacity 
            key={exam.id}
            style={styles.examCardContainer}
            activeOpacity={0.8}
            onPress={() => {
              if (exam.type === 'speaking') {
                navigation.navigate('Speaking', { title: exam.title });
              } else {
                navigation.navigate('Exam', { testType: activeTab });
              }
            }}
          >
            <BrutalistShadow style={{ borderRadius: 16 }} offset={4}>
              <View style={styles.examCardInner}>
                <View style={[styles.moduleRedLine, { backgroundColor: exam.color + '40' }]} />
                
                <View style={styles.examCardTop}>
                  <View style={[styles.badge, { backgroundColor: exam.color }]}>
                    <Text style={styles.badgeText}>{exam.level}</Text>
                  </View>
                  <Text style={styles.examTime}>{exam.time}</Text>
                </View>
                
                <Text style={styles.examTitle}>{exam.title}</Text>
                
                <View style={styles.examAction}>
                  <Text style={[styles.examActionText, { color: exam.color }]}>START MOCK EXAM</Text>
                  <Ionicons name="arrow-forward" size={16} color={exam.color} />
                </View>
              </View>
            </BrutalistShadow>
          </TouchableOpacity>
        ))}

        {filteredExams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📂</Text>
            <Text style={styles.emptyText}>No exams found for this skill yet.</Text>
          </View>
        )}

      </ScrollView>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontFamily: 'Outfit_900Black', fontSize: 24, color: '#1b263b', lineHeight: 28 },
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 1 },
  
  tabsContainer: {
    backgroundColor: '#fcfbf7',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
  },
  tabsScroll: { paddingHorizontal: 16, gap: 12 },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f3dc',
    borderWidth: 2,
    borderColor: '#1b263b',
  },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#1b263b', marginLeft: 6, textTransform: 'uppercase' },
  tabTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  headerCard: {
    borderRadius: 16,
    marginBottom: 32,
  },
  headerCardInner: {
    backgroundColor: '#ffd54f',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#fcfbf7',
    borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 },
  headerSub: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#1b263b', opacity: 0.8 },

  sectionBadge: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#c92a2a', letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },

  examCardContainer: { marginBottom: 16 },
  examCardInner: {
    backgroundColor: '#fcfbf7',
    padding: 20, paddingLeft: 24,
  },
  moduleRedLine: {
    position: 'absolute', left: 10, top: 0, bottom: 0, width: 2,
  },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#1b263b' },
  badgeText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#fff', textTransform: 'uppercase' },
  examTime: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#666' },
  examTitle: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },
  examAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  examActionText: { fontSize: 12, fontFamily: 'Outfit_900Black', marginRight: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666' },
});

export default PracticeScreen;
