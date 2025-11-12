import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { RNStyle } from '../../types/dashboard';

interface LinearProgressBarProps {
  value: number; // 0 to 100
  color: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Custom linear progress bar for React Native to replace MUI component.
 */
const LinearProgressBar: React.FC<LinearProgressBarProps> = ({ value, color, style }) => {
  const widthPercentage = `${Math.min(100, Math.max(0, value))}%`;
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progress, { width: widthPercentage, backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#e0e0e0', // Light gray background
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});

export default LinearProgressBar;