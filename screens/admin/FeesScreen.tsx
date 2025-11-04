import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, DataTable } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Fee, Student } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const FeesScreen: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feesData, studentsData] = await Promise.all([
        apiService.getFees(),
        apiService.getStudents(),
      ]);
      setFees(feesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load fees:', error);
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

  const totalPending = fees
    .filter((f) => f.status === 'Pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalCollected = fees
    .filter((f) => f.status === 'Paid')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleSmall">Total Pending</Text>
            <Text variant="headlineMedium" style={styles.pendingAmount}>
              ${totalPending}
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleSmall">Total Collected</Text>
            <Text variant="headlineMedium" style={styles.collectedAmount}>
              ${totalCollected}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Card style={styles.card}>
          <Card.Title title="Fee Records" />
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Student</DataTable.Title>
                <DataTable.Title numeric>Amount</DataTable.Title>
                <DataTable.Title>Due Date</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {fees.map((fee) => (
                <DataTable.Row key={fee.id}>
                  <DataTable.Cell>{getStudentName(fee.studentId)}</DataTable.Cell>
                  <DataTable.Cell numeric>${fee.amount}</DataTable.Cell>
                  <DataTable.Cell>{fee.dueDate}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.chip,
                        fee.status === 'Paid' ? styles.paid : styles.pending,
                      ]}
                    >
                      {fee.status}
                    </Chip>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        {fees.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No fee records found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    elevation: 4,
  },
  pendingAmount: {
    color: '#ff6f00',
    fontWeight: 'bold',
    marginTop: 8,
  },
  collectedAmount: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  paid: {
    backgroundColor: '#e8f5e9',
  },
  pending: {
    backgroundColor: '#ffebee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
