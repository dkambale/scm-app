import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text, Button, Avatar, List } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.profileHeader}>
          {/**
           * The app uses multiple possible `user` shapes across files:
           * - legacy: { id, email, firstName, lastName, role }
           * - auth context: { userName, firstName, lastName, type, roleName, permissions }
           * Guard all accesses and normalize display values so we don't call methods on undefined.
           */}
          {(() => {
            const firstInitial =
              user?.firstName?.[0] ?? (user as any)?.userName?.[0] ?? "";
            const lastInitial = user?.lastName?.[0] ?? "";
            const displayFirst =
              user?.firstName ?? (user as any)?.userName ?? "";
            const displayLast = user?.lastName ?? "";
            const displayEmail = user?.email ?? (user as any)?.userName ?? "";
            const rawRole =
              (user as any)?.role ||
              (user as any)?.type ||
              (user as any)?.roleName ||
              "";
            const displayRole = String(rawRole).toUpperCase();

            return (
              <>
                <Avatar.Text
                  size={80}
                  label={`${firstInitial}${lastInitial}`}
                  style={styles.avatar}
                />
                <Text variant="headlineSmall" style={styles.name}>
                  {displayFirst} {displayLast}
                </Text>
                <Text variant="bodyLarge" style={styles.email}>
                  {displayEmail}
                </Text>
                <Text variant="labelLarge" style={styles.role}>
                  {displayRole}
                </Text>
              </>
            );
          })()}
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
              description={
                (user as any)?.role ||
                (user as any)?.type ||
                (user as any)?.roleName ||
                "—"
              }
              left={(props) => <List.Icon {...props} icon="account" />}
            />
            <List.Item
              title="Permissions"
              description={`${user?.permissions?.length ?? 0} permissions`}
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
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: "#6200ee",
    marginBottom: 16,
  },
  name: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    color: "#666",
    marginBottom: 8,
  },
  role: {
    backgroundColor: "#6200ee",
    color: "white",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
