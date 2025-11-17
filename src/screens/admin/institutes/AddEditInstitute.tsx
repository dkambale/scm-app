import React, { useState, useEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Yup from "yup";
import { Alert } from "react-native";
import {
  ReusableForm,
  FormField,
} from "../../../components/common/ReusableForm";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner"; // Adjust path
import api from "../../../api"; // Adjust path

// Define initial values for a new Institute
const NEW_INSTITUTE_INITIAL_VALUES = {
  name: "",
  address: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  mobileNumber: "",
  email: "",
  faxNumber: "",
  code: "",
  telephoneNumber: "", // Added for consistency with other forms
};

// Define fields based on the web component and ReusableForm interface
const INSTITUTE_FIELDS: FormField[] = [
  { name: "name", label: "Institute Name", required: true, widthMultiplier: 1 },
  { name: "code", label: "Institute Code", required: true, widthMultiplier: 1 },
  {
    name: "address",
    label: "Address Line 1",
    required: true,
    widthMultiplier: 1,
  },
  {
    name: "addressLine2",
    label: "Address Line 2",
    required: false,
    widthMultiplier: 1,
  },
  { name: "city", label: "City", required: true, widthMultiplier: 0.5 },
  { name: "state", label: "State", required: true, widthMultiplier: 0.5 },
  {
    name: "zipCode",
    label: "Zip Code",
    type: "number",
    required: true,
    widthMultiplier: 0.5,
  },
  {
    name: "mobileNumber",
    label: "Mobile Number",
    type: "tel",
    required: true,
    widthMultiplier: 0.5,
  },
  {
    name: "telephoneNumber",
    label: "Telephone Number",
    type: "tel",
    required: false,
    widthMultiplier: 0.5,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    widthMultiplier: 0.5,
  },
  {
    name: "faxNumber",
    label: "Fax Number",
    type: "tel",
    required: true,
    widthMultiplier: 0.5,
  },
];

// Define validation schema based on the web component
const InstituteValidationSchema = Yup.object().shape({
  name: Yup.string().max(255).required("Institute Name is required"),
  address: Yup.string().required("Address Line 1 is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  // Assuming 5 or 6 digit number
  zipCode: Yup.string()
    .matches(/^[0-9]{5,6}$/, "Must be a valid 5 or 6 digit zip code")
    .required("Zip Code is required"),
  // Assuming 10 digit number
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile Number is required"),
  email: Yup.string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
  faxNumber: Yup.string().required("Fax Number is required"),
  code: Yup.string().max(255).required("Code is required"),
  telephoneNumber: Yup.string(),
});

const AddEditInstitute = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const [initialData, setInitialData] = useState<any | null>(
    id ? {} : NEW_INSTITUTE_INITIAL_VALUES
  );
  const [loading, setLoading] = useState(!!id);

  // Fetch data for edit mode
  useEffect(() => {
    if (id) {
      const fetchInstituteData = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/api/institutes/getById?id=${id}`);
          const data = response.data || {};
          setInitialData({
            ...NEW_INSTITUTE_INITIAL_VALUES,
            ...data,
            id: data.id,
          });
        } catch (error) {
          console.error("Failed to fetch institute data:", error);
          Alert.alert("Error", "Failed to fetch institute details.");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      fetchInstituteData();
    }
  }, [id, navigation]);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setSubmitting(true);
    const isUpdate = !!id;
    const institutePayload = {
      ...values,
      id: isUpdate ? id : null,
      //   accountId: 'MOCK_ACCOUNT_ID'
    };

    try {
      const url = isUpdate ? `/api/institutes/update` : `/api/institutes/save`;
      const method = isUpdate ? api.put : api.post;

      await method(url, institutePayload);

      Alert.alert(
        "Success",
        isUpdate
          ? "Institute updated successfully!"
          : "Institute created successfully!"
      );
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert("Error", "Failed to save institute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialData) {
    return <LoadingSpinner />;
  }

  return (
    <ReusableForm
      entityName="Institute"
      fields={INSTITUTE_FIELDS}
      initialValues={initialData}
      validationSchema={InstituteValidationSchema}
      // onSubmit={handleSubmit}
      saveUrl="api/institutes/save"
      updateUrl="api/institutes/update"
      onSuccessRoute={{ name: "MainDrawer", params: { screen: "INSTITUTE" } }}
      isEditMode={!!id}
      disableSCD={true}
    />
  );
};

export default AddEditInstitute;
