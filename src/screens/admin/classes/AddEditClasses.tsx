import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import { Alert } from "react-native";
import {
  ReusableForm,
  FormField,
} from "../../../components/common/ReusableForm";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner"; // Adjust path
import api from "../../../api"; 
const NEW_CLASS_INITIAL_VALUES = {
  name: "",
  schoolbranchId: "",

};

// Define fields based on the web component and ReusableForm interface
const CLASS_FIELDS: FormField[] = [
  { name: "name", label: "Class Name", required: true, widthMultiplier: 1 },
  // NOTE: This field requires a custom Select/Picker in React Native.
  // We use type "select" as a marker.
  {
    name: "schoolbranchId",
    label: "school",
    type: "select",
    required: true,
    widthMultiplier: 1,
    // Fetch school list for the current account. ReusableForm will replace {accountId}.
    optionsUrl: "/api/schoolBranches/getAll/{accountId}",
    optionsMethod: "POST",
    optionsLabelKey: "name",
    optionsValueKey: "id",
    placeholder: "Select school",
  },

];

// Define validation schema based on the web component
const ClassValidationSchema = Yup.object().shape({
  name: Yup.string().max(255).required("Class Name is required"),
  schoolbranchId: Yup.string().required("School is required"),
 
});
const AddEditClasses = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const [initialData, setInitialData] = useState<any | null>(id ? {} : NEW_CLASS_INITIAL_VALUES);
  const [loading, setLoading] = useState(!!id);

  // Fetch data for edit mode
  useEffect(() => {
    if (id) {
      const fetchClassData = async () => {
        setLoading(true);
        try {
          const response = await api.get(`api/schoolClasses/getById?id=${id}`);
          const data = response.data || {};
          setInitialData({
            ...NEW_CLASS_INITIAL_VALUES,
            ...data,
            // Ensure ID fields are strings for consistency with TextInput field handling
            schoolbranchId: String(data.schoolbranchId || ''), 
            instituteId: String(data.instituteId || ''),
            id: data.id,
          });
        } catch (error) {
          console.error("Failed to fetch schoolclass data:", error);
          Alert.alert("Error", "Failed to fetch class details.");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      fetchClassData();
    }
  }, [id, navigation]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    const isUpdate = !!id;
    const classPayload = { 
      ...values, 
      id: isUpdate ? id : undefined,
      // accountId: 'MOCK_ACCOUNT_ID',
      // Convert select IDs back to number for API
      schoolbranchId: Number(values.schoolbranchId), 
      instituteId: Number(values.instituteId) 
    };

    try {
      const url = isUpdate ? `/api/schoolClasses/update` : `/api/schoolClasses/save`;
      const method = isUpdate ? api.put : api.post;

      await method(url, classPayload);

      Alert.alert(
        "Success",
        isUpdate ? "Class updated successfully!" : "Class added successfully!"
      );

      navigation.navigate("ClassesList" as never);
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert("Error", "Failed to save class. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialData) {
    return <LoadingSpinner />;
  }
  
  return (
    <ReusableForm
      entityName="Class"
      fields={CLASS_FIELDS}
      initialValues={initialData}
      validationSchema={ClassValidationSchema}
      onSubmit={handleSubmit}
      isEditMode={!!id}
      disableSCD={true}
    />
  );
};

export default AddEditClasses;