import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Card, Checkbox, useTheme } from "react-native-paper";
import MainLayout from "../../../layout/MainLayout";
import ReusableLoader from "../../../ui-component/loader/ReusableLoader";
import Button from "../../../ui-component/Button";
import BackButton from "../../../layout/Button/BackButton";
import api from "../../../api";
import { userDetails } from "../../../utils/apiService";
import { useNavigation, useRoute } from "@react-navigation/native";

const defaultActions = ["add", "edit", "view", "delete"];

const AddEditRole: React.FC = () => {
  const nav = useNavigation();
  const route: any = useRoute();
  const id = route.params?.id;

  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<any>({
    id: null,
    name: "",
    permissions: [],
    schoolId: null,
    schoolName: "",
  });
  const [entities, setEntities] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolPickerVisible, setSchoolPickerVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accountId = await userDetails.getAccountId();
        const [entitiesRes, schoolsRes] = await Promise.all([
          api.get(`api/features/getAllByAccountId/${accountId}`),
          api.get(`api/schoolBranches/getAllBy/${accountId}`),
        ]);
        setEntities(entitiesRes.data || []);
        setSchools(schoolsRes.data || []);
        if (id) {
          const roleRes = await api.get(`api/roles/getById?id=${id}`);
          setRole(roleRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        Alert.alert("Error", "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggle = (entityName: string, action: string) => {
    setRole((prev: any) => {
      const permissions = [...(prev.permissions || [])];
      let idx = permissions.findIndex((p: any) => p.entityName === entityName);
      if (idx === -1) {
        permissions.push({
          id: null,
          name: entityName,
          entityName,
          actions: { add: false, edit: false, view: false, delete: false },
          accountId: null,
        });
        idx = permissions.length - 1;
      }
      permissions[idx] = {
        ...permissions[idx],
        actions: {
          ...permissions[idx].actions,
          [action]: !permissions[idx].actions?.[action],
        },
      };
      return { ...prev, permissions };
    });
  };

  const isChecked = (entityName: string, action: string) => {
    const perm = (role.permissions || []).find(
      (p: any) => p.entityName === entityName
    );
    return !!perm?.actions?.[action];
  };

  const saveRole = async () => {
    try {
      setLoading(true);
      const accountId = await userDetails.getAccountId();
      const payload = { ...role, accountId };
      if (id) {
        await api.put("api/roles/update", payload);
        Alert.alert("Success", "Role updated successfully");
      } else {
        await api.post("api/roles/save", payload);
        Alert.alert("Success", "Role created successfully");
      }
      nav.goBack();
    } catch (err) {
      console.error("Save failed", err);
      Alert.alert("Error", "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ReusableLoader />;

  return (
    <MainLayout
      title={role.id ? "Edit Role" : "Create Role"}
      onBack={() => (nav as any).goBack()}
    >
      <View style={styles.row}>
        <TextInput
          label="Role Name"
          value={role.name}
          onChangeText={(text) => setRole({ ...role, name: text })}
          style={styles.input}
        />
      </View>

      <View style={styles.row}>
        <Text style={{ marginBottom: 8 }}>School</Text>
        <TouchableOpacity
          onPress={() => setSchoolPickerVisible(true)}
          style={styles.pickerButton}
        >
          <Text>{role.schoolName || "Select school"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          Configure Permissions
        </Text>
        <FlatList
          data={entities}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <Card style={styles.entityCard}>
              <Card.Title title={item.name} />
              <Card.Content>
                <View style={styles.actionsRow}>
                  {defaultActions.map((action) => (
                    <View key={action} style={styles.actionItem}>
                      <Checkbox.Android
                        status={
                          isChecked(item.name, action) ? "checked" : "unchecked"
                        }
                        onPress={() => handleToggle(item.name, action)}
                      />
                      <Text style={{ textTransform: "capitalize" }}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
        />
      </View>

      <View style={styles.footer}>
        <BackButton />
        <Button mode="contained" onPress={saveRole} style={{ flex: 1 }}>
          {role.id ? "Update" : "Create"}
        </Button>
      </View>

      <Modal visible={schoolPickerVisible} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSchoolPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={schools}
              keyExtractor={(s) => String(s.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.schoolItem}
                  onPress={() => {
                    setRole({
                      ...role,
                      schoolId: item.id,
                      schoolName: item.name,
                    });
                    setSchoolPickerVisible(false);
                  }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  row: { marginBottom: 12 },
  input: { backgroundColor: "transparent" },
  pickerButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  entityCard: { marginBottom: 10 },
  actionsRow: { flexDirection: "row", flexWrap: "wrap" },
  actionItem: { flexDirection: "row", alignItems: "center", marginRight: 12 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    maxHeight: "50%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
  },
  schoolItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default AddEditRole;
