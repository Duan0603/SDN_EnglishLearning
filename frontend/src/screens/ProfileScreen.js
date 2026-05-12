import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import useAuthStore from '../store/useAuthStore';

const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="items-center px-6 pt-16 pb-12 bg-slate-900 rounded-b-[48px] border-b border-slate-800">
        <View className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 justify-center items-center mb-6 border-4 border-slate-900 relative">
          <Text className="text-5xl text-white font-black tracking-tighter">
            {user?.fullName?.charAt(0).toUpperCase()}
          </Text>
          <View className="absolute bottom-0 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" />
        </View>
        <Text className="text-3xl font-black text-white tracking-tight">{user?.fullName}</Text>
        <Text className="text-base text-slate-400 mt-2 font-medium">{user?.email}</Text>
        
        <View className="bg-indigo-500/10 px-6 py-2 rounded-full mt-6 border border-indigo-500/20">
          <Text className="text-indigo-400 text-sm font-bold uppercase tracking-widest">{user?.role}</Text>
        </View>
      </View>

      <View className="flex-1 px-8 pt-10">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-xl font-bold text-white tracking-tight">IELTS Progress</Text>
          <TouchableOpacity>
            <Text className="text-indigo-400 font-semibold">View All</Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 mb-auto items-center justify-center">
          <View className="w-16 h-16 bg-slate-800 rounded-full mb-4 items-center justify-center">
            <Text className="text-2xl">🏆</Text>
          </View>
          <Text className="text-slate-400 text-center font-medium text-lg">No tests taken yet.</Text>
          <Text className="text-slate-500 text-center text-sm mt-2">Start a mock test to see your score here.</Text>
        </View>

        <TouchableOpacity 
          className="bg-red-500/10 p-5 rounded-2xl items-center border border-red-500/20 active:bg-red-500/20 active:scale-[0.98] transition-all mb-8" 
          onPress={logout}
        >
          <Text className="text-red-400 text-lg font-bold tracking-wide">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
