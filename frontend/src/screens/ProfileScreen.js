import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, LinearGradient, Stop, Defs } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuthStore();
  const screenWidth = Dimensions.get('window').width;

  const currentEst = 6.5;
  const targetScore = 8.0;
  const progressPercent = (currentEst / targetScore) * 100;

  const skillsData = [
    { name: 'Listening', score: 7.0, target: 8.5, icon: '🎧' },
    { name: 'Reading', score: 7.5, target: 8.0, icon: '📖' },
    { name: 'Writing (AI)', score: 5.5, target: 7.5, icon: '✍️', warning: true },
    { name: 'Speaking (AI)', score: 6.0, target: 7.5, icon: '🗣️' }
  ];

  // Tính góc xoay cho vòng tròn tiến trình (IELTS tối đa là 9.0)
  const radius = 22;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const progressStrokeDashoffset = circumference - (currentEst / 9.0) * circumference;
  const targetStrokeDashoffset = circumference - (targetScore / 9.0) * circumference;

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8FA]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 1. PREMIUM HEADER BANNER - Gradient & Glassmorphism Card */}
        <View className="relative w-full h-[180px] bg-slate-900 overflow-hidden">
          {/* Futuristic Glowing Circles in Background */}
          <View className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-[#00CC99]/20 blur-2xl" />
          <View className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#005C42]/40 blur-3xl" />
          
          {/* Main Gradient Background */}
          <Svg width="100%" height="100%" className="absolute inset-0">
            <Defs>
              <LinearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00CC99" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#005C42" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#headerGrad)" />
          </Svg>

          {/* Decorative Grid Pattern for Tech Vibe */}
          <Svg width="100%" height="100%" className="absolute inset-0 opacity-15">
            <Path d="M 0,20 L 400,20 M 0,60 L 400,60 M 0,100 L 400,100 M 0,140 L 400,140" stroke="#FFFFFF" strokeWidth="1" />
            <Path d="M 50,0 L 50,180 M 150,0 L 150,180 M 250,0 L 250,180 M 350,0 L 350,180" stroke="#FFFFFF" strokeWidth="1" />
          </Svg>

          {/* User Name & Details on Top of Banner */}
          <View className="absolute bottom-6 left-5 right-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* Avatar circle with glow border */}
              <View className="relative shadow-lg shadow-[#00CC99]/30">
                <View className="w-14 h-14 rounded-full bg-white border-2 border-[#00CC99] items-center justify-center">
                  <Text className="text-xl font-black text-[#005C42]">S</Text>
                </View>
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00CC99] rounded-full border-2 border-white" />
              </View>
              
              <View className="ml-4 justify-center">
                <View className="flex-row items-center">
                  <Text className="text-lg font-black text-white tracking-tight mr-2 shadow-xs">SDN Admin</Text>
                  {/* Golden Glowing Badge */}
                  <View className="bg-amber-400 px-2 py-0.5 rounded-full border border-amber-300 shadow-xs">
                    <Text className="text-[#1E1E1E] text-[7.5px] font-black uppercase tracking-widest">★ PRO</Text>
                  </View>
                </View>
                <Text className="text-xs text-white/80 font-medium mt-0.5">admin@sdn.com</Text>
              </View>
            </View>

            {/* AI Assistant Status */}
            <View className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl items-center justify-center">
              <Text className="text-[9px] font-bold text-white uppercase tracking-wider">AI Connected</Text>
              <Text className="text-[8px] text-[#00CC99] font-black uppercase tracking-widest mt-0.5">ONLINE</Text>
            </View>
          </View>
        </View>

        {/* Outer Padding Container for Strict Mobile Portrait Layout */}
        <View className="px-4 pt-4 pb-28 space-y-4">

          {/* 2. FUTURISTIC TARGET CARD - Radial Progress Chart (Circular SVG) */}
          <View className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-sm relative overflow-hidden">
            {/* Ambient Background Glow */}
            <View className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-[#00CC99]/5 blur-2xl" />

            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center mb-1">
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5" className="mr-1.5">
                    <Circle cx="12" cy="12" r="10" />
                    <Circle cx="12" cy="12" r="2" />
                  </Svg>
                  <Text className="text-xs font-bold text-[#1A202C]">Mục tiêu IELTS Lộ Trình</Text>
                </View>
                <Text className="text-xs text-[#718096] leading-relaxed">
                  Lộ trình học AI ước lượng năng lực hiện tại của bạn đang tiến triển tốt về phía mục tiêu.
                </Text>
                
                {/* Stats horizontally grouped inside target card */}
                <View className="flex-row space-x-4 mt-3">
                  <View>
                    <Text className="text-[9px] font-bold text-[#718096] uppercase">Hiện tại</Text>
                    <Text className="text-sm font-black text-[#718096]">Band {currentEst.toFixed(1)}</Text>
                  </View>
                  <View className="border-l border-[#E2E8F0] pl-4">
                    <Text className="text-[9px] font-bold text-[#00CC99] uppercase">Mục tiêu</Text>
                    <Text className="text-sm font-black text-[#00CC99]">Band {targetScore.toFixed(1)}</Text>
                  </View>
                </View>
              </View>

              {/* Radial Progress Display (Beautiful SVG circles overlay) */}
              <View className="items-center justify-center relative w-16 h-16 ml-2">
                <Svg width="60" height="60" className="rotate-[-90deg]">
                  {/* Track Circle */}
                  <Circle cx="30" cy="30" r={radius} fill="transparent" stroke="#F1F5F9" strokeWidth={strokeWidth} />
                  {/* Target Goal Progress Ring (translucent) */}
                  <Circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke="#005C42"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={targetStrokeDashoffset}
                    strokeOpacity={0.2}
                  />
                  {/* Current Estimated Ring */}
                  <Circle
                    cx="30"
                    cy="30"
                    r={radius}
                    fill="transparent"
                    stroke="#00CC99"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={progressStrokeDashoffset}
                    strokeLinecap="round"
                  />
                </Svg>
                <View className="absolute inset-0 items-center justify-center">
                  <Text className="text-xs font-black text-[#1A202C]">{currentEst.toFixed(1)}</Text>
                  <Text className="text-[7px] font-bold text-[#718096] uppercase mt-0.5">Est</Text>
                </View>
              </View>
            </View>

            {/* Glowing Thick Progress Bar tracking goals */}
            <View className="w-full mt-4 pt-3.5 border-t border-[#F1F5F9]">
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-[9px] font-bold text-[#718096] uppercase tracking-wider">Tiến trình đạt mục tiêu</Text>
                <Text className="text-[9px] font-black text-[#00CC99]">{progressPercent.toFixed(0)}% hoàn thành</Text>
              </View>
              <View className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <View className="h-full bg-gradient-to-r from-[#00CC99] to-[#005C42] rounded-full" style={{ width: `${progressPercent}%` }} />
              </View>
            </View>
          </View>

          {/* 3. SKILL DISCOVER & DETAILED BREAKDOWN - Aesthetic Sliders */}
          <View className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-sm">
            <Text className="text-xs font-bold text-[#1A202C] mb-3.5 tracking-tight">AI Skill Diagnostic Metrics</Text>
            
            <View className="space-y-4">
              {skillsData.map((skill, idx) => {
                const percent = (skill.score / 9.0) * 100;
                return (
                  <View key={idx} className="space-y-1.5">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 rounded-md bg-[#F8FAFC] items-center justify-center border border-[#E2E8F0] mr-2">
                          <Text className="text-xs">{skill.icon}</Text>
                        </View>
                        <Text className="text-xs font-bold text-[#1A202C]">{skill.name}</Text>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <Text className="text-xs font-black text-[#00CC99]">{skill.score.toFixed(1)}</Text>
                        <Text className="text-[9px] text-[#718096]">/ {skill.target.toFixed(1)}</Text>
                      </View>
                    </View>
                    
                    <View className="w-full h-2.5 bg-[#F1F5F9] rounded-full p-[2px]">
                      <View 
                        className={`h-full rounded-full ${skill.warning ? 'bg-gradient-to-r from-orange-400 to-amber-500' : 'bg-gradient-to-r from-[#00CC99] to-[#008F6B]'}`} 
                        style={{ width: `${percent}%` }} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 4. UPCOMING MENTOR BOOKING - Elegant "Ticket Pass" Aesthetic */}
          <View className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-sm overflow-hidden relative">
            {/* Cutout details on the left & right borders to look like a ticket */}
            <View className="absolute left-[-6px] top-[50%] w-3 h-6 rounded-r-full bg-[#F6F8FA] border border-[#E2E8F0] z-10" />
            <View className="absolute right-[-6px] top-[50%] w-3 h-6 rounded-l-full bg-[#F6F8FA] border border-[#E2E8F0] z-10" />

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-[#1A202C]">Lớp Học Đặt Lịch Mentor</Text>
                <View className="ml-2 w-2 h-2 rounded-full bg-[#00CC99] animate-pulse" />
              </View>
              <View className="bg-[#E6FFFA] px-2.5 py-0.5 rounded-full border border-[#00CC99]/30">
                <Text className="text-[#00CC99] text-[7.5px] font-black uppercase tracking-wider">CONFIRMED MOCK</Text>
              </View>
            </View>

            <View className="bg-gradient-to-br from-[#F8FAFC] to-white border border-[#E2E8F0] rounded-xl p-3.5 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white border border-[#00CC99]/30 items-center justify-center mr-3 shadow-xs">
                <Text className="text-lg">👨‍🏫</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#1A202C]">Aiden Nguyen (IELTS 8.5)</Text>
                <Text className="text-[9px] text-[#718096] mt-0.5">Speaking Diagnostics • Room 102</Text>
                <View className="flex-row items-center mt-1.5">
                  <View className="bg-[#00CC99]/10 px-1.5 py-0.5 rounded">
                    <Text className="text-[9px] font-bold text-[#00CC99]">Thứ Ba, 26/05 • 14:00 - 15:00</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 5. DIAGNOSTICS & TIME STATS - Glow Boxes with Growth Indicator */}
          <View className="flex-row justify-between space-x-2.5">
            {[
              {
                val: "12 bài",
                lbl: "AI GRADING",
                growth: "Writing & Speak",
                icon: (
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                    <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </Svg>
                )
              },
              {
                val: "34h",
                lbl: "TÍCH LŨY",
                growth: "+4h tuần này",
                growColor: 'text-[#00CC99]',
                icon: (
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                    <Circle cx="12" cy="12" r="10" />
                    <Path d="M12 6v6l4 2" />
                  </Svg>
                )
              },
              {
                val: "3 buổi",
                lbl: "MENTORS",
                growth: "Đặt phòng thi",
                icon: (
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <Circle cx="9" cy="7" r="4" />
                  </Svg>
                )
              }
            ].map((box, i) => (
              <View 
                key={i} 
                className="flex-1 h-[105px] bg-white rounded-2xl border border-[#E2E8F0] items-center justify-center p-2.5 shadow-xs relative overflow-hidden"
              >
                {/* Thin top accent bar */}
                <View className="absolute top-0 left-0 right-0 h-[3px] bg-[#E6FFFA]" />
                
                <View className="w-7 h-7 rounded-lg bg-[#E6FFFA] items-center justify-center mb-1 shadow-2xs">
                  {box.icon}
                </View>
                <Text className="text-sm font-black text-[#1A202C] tracking-tight">{box.val}</Text>
                <Text className="text-[8px] font-bold text-[#718096] tracking-wider uppercase mt-0.5">{box.lbl}</Text>
                <Text className={`text-[7.5px] font-semibold mt-1 ${box.growColor ? box.growColor : 'text-[#9CA3AF]'}`}>{box.growth}</Text>
              </View>
            ))}
          </View>

          {/* 6. WEEKLY PROGRESS TREND - Elegant SVG Area Chart */}
          <View className="bg-white rounded-2xl border border-[#E2E8F0] p-4.5 shadow-sm">
            <Text className="text-xs font-bold text-[#1A202C] mb-3">Biểu Đồ Theo Dõi Năng Lực (4 tuần qua)</Text>
            
            <View className="items-center py-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/40 overflow-hidden">
              <Svg width="290" height="95" viewBox="0 0 290 95">
                <Defs>
                  {/* Elegant Fade Gradient for Area Chart */}
                  <LinearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#00CC99" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#00CC99" stopOpacity="0" />
                  </LinearGradient>
                </Defs>

                {/* Horizontal dotted grid lines */}
                <Path d="M10 10 H280 M10 40 H280 M10 70 H280" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                
                {/* Area Fill under the line */}
                <Path
                  d="M20 70 L 100 50 L 180 40 L 260 20 L 260 90 L 20 90 Z"
                  fill="url(#chartAreaGrad)"
                />

                {/* The main stroke line */}
                <Polyline
                  fill="none"
                  stroke="#00CC99"
                  strokeWidth="3.5"
                  points="20,70 100,50 180,40 260,20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Glowing Data Circles */}
                <Circle cx="20" cy="70" r="4.5" fill="#00CC99" stroke="white" strokeWidth="2" />
                <Circle cx="100" cy="50" r="4.5" fill="#00CC99" stroke="white" strokeWidth="2" />
                <Circle cx="180" cy="40" r="4.5" fill="#00CC99" stroke="white" strokeWidth="2" />
                <Circle cx="260" cy="20" r="4.5" fill="#00CC99" stroke="white" strokeWidth="2" />
              </Svg>

              <View className="flex-row justify-between w-full px-4 mt-2.5">
                <Text className="text-[9px] font-bold text-[#718096]">Tuần 1: 5.5</Text>
                <Text className="text-[9px] font-bold text-[#718096]">Tuần 2: 6.0</Text>
                <Text className="text-[9px] font-bold text-[#718096]">Tuần 3: 6.2</Text>
                <Text className="text-[9px] font-bold text-[#00CC99]">Tuần 4: 6.5</Text>
              </View>
            </View>
          </View>

          {/* 7. SETTINGS MENU LIST - Clean borderless cells, Tap height 56px */}
          <View>
            <Text className="text-[9px] font-bold text-[#718096] uppercase tracking-wider mb-1.5 ml-1">
              Cài đặt tài khoản
            </Text>
            
            <View className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              {[
                { 
                  title: 'Thông tin cá nhân', 
                  subtitle: 'Tên, mật khẩu & bảo mật hai lớp', 
                  badge: null,
                  icon: (
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
                      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <Circle cx="12" cy="7" r="4" />
                    </Svg>
                  ) 
                },
                { 
                  title: 'Lịch sử học tập & Chấm AI', 
                  subtitle: 'Phân tích phản hồi Writing & Speaking', 
                  badge: '2 bài mới',
                  badgeColor: 'bg-rose-500 text-white',
                  icon: (
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
                      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                    </Svg>
                  ) 
                },
                { 
                  title: 'Lịch hẹn Mentor (Room Booking)', 
                  subtitle: 'Xem & đổi lịch phòng học, Mentor', 
                  badge: '1 Sắp tới',
                  badgeColor: 'bg-[#E6FFFA] text-[#00CC99] border border-[#00CC99]/20',
                  icon: (
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
                      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <Path d="M16 2v4M8 2v4M3 10h18" />
                    </Svg>
                  ) 
                },
                { 
                  title: 'Gói thành viên (Premium)', 
                  subtitle: 'Quản lý hạn dùng, gia hạn tài khoản', 
                  badge: 'Hoạt động',
                  badgeColor: 'bg-amber-100 text-amber-600 border border-amber-300',
                  icon: (
                    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
                      <Rect x="2" y="5" width="20" height="14" rx="2" />
                      <Path d="M2 10h20" />
                    </Svg>
                  ) 
                }
              ].map((item, idx, arr) => (
                <TouchableOpacity 
                  key={idx}
                  // Clean cell line, height 56px (h-14)
                  className={`flex-row items-center justify-between px-4 h-14 active:opacity-75 ${
                    idx !== arr.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                  }`}
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-8 h-8 rounded-lg bg-[#F8FAFC] items-center justify-center border border-[#E2E8F0] mr-2.5">
                      {item.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-[#1A202C]" numberOfLines={1}>{item.title}</Text>
                      <Text className="text-[9.5px] text-[#718096] mt-0.5" numberOfLines={1}>{item.subtitle}</Text>
                    </View>
                  </View>
                  
                  {/* Dynamic side badges */}
                  {item.badge && (
                    <View className={`px-2 py-0.5 rounded mr-2 ${item.badgeColor}`}>
                      <Text className="text-[7.5px] font-black uppercase tracking-wider">{item.badge}</Text>
                    </View>
                  )}

                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
                    <Path d="M9 5l7 7-7 7" />
                  </Svg>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 8. MOBILE PRIMARY BUTTONS */}
          <View className="space-y-2.5 pt-1.5">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')}
              className="bg-[#1A202C] h-12 rounded-xl items-center justify-center active:opacity-90 shadow-sm"
            >
              <Text className="text-white text-xs font-bold tracking-widest uppercase">Quay lại Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={logout}
              className="bg-[#FEF2F2] border border-[#FCA5A5]/30 h-12 rounded-xl items-center justify-center active:opacity-80"
            >
              <Text className="text-red-600 text-xs font-bold tracking-widest uppercase">Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* 9. BOTTOM NAVIGATION BAR - Highlighted active Profile (Mint Green) */}
      <View className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#E2E8F0] flex-row justify-around items-center px-2">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="items-center py-2 flex-1"
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
            <Rect x="3" y="3" width="7" height="9" rx="1" />
            <Rect x="14" y="3" width="7" height="5" rx="1" />
            <Rect x="14" y="12" width="7" height="9" rx="1" />
            <Rect x="3" y="16" width="7" height="5" rx="1" />
          </Svg>
          <Text className="text-[8px] font-bold text-[#718096] mt-1 uppercase tracking-wider">Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Practice')}
          className="items-center py-2 flex-1"
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
            <Path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </Svg>
          <Text className="text-[8px] font-bold text-[#718096] mt-1 uppercase tracking-wider">Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center py-2 flex-1">
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2.5">
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </Svg>
          <Text className="text-[8px] font-bold text-[#718096] mt-1 uppercase tracking-wider">Mentors</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center py-2 flex-1">
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </Svg>
          <Text className="text-[8px] font-bold text-[#00CC99] mt-1 uppercase tracking-wider">Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
