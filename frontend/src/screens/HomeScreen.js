import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Pressable,
  Animated,
  Easing
} from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/useSocketStore';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { isConnected, socketId, sendPing, pingResponse } = useSocketStore();
  const isWeb = true;
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const userDisplayName = user?.fullName || 'IELTS Learner';
  const userEmail = user?.email || 'user@sdn.com';

  const handleProfilePress = () => {
    toggleUserMenu(false);
    setTimeout(() => navigation.navigate('Profile'), 150);
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
      {/* Premium Header */}
      <View className="flex-row items-center justify-between px-6 h-16 bg-white border-b border-[#E5E7EB] z-40">

  {/* Logo */}
  <View className="flex-row items-center">
    <View className="w-10 h-10 bg-[#E6F9F5] rounded-[16px] items-center justify-center border border-[#A7F3D0]">
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00CC99" />
        <Path
          d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z"
          fill="#005C42"
        />
        <Path
          d="M21.5 10v5.5"
          stroke="#00CC99"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>

    <Text className="text-2xl font-black text-[#1E1E1E] ml-2.5">
      Apex IELTS
    </Text>
  </View>

  {/* Center Menu */}
  {isWeb && (
    <View className="absolute left-0 right-0 flex-row justify-center items-center">
      {['Home', 'Courses', 'Practice', 'Mentors'].map((menu, i) => (
        <TouchableOpacity
          key={i}
          className="mx-5"
          style={{ marginHorizontal: 12 }}
          onPress={() =>
            menu === 'Practice'
              ? navigation.navigate('Practice')
              : menu === 'Home'
              ? null
              : navigation.navigate('Profile')
          }
        >
          <Text
            className={`text-sm font-bold ${
              menu === 'Home'
                ? 'text-[#00CC99]'
                : 'text-[#6B7280]'
            }`}
          >
            {menu}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )}

  {/* Right Side */}
  <View className="flex-row items-center">

    {/* Notification */}
    <TouchableOpacity className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-white mr-3">
      <Svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6B7280"
        strokeWidth="2"
      >
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </Svg>
    </TouchableOpacity>

    {/* Avatar */}
    <View className="relative">

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
          style={menuAnimatedStyle}
          className="absolute right-0 top-14 w-72 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl z-50"
        >

          {/* User Card */}
          <View className="p-4 border-b border-[#F3F4F6]">
            <View className="flex-row items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-3">

              <View className="w-11 h-11 rounded-full bg-[#00CC99] items-center justify-center">
                <Text className="text-white font-bold">
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
                  className="text-xs text-[#6B7280] mt-1"
                >
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile */}
          <TouchableOpacity
            onPress={handleProfilePress}
            className="flex-row items-center px-4 py-4"
          >
            <Svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
            >
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <Circle cx="12" cy="7" r="4" />
            </Svg>

            <Text className="ml-3 text-sm font-medium text-[#111827]">
              Profile
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="h-px bg-[#F3F4F6]" />

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogoutPress}
            className="flex-row items-center px-4 py-4"
          >
            <Svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
            >
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <Path d="M16 17l5-5-5-5" />
              <Path d="M21 12H9" />
            </Svg>

            <Text className="ml-3 text-sm font-medium text-[#DC2626]">
              Logout
            </Text>
          </TouchableOpacity>

        </Animated.View>
      )}
    </View>
  </View>
</View>

      {isUserMenuVisible && (
        <Pressable className="absolute inset-0 z-30" onPress={() => toggleUserMenu(false)} />
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* HERO SECTION: Minimal, spacious, modern */}
        <View className="bg-white py-16 px-6 lg:px-20 border-b border-[#E5E7EB] overflow-hidden">
          <View className="max-w-[1280px] mx-auto flex-col lg:flex-row items-center justify-between">
            {/* Hero Left: Text & CTA */}
            <View className="flex-1 lg:pr-12 mb-10 lg:mb-0">
              <View className="bg-[#E6F9F5] px-4 py-1.5 rounded-full self-start mb-6 border border-[#A7F3D0]">
                <Text className="text-[#005C42] text-[11px] font-extrabold uppercase tracking-widest">🌟 Elite IELTS Platform</Text>
              </View>
              <Text className="text-4xl lg:text-6xl font-black text-[#1E1E1E] tracking-tight leading-[48px] lg:leading-[68px]">
                Achieve Your{"\n"}
                <Text className="text-[#00CC99]">IELTS Dream Band.</Text>
              </Text>
              <Text className="text-base text-[#6B7280] mt-6 mb-8 leading-7 max-w-[520px]">
                Experience a revolutionary minimalist platform tailored for high achievers. Master IELTS Academic & General modules with real-time AI grading, predictive analysis, and elite mentor support.
              </Text>
              
              <View className="flex-row flex-wrap gap-4">
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
                  className="bg-[#00CC99] px-8 py-4.5 rounded-[20px] items-center active:opacity-90 shadow-md shadow-emerald-500/20"
                >
                  <Text className="text-white text-base font-extrabold">Start Free Trial</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Profile')}
                  className="bg-[#F7F9FA] border border-[#E5E7EB] px-8 py-4.5 rounded-[20px] items-center active:opacity-80"
                >
                  <Text className="text-[#1E1E1E] text-base font-extrabold">View Progress</Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Stats Grid */}
              <View className="flex-row items-center mt-12 gap-8 pt-8 border-t border-[#E5E7EB]">
                <View>
                  <Text className="text-3xl font-black text-[#1E1E1E]">98.4%</Text>
                  <Text className="text-xs text-[#6B7280] font-bold uppercase mt-1">Success Rate</Text>
                </View>
                <View className="w-px h-10 bg-[#E5E7EB]" />
                <View>
                  <Text className="text-3xl font-black text-[#005C42]">Band 8.0</Text>
                  <Text className="text-xs text-[#6B7280] font-bold uppercase mt-1">Average Score</Text>
                </View>
                <View className="w-px h-10 bg-[#E5E7EB]" />
                <View>
                  <Text className="text-3xl font-black text-[#00CC99]">50K+</Text>
                  <Text className="text-xs text-[#6B7280] font-bold uppercase mt-1">Students</Text>
                </View>
              </View>
            </View>

            {/* Hero Right: Premium Image */}
            <View className="flex-1 items-center justify-center relative w-full">
              <View className="absolute w-[420px] h-[420px] bg-[#E6F9F5] rounded-full -top-10 -right-10 opacity-60 filter blur-xl" />
              <View className="absolute w-[300px] h-[300px] bg-[#E6F9F5] rounded-full -bottom-10 -left-10 opacity-70 filter blur-xl" />
              <Image 
                source={require('../../assets/hero_student.png')}
                className="w-full max-w-[480px] h-[360px] lg:h-[420px] rounded-[48px] border-4 border-white shadow-2xl relative z-10"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/* SECTION: SIGNATURE COURSES - Minimalist and extremely clean */}
        <View className="py-20 px-6 lg:px-20 bg-white">
          <View className="max-w-[1280px] mx-auto">
            <View className="items-center mb-16">
              <Text className="text-xs font-black text-[#005C42] uppercase tracking-widest">Our Programs</Text>
              <Text className="text-3xl lg:text-4xl font-extrabold text-[#1E1E1E] tracking-tight mt-3 text-center">
                Explore Signature IELTS Courses
              </Text>
              <Text className="text-sm text-[#6B7280] mt-4 max-w-[600px] text-center leading-6">
                Meticulously crafted learning pathways utilizing modern visual aids, smart spacing, and clean layouts to enhance absorption.
              </Text>
            </View>
            {/* Course Cards Grid */}
            <View className="flex-row flex-wrap justify-between gap-6">
              {/* Course 1: IELTS Academic */}
              <View className="flex-1 min-w-[300px] bg-[#FAFAFA] rounded-[32px] border border-[#E5E7EB] p-8 hover:border-[#00CC99]/30 transition-all shadow-xs relative overflow-hidden">
                <View className="absolute top-0 right-0 w-24 h-24 bg-[#E6F9F5] rounded-bl-[48px] items-center justify-center">
                  <Text className="text-2xl">🎓</Text>
                </View>
                <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-6">
                  <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-wider">Most Popular</Text>
                </View>
                <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight mb-3">IELTS Academic</Text>
                <Text className="text-sm text-[#6B7280] mb-8 leading-6 min-h-[72px]">
                  Engineered for students applying to higher education or professional registration globally. Covers master-level reading & analytical writing.
                </Text>
                <View className="flex-row items-center justify-between pt-6 border-t border-[#E5E7EB]">
                  <View>
                    <Text className="text-xs text-[#9CA3AF] font-bold uppercase tracking-wider">Band Target</Text>
                    <Text className="text-lg font-black text-[#1E1E1E]">7.5 - 8.5</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
                    className="bg-[#00CC99] px-5 py-3 rounded-xl active:opacity-90"
                  >
                    <Text className="text-white text-xs font-bold">Enroll Now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Course 2: General Training */}
              <View className="flex-1 min-w-[300px] bg-[#FAFAFA] rounded-[32px] border border-[#E5E7EB] p-8 hover:border-[#005C42]/30 transition-all shadow-xs relative overflow-hidden">
                <View className="absolute top-0 right-0 w-24 h-24 bg-[#E6F9F5] rounded-bl-[48px] items-center justify-center">
                  <Text className="text-2xl">💼</Text>
                </View>
                <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-6">
                  <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-wider">Global Migration</Text>
                </View>
                <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight mb-3">General Training</Text>
                <Text className="text-sm text-[#6B7280] mb-8 leading-6 min-h-[72px]">
                  Tailored for immigration, secondary education, or international work experience. Focuses on practical daily-life survival language skills.
                </Text>
                <View className="flex-row items-center justify-between pt-6 border-t border-[#E5E7EB]">
                  <View>
                    <Text className="text-xs text-[#9CA3AF] font-bold uppercase tracking-wider">Band Target</Text>
                    <Text className="text-lg font-black text-[#1E1E1E]">6.5 - 7.5</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
                    className="bg-[#005C42] px-5 py-3 rounded-xl active:opacity-90"
                  >
                    <Text className="text-white text-xs font-bold">Enroll Now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Course 3: Speaking Masterclass */}
              <View className="flex-1 min-w-[300px] bg-[#FAFAFA] rounded-[32px] border border-[#E5E7EB] p-8 hover:border-[#F97316]/30 transition-all shadow-xs relative overflow-hidden">
                <View className="absolute top-0 right-0 w-24 h-24 bg-[#FFF7ED] rounded-bl-[48px] items-center justify-center">
                  <Text className="text-2xl">🎙️</Text>
                </View>
                <View className="bg-[#FFF7ED] px-3.5 py-1 rounded-full self-start mb-6">
                  <Text className="text-[#F97316] text-[10px] font-extrabold uppercase tracking-wider">Advanced Speaking</Text>
                </View>
                <Text className="text-2xl font-bold text-[#1E1E1E] tracking-tight mb-3">Speaking Masterclass</Text>
                <Text className="text-sm text-[#6B7280] mb-8 leading-6 min-h-[72px]">
                  Intensive phonetic alignment & natural fluency practice. Dominate IELTS parts 1-3 with premium confidence and cohesive structure techniques.
                </Text>
                <View className="flex-row items-center justify-between pt-6 border-t border-[#E5E7EB]">
                  <View>
                    <Text className="text-xs text-[#9CA3AF] font-bold uppercase tracking-wider">Band Target</Text>
                    <Text className="text-lg font-black text-[#1E1E1E]">8.0 - 9.0</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Exam', { testType: 'Listening' })}
                    className="bg-[#1E1E1E] px-5 py-3 rounded-xl active:opacity-90"
                  >
                    <Text className="text-white text-xs font-bold">Enroll Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION: ACADEMIC DASHBOARD INTEGRATION - High-fidelity features */}
        <View className="py-16 px-6 lg:px-20">
          <View className="max-w-[1280px] mx-auto">
            <View className="flex-row justify-between items-center mb-10">
              <View>
                <Text className="text-xs font-black text-[#00CC99] uppercase tracking-widest">Active Workspace</Text>
                <Text className="text-3xl font-extrabold text-[#1E1E1E] tracking-tight mt-2">Your Live Diagnostics</Text>
              </View>
              <View className="bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-full shadow-xs">
                <Text className="text-xs font-extrabold text-[#6B7280]">Updated 2 min ago</Text>
              </View>
            </View>

            <View className="flex-col lg:flex-row gap-6 items-start">
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
                      <View className={`w-7.5 ${item.height} bg-gradient-to-t from-[#A7F3D0] to-[#00CC99] rounded-t-xl mb-2`} />
                      <Text className="text-[10px] font-bold text-[#9CA3AF]">{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Dashboard Right: Quick Stats & Subscriptions */}
              <View className="w-full lg:flex-[1.2] space-y-6">
                {/* Skill Power */}
                <View className="bg-gradient-to-r from-[#005C42] to-[#00CC99] p-6 rounded-[28px] flex-row justify-between items-center shadow-md shadow-emerald-500/10">
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
                    onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
                    className="bg-[#1E1E1E] py-4 rounded-[16px] items-center active:opacity-90"
                  >
                    <Text className="text-white text-sm font-bold">Start Free Mock Now</Text>
                  </TouchableOpacity>
                </View>

                {/* Real-time Socket Diagnostics Card */}
                <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-xs relative overflow-hidden">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="bg-[#F0FDF4] px-3.5 py-1 rounded-full border border-[#DCFCE7] flex-row items-center">
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: isConnected ? '#00CC99' : '#EF4444', marginRight: 6 }} />
                      <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">
                        {isConnected ? 'SOCKET ACTIVE' : 'SOCKET OFFLINE'}
                      </Text>
                    </View>
                    {socketId && (
                      <Text className="text-[10px] text-gray-400 font-mono">
                        ID: {socketId.substring(0, 8)}...
                      </Text>
                    )}
                  </View>

                  <Text className="text-xl font-bold text-[#1E1E1E] mb-2 tracking-tight">
                    Real-time Gateway
                  </Text>
                  
                  <Text className="text-sm text-[#6B7280] mb-6 leading-6">
                    {isConnected 
                      ? 'The real-time bidirectional messaging pipeline is active. You can now execute heartbeats or check network latency.'
                      : 'Real-time gateway is currently disconnected. Sign in or refresh the page to restore real-time communications.'}
                  </Text>

                  {isConnected && (
                    <View className="mb-6 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6]">
                      <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Server Diagnostic Response</Text>
                      {pingResponse ? (
                        <View className="space-y-1">
                          <Text className="text-xs text-emerald-600 font-semibold">✓ Connected - Message: "{pingResponse.message}"</Text>
                          <Text className="text-[10px] text-gray-400 font-mono">Received: {new Date(pingResponse.timestamp).toLocaleTimeString()}</Text>
                        </View>
                      ) : (
                        <Text className="text-xs text-gray-400 italic">No heartbeats sent yet. Press "Test Socket Latency" below.</Text>
                      )}
                    </View>
                  )}

                  <TouchableOpacity 
                    onPress={() => isConnected ? sendPing({ text: 'Apex IELTS Heartbeat Check' }) : null}
                    disabled={!isConnected}
                    className={`py-4 rounded-[16px] items-center ${isConnected ? 'bg-[#00CC99] active:opacity-90' : 'bg-gray-200'}`}
                  >
                    <Text className={`text-sm font-bold ${isConnected ? 'text-[#005C42]' : 'text-gray-400'}`}>
                      {isConnected ? 'Test Socket Latency' : 'Connection Inactive'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Current Skills Grid */}
            <Text className="text-xl font-bold text-[#1E1E1E] mt-16 mb-6 tracking-tight">Practice by Skill Domain</Text>
            <View className="flex-row flex-wrap justify-between gap-4 mb-8">
              {/* Reading Card */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
                className="w-[48%] lg:w-[23%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs"
              >
                <View className="w-10 h-10 bg-[#E6F9F5] rounded-full items-center justify-center mb-3">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2">
                    <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Reading</Text>
                <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-1 mb-3">7.5</Text>
                <View className="w-full h-1.5 bg-[#F7F9FA] rounded-full overflow-hidden">
                  <View className="w-[75%] h-full bg-[#00CC99] rounded-full" />
                </View>
              </TouchableOpacity>

              {/* Writing Card */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Practice', { screen: 'WritingSubmit' })}
                className="w-[48%] lg:w-[23%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs"
              >
                <View className="w-10 h-10 bg-[#E6F9F5] rounded-full items-center justify-center mb-3">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#005C42" strokeWidth="2">
                    <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Writing</Text>
                <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-1 mb-3">6.5</Text>
                <View className="w-full h-1.5 bg-[#F7F9FA] rounded-full overflow-hidden">
                  <View className="w-[65%] h-full bg-[#005C42] rounded-full" />
                </View>
              </TouchableOpacity>

              {/* Listening Card */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Exam', { testType: 'Listening' })}
                className="w-[48%] lg:w-[23%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs"
              >
                <View className="w-10 h-10 bg-[#E6F9F5] rounded-full items-center justify-center mb-3">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2">
                    <Path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Listening</Text>
                <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-1 mb-3">8.5</Text>
                <View className="w-full h-1.5 bg-[#F7F9FA] rounded-full overflow-hidden">
                  <View className="w-[85%] h-full bg-[#00CC99] rounded-full" />
                </View>
              </TouchableOpacity>

              {/* Speaking Card */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('Practice', { screen: 'SpeakingSubmit' })}
                className="w-[48%] lg:w-[23%] bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-xs"
              >
                <View className="w-10 h-10 bg-[#FFF7ED] rounded-full items-center justify-center mb-3">
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2">
                    <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                  </Svg>
                </View>
                <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Speaking</Text>
                <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-1 mb-3">7.0</Text>
                <View className="w-full h-1.5 bg-[#F7F9FA] rounded-full overflow-hidden">
                  <View className="w-[70%] h-full bg-[#F97316] rounded-full" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Premium Minimal Bottom Tab Bar */}
      <View className="h-20 bg-white border-t border-[#E5E7EB] flex-row justify-around items-center px-4">
        <TouchableOpacity className="items-center py-2 flex-1">
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
            <Rect x="3" y="3" width="7" height="9" rx="1" />
            <Rect x="14" y="3" width="7" height="5" rx="1" />
            <Rect x="14" y="12" width="7" height="9" rx="1" />
            <Rect x="3" y="16" width="7" height="5" rx="1" />
          </Svg>
          <Text className="text-[10px] font-extrabold text-[#00CC99] mt-1">Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Practice')}
          className="items-center py-2 flex-1"
        >
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </Svg>
          <Text className="text-[10px] font-bold text-[#6B7280] mt-1">Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center py-2 flex-1">
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </Svg>
          <Text className="text-[10px] font-bold text-[#6B7280] mt-1">Mentors</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')}
          className="items-center py-2 flex-1"
        >
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </Svg>
          <Text className="text-[10px] font-bold text-[#6B7280] mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
