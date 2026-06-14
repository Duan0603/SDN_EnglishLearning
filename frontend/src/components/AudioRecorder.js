import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socket } from '../utils/socket';

const CACHE_KEY = '@audio_cache';

export const AudioRecorder = ({ onTranscriptionComplete }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  // Animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      blinkAnim.setValue(0);
      Animated.timing(blinkAnim).stop();
    }
  }, [isRecording, blinkAnim]);

  // Connect socket on mount
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    
    // Listen for transcription results
    socket.on('audio:transcript', (data) => {
      setIsProcessing(false);
      if (data.success) {
        if (onTranscriptionComplete) {
          onTranscriptionComplete(data.transcript);
        } else {
          Alert.alert('Transcription', data.transcript);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to process audio');
      }
    });

    return () => {
      socket.off('audio:transcript');
      // socket.disconnect(); // Optional depending on global usage
    };
  }, [onTranscriptionComplete]);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        const res = await requestPermission();
        if (res.status !== 'granted') {
          Alert.alert('Permission Denied', 'Microphone permission is required to use this feature.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      socket.emit('audio:start');
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);

      // Setup interval to read and send chunks
      // expo-av doesn't support streaming buffer directly easily during recording,
      // so for pure streaming, one might use react-native-live-audio-stream.
      // Since we use expo-av, we will wait until stop, or we could simulate chunks.
      // For the requirement, we'll send the whole file as a base64 buffer on stop for simplicity, 
      // or implement custom chunking if required. Let's send it when stopped for reliability.
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      // Cache for offline safety
      await AsyncStorage.setItem(CACHE_KEY, uri);

      // Read file and send to backend
      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      socket.emit('audio:chunk', fileBase64);
      socket.emit('audio:stop');

    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to stop recording');
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.recordButton, isRecording ? styles.recordingActive : null]} 
        onPress={recording ? stopRecording : startRecording}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>
          {isProcessing ? 'Processing...' : recording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      
      {isRecording && (
        <View style={styles.indicatorContainer}>
          <Animated.View style={[styles.dot, { opacity: blinkAnim }]} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
});
