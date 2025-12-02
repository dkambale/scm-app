import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, useTheme, Button, ActivityIndicator } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ReusableForm, FormField } from "../../../components/common/ReusableForm";
import UserDocumentManager from "../../../views/UserDocumentManager";
import api from "../../../api";
import { userDetails } from "../../../utils/apiService";
import * as Yup from "yup";

// --- HELPERS ---
const transformStudentData = (data: any, isUpdate: boolean) => {
  return {
    ...data,
    type: "STUDENT",
    status: "active",
    role: data.role && typeof data.role === 'object' ? data.role.id : data.role || 2,
    dob: data.dob,
    bateOfBirth: data.dob,
    rollNo: data.rollNo ? parseInt(data.rollNo, 10) : null,
    classId: data.classId ? parseInt(data.classId, 10) : null,
    divisionId: data.divisionId ? parseInt(data.divisionId, 10) : null,
    schoolId: data.schoolId ? parseInt(data.schoolId, 10) : null,
  };
};

// --- TAB COMPONENT ---
const CustomTabBar = ({ activeTab, onTabChange, theme }: any) => (
  <View style={styles.tabBar}>
    {[{ key: "details", label: "Details" }, { key: "documents", label: "Documents" }, { key: "profile_image", label: "Image" }].map((tab) => (
      <Text
        key={tab.key}
        onPress={() => onTabChange(tab.key)}
        style={[styles.tabItem, activeTab === tab.key && { color: theme.colors.primary, borderBottomWidth: 2, borderBottomColor: theme.colors.primary }]}
      >
        {tab.label}
      </Text>
    ))}
  </View>
);

export const AddEditStudent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id } = (route.params as { id?: string }) || {};
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("details");
  const [studentData, setStudentData] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Fetch Roles
        const acc = await userDetails.getAccountId();
        if (acc) {
            const roleResp = await api.post(`/api/roles/getAll/${acc}`, { page:0, size:100, sortBy:"id", sortDir:"asc" });
            setRoles(roleResp.data?.content || []);
        }

        // 2. Fetch Student if Edit
        if (id) {
            const userResp = await api.get(`/api/users/getById?id=${id}`);
            const d = userResp.data?.data || userResp.data;
            setStudentData({
                ...d,
                role: d.role?.id || d.role, // Ensure we pass ID for Select
                classId: d.classId || "",
                divisionId: d.divisionId || "",
            });
        } else {
            setStudentData({
                userName: "", firstName: "", lastName: "", mobile: "", email: "", dob: "", rollNo: "",
                role: 2, // Default student role ID
                classId: "", divisionId: ""
            });
        }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
    };
    init();
  }, [id]);

  const studentFormFields: FormField[] = [
    { name: "userName", label: "User Name", type: "text", widthMultiplier: 0.5, required: true },
    { name: "password", label: "Password", type: "password", widthMultiplier: 0.5, disabled: isEditMode },
    { name: "firstName", label: "First Name", type: "text", widthMultiplier: 0.5, required: true },
    { name: "lastName", label: "Last Name", type: "text", widthMultiplier: 0.5, required: true },
    { name: "mobile", label: "Mobile", type: "tel", widthMultiplier: 0.5, required: true },
    { name: "email", label: "Email", type: "email", widthMultiplier: 0.5, required: true },
    { name: "dob", label: "Date of Birth (YYYY-MM-DD)", type: "date", widthMultiplier: 0.5, required: true },
    { name: "rollNo", label: "Roll No", type: "number", widthMultiplier: 0.5, required: true },
    { name: "address", label: "Address", type: "textarea", multiline: true, widthMultiplier: 1.0 },
    // Role will now show up because we're using the grid layout and explicit options
    { name: "role", label: "Role", type: "select", options: roles, widthMultiplier: 1.0, optionsLabelKey: "name", optionsValueKey: "id", required: true },
  ];

  const validationSchema = Yup.object().shape({
    userName: Yup.string().required("Required"),
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    mobile: Yup.string().required("Required"),
    rollNo: Yup.string().required("Required"),
    role: Yup.mixed().required("Required"),
  });

  if (loading || !studentData) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <CustomTabBar activeTab={activeTab} onTabChange={setActiveTab} theme={theme} />
      <View style={styles.content}>
        {activeTab === "details" && (
          <ReusableForm
            initialValues={studentData}
            fields={studentFormFields}
            validationSchema={validationSchema}
            saveUrl="/api/users/save"
            updateUrl="/api/users/update"
            transformForSubmit={transformStudentData}
            onSuccess={(res) => {
                if(!id && res?.data?.id) navigation.replace("AddEditStudent", { id: res.data.id });
                else navigation.goBack();
            }}
            showSCDSelector={true}
            cancelAction={() => navigation.goBack()}
            submitLabel={isEditMode ? "Update" : "Create"}
            isEditMode={isEditMode}
          />
        )}
        {activeTab === "documents" && id && <UserDocumentManager userId={id} userType="STUDENT" />}
        {activeTab === "profile_image" && <View><Text>Profile Image Component Here</Text></View>}
        {activeTab !== "details" && !id && <View style={styles.center}><Text>Please save details first.</Text></View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabBar: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 16, elevation: 2 },
  tabItem: { paddingVertical: 12, paddingHorizontal: 16, fontWeight: "600", color: "#666" },
  content: { flex: 1 },
});