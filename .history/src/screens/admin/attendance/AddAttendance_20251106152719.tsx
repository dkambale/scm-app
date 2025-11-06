import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator, List, Chip, Snackbar, Card, Avatar } from 'react-native-paper';
import { apiService } from '../../../api/apiService';
import { storage } from '../../../utils/storage';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

// --- FIXED IMPORT ---
// We import the entire module as 'SCDModule' and conditionally pull the component from its exports.
import * as SCDModule from '../../../components/common/SCDSelector.native'; 
// Determine the actual component function from the imported module (Handles both default and named exports)
const SCDSelector = SCDModule.default || SCDModule.SCDSelector;


// --- TYPES ---
type AttendanceRequest = {
  schoolId: string | null;
  classId: string | null;
  divisionId: string | null;
  subjectId: string | null;
  date: string | null; // YYYY-MM-DD
  schoolName: string;
  className: string;
  divisionName: string;
  subjectName: string;
};

type StudentMapping = {
    id: string;
    studentId: string;
    studentName: string;
    studentRollNo: string;
    vailable: boolean; 
    attendanceId?: string;
};

// --- MAIN COMPONENT ---
export const AttendanceEdit: React.FC = () => {
  const { t } = useTranslation('edit');
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string | null }) || {};
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentMapping[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null); // Full attendance record if editing
  const [loading, setLoading] = useState(false); // Local loading for all fetches
  const [reqData, setReqData] = useState<AttendanceRequest>({
    schoolId: null,
    classId: null,
    divisionId: null,
    subjectId: null,
    date: dayjs().format('YYYY-MM-DD'), // Default to today's date
    schoolName: '',
    className: '',
    divisionName: '',
    subjectName: ''
  });
  
  // UI State
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const showToast = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  // --- Data Fetching ---
  
  // 1. Fetch Subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const accountId = await storage.getItem('SCM-AUTH').then(raw => raw ? JSON.parse(raw)?.data?.accountId : null);
        if (accountId) {
            // Note: apiService.getSubjects must be implemented to fetch subject list by accountId
            const res = await apiService.getSubjects(accountId);
            setSubjects(res || []);
        }
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        showToast(t('attendance.messages.subjectFetchFailed') || 'Failed to load subjects.');
      }
    };
    loadSubjects();
  }, []);

  // 2. Fetch Existing Attendance Data if Editing
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Assuming apiService.getAttendanceById exists and fetches full attendance record
      // Note: This needs to be implemented in apiService.ts
      apiService.getAttendanceById(id) 
        .then((data) => {
          setAttendanceData(data);
          setReqData({
            schoolId: String(data.schoolId) || null,
            classId: String(data.classId) || null,
            divisionId: String(data.divisionId) || null,
            subjectId: String(data.subjectId) || null,
            date: dayjs(data.attendanceDate).format('YYYY-MM-DD'),
            schoolName: data.schoolName || '',
            className: data.className || '',
            subjectName: data.subjectName || '',
            divisionName: data.divisionName || ''
          });
          
          const mappedStudents = (data.studentAttendanceMappings || []).map((s: any) => ({
              ...s,
              vailable: s.vailable === undefined ? true : !!s.vailable 
          }));
          setStudents(mappedStudents);
        })
        .catch((err) => {
          console.error('Failed to fetch attendance data:', err);
          showToast(t('attendance.messages.fetchFailed') || 'Failed to load attendance record.');
        })
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [id]);

  // 3. Fetch Students/Attendance based on Selection
  useEffect(() => {
    const { classId, divisionId, subjectId, date } = reqData;
    
    const isReadyForFetch = classId && divisionId && subjectId && date;
    const isEditMode = !!id;

    let shouldFetch = false;

    if (isReadyForFetch) {
        if (!isEditMode) {
            // In Add mode, always fetch when ready
            shouldFetch = true;
        } else if (attendanceData) {
            // In Edit mode, fetch if selections deviate from loaded data
            const loadedDate = dayjs(attendanceData?.attendanceDate).format('YYYY-MM-DD');

            if (classId !== String(attendanceData?.classId) || 
                divisionId !== String(attendanceData?.divisionId) || 
                subjectId !== String(attendanceData?.subjectId) || 
                date !== loadedDate) 
            {
                shouldFetch = true;
            }
        }
    }
    
    if (shouldFetch) {
         fetchAttendance(classId!, divisionId!, subjectId!, date!);
    }
  }, [reqData.classId, reqData.divisionId, reqData.subjectId, reqData.date, id, attendanceData]);

  const fetchAttendance = async (classId: string, divisionId: string, subjectId: string, date: string) => {
    setLoading(true);
    const accountId = await storage.getItem('SCM-AUTH').then(raw => raw ? JSON.parse(raw)?.data?.accountId : null);
    if (!accountId) {
        setLoading(false);
        return;
    }
    // API endpoint for fetching student list + their status for a given day/class/subject
    try {
      // Use ApiService helper to fetch attendance by criteria
      const resp = await apiService.getAttendanceBy(accountId, {
        classId,
        divisionId,
        subjectId,
        date,
      });

      const newStudents = (resp?.studentAttendanceMappings || []).map((s: any) => ({
        ...s,
        vailable: s.vailable === undefined ? true : !!s.vailable,
      }));
      setStudents(newStudents);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
      showToast(t('attendance.messages.fetchFailed') || 'Failed to fetch student list.');
    }
    setLoading(false);
  };
  
  // --- Handlers ---
  
  // SCDSelector Adapter using the assignment formik pattern
  const scdAdapter = {
    values: {
      schoolId: reqData.schoolId,
      classId: reqData.classId,
      divisionId: reqData.divisionId,
      // Pass name fields to allow SCDSelector to display current selected names
      schoolName: reqData.schoolName, 
      className: reqData.className,
      divisionName: reqData.divisionName,
    },
    // The SCDSelector calls this function
    setFieldValue: (field: string, value: any, label?: string) => {
      setReqData((prev) => {
          const newState = { ...prev, [field]: value };
          // Manually update the name fields to be used in payloads and titles
          if (field === 'schoolId') newState.schoolName = label || '';
          if (field === 'classId') newState.className = label || '';
          if (field === 'divisionId') newState.divisionName = label || '';
          return newState;
      });
    },
    // Required but unused props for SCDSelector in RN implementation
    touched: {},
    errors: {},
  };

  const handleToggle = (index: number) => {
    setStudents((prevStudents) =>
      prevStudents.map((student, idx) => (idx === index ? { ...student, vailable: !student.vailable } : student))
    );
  };
  
  const handleDatePickerChange = (event: any, selectedDate: Date | undefined) => {
    // Only dismiss the picker if the date was actually selected/changed
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
        setReqData((prev) => ({ ...prev, date: dayjs(selectedDate).format('YYYY-MM-DD') }));
    }
  };
  
  const onHandleClickSubmit = async () => {
    // Client-side validation
    if (!reqData.schoolId || !reqData.classId || !reqData.divisionId || !reqData.subjectId || !reqData.date) {
      showToast(t('common.fillAllFields') || 'Please select School, Class, Division, Subject, and Date.');
      return;
    }

    setLoading(true);
    
    const { classId, divisionId, subjectId, date, className, subjectName, divisionName, schoolId, schoolName } = reqData;

    const accountId = await storage.getItem('SCM-AUTH').then(raw => raw ? JSON.parse(raw)?.data?.accountId : null);
    if (!accountId) {
      setLoading(false);
      showToast('Account information missing. Please login again.');
      return;
    }

    const payload = {
      attendanceDate: date,
      studentAttendanceMappings: students.map(s => ({
          ...s,
          // Ensure we send back the correct boolean status
          vailable: !!s.vailable,
          // some backends expect a correctly spelled flag — include both to be safe
          available: !!s.vailable,
          // ensure studentId is present (backend usually expects this key)
          studentId: s.studentId || s.id || null,
      })),
      classId: classId,
      divisionId: divisionId,
      schoolId: schoolId,
      schoolName: schoolName,
      // Assuming teacherId is user.id from AuthContext, as per backend structure
      teacherId: user?.id, 
      subjectId: subjectId,
      className: className,
      subjectName: subjectName,
      divisionName: divisionName,
      accountId,
      id: attendanceData?.id || null
    };
    // Log the outgoing payload to help debug server-side 500s
    console.log('[attendance] saving payload', payload);

    try {
      // Use ApiService helper to save attendance
      const resp = await apiService.saveAttendance(payload);
      console.log('[attendance] save response', resp);
      showToast(id ? (t('attendance.messages.updateSuccess') || 'Attendance updated successfully') : (t('attendance.messages.saveSuccess') || 'Attendance saved successfully'));
      navigation.goBack();
    } catch (err: any) {
      // Log detailed error information for debugging
      console.error('Failed to update attendance:', err);
      if (err?.response) {
        console.error('Server response status:', err.response.status);
        console.error('Server response data:', err.response.data);
        showToast(
          `Save failed (${err.response.status}): ${
            (err.response.data && err.response.data.message) || JSON.stringify(err.response.data) || err.message
          }`
        );
      } else {
        showToast(t('attendance.messages.saveFailed') || 'Failed to save attendance. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show a central spinner if either the provider data is loading or local fetch is running
  if (loading) {
    return <ActivityIndicator style={styles.center} size={36} color="#6200ee" />;
  }
  
  const Title = id ? t('attendance.title.edit') : t('attendance.title.add');
  const listTitle = reqData.className 
      ? `${reqData.className} - ${reqData.divisionName} - ${reqData.subjectName}`
      : (t('attendance.messages.selectPlaceholder') || 'Select criteria above to load students');

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineMedium" style={styles.title}>{Title}</Text>

        <Card style={styles.card}>
          <Card.Title title="Selection Criteria" titleStyle={styles.cardTitle} />
          <Card.Content>
            
            {/* School / Class / Division Selector (Using Assignment's simple formik style) */}
            {/* Ensure SCDSelector is a valid component function */}
            {SCDSelector && (
              <SCDSelector
                  // Note: schools/classes/divisions props removed, assuming SCDSelector.native fetches internally
                  formik={scdAdapter} 
              />
            )}
            
            {/* Subject Select */}
            <List.Section style={styles.selectorSection} title={t('attendance.fields.subject') || "Subject *"}>
                <List.Accordion 
                    title={subjects.find((s) => String(s.id) === String(reqData.subjectId))?.name || 'Select Subject'} 
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
                                    setReqData((f) => ({ ...f, subjectId: String(s.id), subjectName: s.name }));
                                    setShowSubjectModal(false);
                                }} 
                                right={() => String(reqData.subjectId) === String(s.id) ? <List.Icon icon="check" /> : null}
                            />
                        ))}
                    </ScrollView>
                </List.Accordion>
            </List.Section>

            {/* Date Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.pickerTouch}>
                <TextInput
                  label={t('attendance.fields.date') || "Date *"}
                  value={reqData.date || dayjs().format('YYYY-MM-DD')}
                  editable={false}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                  mode="outlined"
                  style={styles.input}
                />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                  value={reqData.date ? dayjs(reqData.date).toDate() : dayjs().toDate()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDatePickerChange}
                  maximumDate={dayjs().toDate()} // Attendance can't be future date
                />
            )}
            
          </Card.Content>
        </Card>

        {/* Student Attendance List */}
        <Card style={styles.card}>
            <Card.Title 
                title={listTitle} 
                titleStyle={styles.cardTitle}
            />
            <Card.Content>
                <View style={styles.studentListContainer}>
                    {students.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {reqData.classId ? (t('attendance.messages.noStudents') || 'No students found for the selected criteria.') : (t('attendance.messages.selectPlaceholder') || 'Select criteria above to load students')}
                        </Text>
                    ) : (
                        students.map((student, index) => (
                            <TouchableOpacity 
                                key={student.studentId || student.id}
                                onPress={() => handleToggle(index)}
                                style={[styles.studentItem, { 
                                    backgroundColor: student.vailable ? '#E8F5E9' : '#FFEBEE', // Light Green / Light Red
                                    borderColor: student.vailable ? '#4CAF50' : '#F44336', // Green / Red
                                }]}
                            >
                <Avatar.Text
                  size={40}
                  style={{
                    backgroundColor: student.vailable ? '#4CAF50' : '#F44336', // Green / Red
                  }}
                  label={student.studentName ? student.studentName.charAt(0).toUpperCase() : 'S'}
                />
                                <View style={styles.studentInfo}>
                                    <Text variant="titleMedium" numberOfLines={1}>{student.studentName}</Text>
                                    <Text variant="bodySmall" style={{color: '#666'}}>Roll No: {student.studentRollNo}</Text>
                                </View>
                                <Chip 
                                    icon={student.vailable ? "check" : "close"} 
                                    style={{ 
                                        backgroundColor: student.vailable ? '#A5D6A7' : '#EF9A9A' 
                                    }}
                                >
                                    {student.vailable ? (t('common.present') || 'Present') : (t('common.absent') || 'Absent')}
                                </Chip>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </Card.Content>
        </Card>

        {/* Submit Button */}
        {students.length > 0 && (
            <View style={styles.actions}>
                <Button 
                    mode="outlined" 
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    {t('common.cancel') || 'Cancel'}
                </Button>
                <Button 
                    mode="contained" 
                    onPress={onHandleClickSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                >
                    {id ? (t('common.update') || 'Update Attendance') : (t('common.save') || 'Save Attendance')}
                </Button>
            </View>
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
  input: {
    marginBottom: 0, 
    backgroundColor: 'white',
  },
  pickerTouch: {
      marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 20,
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#6200ee', 
    minWidth: 120,
    borderRadius: 8,
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
  studentListContainer: {
      flexDirection: 'column',
      gap: 10,
      paddingTop: 10,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    elevation: 1,
    justifyContent: 'space-between',
  },
  studentInfo: {
      flex: 1,
      marginLeft: 12,
      marginRight: 12,
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

export default AttendanceEdit;
