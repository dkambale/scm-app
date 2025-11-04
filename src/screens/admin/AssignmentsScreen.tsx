import React from 'react';
import { View, StyleSheet } from 'react-native';
import AssignmentList from './assignments/AssignmentList';

export const AssignmentsScreen: React.FC<{ navigation: any }> = () => {
  return (
    <View style={styles.container}>
      <AssignmentList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AssignmentsScreen;