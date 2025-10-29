import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { PageHeader } from '../../HomeComponents/PageHeader';
import {TitleBanner} from '../../HomeComponents/TitleBanner';
import { QuickAccess } from '../../HomeComponents/QuickAccess';

// 남은 작업 API 연동 
//1.  fetchMonthStats 연결해서 이번달 통계 데이터 렌더링 
//2 . RecentRecords 에서 최근 기록 API 연결 해서 mapping 처리 id 기억해서 해당 기록으로 클릭시 상세페이지로 이동 할 수있게 
// API 호출을 위한 함수
const fetchMonthStats = async () => {
  try {
    const response = await fetch('https://your-api-url/api/home/monthStatus');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching month stats:", error);
    return null;
  }
};


const WeeklyStats = () => (
  <View style={statsStyles.container}>
    <Text style={statsStyles.title}>이번 달 통계</Text>
    <View style={statsStyles.statsContainer}>
      <View style={statsStyles.statItem}>
        <Text style={statsStyles.number_a}>32</Text>
        <Text style={statsStyles.label}>주행 횟수</Text>
      </View>
      <View style={statsStyles.statItem}>
        <Text style={statsStyles.number_b}>63.2h</Text>
        <Text style={statsStyles.label}>주행 시간</Text>
      </View>
      <View style={statsStyles.statItem}>
        <Text style={statsStyles.number_c}>5</Text>
        <Text style={statsStyles.label}>경고 알림</Text>
      </View>
    </View>
  </View>
);

const statsStyles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 20, backgroundColor: 'white', borderRadius: 15, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', },
  statItem: { alignItems: 'center' },
  number_a: { fontSize: 24, fontWeight: 'bold', color: '#3478F6' },
  number_b: { fontSize: 24, fontWeight: 'bold', color: '#2ECC71' },
  number_c: { fontSize: 24, fontWeight: 'bold', color: '#E67E22' },
  label: { fontSize: 12, color: '#8E8E93' },
});

//

const RecentRecords = () => {
    const navigation = useNavigation();
  return (
  <View style={recordStyles.container}>
    <View style={recordStyles.header}>
      <Text style={recordStyles.title}>최근 기록</Text>
      <Text    onPress={() => navigation.navigate("기록실"as never)}style={recordStyles.link}>전체보기</Text>
    </View>
    {['오늘 오후 2:30', '오늘 오후 3:30'].map((time, index) => (
      <View key={index} style={recordStyles.recordItem}>
        <Ionicons name="car-sport-outline" size={24} color="#8E8E93" />
        <View style={recordStyles.textContainer}>
          <Text style={recordStyles.recordTime}>{time}</Text>
          <Text style={recordStyles.recordDetails}>35분 주행 • 안전</Text>
        </View>
        <Ionicons name="chevron-forward-outline" size={20} color="#8E8E93" />
      </View>
    ))}
  </View>)
};

const recordStyles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold' },
  link: { fontSize: 14, color: '#3478F6' },
  recordItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, },
  textContainer: { flex: 1, marginLeft: 10 },
  recordTime: { fontSize: 16, fontWeight: '500' },
  recordDetails: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});
export default function HomeScreen() {


  return (
    <SafeAreaView style={styles.container}>
        <PageHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TitleBanner />
        <QuickAccess />
        <WeeklyStats />
        <RecentRecords />
      </ScrollView>
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