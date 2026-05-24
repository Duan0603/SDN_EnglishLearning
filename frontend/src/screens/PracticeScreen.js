import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  TextInput,
  Animated,
  Easing
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

const PracticeScreen = ({ navigation, route }) => {
  const initialTab = route?.params?.screen || 'WritingAI';
  const [activeTab, setActiveTab] = useState(initialTab === 'WritingSubmit' ? 'WritingAI' : initialTab);
  
  // States cho Writing AI
  const [writingInput, setWritingInput] = useState(
    "In recent years, the consumption of fast food has increased dramatically. Some people believe that this trend has a negative impact on individuals and society, and they think that taxes on fast food should be increased to solve this problem. Personally, I am agree with this viewpoint because fast food causes many health issues."
  );
  const [isAnalyzingWriting, setIsAnalyzingWriting] = useState(false);
  const [showWritingResult, setShowWritingResult] = useState(false);

  // States cho Speaking AI
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [showSpeakingResult, setShowSpeakingResult] = useState(false);
  const [speakingText, setSpeakingText] = useState("");
  const recordingTimer = useRef(null);

  // Animation cho sóng âm Speaking
  const waveAnim1 = useRef(new Animated.Value(10)).current;
  const waveAnim2 = useRef(new Animated.Value(15)).current;
  const waveAnim3 = useRef(new Animated.Value(8)).current;
  const waveAnim4 = useRef(new Animated.Value(20)).current;

  // Xử lý đếm giờ và sinh text mô phỏng Whisper STT khi ghi âm Speaking
  useEffect(() => {
    if (isRecording) {
      // Loop animations cho sóng âm
      const createWaveAnimation = (anim, toVal) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: toVal,
              duration: 350,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 5,
              duration: 350,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
          ])
        );
      };

      const anims = [
        createWaveAnimation(waveAnim1, 35),
        createWaveAnimation(waveAnim2, 45),
        createWaveAnimation(waveAnim3, 30),
        createWaveAnimation(waveAnim4, 50),
      ];

      anims.forEach(a => a.start());

      recordingTimer.current = setInterval(() => {
        setRecordingSeconds(prev => {
          const nextSec = prev + 1;
          // Mô phỏng text Whisper nhận diện theo thời gian thực
          if (nextSec === 2) setSpeakingText("Describe a memorable... a memorable event in your life...");
          if (nextSec === 5) setSpeakingText("Describe a memorable event in your life. I would like to talking about...");
          if (nextSec === 8) setSpeakingText("Describe a memorable event in your life. I would like to talking about my graduation day. It was extremely... beautiful day and I feel very proud...");
          return nextSec;
        });
      }, 1000);
    } else {
      clearInterval(recordingTimer.current);
      setRecordingSeconds(0);
      waveAnim1.setValue(10);
      waveAnim2.setValue(15);
      waveAnim3.setValue(8);
      waveAnim4.setValue(20);
    }

    return () => clearInterval(recordingTimer.current);
  }, [isRecording]);

  const handleStartRecording = () => {
    setShowSpeakingResult(false);
    setSpeakingText("");
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Sau khi dừng, tự động hiển thị kết quả phân tích AI cực đẹp
    setShowSpeakingResult(true);
  };

  const handleWritingAnalyze = () => {
    setIsAnalyzingWriting(true);
    setTimeout(() => {
      setIsAnalyzingWriting(false);
      setShowWritingResult(true);
    }, 2000); // 2 giây mô phỏng phân tích AI
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F9FA]">
      {/* Premium Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          className="flex-row items-center"
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E1E1E" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
          <Text className="text-xl font-black text-[#1E1E1E] ml-2 tracking-tight">Apex AI Workspace</Text>
        </TouchableOpacity>
        
        {/* Navigation Tabs */}
        <View className="flex-row space-x-1 bg-[#F7F9FA] p-1 rounded-full border border-[#E5E7EB]">
          {[
            { id: 'WritingAI', label: 'Writing AI' },
            { id: 'SpeakingAI', label: 'Speaking AI' },
            { id: 'ReadingAnalysis', label: 'Reading & History' }
          ].map(tab => (
            <TouchableOpacity 
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full ${activeTab === tab.id ? 'bg-[#00CC99]' : ''}`}
            >
              <Text className={`text-xs font-black ${activeTab === tab.id ? 'text-white' : 'text-[#6B7280]'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Workspace Body */}
      {activeTab === 'WritingAI' && (
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Header Title */}
          <View className="mb-6">
            <View className="bg-[#E6F9F5] px-3.5 py-1 rounded-full self-start mb-2.5 border border-[#A7F3D0]">
              <Text className="text-[#005C42] text-[10px] font-extrabold uppercase tracking-widest">📝 Task 2 Essay Analyzer</Text>
            </View>
            <Text className="text-3xl font-black text-[#1E1E1E] tracking-tight">Writing AI Grading</Text>
            <Text className="text-sm text-[#6B7280] mt-1.5 leading-5">
              Submit your essay below. Our deep neural networks evaluate grammar, coherence, vocabulary, and task achievement instantly.
            </Text>
          </View>

          {/* Input Area */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs mb-6">
            <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Prompt Input / Topic</Text>
            <Text className="text-sm font-bold text-[#1E1E1E] mb-4 leading-5 bg-[#F7F9FA] p-4 rounded-2xl border border-[#E5E7EB]">
              "Some people believe that fast food should be taxed higher to encourage healthy eating. To what extent do you agree or disagree?"
            </Text>

            <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Your Essay Response</Text>
            <TextInput
              multiline
              value={writingInput}
              onChangeText={setWritingInput}
              placeholder="Start typing your essay here (minimum 250 words)..."
              className="text-sm text-[#1E1E1E] font-medium min-h-[160px] bg-white border border-[#E5E7EB] rounded-2xl p-4 leading-6"
              textAlignVertical="top"
            />
            
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-xs font-bold text-[#6B7280]">
                Word count: <Text className="text-[#00CC99] font-black">{writingInput.split(/\s+/).filter(Boolean).length}</Text> words
              </Text>
              
              <TouchableOpacity 
                onPress={handleWritingAnalyze}
                disabled={isAnalyzingWriting}
                className="bg-[#00CC99] px-6 py-3 rounded-xl active:opacity-90 flex-row items-center"
              >
                {isAnalyzingWriting ? (
                  <Text className="text-white text-xs font-bold">Analyzing with LLMs...</Text>
                ) : (
                  <>
                    <Text className="text-white text-xs font-bold mr-1.5">Analyze Essay</Text>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                      <Path d="M5 12h14M12 5l7 7-7 7" />
                    </Svg>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Result Section */}
          {showWritingResult && (
            <View className="mb-10 space-y-6">
              {/* Overall & Criteria scores */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-[#F3F4F6]">
                  <View>
                    <Text className="text-xs font-bold text-[#9CA3AF] uppercase">AI Prediction</Text>
                    <Text className="text-2xl font-black text-[#1E1E1E]">Evaluation Report</Text>
                  </View>
                  <View className="bg-[#E6F9F5] border border-[#A7F3D0] rounded-2xl px-5 py-2 items-center flex-row">
                    <Text className="text-xs font-bold text-[#005C42] mr-2">Band</Text>
                    <Text className="text-3xl font-black text-[#00CC99]">7.0</Text>
                  </View>
                </View>

                {/* 4 Standard Criteria Scores */}
                <Text className="text-xs font-black text-[#1E1E1E] uppercase tracking-wider mb-4">IELTS Core Criteria Metrics</Text>
                <View className="space-y-4">
                  {[
                    { name: 'Task Achievement (TA)', score: 7.0, progress: 'w-[70%]', desc: 'Fully addresses all parts of the task with a clear position.' },
                    { name: 'Coherence & Cohesion (CC)', score: 6.5, progress: 'w-[65%]', desc: 'Information is organized logically with clear progression.' },
                    { name: 'Lexical Resource (LR)', score: 7.5, progress: 'w-[75%]', desc: 'Uses a wide range of vocabulary with natural style.' },
                    { name: 'Grammatical Range & Accuracy (GRA)', score: 6.5, progress: 'w-[65%]', desc: 'Good sentence structures but contains slight minor errors.' }
                  ].map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs font-bold text-[#1E1E1E]">{item.name}</Text>
                        <Text className="text-xs font-black text-[#00CC99]">{item.score}</Text>
                      </View>
                      <View className="w-full h-2 bg-[#F7F9FA] rounded-full overflow-hidden mb-1">
                        <View className={`h-full bg-[#00CC99] rounded-full ${item.progress}`} />
                      </View>
                      <Text className="text-[10px] text-[#6B7280] leading-4">{item.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Grammar Corrections */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <Text className="text-base font-extrabold text-[#1E1E1E] mb-4">Detailed Sentence Corrections</Text>
                <View className="space-y-4">
                  {/* Error 1 */}
                  <View className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-red-100 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-[10px] font-extrabold text-red-600">ORIGINAL</Text>
                      </View>
                      <Text className="text-xs text-red-500 font-semibold line-through">"Personally, I am agree with this viewpoint..."</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-[10px] font-extrabold text-emerald-600">CORRECTED</Text>
                      </View>
                      <Text className="text-xs text-emerald-600 font-bold">"Personally, I agree with this viewpoint..."</Text>
                    </View>
                    <Text className="text-[11px] text-[#6B7280] leading-4 mt-2">
                      <Text className="font-extrabold text-[#1E1E1E]">Explanation: </Text>
                      The verb <Text className="font-bold text-[#005C42]">'agree'</Text> is not an adjective; it does not require the auxiliary verb <Text className="text-red-500 font-bold">'am'</Text> in this context.
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Model Rewrite */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row items-center mb-4">
                  <View className="w-7 h-7 bg-[#E6F9F5] rounded-full items-center justify-center border border-[#A7F3D0] mr-2">
                    <Text className="text-xs">✨</Text>
                  </View>
                  <Text className="text-base font-extrabold text-[#1E1E1E]">AI Model Rewrite (Band 8.5+)</Text>
                </View>
                <Text className="text-sm text-[#6B7280] leading-6 italic">
                  "Over the past few decades, fast food consumption has escalated exponentially. While certain demographics suggest this phenomenon poses a significant threat to individual well-being and broader public health, others advocate for raising levies on fast-food products as an effective mitigation strategy. I am strongly aligned with this perspective, as dietary habits heavily dictate long-term societal well-being."
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'SpeakingAI' && (
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Header Title */}
          <View className="mb-6">
            <View className="bg-[#FFF7ED] px-3.5 py-1 rounded-full self-start mb-2.5 border border-[#FED7AA]">
              <Text className="text-[#C2410C] text-[10px] font-extrabold uppercase tracking-widest">🎙️ Whisper Real-Time STT</Text>
            </View>
            <Text className="text-3xl font-black text-[#1E1E1E] tracking-tight">Speaking AI Grading</Text>
            <Text className="text-sm text-[#6B7280] mt-1.5 leading-5">
              Click the microphone button to record your response. Whisper STT detects your pronunciation and LLM evaluates detailed indicators.
            </Text>
          </View>

          {/* Cue Card Question */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs mb-6">
            <Text className="text-xs font-extrabold text-[#F97316] uppercase tracking-wider mb-2">Cue Card Question</Text>
            <Text className="text-base font-extrabold text-[#1E1E1E] mb-2 leading-5">
              Describe a memorable event in your life.
            </Text>
            <Text className="text-xs text-[#6B7280] leading-5">
              You should say:{"\n"}
              • What the event was and when it occurred{"\n"}
              • Who was there with you{"\n"}
              • And explain why it is so memorable to you.
            </Text>
          </View>

          {/* Recording UI */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-8 shadow-xs items-center justify-center mb-6">
            {isRecording ? (
              <View className="items-center">
                {/* Waveform Visualization Mockup */}
                <View className="flex-row items-center justify-center space-x-2 h-16 mb-6 px-10">
                  {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim2, waveAnim1].map((anim, i) => (
                    <Animated.View 
                      key={i} 
                      style={{ height: anim }}
                      className="w-1.5 bg-[#00CC99] rounded-full"
                    />
                  ))}
                </View>

                <Text className="text-2xl font-black text-[#005C42] mb-1">
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                </Text>
                <Text className="text-xs font-bold text-red-500 animate-pulse mb-8 uppercase tracking-widest">
                  🎙️ Recording live stream
                </Text>

                {/* Real-time Whisper STT Display */}
                <View className="w-full bg-[#F7F9FA] border border-[#E5E7EB] p-4 rounded-2xl mb-8 min-w-[280px]">
                  <Text className="text-xs font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-2">Whisper STT Real-Time Transcript</Text>
                  <Text className="text-sm font-semibold text-[#1E1E1E] italic leading-6">
                    {speakingText || "Listening to speech stream..."}
                  </Text>
                </View>

                <TouchableOpacity 
                  onPress={handleStopRecording}
                  className="w-16 h-16 bg-red-500 rounded-full items-center justify-center border-4 border-white shadow-lg active:opacity-90"
                >
                  <View className="w-6 h-6 bg-white rounded-md" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center py-6">
                <TouchableOpacity 
                  onPress={handleStartRecording}
                  className="w-20 h-20 bg-[#E6F9F5] border-4 border-white rounded-full items-center justify-center shadow-lg active:opacity-90 mb-4"
                >
                  <View className="w-14 h-14 bg-[#00CC99] rounded-full items-center justify-center">
                    <Svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                      <Path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <Path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </Svg>
                  </View>
                </TouchableOpacity>
                <Text className="text-base font-extrabold text-[#1E1E1E]">Tap to Record Response</Text>
                <Text className="text-xs text-[#6B7280] mt-1">Make sure you are in a quiet room</Text>
              </View>
            )}
          </View>

          {/* Speaking Result Section */}
          {showSpeakingResult && (
            <View className="mb-10 space-y-6">
              {/* Score card */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <View className="flex-row justify-between items-center mb-6 pb-4 border-b border-[#F3F4F6]">
                  <View>
                    <Text className="text-xs font-bold text-[#9CA3AF] uppercase">Acoustic Grading</Text>
                    <Text className="text-2xl font-black text-[#1E1E1E]">Overall Band</Text>
                  </View>
                  <View className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl px-5 py-2 items-center flex-row">
                    <Text className="text-xs font-bold text-[#C2410C] mr-2">Band</Text>
                    <Text className="text-3xl font-black text-[#F97316]">7.5</Text>
                  </View>
                </View>

                {/* Criterion */}
                <Text className="text-xs font-black text-[#1E1E1E] uppercase tracking-wider mb-4">Acoustic & Pronunciation Metrics</Text>
                <View className="space-y-4">
                  {[
                    { name: 'Pronunciation (Phonetics)', score: 7.5, progress: 'w-[75%]', desc: 'Generally clear with minor phoneme issues.' },
                    { name: 'Fluency & Coherence', score: 7.0, progress: 'w-[70%]', desc: 'Sustains speech flow with natural pauses.' },
                    { name: 'Lexical Richness', score: 8.0, progress: 'w-[80%]', desc: 'Demonstrates sophisticated, varied vocabulary.' },
                    { name: 'Grammar Accuracy & Range', score: 7.0, progress: 'w-[70%]', desc: 'Occasional errors but displays high structures.' }
                  ].map((item, idx) => (
                    <View key={idx}>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xs font-bold text-[#1E1E1E]">{item.name}</Text>
                        <Text className="text-xs font-black text-[#F97316]">{item.score}</Text>
                      </View>
                      <View className="w-full h-2 bg-[#F7F9FA] rounded-full overflow-hidden mb-1">
                        <View className={`h-full bg-[#F97316] rounded-full ${item.progress}`} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Transcript & Highlights */}
              <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-6 shadow-xs">
                <Text className="text-base font-extrabold text-[#1E1E1E] mb-3">Pronunciation Review</Text>
                <Text className="text-xs text-[#6B7280] mb-4">
                  We highlighted words that need phonetic adjustment. Click on them to see IPA correction.
                </Text>
                
                {/* Paragraph with highlighting */}
                <View className="p-4 bg-[#F7F9FA] rounded-2xl border border-[#E5E7EB] flex-row flex-wrap">
                  <Text className="text-sm font-semibold text-[#1E1E1E] leading-7">
                    I would like to{" "}
                    <Text className="text-red-500 bg-red-100 px-1 py-0.5 rounded font-black border border-red-200">talking</Text>
                    {" "}about my graduation day. It was an{" "}
                    <Text className="text-red-500 bg-red-100 px-1 py-0.5 rounded font-black border border-red-200">extremely</Text>
                    {" "}beautiful day.
                  </Text>
                </View>

                {/* Highlight Explanation Detail */}
                <View className="mt-5 space-y-3">
                  <View className="bg-red-50/50 border border-red-200 p-4.5 rounded-2xl flex-row items-start">
                    <Text className="text-lg mr-3">❌</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-extrabold text-red-500">talking</Text>
                      <Text className="text-xs font-semibold text-[#1E1E1E] mt-1">
                        Grammar error + Pronunciation: /tɔːk.ɪŋ/ should be simple infinitive <Text className="font-black text-emerald-600">"talk" /tɔːk/</Text> after "would like to".
                      </Text>
                    </View>
                  </View>

                  <View className="bg-red-50/50 border border-red-200 p-4.5 rounded-2xl flex-row items-start">
                    <Text className="text-lg mr-3">❌</Text>
                    <View className="flex-1">
                      <Text className="text-xs font-extrabold text-red-500">extremely</Text>
                      <Text className="text-xs font-semibold text-[#1E1E1E] mt-1">
                        Phonetic stress issue on syllable. Target IPA: <Text className="font-black text-[#005C42]">/ɪkˈstriːm.li/</Text>. You omitted the /k/ sound during high fluency acceleration.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'ReadingAnalysis' && (
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Performance Analysis</Text>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-[28px] font-extrabold text-[#1E1E1E] tracking-tight">Reading Score: 8.5</Text>
              <View className="bg-[#00CC99] px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-extrabold">+0.5 Band</Text>
              </View>
            </View>
          </View>

          {/* Chart Wrapper Card */}
          <View className="bg-white rounded-[32px] border border-[#E5E7EB] p-5 mb-5">
            {/* Filter Toggle */}
            <View className="flex-row justify-end space-x-1 mb-4">
              <View className="bg-[#1E1E1E] px-3.5 py-1.5 rounded-lg">
                <Text className="text-white text-[11px] font-bold">Last 10</Text>
              </View>
              <View className="bg-[#F7F9FA] px-3.5 py-1.5 rounded-lg">
                <Text className="text-[#6B7280] text-[11px] font-bold">All Time</Text>
              </View>
            </View>

            {/* Line Chart Mockup using high-quality SVG */}
            <View className="h-32 justify-center items-center">
              <Svg width="100%" height="110" viewBox="0 0 300 110">
                {/* Grid Lines */}
                <Path d="M0 25h300M0 55h300M0 85h300" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="3" />
                
                {/* SVG Polyline for reading score progress line */}
                <Path 
                  d="M10 80 L40 73 L70 90 L100 70 L130 72 L160 55 L190 60 L220 40 L250 30 L280 43 L290 28" 
                  fill="none" 
                  stroke="#00CC99" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />

                {/* Accent point at the end */}
                <Circle cx="290" cy="28" r="4.5" fill="#00CC99" stroke="#FFF" strokeWidth="1.5" />
              </Svg>
            </View>

            {/* Timeline tags */}
            <View className="flex-row justify-between mt-3 px-1 border-t border-[#E5E7EB] pt-3">
              <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase">Test 01</Text>
              <Text className="text-[10px] font-bold text-[#9CA3AF] uppercase">Test 10</Text>
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View className="flex-row justify-between mb-5">
            {/* Avg Time */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-[#E5E7EB]">
              <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Average Time</Text>
              <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-2 mb-1.5">18:42</Text>
              <Text className="text-xs font-bold text-[#00CC99]">Fast Pace</Text>
            </View>

            {/* Accuracy */}
            <View className="w-[48%] bg-white p-5 rounded-[24px] border border-[#E5E7EB]">
              <Text className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Accuracy</Text>
              <Text className="text-2xl font-extrabold text-[#1E1E1E] mt-2 mb-1.5">92.4%</Text>
              <Text className="text-xs font-bold text-[#005C42]">Top 5%</Text>
            </View>
          </View>

          {/* Target Gap Card */}
          <View className="bg-[#1E1E1E] p-6 rounded-[28px] flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs font-semibold text-white/60 uppercase tracking-wider">Target Gap</Text>
              <Text className="text-2xl font-bold text-white mt-1.5">-0.5 to Elite 9.0</Text>
            </View>
            <View className="w-11 h-11 bg-[#00CC99] rounded-full items-center justify-center">
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5">
                <Circle cx="12" cy="12" r="10" />
                <Circle cx="12" cy="12" r="6" />
                <Circle cx="12" cy="12" r="2" />
              </Svg>
            </View>
          </View>

          {/* Historical Milestones */}
          <Text className="text-xl font-bold text-[#1E1E1E] mb-4 tracking-tight">Historical Milestones</Text>

          {/* Milestones Cards List */}
          <View className="space-y-3 mb-8">
            <View className="bg-white p-4.5 rounded-[24px] border border-[#E5E7EB] flex-row justify-between items-center px-5">
              <View className="flex-row items-center flex-1 pr-3">
                <View className="w-9 h-9 bg-[#F7F9FA] rounded-xl items-center justify-center mr-3 border border-[#E5E7EB]">
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <Path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18" />
                  </Svg>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#1E1E1E]" numberOfLines={1}>Academic Reading Test 12</Text>
                  <Text className="text-[11px] text-[#9CA3AF] font-semibold mt-1">Yesterday • 14:30</Text>
                </View>
              </View>
              <Text className="text-lg font-extrabold text-[#005C42]">8.5</Text>
            </View>

            <View className="bg-white p-4.5 rounded-[24px] border border-[#E5E7EB] flex-row justify-between items-center px-5">
              <View className="flex-row items-center flex-1 pr-3">
                <View className="w-9 h-9 bg-[#F7F9FA] rounded-xl items-center justify-center mr-3 border border-[#E5E7EB]">
                  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                    <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </Svg>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-[#1E1E1E]" numberOfLines={1}>True/False/Not Given Drill</Text>
                  <Text className="text-[11px] text-[#9CA3AF] font-semibold mt-1">2 days ago</Text>
                </View>
              </View>
              <Text className="text-lg font-extrabold text-[#9CA3AF]">7.5</Text>
            </View>
          </View>

          {/* Action buttons footer */}
          <View className="flex-row space-x-3 mb-12">
            <TouchableOpacity 
              onPress={() => setActiveTab('WritingAI')}
              className="flex-1 border-2 border-[#1E1E1E] py-4.5 rounded-[20px] items-center justify-center active:opacity-80"
            >
              <Text className="text-[#1E1E1E] text-base font-bold">Review Errors</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Exam', { testType: 'Reading' })}
              className="flex-1 bg-[#00CC99] py-4.5 rounded-[20px] items-center justify-center active:opacity-90 shadow-sm"
            >
              <Text className="text-white text-base font-bold">Practice More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PracticeScreen;
