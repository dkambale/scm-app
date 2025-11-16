import React from 'react';
import { View, StyleSheet } from 'react-native';
import SchoolList from './schools/SchoolList';

export const SchoolsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SchoolList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SchoolsScreen;
