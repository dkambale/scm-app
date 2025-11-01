import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, DataTable } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Class } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';

export const TimetableScreen: React.FC = () => {
  const { user } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const auth = raw ? JSON.parse(raw) : null;
      const accountId = auth?.data?.accountId;
      const classId = auth?.data?.classId;
      if (!accountId || !classId) {
        setClassData(null);
        return;
      }
      const dto = await apiService.getTimetableBy(accountId, classId);
      // Try to map backend response to Class shape when possible
      const maybeClass: any = dto;
      if (maybeClass?.schedule) {
        setClassData(maybeClass as Class);
      } else if (Array.isArray(dto)) {
        const schedule = dto;
        setClassData({ id: String(classId), className: '', section: '', subjects: [], teacherAssigned: '', schedule } as any);
      } else {
        setClassData(null);
      }
    } catch (error) {
      console.error('Failed to load timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!classData) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge">No timetable available</Text>
      </View>
    );
  }

  const groupedByDay = classData.schedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = [];
    }
    acc[item.day].push(item);
    return acc;
  }, {} as Record<string, typeof classData.schedule>);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="headlineSmall">
            {classData.className} - Section {classData.section}
          </Text>
          <Text variant="bodyMedium" style={styles.subjects}>
            Subjects: {classData.subjects.join(', ')}
          </Text>
        </Card.Content>
      </Card>

      {Object.entries(groupedByDay).map(([day, schedule]) => (
        <Card key={day} style={styles.card}>
          <Card.Title title={day} />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Time</DataTable.Title>
                <DataTable.Title>Subject</DataTable.Title>
              </DataTable.Header>

              {schedule.map((item, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{item.time}</DataTable.Cell>
                  <DataTable.Cell>{item.subject}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  subjects: {
    color: '#666',
    marginTop: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
