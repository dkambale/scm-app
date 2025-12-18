import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("edit");
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
    {
      name: "userName",
      label: t("teacher.fields.userName"),
      type: "text",
      required: true,
    },
    {
      name: "password",
      label: t("teacher.fields.password"),
      type: "password",
      disabled: isEditMode,
    },
    {
      name: "firstName",
      label: t("teacher.fields.firstName"),
      type: "text",
      required: true,
    },
    { name: "middleName", label: t("teacher.fields.middleName"), type: "text" },
    {
      name: "lastName",
      label: t("teacher.fields.lastName"),
      type: "text",
      required: true,
    },
    {
      name: "mobile",
      label: t("teacher.fields.mobile"),
      type: "tel",
      required: true,
    },
    {
      name: "email",
      label: t("teacher.fields.email"),
      type: "email",
      required: true,
    },
    {
      name: "dob",
      label: t("teacher.fields.dob"),
      type: "date",
      required: true,
    },
    {
      name: "subject",
      label: t("teacher.fields.subject", "Subject"),
      type: "text",
    },
    {
      name: "address",
      label: t("teacher.fields.address"),
      type: "textarea",
      multiline: true,
    },
    {
      name: "role",
      label: t("teacher.fields.role"),
      type: "select",
      required: true,
      options: roles,
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
    {
      name: "gender",
      label: t("teacher.fields.gender"),
      type: "select",
      options: [
        { id: "MALE", name: t("teacher.genderOptions.male", "Male") },
        { id: "FEMALE", name: t("teacher.genderOptions.female", "Female") },
      ],
      optionsLabelKey: "name",
      optionsValueKey: "id",
    },
    {
      name: "type",
      label: t("teacher.fields.type"),
      type: "select",
      required: true,
      options: [
        { id: "TEACHER", name: t("teacher.typeOptions.teacher", "Teacher") },
        { id: "ADMIN", name: t("teacher.typeOptions.admin", "Admin") },
        { id: "STAFF", name: t("teacher.typeOptions.staff", "Staff") },
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
    userName: Yup.string().required(
      t("teacher.validation.userNameRequired", "Required")
    ),
    firstName: Yup.string().required(
      t("teacher.validation.firstNameRequired", "Required")
    ),
    lastName: Yup.string().required(
      t("teacher.validation.lastNameRequired", "Required")
    ),
    email: Yup.string()
      .email(t("teacher.validation.emailInvalid", "Invalid email"))
      .required(t("teacher.validation.emailRequired", "Required")),
    mobile: Yup.string().required(
      t("teacher.validation.mobileRequired", "Required")
    ),
    dob: Yup.string().required(t("teacher.validation.dobRequired", "Required")),
    role: Yup.mixed().required(
      t("teacher.validation.roleRequired", "Required")
    ),
    type: Yup.string().required(
      t("teacher.validation.typeRequired", "Required")
    ),
    password: isEditMode
      ? Yup.string().notRequired()
      : Yup.string().required(
          t("teacher.validation.passwordRequired", "Required")
        ),
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
        t("teacher.title." + (isEditMode ? "edit" : "add")),
        isEditMode
          ? t("teacher.messages.updateSuccess")
          : t("teacher.messages.createSuccess"),
        [
          {
            text: t("common.ok", "OK"),
            onPress: () => navigation.navigate("TeacherList" as never),
          },
        ]
      );
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        t("common.error", "Error"),
        err?.response?.data?.message || t("teacher.messages.saveError")
      );
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
          <Text style={{ marginBottom: 10 }}>
            {t("teacher.media.noImageSelected", "No Image Selected")}
          </Text>
        )}
        <Button mode="outlined" onPress={pickImage}>
          {t("teacher.media.selectImage", "Select Image")}
        </Button>
        <Button
          mode="contained"
          onPress={upload}
          disabled={!image}
          style={{ marginTop: 10 }}
        >
          {t("teacher.media.upload", "Upload")}
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
        {[
          t("teacher.tabs.basic"),
          t("teacher.tabs.documents"),
          t("teacher.tabs.profileImage", "Profile Image"),
        ].map((tabLabel, idx) => (
          <TouchableOpacity
            key={idx}
            style={{
              flex: 1,
              padding: 15,
              alignItems: "center",
              borderBottomWidth: activeTab === idx ? 2 : 0,
              borderColor: "#007AFF",
            }}
            onPress={() => setActiveTab(idx)}
          >
            <Text
              style={{
                color: activeTab === idx ? "#007AFF" : "#666",
                fontWeight: "600",
              }}
            >
              {tabLabel}
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
            <Text>{t("teacher.messages.loading")}</Text>
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
            tNamespace="teacher"
          />
        ))}

      {/* Tab 1: Documents */}
      {activeTab === 1 && (
        <View style={{ padding: 20 }}>
          {isEditMode ? (
            <UserDocumentManager userId={id} userType="TEACHER" />
          ) : (
            <Text style={{ textAlign: "center" }}>
              {t("teacher.messages.saveFirst", "Please save teacher first.")}
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
              {t("teacher.messages.saveFirst", "Please save teacher first.")}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
