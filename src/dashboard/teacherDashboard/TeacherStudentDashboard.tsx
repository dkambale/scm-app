import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNDashboardCard from '../../components/common/RNDashboardCard';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker'; 
import LinearProgressBar from '../../components/common/LinearProgressBar';
import { User, ClassInfo } from '../../types/dashboard';

const screenWidth = Dimensions.get('window').width;

// --- MOCK DATA/API SIMULATION ---
const MOCK_CLASSES: ClassInfo[] = [
    { id: 'c1', name: 'Grade 10 A' },
    { id: 'c2', name: 'Grade 9 B' },
];

const MOCK_STUDENTS: User[] = [
    { id: 's1', firstName: 'Alice', lastName: 'Johnson', role: 'student', attendancePercentage: 85, presentDays: 170, absentDays: 30 },
    { id: 's2', firstName: 'Bob', lastName: 'Williams', role: 'student', attendancePercentage: 92, presentDays: 184, absentDays: 16 },
    { id: 's3', firstName: 'Charlie', lastName: 'Davis', role: 'student', attendancePercentage: 78, presentDays: 156, absentDays: 44 },
];

const getStudentsByClass = (classId: string) => {
    // Mock logic to filter students, replace with actual implementation
    return MOCK_STUDENTS.filter((_, index) => (index + 1) % MOCK_CLASSES.findIndex(c => c.id === classId) !== 0);
};
// --- END MOCK DATA/API SIMULATION ---

const AttendanceCard: React.FC<{ student: User }> = ({ student }) => {
    const { t } = useTranslation('dashboard');

    const progressColor = 
        (student.attendancePercentage || 0) >= 90 ? '#4CAF50' : 
        (student.attendancePercentage || 0) >= 75 ? '#1976d2' : 
        '#d32f2f'; // success, primary, error colors

    const initialLetter = student.firstName?.charAt(0) || 'S';

    return (
        <View style={styles.attendanceCard}>
            <View style={styles.cardHeader}>
                {/* Custom Avatar Replacement */}
                <View style={[styles.avatar, {backgroundColor: progressColor + '30'}]}> 
                    <Text style={[styles.avatarText, {color: progressColor}]}>{initialLetter}</Text>
                </View>
                <View style={styles.cardDetails}>
                    <Text style={styles.studentName} numberOfLines={1}>
                        {`${student.firstName || ''} ${student.lastName || ''}`.trim()}
                    </Text>
                    <Text style={styles.attendanceRate}>
                        {t('studentDashboard.attendance.attendance', { value: student.attendancePercentage || 0 })}%
                    </Text>
                </View>
            </View>

            <LinearProgressBar 
                value={student.attendancePercentage || 0} 
                color={progressColor} 
                style={styles.progressBar}
            />

            <View style={styles.progressFooter}>
                <Text style={styles.progressCaption}>
                    {t('studentDashboard.attendance.present', { value: student.presentDays || 0 })}
                </Text>
                <Text style={styles.progressCaption}>
                    {t('studentDashboard.attendance.absent', { value: student.absentDays || 0 })}
                </Text>
            </View>
        </View>
    );
};


const TeacherStudentDashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const [selectedClassId, setSelectedClassId] = useState<string>(MOCK_CLASSES[0]?.id || '');
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0); // 0: Attendance, 1: Performance

    useEffect(() => {
        if (selectedClassId) {
            setLoading(true);
            setTimeout(() => {
                setStudents(getStudentsByClass(selectedClassId));
                setLoading(false);
            }, 500);
        } else {
            setLoading(false);
        }
    }, [selectedClassId]);

    const renderTabContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#1976d2" style={{ paddingVertical: 40 }} />;
        }
        if (students.length === 0) {
            return (
                <View style={styles.noDataView}>
                    <Text style={styles.noDataText}>No students found in this class.</Text>
                </View>
            );
        }

        if (tabIndex === 0) {
            // Attendance Tab
            return (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <AttendanceCard student={item} />}
                    numColumns={screenWidth > 600 ? 3 : 2} // Adaptive grid for mobile/tablet
                    columnWrapperStyle={screenWidth > 600 ? styles.columnWrapperTablet : styles.columnWrapperMobile}
                    contentContainerStyle={styles.listContent}
                    scrollEnabled={false}
                />
            );
        } else {
            // Performance Tab (Placeholder)
            return (
                <View style={styles.noDataView}>
                    <Text style={styles.noDataText}>Performance reports not yet implemented in RN.</Text>
                </View>
            );
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Class Selector */}
            <RNDashboardCard title={t('studentDashboard.classSelection')}>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedClassId}
                        onValueChange={(itemValue) => setSelectedClassId(itemValue)}
                        style={styles.picker}
                    >
                        {MOCK_CLASSES.map(c => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>
            </RNDashboardCard>

            {/* Tabs (MUI Tabs replacement) */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, tabIndex === 0 && styles.activeTab]}
                    onPress={() => setTabIndex(0)}
                >
                    <MaterialIcons name="event-available" size={18} color={tabIndex === 0 ? '#fff' : '#333'} />
                    <Text style={[styles.tabText, tabIndex === 0 && styles.activeTabText]}>
                        {t('studentDashboard.tabs.attendance')}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, tabIndex === 1 && styles.activeTab]}
                    onPress={() => setTabIndex(1)}
                >
                    <MaterialIcons name="trending-up" size={18} color={tabIndex === 1 ? '#fff' : '#333'} />
                    <Text style={[styles.tabText, tabIndex === 1 && styles.activeTabText]}>
                        {t('studentDashboard.tabs.performance')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <RNDashboardCard style={styles.contentCard}>
                {renderTabContent()}
            </RNDashboardCard>
            
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 8,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#333',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
        padding: 5,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#1976d2',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 5,
        color: '#333',
    },
    activeTabText: {
        color: '#fff',
    },
    contentCard: {
        marginTop: 0, 
    },
    listContent: {
        paddingTop: 0,
        marginHorizontal: -8, // Compensate for internal padding of FlatList items
    },
    // Attendance Card Styles
    columnWrapperMobile: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    columnWrapperTablet: {
        justifyContent: 'flex-start',
        marginBottom: 8,
    },
    attendanceCard: {
        // Since we are using numColumns=2, width needs to be slightly less than 50%
        width: screenWidth > 600 ? '32%' : '48%', 
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 12,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1, 
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    attendanceRate: {
        fontSize: 12,
        color: '#6c757d',
    },
    progressBar: {
        marginVertical: 5,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressCaption: {
        fontSize: 11,
        color: '#6c757d',
    },
    noDataView: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    noDataText: {
        color: '#d32f2f',
        fontSize: 16,
    }
});

export default TeacherStudentDashboard;