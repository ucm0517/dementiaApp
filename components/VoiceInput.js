// components/VoiceInput.js
import React, { useEffect, useState } from 'react';
import { View, Button, Text, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import Voice from '@react-native-voice/voice';

const VoiceInput = ({ onTextDetected }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (event) => {
      if (event.value) {
        const text = event.value[0];
        setRecognizedText(text);
        onTextDetected(text);  // 부모로 결과 전달
      }
    };

    Voice.onSpeechError = (event) => {
      console.error('음성 인식 에러:', event.error);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.warn('🎤 마이크 권한이 필요합니다');
      return;
    }

    try {
      setRecognizedText('');
      setIsRecording(true);
      await Voice.start('ko-KR');
    } catch (e) {
      console.error('음성 시작 실패:', e);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await Voice.stop();
    } catch (e) {
      console.error('음성 종료 실패:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🎤 음성 인식</Text>
      <View style={styles.buttons}>
        <Button title="말하기 시작" onPress={startRecording} disabled={isRecording} />
        <Button title="말하기 종료" onPress={stopRecording} disabled={!isRecording} />
      </View>
      <Text style={styles.resultLabel}>📝 인식된 텍스트:</Text>
      <Text style={styles.result}>{recognizedText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 20, textAlign: 'center', marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  resultLabel: { fontSize: 16 },
  result: { fontSize: 18, fontWeight: 'bold', marginTop: 5 },
});

export default VoiceInput;
