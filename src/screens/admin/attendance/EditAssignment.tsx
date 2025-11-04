import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Assignment } from '../../../types';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';

type Props = {
  id?: string | null;
  assignment?: Assignment | null;
  onClose: () => void;
  onSaved: () => void;
};

// Simplified form component based on the logic in common/AssignmentsScreen.tsx
export const EditAssignment: React.FC<Props> = ({ id, assignment, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Assignment>>({
    title: assignment?.title || '',
    description: assignment?.description || '',
    dueDate: assignment?.dueDate || '',
    // Note: ClassId and TeacherId selection should be added here for a complete implementation.
  });

  const onSave = async () => {
    setSaving(true);
    try {
      const raw = await storage.getItem('SCM-AUTH');
      const auth = raw ? JSON.parse(raw) : null;
      const accountId = auth?.data?.accountId;
      // Note: Assuming teacher/admin is creating and their ID is used for teacherId
      const payload = { 
        ...form, 
        accountId, 
        teacherId: assignment?.teacherId || auth?.data?.id || 't1', 
        classId: assignment?.classId || 'c1' // Placeholder for required fields
      }; 
      
      if (id) {
        await apiService.updateAssignment(id, payload);
      } else {
        await apiService.createAssignment(payload);
      }
      onSaved();
    } catch (e) {
      console.error('Failed to save assignment:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>{id ? 'Edit Assignment' : 'Add Assignment'}</Text>

      <TextInput 
        label="Title" 
        value={form.title || ''} 
        onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} 
        mode="outlined" 
        style={styles.input} 
      />
      <TextInput 
        label="Description" 
        value={form.description || ''} 
        onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} 
        mode="outlined" 
        style={styles.input} 
        multiline
      />
      <TextInput 
        label="Due Date (YYYY-MM-DD)" 
        value={form.dueDate || ''} 
        onChangeText={(v) => setForm((f) => ({ ...f, dueDate: v }))} 
        mode="outlined" 
        style={styles.input} 
      />
      
      <View style={styles.actions}>
        <Button mode="text" onPress={onClose} disabled={saving}>Cancel</Button>
        <Button mode="contained" loading={saving} disabled={saving} onPress={onSave}>Save</Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
});

export default EditAssignment;