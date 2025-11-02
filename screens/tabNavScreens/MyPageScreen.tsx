// screens/tabNavScreens/MyPageScreen.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../MyPageScreenComponents/pageHeaderD";
import {useAuth} from "../../auth/AuthContext"
export default function MyPageScreen() {
  const { logout } = useAuth(); // ★ 컨텍스트에서 logout 가져오기

  return (
    <SafeAreaView style={styles.container}>
      <PageHeaderD />

      {/* 스크롤 영역 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* 프로필 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>마이페이지</Text>

          <View style={styles.profileBox}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>안전운전자</Text>
              <Text style={styles.subMuted}>@safedriver123</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statMain}>127회</Text>
              <Text style={styles.subMuted}>총 주행</Text>
            </View>
            <View style={styles.dividerY} />
            <View style={styles.statItem}>
              <Text style={styles.statMain}>45.2시간</Text>
              <Text style={styles.subMuted}>누적 시간</Text>
            </View>
          </View>
        </View>

        {/* 안전 점수 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>안전 점수</Text>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>위험</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "85%" }]} />
            </View>
            <Text style={styles.progressLabel}>안전</Text>
          </View>
          <Text style={styles.scoreText}>85 / 100</Text>
        </View>

        {/* 회원 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>회원 정보</Text>

          <View style={styles.itemRow}>
            <Text style={styles.itemLeft}>성별</Text>
            <Text style={styles.itemRight}>남성</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.itemRow}>
            <Text style={styles.itemLeft}>생년월일</Text>
            <Text style={styles.itemRight}>1990-05-15</Text>
          </View>
          <View style={styles.itemDivider} />

          <View style={styles.itemRow}>
            <Text style={styles.itemLeft}>가입일</Text>
            <Text style={styles.itemRight}>2024-01-01</Text>
          </View>
        </View>

        {/* 기타/계정 관리 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>기타</Text>

          <TouchableOpacity style={styles.itemRow} onPress={() => { /* TODO: 회원정보 수정 이동 */ }}>
            <Text style={styles.itemLeft}>회원정보 수정</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.itemRow} onPress={() => { /* TODO: 비밀번호 변경 이동 */ }}>
            <Text style={styles.itemLeft}>비밀번호 변경</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.itemRow} onPress={() => { /* TODO: 알림 설정 이동 */ }}>
            <Text style={styles.itemLeft}>알림 설정</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.itemDivider} />

          <TouchableOpacity style={styles.itemRow} onPress={() => { /* TODO: 계정 삭제 플로우 */ }}>
            <Text style={[styles.itemLeft, { color: "#DC2626" }]}>계정 삭제</Text>
            <Text style={[styles.chevron, { color: "#DC2626" }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const R = 12;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },
  scroll: { flex: 1 },
  content: { padding: 16 },

  /* 카드 공통 */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: R,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  /* 프로필 */
  profileBox: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#E5E7EB", marginRight: 12 },
  name: { fontSize: 18, fontWeight: "600", color: "#111827" },
  subMuted: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EFF3F8",
    overflow: "hidden",
  },
  statItem: { flex: 1, paddingVertical: 10, alignItems: "center" },
  statMain: { fontSize: 16, fontWeight: "700", color: "#111827" },
  dividerY: { width: 1, backgroundColor: "#E5E7EB" },

  /* 진행바 */
  progressRow: { flexDirection: "row", alignItems: "center" },
  progressLabel: { width: 36, fontSize: 12, color: "#6B7280" },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginHorizontal: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#10B981" },
  scoreText: { marginTop: 8, textAlign: "right", fontWeight: "600", color: "#111827" },

  /* 리스트 */
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  itemDivider: { height: 1, backgroundColor: "#F1F5F9" },
  itemLeft: { fontSize: 14, color: "#111827" },
  itemRight: { fontSize: 14, color: "#6B7280" },
  chevron: { fontSize: 20, color: "#9CA3AF" },

  /* 로그아웃 */
  logoutBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
