import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { PageHeaderD } from "../../RecordScreenComponents/pageHeaderD";
import { RecordDetails } from "../../RecordScreenComponents/RecordDetail";

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

// 유틸
function toLocalYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function ymdFromSample(dateStr: string) {
  return dateStr.split(" ")[0];
}
function parseSampleDate(dateStr: string) {
  const [d, t] = dateStr.split(" ");
  return new Date(`${d}T${t}:00`);
}
function toMin(s: string) {
  return parseInt(s.replace(/\D/g, "") || "0", 10);
}

export default function RecordScreen() {
  const [filter, setFilter] = useState<"recent" | "time" | "events">("recent");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 상세 오버레이용 선택 id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sortLabel = useMemo(() => {
    if (filter === "recent") return sortDir === "desc" ? "최근 순" : "오래된 순";
    if (filter === "time") return sortDir === "desc" ? "많은 순" : "적은 순";
    return sortDir === "desc" ? "많은 순" : "적은 순";
  }, [filter, sortDir]);

  const toggleSortDir = () => setSortDir((p) => (p === "asc" ? "desc" : "asc"));

  const filteredData = useMemo(() => {
    let arr = [...sampleData];
    if (selectedDate) {
      const target = toLocalYmd(selectedDate);
      arr = arr.filter((it) => ymdFromSample(it.date) === target);
    }
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

  const renderItem = useCallback(
    ({ item }: any) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedId(item.id)}
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
              : { color: "#333" },
          ]}
        >
          {item.status}
        </Text>
      </TouchableOpacity>
    ),
    []
  );

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);
  const onConfirmDate = (d: Date) => {
    setSelectedDate(d);
    hidePicker();
  };
  const clearDate = () => setSelectedDate(null);

  return (
    // ★ bottom safe area 제거 (top, left, right만)
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      {/* 실제 회색 배경은 안쪽 View에서 */}
      <View style={styles.container}>
        <PageHeaderD />

        {/* 필터/정렬/날짜 */}
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

        {/* 요약 */}
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
          contentContainerStyle={{ paddingBottom: 80 }} // ★ 탭바에 안 가리도록 여유
        />

        {/* 날짜 모달 */}
        <DateTimePickerModal
          isVisible={isPickerVisible}
          mode="date"
          onConfirm={onConfirmDate}
          onCancel={hidePicker}
          locale="ko-KR"
        />

        {/* 상세 오버레이 */}
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
