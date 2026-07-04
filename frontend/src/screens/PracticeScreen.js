import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import examService from '../api/exam.service';

// Brutalist shadow wrapper
const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative' }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden' }}>
      {children}
    </View>
  </View>
);

// Map API type → badge color
const TYPE_COLORS = {
  READING: '#4682b4',
  LISTENING: '#005c42',
  WRITING: '#d97706',
  SPEAKING: '#c92a2a',
};

// Map API type → display level label (fallback)
const getDifficultyLabel = (exam) => {
  if (exam.level) return exam.level;
  if (exam.duration && exam.duration >= 60) return 'Hard';
  return 'Medium';
};

const PracticeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('READING');
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const tabs = [
    { key: 'READING',   label: 'Reading',   icon: 'book' },
    { key: 'LISTENING', label: 'Listening', icon: 'headset' },
    { key: 'WRITING',   label: 'Writing',   icon: 'pencil' },
    { key: 'SPEAKING',  label: 'Speaking',  icon: 'mic' },
  ];

  const fetchExams = useCallback(async (type = activeTab, page = 1, silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await examService.getAll({ type, page, limit: 20 });
      // Response: { success, data: { exams, pagination } }
      const data = res.data?.data;
      setExams(data?.exams || []);
      setPagination(data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError('Không thể tải danh sách đề thi. Kiểm tra kết nối mạng.');
      setExams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch khi đổi tab
  useEffect(() => {
    fetchExams(activeTab, 1);
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExams(activeTab, 1, true);
    setRefreshing(false);
  }, [activeTab, fetchExams]);

  const handleExamPress = (exam) => {
    const type = exam.type?.toLowerCase() || activeTab.toLowerCase();
    if (type === 'speaking') {
      navigation.navigate('Speaking', { title: exam.title, examId: exam.id });
    } else {
      // Truyền examId thật để ExamScreen load từ API
      navigation.navigate('Exam', {
        examId: exam.id,
        testType: exam.type || activeTab,
        examTitle: exam.title,
      });
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    if (minutes >= 60) return `${minutes / 60} Giờ`;
    return `${minutes} Phút`;
  };

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1b263b" />}
      >
        
        {/* Header Card */}
        <BrutalistShadow style={styles.headerCard} offset={4}>
          <View style={styles.headerCardInner}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: 24 }}>🎯</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.headerTitle}>Ready to start?</Text>
              <Text style={styles.headerSub}>
                {pagination.total > 0
                  ? `${pagination.total} đề thi ${activeTab.toLowerCase()} trong cơ sở dữ liệu`
                  : 'Chọn kỹ năng và bắt đầu thi thử ngay.'}
              </Text>
            </View>
          </View>
        </BrutalistShadow>

        <Text style={styles.sectionBadge}>✎ {activeTab} EXAMS</Text>
        <Text style={styles.sectionTitle}>Available Tests</Text>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#1b263b" />
            <Text style={styles.centerText}>Đang tải đề thi...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View style={styles.errorState}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchExams(activeTab, 1)}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Exam List */}
        {!isLoading && !error && exams.map((exam) => {
          const color = TYPE_COLORS[exam.type] || TYPE_COLORS.READING;
          const level = getDifficultyLabel(exam);
          return (
            <TouchableOpacity
              key={exam.id}
              style={styles.examCardContainer}
              activeOpacity={0.8}
              onPress={() => handleExamPress(exam)}
            >
              <BrutalistShadow style={{ borderRadius: 16 }} offset={4}>
                <View style={styles.examCardInner}>
                  <View style={[styles.moduleRedLine, { backgroundColor: color + '40' }]} />
                  
                  <View style={styles.examCardTop}>
                    <View style={[styles.badge, { backgroundColor: color }]}>
                      <Text style={styles.badgeText}>{level}</Text>
                    </View>
                    <Text style={styles.examTime}>{formatDuration(exam.duration)}</Text>
                  </View>
                  
                  <Text style={styles.examTitle} numberOfLines={2}>{exam.title}</Text>
                  
                  {exam.questionsCount != null && (
                    <Text style={styles.examMeta}>{exam.questionsCount} câu hỏi</Text>
                  )}
                  
                  <View style={styles.examAction}>
                    <Text style={[styles.examActionText, { color }]}>START EXAM</Text>
                    <Ionicons name="arrow-forward" size={16} color={color} />
                  </View>
                </View>
              </BrutalistShadow>
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {!isLoading && !error && exams.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📂</Text>
            <Text style={styles.emptyText}>Chưa có đề thi {activeTab.toLowerCase()} nào trong hệ thống.</Text>
            <Text style={styles.emptySubText}>Admin có thể bulk-import đề Cambridge qua Admin Panel.</Text>
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

  centerState: { alignItems: 'center', paddingVertical: 40 },
  centerText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#666', marginTop: 12 },

  errorState: { alignItems: 'center', paddingVertical: 40 },
  errorText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#c92a2a', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#1b263b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#fff' },

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
  examTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 6, lineHeight: 22 },
  examMeta: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#999', marginBottom: 10 },
  examAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  examActionText: { fontSize: 12, fontFamily: 'Outfit_900Black', marginRight: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 8 },
  emptySubText: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#999', textAlign: 'center' },
});

export default PracticeScreen;
