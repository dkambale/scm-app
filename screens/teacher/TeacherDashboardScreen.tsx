import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const TeacherDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedClasses: 0,
    pendingAssignments: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [classes, assignments, students] = await Promise.all([
        apiService.getClasses(),
        apiService.getAssignments({ teacherId: user?.id }),
        apiService.getStudents(),
      ]);

      setStats({
        assignedClasses: classes.filter((c) => c.teacherAssigned === user?.id).length,
        pendingAssignments: assignments.length,
        totalStudents: students.length,
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
        Welcome, {user?.firstName}!
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineLarge" style={styles.number}>
              {stats.assignedClasses}
            </Text>
            <Text variant="titleMedium">Assigned Classes</Text>
          </Card.Content>
        </Card>

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
              {stats.totalStudents}
            </Text>
            <Text variant="titleMedium">Total Students</Text>
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
});
