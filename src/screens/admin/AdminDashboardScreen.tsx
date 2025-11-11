import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Card, Text, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { apiService } from '../../api/apiService';

type Stats = {
  totalStudents?: number;
  totalTeachers?: number;
  totalCourses?: number;
};

type MonthlyItem = {
  month: string;
  enrollments: number;
};

const AdminDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<Stats>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const screenWidth = Dimensions.get('window').width;
  const isWide = screenWidth >= 700;

  // simple bar chart rendering: scale bars by max value
  const maxEnroll = Math.max(1, ...(monthlyData.map((m) => m.enrollments ?? 0)));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size={36} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.row, !isWide && styles.wrap]}> 
        <Card style={[styles.statCard, isWide ? styles.halfWidth : styles.fullWidth]}>
          <Card.Content>
            <Title>Total Students</Title>
            <Paragraph style={styles.statValue}>{stats.totalStudents ?? 0}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, isWide ? styles.halfWidth : styles.fullWidth]}>
          <Card.Content>
            <Title>Total Teachers</Title>
            <Paragraph style={styles.statValue}>{stats.totalTeachers ?? 0}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, isWide ? styles.halfWidth : styles.fullWidth]}>
          <Card.Content>
            <Title>Total Courses</Title>
            <Paragraph style={styles.statValue}>{stats.totalCourses ?? 0}</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={{ marginBottom: 8 }}>Monthly New Enrollments</Title>
          {monthlyData.length === 0 ? (
            <Text>No chart data available</Text>
          ) : (
            <View>
              {monthlyData.map((item) => {
                const value = item.enrollments ?? 0;
                const widthPct = Math.round((value / maxEnroll) * 100);
                return (
                  <View key={item.month} style={styles.barRow}>
                    <Text style={styles.barLabel}>{item.month}</Text>
                    <View style={styles.barWrap}>
                      <View style={[styles.barFill, { width: `${widthPct}%` }]} />
                      <Text style={styles.barValue}>{value}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 48,
    backgroundColor: '#fff',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  wrap: { flexDirection: 'column' },
  statCard: { marginBottom: 12, borderRadius: 8 },
  halfWidth: { flex: 1, minWidth: 140, marginRight: 6 },
  fullWidth: { width: '100%' },
  statValue: { fontSize: 28, fontWeight: '800', marginTop: 6 },
  chartCard: { borderRadius: 8, paddingBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  barLabel: { width: 80, color: '#333' },
  barWrap: { flex: 1, height: 28, backgroundColor: '#f3f6ff', borderRadius: 6, justifyContent: 'center' },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#8884d8', borderRadius: 6 },
  barValue: { marginLeft: 8, marginRight: 8, zIndex: 2, alignSelf: 'center', color: '#111', fontWeight: '700' },
});

export default AdminDashboardScreen;
 
