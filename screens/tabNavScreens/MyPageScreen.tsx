import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeaderD } from "../../MyPageScreenComponents/pageHeaderD";

export default function MyPageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PageHeaderD />
      <View style={styles.contentContainer}>
        {/* User Information */}
        <Text style={styles.title}>안전운전자</Text>
        <Text style={styles.subTitle}>@safedriver123</Text>
        <Text style={styles.detail}>127회 총 주행</Text>
        <Text style={styles.detail}>45.2시간 누적 시간</Text>

        {/* Score Progress Bar */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>안전 점수</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.status}>위험</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, { width: '85%' }]}></View>
            </View>
            <Text style={styles.status}>안전</Text>
          </View>
          <Text style={styles.score}>85 / 100</Text>
        </View>

        {/* Member Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>회원 정보</Text>
          <Text style={styles.detail}>성별: 남성</Text>
          <Text style={styles.detail}>생년월일: 1990-05-15</Text>
          <Text style={styles.detail}>가입일: 2024-01-01</Text>
        </View>

        {/* Account Management Section */}
        <View style={styles.accountManagementContainer}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <TouchableOpacity style={styles.accountOption}>
            <Text style={styles.accountOptionText}>회원정보 수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountOption}>
            <Text style={styles.accountOptionText}>비밀번호 변경</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountOption}>
            <Text style={styles.accountOptionText}>알림 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accountOption}>
            <Text style={styles.accountOptionText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  detail: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  scoreContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  status: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  scoreBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 5,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#4CAF50', // Update based on score
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  sectionContainer: {
    marginTop: 30,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  accountManagementContainer: {
    marginTop: 20,
    width: '100%',
  },
  accountOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  accountOptionText: {
    fontSize: 14,
    color: '#555',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
