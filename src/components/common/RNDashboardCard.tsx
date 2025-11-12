import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface RNDashboardCardProps {
  title?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A reusable card component for the dashboard, replacing MUI Card/MainCard.
 */
const RNDashboardCard: React.FC<RNDashboardCardProps> = ({ title, children, headerRight, style }) => {
  return (
    <View style={[styles.card, style]}>
      {(title || headerRight) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flexShrink: 1,
  },
  content: {
    padding: 16,
  },
});

export default RNDashboardCard;