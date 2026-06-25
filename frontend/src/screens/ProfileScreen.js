import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';

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

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên quá dài'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  birthDate: z.string().min(1, 'Vui lòng nhập ngày sinh'),
});

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const profileName = user?.fullName || user?.name || 'Nguyễn Minh Anh';
  const profileEmail = user?.email || 'minhanh@gmail.com';
  const profilePhone = user?.phone || '0912345678';
  const profileBirthDate = user?.dateOfBirth || user?.birthday || '15/08/2002';
  const profileTrack = user?.role || 'IELTS Academic';

  const [activeTab, setActiveTab] = useState('settings');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone,
      birthDate: profileBirthDate,
    },
  });

  const initials = useMemo(() => {
    const parts = profileName.trim().split(/\s+/).filter(Boolean);
    const selected = parts.length >= 2 ? parts.slice(-2) : parts.slice(0, 2);
    return selected.map((part) => part[0]?.toUpperCase()).join('') || 'MA';
  }, [profileName]);

  const stats = [
    { icon: 'flame', value: '42 Days', label: 'Streak', color: '#c92a2a' },
    { icon: 'book', value: '34 Tests', label: 'Completed', color: '#4682b4' },
    { icon: 'chatbubbles', value: '28 Feedbacks', label: 'AI Scored', color: '#005c42' },
    { icon: 'medal', value: '3 Badges', label: 'Achievements', color: '#d97706' },
  ];

  const tabs = [
    { key: 'overview', label: 'OVERVIEW' },
    { key: 'settings', label: 'SETTINGS' },
  ];

  const onSubmit = (data) => {
    Alert.alert('Saved', 'Your information has been updated:\n' + JSON.stringify(data, null, 2));
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />
      
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>STUDENT PROFILE</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <BrutalistShadow style={styles.profileCard} offset={6}>
          <View style={styles.profileCardInner}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <TouchableOpacity style={styles.cameraBtn}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.infoWrap}>
                <Text style={styles.nameText}>{profileName}</Text>
                <Text style={styles.emailText}>{profileEmail}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{profileTrack.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.targetRow}>
              <View style={styles.targetBox}>
                <Text style={styles.targetLabel}>CURRENT BAND</Text>
                <Text style={[styles.targetValue, { color: '#c92a2a' }]}>6.75</Text>
              </View>
              <View style={[styles.targetBox, styles.targetBoxDashed]}>
                <Text style={styles.targetLabel}>TARGET BAND</Text>
                <Text style={styles.targetValue}>7.5</Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              {stats.map((item) => (
                <View key={item.label} style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </BrutalistShadow>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <BrutalistShadow style={styles.settingsCard} offset={4}>
            <View style={styles.settingsCardInner}>
              <Text style={styles.sectionTitle}>Account Details</Text>

              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>HỌ TÊN</Text>
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                    {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL</Text>
                    <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
                    <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="phone-pad" />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>NGÀY SINH</Text>
                    <TextInput style={styles.input} value={value} onChangeText={onChange} />
                    {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate.message}</Text>}
                  </View>
                )}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit(onSubmit)}>
                <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
                <Text style={styles.logoutBtnText}>LOG OUT</Text>
              </TouchableOpacity>
            </View>
          </BrutalistShadow>
        )}
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BrutalistShadow style={{ borderRadius: 16, width: '90%', maxWidth: 400 }} offset={6}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="log-out" size={32} color="#c92a2a" />
              </View>
              <Text style={styles.modalTitle}>Sign Out?</Text>
              <Text style={styles.modalDesc}>Are you sure you want to log out of your session?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowLogoutModal(false)}>
                  <Text style={styles.modalBtnCancelText}>CANCEL</Text>
                </TouchableOpacity>
                <View style={{ width: 12 }} />
                <TouchableOpacity style={styles.modalBtnDanger} onPress={confirmLogout}>
                  <Text style={styles.modalBtnDangerText}>SIGN OUT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BrutalistShadow>
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
  
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },

  profileCard: { borderRadius: 24, marginBottom: 24 },
  profileCardInner: { backgroundColor: '#fcfbf7', padding: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80, height: 80, borderRadius: 16, backgroundColor: '#a7f3d0',
    borderWidth: 2, borderColor: '#1b263b', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontFamily: 'Outfit_900Black', color: '#005c42' },
  cameraBtn: {
    position: 'absolute', bottom: -8, right: -8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#1b263b', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fcfbf7',
  },
  infoWrap: { marginLeft: 16, flex: 1 },
  nameText: { fontSize: 22, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 2 },
  emailText: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 8 },
  roleBadge: {
    backgroundColor: '#ffd54f', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4, borderWidth: 1, borderColor: '#1b263b', alignSelf: 'flex-start',
  },
  roleText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' },

  targetRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  targetBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 2, borderColor: '#1b263b',
  },
  targetBoxDashed: { borderStyle: 'dashed' },
  targetLabel: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#666' },
  targetValue: { fontSize: 32, fontFamily: 'Outfit_900Black', color: '#1b263b', marginTop: 4 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 2, borderTopColor: '#1b263b', paddingTop: 16,
  },
  statItem: { width: '50%', alignItems: 'center', marginBottom: 16 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#1b263b' },
  statValue: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  statLabel: { fontSize: 10, fontFamily: 'Outfit_700Bold', color: '#666' },

  tabsContainer: {
    flexDirection: 'row', backgroundColor: '#fcfbf7', borderRadius: 12,
    borderWidth: 2, borderColor: '#1b263b', padding: 4, marginBottom: 24,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 8 },
  tabItemActive: { backgroundColor: '#1b263b' },
  tabText: { fontSize: 12, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  tabTextActive: { color: '#fff' },

  settingsCard: { borderRadius: 24 },
  settingsCardInner: { backgroundColor: '#fcfbf7', padding: 24 },
  sectionTitle: { fontSize: 20, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 20 },
  
  inputGroup: { marginBottom: 16 },
  label: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#666', marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#1b263b',
  },
  errorText: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#c92a2a', marginTop: 4, marginLeft: 4 },

  saveBtn: { backgroundColor: '#a7f3d0', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 12 },
  saveBtnText: { color: '#005c42', fontFamily: 'Outfit_900Black', fontSize: 14 },
  logoutBtn: { backgroundColor: '#f5f3dc', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  logoutBtnText: { color: '#c92a2a', fontFamily: 'Outfit_900Black', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fcfbf7', padding: 24, alignItems: 'center' },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: { fontSize: 24, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 8 },
  modalDesc: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666', textAlign: 'center', marginBottom: 24 },
  modalActions: { flexDirection: 'row', width: '100%' },
  modalBtnCancel: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnCancelText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#1b263b' },
  modalBtnDanger: { flex: 1, backgroundColor: '#c92a2a', borderWidth: 2, borderColor: '#1b263b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnDangerText: { fontFamily: 'Outfit_900Black', fontSize: 12, color: '#fff' },
});

export default ProfileScreen;
