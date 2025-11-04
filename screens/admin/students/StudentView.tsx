import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { apiService } from '../../../api/apiService';

type Props = {
  id: string;
  onClose?: () => void;
};

export const StudentView: React.FC<Props> = ({ id }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiService.getStudentById(id);
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>No data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleLarge">{data.firstName} {data.lastName}</Text>
          <Text>{data.userName}</Text>
          <Text>{data.email}</Text>
          <Text>{data.mobile}</Text>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Card.Content>
          <Text variant="titleMedium">Details</Text>
          <Text>Roll No: {String(data.rollNo || '')}</Text>
          <Text>DOB: {data.dob || ''}</Text>
          <Text>Address: {data.address || ''}</Text>
          <Text>School: {data.schoolName || data.schoolId}</Text>
          <Text>Class: {data.className || data.classId}</Text>
          <Text>Division: {data.divisionName || data.divisionId}</Text>
          <Text>Role: {data.role?.name || ''}</Text>
          <Text>Status: {data.status || ''}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentView;


