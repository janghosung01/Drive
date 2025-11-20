import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { PageHeader } from '../../HomeComponents/PageHeader';
import { TitleBanner } from '../../HomeComponents/TitleBanner';
import { QuickAccess } from '../../HomeComponents/QuickAccess';

// ------------------- 공통 설정 & 함수 -------------------

const SERVER_BASE = 'http://15.165.244.204:8080';

/**
 * 이번 주 월요일 00:00:00.000 ~ 일요일 23:59:59.999 의 ISO 문자열을 계산
 */
const getThisWeekRange = () => {
  const now = new Date();

  const day = now.getDay(); // 일요일=0, 월요일=1 ...
  const diffToMonday = (day + 6) % 7;

  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    from: monday.toISOString(),
    to: sunday.toISOString(),
  };
};

/**
 * GET /api/home/weekly-status?from=...&to=...
 */
const fetchWeeklyStats = async () => {
  try {
    const { from, to } = getThisWeekRange();
    const params = new URLSearchParams({ from, to }).toString();

    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn('⚠️ accessToken 이 없습니다. 비로그인 상태일 수 있습니다.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${SERVER_BASE}/api/home/weekly-status?${params}`,
      {
        method: 'GET',
        headers,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📌 weekly-status 응답:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return null;
  }
};

/**
 * GET /api/home/recentRecord
 */
const fetchRecentRecord = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    if (!accessToken) {
      console.warn('⚠️ accessToken 이 없습니다. 비로그인 상태일 수 있습니다.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${SERVER_BASE}/api/home/recentRecord`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const json = await response.json();
    console.log('📌 recentRecord 응답:', JSON.stringify(json, null, 2));
    return json;
  } catch (error) {
    console.error('Error fetching recent record:', error);
    return null;
  }
};

// ------------------- 컴포넌트들 -------------------

const WeeklyStats = () => {
  const [weeklyData, setWeeklyData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // ★ Home 탭에 포커스될 때마다 true

  useEffect(() => {
    if (!isFocused) return;

    setLoading(true);
    (async () => {
      const res = await fetchWeeklyStats();
      if (res?.success) {
        setWeeklyData(res.data);
      } else {
        setWeeklyData(null);
      }
      setLoading(false);
    })();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={statsStyles.container}>
        <Text style={statsStyles.title}>이번 주 통계</Text>
        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (!weeklyData) {
    return (
      <View style={statsStyles.container}>
        <Text style={statsStyles.title}>이번 주 통계</Text>
        <Text style={{ fontSize: 12, color: '#8E8E93' }}>
          데이터를 불러오지 못했습니다.
        </Text>
      </View>
    );
  }

  const totalSeconds = weeklyData.totalSeconds ?? 0;
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const drivingCount = weeklyData.dailySeconds
    ? weeklyData.dailySeconds.length
    : 0;
  const warningCount = weeklyData.totalWarnings ?? 0;

  return (
    <View style={statsStyles.container}>
      <Text style={statsStyles.title}>이번 주 통계</Text>
      <View style={statsStyles.statsContainer}>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.number_a}>{drivingCount}</Text>
          <Text style={statsStyles.label}>주행 횟수</Text>
        </View>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.number_b}>{totalHours}h</Text>
          <Text style={statsStyles.label}>주행 시간</Text>
        </View>
        <View style={statsStyles.statItem}>
          <Text style={statsStyles.number_c}>{warningCount}</Text>
          <Text style={statsStyles.label}>경고 알림</Text>
        </View>
      </View>
    </View>
  );
};

const statsStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  number_a: { fontSize: 24, fontWeight: 'bold', color: '#3478F6' },
  number_b: { fontSize: 24, fontWeight: 'bold', color: '#2ECC71' },
  number_c: { fontSize: 24, fontWeight: 'bold', color: '#E67E22' },
  label: { fontSize: 12, color: '#8E8E93' },
});

const RecentRecords = () => {
  const navigation = useNavigation();
  const [recentList, setRecentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // ★ Home 탭 포커스

  useEffect(() => {
    if (!isFocused) return;

    setLoading(true);
    (async () => {
      const res = await fetchRecentRecord();
      if (res?.success && Array.isArray(res.data)) {
        setRecentList(res.data);
      } else {
        setRecentList([]);
      }
      setLoading(false);
    })();
  }, [isFocused]);

  return (
    <View style={recordStyles.container}>
      <View style={recordStyles.header}>
        <Text style={recordStyles.title}>최근 기록</Text>
        <Text
          onPress={() => navigation.navigate('기록실' as never)}
          style={recordStyles.link}
        >
          전체보기
        </Text>
      </View>

      {loading && (
        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      )}

      {!loading && recentList.length === 0 && (
        <Text style={{ fontSize: 12, color: '#8E8E93' }}>
          최근 주행 기록이 없습니다.
        </Text>
      )}

      {/* TODO: 나중에 recentList 기반으로 실제 시간/상태 뿌려주면 됨 */}
      {!loading &&
        ['오늘 오후 2:30', '오늘 오후 3:30'].map((time, index) => (
          <View key={index} style={recordStyles.recordItem}>
            <Ionicons name="car-sport-outline" size={24} color="#8E8E93" />
            <View style={recordStyles.textContainer}>
              <Text style={recordStyles.recordTime}>{time}</Text>
              <Text style={recordStyles.recordDetails}>35분 주행 • 안전</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#8E8E93"
            />
          </View>
        ))}
    </View>
  );
};

const recordStyles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  link: { fontSize: 14, color: '#3478F6' },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  textContainer: { flex: 1, marginLeft: 10 },
  recordTime: { fontSize: 16, fontWeight: '500' },
  recordDetails: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
});

// ------------------- HomeScreen -------------------

export default function HomeScreen() {
  return (
    // bottom safe area 제거하고, 실제 배경은 안쪽 View에서 처리
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <PageHeader />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TitleBanner />
          <QuickAccess />
          <WeeklyStats />
          <RecentRecords />
        </ScrollView>
      </View>
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
    paddingBottom: 80, // 탭바에 안 가리게 여유
  },
});
