import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, DataTable, Button, Chip } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Attendance, Student } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const AttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attendanceData, studentsData] = await Promise.all([
        apiService.getAttendance(),
        apiService.getStudents(),
      ]);
      setAttendance(attendanceData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  if (loading) return <LoadingSpinner />;

  const groupedByDate = attendance.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, Attendance[]>);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {Object.entries(groupedByDate).reverse().map(([date, records]) => (
        <Card key={date} style={styles.card}>
          <Card.Title title={date} />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Student</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {records.map((record) => (
                <DataTable.Row key={record.id}>
                  <DataTable.Cell>{getStudentName(record.studentId)}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.chip,
                        record.status === 'Present' ? styles.present : styles.absent,
                      ]}
                    >
                      {record.status}
                    </Chip>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      ))}

      {attendance.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge">No attendance records found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  present: {
    backgroundColor: '#e8f5e9',
  },
  absent: {
    backgroundColor: '#ffebee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
