import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Fee } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export const FeesScreen: React.FC = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const students = await apiService.getStudents();
      const currentStudent = students.find((s) => s.email === user?.email);

      if (currentStudent) {
        const data = await apiService.getFees(currentStudent.id);
        setFees(data);
      }
    } catch (error) {
      console.error('Failed to load fees:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFees();
  };

  const handlePayment = async (id: string) => {
    try {
      await apiService.updateFee(id, { status: 'Paid' });
      loadFees();
    } catch (error) {
      console.error('Failed to process payment:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalPending = fees
    .filter((f) => f.status === 'Pending')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium">Total Pending Fees</Text>
          <Text variant="headlineLarge" style={styles.totalAmount}>
            ${totalPending}
          </Text>
        </Card.Content>
      </Card>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {fees.map((fee) => (
          <Card key={fee.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <View>
                  <Text variant="titleLarge">${fee.amount}</Text>
                  <Text variant="bodySmall">Due: {fee.dueDate}</Text>
                </View>
                <Chip
                  mode="flat"
                  style={[styles.chip, fee.status === 'Paid' ? styles.paid : styles.pending]}
                >
                  {fee.status}
                </Chip>
              </View>

              {fee.status === 'Pending' && (
                <Button
                  mode="contained"
                  style={styles.payButton}
                  onPress={() => handlePayment(fee.id)}
                >
                  Pay Now
                </Button>
              )}

              {fee.status === 'Paid' && fee.receiptUrl && (
                <Button mode="outlined" style={styles.receiptButton}>
                  View Receipt
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}

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
  summaryCard: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#6200ee',
  },
  totalAmount: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  payButton: {
    marginTop: 8,
  },
  receiptButton: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
