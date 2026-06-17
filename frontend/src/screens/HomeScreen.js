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

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const isWeb = Platform.OS === 'web';
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setIsAuthModalVisible(false);
    }
  }, [user]);

  const handleProtectedNav = (screen, params = {}) => {
    if (!user) {
      setIsAuthModalVisible(true);
    } else {
      navigation.navigate(screen, params);
    }
  };

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const userDisplayName = user?.fullName || 'IELTS Learner';
  const userEmail = user?.email || 'user@sdn.com';

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
      <View className="flex-row items-center justify-between px-5 h-16 bg-white border-b border-[#E5E7EB] z-40">
        {/* Logo */}
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-[#E6F9F5] rounded-2xl items-center justify-center border border-[#A7F3D0]">
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#00CC99" />
              <Path d="M6 12.5V17c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.5l-6 3-6-3z" fill="#005C42" />
              <Path d="M21.5 10v5.5" stroke="#00CC99" strokeWidth="1.5" strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="text-xl font-black text-[#1E1E1E] ml-2.5 tracking-tight">
            Apex IELTS
          </Text>
        </View>

        {/* Right Side */}
        <View className="flex-row items-center">
          {/* Notification */}
          <TouchableOpacity className="w-10 h-10 rounded-full border border-[#E5E7EB] items-center justify-center bg-[#F9FAFB] mr-3">
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
          </TouchableOpacity>

          {/* Avatar or Login Button */}
          {!user ? (
            <TouchableOpacity onPress={() => setIsAuthModalVisible(true)} className="bg-[#00CC99] px-4 py-2 rounded-xl active:opacity-90">
              <Text className="text-white text-xs font-bold">Log in</Text>
            </TouchableOpacity>
          ) : (
            <View className="relative">
              <TouchableOpacity onPress={toggleUserMenu} className="w-10 h-10 rounded-full bg-[#00CC99] items-center justify-center border-2 border-white shadow-sm">
                <Text className="text-white font-bold text-base">{userInitial}</Text>
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {isUserMenuVisible && (
                <Animated.View style={menuAnimatedStyle} className="absolute right-0 top-14 w-64 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl z-50 overflow-hidden">
                  <View className="p-4 border-b border-[#F3F4F6] bg-[#FAFAFA]">
                    <Text numberOfLines={1} className="text-sm font-bold text-[#111827]">{userDisplayName}</Text>
                    <Text numberOfLines={1} className="text-xs text-[#6B7280] mt-0.5">{userEmail}</Text>
                  </View>

                  <TouchableOpacity onPress={handleProfilePress} className="flex-row items-center px-4 py-3.5">
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2">
                      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <Circle cx="12" cy="7" r="4" />
                    </Svg>
                    <Text className="ml-3 text-sm font-semibold text-[#4B5563]">My Profile</Text>
                  </TouchableOpacity>

                  {user?.role === 'ADMIN' && (
                    <TouchableOpacity onPress={() => { toggleUserMenu(false); setTimeout(() => navigation.navigate('Admin'), 150); }} className="flex-row items-center px-4 py-3.5 bg-[#F0FDF4]">
                      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2">
                        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </Svg>
                      <Text className="ml-3 text-sm font-bold text-[#005C42]">Admin Portal</Text>
                    </TouchableOpacity>
                  )}

                  <View className="h-px bg-[#F3F4F6]" />

                  <TouchableOpacity onPress={handleLogoutPress} className="flex-row items-center px-4 py-3.5">
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <Path d="M16 17l5-5-5-5" />
                      <Path d="M21 12H9" />
                    </Svg>
                    <Text className="ml-3 text-sm font-semibold text-[#EF4444]">Logout</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          )}
        </View>
      </View>

      {isUserMenuVisible && (
        <Pressable className="absolute inset-0 z-30" onPress={() => toggleUserMenu(false)} />
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
              </Text>
              <View className="flex-row items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <View>
                  <Text className="text-[10px] text-[#9CA3AF] font-bold uppercase">Target</Text>
                  <Text className="text-base font-black text-[#1E1E1E]">7.5 - 8.5</Text>
                </View>
                <TouchableOpacity onPress={() => handleProtectedNav('Practice')} className="bg-[#00CC99] px-4 py-2.5 rounded-xl active:opacity-90">
                  <Text className="text-white text-xs font-bold">Enroll</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Course 2: General Training */}
            <View style={{ width: width * 0.75 }} className="bg-[#FAFAFA] rounded-[28px] border border-[#E5E7EB] p-6 shadow-sm overflow-hidden">
              <View className="bg-[#E6F9F5] px-3 py-1 rounded-full self-start mb-4">
                <Text className="text-[#005C42] text-[9px] font-extrabold uppercase">Global Migration</Text>
              </View>
              <Text className="text-xl font-bold text-[#1E1E1E] tracking-tight mb-2">General Training</Text>
              <Text className="text-xs text-[#6B7280] mb-6 leading-5" numberOfLines={3}>
                Tailored for immigration, secondary education, or international work experience. Focuses on survival skills.
              </Text>
              <View className="flex-row items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <View>
                  <Text className="text-[10px] text-[#9CA3AF] font-bold uppercase">Target</Text>
                  <Text className="text-base font-black text-[#1E1E1E]">6.5 - 7.5</Text>
                </View>
                <TouchableOpacity onPress={() => handleProtectedNav('Practice')} className="bg-[#005C42] px-4 py-2.5 rounded-xl active:opacity-90">
                  <Text className="text-white text-xs font-bold">Enroll</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* SECTION: ACADEMIC DASHBOARD */}
        <View className="py-10 px-5">
          <View className="mb-6">
            <Text className="text-[10px] font-black text-[#00CC99] uppercase tracking-widest">Workspace</Text>
            <Text className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight mt-1">Live Diagnostics</Text>
          </View>

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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>


      {/* Auth Modal Popup */}
      <AuthModal visible={isAuthModalVisible} onClose={() => setIsAuthModalVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;
