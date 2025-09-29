import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../RecordScreenComponents/pageHeaderD";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// 샘플 데이터
const sampleData = [
  { id: "1", date: "2024-01-15 14:30", duration: "45분", distance: "25.3km", events: 3, status: "안전" },
  { id: "2", date: "2024-01-14 09:15", duration: "32분", distance: "18.7km", events: 1, status: "매우 안전" },
  { id: "3", date: "2024-01-13 17:45", duration: "58분", distance: "31.2km", events: 7, status: "주의" },
  { id: "4", date: "2024-02-13 11:41", duration: "90분", distance: "9.2km", events: 7, status: "주의" },
  { id: "5", date: "2024-03-13 15:42", duration: "470분", distance: "1311.2km", events: 7, status: "주의" },
  { id: "6", date: "2024-04-13 13:15", duration: "258분", distance: "331.0km", events: 7, status: "주의" },
  { id: "7", date: "2024-05-13 11:45", duration: "358분", distance: "331.3km", events: 7, status: "주의" },
];

// 로컬 타임존 기준 YYYY-MM-DD 문자열 만들기
function toLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// "2024-01-15 14:30" → "2024-01-15"만 추출 (샘플 데이터용)
function ymdFromSample(dateStr: string) {
  return dateStr.split(" ")[0];
}
// "2024-01-15 14:30" → Date 파싱(간단)
function parseSampleDate(dateStr: string) {
  // iOS 호환 위해 yyyy-mm-ddTHH:MM로 변환 후 파싱
  const [d, t] = dateStr.split(" ");
  return new Date(`${d}T${t}:00`);
}
// "45분" → 45
function toMin(s: string) {
  return parseInt(s.replace(/\D/g, "") || "0", 10);
}

export default function RecordScreen() {
  const [filter, setFilter] = useState<"recent" | "time" | "events">("recent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc"); // 기본: 내림차순(최근/많은 우선)

  // 달력 관련
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 정렬 토글 시 라벨
  const sortLabel = useMemo(() => {
    if (filter === "recent") return sortDir === "desc" ? "최근 순" : "오래된 순";
    if (filter === "time") return sortDir === "desc" ? "많은 순" : "적은 순";
    return sortDir === "desc" ? "많은 순" : "적은 순"; // events
  }, [filter, sortDir]);

  const toggleSortDir = () => setSortDir((p) => (p === "asc" ? "desc" : "asc"));

  // 정렬/필터링 적용된 리스트
  const filteredData = useMemo(() => {
    let arr = [...sampleData];

    // 날짜 필터(선택되었을 때만)
    if (selectedDate) {
      const target = toLocalYmd(selectedDate);
      arr = arr.filter((it) => ymdFromSample(it.date) === target);
    }

    // 정렬
    if (filter === "recent") {
      arr.sort((a, b) => {
        const da = parseSampleDate(a.date).getTime();
        const db = parseSampleDate(b.date).getTime();
        return sortDir === "desc" ? db - da : da - db;
      });
    } else if (filter === "time") {
      arr.sort((a, b) => {
        const ta = toMin(a.duration);
        const tb = toMin(b.duration);
        return sortDir === "desc" ? tb - ta : ta - tb;
      });
    } else if (filter === "events") {
      arr.sort((a, b) => (sortDir === "desc" ? b.events - a.events : a.events - b.events));
    }
    return arr;
  }, [filter, sortDir, selectedDate]);

  const renderItem = ({ item }: any) => (
    <View style={styles.recordItem}>
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
            : { color: "#333" },
        ]}
      >
        {item.status}
      </Text>
    </View>
  );

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);
  const onConfirmDate = (d: Date) => {
    setSelectedDate(d);
    hidePicker();
  };
  const clearDate = () => setSelectedDate(null);

  return (
    <SafeAreaView style={styles.container}>
      <PageHeaderD />

      {/* 필터 + 정렬방향 + 날짜 선택 바 */}
      <View style={styles.toolbar}>
        <View style={styles.rowBetween}>
          {/* 필터 버튼 */}
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

          {/* 정렬 방향 토글 */}
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSortDir}>
            <Ionicons
              name={sortDir === "desc" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
              size={18}
              color="#3478F6"
            />
            <Text style={styles.sortBtnText}>{sortLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* 날짜 선택 */}
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateBtn} onPress={showPicker}>
            <Ionicons name="calendar-clear-outline" size={18} color="#3478F6" />
            <Text style={styles.dateBtnText}>
              {selectedDate ? toLocalYmd(selectedDate) : "날짜 선택"}
            </Text>
          </TouchableOpacity>

          {selectedDate && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearDate}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 주간 요약 카드 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "#3478F6" }]}>12회</Text>
          <Text style={styles.summaryLabel}>총 주행</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "green" }]}>5.2시간</Text>
          <Text style={styles.summaryLabel}>주행 시간</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "red" }]}>16회</Text>
          <Text style={styles.summaryLabel}>총 이벤트</Text>
        </View>
      </View>

      {/* 리스트 */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
            선택한 조건에 해당하는 기록이 없습니다.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* 날짜 모달 */}
      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="date"
        onConfirm={onConfirmDate}
        onCancel={hidePicker}
        locale="ko-KR"
      />
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
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 8,
  },
  filterButtonActive: { backgroundColor: "#3478F6" },
  filterText: { fontSize: 14, color: "#333" },
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
  sortBtnText: { marginLeft: 6, color: "#3478F6", fontWeight: "600", fontSize: 12 },

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
});
