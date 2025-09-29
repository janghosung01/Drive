import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../MyPageScreenComponents/pageHeaderD";

export default function MyPageScreen() {
  return (
    <SafeAreaView style={styles.container}>
    <PageHeaderD />
  </SafeAreaView> 
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});