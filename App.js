// App.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { evaluateAnswer } from './services/scoreEvaluator';
import { evaluateDialogueAnswer, getFinalResultMessage } from './services/dialogueEvaluator';

const dialogueQuestions = [
  "어제 뭐 하셨는지 기억나세요?",
  "오늘은 무슨 요일인 것 같으세요?",
  "최근 기분이 어땠는지 말씀해주실 수 있나요?",
  "최근에 누군가 만난 적 있으세요? 어떤 대화를 나누셨어요?",
];

const cognitiveQuestions = [
  "오늘은 몇 월 며칠인가요?",
  "100에서 7을 3번 빼면 얼마인가요?",
  "제가 세 단어를 말씀드릴게요. 사과, 버스, 병원 따라 말해주시고 꼭 기억해주세요.",
  "30초 이내에 동물 이름을 5개 이상 말해주세요",
  "아까 말씀드린 세 단어 기억나시나요? 말씀해주세요.",
];

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [latestUserText, setLatestUserText] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요. 치매 자가진단을 도와드릴게요. 먼저 잠깐 이야기 나눠볼까요?' }
  ]);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [dialogueScore, setDialogueScore] = useState(0);
  const [cognitiveScore, setCognitiveScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0];
      if (!text) return;
      setLatestUserText(text);
      setIsRecording(false);
    };

    Voice.onSpeechError = (e) => {
      Alert.alert('음성 인식 오류', JSON.stringify(e.error));
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    let question = '';
    if (dialogueIndex < dialogueQuestions.length) {
      question = dialogueQuestions[dialogueIndex];
    } else if (questionIndex >= 0 && questionIndex < cognitiveQuestions.length) {
      question = cognitiveQuestions[questionIndex];
    } else {
      return;
    }

    if (!showResult && question) {
      setMessages(prev => [...prev, { role: 'assistant', content: question }]);
      setCurrentQuestion(question);
      Tts.speak(question);
    }
  }, [dialogueIndex, questionIndex]);

  const startRecording = async () => {
    try {
      await Voice.start('ko-KR');
      setIsRecording(true);
      setLatestUserText('');
    } catch (err) {
      console.error('음성 인식 시작 오류:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (err) {
      console.error('음성 인식 중지 오류:', err);
    }
  };

  const handleAnswer = (text, method = 'unknown') => {
    if (!text.trim()) return;
  
    console.log(`\n📥 [${method === 'text' ? '텍스트 입력' : '음성 입력'}]`);
    console.log(`📌 질문 (${dialogueIndex < dialogueQuestions.length ? '대화' : '인지'} ${dialogueIndex < dialogueQuestions.length ? dialogueIndex + 1 : questionIndex + 1}): ${currentQuestion}`);
    console.log(`👤 사용자 답변: ${text}`);
  
    setMessages(prev => [...prev, { role: 'user', content: text }]);
  
    if (dialogueIndex < dialogueQuestions.length) {
      const point = evaluateDialogueAnswer(dialogueIndex, text);
      setDialogueScore(prev => {
        console.log(`✅ 획득 점수: ${point} | 누적 대화 점수: ${prev + point}`);
        return prev + point;
      });
  
      if (dialogueIndex === dialogueQuestions.length - 1) {
        setDialogueIndex(dialogueQuestions.length);
        setQuestionIndex(0);
      } else {
        setDialogueIndex(prev => prev + 1);
      }
  
      setLatestUserText('');
      return;
    }
  
    if (questionIndex >= 0 && questionIndex < cognitiveQuestions.length) {
      const point = evaluateAnswer(questionIndex, text);
      setCognitiveScore(prev => {
        console.log(`✅ 획득 점수: ${point} | 누적 인지 점수: ${prev + point}`);
        return prev + point;
      });
  
      if (questionIndex === cognitiveQuestions.length - 1) {
        setShowResult(true);
      } else {
        setQuestionIndex(prev => prev + 1);
      }
  
      setLatestUserText('');
    }
  };
  

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧠 치매 자가진단 (음성 + 텍스트)</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {latestUserText ? (
          <View style={styles.userBox}>
            <Text style={styles.userTitle}>👤 사용자 발화</Text>
            <Text style={styles.userText}>{latestUserText}</Text>
          </View>
        ) : null}

        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🤖 GPT 질문</Text>
          <Text style={styles.resultText}>{currentQuestion}</Text>
        </View>

        {!showResult && (
          <>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.toggleButton, {
                  backgroundColor: isRecording ? '#FDE2E4' : '#E0F2F1',
                  borderColor: isRecording ? '#F43F5E' : '#10B981'
                }]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Text style={[styles.toggleButtonText, { color: isRecording ? '#F43F5E' : '#10B981' }]}>  
                  {isRecording ? '말하기 종료' : '말하기 시작'}
                </Text>
              </TouchableOpacity>

              {latestUserText ? (
                <TouchableOpacity
                  style={[styles.toggleButton, { backgroundColor: '#3B82F6', borderColor: '#2563EB' }]}
                  onPress={() => handleAnswer(latestUserText)}
                >
                  <Text style={[styles.toggleButtonText, { color: '#fff' }]}>전송</Text>
                </TouchableOpacity>
              ) : null}

              {latestUserText ? (
                <TouchableOpacity
                  style={[styles.toggleButton, { backgroundColor: '#FCA5A5', borderColor: '#DC2626' }]}
                  onPress={startRecording}
                >
                  <Text style={[styles.toggleButtonText, { color: '#DC2626' }]}>다시 말하기</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.inputSection}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="답변을 입력하세요"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity
                style={styles.textSendBtn}
                onPress={() => {
                  handleAnswer(inputText);
                  setInputText('');
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>텍스트 전송</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showResult && (
          <View style={styles.resultSummary}>
            <Text style={styles.resultTitle}>📊 검사 결과 요약</Text>
            <Text style={styles.resultScore}>총점: {dialogueScore + cognitiveScore} / 30</Text>
            <Text style={styles.resultExplanation}>{getFinalResultMessage(dialogueScore + cognitiveScore)}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#6A0DAD', paddingVertical: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  userBox: {
    borderWidth: 1.5, borderColor: '#60A5FA', borderRadius: 12,
    padding: 12, backgroundColor: '#F0F9FF', marginBottom: 12,
  },
  userTitle: { fontWeight: 'bold', marginBottom: 4, fontSize: 14, color: '#2563EB' },
  userText: { fontSize: 15, color: '#111827' },
  resultBox: {
    borderWidth: 2, borderColor: '#A78BFA', borderRadius: 15,
    padding: 15, marginBottom: 20, backgroundColor: '#F8F8FF', minHeight: 100,
  },
  resultTitle: { fontWeight: 'bold', marginBottom: 8, fontSize: 14, color: '#7C3AED' },
  resultText: { fontSize: 16, color: '#333' },
  buttonGroup: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16,
    flexWrap: 'wrap', gap: 6
  },
  toggleButton: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  toggleButtonText: { fontSize: 16, fontWeight: 'bold' },
  resultSummary: { marginTop: 30, backgroundColor: '#FFF7ED', borderRadius: 10, padding: 20 },
  resultScore: {
    fontSize: 18,
    marginTop: 10,
    color: '#1e293b',
  },
  resultExplanation: { fontSize: 16, marginTop: 10, color: '#4B5563' },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10
  },
  textInput: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#111827',
  },
  textSendBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});

export default App;
