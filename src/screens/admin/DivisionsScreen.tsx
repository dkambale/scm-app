import React from 'react';
import { View, StyleSheet } from 'react-native';
import DivisionList from './divisions/DivisionList';

export const DivisionsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <DivisionList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DivisionsScreen;
