import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert
} from 'react-native';
import Svg, { Path, Circle, Polyline } from 'react-native-svg';

const ExamScreen = ({ route, navigation }) => {
  // Lấy kỹ năng từ params (mặc định là Reading)
  const { testType } = route.params || { testType: 'Reading' };
  
  // Trạng thái các Tab trong bài thi Reading (Passage vs Questions)
  const [activeTab, setActiveTab] = useState('passage'); // 'passage' or 'questions'
  
  // Trạng thái đếm ngược thời gian (Reading: 60 phút = 3600s, Listening: 30 phút = 1800s)
  const initialTime = testType === 'Reading' ? 3600 : 1800;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  // Trạng thái các câu trả lời
  const [answers, setAnswers] = useState({
    q1: '', // MCQ
    q2: '', // True/False/Not Given
    q3: '', // True/False/Not Given
    q4: '', // Fill in the blank
    q5: '', // Fill in the blank
  });

  // Trạng thái hiển thị Confirm Modal khi nộp bài
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Audio Player State (Dành cho Listening)
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0.35); // Giả lập thanh chạy tiến trình audio (35%)

  // Tra cứu từ vựng khó thông minh (AI Vocabulary Helper)
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  // Bộ đếm ngược thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format thời gian thành MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tự động nộp bài khi hết giờ
  const handleAutoSubmit = () => {
    Alert.alert("Time's Up!", "Your answers have been automatically submitted.", [
      { text: "View Results", onPress: () => handleSubmit() }
    ]);
  };

  // Nộp bài thủ công
  const handleSubmit = () => {
    setShowSubmitModal(false);
    // Điều hướng sang trang Practice và hiển thị đúng kết quả chấm thi
    navigation.navigate('Practice', { 
      screen: testType === 'Reading' ? 'ReadingAnalysis' : 'WritingAI',
      score: testType === 'Reading' ? '8.5' : 'Grading'
    });
  };

  // Xử lý click vào từ vựng khó
  const handleWordPress = (word, definition, ipa) => {
    setSelectedWord({ word, definition, ipa });
    setShowVocabModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <TouchableOpacity 
          onPress={() => {
            Alert.alert("Quit Test?", "All your progress in this session will be lost.", [
              { text: "Cancel", style: "cancel" },
              { text: "Quit", style: "destructive", onPress: () => navigation.goBack() }
            ]);
          }}
          className="w-10 h-10 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB] active:opacity-80"
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-widest">{testType} Simulation</Text>
          <Text className="text-base font-bold text-[#1E1E1E] mt-0.5 font-sans">IELTS Prep - Test 08</Text>
        </View>

        {/* Nút đếm ngược thời gian cực đẹp */}
        <View className="flex-row items-center bg-[#FEF2F2] border border-[#FCA5A5]/20 px-3 py-2 rounded-2xl">
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
          </Svg>
          <Text className="text-xs font-extrabold text-[#EF4444] ml-1.5 font-mono">{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Switch Tab cho Reading (Chỉ hiện khi là Reading) */}
      {testType === 'Reading' && (
        <View className="flex-row bg-white px-6 py-2 border-b border-[#E5E7EB]">
          <TouchableOpacity 
            onPress={() => setActiveTab('passage')}
            className={`flex-1 py-3 items-center rounded-2xl ${activeTab === 'passage' ? 'bg-[#E6F9F5]' : 'bg-transparent'}`}
          >
            <Text className={`text-sm font-bold ${activeTab === 'passage' ? 'text-[#005C42]' : 'text-[#9CA3AF]'}`}>
              📖 Read Passage
            </Text>
          </TouchableOpacity>
          <View className="w-4" />
          <TouchableOpacity 
            onPress={() => setActiveTab('questions')}
            className={`flex-1 py-3 items-center rounded-2xl ${activeTab === 'questions' ? 'bg-[#E6F9F5]' : 'bg-transparent'}`}
          >
            <Text className={`text-sm font-bold ${activeTab === 'questions' ? 'text-[#005C42]' : 'text-[#9CA3AF]'}`}>
              ✏️ Answer Sheet
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Audio Player dành riêng cho Listening */}
      {testType === 'Listening' && (
        <View className="bg-white p-5 border-b border-[#E5E7EB]">
          <View className="bg-[#F7F9FA] border border-[#E5E7EB] p-4 rounded-[24px]">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-4">
                <TouchableOpacity 
                  onPress={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-[#00CC99] rounded-full items-center justify-center border border-[#005C42]/10 active:opacity-90"
                >
                  {isPlaying ? (
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#FFF" />
                    </Svg>
                  ) : (
                    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <Path d="M8 5v14l11-7z" fill="#FFF" />
                    </Svg>
                  )}
                </TouchableOpacity>
                <View className="ml-3">
                  <Text className="text-sm font-bold text-[#1E1E1E]">Section 1: Rental Inquiry</Text>
                  <Text className="text-xs text-[#9CA3AF] mt-0.5">IELTS Listening Band 8.5 Practice</Text>
                </View>
              </View>
              <Text className="text-xs font-mono font-bold text-[#1E1E1E]">09:12 / 30:00</Text>
            </View>

            {/* Thanh tiến trình phát Audio mượt mà */}
            <View className="w-full h-1.5 bg-[#E5E7EB] rounded-full mt-4 overflow-hidden">
              <View className="h-full bg-[#00CC99] rounded-full" style={{ width: `${audioProgress * 100}%` }} />
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          
          {/* PHẦN 1: NỘI DUNG BÀI ĐỌC (HIỆN KHI READING + ACTIVE TAB LÀ PASSAGE) */}
          {testType === 'Reading' && activeTab === 'passage' && (
            <View className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] mb-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-xs font-extrabold text-[#00CC99] uppercase tracking-widest">READING PASSAGE 1</Text>
                <View className="bg-[#E6F9F5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                  <Text className="text-[9px] font-extrabold text-[#005C42]">💡 Tap underlined words to translate</Text>
                </View>
              </View>
              <Text className="text-2xl font-black text-[#1E1E1E] leading-8 mb-4 tracking-tight font-sans">
                The Rise of Creative Urban Spaces
              </Text>
              
              <Text className="text-sm text-[#4B5563] leading-7 mb-4 font-medium font-sans">
                [Paragraph A] In the early decades of the twenty-first century, cities around the world have undergone a radical 
                <Text 
                  onPress={() => handleWordPress("transformation", "A marked change in form, nature, or appearance.", "/ˌtræns.fəˈmeɪ.ʃən/")}
                  className="text-[#00CC99] font-black underline"
                > transformation</Text>. Formerly industrial districts, once filled with abandoned warehouses and dusty factories, have been reborn as vibrant hubs of culture and technology. This trend, often referred to as the 
                <Text 
                  onPress={() => handleWordPress("creative", "Relating to or involving the imagination or original ideas.", "/kriˈeɪ.tɪv/")}
                  className="text-[#00CC99] font-black underline"
                > creative</Text> city movement, is not merely about aesthetic remodeling; it represents a fundamental shift in how urban economies operate. Instead of relying on traditional manufacturing, cities now compete to attract highly skilled workers in software development, design, and biomedical engineering.
              </Text>
              
              <Text className="text-sm text-[#4B5563] leading-7 mb-4 font-medium font-sans">
                [Paragraph B] At the heart of this rebirth are shared infrastructure projects. Shared workspaces, local maker spaces, and public-private innovation hubs have sprung up globally. Research shows that geographic 
                <Text 
                  onPress={() => handleWordPress("proximity", "Closeness in space, time, or relationship.", "/prɒkˈsɪm.ə.ti/")}
                  className="text-[#00CC99] font-black underline"
                > proximity</Text> between diverse industries sparks spontaneous collaboration and knowledge sharing. When developers work in close proximity to fashion designers and visual artists, new and unexpected ideas are forged. This cross-pollination has led to the emergence of multi-disciplinary fields, such as wearable technology and digital architecture.
              </Text>

              <Text className="text-sm text-[#4B5563] leading-7 mb-4 font-medium font-sans">
                [Paragraph C] However, the creative urban revolution is not without critics. Many sociologists point out that the influx of high-earning tech professionals leads to skyrocketing property values, forcing out long-term residents and local businesses. This 
                <Text 
                  onPress={() => handleWordPress("gentrification", "The process of renovating and improving a house or district so that it conforms to middle-class taste.", "/ˌdʒen.trɪ.fɪˈkeɪ.ʃən/")}
                  className="text-[#00CC99] font-black underline"
                > gentrification</Text> can strip a neighborhood of its original cultural diversity, the very element that attracted the creative class in the first place. Urban planners are now faced with the monumental task of fostering economic innovation while ensuring affordable housing and social equity.
              </Text>
            </View>
          )}

          {/* PHẦN 2: BẢNG CÂU HỎI (HIỆN KHI LISTENING HOẶC READING + ACTIVE TAB LÀ QUESTIONS) */}
          {((testType === 'Reading' && activeTab === 'questions') || testType === 'Listening') && (
            <View className="mb-28">
              
              {/* Card Dạng 1: Multiple Choice Question */}
              <View className="bg-white p-5 rounded-[28px] border border-[#E5E7EB] mb-4 shadow-xs">
                <View className="flex-row items-start mb-4">
                  <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5">
                    <Text className="text-sm font-extrabold text-[#005C42]">Q1</Text>
                  </View>
                  <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                    {testType === 'Reading' 
                      ? 'What is the main driver behind the creative city movement as described in Paragraph A?'
                      : 'What does the speaker identify as the main goal of the local community center project?'}
                  </Text>
                </View>

                {/* Các phương án lựa chọn trắc nghiệm */}
                {[
                  { key: 'A', text: testType === 'Reading' ? 'To restore historically significant manufacturing factories.' : 'To increase the city tourism revenue.' },
                  { key: 'B', text: testType === 'Reading' ? 'To shift the urban economy from manufacturing to knowledge-based industries.' : 'To provide affordable creative workspaces for local residents.' },
                  { key: 'C', text: testType === 'Reading' ? 'To decrease the density of high-skilled professionals in cities.' : 'To construct large industrial warehouses.' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setAnswers({ ...answers, q1: option.key })}
                    className={`flex-row items-center p-3.5 rounded-2xl border mb-2.5 active:opacity-90 ${
                      answers.q1 === option.key 
                        ? 'border-[#00CC99] bg-[#E6F9F5]' 
                        : 'border-[#E5E7EB] bg-transparent'
                    }`}
                  >
                    <View className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${
                      answers.q1 === option.key ? 'border-[#00CC99] bg-[#00CC99]' : 'border-[#D1D5DB]'
                    }`}>
                      {answers.q1 === option.key && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </View>
                    <Text className={`text-xs font-semibold flex-1 leading-5 font-sans ${
                      answers.q1 === option.key ? 'text-[#005C42]' : 'text-[#4B5563]'
                    }`}>
                      <Text className="font-extrabold">{option.key}.</Text> {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Card Dạng 2: True/False/Not Given */}
              <View className="bg-white p-5 rounded-[28px] border border-[#E5E7EB] mb-4 shadow-xs">
                <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                  Questions 2-3: True/False/Not Given
                </Text>
                
                {/* Câu hỏi 2 */}
                <View className="mb-5 border-b border-[#F3F4F6] pb-4">
                  <View className="flex-row items-start mb-3">
                    <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-sm font-extrabold text-[#005C42]">Q2</Text>
                    </View>
                    <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                      Geographic proximity between different industries prevents spontaneous collaboration.
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    {['TRUE', 'FALSE', 'NOT GIVEN'].map((choice) => (
                      <TouchableOpacity
                        key={choice}
                        onPress={() => setAnswers({ ...answers, q2: choice })}
                        className={`flex-1 py-2.5 px-1 items-center rounded-xl border mx-1 ${
                          answers.q2 === choice ? 'border-[#00CC99] bg-[#E6F9F5]' : 'border-[#E5E7EB]'
                        }`}
                      >
                        <Text className={`text-[10px] font-extrabold font-sans ${
                          answers.q2 === choice ? 'text-[#005C42]' : 'text-[#9CA3AF]'
                        }`}>{choice}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Câu hỏi 3 */}
                <View className="mb-2">
                  <View className="flex-row items-start mb-3">
                    <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5">
                      <Text className="text-sm font-extrabold text-[#005C42]">Q3</Text>
                    </View>
                    <Text className="flex-1 text-sm font-bold text-[#1E1E1E] leading-6 font-sans">
                      Rising property prices are causing some long-term residents to leave creative districts.
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    {['TRUE', 'FALSE', 'NOT GIVEN'].map((choice) => (
                      <TouchableOpacity
                        key={choice}
                        onPress={() => setAnswers({ ...answers, q3: choice })}
                        className={`flex-1 py-2.5 px-1 items-center rounded-xl border mx-1 ${
                          answers.q3 === choice ? 'border-[#00CC99] bg-[#E6F9F5]' : 'border-[#E5E7EB]'
                        }`}
                      >
                        <Text className={`text-[10px] font-extrabold font-sans ${
                          answers.q3 === choice ? 'text-[#005C42]' : 'text-[#9CA3AF]'
                        }`}>{choice}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Card Dạng 3: Fill In The Blanks */}
              <View className="bg-white p-5 rounded-[28px] border border-[#E5E7EB] mb-4 shadow-xs">
                <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-widest mb-3 font-sans">
                  Questions 4-5: Complete the Summary (Write NO MORE THAN ONE WORD)
                </Text>

                <View className="bg-[#F7F9FA] p-4 rounded-2xl border border-[#E5E7EB] mb-4">
                  <Text className="text-xs text-[#4B5563] leading-6 font-medium font-sans">
                    The creative city movement has triggered criticism due to the risk of gentrification. The arrival of high-earning 
                    <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [Q4] </Text> 
                    tends to drive up real estate prices. This eventually forces older residents out of their original 
                    <Text className="font-extrabold text-[#005C42] bg-[#E6F9F5] px-2 rounded font-sans"> [Q5] </Text>.
                  </Text>
                </View>

                {/* Ô nhập câu trả lời cho Q4 */}
                <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3 mb-3">
                  <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-xs font-extrabold text-[#005C42] font-sans">Q4</Text>
                  </View>
                  <TextInput
                    value={answers.q4}
                    onChangeText={(text) => setAnswers({ ...answers, q4: text })}
                    placeholder="Enter answer for Question 4"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Ô nhập câu trả lời cho Q5 */}
                <View className="flex-row items-center border border-[#E5E7EB] bg-white rounded-2xl p-3">
                  <View className="bg-[#E6F9F5] w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-xs font-extrabold text-[#005C42] font-sans">Q5</Text>
                  </View>
                  <TextInput
                    value={answers.q5}
                    onChangeText={(text) => setAnswers({ ...answers, q5: text })}
                    placeholder="Enter answer for Question 5"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-sm font-bold text-[#1E1E1E] p-0 font-sans"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Navigation Bar chứa nút Submit Test cực xịn */}
      <View className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-[#E5E7EB] flex-row items-center justify-between px-6 pb-4">
        <View>
          <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-sans">Progress</Text>
          <Text className="text-sm font-extrabold text-[#1E1E1E] mt-0.5 font-sans">
            {Object.values(answers).filter(v => v !== '').length} / 5 Answered
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setShowSubmitModal(true)}
          className="bg-[#00CC99] px-8 py-3.5 rounded-[20px] active:opacity-90 shadow-sm flex-row items-center"
        >
          <Text className="text-white text-base font-extrabold mr-2 font-sans">Submit Test</Text>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
            <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Premium Submit Test Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-6 rounded-t-[36px] border-t border-[#E5E7EB] min-h-[320px]">
            {/* Thanh bar nhỏ kéo xuống giả lập */}
            <View className="w-12 h-1 bg-[#E5E7EB] rounded-full self-center mb-6" />

            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-[#E6F9F5] rounded-full items-center justify-center mb-4">
                <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00CC99" strokeWidth="2.5">
                  <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text className="text-xl font-bold text-[#1E1E1E] text-center font-sans">Are you ready to submit?</Text>
              <Text className="text-sm text-[#9CA3AF] text-center mt-2 leading-5 px-6 font-sans">
                You have completed {Object.values(answers).filter(v => v !== '').length} out of 5 questions. AI Engine will instantly grade your test.
              </Text>
            </View>

            <View className="flex-row space-x-4 mb-4">
              <TouchableOpacity
                onPress={() => setShowSubmitModal(false)}
                className="flex-1 bg-[#F7F9FA] border border-[#E5E7EB] py-4 rounded-2xl items-center active:opacity-90"
              >
                <Text className="text-[#1E1E1E] text-sm font-bold font-sans">Keep Reviewing</Text>
              </TouchableOpacity>
              <View className="w-4" />
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 bg-[#00CC99] py-4 rounded-2xl items-center active:opacity-90"
              >
                <Text className="text-white text-sm font-bold font-sans">Submit Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tra cứu từ vựng thông minh (AI Vocab Helper Modal) */}
      <Modal
        visible={showVocabModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVocabModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full max-w-[340px] p-6 rounded-[32px] border border-[#E5E7EB]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-[#F3F4F6]">
              <View className="flex-row items-center">
                <Text className="text-lg font-black text-[#1E1E1E]">{selectedWord?.word}</Text>
                <Text className="text-xs text-[#00CC99] font-bold ml-2">{selectedWord?.ipa}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowVocabModal(false)}
                className="w-7 h-7 bg-[#F7F9FA] rounded-full items-center justify-center border border-[#E5E7EB]"
              >
                <Text className="text-xs font-bold text-[#6B7280]">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1.5">AI Dictionary Def</Text>
            <Text className="text-sm text-[#4B5563] leading-6 font-semibold mb-4 bg-[#F7F9FA] p-3.5 rounded-2xl border border-[#E5E7EB]">
              {selectedWord?.definition}
            </Text>

            <TouchableOpacity 
              onPress={() => setShowVocabModal(false)}
              className="bg-[#00CC99] py-3 rounded-xl items-center active:opacity-90"
            >
              <Text className="text-white text-xs font-extrabold">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ExamScreen;
