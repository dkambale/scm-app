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

// Transformation to match API payload
const transformStudentData = (data: any, isUpdate: boolean) => {
  const payload: any = {
    // Core user fields
    userName: data.userName,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    mobile: data.mobile,
    address: data.address || "",

    // Student specific fields
    rollNo: data.rollNo ? String(data.rollNo) : data.rollNo,
    dob: data.dob,
    bateOfBirth: data.dob, // Legacy field support

    // SCD fields - Keep as strings for update, convert for create
    schoolId: isUpdate ? (data.schoolId ? String(data.schoolId) : data.schoolId) : (data.schoolId ? parseInt(String(data.schoolId), 10) : null),
    classId: isUpdate ? (data.classId ? String(data.classId) : data.classId) : (data.classId ? parseInt(String(data.classId), 10) : null),
    divisionId: isUpdate ? (data.divisionId ? String(data.divisionId) : data.divisionId) : (data.divisionId ? parseInt(String(data.divisionId), 10) : null),

    // SCD names
    schoolName: data.schoolName || null,
    className: data.className || null,
    divisionName: data.divisionName || null,

    // Account & Role
    accountId: data.accountId,
    role: data.role
      ? { id: data.role.id || data.role, name: data.role.name || data.role }
      : null,

    // Required type and status
    type: "STUDENT",
    status: data.status || "active",

    // Profile image and ID
    profileImageId: data.profileImageId || null,
    id: data.id || null,

    // Additional fields for update
    mobileNumber: data.mobile,
  };

  // Only include password if provided (not empty)
  if (data.password && data.password.trim() !== "") {
    payload.password = data.password;
  }

  // Preserve additional fields when updating
  if (isUpdate) {
    if (data.middleName) payload.middleName = data.middleName;
    if (data.gender) payload.gender = data.gender;
    if (data.documentIds) payload.documentIds = data.documentIds;
    if (data.allocatedClasses) payload.allocatedClasses = data.allocatedClasses;
    if (data.educations) payload.educations = data.educations;
    if (data.createdBy) payload.createdBy = data.createdBy;
    if (data.modifiedBy) payload.modifiedBy = data.modifiedBy;
    if (data.updatedBy) payload.updatedBy = data.updatedBy;
  }

  return payload;
};

export const AddEditStudent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};
  const isEditMode = !!id;

  const [roles, setRoles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0); // 0: Details, 1: Documents, 2: Image
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Fetch Roles
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

  // Fetch Student Data if editing
  useEffect(() => {
    if (isEditMode && id) {
      (async () => {
        setLoadingStudent(true);
        try {
          const response = await api.get(`/api/users/getById?id=${id}`);
          const data = response.data?.data || response.data || {};
          setStudentData(data);
        } catch (err) {
          console.error("Failed to fetch student", err);
          Alert.alert("Error", "Failed to load student details");
        } finally {
          setLoadingStudent(false);
        }
      })();
    }
  }, [isEditMode, id]);

  const studentFormFields: FormField[] = [
    { name: "userName", label: "User Name", type: "text", required: true },
    {
      name: "password",
      label: "Password",
      type: "password",
      disabled: isEditMode,
    },
    { name: "firstName", label: "First Name", type: "text", required: true },
    { name: "lastName", label: "Last Name", type: "text", required: true },
    { name: "mobile", label: "Mobile", type: "tel", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "dob", label: "Date of Birth", type: "date", required: true }, // NEW: 'date' type
    { name: "rollNo", label: "Roll No", type: "number", required: true },
    { name: "address", label: "Address", type: "textarea", multiline: true },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roles, // Passing roles directly to fix selection issue
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
  ];

  const initialValues =
    isEditMode && studentData
      ? {
          userName: studentData.userName || "",
          password: "", // Never populate password on edit
          firstName: studentData.firstName || "",
          lastName: studentData.lastName || "",
          mobile: studentData.mobile || studentData.mobileNumber || "",
          email: studentData.email || "",
          dob: studentData.dob ? studentData.dob.split("T")[0] : "", // Format date
          rollNo: studentData.rollNo || "",
          address: studentData.address || "",
          role: studentData.role || null,
          accountId: studentData.accountId || "",
          schoolId: studentData.schoolId || "",
          classId: studentData.classId || "",
          divisionId: studentData.divisionId || "",
          schoolName:
            studentData.schoolName || studentData.role?.schoolName || "",
          className: studentData.className || "",
          divisionName: studentData.divisionName || "",
          profileImageId: studentData.profileImageId || null,
          id: studentData.id || null,
          // Preserve additional fields for update
          middleName: studentData.middleName || "",
          gender: studentData.gender || "",
          documentIds: studentData.documentIds || [],
          allocatedClasses: studentData.allocatedClasses || [],
          educations: studentData.educations || [],
          createdBy: studentData.createdBy || "",
          modifiedBy: studentData.modifiedBy || "",
          updatedBy: studentData.updatedBy || "",
          status: studentData.status || "active",
        }
      : {
          userName: "",
          password: "",
          firstName: "",
          lastName: "",
          mobile: "",
          email: "",
          dob: "",
          rollNo: "",
          address: "",
          role: null,
          accountId: "",
          schoolId: "",
          classId: "",
          divisionId: "",
          schoolName: "",
          className: "",
          divisionName: "",
          profileImageId: null,
          id: null,
        };

  const validationSchema = Yup.object().shape({
    userName: Yup.string().required("Required"),
    firstName: Yup.string().required("Required"),
    lastName: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    mobile: Yup.string().required("Required"),
    dob: Yup.string().required("Required"),
    role: Yup.mixed().required("Required"),
  });

  const onSubmit = async (values: any, formikHelpers: any) => {
    try {
      // Fetch accountId if not already in values
      const accountId = values.accountId || (await userDetails.getAccountId());
      const payload = transformStudentData(
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
        `Student ${isEditMode ? "updated" : "created"} successfully!`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Students" as never),
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
        formData.append("userType", "STUDENT");
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
        (loadingStudent ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <Text>Loading student data...</Text>
          </View>
        ) : (
          <ReusableForm
            entityName="Student"
            fields={studentFormFields}
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
            <UserDocumentManager userId={id} userType="STUDENT" />
          ) : (
            <Text style={{ textAlign: "center" }}>
              Please save student first.
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
              Please save student first.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
