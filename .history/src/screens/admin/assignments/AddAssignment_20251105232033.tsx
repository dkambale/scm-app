import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, List, Chip, Snackbar, HelperText, Card } from 'react-native-paper';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

// Import SCDSelector from the specified repository path
import SCDSelector from '../../../components/common/SCDSelector.native';

import DateTimePicker from '@react-native-community/datetimepicker'; 
import dayjs from 'dayjs';
import { userDetails } from '../../../api';

// --- TYPES ---
type AssignmentForm = {
  name: string; 
  schoolId: string;
  classId: string;
  divisionId: string;
  subjectId: string;
  message: string; 
  deadLine: string; // YYYY-MM-DD
  status: string;
  // Note: assignmentSubmission array is not needed for the Add screen initial state
};

// --- MAIN COMPONENT: Focused purely on CREATION ---
export const AddAssignment: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Since this is an ADD screen, the user must be Teacher/Admin (we omit student checks)
  const isTeacherOrAdmin = user?.type !== 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Dropdown data
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Assignment Data: Initial state must be empty, ready for creation
  const [form, setForm] = useState<AssignmentForm>({
    name: '',
    schoolId: '',
    classId: '',
    divisionId: '',
    subjectId: '',
    deadLine: '', // Default to empty string for date picker initialization
    message: '',
    status: 'ACTIVE', // Default to active for new assignment
  });

  // File for new assignment attachment
  const [uploadedAssignmentFile, setUploadedAssignmentFile] = useState<any | null>(null);

  // UI State
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  // --- Data Fetching (Only for dropdowns) ---
  useEffect(() => {
    const init = async () => {
      let accId: string | null = null;
      try {
             accId = userDetails.getAccountId();

        setAccountId(accId);

        if (accId && isTeacherOrAdmin) {
          const [schoolsRes, classesRes, divisionsRes, subjectsRes] = await Promise.all([
            apiService.getSchools(accId),
            apiService.getClassesList(accId),
            apiService.getDivisions(accId),
            apiService.getSubjects(accId),
          ]);
          setSchools(schoolsRes);
          setClasses(classesRes);
          setDivisions(divisionsRes);
          setSubjects(subjectsRes);
        }
      } catch (e) {
        console.error('Failed to load dropdown data:', e);
        showToast('Failed to load school/class data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user?.type]); // Only runs on mount

  // --- Core Handlers ---

  const handleSaveAssignment = async () => {
    if (!accountId || !isTeacherOrAdmin) return;
    
    // Simple validation for required fields
    if (!form.name || !form.schoolId || !form.classId || !form.divisionId || !form.subjectId || !form.deadLine) {
        showToast('Please fill all required fields.');
        return;
    }
    
    setSaving(true);
    try {
      const payload = {
        // ID is omitted for creation
        accountId: accountId,
        name: form.name,
        message: form.message,
        schoolId: form.schoolId,
        classId: form.classId,
        divisionId: form.divisionId,
        subjectId: form.subjectId,
        deadLine: form.deadLine,
        status: form.status,
      };

      // apiService.saveAssignment handles multipart data including the optional file
      await apiService.saveAssignment(payload, uploadedAssignmentFile);
      
      showToast('Assignment created successfully');
      // Navigate back to the list screen
      navigation.goBack();
      
    } catch (error) {
      console.error('Failed to create assignment:', error);
      showToast('Failed to create assignment.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDatePickerChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
        setForm((f) => ({ ...f, deadLine: dayjs(selectedDate).format('YYYY-MM-DD') }));
    }
  };
  
  const handlePickAssignmentFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      // handle different result shapes across platforms / expo versions
      // Newer expo: { type: 'success'|'cancel', uri, name, mimeType }
      // Older/web shapes may have { canceled, assets: [...] }
      const r = result as any;
      if (r.type === 'success' && r.uri) {
        const file = {
          uri: r.uri,
          name: r.name || r.fileName || 'assignment_file',
          type: r.mimeType || r.type || 'application/octet-stream',
        };
        setUploadedAssignmentFile(file);
        return;
      }

      if (r.canceled === false && Array.isArray(r.assets) && r.assets.length > 0) {
        const pickedFile = r.assets[0];
        const file = {
          uri: pickedFile.uri,
          name: pickedFile.name || pickedFile.fileName || 'assignment_file',
          type: pickedFile.mimeType || pickedFile.type || 'application/octet-stream',
        };
        setUploadedAssignmentFile(file);
        return;
      }

      // If the user cancelled or unknown shape, just do nothing
    } catch (e) {
      console.error('File pick error:', e);
      showToast('Error picking file.');
    }
  };
  
  // --- Render Logic ---
  if (loading) return <ActivityIndicator style={styles.center} size={36} color="#6200ee" />;

  // Only render the form if the user is a Teacher or Admin
  if (!isTeacherOrAdmin) {
      return (
          <View style={styles.center}>
              <Text variant="titleLarge" style={{color: 'red'}}>Access Denied</Text>
              <Text variant="bodyMedium">Only Teachers and Admins can create assignments.</Text>
          </View>
      );
  }

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineMedium" style={styles.title}>Add New Assignment</Text>

        <Card style={styles.card}>
          <Card.Title title="Assignment Details" titleStyle={styles.cardTitle} />
          <Card.Content>
            {/* Assignment Name */}
            <TextInput 
              label="Assignment Name *" 
              value={form.name} 
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} 
              mode="outlined" 
              style={styles.input} 
              disabled={saving}
            />
            {/* Description */}
            <TextInput 
              label="Message / Description" 
              value={form.message} 
              onChangeText={(v) => setForm((f) => ({ ...f, message: v }))} 
              mode="outlined" 
              style={styles.input} 
              multiline
              numberOfLines={4}
              disabled={saving}
            />
            
            {/* Deadline Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={saving} style={styles.pickerTouch}>
                <TextInput
                  label="Deadline *"
                  value={form.deadLine || dayjs().format('YYYY-MM-DD')}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                  mode="outlined"
                  style={styles.input}
                />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                  value={form.deadLine ? dayjs(form.deadLine).toDate() : dayjs().toDate()}
                  mode="date"
                  display="default"
                  onChange={handleDatePickerChange}
                  minimumDate={dayjs().toDate()}
                />
            )}
            
            {/* Status Select (Pre-filled to ACTIVE, but user can change) */}
            <List.Section style={styles.selectorSection} title="Status *">
                <List.Accordion 
                    title={`Status: ${form.status}`} 
                    left={props => <List.Icon {...props} icon="toggle-switch-outline" />}
                    expanded={false} 
                    onPress={() => setForm((f) => ({ ...f, status: f.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }))}
                    style={styles.accordion}
                >
                  <List.Item
                      title="Active"
                      onPress={() => setForm((f) => ({ ...f, status: 'ACTIVE' }))}
                      right={() => form.status === 'ACTIVE' ? <List.Icon icon="check" /> : null}
                  />
                  <List.Item
                      title="Inactive"
                      onPress={() => setForm((f) => ({ ...f, status: 'INACTIVE' }))}
                      right={() => form.status === 'INACTIVE' ? <List.Icon icon="check" /> : null}
                  />
                </List.Accordion>
            </List.Section>
            
            {/* SCD Selector Component */}
                        <SCDSelector
                          formik={{
                            values: form,
                            setFieldValue: (field: string, value: any) => setForm((f) => ({ ...f, [field]: value })),
                            touched: {},
                            errors: {},
                          }}
                        />
            
            {/* Subject Select */}
            <List.Section style={styles.selectorSection} title="Subject *">
                <List.Accordion 
                    title={subjects.find((s) => String(s.id) === String(form.subjectId))?.name || 'Select Subject'} 
                    left={props => <List.Icon {...props} icon="book-open-outline" />}
                    expanded={showSubjectModal}
                    onPress={() => setShowSubjectModal(prev => !prev)}
                    style={styles.accordion}
                >
                    <ScrollView style={{maxHeight: 200}}>
                        {subjects.map((s) => (
                            <List.Item 
                                key={s.id} 
                                title={s.name} 
                                onPress={() => {
                                    setForm((f) => ({ ...f, subjectId: String(s.id) }));
                                    setShowSubjectModal(false);
                                }} 
                                right={() => String(form.subjectId) === String(s.id) ? <List.Icon icon="check" /> : null}
                            />
                        ))}
                    </ScrollView>
                </List.Accordion>
            </List.Section>

            {/* Assignment File Upload */}
            <View style={styles.fileUploadContainer}>
              <Text style={styles.fileUploadTitle}>📁 Upload Assignment File (Optional)</Text>
              <Button 
                  mode="contained" 
                  icon="upload" 
                  onPress={handlePickAssignmentFile}
                  disabled={saving}
                  style={styles.uploadButton}
              >
                  {uploadedAssignmentFile ? 'Change File' : 'Select File'}
              </Button>
              {uploadedAssignmentFile && (
                  <Chip 
                      icon="file-document-outline" 
                      style={styles.fileChip}
                      onClose={() => setUploadedAssignmentFile(null)}
                  >
                      {uploadedAssignmentFile?.name}
                  </Chip>
              )}
            </View>

            {/* Save / Cancel */}
            <View style={styles.actions}>
              <Button mode="outlined" onPress={() => navigation.goBack()} disabled={saving}>
                Cancel
              </Button>
              <Button 
                  mode="contained" 
                  loading={saving} 
                  disabled={saving} 
                  onPress={handleSaveAssignment} 
                  style={styles.saveButton}
              >
                Create Assignment
              </Button>
            </View>
          </Card.Content>
        </Card>

      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}

        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

// --- STYLES (Reused from EditAssignment) ---

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#6200ee',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  pickerTouch: {
      marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#6200ee', 
    minWidth: 120,
    borderRadius: 8,
  },
  uploadButton: {
      backgroundColor: '#2196F3',
      borderRadius: 6,
  },
  fileChip: {
      marginTop: 8,
      alignSelf: 'flex-start',
      backgroundColor: '#BBDEFB',
  },
  fileUploadContainer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2196F3',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'flex-start',
  },
  fileUploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  selectorSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  accordion: {
      backgroundColor: 'white',
  },
  snackbar: {
    backgroundColor: '#ffffffff',
    borderRadius: 8,
  }
});

export default AddAssignment;
