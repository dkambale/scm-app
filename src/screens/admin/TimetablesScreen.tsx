import React from 'react';
import { View, StyleSheet } from 'react-native';
import TimetableList from './timetables/TimetableList';

export const TimetablesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <TimetableList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
