import React, { useRef, useState, useEffect } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { CameraView } from "expo-camera";

export default function Driving() {
  const cameraRef = useRef<CameraView>(null);
  const [recording, setRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 녹화 시간(초 단위)
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 타이머 참조

  // 녹화 시작
  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
      setElapsedTime(0); // 녹화 시작 시 시간 초기화
      const video = await cameraRef.current.recordAsync();
      console.log("저장된 경로:", video);
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
      setRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current); // 타이머 중지
    }
  };

  // 타이머 증가
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1); // 1초씩 증가
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current); // 녹화 중지 시 타이머 초기화
      }
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  // 시간 포맷 (00:01, 00:02, ...)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 카메라 뷰 */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        mute={false}
        mode="video"
        active={true}
      />

      {/* 시간 표시 */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          title={recording ? "녹화 중지 및 종료" : "녹화 시작"}
          onPress={recording ? stopRecording : startRecording}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  timeContainer: {
    position: "absolute",
    top: 30,
    left: "50%",
    transform: [{ translateX: -36}],
    zIndex: 1,
  },
  timeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
});
