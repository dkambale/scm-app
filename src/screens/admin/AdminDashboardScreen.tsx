import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingFees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, teachers, classes, fees] = await Promise.all([
        apiService.getStudents(),
        apiService.getTeachers(),
        apiService.getClasses(),
        apiService.getFees(),
      ]);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalClasses: classes.length,
        pendingFees: fees.filter((f) => f.status === 'Pending').length,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Dashboard
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {stats.totalStudents}
            </Text>
            <Text variant="titleMedium">Total Students</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {stats.totalTeachers}
            </Text>
            <Text variant="titleMedium">Total Teachers</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {stats.totalClasses}
            </Text>
            <Text variant="titleMedium">Total Classes</Text>
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
