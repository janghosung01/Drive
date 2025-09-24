import React, { useRef, useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";

export default function Driving() {
  const cameraRef = useRef<CameraView>(null);
  const [recording, setRecording] = useState(false);

  // 녹화 시작
  const startRecording = async () => {
    if (cameraRef.current) {
      setRecording(true);
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

      {/* 버튼 */}
      <View style={styles.buttonContainer}>
        <Button
          title={recording ? "녹화 중지" : "녹화 시작"}
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
});
