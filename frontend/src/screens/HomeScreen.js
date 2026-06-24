// ============================================================
// HomeScreen - Mobile First Dashboard
// Duolingo / ELSA Speak inspired
// NO web layouts, NO sidebars, NO desktop cards
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Menu, Divider } from 'react-native-paper';

import AppIcon from '../shared/icons/AppIcon';
import useAuthStore from '../store/useAuthStore';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../theme';


// ── Quick Action Card ────────────────────────────────────────
const QuickAction = ({ iconName, label, color, bg, onPress }) => (
  <TouchableOpacity style={[S.qaCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.85}>
    <View style={[S.qaIconWrap, { backgroundColor: color + '22' }]}>
      <AppIcon name={iconName} size={24} color={color} />
    </View>
    <Text style={[S.qaLabel, { color }]} numberOfLines={2}>{label}</Text>
  </TouchableOpacity>
);

// ── Score Band Circle ─────────────────────────────────────────
const BandCircle = ({ score, label, color }) => (
  <View style={S.bandCircleWrap}>
    <View style={[S.bandCircle, { borderColor: color }]}>
      <Text style={[S.bandScore, { color }]}>{score}</Text>
    </View>
    <Text style={S.bandLabel}>{label}</Text>
  </View>
);

// ── Skill Progress Row ────────────────────────────────────────
const SkillRow = ({ iconName, label, score, pct, color, onPress }) => (
  <TouchableOpacity style={S.skillRow} onPress={onPress} activeOpacity={0.85}>
    <View style={[S.skillIcon, { backgroundColor: color + '18' }]}>
      <AppIcon name={iconName} size={20} color={color} />
    </View>
    <View style={S.skillInfo}>
      <View style={S.skillLabelRow}>
        <Text style={S.skillLabel}>{label}</Text>
        <Text style={[S.skillScore, { color }]}>{score}</Text>
      </View>
      <View style={S.progressTrack}>
        <View style={[S.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
    <AppIcon name="chevron-right" size={18} color={COLORS.textTertiary} />
  </TouchableOpacity>
);

// ── Streak Badge ──────────────────────────────────────────────
const StreakBadge = ({ days }) => (
  <View style={S.streakBadge}>
    <AppIcon name="flame" size={18} color="#F97316" />
    <Text style={S.streakText}>{days} ngày</Text>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const firstName = user?.fullName?.split(' ').slice(-1)[0] || 'Học viên';
  const initial   = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  const navigate = (screen, params) => navigation.navigate(screen, params);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* ── Top App Bar ──────────────────────────────────── */}
      <View style={S.appBar}>
        <View style={S.appBarLeft}>
          <View style={S.logo}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7l10 5 10-5-10-5z" fill={COLORS.primary} />
              <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill={COLORS.accent} />
            </Svg>
          </View>
          <Text style={S.appBarTitle}>Apex IELTS</Text>
        </View>

        <View style={S.appBarRight}>
          {/* Notification */}
          <TouchableOpacity style={S.iconBtn} activeOpacity={0.8}>
            <AppIcon name="notifications-outline" size={22} color={COLORS.textSecondary} />
            <View style={S.notifDot} />
          </TouchableOpacity>

          {/* Avatar & Menu */}
          {user ? (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity
                  style={S.avatar}
                  onPress={openMenu}
                  activeOpacity={0.8}
                >
                  <Text style={S.avatarText}>{initial}</Text>
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md }}
            >
              <Menu.Item 
                onPress={() => { closeMenu(); navigate('Profile'); }} 
                title="Hồ sơ cá nhân" 
                leadingIcon="account-outline"
              />
              <Menu.Item 
                onPress={() => { closeMenu(); navigate('Settings'); }} 
                title="Cài đặt" 
                leadingIcon="cog-outline"
              />
              <Divider />
              <Menu.Item 
                onPress={() => { closeMenu(); logout(); }} 
                title="Đăng xuất" 
                titleStyle={{ color: COLORS.error }}
                leadingIcon="logout"
              />
            </Menu>
          ) : (
            <TouchableOpacity
              style={S.loginChip}
              onPress={() => navigate('Login')}
            >
              <Text style={S.loginChipText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={S.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ── Greeting ─────────────────────────────────── */}
        <View style={S.greetingSection}>
          <View style={S.greetingRow}>
            <View>
              <Text style={S.greetingHi}>
                {user ? `Xin chào, ${firstName} 👋` : 'Chào mừng bạn 👋'}
              </Text>
              <Text style={S.greetingSub}>Hôm nay bạn sẽ luyện kỹ năng gì?</Text>
            </View>
            {user && <StreakBadge days={7} />}
          </View>

          {/* Hero banner */}
          <View style={S.heroBanner}>
            <View style={S.heroBannerText}>
              <Text style={S.heroBadge}>🎯 Mục tiêu hôm nay</Text>
              <Text style={S.heroTitle}>Đạt Band 7.5+{'\n'}trong 3 tháng</Text>
              <TouchableOpacity
                style={S.heroBtn}
                onPress={() => navigate(user ? 'Practice' : 'Login')}
              >
                <Text style={S.heroBtnText}>Bắt đầu ngay</Text>
                <AppIcon name="chevron-right" size={16} color={COLORS.textInverse} />
              </TouchableOpacity>
            </View>
            <View style={S.heroBannerIllustration}>
              <Svg width="90" height="90" viewBox="0 0 90 90" fill="none">
                <Circle cx="45" cy="45" r="45" fill={COLORS.primary + '20'} />
                <Path d="M45 20L25 32.5V55c0 12.43 8.95 24.07 20 26.87C56.05 79.07 65 67.43 65 55V32.5L45 20z" fill={COLORS.primary} opacity="0.3" />
                <Path d="M45 28L30 38.13V55c0 8.83 6.37 17.1 15 19.45C58.63 72.1 65 63.83 65 55V38.13L45 28z" fill={COLORS.primary} opacity="0.5" />
                <Path d="M40 52l5 5 10-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ─────────────────────────────── */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Luyện tập nhanh</Text>
          <View style={S.qaGrid}>
            <View style={S.qaRow}>
              <QuickAction iconName="speaking"  label="AI Speaking" color="#EF4444" bg="#FFF5F5" onPress={() => navigate(user ? 'Practice' : 'Login')} />
              <QuickAction iconName="writing"   label="AI Writing"  color="#F59E0B" bg="#FFFBEB" onPress={() => navigate(user ? 'Practice' : 'Login')} />
            </View>
            <View style={S.qaRow}>
              <QuickAction iconName="reading"   label="Reading"     color="#3B82F6" bg="#EFF6FF" onPress={() => navigate(user ? 'Practice' : 'Login')} />
              <QuickAction iconName="listening" label="Listening"   color="#8B5CF6" bg="#F5F3FF" onPress={() => navigate(user ? 'Practice' : 'Login')} />
            </View>
          </View>
        </View>

        {/* ── Progress Summary ─────────────────────────── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Điểm số tổng quan</Text>
            <TouchableOpacity onPress={() => navigate(user ? 'Profile' : 'Login')}>
              <Text style={S.seeAll}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>
          <View style={S.bandCard}>
            <View style={S.overallBand}>
              <Text style={S.overallLabel}>Overall Band</Text>
              <Text style={S.overallScore}>7.5</Text>
              <View style={S.overallBadge}>
                <AppIcon name="trophy" size={14} color="#F59E0B" />
                <Text style={S.overallBadgeText}>Good User</Text>
              </View>
            </View>
            <View style={S.bandRow}>
              <BandCircle score="7.5" label="Reading" color={COLORS.reading} />
              <BandCircle score="8.5" label="Listening" color={COLORS.listening} />
              <BandCircle score="6.5" label="Writing" color={COLORS.writing} />
              <BandCircle score="7.0" label="Speaking" color={COLORS.speaking} />
            </View>
          </View>
        </View>

        {/* ── Skills Progress ───────────────────────────── */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>Tiến độ kỹ năng</Text>
            <TouchableOpacity onPress={() => navigate('Practice')}>
              <Text style={S.seeAll}>Luyện tập</Text>
            </TouchableOpacity>
          </View>
          <View style={S.skillsCard}>
            <SkillRow iconName="reading"   label="Reading"   score="7.5" pct={75} color={COLORS.reading}   onPress={() => navigate('Practice')} />
            <SkillRow iconName="listening" label="Listening" score="8.5" pct={85} color={COLORS.listening} onPress={() => navigate('Practice')} />
            <SkillRow iconName="writing"   label="Writing"   score="6.5" pct={65} color={COLORS.writing}   onPress={() => navigate('Practice')} />
            <SkillRow iconName="speaking"  label="Speaking"  score="7.0" pct={70} color={COLORS.speaking}  onPress={() => navigate('Practice')} />
          </View>
        </View>

        {/* ── AI Features Banner ────────────────────────── */}
        <View style={[S.section, { marginBottom: SPACING['3xl'] }]}>
          <View style={S.aiBanner}>
            <AppIcon name="ai" size={32} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={S.aiBannerTitle}>AI Đánh giá bài làm</Text>
              <Text style={S.aiBannerSub}>Nhận phản hồi chi tiết từ AI về Writing & Speaking</Text>
            </View>
            <TouchableOpacity
              style={S.aiBannerBtn}
              onPress={() => navigate(user ? 'Practice' : 'Login')}
            >
              <Text style={S.aiBannerBtnText}>Thử ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Admin Quick Access ────────────────────────── */}
        {user?.role === 'ADMIN' && (
          <TouchableOpacity style={S.adminChip} onPress={() => navigate('Admin')}>
            <AppIcon name="admin" size={20} color={COLORS.primary} />
            <Text style={S.adminChipText}>Admin Portal</Text>
            <AppIcon name="chevron-right" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const S = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  // ── App Bar ────────────────────────────────────────────
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  appBarLeft:  { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logo: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBarTitle: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textPrimary },

  iconBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  avatarText: { fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textInverse },
  loginChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  loginChipText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textInverse },

  // ── Section ────────────────────────────────────────────
  section:       { paddingHorizontal: SPACING.base, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  sectionTitle:  { fontSize: TYPOGRAPHY.lg, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  seeAll:        { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontSemiBold, color: COLORS.primary },

  // ── Greeting ───────────────────────────────────────────
  greetingSection: { backgroundColor: COLORS.surface, padding: SPACING.base, paddingBottom: 0 },
  greetingRow:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.base },
  greetingHi:      { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  greetingSub:     { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, marginTop: 2 },

  streakBadge:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, gap: 4, borderWidth: 1, borderColor: '#FED7AA' },
  streakText:    { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: '#F97316' },

  // ── Hero Banner ────────────────────────────────────────
  heroBanner: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
    overflow: 'hidden',
  },
  heroBannerText:         { flex: 1 },
  heroBadge:              { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.primaryBorder, marginBottom: SPACING.sm },
  heroTitle:              { fontSize: TYPOGRAPHY.xl, fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.textInverse, lineHeight: TYPOGRAPHY.xl * 1.3, marginBottom: SPACING.base },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  heroBtnText:            { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textInverse },
  heroBannerIllustration: { marginLeft: SPACING.md },

  // ── Quick Actions ──────────────────────────────────────────
  qaGrid: { gap: SPACING.sm },
  qaRow:  { flexDirection: 'row', gap: SPACING.sm },
  qaCard: {
    flex: 1,
    minHeight: 80,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  qaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qaLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    fontFamily: TYPOGRAPHY.fontBold,
    lineHeight: TYPOGRAPHY.sm * 1.4,
  },

  // ── Band Card ──────────────────────────────────────────
  bandCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  overallBand:    { alignItems: 'center', marginBottom: SPACING.lg },
  overallLabel:   { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary },
  overallScore:   { fontSize: TYPOGRAPHY['5xl'], fontFamily: TYPOGRAPHY.fontBlack, color: COLORS.primary, lineHeight: 60 },
  overallBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  overallBadgeText: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontBold, color: '#92400E' },

  bandRow:        { flexDirection: 'row', justifyContent: 'space-around' },
  bandCircleWrap: { alignItems: 'center', gap: SPACING.sm },
  bandCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  bandScore: { fontSize: TYPOGRAPHY.md, fontFamily: TYPOGRAPHY.fontBlack },
  bandLabel: { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary },

  // ── Skills ─────────────────────────────────────────────
  skillsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'],
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  skillIcon:     { width: 44, height: 44, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  skillInfo:     { flex: 1 },
  skillLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  skillLabel:    { fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontSemiBold, color: COLORS.textPrimary },
  skillScore:    { fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontBold },
  progressTrack: { height: 6, backgroundColor: COLORS.gray100, borderRadius: RADIUS.full, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: RADIUS.full },

  // ── AI Banner ──────────────────────────────────────────
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS['2xl'],
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  aiBannerTitle: { fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textPrimary },
  aiBannerSub:   { fontSize: TYPOGRAPHY.xs, fontFamily: TYPOGRAPHY.fontRegular, color: COLORS.textSecondary, marginTop: 2 },
  aiBannerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  aiBannerBtnText: { fontSize: TYPOGRAPHY.sm, fontFamily: TYPOGRAPHY.fontBold, color: COLORS.textInverse },

  // ── Admin ──────────────────────────────────────────────
  adminChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.xl,
    padding: SPACING.base,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  adminChipText: { flex: 1, fontSize: TYPOGRAPHY.base, fontFamily: TYPOGRAPHY.fontSemiBold, color: COLORS.accent },
});

export default HomeScreen;
