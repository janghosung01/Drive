import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../auth/AuthContext"; // ✅ 로그인 전환을 위해 컨텍스트 사용

export default function Signup({ onGoLogin }) {
  const { login } = useAuth(); // ✅ 회원가입 완료 시 바로 메인 진입
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("M");
  const [birth, setBirth] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const fmt = d => !d ? "년 - 월 - 일" :
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const submit = async () => {
    if (!nickname.trim()) return alert("닉네임을 입력해 주세요.");
    if (!birth) return alert("생년월일을 선택해 주세요.");
    if (!loginId.trim()) return alert("아이디를 입력해 주세요.");
    if (pw.length < 6) return alert("비밀번호는 6자 이상으로 설정해 주세요.");
    if (pw !== pw2) return alert("비밀번호 확인이 일치하지 않습니다.");

    try {
      // TODO: 실제 회원가입 API 호출
      // await api.signup({ nickname, gender, birth, loginId, pw });

      // ✅ 회원가입 완료 → 곧바로 로그인 상태로 전환 → RootNavigation 렌더
      await login();
    } catch (e) {
      console.error(e);
      alert("회원가입에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F6F8FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoLogin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회원가입</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* 닉네임 */}
        <Text style={styles.label}>닉네임 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor="#A8B0BF"
          value={nickname}
          onChangeText={setNickname}
        />

        {/* 성별 */}
        <Text style={[styles.label, { marginTop: 16 }]}>성별 <Text style={styles.required}>*</Text></Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity onPress={() => setGender("M")} style={[styles.segment, gender==="M" && styles.segmentActive]}>
            <Text style={[styles.segmentText, gender==="M" && styles.segmentTextActive]}>남성</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender("F")} style={[styles.segment, gender==="F" && styles.segmentActive]}>
            <Text style={[styles.segmentText, gender==="F" && styles.segmentTextActive]}>여성</Text>
          </TouchableOpacity>
        </View>

        {/* 생년월일 */}
        <Text style={[styles.label, { marginTop: 16 }]}>생년월일 <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowPicker(true)}>
          <Text style={[styles.inputText, !birth && { color: "#A8B0BF" }]}>{fmt(birth)}</Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>

        {/* 아이디/비밀번호 */}
        <Text style={[styles.label, { marginTop: 16 }]}>아이디 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="아이디를 입력하세요"
          placeholderTextColor="#A8B0BF"
          value={loginId}
          onChangeText={setLoginId}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>비밀번호 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요"
          placeholderTextColor="#A8B0BF"
          value={pw}
          onChangeText={setPw}
          secureTextEntry
        />

        <Text style={[styles.label, { marginTop: 16 }]}>비밀번호 확인 <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요"
          placeholderTextColor="#A8B0BF"
          value={pw2}
          onChangeText={setPw2}
          secureTextEntry
        />

        {/* 가입 버튼 */}
        <TouchableOpacity style={styles.submitBtn} onPress={submit}>
          <Text style={styles.submitText}>회원가입</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* DatePicker */}
      {Platform.OS === "android" ? (
        showPicker && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={birth || new Date(2000, 0, 1)}
            onChange={(_, date) => { setShowPicker(false); if (date) setBirth(date); }}
            maximumDate={new Date()}
          />
        )
      ) : (
        <Modal visible={showPicker} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <DateTimePicker
                mode="date"
                display="spinner"
                value={birth || new Date(2000, 0, 1)}
                onChange={(_, date) => date && setBirth(date)}
                maximumDate={new Date()}
                style={{ alignSelf: "stretch" }}
              />
              <TouchableOpacity style={styles.modalDone} onPress={() => setShowPicker(false)}>
                <Text style={styles.modalDoneText}>완료</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const R = 12;
const styles = StyleSheet.create({
  header: {
    height: 54, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#EEF2F7",
  },
  backArrow: { fontSize: 28, color: "#111827", width: 24 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800", color: "#111827" },

  container: { padding: 16 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "600" },
  required: { color: "#EF4444" },

  input: {
    height: 52, backgroundColor: "#FFFFFF", borderRadius: R,
    borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14,
  },
  inputWithIcon: {
    height: 52, backgroundColor: "#FFFFFF", borderRadius: R,
    borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  inputText: { fontSize: 16, color: "#111827" },
  calendarIcon: { fontSize: 18 },

  segmentRow: { flexDirection: "row", gap: 12 },
  segment: {
    flex: 1, height: 48, backgroundColor: "#FFFFFF",
    borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: R,
    alignItems: "center", justifyContent: "center",
  },
  segmentActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  segmentText: { fontSize: 16, color: "#111827", fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },

  submitBtn: {
    marginTop: 22, height: 56, backgroundColor: "#2357EB",
    borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  submitText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },

  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%", backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingTop: 8, paddingBottom: 12,
  },
  modalDone: { alignSelf: "stretch", marginTop: 6, alignItems: "center", paddingVertical: 12 },
  modalDoneText: { fontSize: 16, fontWeight: "700", color: "#2357EB" },
});
