import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Searchbar, Chip, Portal, Dialog } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Student } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { storage } from '../../utils/storage';

export const StudentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<Partial<Student>>({ firstName: '', lastName: '', email: '', rollNumber: '' as any });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNumber.includes(searchQuery)
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const accountId = raw ? (JSON.parse(raw)?.data?.accountId ?? undefined) : undefined;
      const data = await apiService.getStudents(accountId);
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteStudent(id);
      loadStudents();
    } catch (error) {
      console.error('Failed to delete student:', error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ firstName: '', lastName: '', email: '', rollNumber: '' as any });
    setShowDialog(true);
  };

  const openEdit = (s: Student) => {
    setEditingId(s.id);
    setForm({ ...s });
    setShowDialog(true);
  };

  const submitForm = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const accountId = raw ? (JSON.parse(raw)?.data?.accountId ?? undefined) : undefined;
      if (editingId) {
        await apiService.updateStudent(editingId, form);
      } else {
        await apiService.createStudent({ ...form, accountId });
      }
      setShowDialog(false);
      await loadStudents();
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search students..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredStudents.map((student) => (
          <Card key={student.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <View>
                  <Text variant="titleLarge">
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text variant="bodyMedium" style={styles.email}>
                    {student.email}
                  </Text>
                </View>
                <Chip>Roll: {student.rollNumber}</Chip>
              </View>

              <View style={styles.details}>
                <Text variant="bodySmall">DOB: {student.dob}</Text>
                <Text variant="bodySmall">Parent: {student.parentContact}</Text>
                <Text variant="bodySmall" numberOfLines={1}>
                  Address: {student.address}
                </Text>
              </View>

              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => openEdit(student)}>
                  Edit
                </Button>
                <Button mode="text" textColor="red" onPress={() => handleDelete(student.id)}>
                  Delete
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No students found</Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreate}
      />

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>{editingId ? 'Edit Student' : 'Add Student'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="First Name"
              value={form.firstName || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, firstName: v }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Last Name"
              value={form.lastName || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, lastName: v }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Email"
              value={form.email || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Roll Number"
              value={(form.rollNumber as any) || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, rollNumber: v as any }))}
              style={styles.input}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDialog(false)}>Cancel</Button>
            <Button onPress={submitForm}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  email: {
    color: '#666',
  },
  details: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  input: {
    marginTop: 8,
    marginBottom: 8,
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
