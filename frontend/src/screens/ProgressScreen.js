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
import client from '../api/client';
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

// Inline horizontal bar chart
const BandBar = ({ label, score, color, maxScore = 9 }) => {
  const pct = score > 0 ? (score / maxScore) * 100 : 0;
  return (
    <View style={styles.bandBarRow}>
      <Text style={styles.bandBarLabel}>{label}</Text>
      <View style={styles.bandBarTrack}>
        <View style={[styles.bandBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.bandBarScore, { color }]}>{score > 0 ? score.toFixed(1) : '—'}</Text>
    </View>
  );
};

// History item
const HistoryItem = ({ title, date, score, type, color }) => (
  <View style={styles.historyItem}>
    <View style={[styles.historyIcon, { backgroundColor: color + '20' }]}>
      <Text style={{ fontSize: 18 }}>
        {type === 'SPEAKING' ? '🎙️' : type === 'WRITING' ? '✍️' : type === 'LISTENING' ? '🎧' : '📖'}
      </Text>
    </View>
    <View style={styles.historyInfo}>
      <Text style={styles.historyTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.historyDate}>{date}</Text>
    </View>
    <View style={[styles.historyScore, { borderColor: color }]}>
      <Text style={[styles.historyScoreText, { color }]}>{score?.toFixed(1) || '—'}</Text>
    </View>
  </View>
);

const TYPE_COLORS = {
  READING: '#4682b4',
  LISTENING: '#005c42',
  WRITING: '#d97706',
  SPEAKING: '#c92a2a',
};

const ProgressScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // API data
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  const filters = [
    { key: 'all',       label: 'ALL' },
    { key: 'READING',   label: 'READING' },
    { key: 'LISTENING', label: 'LISTENING' },
    { key: 'WRITING',   label: 'WRITING' },
    { key: 'SPEAKING',  label: 'SPEAKING' },
  ];

  const fetchProgress = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      // Fetch user results from backend
      const [statsRes, historyRes] = await Promise.allSettled([
        client.get('/users/me/stats', { hideToast: true }),
        client.get('/users/me/results?limit=20', { hideToast: true }),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data?.data || statsRes.value.data?.metadata || null);
      }
      if (historyRes.status === 'fulfilled') {
        const raw = historyRes.value.data?.data?.results || historyRes.value.data?.metadata || [];
        setHistory(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      // Stats/results endpoint may not exist yet — silently keep empty state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgress(true);
    setRefreshing(false);
  }, [fetchProgress]);

  const filtered = activeFilter === 'all'
    ? history
    : history.filter(h => (h.type || h.test?.type) === activeFilter);

  // Compute overall band from stats or history
  const overall = stats?.overallBand || (history.length > 0
    ? (history.reduce((sum, h) => sum + (h.bandScore || 0), 0) / history.length).toFixed(1)
    : null);

  const bandByType = {
    READING:   stats?.readingBand   || null,
    LISTENING: stats?.listeningBand || null,
    WRITING:   stats?.writingBand   || null,
    SPEAKING:  stats?.speakingBand  || null,
  };

  const totalTests  = stats?.totalTests  || history.length;
  const totalHours  = stats?.studyHours  || 0;
  const topScore    = stats?.topScore    || (history.length > 0 ? Math.max(...history.map(h => h.bandScore || 0)) : 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>STUDY PROGRESS</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#1b263b" />
          <Text style={styles.centerText}>Đang tải tiến độ của bạn...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1b263b" />}
        >

          {/* Overall Band Score Card */}
          <BrutalistShadow style={styles.overallCard} offset={6}>
            <View style={styles.overallCardInner}>
              <View style={styles.marginLine} />
              <Text style={styles.sectionBadge}>✎ CURRENT OVERALL</Text>
              <View style={styles.overallRow}>
                <View>
                  <Text style={styles.overallScore}>{overall || '—'}</Text>
                  <Text style={styles.overallLabel}>IELTS Band</Text>
                </View>
                <View style={styles.stampRing}>
                  <Text style={styles.stampText}>{overall >= 8 ? 'A+' : overall >= 7 ? 'A' : overall >= 6 ? 'B' : '?'}</Text>
                </View>
              </View>

              {/* Band bars for each skill */}
              <View style={styles.bandsSection}>
                <BandBar label="Reading"   score={bandByType.READING   || 0} color="#4682b4" />
                <BandBar label="Listening" score={bandByType.LISTENING || 0} color="#005c42" />
                <BandBar label="Writing"   score={bandByType.WRITING   || 0} color="#d97706" />
                <BandBar label="Speaking"  score={bandByType.SPEAKING  || 0} color="#c92a2a" />
              </View>

              {!stats && history.length === 0 && (
                <Text style={styles.noDataHint}>Chưa có dữ liệu. Hãy thực hiện bài thi đầu tiên!</Text>
              )}
            </View>
          </BrutalistShadow>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {[
              { label: 'TESTS DONE', value: totalTests || '0',            emoji: '📋', color: '#4682b4' },
              { label: 'STUDY HOURS', value: totalHours > 0 ? `${totalHours}h` : '—', emoji: '⏱️', color: '#d97706' },
              { label: 'TOP SCORE',  value: topScore > 0 ? topScore.toFixed(1) : '—', emoji: '🏆', color: '#c92a2a' },
              { label: 'HISTORY',    value: history.length || '0',         emoji: '📊', color: '#005c42' },
            ].map((stat, i) => (
              <BrutalistShadow key={i} style={styles.statCard} offset={3}>
                <View style={styles.statCardInner}>
                  <Text style={styles.statEmoji}>{stat.emoji}</Text>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </BrutalistShadow>
            ))}
          </View>

          {/* History Section */}
          <Text style={styles.sectionBadge}>✎ EXAM HISTORY</Text>
          <Text style={styles.sectionTitle}>Recent Attempts</Text>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {filters.map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
              >
                <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <BrutalistShadow style={styles.historyCard} offset={4}>
            <View style={styles.historyCardInner}>
              {filtered.length > 0 ? filtered.map((item, i) => {
                const type = item.type || item.test?.type || 'READING';
                const color = TYPE_COLORS[type] || '#4682b4';
                return (
                  <React.Fragment key={item.id || i}>
                    <HistoryItem
                      title={item.test?.title || item.title || 'Bài thi'}
                      date={formatDate(item.createdAt)}
                      score={item.bandScore}
                      type={type}
                      color={color}
                    />
                    {i < filtered.length - 1 && <View style={styles.historyDivider} />}
                  </React.Fragment>
                );
              }) : (
                <View style={styles.emptyHistory}>
                  <Text style={{ fontSize: 32, marginBottom: 10 }}>📭</Text>
                  <Text style={styles.emptyText}>
                    {activeFilter === 'all'
                      ? 'Chưa có lịch sử thi. Hãy thực hiện bài thi đầu tiên!'
                      : `Chưa có lịch sử thi ${activeFilter.toLowerCase()}.`}
                  </Text>
                </View>
              )}
            </View>
          </BrutalistShadow>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f3dc' },
  appBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fcfbf7',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
    alignItems: 'center',
  },
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 2 },

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#666', marginTop: 16 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  sectionBadge: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#c92a2a', letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },

  // Overall Card
  overallCard: { borderRadius: 24, marginBottom: 20 },
  overallCardInner: { backgroundColor: '#fcfbf7', padding: 24, paddingLeft: 36 },
  marginLine: { position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, backgroundColor: 'rgba(224,86,91,0.4)' },
  overallRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  overallScore: { fontSize: 80, fontFamily: 'Outfit_900Black', color: '#1b263b', lineHeight: 85 },
  overallLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', letterSpacing: 2 },
  stampRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#c92a2a', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-12deg' }] },
  stampText: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#c92a2a' },

  bandsSection: { gap: 12 },
  bandBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bandBarLabel: { fontFamily: 'Outfit_900Black', fontSize: 11, color: '#1b263b', width: 70 },
  bandBarTrack: { flex: 1, height: 10, backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b', borderRadius: 4, overflow: 'hidden' },
  bandBarFill: { height: '100%' },
  bandBarScore: { fontFamily: 'Outfit_900Black', fontSize: 14, width: 36, textAlign: 'right' },

  noDataHint: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: '#999', textAlign: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(27,38,59,0.1)' },

  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: { width: '46%', borderRadius: 16 },
  statCardInner: { backgroundColor: '#fcfbf7', padding: 16, alignItems: 'center' },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { fontSize: 28, fontFamily: 'Outfit_900Black' },
  statLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', letterSpacing: 1, marginTop: 2 },

  // Filters
  filtersScroll: { paddingBottom: 12, gap: 10 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 2, borderColor: '#1b263b', backgroundColor: '#fcfbf7' },
  filterBtnActive: { backgroundColor: '#1b263b' },
  filterText: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#1b263b' },
  filterTextActive: { color: '#fff' },

  // History Card
  historyCard: { borderRadius: 20, marginTop: 4 },
  historyCardInner: { backgroundColor: '#fcfbf7', padding: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyIcon: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  historyInfo: { flex: 1 },
  historyTitle: { fontFamily: 'Outfit_900Black', fontSize: 14, color: '#1b263b', marginBottom: 2 },
  historyDate: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#999' },
  historyScore: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  historyScoreText: { fontFamily: 'Outfit_900Black', fontSize: 15 },
  historyDivider: { height: 1, backgroundColor: 'rgba(27,38,59,0.1)', marginHorizontal: 4 },

  emptyHistory: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#999', textAlign: 'center' },
});

export default ProgressScreen;
