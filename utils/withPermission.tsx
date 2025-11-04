import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Permission } from '../types';

export const withPermission = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission
) => {
  return (props: P) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(requiredPermission)) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>You don't have permission to access this feature.</Text>
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
