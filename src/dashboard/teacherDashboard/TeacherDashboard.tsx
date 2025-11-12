import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNDashboardCard from '../common/RNDashboardCard'; // Assuming RNDashboardCard is in a common directory
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Mock data structure, replace with actual API call/Redux state
const MOCK_TIMETABLE = [
  { id: '1', time: '9:00 AM', subject: 'Mathematics', class: 'Grade 10 A', room: 'R-201' },
  { id: '2', time: '10:00 AM', subject: 'Science', class: 'Grade 9 B', room: 'Lab 1' },
  { id: '3', time: '11:30 AM', subject: 'English', class: 'Grade 11 C', room: 'R-305' },
  { id: '4', time: '1:30 PM', subject: 'History', class: 'Grade 8 A', room: 'R-102' },
];

const TimetableItem = ({ item }) => (
  <View style={styles.item}>
    <View style={styles.timeBlock}>
        <MaterialIcons name="access-time" size={14} color="#6c757d" style={styles.icon} />
        <Text style={styles.timeText}>{item.time}</Text>
    </View>
    <View style={styles.details}>
      <Text style={styles.subjectText}>{item.subject}</Text>
      <Text style={styles.classText}>{`${item.class} - ${item.room}`}</Text>
    </View>
  </View>
);

const TeacherTimetableCard = () => {
  const { t } = useTranslation('dashboard');
  const todayTimetable = MOCK_TIMETABLE; // Use the mock data or fetch actual data

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-available" size={30} color="#6c757d" />
      <Text style={styles.emptyText}>{t('teacherDashboard.noClassesToday')}</Text>
    </View>
  );

  return (
    <RNDashboardCard title={t('teacherDashboard.timetableTitle')}>
      {todayTimetable.length > 0 ? (
        <FlatList
          data={todayTimetable}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TimetableItem item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={false} // Prevent inner scroll inside a ScrollView
        />
      ) : (
        renderEmptyList()
      )}
    </RNDashboardCard>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  icon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  details: {
    flex: 1,
  },
  subjectText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1976d2', // Primary color
  },
  classText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    color: '#6c757d',
    fontSize: 14,
  },
});

export default TeacherTimetableCard;