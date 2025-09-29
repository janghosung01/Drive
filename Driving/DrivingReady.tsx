import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { Audio } from "expo-av";
import { useWebSocket } from "./context/WebSocketContext";
const WS_URL = "ws://<백엔드주소>:<포트>/driving";

export default function DrivingReady() {
  const navigation = useNavigation();
  const [status, setStatus] = useState("주행 준비중...");
  const wsRef = useWebSocket();

  useEffect(() => {
    const prepare = async () => {
      try {
        // 권한 요청
        const { status: camStatus } = await Camera.requestCameraPermissionsAsync();
        const { status: micStatus } = await Audio.requestPermissionsAsync();

        if (camStatus !== "granted" || micStatus !== "granted") {
          setStatus("권한 거부됨");
          setTimeout(() => {
            navigation.navigate("DrivingScreen" as never);
          }, 1000);
          return;
        }

        // 소켓 연결
        wsRef.current = new WebSocket(WS_URL);
        wsRef.current.onopen = () => {
          setStatus("연결 성공! 주행 화면으로 이동합니다...");
          setTimeout(() => {
            navigation.navigate("Driving" as never);
          }, 1000);
        };
        wsRef.current.onerror = () => setStatus("서버 연결 실패");
      } catch (e) {
        setStatus("에러 발생");
      }
    };
    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3478F6" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { marginTop: 20, fontSize: 16, color: "#333" },
});
