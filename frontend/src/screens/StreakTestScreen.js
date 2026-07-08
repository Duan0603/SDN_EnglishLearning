import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const BrutalistShadow = ({ children, style, offset = 4 }) => (
  <View style={[style, { position: 'relative', marginBottom: 20 }]}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1b263b', borderRadius: style.borderRadius || 0, top: offset, left: offset }]} />
    <View style={{ backgroundColor: style.backgroundColor || '#fff', borderWidth: 2, borderColor: '#1b263b', borderRadius: style.borderRadius || 0, overflow: 'hidden', padding: style.padding || 16 }}>
      {children}
    </View>
  </View>
);

const StreakTestScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  
  const fetchStats = async () => {
    try {
      const res = await client.get('/users/me/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const updateStreak = async (checkInStreak, daysAgo) => {
    try {
      let lastCheckIn = null;
      if (daysAgo !== null) {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        lastCheckIn = d.toISOString();
      }
      
      const res = await client.post('/users/me/test-streak', {
        checkInStreak,
        lastCheckIn,
      });

      if (res.data?.success) {
        Alert.alert('Thành công', 'Đã cập nhật Streak test!');
        fetchStats(); // Tải lại để xem thay đổi
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật Streak');
    }
  };

  const currentStreak = stats?.currentStreak || 0;
  const hasCheckedInToday = stats?.hasCheckedInToday || false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1b263b" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>STREAK TEST MODE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.warningText}>
          ⚠️ Màn hình này chỉ dành cho mục đích TEST (kiểm thử). 
          Khi ra mắt chính thức, bạn có thể xóa file này hoặc ẩn nút truy cập.
        </Text>

        <BrutalistShadow style={{ borderRadius: 16, backgroundColor: '#fcfbf7' }}>
          <Text style={styles.sectionTitle}>Trạng Thái Hiện Tại (Real Data)</Text>
          <View style={styles.streakDisplay}>
            <Ionicons name={currentStreak > 0 ? "flame" : "flame-outline"} size={60} color={currentStreak > 0 ? "#c92a2a" : "#999"} />
            <Text style={styles.streakCount}>{currentStreak} Ngày</Text>
            <Text style={styles.streakSub}>
              {hasCheckedInToday ? "🔥 Bạn đã điểm danh hôm nay!" : "😴 Bạn chưa điểm danh hôm nay."}
            </Text>
          </View>
        </BrutalistShadow>

        <BrutalistShadow style={{ borderRadius: 16, backgroundColor: '#fcfbf7' }}>
          <Text style={styles.sectionTitle}>Công cụ Test (Ghi đè DB)</Text>

          <TouchableOpacity style={styles.btn} onPress={() => updateStreak(0, null)}>
            <Text style={styles.btnText}>1. Xóa Streak (0 ngày, chưa điểm danh)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => updateStreak(5, 1)}>
            <Text style={styles.btnText}>2. Set 5 Ngày Streak (Đã điểm danh hôm qua)</Text>
            <Text style={styles.btnHint}>- Nếu vào App, bạn sẽ chưa điểm danh hôm nay. Nếu điểm danh sẽ lên 6.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => updateStreak(5, 0)}>
            <Text style={styles.btnText}>3. Set 5 Ngày Streak (Đã điểm danh hôm nay)</Text>
            <Text style={styles.btnHint}>- Bạn đã điểm danh hôm nay rồi, không thể lên điểm nữa.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={() => updateStreak(10, 2)}>
            <Text style={styles.btnText}>4. Gãy Streak (10 Ngày, Check-in 2 ngày trước)</Text>
            <Text style={styles.btnHint}>- Do hôm qua quên, khi điểm danh hôm nay streak sẽ về 1.</Text>
          </TouchableOpacity>
        </BrutalistShadow>

        <BrutalistShadow style={{ borderRadius: 16, backgroundColor: '#e0f2fe' }}>
          <Text style={styles.sectionTitle}>Check-in Ngay!</Text>
          <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 13, marginBottom: 12 }}>
            Nhấn nút dưới để gọi API check-in y hệt như logic lúc mới vào App.
          </Text>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#4682b4', borderColor: '#1b263b' }]} 
            onPress={async () => {
              try {
                const res = await client.post('/users/me/checkin');
                Alert.alert('Kết quả Check-in', res.data.message);
                fetchStats();
              } catch (err) {
                Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
              }
            }}
          >
            <Text style={[styles.btnText, { color: '#fff' }]}>GỌI API CHECK-IN</Text>
          </TouchableOpacity>
        </BrutalistShadow>

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
  appBarTitle: { fontSize: 16, fontFamily: 'Outfit_900Black', color: '#1b263b', letterSpacing: 1 },
  content: { padding: 20 },
  warningText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#c92a2a',
    backgroundColor: '#ffd54f',
    padding: 12,
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Outfit_900Black', color: '#1b263b', marginBottom: 16 },
  streakDisplay: { alignItems: 'center', marginVertical: 10 },
  streakCount: { fontSize: 32, fontFamily: 'Outfit_900Black', color: '#1b263b', marginVertical: 8 },
  streakSub: { fontSize: 14, fontFamily: 'Outfit_700Bold', color: '#666' },
  btn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  btnText: { fontFamily: 'Outfit_900Black', fontSize: 13, color: '#1b263b' },
  btnHint: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: '#666', marginTop: 4 },
});

export default StreakTestScreen;
