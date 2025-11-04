import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingAssignments: 0,
    totalAttendance: 0,
    presentDays: 0,
    pendingFees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const studentData = await apiService.getStudents();
      const currentStudent = studentData.find((s) => s.email === user?.email);

      if (currentStudent) {
        const [assignments, attendance, fees] = await Promise.all([
          apiService.getAssignments({ classId: currentStudent.classId }),
          apiService.getAttendance({ studentId: currentStudent.id }),
          apiService.getFees(currentStudent.id),
        ]);

        setStats({
          pendingAssignments: assignments.length,
          totalAttendance: attendance.length,
          presentDays: attendance.filter((a) => a.status === 'Present').length,
          pendingFees: fees.filter((f) => f.status === 'Pending').length,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const attendancePercentage =
    stats.totalAttendance > 0 ? ((stats.presentDays / stats.totalAttendance) * 100).toFixed(1) : '0';

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome, {user?.firstName}!
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {stats.pendingAssignments}
            </Text>
            <Text variant="titleMedium">Active Assignments</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {attendancePercentage}%
            </Text>
            <Text variant="titleMedium">Attendance</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={[styles.number, styles.pending]}>
              {stats.pendingFees}
            </Text>
            <Text variant="titleMedium">Pending Fees</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 16,
    elevation: 4,
  },
  number: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  pending: {
    color: '#ff6f00',
  },
});
