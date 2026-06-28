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

// Inline horizontal bar chart
const BandBar = ({ label, score, color, maxScore = 9 }) => {
  const pct = (score / maxScore) * 100;
  return (
    <View style={styles.bandBarRow}>
      <Text style={styles.bandBarLabel}>{label}</Text>
      <View style={styles.bandBarTrack}>
        <View style={[styles.bandBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.bandBarScore, { color }]}>{score}</Text>
    </View>
  );
};

// History item
const HistoryItem = ({ title, date, score, type, color }) => (
  <View style={styles.historyItem}>
    <View style={[styles.historyIcon, { backgroundColor: color + '20' }]}>
      <Text style={{ fontSize: 18 }}>{type === 'speaking' ? '🎙️' : type === 'writing' ? '✍️' : type === 'listening' ? '🎧' : '📖'}</Text>
    </View>
    <View style={styles.historyInfo}>
      <Text style={styles.historyTitle}>{title}</Text>
      <Text style={styles.historyDate}>{date}</Text>
    </View>
    <View style={[styles.historyScore, { borderColor: color }]}>
      <Text style={[styles.historyScoreText, { color }]}>{score}</Text>
    </View>
  </View>
);

const ProgressScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'ALL' },
    { key: 'reading', label: 'READING' },
    { key: 'listening', label: 'LISTENING' },
    { key: 'writing', label: 'WRITING' },
    { key: 'speaking', label: 'SPEAKING' },
  ];

  const history = [
    { id: 1, title: 'Cambridge 18 - Test 1', date: '24 Jun 2026', score: 7.5, type: 'reading', color: '#4682b4' },
    { id: 2, title: 'Speaking Mock - Cue Card', date: '23 Jun 2026', score: 7.0, type: 'speaking', color: '#c92a2a' },
    { id: 3, title: 'Writing Task 2 - Education', date: '22 Jun 2026', score: 6.5, type: 'writing', color: '#d97706' },
    { id: 4, title: 'Listening Practice 3', date: '21 Jun 2026', score: 8.0, type: 'listening', color: '#005c42' },
    { id: 5, title: 'Cambridge 17 - Test 2', date: '20 Jun 2026', score: 7.0, type: 'reading', color: '#4682b4' },
    { id: 6, title: 'Speaking - Part 1 AI', date: '19 Jun 2026', score: 6.5, type: 'speaking', color: '#c92a2a' },
  ];

  const filtered = activeFilter === 'all' ? history : history.filter(h => h.type === activeFilter);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>STUDY PROGRESS</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Overall Band Score Card */}
        <BrutalistShadow style={styles.overallCard} offset={6}>
          <View style={styles.overallCardInner}>
            {/* Red margin line */}
            <View style={styles.marginLine} />

            <Text style={styles.sectionBadge}>✎ CURRENT OVERALL</Text>
            <View style={styles.overallRow}>
              <View>
                <Text style={styles.overallScore}>7.5</Text>
                <Text style={styles.overallLabel}>IELTS Band</Text>
              </View>
              {/* Stamp */}
              <View style={styles.stampRing}>
                <Text style={styles.stampText}>A+</Text>
              </View>
            </View>

            {/* Band bars for each skill */}
            <View style={styles.bandsSection}>
              <BandBar label="Reading"   score={7.5} color="#4682b4" />
              <BandBar label="Listening" score={8.5} color="#005c42" />
              <BandBar label="Writing"   score={6.5} color="#d97706" />
              <BandBar label="Speaking"  score={7.0} color="#c92a2a" />
            </View>
          </View>
        </BrutalistShadow>

        {/* Weekly Streak Card */}
        <BrutalistShadow style={styles.streakCard} offset={4}>
          <View style={styles.streakCardInner}>
            <View style={styles.streakHeader}>
              <Text style={styles.sectionBadge}>🔥 THIS WEEK</Text>
              <Text style={styles.streakCount}>7 Day Streak</Text>
            </View>
            {/* Day dots */}
            <View style={styles.dayDots}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <View key={i} style={styles.dayCol}>
                  <View style={[styles.dayDot, i < 5 && styles.dayDotFilled]}>
                    {i < 5 && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </BrutalistShadow>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'TESTS DONE', value: '34', emoji: '📋', color: '#4682b4' },
            { label: 'AI GRADED', value: '28', emoji: '🤖', color: '#005c42' },
            { label: 'STUDY HOURS', value: '82h', emoji: '⏱️', color: '#d97706' },
            { label: 'TOP SCORE', value: '8.5', emoji: '🏆', color: '#c92a2a' },
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
            {filtered.map((item, i) => (
              <React.Fragment key={item.id}>
                <HistoryItem {...item} />
                {i < filtered.length - 1 && <View style={styles.historyDivider} />}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <Text style={styles.emptyText}>No history found for this skill.</Text>
            )}
          </View>
        </BrutalistShadow>

      </ScrollView>
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
  bandBarScore: { fontFamily: 'Outfit_900Black', fontSize: 14, width: 30, textAlign: 'right' },

  // Streak Card
  streakCard: { borderRadius: 16, marginBottom: 20 },
  streakCardInner: { backgroundColor: '#ffd54f', padding: 20 },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  streakCount: { fontFamily: 'Outfit_900Black', fontSize: 16, color: '#1b263b' },
  dayDots: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#1b263b', backgroundColor: '#fcfbf7', alignItems: 'center', justifyContent: 'center' },
  dayDotFilled: { backgroundColor: '#1b263b' },
  dayLabel: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#1b263b' },

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
  historyScoreText: { fontFamily: 'Outfit_900Black', fontSize: 16 },
  historyDivider: { height: 1, backgroundColor: 'rgba(27,38,59,0.1)', marginHorizontal: 4 },
  emptyText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#999', textAlign: 'center', paddingVertical: 20 },
});

export default ProgressScreen;
