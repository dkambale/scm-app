import React from 'react';
import { View, StyleSheet } from 'react-native';
import InstituteList from './institutes/InstituteList';

export const InstitutesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <InstituteList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default InstitutesScreen;
