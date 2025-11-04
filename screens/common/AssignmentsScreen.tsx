import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Chip, Portal, Dialog, TextInput } from 'react-native-paper';
import { apiService } from '../../api/apiService';
import { Assignment } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';

export const AssignmentsScreen: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Assignment>>({ title: '', description: '', dueDate: '' });

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const auth = raw ? JSON.parse(raw) : null;
      const accountId = auth?.data?.accountId;
      const params: Record<string, any> = { accountId };
      if (user?.role === 'teacher') params.teacherId = user.id;
      if (user?.role === 'student') params.classId = auth?.data?.classId;
      const data = await apiService.getAssignments(params);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAssignments();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAssignment(id);
      loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', description: '', dueDate: '' });
    setShowDialog(true);
  };

  const openEdit = (a: Assignment) => {
    setEditingId(a.id);
    setForm({ title: a.title, description: a.description, dueDate: a.dueDate });
    setShowDialog(true);
  };

  const submitForm = async () => {
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const auth = raw ? JSON.parse(raw) : null;
      const accountId = auth?.data?.accountId;
      const payload = { ...form, accountId };
      if (editingId) {
        await apiService.updateAssignment(editingId, payload);
      } else {
        await apiService.createAssignment(payload);
      }
      setShowDialog(false);
      await loadAssignments();
    } catch (error) {
      console.error('Failed to save assignment:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {assignments.map((assignment) => (
          <Card key={assignment.id} style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleLarge">{assignment.title}</Text>
                <Chip icon="calendar">Due: {assignment.dueDate}</Chip>
              </View>

              <Text variant="bodyMedium" style={styles.description}>
                {assignment.description}
              </Text>

              <View style={styles.info}>
                <Text variant="bodySmall">
                  Submissions: {assignment.submissions.length}
                </Text>
                {assignment.attachmentUrl && (
                  <Text variant="bodySmall">📎 Attachment available</Text>
                )}
              </View>

              {hasPermission('EDIT_ASSIGNMENTS') && (
                <View style={styles.actions}>
                  <Button mode="outlined" onPress={() => openEdit(assignment)}>
                    Edit
                  </Button>
                  <Button
                    mode="text"
                    textColor="red"
                    onPress={() => handleDelete(assignment.id)}
                  >
                    Delete
                  </Button>
                </View>
              )}

              {user?.role === 'student' && (
                <Button mode="contained" style={styles.submitButton}>
                  Submit Assignment
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}

        {assignments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No assignments found</Text>
          </View>
        )}
      </ScrollView>

      {hasPermission('CREATE_ASSIGNMENTS') && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={openCreate}
        />
      )}

      <Portal>
        <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
          <Dialog.Title>{editingId ? 'Edit Assignment' : 'Add Assignment'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={form.title || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              style={styles.formInput}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={form.description || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              style={styles.formInput}
              mode="outlined"
              multiline
            />
            <TextInput
              label="Due Date (YYYY-MM-DD)"
              value={form.dueDate || ''}
              onChangeText={(v) => setForm((f) => ({ ...f, dueDate: v }))}
              style={styles.formInput}
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
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  description: {
    color: '#666',
    marginBottom: 12,
  },
  info: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  submitButton: {
    marginTop: 8,
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
  formInput: {
    marginTop: 8,
    marginBottom: 8,
  },
});
