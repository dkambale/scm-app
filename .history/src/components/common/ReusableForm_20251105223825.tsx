import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from "react-native";
import {
  Button,
  TextInput,
  Card,
  HelperText,
  useTheme,
  Text,
  // Select components are not native to react-native-paper,
  // but we'll include a placeholder structure.
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../api";
import { LoadingSpinner } from "./LoadingSpinner";
import SCDSelectorNative from "./SCDSelector.native"; // Assuming this handles the select/picker logic
import { Formik } from "formik";
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

// Define the structure for a form field
// Support two shapes of FormField used across the app. Many callers pass `labelKey`, `widthMultiplier`, etc.
export interface FormField {
  name: string;
  // optional human friendly label OR i18n key used by callers
  label?: string;
  labelKey?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "tel"
    | "date"
    | "textarea";
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  widthMultiplier?: number;
  inputProps?: any;
  // For select fields
  options?: any[];
  optionsUrl?: string; // URL to fetch options from
}

interface ReusableFormProps {
  // Legacy/alternative API support: either operate as a self-contained form (entityName + save/update urls)
  // or accept an external Formik-style API (initialValues + validationSchema + onSubmit).
  entityName?: string;
  fields: FormField[];
  fetchUrl?: string; // URL to get entity data for editing, e.g., /api/users/getById
  saveUrl?: string; // URL to create a new entity, e.g., /api/users/save
  updateUrl?: string; // URL to update an existing entity, e.g., /api/users/update
  transformForSubmit?: (data: any, isUpdate?: boolean) => any; // Function to transform data before submitting
  onSuccess?: (response: any) => void; // Callback on successful submission
  onSuccessUrl?: string; // URL to navigate to on success
  cancelButton?: React.ReactNode;
  showCancelButton?: boolean;
  showSCDSelector?: boolean;

  // Formik-style API used by newer callers
  initialValues?: any;
  validationSchema?: any;
  onSubmit?: (values: any, formikHelpers: any) => Promise<void> | void;
  isEditMode?: boolean;
  cancelAction?: () => void;
  tNamespace?: string; // optional namespace like 'student' to derive title
}

export const ReusableForm: React.FC<ReusableFormProps> = ({
  entityName,
  fields,
  fetchUrl,
  saveUrl,
  updateUrl,
  transformForSubmit,
  onSuccess,
  onSuccessUrl,
  cancelButton,
  showCancelButton = true,
  showSCDSelector = true,
  initialValues,
  validationSchema,
  onSubmit: externalOnSubmit,
  isEditMode,
  cancelAction,
  tNamespace,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme(); // Initialize theme
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  // Track which field's date picker is visible
  const [datePickers, setDatePickers] = useState<Record<string, boolean>>({});

  // Fetch initial data for editing
  useEffect(() => {
    // If using the legacy fetchUrl approach (entityName + save/update urls), keep loading existing data
    if (id && fetchUrl) {
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await api.get(`${fetchUrl}/${id}`);
          setFormData(response.data?.data || response.data || {});
        } catch (err) {
          console.error(err);
          Alert.alert("Error", `Failed to fetch ${entityName} details.`);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, fetchUrl, entityName]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    fields.forEach((field) => {
      // Skip password validation for update if field is not touched/empty
      if (id && field.name === "password" && !formData[field.name]) {
        return;
      }

      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    let data = formData;

    if (transformForSubmit) {
      data = transformForSubmit(data, !!id);
    }

    try {
      let response;
      if (id) {
        // Assume API takes ID in the payload for PUT, adjusting the URL call
        response = await api.put(updateUrl, { id, ...data });
      } else {
        response = await api.post(saveUrl, data);
      }

      Alert.alert(
        "Success",
        `${entityName} ${id ? "updated" : "saved"} successfully!`
      );

      if (onSuccess) {
        onSuccess(response.data);
      }

      if (onSuccessUrl) {
        navigation.navigate(onSuccessUrl as never);
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${id ? "update" : "save"} ${entityName}.`
      );
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = (fieldName: string) => {
    setDatePickers((p) => ({ ...p, [fieldName]: true }));
  };

  const handleDateChange = (fieldName: string, event: any, selectedDate: Date | undefined, formikHelpers?: any) => {
    // On Android the picker closes automatically; on iOS it may stay open depending on display
    setDatePickers((p) => ({ ...p, [fieldName]: Platform.OS === 'ios' ? !!selectedDate : false }));
    if (selectedDate) {
      const formatted = dayjs(selectedDate).format('YYYY-MM-DD');
      if (formikHelpers) {
        formikHelpers.setFieldValue(fieldName, formatted);
      } else {
        handleInputChange(fieldName, formatted);
      }
    }
  };

  if (loading && !Object.keys(formData).length) {
    return <LoadingSpinner />;
  }
  // Derive a title from either entityName or tNamespace or fallback to a capitalized generic
  const nounLabel =
    entityName ||
    (tNamespace
      ? tNamespace.charAt(0).toUpperCase() + tNamespace.slice(1)
      : undefined) ||
    "Item";
  const formTitle =
    id || isEditMode ? `Edit ${nounLabel}` : `Add New ${nounLabel}`;

  // Helper function to render different input types
  const renderField = (field: FormField, formikHelpers?: any) => {
    // FORCED DARK THEME COLORS for TextInput visibility
    // This object overrides RNP's theme logic specifically for the input fields
    const darkInputTheme = {
      colors: {
        // Text and Placeholder MUST be light for visibility
        onSurface: "white", // RNP uses onSurface for actual input text color
        placeholder: theme.colors.surfaceVariant || "lightgray", // Light color for placeholder
        text: "white", // For older versions of RNP/Platform compatibility

        // Define primary/outline colors
        primary: theme.colors.primary, // Active border color
        background: theme.colors.surface || "#222222", // Input background color
      },
      // Explicitly set placeholder text color
      placeholderTextColor: theme.colors.surfaceVariant || "lightgray",
    };

    const labelText = field.label || field.labelKey || field.name;

    if (field.type === 'date') {
      const value = formikHelpers ? formikHelpers.values[field.name] : formData[field.name];
      return (
        <TouchableOpacity key={field.name} onPress={() => openDatePicker(field.name)} disabled={field.disabled}>
          <TextInput
            label={labelText}
            placeholder={labelText}
            value={value || ''}
            mode="outlined"
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => openDatePicker(field.name)} />}
            style={[styles.input]}
            theme={darkInputTheme as any}
          />
          {datePickers[field.name] && (
            <DateTimePicker
              value={value ? dayjs(value).toDate() : dayjs().toDate()}
              mode="date"
              display="default"
              onChange={(e, d) => handleDateChange(field.name, e, d, formikHelpers)}
              minimumDate={dayjs().toDate()}
            />
          )}
        </TouchableOpacity>
      );
    }

    if (field.type === "select") {
      // If used inside Formik, prefer formik values; otherwise use local state formData
      const value = formikHelpers
        ? formikHelpers.values[field.name]
        : formData[field.name];
      return (
        <TextInput
          key={field.name}
          label={labelText}
          placeholder={labelText}
          value={value ? String(value) : ""}
          mode="outlined"
          disabled={true}
          style={[styles.input]}
          // Apply forced dark theme overrides
          theme={darkInputTheme as any}
        />
      );
    }

    const isPassword = field.type === "password";
    const isNumber = field.type === "number";
    const isEmail = field.type === "email";

    // If we are rendering inside a Formik context, use formik helpers to bind values
    if (formikHelpers) {
      return (
        <TextInput
          key={field.name}
          label={labelText}
          placeholder={labelText}
          value={formikHelpers.values[field.name] || ""}
          onChangeText={(text) => formikHelpers.setFieldValue(field.name, text)}
          onBlur={() => formikHelpers.setFieldTouched(field.name, true)}
          mode="outlined"
          secureTextEntry={isPassword}
          keyboardType={
            isNumber ? "numeric" : isEmail ? "email-address" : "default"
          }
          error={
            !!(
              formikHelpers.touched[field.name] &&
              formikHelpers.errors[field.name]
            )
          }
          style={[styles.input]}
          autoCapitalize={isEmail ? "none" : "sentences"}
          theme={darkInputTheme as any}
          multiline={field.multiline}
          {...(field.inputProps || {})}
        />
      );
    }

    return (
      <TextInput
        key={field.name}
        label={labelText}
        placeholder={labelText}
        value={formData[field.name] || ""}
        onChangeText={(text) => handleInputChange(field.name, text)}
        mode="outlined"
        secureTextEntry={isPassword}
        keyboardType={
          isNumber ? "numeric" : isEmail ? "email-address" : "default"
        }
        error={!!errors[field.name]}
        style={[styles.input]}
        autoCapitalize={isEmail ? "none" : "sentences"}
        theme={darkInputTheme as any}
        multiline={field.multiline}
        {...(field.inputProps || {})}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background || "#000000" },
      ]}
    >
      {/* Header Section: Dark Background, Light Text */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              theme.colors.outlineVariant || "rgba(255, 255, 255, 0.2)",
            backgroundColor: theme.colors.elevation.level2 || "#1a1a1a",
          },
        ]}
      >
        <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
          {formTitle}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant || "lightgray" }}
        >
          {id
            ? "Review and update details"
            : "Fill in the required information"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Section: Dark Surface, Light Text */}
        <Card
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface || "#222222" },
          ]}
          elevation={2}
        >
          <Card.Content>
            {/* If the caller supplied initialValues, use Formik (newer callers like AddEditStudent) */}
            {initialValues ? (
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={externalOnSubmit as any}
                enableReinitialize
              >
                {(formikProps) => (
                  <>
                    {fields.map((field) => (
                      <View key={field.name} style={styles.inputContainer}>
                        {renderField(field, formikProps)}
                        {formikProps.touched[field.name] &&
                          formikProps.errors[field.name] && (
                            <HelperText
                              type="error"
                              visible
                              style={[
                                styles.errorText,
                                { color: theme.colors.error || "red" },
                              ]}
                            >
                              {String(formikProps.errors[field.name])}
                            </HelperText>
                          )}
                      </View>
                    ))}

                    {showSCDSelector && (
                      <View
                        style={[
                          styles.scdContainer,
                          {
                            borderTopColor:
                              theme.colors.outlineVariant ||
                              "rgba(255, 255, 255, 0.2)",
                          },
                        ]}
                      >
                        <Text
                          variant="labelLarge"
                          style={[
                            styles.scdLabel,
                            {
                              color:
                                theme.colors.onSurfaceVariant || "lightgray",
                            },
                          ]}
                        >
                          Assign to School/Class/Division:
                        </Text>
                        <SCDSelectorNative
                          formik={{
                            values: formikProps.values,
                            setFieldValue: (field: string, value: any) =>
                              formikProps.setFieldValue(field, value),
                            touched: formikProps.touched,
                            errors: formikProps.errors || {},
                          }}
                        />
                      </View>
                    )}

                    {/* Footer buttons inside Formik path */}
                    <View style={{ height: 8 }} />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      {showCancelButton && (
                        <Button
                          mode="outlined"
                          onPress={() =>
                            cancelAction ? cancelAction() : navigation.goBack()
                          }
                          style={[
                            styles.cancelButton,
                            {
                              borderColor:
                                theme.colors.outlineVariant || "lightgray",
                            },
                          ]}
                          disabled={false}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button
                        mode="contained"
                        onPress={() => formikProps.handleSubmit()}
                        style={styles.saveButton}
                        loading={formikProps.isSubmitting}
                        disabled={formikProps.isSubmitting}
                        buttonColor={theme.colors.primary}
                        textColor={theme.colors.onPrimary || "white"}
                      >
                        {isEditMode ? "Update" : "Save"}
                      </Button>
                    </View>
                  </>
                )}
              </Formik>
            ) : (
              // Legacy/local form handling (keeps previous behavior)
              fields.map((field) => (
                <View key={field.name} style={styles.inputContainer}>
                  {renderField(field)}
                  {errors[field.name] && (
                    <HelperText
                      type="error"
                      visible={!!errors[field.name]}
                      style={[
                        styles.errorText,
                        { color: theme.colors.error || "red" },
                      ]}
                    >
                      {errors[field.name]}
                    </HelperText>
                  )}
                </View>
              ))
            )}

          </Card.Content>
        </Card>
      </ScrollView>

      {/* Sticky Footer for Actions: Dark Background, Light Text */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.elevation.level2 || "#1a1a1a",
            borderTopColor:
              theme.colors.outlineVariant || "rgba(255, 255, 255, 0.2)",
          },
        ]}
      >
        {showCancelButton && (
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[
              styles.cancelButton,
              { borderColor: theme.colors.outlineVariant || "lightgray" },
            ]}
            labelStyle={[styles.cancelButtonLabel]}
            compact
            disabled={loading}
            textColor={theme.colors.secondary || "cyan"}
            buttonColor={"transparent"}
          >
            Cancel
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          labelStyle={styles.saveButtonLabel}
          loading={loading}
          disabled={loading}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary || "white"}
        >
          {id ? "Update" : "Save"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Ensure space for the sticky footer
  },
  card: {
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 0,
    marginTop: 16,
  },
  input: {
    // We remove the default background override here and let RNP handle it based on the theme prop in renderField
  },
  errorText: {
    fontSize: 12,
    paddingLeft: 0,
    marginTop: -4,
  },
  scdContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scdLabel: {
    marginBottom: 10,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    marginLeft: 12,
    minHeight: 50,
  },
  saveButtonContent: {
    height: 50,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    flex: 0.5,
    borderRadius: 8,
    minHeight: 50,
    borderWidth: 1,
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
