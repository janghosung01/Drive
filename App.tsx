import React, { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

import RootNavigation from "./navigation/rootNavigation";
import LoginScreen from "./Login/LoginScreen";
import Signup from "./Login/Signup"; // ✅ 회원가입 화면
import { AuthProvider, useAuth } from "./auth/AuthContext";

function Gate() {
  const { isLoggedIn, login } = useAuth();
  const [authRoute, setAuthRoute] = useState("login"); // 'login' | 'signup'

  if (isLoggedIn) return <RootNavigation />;

  return authRoute === "login" ? (
    <LoginScreen
      onLoginSuccess={login}            // ✅ 로그인 성공 시 메인으로
      onGoSignup={() => setAuthRoute("signup")}
    />
  ) : (
    <Signup
      onGoLogin={() => setAuthRoute("login")} // ← 상단 뒤로가기 등에서 로그인 화면으로
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
