import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Avatar, List } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={`${user?.firstName[0]}${user?.lastName[0]}`}
            style={styles.avatar}
          />
          <Text variant="headlineSmall" style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text variant="bodyLarge" style={styles.email}>
            {user?.email}
          </Text>
          <Text variant="labelLarge" style={styles.role}>
            {user?.role.toUpperCase()}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Account Information</List.Subheader>
            <List.Item
              title="Email"
              description={user?.email}
              left={(props) => <List.Icon {...props} icon="email" />}
            />
            <List.Item
              title="Role"
              description={user?.role}
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title="Permissions"
              description={`${user?.permissions.length} permissions`}
              left={(props) => <List.Icon {...props} icon="shield-check" />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#d32f2f"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#6200ee',
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 8,
  },
  role: {
    backgroundColor: '#6200ee',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
