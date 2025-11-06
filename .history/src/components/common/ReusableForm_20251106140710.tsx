import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";

// Define the structure for a form field
// Support two shapes of FormField used across the app. Many callers pass `labelKey`, `widthMultiplier`, etc.
export interface FormField {
  name: string;
  // optional human friendly label OR i18n key used by callers
  label?: string;
  labelKey?: string;
  // small helper text to show under the input (e.g. "Available balance:")
  helper?: string;
  // a value portion of the helper that should be highlighted (e.g. "10,000$")
  helperValue?: string;
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
  submitLabel,
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

  const handleDateChange = (
    fieldName: string,
    event: any,
    selectedDate: Date | undefined,
    formikHelpers?: any
  ) => {
    // On Android the picker closes automatically; on iOS it may stay open depending on display
    setDatePickers((p) => ({
      ...p,
      [fieldName]: Platform.OS === "ios" ? !!selectedDate : false,
    }));
    if (selectedDate) {
      const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
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
  const formTitle = id || isEditMode ? `Edit ${nounLabel}` : `Add New ${nounLabel}`;

  // Helper function to render different input types
  const renderField = (field: FormField, formikHelpers?: any) => {
    // Use a light input theme so inputs match the white card look in the design
    const lightInputTheme = {
      colors: {
        onSurface: '#111111',
        text: '#111111',
        placeholder: '#9aa0b1',
        primary: theme.colors.primary,
        background: '#ffffff',
      },
    };

    const labelText = field.label || field.labelKey || field.name;

    if (field.type === "date") {
      const value = formikHelpers
        ? formikHelpers.values[field.name]
        : formData[field.name];
      return (
        <TouchableOpacity
          key={field.name}
          onPress={() => openDatePicker(field.name)}
          disabled={field.disabled}
        >
          <TextInput
            label={labelText}
            // placeholder={labelText}
            value={value || ""}
            mode="outlined"
            editable={false}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => openDatePicker(field.name)}
              />
            }
            style={[styles.input]}
            theme={lightInputTheme as any}
          />
          {datePickers[field.name] && (
            <DateTimePicker
              value={value ? dayjs(value).toDate() : dayjs().toDate()}
              mode="date"
              display="default"
              onChange={(e, d) =>
                handleDateChange(field.name, e, d, formikHelpers)
              }
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
          // placeholder={labelText}
          value={value ? String(value) : ""}
          mode="outlined"
          disabled={true}
          style={[styles.input]}
          // Apply light theme overrides
          theme={lightInputTheme as any}
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
          // placeholder={labelText}
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
          theme={lightInputTheme as any}
          multiline={field.multiline}
          {...(field.inputProps || {})}
        />
      );
    }

    return (
      <TextInput
        key={field.name}
        label={labelText}
        // placeholder={labelText}
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
        theme={lightInputTheme as any}
        multiline={field.multiline}
        {...(field.inputProps || {})}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      {/* Minimal Header (kept but light) */}
      <View style={[styles.header, { borderBottomColor: '#f0f0f0', backgroundColor: '#ffffff' }]}>
        <Text variant="headlineSmall" style={{ color: '#111111' }}>{formTitle}</Text>
        <Text variant="bodySmall" style={{ color: '#6b6b6b' }}>{id ? 'Review and update details' : 'Fill in the required information'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Card Section: White surface */}
        <Card style={[styles.card, { backgroundColor: '#ffffff' }]} elevation={0}>
          <Card.Content>
            {initialValues ? (
              <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={externalOnSubmit as any} enableReinitialize>
                {(formikProps) => (
                  <>
                    {fields.map((field) => (
                      <View key={field.name} style={styles.inputContainer}>
                        {renderField(field, formikProps)}
                        {field.helper && (
                          <View style={{ marginTop: 6 }}>
                            <Text variant="bodySmall" style={{ color: '#6b6b6b' }}>
                              {field.helper}{' '}
                              {field.helperValue ? (
                                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{field.helperValue}</Text>
                              ) : null}
                            </Text>
                          </View>
                        )}

                        {formikProps.touched[field.name] && formikProps.errors[field.name] && (
                          <HelperText type="error" visible style={[styles.errorText, { color: theme.colors.error || 'red' }]}>
                            {String(formikProps.errors[field.name])}
                          </HelperText>
                        )}
                      </View>
                    ))}

                    {showSCDSelector && (
                      <View style={[styles.scdContainer, { borderTopColor: '#f0f0f0' }]}>
                        <Text variant="labelLarge" style={[styles.scdLabel, { color: '#6b6b6b' }]}>Assign to School/Class/Division:</Text>
                        <SCDSelectorNative
                          formik={{
                            values: formikProps.values,
                            setFieldValue: (field: string, value: any) => formikProps.setFieldValue(field, value),
                            touched: formikProps.touched,
                            errors: formikProps.errors || {},
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
              </Formik>
            ) : (
              fields.map((field) => (
                <View key={field.name} style={styles.inputContainer}>
                  {renderField(field)}
                  {field.helper && (
                    <View style={{ marginTop: 6 }}>
                      <Text variant="bodySmall" style={{ color: '#6b6b6b' }}>
                        {field.helper}{' '}
                        {field.helperValue ? (
                          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{field.helperValue}</Text>
                        ) : null}
                      </Text>
                    </View>
                  )}
                  {errors[field.name] && (
                    <HelperText type="error" visible style={[styles.errorText, { color: theme.colors.error || 'red' }]}>
                      {errors[field.name]}
                    </HelperText>
                  )}
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Sticky Footer with full-width primary action (rounded) */}
      <View style={[styles.footer, { backgroundColor: 'transparent', borderTopColor: '#f0f0f0' }]}>
        {showCancelButton && (
          <Button mode="outlined" onPress={() => cancelAction ? cancelAction() : navigation.goBack()} style={[styles.cancelButton, { borderColor: '#e6e6e6', backgroundColor: '#ffffff' }]} labelStyle={[styles.cancelButtonLabel]} compact disabled={loading} textColor={theme.colors.secondary || '#6b6b6b'} buttonColor={'transparent'}>
            Cancel
          </Button>
        )}

        <Button mode="contained" onPress={handleSubmit} style={styles.fullWidthAction} contentStyle={styles.fullWidthActionContent} labelStyle={styles.fullWidthActionLabel} loading={loading} disabled={loading} buttonColor={theme.colors.primary} textColor={theme.colors.onPrimary || '#ffffff'}>
          {submitLabel ?? (id ? 'Update' : 'Save')}
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
