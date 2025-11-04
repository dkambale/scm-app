import React from 'react';
import { View, StyleSheet } from 'react-native';
import StudentList from './students/StudentList';

export const StudentsScreen: React.FC<{ navigation: any }> = () => {
  return (
    <View style={styles.container}>
      <StudentList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
