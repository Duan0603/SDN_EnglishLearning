import React, { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import useAuthStore from '../store/useAuthStore';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const profileName = user?.fullName || user?.name || 'Nguyễn Minh Anh';
  const profileEmail = user?.email || 'minhanh@gmail.com';
  const profilePhone = user?.phone || '0912 345 678';
  const profileBirthDate = user?.dateOfBirth || user?.birthday || '15/08/2002';
  const profileCountry = user?.country || 'Việt Nam';
  const profileCity = user?.city || 'Hà Nội';
  const profileTrack = user?.role || 'IELTS Academic';

  const [activeTab, setActiveTab] = useState('settings');
  const [form, setForm] = useState({
    fullName: profileName,
    email: profileEmail,
    phone: profilePhone,
    birthDate: profileBirthDate,
    country: profileCountry,
    city: profileCity,
  });

  const initials = useMemo(() => {
    const parts = profileName.trim().split(/\s+/).filter(Boolean);
    const selected = parts.length >= 2 ? parts.slice(-2) : parts.slice(0, 2);
    return selected.map((part) => part[0]?.toUpperCase()).join('') || 'MA';
  }, [profileName]);

  const stats = [
    { icon: '🔥', value: '42 ngày', label: 'Chuỗi học', color: '#F97316' },
    { icon: '📘', value: '34 bài', label: 'Đã thi thử', color: '#6366F1' },
    { icon: '💬', value: '28 phản hồi', label: 'AI Feedback', color: '#10B981' },
    { icon: '⭐', value: '3 huy hiệu', label: 'Thành tích', color: '#F59E0B' },
  ];

  const tabs = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'achievements', label: 'Thành tích' },
    { key: 'settings', label: 'Cài đặt' },
  ];

  const handleSave = () => {
    Alert.alert('Đã lưu', 'Thông tin cá nhân của bạn đã được cập nhật.');
  };

  const InputField = ({ label, value, onChangeText, keyboardType = 'default', autoCapitalize = 'sentences' }) => (
    <View className={isDesktop ? 'w-[48.5%] mb-5' : 'w-full mb-5'}>
      <Text className="mb-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[#7A8BA3]">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#94A3B8"
        className="h-[56px] rounded-[18px] border border-[#D8E0EA] bg-[#EDF2F7] px-4 text-[16px] text-[#111827]"
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FB]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingVertical: 18 }}>
        <View className="mx-auto w-full max-w-[1400px] px-4 pb-8 md:px-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ zIndex: 50, elevation: 8 }}
            className="mb-4 self-start flex-row items-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2 shadow-lg"
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
              <Path d="M15 18l-6-6 6-6" />
            </Svg>
            <Text className="text-[14px] font-semibold text-[#0F172A]">Back về Home</Text>
          </TouchableOpacity>

          <View className="overflow-hidden rounded-[28px] border border-[#E4EAF2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <View className="relative h-[210px] overflow-hidden">
              <Svg width="100%" height="100%" className="absolute inset-0">
                <Defs>
                  <LinearGradient id="profileHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#A2E8D0" stopOpacity="1" />
                    <Stop offset="55%" stopColor="#B8D8F4" stopOpacity="1" />
                    <Stop offset="100%" stopColor="#B9B4F7" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#profileHeaderGrad)" />
              </Svg>

              <View className="absolute right-10 top-6 h-20 w-20 rounded-full bg-white/15" />
              <View className="absolute right-16 top-11 h-9 w-9 rounded-full bg-white/10" />

              <View className="absolute bottom-0 left-0 right-0 px-5 pb-5 md:px-6">
                <View className="flex-row items-end justify-between">
                  <View className="flex-row items-end">
                    <View className="relative">
                      <View className="h-[94px] w-[94px] items-center justify-center rounded-[20px] border-[4px] border-white bg-[#0AA67D] shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
                        <Text className="text-[31px] font-semibold tracking-tight text-white">
                          {initials}
                        </Text>
                      </View>
                      <View className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#08C096] shadow-sm">
                        <Text className="text-[13px] text-white">📷</Text>
                      </View>
                    </View>

                    <View className="ml-4 max-w-[520px] pb-2">
                      <Text className="text-[31px] font-extrabold leading-tight text-[#162033]">
                        {profileName}
                      </Text>
                      <View className="mt-1 flex-row flex-wrap items-center">
                        <Text className="text-[16px] text-[#53657F]">{profileEmail}</Text>
                        <Text className="mx-3 text-[#7E8CA1]">•</Text>
                        <View className="rounded-full bg-[#E4FAF3] px-3 py-1">
                          <Text className="text-[14px] font-semibold text-[#0A9C73]">{profileTrack}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="hidden md:flex-row md:items-end md:gap-3">
                    <View className="rounded-[18px] bg-[#E7FBF4]/95 px-6 py-4">
                      <Text className="text-[14px] text-[#6D7D95]">Band hiện tại</Text>
                      <Text className="mt-1 text-[34px] font-semibold leading-none text-[#12B889]">6.75</Text>
                    </View>
                    <View className="rounded-[18px] border-2 border-dashed border-[#B0E8DE] bg-white/75 px-6 py-4">
                      <Text className="text-[14px] text-[#6D7D95]">Mục tiêu</Text>
                      <Text className="mt-1 text-[34px] font-semibold leading-none text-[#151A24]">7.5</Text>
                    </View>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-end gap-3 md:hidden">
                  <View className="rounded-[18px] bg-[#E7FBF4]/95 px-5 py-3">
                    <Text className="text-[12px] text-[#6D7D95]">Band hiện tại</Text>
                    <Text className="mt-1 text-[28px] font-semibold leading-none text-[#12B889]">6.75</Text>
                  </View>
                  <View className="rounded-[18px] border-2 border-dashed border-[#B0E8DE] bg-white/75 px-5 py-3">
                    <Text className="text-[12px] text-[#6D7D95]">Mục tiêu</Text>
                    <Text className="mt-1 text-[28px] font-semibold leading-none text-[#151A24]">7.5</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="border-t border-[#EAF0F5] bg-white px-4 py-5 md:px-6">
              <View className="flex-row flex-wrap justify-between gap-y-5 md:flex-nowrap">
                {stats.map((item) => (
                  <View key={item.label} className="w-1/2 items-center md:w-[24%]">
                    <View className="mb-2 h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFC]">
                      <Text style={{ color: item.color }} className="text-[15px]">
                        {item.icon}
                      </Text>
                    </View>
                    <Text className="text-[19px] font-semibold text-[#1C2432]">{item.value}</Text>
                    <Text className="mt-1 text-[14px] text-[#7A8BA3]">{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-8 rounded-[22px] border border-[#E4EAF2] bg-white p-2 shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
            <View className="flex-row flex-wrap gap-2 md:flex-nowrap">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    className={`h-[46px] flex-1 items-center justify-center rounded-[18px] ${isActive ? 'bg-[#12BC8A]' : 'bg-transparent'}`}
                  >
                    <Text className={`text-[16px] font-medium ${isActive ? 'text-white' : 'text-[#7A8BA3]'}`}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="mt-8 rounded-[24px] border border-[#E4EAF2] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-6">
            <Text className="text-[22px] font-bold text-[#111827]">Thông tin cá nhân</Text>

            <View className="mt-6 flex-row flex-wrap justify-between">
              <InputField
                label="Họ và tên"
                value={form.fullName}
                onChangeText={(value) => setForm((current) => ({ ...current, fullName: value }))}
              />

              <InputField
                label="Email"
                value={form.email}
                onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                label="Số điện thoại"
                value={form.phone}
                onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <InputField
                label="Ngày sinh"
                value={form.birthDate}
                onChangeText={(value) => setForm((current) => ({ ...current, birthDate: value }))}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />

              <InputField
                label="Quốc gia"
                value={form.country}
                onChangeText={(value) => setForm((current) => ({ ...current, country: value }))}
              />

              <InputField
                label="Thành phố"
                value={form.city}
                onChangeText={(value) => setForm((current) => ({ ...current, city: value }))}
              />
            </View>

            <View className="mt-1 flex-row flex-wrap items-center gap-3">
              <TouchableOpacity
                onPress={handleSave}
                className="h-[48px] items-center justify-center rounded-[18px] bg-[#0DBB86] px-7 shadow-sm"
              >
                <Text className="text-[16px] font-semibold text-white">Lưu thay đổi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={logout}
                className="h-[48px] items-center justify-center rounded-[18px] border border-[#F3C7C7] bg-[#FFF5F5] px-6"
              >
                <Text className="text-[16px] font-semibold text-[#D14343]">Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
