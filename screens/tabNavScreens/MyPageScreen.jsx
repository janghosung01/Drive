// screens/tabNavScreens/MyPageScreen.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../MyPageScreenComponents/pageHeaderD";
import { useAuth } from "../../auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_BASE = "http://15.165.244.204:8080";

// 현재 로그인한 사용자 프로필 조회
export const fetchMyProfile = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) {
      console.warn("⚠️ accessToken 이 없습니다. 로그인 상태를 확인하세요.");
      return null;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(`${SERVER_BASE}/api/users/me`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();
    console.log("📌 /api/users/me 응답:", JSON.stringify(json, null, 2));
    // { success, code, message, data, timestamp }
    return json;
  } catch (error) {
    console.error("Error fetching my profile:", error);
    return null;
  }
};

// 누적 시간(초 기준 가정)을 "X시간 Y분" 형태로 포맷
const formatTotalDrivingTime = (seconds) => {
  if (!seconds || seconds <= 0) return "0분";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) {
    return `${h}시간 ${m}분`;
  }
  return `${m}분`;
};

export default function MyPageScreen() {
  const { logout } = useAuth();

  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const res = await fetchMyProfile();
      if (res?.success) {
        setProfile(res.data); // { id, loginId, nickname, gender, birthDate, createdAt, safeScore, totalDrivingCount, totalDrivingTime, ... }
      }
      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    if (profile) {
      console.log("✅ profile state:", profile);
    }
  }, [profile]);

  // 성별 표시 텍스트
  const genderLabel =
    profile?.gender === "MALE"
      ? "남성"
      : profile?.gender === "FEMALE"
      ? "여성"
      : profile?.gender || "-";

  // 가입일 yyyy-mm-dd
  const joinedAt = profile?.createdAt ? profile.createdAt.slice(0, 10) : "-";

  // 안전 점수(0~100 가정)
  const safeScore = typeof profile?.safeScore === "number" ? profile.safeScore : 0;
  const clampedSafeScore = Math.min(Math.max(safeScore, 0), 100);

  // 총 주행 / 누적 시간
  const totalDrivingCount =
    typeof profile?.totalDrivingCount === "number"
      ? profile.totalDrivingCount
      : 0;
  const totalDrivingTimeSeconds =
    typeof profile?.totalDrivingTime === "number"
      ? profile.totalDrivingTime
      : 0;
  const totalDrivingTimeLabel = formatTotalDrivingTime(totalDrivingTimeSeconds);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <PageHeaderD />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* 로딩 중 카드 */}
          {loading && (
            <View style={[styles.card, { alignItems: "center" }]}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>
                프로필을 불러오는 중입니다...
              </Text>
            </View>
          )}

          {/* 프로필 카드 */}
          {!loading && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>마이페이지</Text>

              <View style={styles.profileBox}>
                <View style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>
                    {profile?.nickname || "안전운전자"}
                  </Text>
                  <Text style={styles.subMuted}>
                    @{profile?.loginId || "safedriver123"}
                  </Text>
                </View>
              </View>

              {/* ✅ 여기부터 실제 API 값 사용 */}
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statMain}>{totalDrivingCount}회</Text>
                  <Text style={styles.subMuted}>총 주행</Text>
                </View>
                <View style={styles.dividerY} />
                <View style={styles.statItem}>
                  <Text style={styles.statMain}>{totalDrivingTimeLabel}</Text>
                  <Text style={styles.subMuted}>누적 시간</Text>
                </View>
              </View>
            </View>
          )}

          {/* 안전 점수 카드 */}
          {!loading && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>안전 점수</Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>위험</Text>
                <View style={styles.progressBar}>
                  {/* ✅ safeScore로 너비 조절 */}
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${clampedSafeScore}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressLabel}>안전</Text>
              </View>
              <Text style={styles.scoreText}>
                {clampedSafeScore} / 100
              </Text>
            </View>
          )}

          {/* 회원 정보 카드 */}
          {!loading && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>회원 정보</Text>

              <View style={styles.itemRow}>
                <Text style={styles.itemLeft}>성별</Text>
                <Text style={styles.itemRight}>{genderLabel}</Text>
              </View>
              <View style={styles.itemDivider} />

              <View style={styles.itemRow}>
                <Text style={styles.itemLeft}>생년월일</Text>
                <Text style={styles.itemRight}>
                  {profile?.birthDate || "-"}
                </Text>
              </View>
              <View style={styles.itemDivider} />

              <View style={styles.itemRow}>
                <Text style={styles.itemLeft}>가입일</Text>
                <Text style={styles.itemRight}>{joinedAt}</Text>
              </View>
            </View>
          )}

          {/* 기타/계정 관리 카드 */}
          {!loading && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>기타</Text>

              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => {
                  /* TODO: 회원정보 수정 이동 */
                }}
              >
                <Text style={styles.itemLeft}>회원정보 수정</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <View style={styles.itemDivider} />

              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => {
                  /* TODO: 비밀번호 변경 이동 */
                }}
              >
                <Text style={styles.itemLeft}>비밀번호 변경</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <View style={styles.itemDivider} />

            
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => {
                  /* TODO: 계정 삭제 플로우 */
                }}
              >
                <Text style={[styles.itemLeft, { color: "#DC2626" }]}>
                  계정 삭제
                </Text>
                <Text style={[styles.chevron, { color: "#DC2626" }]}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 로그아웃 버튼 */}
          {!loading && (
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const R = 12;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F4F7" },
  scroll: { flex: 1 },
  content: { padding: 16 },

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

  profileBox: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
    marginRight: 12,
  },
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
  scoreText: {
    marginTop: 8,
    textAlign: "right",
    fontWeight: "600",
    color: "#111827",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemDivider: { height: 1, backgroundColor: "#F1F5F9" },
  itemLeft: { fontSize: 14, color: "#111827" },
  itemRight: { fontSize: 14, color: "#6B7280" },
  chevron: { fontSize: 20, color: "#9CA3AF" },

  logoutBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
