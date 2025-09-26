import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>운전의 정석</Text>
      <Text>완벽한 운전을 시작하세요 🚗</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold" },
});