import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Modal, Alert } from "react-native";
import {
  Card,
  Text,
  Button,
  Avatar,
  List,
  TextInput,
  Portal,
  Provider,
  Divider,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../api/apiService";
import { storage } from "../../utils/storage";

export const ProfileScreen: React.FC = () => {
  const { user, logout, changePassword } = useAuth();
  console.log("User Data:", user);

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState<string>("");

  // Password Fields
  const [passwords, setPasswords] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  // Visibility Toggles
  const [showPass, setShowPass] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const raw = await storage.getItem("SCM-AUTH");
        if (raw) {
          const data = JSON.parse(raw);
          // Assuming structure: { data: { accountId: "..." } }
          if (data?.data?.accountId) {
            setAccountId(data.data.accountId);
          }
        }
      } catch (e) {
        console.error("Error fetching account ID", e);
      }
    };
    fetchAccountData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleChangePassword = async () => {
    if (!accountId) {
      Alert.alert("Error", "Account ID not found. Please relogin.");
      return;
    }
    if (!passwords.old) {
      Alert.alert("Required", "Please enter your current password.");
      return;
    }
    if (!passwords.new) {
      Alert.alert("Required", "Please enter a new password.");
      return;
    }
    if (!passwords.confirm) {
      Alert.alert("Required", "Please confirm your new password.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    if (passwords.new.length < 6) {
      Alert.alert("Invalid", "New password must be at least 6 characters.");
      return;
    }
    if (passwords.old === passwords.new) {
      Alert.alert(
        "Invalid",
        "New password must be different from old password."
      );
      return;
    }

    setLoading(true);
    try {
      // Call the API with the specific structure required
      const response = await apiService.changePassword(accountId, {
        userId: user?.id || 0,
        oldPassword: passwords.old,
        newPassword: passwords.new,
      });
      console.log("Password change response:", response);

      // update local context + storage copy of password
      try {
        if (typeof changePassword === "function") {
          await changePassword(passwords.new);
        }
      } catch (e) {
        console.warn("Failed to update local password cache", e);
      }

      Alert.alert("Success", "Password changed successfully!");
      setModalVisible(false);
      setPasswords({ old: "", new: "", confirm: "" });
      setShowPass({ old: false, new: false, confirm: false });
    } catch (error: any) {
      console.error("Password change error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to change password. Please check your current password and try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Profile Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={`${user?.firstName?.[0] || "U"}${
                user?.lastName?.[0] || "N"
              }`}
              style={styles.avatar}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text variant="bodyLarge" style={styles.email}>
              {user?.email}
            </Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Login Credentials Card */}
        <Card style={styles.card}>
          <Card.Title
            title="Login Credentials"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
          />
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.value}>{user?.userName}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Account ID:</Text>
              <Text style={styles.value}>{accountId || "Loading..."}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>User Type:</Text>
              <Text style={styles.value}>{user?.role?.toUpperCase()}</Text>
            </View>
            <Divider style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Password:</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.value}>••••••••</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => setModalVisible(true)}
                  labelStyle={{ fontWeight: "bold" }}
                >
                  Change
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Permissions / Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <List.Section>
              <List.Subheader>Account Information</List.Subheader>
              <List.Item
                title="Permissions"
                description={`${user?.permissions?.length || 0} permissions`}
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
          icon="logout"
        >
          Logout
        </Button>

        {/* Change Password Modal */}
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <Card style={styles.modalCard}>
                <Card.Title title="Change Password" />
                <Card.Content>
                  <TextInput
                    label="Current Password"
                    value={passwords.old}
                    secureTextEntry={!showPass.old}
                    onChangeText={(text) =>
                      setPasswords({ ...passwords, old: text })
                    }
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon={showPass.old ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowPass({ ...showPass, old: !showPass.old })
                        }
                      />
                    }
                  />

                  <TextInput
                    label="New Password"
                    value={passwords.new}
                    secureTextEntry={!showPass.new}
                    onChangeText={(text) =>
                      setPasswords({ ...passwords, new: text })
                    }
                    style={styles.input}
                    right={
                      <TextInput.Icon
                        icon={showPass.new ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowPass({ ...showPass, new: !showPass.new })
                        }
                      />
                    }
                  />

                  <TextInput
                    label="Confirm New Password"
                    value={passwords.confirm}
                    secureTextEntry={!showPass.confirm}
                    onChangeText={(text) =>
                      setPasswords({ ...passwords, confirm: text })
                    }
                    style={styles.input}
                    error={
                      passwords.new !== passwords.confirm &&
                      passwords.confirm.length > 0
                    }
                    right={
                      <TextInput.Icon
                        icon={showPass.confirm ? "eye-off" : "eye"}
                        onPress={() =>
                          setShowPass({
                            ...showPass,
                            confirm: !showPass.confirm,
                          })
                        }
                      />
                    }
                  />

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.modalButton}
                    >
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleChangePassword}
                      loading={loading}
                      disabled={loading}
                      style={styles.modalButton}
                    >
                      Update
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </Modal>
        </Portal>
      </ScrollView>
    </Provider>
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
    backgroundColor: "white",
    borderRadius: 12,
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
  roleContainer: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  // Credential Row Styles
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#eee",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});
