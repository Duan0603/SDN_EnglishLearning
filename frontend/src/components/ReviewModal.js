import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';

const ReviewModal = ({ visible, onClose, submissionId, type }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible || !submissionId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '';
        if (type === 'READING' || type === 'LISTENING') {
          url = `/users/me/results/test/${submissionId}`;
        } else if (type === 'WRITING') {
          url = `/users/me/results/writing/${submissionId}`;
        } else if (type === 'SPEAKING') {
          url = `/users/me/results/speaking/${submissionId}`;
        }

        const res = await client.get(url, { hideToast: true });
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải chi tiết bài làm.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [visible, submissionId, type]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                CHI TIẾT {type === 'READING' ? 'ĐỌC' : type === 'LISTENING' ? 'NGHE' : type === 'WRITING' ? 'VIẾT' : 'NÓI'}
              </Text>
              <Text style={styles.headerSubtitle}>
                Band Score: <Text style={styles.scoreText}>{data?.bandScore || '0.0'}</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#1b263b" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.centerState}>
                <ActivityIndicator size="large" color="#1b263b" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : data ? (
              <View style={{ paddingBottom: 40 }}>
                {/* READING / LISTENING REVIEW */}
                {(type === 'READING' || type === 'LISTENING') && (
                  <View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Số câu đúng</Text>
                      <Text style={styles.statValue}>
                        {data.correctCount} / {data.test?.sections?.reduce((acc, sec) => acc + sec.questions.length, 0) || '?'}
                      </Text>
                    </View>

                    {data.test?.sections?.map((section, sIdx) => (
                      <View key={section.id} style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>{section.title || `Section ${sIdx + 1}`}</Text>
                        
                        {section.questions.map((q) => {
                          const userAnsObj = data.answers?.find((a) => a.questionId === q.id);
                          const userAns = userAnsObj ? userAnsObj.userAnswer : '';
                          const isCorrect = userAns.toLowerCase().trim() === q.answer.toLowerCase().trim();

                          return (
                            <View key={q.id} style={[styles.qCard, isCorrect ? styles.qCorrect : styles.qWrong]}>
                              <Text style={styles.qText}>Câu {q.questionNumber}: {q.content}</Text>
                              
                              <View style={styles.ansRow}>
                                <View style={styles.ansBox}>
                                  <Text style={styles.ansLabel}>Bạn chọn:</Text>
                                  <Text style={[styles.ansVal, isCorrect ? styles.txtCorrect : styles.txtWrong]}>
                                    {userAns || '(Trống)'}
                                  </Text>
                                </View>
                                <View style={[styles.ansBox, styles.ansBoxCorrect]}>
                                  <Text style={[styles.ansLabel, styles.txtCorrect]}>Đáp án đúng:</Text>
                                  <Text style={[styles.ansVal, styles.txtCorrect]}>{q.answer}</Text>
                                </View>
                              </View>
                              
                              {q.explanation && (
                                <View style={styles.expBox}>
                                  <Text style={styles.expText}><Text style={styles.expBold}>Giải thích:</Text> {q.explanation}</Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}

                {/* WRITING REVIEW */}
                {type === 'WRITING' && (
                  <View>
                    <View style={styles.card}>
                      <Text style={styles.label}>Đề bài (Prompt)</Text>
                      <Text style={styles.promptText}>{data.prompt || data.test?.title}</Text>
                      
                      <Text style={styles.label}>Bài viết của bạn</Text>
                      <View style={styles.essayBox}>
                        <Text style={styles.essayText}>{data.essayText}</Text>
                      </View>
                    </View>

                    <View style={[styles.card, styles.aiCard]}>
                      <Text style={styles.aiTitle}>Nhận xét từ Giám khảo AI</Text>
                      
                      <View style={styles.grid2}>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Task Achievement</Text>
                          <Text style={styles.gridVal}>{data.taskAchievement}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Coherence & Cohesion</Text>
                          <Text style={styles.gridVal}>{data.coherenceCohesion}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Lexical Resource</Text>
                          <Text style={styles.gridVal}>{data.lexicalResource}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Grammar</Text>
                          <Text style={styles.gridVal}>{data.grammarAccuracy}</Text>
                        </View>
                      </View>

                      {data.aiFeedback && (
                        <View style={styles.feedbackSection}>
                          <Text style={styles.fbTitle}>Nhận xét tổng quan:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.general}</Text>
                          
                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Task Achievement:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.taskAchievement}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Coherence & Cohesion:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.coherenceCohesion}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Lexical Resource:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.lexicalResource}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Grammar Accuracy:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.grammarAccuracy}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* SPEAKING REVIEW */}
                {type === 'SPEAKING' && (
                  <View>
                    <View style={styles.card}>
                      <Text style={styles.label}>Chủ đề (Prompt)</Text>
                      <Text style={styles.promptText}>{data.prompt || data.test?.title}</Text>
                      
                      <Text style={styles.label}>Văn bản nhận diện</Text>
                      <View style={[styles.essayBox, { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' }]}>
                        <Text style={styles.essayText}>{data.transcription || 'Không nhận diện được nội dung.'}</Text>
                      </View>
                    </View>

                    <View style={[styles.card, styles.aiCard]}>
                      <Text style={styles.aiTitle}>Nhận xét từ Giám khảo AI</Text>
                      
                      <View style={styles.grid2}>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Fluency</Text>
                          <Text style={styles.gridVal}>{data.fluencyCoherence}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Pronunciation</Text>
                          <Text style={styles.gridVal}>{data.pronunciation}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Lexical Resource</Text>
                          <Text style={styles.gridVal}>{data.lexicalResource}</Text>
                        </View>
                        <View style={styles.gridItem}>
                          <Text style={styles.gridLabel}>Grammar</Text>
                          <Text style={styles.gridVal}>{data.grammarAccuracy}</Text>
                        </View>
                      </View>

                      {data.aiFeedback && (
                        <View style={styles.feedbackSection}>
                          <Text style={styles.fbTitle}>Nhận xét tổng quan:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.general}</Text>
                          
                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Fluency & Coherence:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.fluencyCoherence}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Pronunciation:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.pronunciation}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Lexical Resource:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.lexicalResource}</Text>

                          <Text style={[styles.fbTitle, { marginTop: 10 }]}>Grammar Accuracy:</Text>
                          <Text style={styles.fbText}>{data.aiFeedback.grammarAccuracy}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27,38,59,0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fcfbf7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#1b263b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#1b263b',
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 20,
    color: '#1b263b',
  },
  headerSubtitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  scoreText: {
    color: '#c92a2a',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fecdd3',
    borderWidth: 2,
    borderColor: '#1b263b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  centerState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    marginTop: 12,
    color: '#1b263b',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#e11d48',
    borderWidth: 2,
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    fontFamily: 'Outfit_700Bold',
    color: '#e11d48',
    textAlign: 'center',
  },
  
  // Shared UI
  statBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    padding: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  statLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: 'Outfit_900Black',
    fontSize: 18,
    color: '#059669',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  aiCard: {
    backgroundColor: '#1b263b',
  },
  label: {
    fontFamily: 'Outfit_900Black',
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  promptText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#1b263b',
    marginBottom: 16,
  },
  essayBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  essayText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },

  // Reading/Listening
  sectionCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1b263b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
    textTransform: 'uppercase',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  qCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  qCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  qWrong: {
    borderColor: '#f43f5e',
    backgroundColor: '#fff1f2',
  },
  qText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#1b263b',
    marginBottom: 10,
  },
  ansRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ansBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
  },
  ansBoxCorrect: {
    borderColor: '#6ee7b7',
  },
  ansLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#666',
    marginBottom: 4,
  },
  ansVal: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
  },
  txtCorrect: {
    color: '#059669',
  },
  txtWrong: {
    color: '#e11d48',
  },
  expBox: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  expText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    color: '#0369a1',
  },
  expBold: {
    fontFamily: 'Outfit_900Black',
  },

  // AI Feedback
  aiTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
    color: '#fbbf24',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 12,
  },
  gridLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 9,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  gridVal: {
    fontFamily: 'Outfit_900Black',
    fontSize: 18,
    color: '#34d399',
  },
  feedbackSection: {
    marginTop: 10,
  },
  fbTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    color: '#fbbf24',
    marginBottom: 4,
  },
  fbText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 18,
  },
  fbErrorTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    color: '#fb7185',
    marginBottom: 8,
  },
  mistakeItem: {
    marginBottom: 10,
  },
  mistakeWrong: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#fda4af',
    textDecorationLine: 'line-through',
  },
  mistakeArrow: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#d1d5db',
  },
  mistakeCorrect: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#34d399',
  },
  mistakeExp: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  suggestionText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#d1d5db',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default ReviewModal;
