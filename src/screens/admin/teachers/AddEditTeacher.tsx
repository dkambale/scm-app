import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, Image, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ReusableForm,
  FormField,
} from "../../../components/common/ReusableForm";
import * as Yup from "yup";
import api from "../../../api";
import { userDetails } from "../../../utils/apiService";
import UserDocumentManager from "../../../views/UserDocumentManager";
import * as DocumentPicker from "expo-document-picker";
import { Button } from "react-native-paper";

// Normalize date strings to yyyy-mm-dd for inputs
const normalizeDateForInput = (val: any) => {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

// Map form data to API payload
const transformTeacherData = (data: any, isUpdate: boolean) => {
  const payload: any = {
    userName: data.userName,
    firstName: data.firstName,
    middleName: data.middleName || "",
    lastName: data.lastName,
    email: data.email,
    mobile: data.mobile,
    address: data.address || "",
    subject: data.subject || "",

    dob: data.dob || null,
    bateOfBirth: data.dob || null, // legacy field support

    // SCD fields
    schoolId: isUpdate
      ? data.schoolId
        ? String(data.schoolId)
        : data.schoolId
      : data.schoolId
      ? parseInt(String(data.schoolId), 10)
      : null,
    classId: isUpdate
      ? data.classId
        ? String(data.classId)
        : data.classId
      : data.classId
      ? parseInt(String(data.classId), 10)
      : null,
    divisionId: isUpdate
      ? data.divisionId
        ? String(data.divisionId)
        : data.divisionId
      : data.divisionId
      ? parseInt(String(data.divisionId), 10)
      : null,

    // SCD names
    schoolName: data.schoolName || null,
    className: data.className || null,
    divisionName: data.divisionName || null,

    accountId: data.accountId,
    role: data.role
      ? { id: data.role.id || data.role, name: data.role.name || data.role }
      : null,
    gender: data.gender || null,
    type: data.type || "TEACHER",
    status: data.status || "active",

    profileImageId: data.profileImageId || null,
    id: data.id || null,
    mobileNumber: data.mobile,
  };

  // Only include password when provided
  if (data.password && data.password.trim() !== "") {
    payload.password = data.password;
  }

  // Preserve arrays/extra metadata on update
  if (isUpdate) {
    if (data.documentIds) payload.documentIds = data.documentIds;
    if (data.allocatedClasses) payload.allocatedClasses = data.allocatedClasses;
    if (data.educations) payload.educations = data.educations;
    if (data.createdBy) payload.createdBy = data.createdBy;
    if (data.modifiedBy) payload.modifiedBy = data.modifiedBy;
    if (data.updatedBy) payload.updatedBy = data.updatedBy;
  }

  return payload;
};

export const AddEditTeacher: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};
  const isEditMode = !!id;

  const [roles, setRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0); // 0: Details, 1: Documents, 2: Image
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  // Fetch roles
  useEffect(() => {
    (async () => {
      try {
        const acc = await userDetails.getAccountId();
        if (!acc) return;
        const resp = await api.post(`/api/roles/getAll/${acc}`, {
          page: 0,
          size: 1000,
          sortBy: "id",
          sortDir: "asc",
          search: "",
        });
        setRoles(resp.data?.content || []);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    })();
  }, []);

  // Fetch teacher data on edit
  useEffect(() => {
    if (isEditMode && id) {
      (async () => {
        setLoadingTeacher(true);
        try {
          const response = await api.get(`/api/users/getById?id=${id}`);
          const data = response.data?.data || response.data || {};
          setTeacherData(data);
        } catch (err) {
          console.error("Failed to fetch teacher", err);
          Alert.alert("Error", "Failed to load teacher details");
        } finally {
          setLoadingTeacher(false);
        }
      })();
    }
  }, [isEditMode, id]);

  const teacherFormFields: FormField[] = [
    { name: "userName", label: "User Name", type: "text", required: true },
    {
      name: "password",
      label: "Password",
      type: "password",
      disabled: isEditMode,
    },
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "middleName", label: "Middle Name", type: "text" },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "mobile", label: "Mobile", type: "tel", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "dob", label: "Date of Birth", type: "date", required: true },
    { name: "subject", label: "Subject", type: "text" },
    { name: "address", label: "Address", type: "textarea", multiline: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roles,
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { id: "MALE", name: "Male" },
        { id: "FEMALE", name: "Female" },
      ],
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      options: [
        { id: "TEACHER", name: "Teacher" },
        { id: "ADMIN", name: "Admin" },
        { id: "STAFF", name: "Staff" },
      ],
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
  ];

  const initialValues =
    isEditMode && teacherData
      ? {
          userName: teacherData.userName || "",
          password: "",
          firstName: teacherData.firstName || "",
          middleName: teacherData.middleName || "",
          lastName: teacherData.lastName || "",
          mobile: teacherData.mobile || teacherData.mobileNumber || "",
          email: teacherData.email || "",
          dob: normalizeDateForInput(
            teacherData.dob ||
              teacherData.bateOfBirth ||
              teacherData.date_of_birth
          ),
          subject: teacherData.subject || "",
          address: teacherData.address || "",
          role: teacherData.role || null,
          gender: teacherData.gender || "",
          type: teacherData.type || "TEACHER",
          accountId: teacherData.accountId || "",
          schoolId: teacherData.schoolId || "",
          classId: teacherData.classId || "",
          divisionId: teacherData.divisionId || "",
          schoolName:
            teacherData.schoolName || teacherData.role?.schoolName || "",
          className: teacherData.className || "",
          divisionName: teacherData.divisionName || "",
          profileImageId: teacherData.profileImageId || null,
          id: teacherData.id || null,
          allocatedClasses: teacherData.allocatedClasses || [],
          educations: teacherData.educations || [],
          status: teacherData.status || "active",
        }
      : {
          userName: "",
          password: "",
          firstName: "",
          middleName: "",
          lastName: "",
          mobile: "",
          email: "",
          dob: "",
          subject: "",
          address: "",
          role: null,
          gender: "",
          type: "TEACHER",
          accountId: "",
          schoolId: "",
          classId: "",
          divisionId: "",
          schoolName: "",
          className: "",
          divisionName: "",
          profileImageId: null,
          id: null,
          allocatedClasses: [],
          educations: [],
          status: "active",
        };

  const validationSchema = Yup.object().shape({
    userName: Yup.string().required("Required"),
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    mobile: Yup.string().required("Required"),
    dob: Yup.string().required("Required"),
    role: Yup.mixed().required("Required"),
    type: Yup.string().required("Required"),
    password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string().required("Required"),
  });

  const onSubmit = async (values: any) => {
    try {
      const accountId = values.accountId || (await userDetails.getAccountId());
      const payload = transformTeacherData(
        { ...values, accountId },
        isEditMode
      );

      if (isEditMode) {
        await api.put("/api/users/update", { ...payload, id });
      } else {
        await api.post("/api/users/save", payload);
      }

      Alert.alert(
        "Success",
        `Teacher ${isEditMode ? "updated" : "created"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("TeacherList" as never),
          },
        ]
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.response?.data?.message || "Action failed.");
    }
  };

  // --- Profile Image Logic ---
  const ProfileImageContent = () => {
    const [image, setImage] = useState<any>(null);
    const pickImage = async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({
          type: ["image/png", "image/jpeg"],
        });
        if (!res.canceled && res.assets && res.assets.length > 0) {
          setImage(res.assets[0]);
        }
      } catch {
        Alert.alert("Error", "Failed to pick image");
      }
    };
    const upload = async () => {
      if (!image) return;
      try {
        const acc = await userDetails.getAccountId();
        const formData = new FormData();
        formData.append("file", {
          uri: image.uri,
          name: image.name,
          type: image.mimeType || "image/jpeg",
        } as any);
        formData.append("userType", "TEACHER");
        formData.append("documentName", "PROFILE_IMAGE");
        await api.post(`/api/documents/upload/${acc}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Alert.alert("Success", "Uploaded!");
      } catch {
        Alert.alert("Error", "Upload failed");
      }
    };
    return (
      <View style={{ alignItems: "center", marginTop: 20 }}>
        {image ? (
          <Image
            source={{ uri: image.uri }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 10,
            }}
          />
        ) : (
          <Text style={{ marginBottom: 10 }}>No Image Selected</Text>
        )}
        <Button mode="outlined" onPress={pickImage}>
          Select Image
        </Button>
        <Button
          mode="contained"
          onPress={upload}
          disabled={!image}
          style={{ marginTop: 10 }}
        >
          Upload
        </Button>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Tab Headers */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderColor: "#eee",
          paddingTop: 10,
        }}
      >
        {["Details", "Documents", "Profile Image"].map((t, i) => (
          <TouchableOpacity
            key={i}
            style={{
              flex: 1,
              padding: 15,
              alignItems: "center",
              borderBottomWidth: activeTab === i ? 2 : 0,
              borderColor: "#007AFF",
            }}
            onPress={() => setActiveTab(i)}
          >
            <Text
              style={{
                color: activeTab === i ? "#007AFF" : "#666",
                fontWeight: "600",
              }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab 0: ReusableForm (Handles Details) */}
      {activeTab === 0 &&
        (loadingTeacher ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Text>Loading teacher data...</Text>
          </View>
        ) : (
          <ReusableForm
            entityName="Teacher"
            fields={teacherFormFields}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            isEditMode={isEditMode}
            showSCDSelector={true}
          />
        ))}

      {/* Tab 1: Documents */}
      {activeTab === 1 && (
        <View style={{ padding: 20 }}>
          {isEditMode ? (
            <UserDocumentManager userId={id} userType="TEACHER" />
          ) : (
            <Text style={{ textAlign: "center" }}>
              Please save teacher first.
            </Text>
          )}
        </View>
      )}

      {/* Tab 2: Profile Image */}
      {activeTab === 2 && (
        <View style={{ padding: 20 }}>
          {isEditMode ? (
            <ProfileImageContent />
          ) : (
            <Text style={{ textAlign: "center" }}>
              Please save teacher first.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
