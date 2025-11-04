import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Chip, List } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Class } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ClassesScreen: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await apiService.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClasses();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteClass(id);
      loadClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {classes.map((classItem) => (
          <Card key={classItem.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">
                  {classItem.className} - Section {classItem.section}
                </Text>
              </View>

              <View style={styles.details}>
                <Text variant="bodySmall" style={styles.label}>
                  Subjects:
                </Text>
                <View style={styles.chipContainer}>
                  {classItem.subjects.map((subject, index) => (
                    <Chip key={index} mode="outlined" style={styles.chip}>
                      {subject}
                    </Chip>
                  ))}
                </View>

                <Text variant="bodySmall" style={styles.scheduleLabel}>
                  Schedule ({classItem.schedule.length} classes)
                </Text>
              </View>

              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => console.log('Edit', classItem.id)}>
                  Edit
                </Button>
                <Button
                  mode="text"
                  textColor="red"
                  onPress={() => handleDelete(classItem.id)}
                >
                  Delete
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {classes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No classes found</Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Add class')}
      />
    </View>
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
  header: {
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    marginBottom: 4,
  },
  scheduleLabel: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
});
