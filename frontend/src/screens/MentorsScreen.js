import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import client from '../api/client';
import useAuthStore from '../store/useAuthStore';

const MentorsScreen = ({ navigation }) => {
  const { user } = useAuthStore();

  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  // Mentor detail / timeslots modal
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);

  // Booking details
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Fetch active mentors list
  const fetchMentors = useCallback(async () => {
    setIsLoadingMentors(true);
    try {
      const response = await client.get('/mentors');
      setMentors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách Mentor.');
    } finally {
      setIsLoadingMentors(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  // Fetch available slots for selected mentor
  const fetchMentorSlots = async (mentorId) => {
    setIsLoadingSlots(true);
    try {
      const response = await client.get(`/mentors/${mentorId}/availabilities`);
      setSlots(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch mentor slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleOpenMentorDetail = (mentor) => {
    setSelectedMentor(mentor);
    fetchMentorSlots(mentor.id);
    setShowMentorModal(true);
  };

  const handleOpenBookingModal = (slot) => {
    setSelectedSlotForBooking(slot);
    setBookingNotes('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlotForBooking) return;
    setIsSubmittingBooking(true);
    try {
      await client.post('/bookings', {
        availabilityId: selectedSlotForBooking.id,
        notes: bookingNotes,
      });
      Alert.alert('Thành công', 'Đã đặt lịch hẹn học 1-1 thành công!');
      setShowBookingModal(false);
      
      // Refresh slots on the mentor details screen
      if (selectedMentor) {
        fetchMentorSlots(selectedMentor.id);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        Alert.alert('Trùng lịch', 'Lịch này vừa được đặt bởi người khác! Đang làm mới danh sách lịch trống...');
        // Refresh slots immediately
        if (selectedMentor) {
          fetchMentorSlots(selectedMentor.id);
        }
      } else {
        Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch.');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const filteredMentors = mentors.filter((m) =>
    m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.expertise?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FB]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 h-16 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            className="w-10 h-10 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB] mr-3"
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
              <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text className="text-xl font-black text-[#1E1E1E]">Danh sách Mentor</Text>
        </View>
      </View>

      {/* Search Input */}
      <View className="p-4 bg-white border-b border-[#E5E7EB]">
        <View className="flex-row items-center bg-[#F4F7FB] border border-[#E4EAF2] rounded-2xl px-4 py-2">
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
            <Circle cx="11" cy="11" r="8" />
            <Path d="M21 21l-4.3-4.3" />
          </Svg>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm Mentor theo tên hoặc chuyên môn..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-3 text-sm text-[#111827] p-0"
          />
        </View>
      </View>

      {/* Mentors list */}
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {isLoadingMentors ? (
          <ActivityIndicator size="large" color="#00CC99" className="mt-8" />
        ) : filteredMentors.length === 0 ? (
          <Text className="text-gray-400 text-center mt-12">Không tìm thấy Mentor nào.</Text>
        ) : (
          filteredMentors.map((mentor) => (
            <TouchableOpacity
              key={mentor.id}
              onPress={() => handleOpenMentorDetail(mentor)}
              className="bg-white p-5 rounded-[24px] border border-[#E4EAF2] mb-4 shadow-sm"
            >
              <View className="flex-row items-start gap-4">
                <View className="w-14 h-14 rounded-full bg-[#00CC99] items-center justify-center">
                  <Text className="text-white font-bold text-xl">
                    {mentor.fullName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[18px] font-black text-[#1E1E1E]">{mentor.fullName}</Text>
                  {mentor.expertise && (
                    <Text className="text-xs font-bold text-[#005C42] bg-[#E6F9F5] px-2 py-0.5 rounded-md mt-1 self-start">
                      {mentor.expertise}
                    </Text>
                  )}
                  {mentor.bio && (
                    <Text className="text-sm text-[#6B7280] mt-3 leading-5" numberOfLines={2}>
                      {mentor.bio}
                    </Text>
                  )}
                </View>
              </View>
              <View className="border-t border-gray-100 mt-4 pt-3 flex-row justify-between items-center">
                <Text className="text-xs text-gray-400">Nhấn để xem các lịch trống</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                  <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MENTOR SLOTS MODAL */}
      <Modal
        visible={showMentorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMentorModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] max-h-[85%] p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[20px] font-black text-[#1E1E1E]">Đặt lịch với Mentor</Text>
              <TouchableOpacity onPress={() => setShowMentorModal(false)} className="p-1">
                <Text className="text-gray-400 text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            {selectedMentor && (
              <View className="mb-6 flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-[#00CC99] items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {selectedMentor.fullName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-base font-bold text-[#1E1E1E]">{selectedMentor.fullName}</Text>
                  <Text className="text-xs text-gray-500">{selectedMentor.expertise || 'Mentor Chuyên Nghiệp'}</Text>
                </View>
              </View>
            )}

            <Text className="text-sm font-bold text-[#7A8BA3] uppercase tracking-wider mb-3">Lịch trống khả dụng</Text>
            
            {isLoadingSlots ? (
              <ActivityIndicator size="small" color="#00CC99" className="py-6" />
            ) : slots.length === 0 ? (
              <Text className="text-gray-400 text-center py-8">Hiện Mentor này chưa lên lịch trống nào.</Text>
            ) : (
              <ScrollView className="max-h-[300px]" showsVerticalScrollIndicator={false}>
                {slots.map((slot) => (
                  <View key={slot.id} className="flex-row items-center justify-between border-b border-gray-100 py-3.5">
                    <View>
                      <Text className="text-sm font-bold text-[#1E1E1E]">
                        {formatDateTime(slot.startTime)} - {new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {slot.meetingLink && (
                        <Text className="text-[11px] text-[#6366F1] mt-0.5" numberOfLines={1}>Meeting: {slot.meetingLink}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOpenBookingModal(slot)}
                      className="bg-[#00CC99] px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white text-xs font-bold">Đặt ngay</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CONFIRM BOOKING MODAL */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-4">
          <View className="bg-white rounded-[24px] w-full max-w-[480px] p-6 shadow-xl">
            <Text className="text-[19px] font-black text-[#1E1E1E] mb-4">Xác nhận đặt lịch hẹn</Text>
            
            {selectedSlotForBooking && (
              <View className="bg-[#E6F9F5] border border-[#A7F3D0] p-4 rounded-xl mb-4">
                <Text className="text-xs text-[#005C42] uppercase tracking-wider font-bold">Thời gian đã chọn</Text>
                <Text className="text-base font-bold text-[#1E1E1E] mt-1">
                  {formatDateTime(selectedSlotForBooking.startTime)} - {new Date(selectedSlotForBooking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}

            <Text className="text-xs font-bold text-[#7A8BA3] uppercase tracking-wider mb-2">Lời nhắn / Mục tiêu của bạn</Text>
            <TextInput
              multiline
              numberOfLines={4}
              value={bookingNotes}
              onChangeText={setBookingNotes}
              placeholder="Bạn muốn Mentor hỗ trợ ôn tập phần nào trong buổi học này?"
              placeholderTextColor="#94A3B8"
              className="border border-[#D8E0EA] bg-[#EDF2F7] rounded-[18px] p-3 text-[15px] text-[#111827] mb-6 h-[100px] textAlignVertical-top"
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowBookingModal(false)}
                className="h-[46px] rounded-[16px] items-center justify-center border border-[#D8E0EA] px-5"
              >
                <Text className="text-gray-600 font-semibold text-sm">Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmBooking}
                disabled={isSubmittingBooking}
                className="h-[46px] rounded-[16px] bg-[#00CC99] items-center justify-center px-6"
              >
                {isSubmittingBooking ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text className="text-white font-semibold text-sm">Xác nhận đặt</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentorsScreen;
