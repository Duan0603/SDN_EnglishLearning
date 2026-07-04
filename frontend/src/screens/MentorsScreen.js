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
  StyleSheet,
  StatusBar,
  Platform
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

const MentorsScreen = ({ navigation }) => {
  const { user } = useAuthStore();

  const [mentors, setMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMentors, setIsLoadingMentors] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);

  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMentors = useCallback(async () => {
    setIsLoadingMentors(true);
    try {
      const response = await client.get('/mentors');
      setMentors(response.data.data || []);
    } catch (error) {
      console.log('Error fetching mentors:', error);
      setMentors([]);
    } finally {
      setIsLoadingMentors(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const fetchMentorSlots = async (mentorId) => {
    setIsLoadingSlots(true);
    try {
      const response = await client.get(`/mentors/${mentorId}/availabilities`);
      setSlots(response.data.data || []);
    } catch (error) {
      console.log('Error fetching slots:', error);
      setSlots([]);
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
      setSuccessMessage('Mentor session booked successfully!');
      setShowBookingModal(false);
      if (selectedMentor) fetchMentorSlots(selectedMentor.id);
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Failed to book session. Please try again.');
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
      return d.toLocaleString('vi-VN', { weekday: 'short', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* Header */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>MENTOR DIRECTORY</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={20} color="#1b263b" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name or expertise..."
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Mentors list */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoadingMentors ? (
          <ActivityIndicator size="large" color="#1b263b" style={{ mt: 40 }} />
        ) : filteredMentors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
            <Text style={styles.emptyText}>No mentors found.</Text>
          </View>
        ) : (
          filteredMentors.map((mentor) => (
            <TouchableOpacity key={mentor.id} onPress={() => handleOpenMentorDetail(mentor)} activeOpacity={0.9} style={styles.mentorCardWrap}>
              <BrutalistShadow style={styles.mentorCard} offset={4}>
                <View style={styles.mentorCardInner}>
                  <View style={styles.mentorHeader}>
                    <View style={styles.mentorAvatar}>
                      <Text style={styles.mentorAvatarText}>{mentor.fullName?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.mentorInfo}>
                      <Text style={styles.mentorName}>{mentor.fullName}</Text>
                      {mentor.expertise && (
                        <View style={styles.expertiseBadge}>
                          <Text style={styles.expertiseText}>{mentor.expertise}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {mentor.bio && (
                    <Text style={styles.mentorBio} numberOfLines={2}>{mentor.bio}</Text>
                  )}
                  <View style={styles.mentorFooter}>
                    <Text style={styles.mentorFooterText}>VIEW AVAILABLE SLOTS</Text>
                    <Ionicons name="arrow-forward" size={16} color="#c92a2a" />
                  </View>
                </View>
              </BrutalistShadow>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MENTOR SLOTS MODAL */}
      <Modal visible={showMentorModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Session</Text>
              <TouchableOpacity onPress={() => setShowMentorModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#1b263b" />
              </TouchableOpacity>
            </View>

            {selectedMentor && (
              <View style={styles.selectedMentorRow}>
                <View style={[styles.mentorAvatar, { width: 48, height: 48, borderRadius: 12 }]}>
                  <Text style={[styles.mentorAvatarText, { fontSize: 24 }]}>{selectedMentor.fullName?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorName}>{selectedMentor.fullName}</Text>
                  <Text style={styles.mentorSub}>{selectedMentor.expertise || 'Professional Mentor'}</Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>AVAILABLE SCHEDULES</Text>
            
            {isLoadingSlots ? (
              <ActivityIndicator size="small" color="#1b263b" style={{ padding: 40 }} />
            ) : slots.length === 0 ? (
              <Text style={styles.emptyTextCenter}>No slots available at the moment.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {slots.map((slot) => (
                  <View key={slot.id} style={styles.slotRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.slotTime}>{formatDateTime(slot.startTime)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleOpenBookingModal(slot)} style={styles.bookBtn}>
                      <Text style={styles.bookBtnText}>BOOK NOW</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CONFIRM BOOKING MODAL */}
      <Modal visible={showBookingModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <BrutalistShadow style={{ width: '90%', maxWidth: 400, borderRadius: 16 }} offset={6}>
            <View style={styles.bookingModalInner}>
              <Text style={styles.modalTitle}>Confirm Booking</Text>
              
              {selectedSlotForBooking && (
                <View style={styles.slotCard}>
                  <Text style={styles.slotCardLabel}>SELECTED TIME</Text>
                  <Text style={styles.slotCardTime}>{formatDateTime(selectedSlotForBooking.startTime)}</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>YOUR MESSAGE / GOALS</Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={bookingNotes}
                onChangeText={setBookingNotes}
                placeholder="What do you want to focus on?"
                placeholderTextColor="#999"
                style={styles.textArea}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>CANCEL</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity onPress={handleConfirmBooking} disabled={isSubmittingBooking} style={styles.confirmBtn}>
                  {isSubmittingBooking ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>CONFIRM</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </BrutalistShadow>
        </View>
      </Modal>

      {/* Error Message Modal */}
      <Modal visible={!!errorMessage} transparent animationType="fade" onRequestClose={() => setErrorMessage('')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,38,59,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <Ionicons name="alert-circle" size={32} color="#c92a2a" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16, textAlign: 'center' }}>Lỗi Cập Nhật</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 }}>{errorMessage}</Text>
            <TouchableOpacity style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#c92a2a', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b' }} onPress={() => setErrorMessage('')}>
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#fff' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Message Modal */}
      <Modal visible={!!successMessage} transparent animationType="fade" onRequestClose={() => setSuccessMessage('')}>
        <View style={{ flex: 1, backgroundColor: 'rgba(27,38,59,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: '#fcfbf7', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: '#1b263b', elevation: 6 }}>
            <Ionicons name="checkmark-circle" size={32} color="#005c42" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16, textAlign: 'center' }}>Thành Công</Text>
            <Text style={{ fontSize: 13, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 }}>{successMessage}</Text>
            <TouchableOpacity style={{ width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: '#a7f3d0', alignItems: 'center', borderWidth: 2, borderColor: '#1b263b' }} onPress={() => setSuccessMessage('')}>
              <Text style={{ fontSize: 14, fontFamily: 'Outfit_900Black', color: '#005c42' }}>Tiếp Tục</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  searchContainer: { padding: 16, backgroundColor: '#f5f3dc' },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  mentorCardWrap: { marginBottom: 20 },
  mentorCard: { borderRadius: 16 },
  mentorCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  mentorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mentorAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#005c42', borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center' },
  mentorAvatarText: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#fff' },
  mentorInfo: { marginLeft: 16, flex: 1 },
  mentorName: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 4 },
  expertiseBadge: { alignSelf: 'flex-start', backgroundColor: '#a7f3d0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#1b263b' },
  expertiseText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#005c42' },
  mentorBio: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', lineHeight: 18, marginBottom: 16 },
  mentorFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 2, borderTopColor: 'rgba(27,38,59,0.1)', paddingTop: 12 },
  mentorFooterText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#c92a2a', letterSpacing: 1 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTextCenter: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fcfbf7', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 2, borderColor: '#1b263b', padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  closeBtn: { padding: 4 },
  
  selectedMentorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: 'rgba(27,38,59,0.1)' },
  mentorSub: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', marginTop: 4 },
  
  sectionTitle: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', letterSpacing: 2, marginBottom: 12 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: 'rgba(27,38,59,0.1)' },
  slotTime: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  bookBtn: { backgroundColor: '#c92a2a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 2, borderColor: '#1b263b' },
  bookBtnText: { color: '#fff', fontFamily: 'Outfit_900Black', fontSize: 10 },

  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bookingModalInner: { backgroundColor: '#fcfbf7', padding: 24 },
  slotCard: { backgroundColor: '#ffd54f', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1b263b', marginBottom: 20 },
  slotCardLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b', opacity: 0.7, marginBottom: 4 },
  slotCardTime: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  
  inputLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666', marginBottom: 8, letterSpacing: 1 },
  textArea: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, padding: 16, fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#1b263b', height: 100, textAlignVertical: 'top', marginBottom: 24 },
  
  modalActions: { flexDirection: 'row' },
  cancelBtn: { flex: 1, backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' },
  confirmBtn: { flex: 1, backgroundColor: '#005c42', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#fff' },
});

export default MentorsScreen;
