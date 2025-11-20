import React, { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

import { PageHeaderD } from "../../RecordScreenComponents/pageHeaderD";
import { RecordDetails } from "../../RecordScreenComponents/RecordDetail";

const SERVER_BASE = "http://15.165.244.204:8080";

// --- 타입 정의 (백엔드 DTO와 매칭) ---
interface HistoryRecord {
  id: number;         // drivingId
  date: string;       // "2024-01-15 14:30"
  duration: string;   // "45분"
  distance: string;   // "0km"
  events: number;     // 이벤트 수
  status: string;     // "안전", "주의" 등
}

interface HistorySummary {
  totalDrivingCount: number;
  totalDrivingTime: string;
  totalEventCount: number;
}

// --- 유틸 ---
function toLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function RecordScreen() {
  const isFocused = useIsFocused();

  // --- 상태 관리 ---
  // 필터: recent(최근순), time(운전시간순), events(이벤트순)
  const [filter, setFilter] = useState<"recent" | "time" | "events">("recent");
  // 정렬방향: desc(내림차순-기본), asc(오름차순)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);

  // 데이터 목록 & 요약
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [summary, setSummary] = useState<HistorySummary>({
    totalDrivingCount: 0,
    totalDrivingTime: "0시간",
    totalEventCount: 0,
  });

  // 페이징 관리
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);
  const PAGE_SIZE = 10;

  // 상세 모달용 ID
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- API 호출 함수 ---
  const fetchHistory = async (pageToFetch: number, shouldRefresh: boolean = false) => {
    if (loading) return;
    if (!shouldRefresh && isLastPage) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        // Alert.alert("오류", "로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.append("sortBy", filter); // recent, time, events
      params.append("sortDir", sortDir); // asc, desc
      params.append("page", pageToFetch.toString());
      params.append("size", PAGE_SIZE.toString());
      
      if (selectedDate) {
        params.append("date", toLocalYmd(selectedDate));
      }

      console.log(`[API] 기록 조회 요청: ${SERVER_BASE}/api/history/list?${params.toString()}`);

      const res = await fetch(`${SERVER_BASE}/api/history/list?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("API Error:", res.status);
        setLoading(false);
        return;
      }

      const json = await res.json();
      // console.log("[API] 응답:", JSON.stringify(json, null, 2));

      if (json.success) {
        const newRecords = json.data.records; // 리스트
        const newSummary = json.data.summary; // 요약 정보

        setSummary(newSummary);

        if (shouldRefresh) {
          setRecords(newRecords);
        } else {
          setRecords((prev) => [...prev, ...newRecords]);
        }

        // 다음 페이지가 있는지 확인 (받아온 개수가 요청 사이즈보다 작으면 마지막 페이지)
        setIsLastPage(newRecords.length < PAGE_SIZE);
        setPage(pageToFetch);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Effect: 필터/정렬/날짜 변경 시 초기화 및 재조회 ---
  useEffect(() => {
    if (isFocused) {
      // 필터가 바뀌면 0페이지부터 새로 조회
      fetchHistory(0, true);
    }
  }, [filter, sortDir, selectedDate, isFocused]);

  // --- 이벤트 핸들러 ---
  const onEndReached = () => {
    if (!loading && !isLastPage) {
      fetchHistory(page + 1);
    }
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const onConfirmDate = (d: Date) => {
    setSelectedDate(d);
    setPickerVisible(false);
  };

  // --- 정렬 버튼 텍스트 ---
  const sortLabel = useMemo(() => {
    const dirText = sortDir === "desc" ? "(내림차순)" : "(오름차순)";
    if (filter === "recent") return sortDir === "desc" ? "최근 순" : "오래된 순";
    if (filter === "time") return sortDir === "desc" ? "시간 많은 순" : "시간 적은 순";
    if (filter === "events") return sortDir === "desc" ? "이벤트 많은 순" : "이벤트 적은 순";
    return dirText;
  }, [filter, sortDir]);

  // --- 렌더링 ---
  const renderItem = useCallback(({ item }: { item: HistoryRecord }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setSelectedId(String(item.id))}
      style={styles.recordItem}
    >
      <Ionicons name="car-sport-outline" size={28} color="#3478F6" />
      <View style={styles.recordInfo}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <Text style={styles.recordDetails}>주행시간 : {item.duration}</Text>
        <Text style={styles.recordEvents}>{item.events}개 이벤트</Text>
      </View>
      <Text
        style={[
          styles.recordStatus,
          item.status === "주의"
            ? { color: "orange" }
            : item.status.includes("안전")
            ? { color: "green" }
            : { color: "#E53E3E" }, // 위험 등
        ]}
      >
        {item.status}
      </Text>
    </TouchableOpacity>
  ), []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <PageHeaderD />

        {/* 1. 툴바: 필터, 정렬, 날짜 */}
        <View style={styles.toolbar}>
          <View style={styles.rowBetween}>
            <View style={styles.filterContainer}>
              {(["recent", "time", "events"] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, filter === type && styles.filterButtonActive]}
                  onPress={() => setFilter(type)}
                >
                  <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
                    {type === "recent" ? "최근" : type === "time" ? "운전시간" : "이벤트"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.sortBtn} onPress={toggleSortDir}>
              <Ionicons
                name={sortDir === "desc" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                size={18}
                color="#3478F6"
              />
              <Text style={styles.sortBtnText}>{sortLabel}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setPickerVisible(true)}>
              <Ionicons name="calendar-clear-outline" size={18} color="#3478F6" />
              <Text style={styles.dateBtnText}>
                {selectedDate ? toLocalYmd(selectedDate) : "날짜 선택 (전체)"}
              </Text>
            </TouchableOpacity>

            {selectedDate && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedDate(null)}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. 요약 카드 (API 데이터 연동) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#3478F6" }]}>{summary.totalDrivingCount}회</Text>
            <Text style={styles.summaryLabel}>총 주행</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "green" }]}>{summary.totalDrivingTime}</Text>
            <Text style={styles.summaryLabel}>주행 시간</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "red" }]}>{summary.totalEventCount}회</Text>
            <Text style={styles.summaryLabel}>총 이벤트</Text>
          </View>
        </View>

        {/* 3. 리스트 (무한 스크롤) */}
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5} // 하단 50% 남았을 때 로딩
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                기록이 없습니다.
              </Text>
            ) : null
          }
          ListFooterComponent={
            loading ? <ActivityIndicator style={{ padding: 20 }} /> : <View style={{height: 80}}/>
          }
          contentContainerStyle={{ paddingBottom: 20 }} 
        />

        {/* 날짜 선택 모달 */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="date"
          onConfirm={onConfirmDate}
          onCancel={() => setPickerVisible(false)}
          locale="ko-KR"
        />

        {/* 상세 보기 오버레이 */}
        {selectedId && (
          <RecordDetails
            id={selectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  toolbar: { paddingHorizontal: 16, marginTop: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  filterContainer: { flexDirection: "row", alignItems: "center" },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 6,
  },
  filterButtonActive: { backgroundColor: "#3478F6" },
  filterText: { fontSize: 13, color: "#333" },
  filterTextActive: { color: "white", fontWeight: "bold" },

  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sortBtnText: { marginLeft: 4, color: "#3478F6", fontWeight: "600", fontSize: 12 },

  dateRow: { marginTop: 10, flexDirection: "row", alignItems: "center" },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  dateBtnText: { marginLeft: 6, color: "#3478F6", fontWeight: "600" },
  clearBtn: { marginLeft: 8, padding: 4 },

  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 18, fontWeight: "bold" },
  summaryLabel: { fontSize: 12, color: "#666" },

  recordItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  recordInfo: { flex: 1, marginLeft: 12 },
  recordDate: { fontSize: 15, fontWeight: "500" },
  recordDetails: { fontSize: 12, color: "#666", marginTop: 2 },
  recordEvents: { fontSize: 12, color: "#999", marginTop: 2 },
  recordStatus: { fontSize: 13, fontWeight: "600" },

  emptyText: { textAlign: "center", marginTop: 40, color: "#888", fontSize: 14 },
});