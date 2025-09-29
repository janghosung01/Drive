import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../RecordScreenComponents/pageHeaderD";
import { Ionicons } from "@expo/vector-icons";

// 샘플 데이터
const sampleData = [
  {
    id: "1",
    date: "2024-01-15 14:30",
    duration: "45분",
    distance: "25.3km",
    events: 3,
    status: "안전",
  },
  {
    id: "2",
    date: "2024-01-14 09:15",
    duration: "32분",
    distance: "18.7km",
    events: 1,
    status: "매우 안전",
  },
  {
    id: "3",
    date: "2024-01-13 17:45",
    duration: "58분",
    distance: "31.2km",
    events: 7,
    status: "주의",
  },
];

export default function RecordScreen() {
  const [filter, setFilter] = useState("recent");

  const renderItem = ({ item }: any) => (
    <View style={styles.recordItem}>
      <Ionicons name="car-sport-outline" size={28} color="#3478F6" />
      <View style={styles.recordInfo}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <Text style={styles.recordDetails}>
          {item.duration} • {item.distance}
        </Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <PageHeaderD />

      {/* 필터 탭 */}
      <View style={styles.filterContainer}>
        {["recent", "time", "events"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type === "recent"
                ? "최근순"
                : type === "time"
                ? "운전시간"
                : "이벤트순"}
            </Text>
          </TouchableOpacity>
        ))}
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
        data={sampleData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  filterButtonActive: {
    backgroundColor: "#3478F6",
  },
  filterText: {
    fontSize: 14,
    color: "#333",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "bold",
  },

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
