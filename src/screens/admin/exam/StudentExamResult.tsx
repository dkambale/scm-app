import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert as RNAlert, ScrollView } from 'react-native';
import { Button, Text, Title, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux'; // Keep for other state, but not for user
import { useTranslation } from 'react-i18next';
// FIX: Corrected MaterialIcons import
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
// FIX: Corrected apiService import syntax
import { apiService } from '../../../api/apiService'; 
import { User } from '../../types/dashboard'; // Assuming User type is available
import { useAuth } from '../../../context/AuthContext'; // --- ADDED ---

// --- CONSTANTS ---
const ACCENT_BLUE = "#00BFFF"; // Sky Blue
const DARK_BLUE = "#1E90FF"; // Dodger Blue

// --- TYPES ---
interface ExamListItem {
  id: string;
  examName: string;
  className: string;
  divisionName: string;
  // Add other relevant fields if needed
}

// --- List Item Component (Replaces DataGrid Row) ---
interface ExamRowProps {
    item: ExamListItem;
    onViewResult: (examId: string) => void;
    t: (key: string) => string;
}

const ExamRow: React.FC<ExamRowProps> = React.memo(({ item, onViewResult, t }) => {
    return (
        <Card style={styles.examCard} elevation={2}>
            <View style={styles.cardContentContainer}>
                <View style={styles.infoContainer}>
                    <Text style={styles.examNameText}>{item.examName}</Text>
                    <Text style={styles.detailText}>
                        {t('columns.class') || 'Class'}: {item.className} / {item.divisionName}
                    </Text>
                </View>
                <Button
                    mode="contained"
                    icon={() => <MaterialIcons name="pageview" size={20} color="#FFFFFF" />}
                    onPress={() => onViewResult(item.id)}
                    style={styles.viewButton}
                    labelStyle={styles.viewButtonLabel}
                    buttonColor={DARK_BLUE}
                >
                    {t('Actions.ViewResult') || 'View Result'}
                </Button>
            </View>
        </Card>
    );
});


// --- MAIN COMPONENT ---
const StudentExamListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation('exam');
  
  // FIX: Replaced useSelector with useAuth() to get the correct user object
  const { user } = useAuth(); // --- MODIFIED ---
  
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const studentDetailsReady = useMemo(() => {
    // FIX: Using optional chaining for safety in user object access
    const isReady = !!(user?.id && user?.accountId && user?.schoolId && user?.classId && user?.divisionId);
    
    // This log will now show the correct values once the AuthContext is ready
    console.log('Student details ready:', isReady, user?.id, user?.accountId, user?.schoolId, user?.classId, user?.divisionId);

    return isReady;
  }, [user]);


  const fetchExams = useCallback(async () => {
    if (!studentDetailsReady) {
      setError(t('errors.incompleteProfile') || 'User profile details are incomplete. Cannot fetch exams.');
      setLoading(false);
      return;
    }
    
    // Deconstruct fields safely (user is guaranteed to be non-null here by studentDetailsReady)
    const { accountId, schoolId, classId, divisionId } = user!;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        size: 50, 
        sortBy: 'id',
        sortDir: 'asc',
        schoolId: schoolId,
        classId: classId,
        divisionId: divisionId
      };
      
      const endpoint = `/api/exams/getAllBy/${accountId}`;
      console.log(`[API CALL] Fetching exams from: ${endpoint}`);

      // @ts-ignore
      const response = await apiService.post(endpoint, payload);
      
      const content = response?.data?.content || response?.data || [];
      
      setExams(content);
      
      if (content.length === 0) {
          setError(t('messages.noExamsFound') || 'No exams found for your current class and division.');
      }

    } catch (err: any) {
      console.error('Failed to load exams:', err);
      const errorMessage = err?.message || 'Unknown error occurred.';
      RNAlert.alert(t('errors.loadExams') || 'Could not load exams.', errorMessage);
      setError(t('errors.loadExams') || 'Could not load exams.');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, [studentDetailsReady, user, t]);

  useEffect(() => {
    if (studentDetailsReady) {
        fetchExams();
    } else if (user) { // If user exists but details are just incomplete
         setError(t('errors.incompleteProfile') || 'User profile details are incomplete. Cannot fetch exams.');
    } else {
        // User object itself might still be loading from context
        setError(t('errors.loadingProfile') || 'Loading user profile...');
    }
  }, [fetchExams, studentDetailsReady, user]);


  const handleViewResult = useCallback((examId: string) => {
    // Navigate to the result view screen, passing the examId in params
    // @ts-ignore
    navigation.navigate('StudentExamResultScreen', { examId: examId });
  }, [navigation]);


  // --- Render Logic ---

  const renderEmptyList = () => (
      <View style={styles.center}>
        <MaterialIcons name="assignment" size={40} color="#ccc" />
        <Text style={styles.emptyText}>{error || (t('messages.noExamsFound') || 'No exams found.')}</Text>
      </View>
  );

  return (
    <View style={styles.fullContainer}>
{/* ... existing code ... */}
        
        {/* Error/Loading Handling */}
        {error && !loading && (
            <Card style={styles.errorCard} elevation={2}>
{/* ... existing code ... */}
                    <Text style={styles.errorText}>{t('common.error') || 'Error'}: {error}</Text>
                </Card.Content>
            </Card>
        )}

        {loading && exams.length === 0 && (
            <View style={styles.center}>
{/* ... existing code ... */}
                <Text style={styles.loadingText}>Fetching exams...</Text>
            </View>
        )}
        
        {/* Exam List (Replaces DataGrid) */}
{/* ... existing code ... */}
    </View>
  );
};

// --- STYLES ---

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#F0F8FF', // Light blue tint background
    padding: 16,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DARK_BLUE,
    marginBottom: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: DARK_BLUE,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorCard: {
      marginBottom: 20,
      backgroundColor: '#FFEBEE', // Light Red
      borderColor: '#F44336', // Error Red
      borderWidth: 1,
      borderRadius: 8,
  },
  // FIX: Added missing errorText style
  errorText: {
      color: '#D32F2F', // Error Red
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600'
  },
  listContent: {
    paddingBottom: 20,
  },
  
  // --- Exam Row Styles ---
  examCard: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  infoContainer: {
    flex: 1,
    marginRight: 10,
  },
  examNameText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: DARK_BLUE,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6c757d',
  },
  viewButton: {
    minWidth: 120,
    borderRadius: 6,
  },
  viewButtonLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default StudentExamListScreen;