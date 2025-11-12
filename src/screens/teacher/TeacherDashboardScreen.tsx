import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions, 
  SafeAreaView
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import { useTranslation } from 'react-i18next';
import { User } from '../../types/dashboard';

// Converted Teacher Dashboard Components 
import TeacherTimetableCard from '../../dashboard/teacherDashboard/TeacherTimetableCard';
import TeacherAssignmentChart from '../../dashboard/teacherDashboard/TeacherAssignmentChart';
import TeacherQuickActionsCard from '../../dashboard/teacherDashboard/TeacherQuickActionsCard';
import TeacherStudentDashboard from '../../dashboard/teacherDashboard/TeacherStudentDashboard';
import LatestNotifications from '../../dashboard/teacherDashboard/LatestNotifications';
import TodayBirthdaysCard from '../../dashboard/TodayBirthdaysCard'; 

// NOTE: api/userDetails are assumed to be RN-compatible pure JS/TS utilities now.
// import api, { userDetails } from 'utils/apiService'; 

// Custom Icon Components using MaterialIcons
const DashboardIcon = ({ color }: { color: string }) => <MaterialIcons name="dashboard" size={24} color={color} />;
const PeopleIcon = ({ color }: { color: string }) => <MaterialIcons name="people" size={24} color={color} />;
const TrendingUpIcon = ({ color }: { color: string }) => <MaterialIcons name="trending-up" size={20} color={color} />; 

const TeacherDashboardScreen: React.FC = () => {
  // const { user } = useSelector((state: { user: { user: User } }) => state.user); // Placeholder for Redux user access
  const navigation = useNavigation();
  const { t } = useTranslation('dashboard');
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);
  const isTablet = Dimensions.get('window').width >= 600;

  const handleStudentDashboardToggle = () => {
    setShowStudentDashboard(prev => !prev);
  };

  // --- Student Dashboard View ---
  if (showStudentDashboard) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={[styles.header, {paddingHorizontal: 12}]}>
            <Text style={styles.title}>
              {t('studentDashboard.studentDashboardTitle')}
            </Text>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleStudentDashboardToggle}
              accessibilityRole="button"
            >
              <DashboardIcon color="#1976d2" />
              <Text style={styles.backButtonText}>
                {t('studentDashboard.backToMainDashboard')}
              </Text>
            </TouchableOpacity>
          </View>
          <TeacherStudentDashboard />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Main Teacher Dashboard View ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
        
        {/* Student Dashboard Access Card (Always full width) */}
        <View style={styles.fullWidthItem}>
          <TouchableOpacity
            style={styles.studentAccessCard}
            onPress={handleStudentDashboardToggle}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderArea}>
                <PeopleIcon color="#1976d2" />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.mainCardTitle}>
                    {t('studentDashboard.title')}
                  </Text>
                  <Text style={styles.mainCardSubtitle}>
                    {t('studentDashboard.text2')}
                  </Text>
                </View>
              </View>
              <View style={styles.cardFooterArea}>
                <View style={styles.indicatorBox}>
                  <TrendingUpIcon color="green" />
                  <Text style={styles.indicatorCaption}>
                    {t('studentDashboard.tabs.performance')}
                  </Text>
                </View>
                <View style={styles.indicatorBox}>
                  <PeopleIcon color="blue" />
                  <Text style={styles.indicatorCaption}>
                    {t('studentDashboard.tabs.attendance')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.openDashboardButton} onPress={handleStudentDashboardToggle}>
                  <Text style={styles.openDashboardButtonText}>
                    {t('studentDashboard.tabs.openDashboard')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dynamic Grid Layout */}
        <View style={styles.row}>
            {/* Left Column (Timetable, Assignment Chart, Notifications) */}
            <View style={isTablet ? styles.tabletLeftColumn : styles.mobileFullWidth}>
                <View style={styles.componentWrapper}>
                    <TeacherTimetableCard />
                </View>
                <View style={styles.componentWrapper}>
                    <TeacherAssignmentChart />
                </View>
                <View style={styles.componentWrapper}>
                    <LatestNotifications />
                </View>
            </View>

            {/* Right Column (Quick Actions, Birthdays) */}
            <View style={isTablet ? styles.tabletRightColumn : styles.mobileFullWidth}>
                <View style={styles.componentWrapper}>
                    <TeacherQuickActionsCard />
                </View>
                <View style={styles.componentWrapper}>
                    <TodayBirthdaysCard />
                </View>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 8,
    flexGrow: 1,
  },

  // --- Layout Styles (Responsive Grid) ---
  row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -4, 
  },
  mobileFullWidth: {
      width: '100%',
      paddingHorizontal: 4,
  },
  tabletLeftColumn: {
      width: '60%', 
      paddingHorizontal: 4,
  },
  tabletRightColumn: {
      width: '40%', 
      paddingHorizontal: 4,
  },
  componentWrapper: {
    marginBottom: 8,
  },
  fullWidthItem: {
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  // --- Header Styles ---
  header: {
    paddingTop: 16,
    marginBottom: 16, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flexShrink: 1, 
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1976d2',
    minHeight: 40,
    marginLeft: 10,
  },
  backButtonText: {
    color: '#1976d2',
    fontWeight: '600',
    marginLeft: 5,
  },

  // --- Student Dashboard Access Card Styles ---
  studentAccessCard: {
    backgroundColor: '#e3f2fd', 
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, 
    padding: 16,
  },
  cardContent: {
    // defaults to column
  },
  cardHeaderArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  cardTextContainer: {
    flexShrink: 1,
  },
  mainCardTitle: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#1977d2', 
  },
  mainCardSubtitle: {
    fontSize: 12, 
    color: '#6c757d', 
  },
  cardFooterArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  indicatorBox: {
    alignItems: 'center',
    minWidth: 60, 
  },
  indicatorCaption: {
    fontSize: 10, 
    textAlign: 'center',
    marginTop: 2,
    color: '#333',
  },
  openDashboardButton: {
    backgroundColor: '#1976d2', 
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center'
  },
  openDashboardButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default TeacherDashboardScreen;