import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, List, Chip, Snackbar, HelperText, Divider, Card } from 'react-native-paper';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { Assignment } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

// --- Corrected Import: Accessing SCDSelector from the expected repository path ---
// SCDSelector.native exports a default component, import it as default.
import SCDSelector from '../../../components/common/SCDSelector.native';

// Date Picker (using native module pattern)
// Ensure you have installed: npm install @react-native-community/datetimepicker
import DateTimePicker from '@react-native-community/datetimepicker'; 
import dayjs from 'dayjs';

// --- TYPES (Simplified for RN State Management) ---
type AssignmentForm = {
  name: string; 
  schoolId: string;
  classId: string;
  divisionId: string;
  subjectId: string;
  message: string; 
  deadLine: string; // Stored as YYYY-MM-DD string
  status: string;
  assignmentSubmission: any[]; 
};

// --- MAIN COMPONENT ---
export const EditAssignment: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const assignmentId = (route.params as { id?: string | null })?.id; 
  const { user } = useAuth();
  const isStudent = user?.type === 'STUDENT';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  // Dropdown data
  const [schools, setSchools] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Assignment Data
  const [form, setForm] = useState<AssignmentForm>({
    name: '',
    schoolId: '',
    classId: '',
    divisionId: '',
    subjectId: '',
    deadLine: '',
    message: '',
    status: 'ACTIVE', 
    assignmentSubmission: [], 
  });

  // Submission Data (For both student and teacher views)
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  // File for new assignment attachment (Teacher/Admin)
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

  const isTeacherOrAdmin = useMemo(() => user?.type !== 'STUDENT', [user]);
  
  // --- Data Fetching ---
  const fetchSubmissions = async (id: string) => {
    setSaving(true);
    try {
        const studentId = user?.type === 'STUDENT' ? user.id : undefined;
        const res = await apiService.getAssignmentSubmissions(id, studentId);
        
        const mappedSubmissions = res.map((sub: any) => ({ 
            ...sub, 
            file: null, 
            message: sub.message || '', 
            status: sub.status || 'Pending', 
        }));
        setSubmissions(mappedSubmissions);
    } catch (e) {
        console.error('Failed to fetch submissions:', e);
    } finally {
        setSaving(false);
    }
  };
  
  useEffect(() => {
    const init = async () => {
      let accId: string | null = null;
      try {
        const raw = await storage.getItem('SCM-AUTH');
        accId = raw ? JSON.parse(raw)?.data?.accountId : null;
        setAccountId(accId);

        if (accId) {
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

        if (assignmentId) {
          const assignmentRes = await apiService.getAssignmentById(assignmentId);
          if (assignmentRes) {
            setForm({
              name: assignmentRes.name || assignmentRes.title || '',
              schoolId: String(assignmentRes.schoolId || ''),
              classId: String(assignmentRes.classId || ''),
              divisionId: String(assignmentRes.divisionId || ''),
              subjectId: String(assignmentRes.subjectId || ''),
              deadLine: assignmentRes.deadLine || assignmentRes.dueDate || '',
              message: assignmentRes.message || assignmentRes.description || '',
              status: assignmentRes.status || 'ACTIVE',
              assignmentSubmission: Array.isArray(assignmentRes.assignmentSubmission) ? assignmentRes.assignmentSubmission : [],
            });
            await fetchSubmissions(assignmentId);
          }
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
        showToast('Failed to load assignment data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [assignmentId, user?.id, user?.type]);

  // --- Core Handlers ---

  const handleSaveAssignment = async () => {
    if (!accountId || isStudent) return;

    if (!form.name || !form.schoolId || !form.classId || !form.divisionId || !form.subjectId || !form.deadLine) {
        showToast('Please fill all required fields.');
        return;
    }
    
    setSaving(true);
    try {
      const payload = {
        id: assignmentId || undefined,
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

      await apiService.saveAssignment(payload, uploadedAssignmentFile);
      
      showToast(assignmentId ? 'Assignment updated successfully' : 'Assignment created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      showToast('Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDatePickerChange = (event: any, selectedDate: Date | undefined) => {
    // Only dismiss the picker if the mode is 'date' (which it is here)
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
        setForm((f) => ({ ...f, deadLine: dayjs(selectedDate).format('YYYY-MM-DD') }));
    }
  };

  const handleDownload = (submissionFile: any, isStudentSubmission: boolean) => {
    Alert.alert(
      'Download Functionality',
      `The file "${submissionFile.fileName}" is ready to be downloaded. In a real React Native app, this requires a library like 'expo-file-system' to save the file to the device storage from the API blob response. The API endpoints used are correct.`
    );
  };
  
  const handlePickAssignmentFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        
        // Format file object for FormData on RN/Expo
        const file = {
            uri: pickedFile.uri,
            name: pickedFile.name || 'assignment_file',
            type: pickedFile.mimeType || 'application/octet-stream',
        };
        setUploadedAssignmentFile(file);
      }
    } catch (e) {
      console.error('File pick error:', e);
      showToast('Error picking file.');
    }
  };

  const handlePickStudentSubmission = async (index: number) => {
      try {
          const result = await DocumentPicker.getDocumentAsync({});
          if (result.canceled === false && result.assets && result.assets.length > 0) {
              const pickedFile = result.assets[0];
              const file = {
                  uri: pickedFile.uri,
                  name: pickedFile.name,
                  type: pickedFile.mimeType || 'application/octet-stream',
              };

              setSubmissions((prev) => {
                  const updated = [...prev];
                  updated[index] = { ...updated[index], file }; 
                  return updated;
              });
          }
      } catch (e) {
          console.error('File pick error:', e);
          showToast('Error picking file.');
      }
  };

  const handleSubmitStudentWork = async (index: number) => {
    const submissionRecord = submissions[index];
    if (!submissionRecord.file) {
      showToast('Please select a file to submit.');
      return;
    }
    if (!assignmentId || !user?.id) return;
    
    setSaving(true);
    try {
        await apiService.submitAssignment(assignmentId, user.id, submissionRecord.file);
        showToast('Assignment submitted successfully!');
        await fetchSubmissions(assignmentId); 
    } catch (e) {
        console.error('Submission failed:', e);
        showToast('Failed to submit assignment.');
    } finally {
        setSaving(false);
    }
  };

  const handleTeacherUpdateSubmission = async (index: number) => {
    const submission = submissions[index];
    if (!submission.id) return;
    
    setSaving(true);
    try {
        const payload = {
            status: submission.status,
            message: submission.message
        };
        await apiService.updateAssignmentSubmission(submission.id, payload);
        showToast('Submission feedback updated successfully!');
    } catch (e) {
        console.error('Feedback update failed:', e);
        showToast('Failed to update submission feedback.');
    } finally {
        setSaving(false);
    }
  };
  
  const handleTeacherDeleteSubmission = async (id: string) => {
    if (!id) return;
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this student submission?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setSaving(true);
            try {
                await apiService.deleteAssignmentSubmission(id);
                showToast('Submission deleted successfully.');
                setSubmissions(prev => prev.filter(sub => sub.id !== id)); 
            } catch (e) {
                showToast('Failed to delete submission.');
            } finally {
                setSaving(false);
            }
          }
        },
      ]
    );
  };
  
  // --- Render Logic ---
  if (loading) return <ActivityIndicator style={styles.center} size={36} color="#6200ee" />;

  const Title = assignmentId ? 'Edit Assignment' : 'Add Assignment';
  const displayAssignmentFile = form.assignmentSubmission.length > 0 ? form.assignmentSubmission[0] : null;

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineMedium" style={styles.title}>{Title}</Text>

        {/* --- Section 1: Assignment Details (Teacher/Admin Only) --- */}
        {isTeacherOrAdmin && (
          <Card style={styles.card}>
            <Card.Title title="Assignment Details" titleStyle={styles.cardTitle} />
            <Card.Content>
              <TextInput 
                label="Assignment Name *" 
                value={form.name} 
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} 
                mode="outlined" 
                style={styles.input} 
                disabled={saving}
              />
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
              
              {/* Status Select */}
              <List.Section style={styles.selectorSection} title="Status *">
                  <List.Accordion 
                      title={`Status: ${form.status}`} 
                      left={props => <List.Icon {...props} icon="toggle-switch-outline" />}
                      expanded={false} // Always collapsed, uses direct press to toggle status
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
              
              {/* SCD Selector Component (Accessed from local repo) */}
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

              {/* Assignment File Upload (Teacher/Admin) */}
              <View style={styles.fileUploadContainer}>
                <Text style={styles.fileUploadTitle}>📁 Upload Assignment File</Text>
                <Button 
                    mode="contained" 
                    icon="upload" 
                    onPress={handlePickAssignmentFile}
                    disabled={saving}
                    style={styles.uploadButton}
                >
                    {uploadedAssignmentFile ? 'Change File' : 'Select File'}
                </Button>
                {(uploadedAssignmentFile || displayAssignmentFile) && (
                    <Chip 
                        icon="file-document-outline" 
                        style={styles.fileChip}
                    >
                        {uploadedAssignmentFile?.name || displayAssignmentFile?.fileName}
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
                  Save Assignment
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}


        {/* --- Section 2: Assignment Files & Student Submission (Common/Student Focus) --- */}
        {assignmentId && (
            <Card style={[styles.card, styles.submissionCard]}>
                <Card.Title 
                    title={isStudent ? 'Assignment Files & My Submission' : 'Assignment Files'} 
                    titleStyle={styles.cardTitle}
                />
                <Card.Content>
                    {form.assignmentSubmission.length > 0 ? form.assignmentSubmission.map((sub: any, index: number) => (
                        <View key={index} style={styles.submissionRow}>
                            <View style={{flex: 1, marginRight: 10}}>
                                <Text style={styles.submissionFileName} numberOfLines={1}>
                                    📄 {sub.fileName} ({sub.fileSize && (sub.fileSize / 1024).toFixed(2) + ' KB'})
                                </Text>
                            </View>
                            <Button 
                                mode="outlined" 
                                icon="download" 
                                onPress={() => handleDownload(sub, false)}
                                compact
                                size="small"
                                style={{marginRight: 8}}
                            >
                                Get
                            </Button>
                            
                            {/* Student Submission UI */}
                            {isStudent && (
                                <View style={styles.studentSubmissionArea}>
                                    <Button
                                        mode="outlined"
                                        icon="file-upload"
                                        onPress={() => handlePickStudentSubmission(index)}
                                        compact
                                        size="small"
                                        style={{marginRight: 8}}
                                        disabled={saving}
                                    >
                                        {submissions[index]?.file ? 'Change' : 'Upload'}
                                    </Button>
                                    <Button
                                        mode="contained"
                                        icon="check"
                                        onPress={() => handleSubmitStudentWork(index)}
                                        compact
                                        size="small"
                                        disabled={!submissions[index]?.file || saving}
                                        style={{backgroundColor: '#4CAF50'}}
                                    >
                                        Submit
                                    </Button>
                                    {submissions[index]?.file && (
                                        <Text style={styles.fileLabel}>📎 {submissions[index].file.name}</Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )) : <Text style={styles.emptyText}>No assignment files provided by the teacher.</Text>}
                </Card.Content>
            </Card>
        )}


        {/* --- Section 3: Submissions Review (Teacher/Student) --- */}
        {assignmentId && (
            <Card style={[styles.card, styles.reviewCard]}>
                <Card.Title 
                    title={isStudent ? 'My Submission & Teacher Feedback' : `Student Submissions (${submissions.length})`} 
                    titleStyle={styles.cardTitle}
                />
                <Card.Content>
                    {submissions.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {isStudent ? "You haven't submitted any work yet." : 'No student submissions found.'}
                        </Text>
                    ) : (
                        submissions.map((sub: any, index: number) => (
                            <View key={sub.id || index} style={styles.submissionReviewItem}>
                                <View style={styles.reviewHeader}>
                                    {!isStudent && (
                                        <Text variant="titleSmall" style={{marginRight: 10, color: '#333'}}>👤 ID: {sub.studentId}</Text>
                                    )}
                                    <Chip 
                                        icon={sub.status === 'accepted' ? 'check-circle' : sub.status === 'rejected' ? 'close-circle' : 'progress-alert'}
                                        style={{
                                            backgroundColor: sub.status === 'accepted' ? '#e8f5e9' : sub.status === 'rejected' ? '#ffebee' : '#fbe9e7',
                                        }}
                                        textStyle={{ color: sub.status === 'accepted' ? '#2E7D32' : sub.status === 'rejected' ? '#d32f2f' : '#FF9800' }}
                                    >
                                        {sub.status || 'Pending'}
                                    </Chip>
                                </View>
                                
                                <View style={{...styles.submissionRow, borderBottomWidth: 0, marginTop: 8}}>
                                    <Text style={{flex: 1, fontSize: 14}}>📄 File: {sub.fileName || 'N/A'}</Text>
                                    {sub.fileName && (
                                        <Button mode="text" icon="download" onPress={() => handleDownload(sub, true)} compact size="small">
                                            Download
                                        </Button>
                                    )}
                                </View>
                                
                                <HelperText type="info" style={{marginTop: -8}}>
                                    Submitted: {sub.submissionDate ? dayjs(sub.submissionDate).format('YYYY-MM-DD') : 'N/A'}
                                </HelperText>

                                {/* Teacher Feedback / Student View */}
                                <View style={{marginTop: 12}}>
                                    <Text style={styles.feedbackTitle}>{isStudent ? "Teacher's Feedback" : "Comment & Grade"}</Text>
                                    {isStudent ? (
                                        <Text style={styles.feedbackText}>{sub.message || 'No feedback yet'}</Text>
                                    ) : (
                                        <View style={styles.teacherActions}>
                                            <TextInput
                                                label="Feedback Message"
                                                value={sub.message || ''}
                                                onChangeText={(v) => setSubmissions((prev) => {
                                                    const updated = [...prev];
                                                    updated[index].message = v;
                                                    return updated;
                                                })}
                                                mode="outlined"
                                                multiline
                                                numberOfLines={2}
                                                style={{ flex: 1, marginBottom: 8, backgroundColor: 'white' }}
                                                disabled={saving}
                                            />
                                            <View style={styles.actions}>
                                                <Button 
                                                    mode={sub.status === 'accepted' ? 'contained' : 'outlined'}
                                                    icon="check"
                                                    onPress={() => setSubmissions((prev) => {
                                                        const updated = [...prev];
                                                        updated[index].status = 'accepted';
                                                        return updated;
                                                    })}
                                                    compact
                                                    size="small"
                                                    style={{backgroundColor: sub.status === 'accepted' ? '#4CAF50' : undefined}}
                                                    disabled={saving}
                                                >
                                                    Accept
                                                </Button>
                                                <Button 
                                                    mode={sub.status === 'rejected' ? 'contained' : 'outlined'}
                                                    icon="close"
                                                    onPress={() => setSubmissions((prev) => {
                                                        const updated = [...prev];
                                                        updated[index].status = 'rejected';
                                                        return updated;
                                                    })}
                                                    compact
                                                    size="small"
                                                    style={{backgroundColor: sub.status === 'rejected' ? '#d32f2f' : undefined}}
                                                    disabled={saving}
                                                >
                                                    Reject
                                                </Button>
                                                <Button 
                                                    mode="contained" 
                                                    icon="content-save" 
                                                    onPress={() => handleTeacherUpdateSubmission(index)}
                                                    compact
                                                    size="small"
                                                    disabled={saving}
                                                    style={styles.updateButton}
                                                >
                                                    Save
                                                </Button>
                                                <Button 
                                                    mode="text" 
                                                    icon="delete" 
                                                    textColor="red"
                                                    onPress={() => handleTeacherDeleteSubmission(sub.id)}
                                                    compact
                                                    size="small"
                                                    disabled={saving}
                                                >
                                                    Del
                                                </Button>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <Divider style={styles.submissionDivider} />
                            </View>
                        ))
                    )}
                </Card.Content>
            </Card>
        )}

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

// --- STYLES ---

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
  submissionCard: {
    backgroundColor: '#e3f2fd', 
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  reviewCard: {
    backgroundColor: '#fff3e0', 
    borderColor: '#FF9800',
    borderWidth: 1,
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
  // SCD Selector and Subject List styles
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
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cfe2f3', // Light blue divider
    flexWrap: 'wrap',
  },
  submissionFileName: {
    flexShrink: 1,
    fontSize: 14,
    marginRight: 8,
    color: '#333',
  },
  studentSubmissionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  fileLabel: {
    fontSize: 12,
    marginLeft: 8,
    color: '#666',
  },
  submissionReviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  feedbackTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    color: '#F57C00', 
  },
  feedbackText: {
    color: '#666',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F57C00',
  },
  teacherActions: {
    flexDirection: 'column', 
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd54f', // Light orange border
  },
  updateButton: {
      backgroundColor: '#42a5f5', // Light blue for save action
      minWidth: 60,
  },
  submissionDivider: {
      height: 1,
      backgroundColor: '#eee',
      marginVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  snackbar: {
    backgroundColor: '#333',
    borderRadius: 8,
  }
});

export default EditAssignment;
