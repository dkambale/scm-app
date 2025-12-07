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
// Define initial values for a new School
const NEW_SCHOOL_INITIAL_VALUES = {
  name: "",
  instituteId: "",
  address: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  mobileNumber: "",
  // telephoneNumber: "",
  email: "",
  code: "",
};

// Define fields based on the web component and ReusableForm interface
const SCHOOL_FIELDS: FormField[] = [
  { name: "name", label: "School Name", required: true, widthMultiplier: 1 },
  // NOTE: This field requires a custom Select/Picker in React Native.
  // We use type "select" as a marker.
  {
    name: "instituteId",
    label: "Institute",
    type: "select",
    required: true,
    widthMultiplier: 1,
    // Fetch institute list for the current account. ReusableForm will replace {accountId}.
    optionsUrl: "/api/institutes/getAll/{accountId}",
    optionsMethod: "POST",
    optionsLabelKey: "name",
    optionsValueKey: "id",
    placeholder: "Select institute",
  },
  { name: "code", label: "School Code", required: true, widthMultiplier: 1 },
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
  // {
  //   name: "telephoneNumber",
  //   label: "Telephone Number",
  //   type: "tel",
  //   required: true,
  //   widthMultiplier: 0.5,
  // },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
    widthMultiplier: 0.5,
  },
];

// Define validation schema based on the web component
const SchoolValidationSchema = Yup.object().shape({
  name: Yup.string().max(255).required("School Name is required"),
  instituteId: Yup.number().required("Institute is required"),
  address: Yup.string().required("Address Line 1 is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zipCode: Yup.string()
    .matches(/^[0-9]{5,6}$/, "Must be a valid 5 or 6 digit zip code")
    .required("Zip Code is required"),
  mobileNumber: Yup.string()
    // Using a simple 10 digit check for RN, similar to the provided web validation
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile Number is required"),
  // telephoneNumber: Yup.string()
  //   .matches(
  //     /^[0-9]\d{2,4}-\d{6,8}$/,
  //     "Telephone number format is invalid (e.g. 022-12345678)"
  //   )
  //   .required("Telephone Number is required"),
  email: Yup.string()
    .email("Must be a valid email")
    .max(255)
    .required("Email is required"),
  code: Yup.string().max(50).required("Code is required"),
});

const AddEditSchool = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id?: string }) || {};

  const [initialData, setInitialData] = useState<any | null>(
    id ? {} : NEW_SCHOOL_INITIAL_VALUES
  );
  const [loading, setLoading] = useState(!!id);

  // Transform function to extract ID from select - though now it's just the ID already
  const transformForSubmit = (values: any, isUpdate?: boolean) => {
    return {
      ...values,
      id: isUpdate ? id : undefined,
      // instituteId is now already just the ID value from the select picker
      instituteId: Number(values.instituteId),
    };
  };

  // Fetch data for edit mode
  useEffect(() => {
    if (id) {
      const fetchSchoolData = async () => {
        setLoading(true);
        try {
          const response = await api.get(
            `/api/schoolBranches/getById?id=${id}`
          );
          const data = response.data || {};
          setInitialData({
            ...NEW_SCHOOL_INITIAL_VALUES,
            ...data,
            // Ensure ID fields are numbers for consistency with validation
            instituteId: Number(data.instituteId || ""),
            id: data.id,
          });
        } catch (error) {
          console.error("Failed to fetch school data:", error);
          Alert.alert("Error", "Failed to fetch school details.");
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      fetchSchoolData();
    }
  }, [id, navigation]);

  if (loading || !initialData) {
    return <LoadingSpinner />;
  }

  return (
    <ReusableForm
      entityName="School"
      fields={SCHOOL_FIELDS}
      initialValues={initialData}
      validationSchema={SchoolValidationSchema}
      transformForSubmit={transformForSubmit}
      saveUrl="api/schoolBranches/save"
      updateUrl="api/schoolBranches/update"
      onSuccessRoute={{ name: "MainDrawer", params: { screen: "SCHOOL" } }}
      isEditMode={!!id}
      disableSCD={true}
    />
  );
};

export default AddEditSchool;
