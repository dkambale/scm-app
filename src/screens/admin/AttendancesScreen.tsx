import React from 'react';
import { View, StyleSheet } from 'react-native';
import AttendanceList from './attendance/AttendanceList';

export const AttendancesScreen: React.FC<{ navigation: any }> = () => {
  return (
    <View style={styles.container}>
      <AttendanceList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AttendancesScreen;