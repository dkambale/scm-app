import React from 'react';
import { View, StyleSheet } from 'react-native';
import TeacherList from './teachers/TeacherList';

export const TeachersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <TeacherList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
