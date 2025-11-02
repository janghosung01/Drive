import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";

export default function LoginScreen({ onLoginSuccess, onGoSignup }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [focus, setFocus] = useState(null);

  const handleLogin = () => {
    if (id === "user" && password === "1234") onLoginSuccess?.();
    else alert("아이디나 비밀번호가 올바르지 않습니다.");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F7FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.carEmoji}>🚗</Text>
          </View>
          <Text style={styles.title}>운전의 정석</Text>
          <Text style={styles.subtitle}>안전하고 완벽한 드라이빙의 시작</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>
            아이디 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, focus === "id" && styles.inputFocused]}
            placeholder="아이디를 입력하세요"
            placeholderTextColor="#A8B0BF"
            value={id}
            onChangeText={setId}
            onFocus={() => setFocus("id")}
            onBlur={() => setFocus(null)}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { marginTop: 18 }]}>
            비밀번호 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, focus === "pw" && styles.inputFocused]}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#A8B0BF"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocus("pw")}
            onBlur={() => setFocus(null)}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signUpBtn} onPress={onGoSignup}>
            <Text style={styles.signUpBtnText}>회원가입</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>AI와 함께하는 완벽한 운전 솔루션</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BLUE = "#2357EB";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 24,
    minHeight: "100%",
  },
  hero: { alignItems: "center", marginBottom: 28 },
  heroIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#E9F0FF", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  carEmoji: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A" },
  subtitle: { marginTop: 6, fontSize: 14, color: "#64748B" },

  form: { marginTop: 14 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "600" },
  required: { color: "#EF4444" },

  input: {
    width: "100%", height: 52, backgroundColor: "#FFFFFF",
    borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: "#2F62F1",
    shadowColor: "#2F62F1",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  loginBtn: {
    marginTop: 24, height: 56, backgroundColor: BLUE,
    borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  loginBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },

  signUpBtn: {
    marginTop: 12, height: 56, backgroundColor: "#FFFFFF",
    borderRadius: 14, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: BLUE,
  },
  signUpBtnText: { color: BLUE, fontSize: 16, fontWeight: "700" },

  footer: { textAlign: "center", color: "#8A93A3", marginTop: 36 },
});
