import React, { useRef, useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";        // v17: CameraView + startRecording API
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWebSocket } from "./context/WebSocketContext";
import { fileUriToArrayBuffer, zipSingleFileIfAvailable } from "../utils/wsHelpers";

const HOST = "15.165.244.204:8080";

export default function Driving() {
  const cameraRef = useRef<CameraView | null>(null);
  const { connect, close, sendJson, sendBinary, onceOpen, ref: wsRef } = useWebSocket();

  const [jwt, setJwt] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const drivingLoopRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [camPerm, setCamPerm] = useState(false);
  const [audPerm, setAudPerm] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) { Alert.alert("로그인 필요", "다시 로그인해주세요."); return; }
      setJwt(token);
    })();
  }, []);

  // 권한: expo-camera 쪽 API로 둘 다 요청 (v17 권장)
  useEffect(() => {
    (async () => {
      try {
        const { status: cs } = await Camera.requestCameraPermissionsAsync();
        setCamPerm(cs === "granted");
        const { status: ms } = await Camera.requestMicrophonePermissionsAsync();
        setAudPerm(ms === "granted");

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn("권한/오디오모드 실패:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (recording && !timerRef.current) timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    if (!recording && timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [recording]);

  useEffect(() => () => { if (recording) stopRecording(); }, [recording]);

  const formatTime = (n: number) => `${String(Math.floor(n/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;

  // ✅ CameraView 전용: 세그먼트 하나를 Promise로 감싸서 받기
  const recordOneSegment = () =>
    new Promise<string>((resolve, reject) => {
      if (!cameraRef.current) return reject(new Error("camera not ready"));

      // // v17: startRecording({ onRecordingFinished, onRecordingError, ... })
      // cameraRef.current.startRecording({
      //   maxDuration: 4,                // 4초 세그먼트
      //   quality: "480p" as any,
      //   isMuted: false,                // 마이크 사용
      //   onRecordingFinished: (video) => {
      //     // video.uri 형태
      //     resolve((video as any)?.uri);
      //   },
      //   onRecordingError: (err) => {
      //     reject(err);
      //   },
      // });
    });

  const stopNativeRecordingIfAny = () => {
    try { cameraRef.current?.stopRecording(); } catch {}
  };

  const startRecording = async () => {
    if (recording) return;
    if (!camPerm || !audPerm) return Alert.alert("권한 필요", "카메라/마이크 권한을 허용해주세요.");
    if (!cameraReady || !cameraRef.current) return Alert.alert("카메라 준비 중", "잠시 후 다시 시도해주세요.");
    if (!jwt) return Alert.alert("인증 오류", "로그인 토큰이 없습니다.");

    let startedSent = false;
    try {
      const url = `ws://${HOST}/ws/driving?token=${encodeURIComponent(`Bearer ${jwt}`)}`;
      await connect(url);
      await onceOpen();
      sendJson({ type: "START" });
      startedSent = true;

      setRecording(true);
      setElapsedTime(0);
      drivingLoopRef.current = true;

      // 짧은 워밍업 (안드로이드에서 중요)
      await new Promise(r => setTimeout(r, 250));

      while (drivingLoopRef.current) {
        console.log("[REC] start loop");

        // ⬇️ 여기서 세그먼트 하나 생성
        const uri = await recordOneSegment();               // ← 콜백 완료까지 대기
        console.log("[REC] finished segment:", uri);

        if (!uri) { console.log("[REC] no uri, break"); break; }

        const zipped = await zipSingleFileIfAvailable(uri);
        const buf = await fileUriToArrayBuffer(zipped);
        console.log("[REC] sendBinary size:", (buf as ArrayBuffer).byteLength);
        sendBinary(buf);

        // 루프 플래그가 내려가면 다음 세그먼트 시작 안 함
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("stopped before any data")) {
        // 네이티브 stop이 너무 빨리 들어가면 생김 → graceful stop으로 해결
        console.log("자연 종료 중(세그먼트 미생성):", msg);
      } else {
        console.warn("startRecording error:", e);
        Alert.alert("녹화 실패", "녹화 중 오류가 발생했습니다.");
      }
    } finally {
      // 안전 정리
      drivingLoopRef.current = false;
      stopNativeRecordingIfAny();      // 혹시 진행 중인 녹화가 있으면 종료
      setRecording(false);
      try { if (startedSent && wsRef.current?.readyState === WebSocket.OPEN) sendJson({ type: "END" }); } catch {}
      try { close(); } catch {}
    }
  };

  // ✅ Graceful stop: 네이티브 stop만 호출하고, 현재 세그먼트가 onRecordingFinished로 끝나도록
  const stopRecording = () => {
    drivingLoopRef.current = false;     // 다음 세그먼트 시작 막기
    stopNativeRecordingIfAny();         // 진행 중인 세그먼트는 종료 콜백으로 마무리
    setRecording(false);
    // END/close는 finally에서 처리
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />
      <View style={styles.timeContainer}><Text style={styles.timeText}>{formatTime(elapsedTime)}</Text></View>
      <View style={styles.buttonContainer}>
        <Button title={recording ? "녹화 중지 및 종료" : "녹화 시작"} onPress={recording ? stopRecording : startRecording} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { position: "absolute", bottom: 30, alignSelf: "center" },
  timeContainer: { position: "absolute", top: 30, left: "50%", transform: [{ translateX: -36 }], zIndex: 1 },
  timeText: { fontSize: 30, fontWeight: "bold", color: "white" },
});
