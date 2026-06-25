import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const SettingRow = ({ icon, label, sublabel, onPress, rightElement, color = '#1b263b' }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={[styles.settingIcon, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.settingInfo}>
      <Text style={styles.settingLabel}>{label}</Text>
      {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
    </View>
    {rightElement ? rightElement : (
      onPress ? <Ionicons name="chevron-forward" size={18} color="#999" /> : null
    )}
  </TouchableOpacity>
);

const SectionHeader = ({ badge, title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionBadge}>{badge}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [studyReminder, setStudyReminder] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This action is permanent and cannot be undone. All your data will be erased.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Submitted', 'Account deletion request sent.') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfbf7" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>SETTINGS</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Account Info Card */}
        <BrutalistShadow style={styles.accountCard} offset={5}>
          <View style={styles.accountCardInner}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.fullName || 'Student'}</Text>
              <Text style={styles.accountEmail}>{user?.email || 'student@apex.com'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
              </View>
            </View>
          </View>
        </BrutalistShadow>

        {/* Notifications Section */}
        <SectionHeader badge="✎ ALERTS" title="Notifications" />
        <BrutalistShadow style={styles.settingCard} offset={4}>
          <View style={styles.settingCardInner}>
            <SettingRow
              icon="notifications"
              label="Push Notifications"
              sublabel="Get updates about your exams"
              color="#4682b4"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#ddd', true: '#1b263b' }}
                  thumbColor={notifications ? '#ffd54f' : '#fff'}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon="alarm"
              label="Daily Study Reminder"
              sublabel="09:00 AM every day"
              color="#d97706"
              rightElement={
                <Switch
                  value={studyReminder}
                  onValueChange={setStudyReminder}
                  trackColor={{ false: '#ddd', true: '#1b263b' }}
                  thumbColor={studyReminder ? '#ffd54f' : '#fff'}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon="volume-high"
              label="Sound Effects"
              sublabel="Plays on correct/wrong answers"
              color="#005c42"
              rightElement={
                <Switch
                  value={soundEffects}
                  onValueChange={setSoundEffects}
                  trackColor={{ false: '#ddd', true: '#1b263b' }}
                  thumbColor={soundEffects ? '#ffd54f' : '#fff'}
                />
              }
            />
          </View>
        </BrutalistShadow>

        {/* Appearance Section */}
        <SectionHeader badge="✎ LOOK" title="Appearance" />
        <BrutalistShadow style={styles.settingCard} offset={4}>
          <View style={styles.settingCardInner}>
            <SettingRow
              icon="moon"
              label="Dark Mode"
              sublabel="Switch to a darker theme"
              color="#6366f1"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#ddd', true: '#1b263b' }}
                  thumbColor={darkMode ? '#ffd54f' : '#fff'}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              icon="language"
              label="Language"
              sublabel="Vietnamese / Tiếng Việt"
              color="#1b263b"
              onPress={() => Alert.alert('Language', 'Language settings coming soon.')}
            />
          </View>
        </BrutalistShadow>

        {/* Study Preferences Section */}
        <SectionHeader badge="✎ STUDY" title="Study Preferences" />
        <BrutalistShadow style={styles.settingCard} offset={4}>
          <View style={styles.settingCardInner}>
            <SettingRow
              icon="trophy"
              label="Target Band Score"
              sublabel="Currently: 7.5"
              color="#d97706"
              onPress={() => Alert.alert('Target Score', 'Tap to change your IELTS goal.')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="time"
              label="Daily Study Goal"
              sublabel="60 minutes per day"
              color="#4682b4"
              onPress={() => Alert.alert('Study Goal', 'Daily goal settings coming soon.')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="bar-chart"
              label="Test Difficulty"
              sublabel="Adaptive to your level"
              color="#005c42"
              onPress={() => Alert.alert('Difficulty', 'Difficulty settings coming soon.')}
            />
          </View>
        </BrutalistShadow>

        {/* About Section */}
        <SectionHeader badge="✎ INFO" title="About" />
        <BrutalistShadow style={styles.settingCard} offset={4}>
          <View style={styles.settingCardInner}>
            <SettingRow
              icon="shield-checkmark"
              label="Privacy Policy"
              color="#1b263b"
              onPress={() => Linking.openURL('https://apexielts.com/privacy')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-text"
              label="Terms of Service"
              color="#1b263b"
              onPress={() => Linking.openURL('https://apexielts.com/terms')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="information-circle"
              label="App Version"
              sublabel="v1.0.0 — Apex IELTS"
              color="#999"
            />
          </View>
        </BrutalistShadow>

        {/* Danger Zone */}
        <SectionHeader badge="⚠️ DANGER" title="Account Actions" />
        <BrutalistShadow style={styles.settingCard} offset={4}>
          <View style={styles.settingCardInner}>
            <SettingRow
              icon="log-out"
              label="Sign Out"
              sublabel="Log out of your current session"
              color="#c92a2a"
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="trash"
              label="Delete Account"
              sublabel="Permanently erase all data"
              color="#c92a2a"
              onPress={handleDeleteAccount}
            />
          </View>
        </BrutalistShadow>

        {/* Footer stamp */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Handcrafted ✏️ for IELTS students</Text>
          <Text style={styles.footerSub}>© 2026 Apex IELTS</Text>
        </View>

      </ScrollView>
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
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 2 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  // Account Card
  accountCard: { borderRadius: 20, marginBottom: 28 },
  accountCardInner: { backgroundColor: '#fcfbf7', flexDirection: 'row', alignItems: 'center', padding: 20 },
  accountAvatar: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: '#a7f3d0', borderWidth: 2, borderColor: '#1b263b',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  accountAvatarText: { fontSize: 28, fontFamily: 'Outfit_900Black', color: '#005c42' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 2 },
  accountEmail: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#666', marginBottom: 8 },
  roleBadge: { alignSelf: 'flex-start', backgroundColor: '#ffd54f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1, borderColor: '#1b263b' },
  roleText: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#1b263b' },

  // Section
  sectionHeader: { marginBottom: 10, marginTop: 4 },
  sectionBadge: { fontSize: 10, fontFamily: 'Outfit_900Black', color: '#c92a2a', letterSpacing: 2, marginBottom: 2 },
  sectionTitle: { fontSize: 22, fontFamily: 'Outfit_900Black', color: '#1b263b' },

  // Setting Card
  settingCard: { borderRadius: 20, marginBottom: 24 },
  settingCardInner: { backgroundColor: '#fcfbf7', paddingVertical: 4 },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  settingIcon: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1, borderColor: '#1b263b',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: 'Outfit_900Black', color: '#1b263b' },
  settingSubLabel: { fontSize: 11, fontFamily: 'Outfit_700Bold', color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(27,38,59,0.08)', marginHorizontal: 20 },

  // Footer
  footer: { alignItems: 'center', paddingTop: 16 },
  footerText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: '#666', marginBottom: 4 },
  footerSub: { fontFamily: 'Outfit_900Black', fontSize: 10, color: '#999', letterSpacing: 1 },
});

export default SettingsScreen;
