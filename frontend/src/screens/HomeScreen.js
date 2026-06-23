<<<<<<< HEAD
// ============================================================
// HomeScreen - Mobile First Dashboard
// Duolingo / ELSA Speak inspired
// NO web layouts, NO sidebars, NO desktop cards
// ============================================================
=======
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Pressable,
  Animated,
  Easing,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import AuthModal from './AuthModal';
>>>>>>> origin/main

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
<<<<<<< HEAD
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
=======
  const isWeb = Platform.OS === 'web';
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
>>>>>>> origin/main

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

<<<<<<< HEAD
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
=======
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const userDisplayName = user?.fullName || 'Học viên IELTS';
  const userEmail = user?.email || 'user@sdn.com';

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { text: 'Quản trị viên', bg: 'bg-red-50 border border-red-100', color: 'text-red-600' };
      case 'MENTOR':
        return { text: 'Cố vấn (Mentor)', bg: 'bg-emerald-50 border border-emerald-100', color: 'text-emerald-600' };
      default:
        return { text: 'Học viên', bg: 'bg-blue-50 border border-blue-100', color: 'text-blue-600' };
    }
  };
  const roleBadge = getRoleBadge(user?.role);

  const handleProfilePress = () => {
    toggleUserMenu(false);
    setTimeout(() => handleProtectedNav('Profile'), 150);
  };

  const handleLogoutPress = () => {
    toggleUserMenu(false);
    setTimeout(() => logout(), 150);
  };

  const toggleUserMenu = (open = !isUserMenuVisible) => {
    if (open === isUserMenuVisible) return;

    Animated.timing(menuAnim, {
      toValue: open ? 1 : 0,
      duration: open ? 150 : 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    setIsUserMenuVisible(open);
  };

  const menuAnimatedStyle = {
    opacity: menuAnim,
    transform: [
      {
        translateY: menuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-12, 0],
        }),
      },
      {
        scale: menuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      {/* Premium Mobile Header */}
      <View 
        className="flex-row items-center justify-between px-5 h-16 bg-white border-b border-[#E5E7EB] z-40"
        style={{ zIndex: 40, elevation: 40 }}
      >
        {/* Logo */}
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-[#E6F9F5] rounded-2xl items-center justify-center border border-[#A7F3D0]">
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00CC99" />
              <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill="#005C42" />
              <Path d="M21.5 10v5.5" stroke="#00CC99" strokeWidth="1.5" strokeLinecap="round" />
>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======
          {/* Avatar or Login Button */}
          {!user ? (
            <TouchableOpacity
              onPress={() => setIsAuthModalVisible(true)}
              className="bg-[#00CC99] px-5 py-2.5 rounded-xl active:opacity-90"
            >
              <Text className="text-white text-xs font-bold">Log in / Sign up</Text>
            </TouchableOpacity>
          ) : (
            <View className="relative z-50" style={{ zIndex: 50 }}>
              <TouchableOpacity
                onPress={toggleUserMenu}
                className="w-10 h-10 rounded-full bg-[#00CC99] items-center justify-center"
              >
                <Text className="text-white font-bold text-base">
                  {userInitial}
                </Text>
              </TouchableOpacity>

              {/* Dropdown */}
              {isUserMenuVisible && (
                <Animated.View
                  style={[
                    menuAnimatedStyle,
                    {
                      zIndex: 100,
                      top: 48,
                      elevation: 50,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                    }
                  ]}
                  className="absolute right-0 w-72 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden"
                >
                  {/* User Card */}
                  <View className="p-4 border-b border-[#F3F4F6]">
                    <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3">
                      <View className="w-11 h-11 rounded-full bg-[#00CC99] items-center justify-center shadow-sm">
                        <Text className="text-white font-extrabold text-lg">
                          {userInitial}
                        </Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-sm font-bold text-[#111827]"
                        >
                          {userDisplayName}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-xs text-[#6B7280] mt-0.5"
                        >
                          {userEmail}
                        </Text>
                        <View className={`self-start mt-1.5 px-2 py-0.5 rounded-md ${roleBadge.bg}`}>
                          <Text className={`text-[10px] font-bold ${roleBadge.color}`}>
                            {roleBadge.text}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Profile */}
                  <TouchableOpacity
                    onPress={handleProfilePress}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
                  >
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-xl bg-[#F3F4F6] items-center justify-center mr-3">
                        <Svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4B5563"
                          strokeWidth="2"
                        >
                          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <Circle cx="12" cy="7" r="4" />
                        </Svg>
                      </View>
                      <Text className="text-sm font-semibold text-[#1F2937]">
                        Hồ sơ cá nhân
                      </Text>
                    </View>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5">
                      <Path d="M9 5l7 7-7 7" />
                    </Svg>
                  </TouchableOpacity>

                  {user?.role === 'ADMIN' && (
                    <>
                      <View className="h-px bg-[#F3F4F6]" />
                      <TouchableOpacity
                        onPress={() => {
                          toggleUserMenu(false);
                          setTimeout(() => navigation.navigate('Admin'), 150);
                        }}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-5 py-4 hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
                      >
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 rounded-xl bg-[#E6F9F5] items-center justify-center mr-3">
                            <Svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00CC99"
                              strokeWidth="2.5"
                            >
                              <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </Svg>
                          </View>
                          <Text className="text-sm font-bold text-[#005C42]">
                            Trang quản trị
                          </Text>
                        </View>
                        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                          <Path d="M9 5l7 7-7 7" />
                        </Svg>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Divider */}
                  <View className="h-px bg-[#F3F4F6]" />

                  {/* Logout */}
                  <TouchableOpacity
                    onPress={handleLogoutPress}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-5 py-4 hover:bg-[#FEF2F2] active:bg-[#FEE2E2]"
                  >
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-xl bg-[#FEF2F2] items-center justify-center mr-3">
                        <Svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="2.5"
                        >
                          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <Path d="M16 17l5-5-5-5" />
                          <Path d="M21 12H9" />
                        </Svg>
                      </View>
                      <Text className="text-sm font-semibold text-[#EF4444]">
                        Đăng xuất
                      </Text>
                    </View>
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                      <Path d="M9 5l7 7-7 7" />
                    </Svg>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
>>>>>>> origin/main
          )}
        </View>
      </View>

<<<<<<< HEAD
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
=======
      {isUserMenuVisible && (
        <Pressable 
          className="absolute inset-0 z-30" 
          style={{ zIndex: 30 }}
          onPress={() => toggleUserMenu(false)} 
        />
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HERO SECTION: Stacked for Mobile */}
        <View className="bg-white px-5 pt-8 pb-10 border-b border-[#E5E7EB] overflow-hidden relative">
          <View className="absolute w-72 h-72 bg-[#E6F9F5] rounded-full -top-10 -right-20 opacity-60 filter blur-3xl" />
          
          <View className="bg-[#E6F9F5] px-3.5 py-1.5 rounded-full self-start mb-5 border border-[#A7F3D0]">
            <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">🌟 Elite Platform</Text>
          </View>
          
          <Text className="text-[34px] font-black text-[#1E1E1E] tracking-tight leading-[42px] mb-3">
            Achieve Your{"\n"}
            <Text className="text-[#00CC99]">IELTS Dream Band.</Text>
          </Text>
          
          <Text className="text-sm text-[#6B7280] leading-6 mb-8">
            Experience a revolutionary platform tailored for high achievers. Master IELTS with real-time AI grading & predictive analysis.
          </Text>
          
          <View className="flex-col gap-3">
            <TouchableOpacity 
              onPress={() => handleProtectedNav('Practice', { screen: 'ReadingAI' })}
              className="bg-[#00CC99] w-full py-4 rounded-[16px] items-center active:opacity-90 shadow-sm shadow-emerald-500/30"
            >
              <Text className="text-white text-sm font-extrabold">Start Free Trial</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleProtectedNav('Profile')}
              className="bg-[#F7F9FA] border border-[#E5E7EB] w-full py-4 rounded-[16px] items-center active:opacity-80"
            >
              <Text className="text-[#1E1E1E] text-sm font-extrabold">View Progress</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Image - Mobile Optimized */}
          <View className="mt-10 items-center justify-center relative w-full">
             <Image 
                source={require('../../assets/hero_student.png')}
                className="w-full h-56 rounded-[32px] border-4 border-white shadow-lg relative z-10"
                style={{ resizeMode: 'cover' }}
              />
          </View>

          {/* Stats Row */}
          <View className="flex-row items-center justify-between mt-10 pt-6 border-t border-[#E5E7EB]">
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-[#1E1E1E]">98%</Text>
              <Text className="text-[9px] text-[#6B7280] font-bold uppercase mt-1">Success</Text>
            </View>
            <View className="w-px h-8 bg-[#E5E7EB]" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-[#005C42]">8.0</Text>
              <Text className="text-[9px] text-[#6B7280] font-bold uppercase mt-1">Avg Score</Text>
            </View>
            <View className="w-px h-8 bg-[#E5E7EB]" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-black text-[#00CC99]">50K+</Text>
              <Text className="text-[9px] text-[#6B7280] font-bold uppercase mt-1">Students</Text>
            </View>
          </View>
        </View>

        {/* SECTION: SIGNATURE COURSES - Horizontal ScrollView for Mobile */}
        <View className="py-10 bg-white">
          <View className="px-5 mb-6">
            <Text className="text-[10px] font-black text-[#005C42] uppercase tracking-widest">Our Programs</Text>
            <Text className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight mt-1">
              Signature Courses
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            snapToInterval={width * 0.75 + 16}
            decelerationRate="fast"
          >
            {/* Course 1: IELTS Academic */}
            <View style={{ width: width * 0.75 }} className="bg-[#FAFAFA] rounded-[28px] border border-[#E5E7EB] p-6 shadow-sm overflow-hidden">
              <View className="bg-[#E6F9F5] px-3 py-1 rounded-full self-start mb-4">
                <Text className="text-[#005C42] text-[9px] font-extrabold uppercase">Most Popular</Text>
              </View>
              <Text className="text-xl font-bold text-[#1E1E1E] tracking-tight mb-2">IELTS Academic</Text>
              <Text className="text-xs text-[#6B7280] mb-6 leading-5" numberOfLines={3}>
                Engineered for students applying to higher education or professional registration globally.
>>>>>>> origin/main
              </Text>
              <Text style={S.greetingSub}>Hôm nay bạn sẽ luyện kỹ năng gì?</Text>
            </View>
            {user && <StreakBadge days={7} />}
          </View>

<<<<<<< HEAD
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
=======
          {/* Performance Card */}
          <View className="bg-white p-5 rounded-[28px] border border-[#E5E7EB] shadow-sm mb-5">
            <View className="flex-row justify-between items-start mb-5">
              <View>
                <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase">Forecast</Text>
                <Text className="text-xl font-bold text-[#1E1E1E] mt-1">Band Projection</Text>
              </View>
              <View className="flex-row items-baseline">
                <Text className="text-4xl font-black text-[#00CC99] leading-none">7.5</Text>
              </View>
            </View>
            <View className="flex-col lg:flex-row gap-6">
              {/* Dashboard Left: Band Projection Chart */}
              <View className="w-full lg:flex-[1.8] bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-xs">
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Performance Forecast</Text>
                    <Text className="text-[28px] font-bold text-[#1E1E1E] tracking-tight mt-1">Total Band Projection</Text>
                  </View>
                  <View className="flex-row items-baseline">
                    <Text className="text-[52px] font-black text-[#00CC99] tracking-tighter leading-none">7.5</Text>
                    <Text className="text-xs font-bold text-[#6B7280] ml-2">Target:{"\n"}8.0</Text>
                  </View>
                </View>

                {/* SVG Line Chart for High Premium Aesthetic */}
                <View className="flex-row justify-between items-end h-32 mt-4 px-2">
                  {[
                    { day: 'Mon', height: 'h-10', val: '6.0' },
                    { day: 'Tue', height: 'h-16', val: '7.0' },
                    { day: 'Wed', height: 'h-12', val: '6.5' },
                    { day: 'Thu', height: 'h-20', val: '7.5' },
                    { day: 'Fri', height: 'h-14', val: '7.0' },
                    { day: 'Sat', height: 'h-24', val: '8.0' },
                  ].map((item, index) => (
                    <View key={index} className="items-center flex-1">
                      <View className="bg-[#E6F9F5] px-1.5 py-0.5 rounded-md mb-2">
                        <Text className="text-[8px] font-bold text-[#005C42]">{item.val}</Text>
                      </View>
                      <View className={`w-6 ${item.height} bg-[#00CC99] rounded-t-xl mb-2`} />
                      <Text className="text-[10px] font-bold text-[#9CA3AF]">{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Dashboard Right: Quick Stats & Subscriptions */}
              <View className="w-full lg:flex-[1.2] space-y-6">
                {/* Skill Power */}
                <View className="bg-[#005C42] p-6 rounded-[28px] flex-row justify-between items-center shadow-md shadow-emerald-500/10">
                  <View>
                    <Text className="text-xs font-bold text-white/80 uppercase tracking-wider">Overall Skill Power</Text>
                    <Text className="text-2xl font-black text-white mt-1.5">8.0 Mock Avg.</Text>
                  </View>
                  <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </Svg>
                  </View>
                </View>

                {/* Free Mock Test Banner */}
                <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-xs relative overflow-hidden">
                  <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-4 border border-[#A7F3D0]">
                    <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">⚡ FREE PASS</Text>
                  </View>
                  <Text className="text-xl font-bold text-[#1E1E1E] mb-2 tracking-tight">
                    Unlimited Practice Simulations
                  </Text>
                  <Text className="text-sm text-[#6B7280] mb-6 leading-6">
                    Gain exclusive complimentary access to high-fidelity, timed Reading & Listening test mock sessions.
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleProtectedNav('Practice', { screen: 'ReadingAI' })}
                    className="bg-[#1E1E1E] py-4 rounded-[16px] items-center active:opacity-90"
                  >
                    <Text className="text-white text-sm font-bold">Start Free Mock Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Current Skills Grid - 2x2 for Mobile */}
          <Text className="text-lg font-bold text-[#1E1E1E] mb-4 tracking-tight">Practice by Skill</Text>
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {[
              { label: 'Reading', score: '7.5', pct: 75, color: '#00CC99', bg: '#E6F9F5', icon: <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /> },
              { label: 'Writing', score: '6.5', pct: 65, color: '#005C42', bg: '#E6F9F5', icon: <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /> },
              { label: 'Listening', score: '8.5', pct: 85, color: '#00CC99', bg: '#E6F9F5', icon: <Path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /> },
              { label: 'Speaking', score: '7.0', pct: 70, color: '#F97316', bg: '#FFF7ED', icon: <><Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></> }
            ].map((skill, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleProtectedNav('Practice')} className="w-[48%] bg-white p-4 rounded-[20px] border border-[#E5E7EB] shadow-sm">
                <View style={{ backgroundColor: skill.bg }} className="w-8 h-8 rounded-full items-center justify-center mb-2">
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={skill.color} strokeWidth="2.5">{skill.icon}</Svg>
                </View>
                <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{skill.label}</Text>
                <Text className="text-xl font-extrabold text-[#1E1E1E] my-1">{skill.score}</Text>
                <View className="w-full h-1.5 bg-[#F7F9FA] rounded-full overflow-hidden">
                  <View style={{ width: `${skill.pct}%`, backgroundColor: skill.color }} className="h-full rounded-full" />
                </View>
>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======

      {/* Auth Modal Popup */}
      <AuthModal visible={isAuthModalVisible} onClose={() => setIsAuthModalVisible(false)} />
>>>>>>> origin/main
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
