import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import useAuthStore from '../store/useAuthStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>IELTS Progress</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>You haven't taken any tests yet.</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#e7f1ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 12,
  },
  roleText: {
    color: '#007bff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 40,
  },
  cardText: {
    color: '#6c757d',
    textAlign: 'center',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  logoutText: {
    color: '#dc3545',
    fontWeight: 'bold',
  }
});

export default ProfileScreen;
