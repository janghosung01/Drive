// driving.tsx
import React, { useRef, useState, useEffect } from "react";
import { View, Button, StyleSheet, Text, Alert, Modal, ActivityIndicator } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Audio } from "expo-av";
import * as Speech from "expo-speech"; // ★ 추가: TTS
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useWebSocket } from "./context/WebSocketContext";
import { fileUriToArrayBuffer, zipSingleFileIfAvailable } from "../utils/wsHelpers";

const HOST = "15.165.244.204:8080";

function speakWithLogs(text: string, opts: Speech.SpeechOptions = {}) {
  console.log("[TTS] request:", text);
  Speech.speak(text, {
    language: "ko-KR",
    pitch: 1.0,
    rate: 1.0,
    onStart: () => console.log("[TTS] onStart"),
    onStopped: () => console.log("[TTS] onStopped"),
    onDone: () => console.log("[TTS] onDone"),
    onError: (e) => console.warn("[TTS] onError:", e),
    ...opts,
  });
}
export default function Driving() {
  const navigation = useNavigation<any>();
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

  const [stopping, setStopping] = useState(false);
  const navigateAfterStopRef = useRef(false);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("로그인 필요", "다시 로그인해주세요.");
        return;
      }
      setJwt(token);
    })();
  }, []);

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
    if (recording && !timerRef.current)
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    if (!recording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [recording]);

  useEffect(() => {
    return () => {
      if (recording) stopRecording();
    };
  }, [recording]);

  const formatTime = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  // 단일 세그먼트(2초) 녹화
  const recordOneSegment = () =>
    new Promise<string>((resolve, reject) => {
      if (!cameraRef.current) return reject(new Error("camera not ready"));
      cameraRef.current
        .recordAsync({ maxDuration: 2 })
        .then((video) => {
          if (video?.uri) {
            console.log("[REC] recordAsync completed, uri:", video.uri);
            resolve(video.uri);
          } else {
            reject(new Error("No video URI returned"));
          }
        })
        .catch((err) => {
          console.warn("[REC] recordAsync error:", err);
          reject(err);
        });
    });

  const stopNativeRecordingIfAny = () => {
    try {
      cameraRef.current?.stopRecording();
    } catch (e) {
      console.warn("[REC] stopRecording error:", e);
    }
  };

  const startRecording = async () => {
    if (recording) return;
    if (!camPerm || !audPerm) return Alert.alert("권한 필요", "카메라/마이크 권한을 허용해주세요.");
    if (!cameraReady || !cameraRef.current) return Alert.alert("카메라 준비 중", "잠시 후 다시 시도해주세요.");
    if (!jwt) return Alert.alert("인증 오류", "로그인 토큰이 없습니다.");

    let startedSent = false;
    navigateAfterStopRef.current = false;
    setStopping(false);

    try {
      // ★ 안내 멘트: 운행 시작 시 1회 재생
      Speech.speak("운행을 시작합니다. 안내를 시작합니다.", {
        language: "ko-KR",
        pitch: 1.0,
        rate: 1.0,
      });

      const url = `ws://${HOST}/ws/driving?token=${encodeURIComponent(`Bearer ${jwt}`)}`;
      await connect(url);
      await onceOpen();
      sendJson({ type: "START" });
      startedSent = true;

      setRecording(true);
      setElapsedTime(0);
      drivingLoopRef.current = true;

      // 워밍업 약간
      await new Promise((r) => setTimeout(r, 150));

      // --- 파이프라인 루프 ---
      let nextPromise: Promise<string> | null = null;

      while (drivingLoopRef.current) {
        const uri = nextPromise ? await nextPromise : await recordOneSegment();
        nextPromise = drivingLoopRef.current ? recordOneSegment() : null;

        const path = await zipSingleFileIfAvailable(uri); // 현재는 원본 그대로 반환
        const buf = await fileUriToArrayBuffer(path);
        console.log("[REC] sendBinary size:", (buf as ArrayBuffer).byteLength);
        sendBinary(buf);
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.includes("stopped before any data")) {
        console.log("자연 종료 중(세그먼트 미생성):", msg);
      } else {
        console.warn("startRecording error:", e);
        Alert.alert("녹화 실패", "녹화 중 오류가 발생했습니다.");
      }
    } finally {
      // 안내 멘트 중지(혹시 남아있다면)
      try { Speech.stop(); } catch {}

      // 정리
      drivingLoopRef.current = false;
      stopNativeRecordingIfAny();
      setRecording(false);

      const socketAtFinally = wsRef.current as any;

      try {
        if (startedSent && socketAtFinally?.readyState === WebSocket.OPEN) {
          sendJson({ type: "END" });
        }
      } catch {}

      try {
        close();
      } catch {}

      // 소켓 close 대기 (최대 600ms)
      const waitWsClosed = async () => {
        const ws = socketAtFinally;
        if (!ws || ws.readyState === WebSocket.CLOSED) return;
        if (typeof ws.addEventListener === "function") {
          await new Promise<void>((resolve) => {
            const onClose = () => {
              try { ws.removeEventListener("close", onClose); } catch {}
              resolve();
            };
            ws.addEventListener("close", onClose);
            if (ws.readyState === WebSocket.CLOSED) onClose();
            setTimeout(() => resolve(), 600);
          });
        } else {
          await new Promise((r) => setTimeout(r, 300));
        }
      };
      await waitWsClosed();

      if (navigateAfterStopRef.current) {
        navigateAfterStopRef.current = false;
        setStopping(false);
        navigation.getParent()?.navigate("기록실");
      } else {
        setStopping(false);
      }
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    // 안내 멘트가 재생 중이면 멈춤
    try { Speech.stop(); } catch {}
    setStopping(true);
    navigateAfterStopRef.current = true;
    drivingLoopRef.current = false;
    stopNativeRecordingIfAny();
    setRecording(false);
    // END/close는 finally에서 처리
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        mode="video"
        mute={false}
        videoQuality="480p"
        onCameraReady={() => setCameraReady(true)}
      />

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={recording ? "녹화 중지 및 종료" : "녹화 시작"}
          onPress={recording ? stopRecording : startRecording}
          disabled={stopping}
        />
      </View>
      <Button
  title="TTS 테스트"
  onPress={() => speakWithLogs("테스트 음성입니다. 잘 들리시나요?")}
/>

      <Modal visible={stopping} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ActivityIndicator size="large" />
            <Text style={styles.modalText}>녹화 중지 중…</Text>
            <Text style={styles.modalSub}>데이터 정리 및 업로드를 마무리하는 중입니다.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: { position: "absolute", bottom: 30, alignSelf: "center" },
  timeContainer: {
    position: "absolute",
    top: 30,
    left: "50%",
    transform: [{ translateX: -36 }],
    zIndex: 1,
  },
  timeText: { fontSize: 30, fontWeight: "bold", color: "white" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: 260,
    borderRadius: 14,
    backgroundColor: "white",
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  modalText: { marginTop: 12, fontSize: 16, fontWeight: "600" },
  modalSub: { marginTop: 6, fontSize: 12, color: "#666", textAlign: "center" },
});
