import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import {
  Button,
  TextInput,
  Card,
  HelperText,
  useTheme,
  Text,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../api";
import { userDetails } from "../../utils/apiService";
import { LoadingSpinner } from "./LoadingSpinner";
import SCDSelectorNative from "./SCDSelector.native"; // Assuming this handles the select/picker logic
import { Formik } from "formik";

// Define the structure for a form field
export interface FormField {
  name: string;
  label?: string;
  labelKey?: string;
  helper?: string;
  helperValue?: string;
  placeholder?: string;
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
  options?: any[];
  optionsUrl?: string; // URL to fetch options from
  optionsMethod?: "GET" | "POST"; // method to fetch options
  optionsLabelKey?: string; // key to display in option label (default: 'name')
  optionsValueKey?: string; // key to use as option value (default: 'id')
  inputProps?: any;
  optionsPayload?: any; // optional extra payload to send when fetching options
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
  disableSCD?: boolean;

  // Formik-style API used by newer callers
  initialValues?: any;
  validationSchema?: any;
  onSubmit?: (values: any, formikHelpers: any) => Promise<void> | void;
  isEditMode?: boolean;
  cancelAction?: () => void;
  tNamespace?: string; // optional namespace like 'student' to derive title
  submitLabel?: string;
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
  disableSCD = false,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme(); // Initialize theme
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  // date pickers (not used yet)
  // Ref to the Formik instance when we render with Formik
  const formikRef = useRef<any>(null);
  // Select options state/cache and modal visibility
  const [selectModalVisible, setSelectModalVisible] = useState<
    Record<string, boolean>
  >({});
  const [optionsCache, setOptionsCache] = useState<Record<string, any[]>>({});

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

  const fetchOptionsForField = async (field: FormField) => {
    if (!field.optionsUrl) return [];
    const key = field.name;
    if (optionsCache[key]) return optionsCache[key];
    try {
      // resolve accountId placeholder or attach as body
      const accountId = await userDetails.getAccountId();
      let url = field.optionsUrl;
      if (url.includes("{accountId}")) {
        url = url.replace("{accountId}", String(accountId ?? ""));
      }

      const method = (field.optionsMethod || "POST").toUpperCase();
      let resp;
      if (method === "GET") {
        resp = await api.get(url, { params: { accountId } });
      } else {
        // POST - include accountId and default paging/search payload
        const defaultPayload = {
          page: 0,
          search: "",
          size: 10,
          sortBy: "id",
          sortDir: "asc",
        };
        const body = {
          accountId,
          ...defaultPayload,
          ...(field.optionsPayload || {}),
        };
        resp = await api.post(url, body);
      }

      const list = resp?.data?.content || resp?.data || resp || [];
      setOptionsCache((s) => ({
        ...s,
        [key]: Array.isArray(list) ? list : [],
      }));
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.error("Failed to fetch options for", field.name, err);
      setOptionsCache((s) => ({ ...s, [field.name]: [] }));
      return [];
    } finally {
      // no-op
    }
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
        if (!updateUrl) throw new Error("updateUrl not provided");
        // Assume API takes ID in the payload for PUT, adjusting the URL call
        response = await api.put(updateUrl, { id, ...data });
      } else {
        if (!saveUrl) throw new Error("saveUrl not provided");
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

  // date handling TODO

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
    // Use a light input theme so inputs match the white card look in the design
    const lightInputTheme = {
      colors: {
        onSurface: "#111111",
        text: "#111111",
        placeholder: "#9aa0b1",
        primary: theme.colors.primary,
        background: "#ffffff",
      },
    };

    const labelText = field.label || field.labelKey || field.name;

    if (field.type === "select") {
      const key = field.name;
      const labelKey = field.optionsLabelKey || "name";
      const valueKey = field.optionsValueKey || "id";

      const openPicker = async () => {
        const opts = await fetchOptionsForField(field);
        setOptionsCache((s) => ({ ...s, [key]: opts }));
        setSelectModalVisible((s) => ({ ...s, [key]: true }));
      };

      const closePicker = () =>
        setSelectModalVisible((s) => ({ ...s, [key]: false }));

      return (
        <View style={{ marginBottom: 12 }} key={field.name}>
          <Text style={{ marginBottom: 6 }}>{field.label}</Text>
          <TouchableOpacity
            onPress={openPicker}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 6,
            }}
          >
            <Text>
              {(() => {
                const val = formikHelpers
                  ? formikHelpers.values?.[key]
                  : formData[key];
                const list = optionsCache[key] || [];
                const found = list.find(
                  (o) => String(o[valueKey]) === String(val)
                );
                return found
                  ? found[labelKey]
                  : field.placeholder || "Select...";
              })()}
            </Text>
          </TouchableOpacity>

          {selectModalVisible[key] ? (
            <Modal visible transparent animationType="slide">
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    margin: 20,
                    backgroundColor: "white",
                    borderRadius: 8,
                    maxHeight: "70%",
                  }}
                >
                  <FlatList
                    data={optionsCache[key] || []}
                    keyExtractor={(i, idx) => String(i[valueKey]) + idx}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          const v = item[valueKey];
                          if (formikHelpers)
                            formikHelpers.setFieldValue(key, v);
                          else setFormData((s: any) => ({ ...s, [key]: v }));
                          closePicker();
                        }}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderColor: "#eee",
                        }}
                      >
                        <Text>{item[labelKey]}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    onPress={closePicker}
                    style={{ padding: 12 }}
                  >
                    <Text style={{ textAlign: "center", color: "#007aff" }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : null}
        </View>
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
    <View style={[styles.container, { backgroundColor: "#ffffff" }]}>
      {/* Minimal Header (kept but light) */}
      <View
        style={[
          styles.header,
          { borderBottomColor: "#f0f0f0", backgroundColor: "#ffffff" },
        ]}
      >
        <Text variant="headlineSmall" style={{ color: "#111111" }}>
          {formTitle}
        </Text>
        <Text variant="bodySmall" style={{ color: "#6b6b6b" }}>
          {id
            ? "Review and update details"
            : "Fill in the required information"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card Section: White surface */}
        <Card
          style={[styles.card, { backgroundColor: "#ffffff" }]}
          elevation={0}
        >
          <Card.Content>
            {initialValues ? (
              <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values: any, formikHelpers: any) => {
                  formikHelpers.setSubmitting(true);
                  try {
                    const accountId = await userDetails.getAccountId();
                    const payload = accountId
                      ? { ...values, accountId }
                      : values;

                    let response: any = null;

                    if (externalOnSubmit) {
                      // If caller provided an onSubmit, let it handle the save.
                      response = await (externalOnSubmit as any)(
                        payload,
                        formikHelpers
                      );
                    } else {
                      // Fallback: use saveUrl/updateUrl if provided (mirror legacy behavior)
                      if (id) {
                        if (!updateUrl)
                          throw new Error("updateUrl not provided");
                        response = await api.put(updateUrl, { id, ...payload });
                      } else {
                        if (!saveUrl) throw new Error("saveUrl not provided");
                        response = await api.post(saveUrl, payload);
                      }
                    }

                    // Call optional onSuccess callback
                    if (onSuccess) {
                      try {
                        onSuccess(response?.data ?? response);
                      } catch (err) {
                        console.error("onSuccess handler failed:", err);
                      }
                    }

                    // Notify user and navigate
                    Alert.alert(
                      "Success",
                      `${entityName} ${id ? "updated" : "saved"} successfully!`,
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            if (onSuccessUrl) {
                              navigation.navigate(onSuccessUrl as never);
                            } else {
                              navigation.goBack();
                            }
                          },
                        },
                      ]
                    );
                  } catch (err: any) {
                    console.error("Form submission failed:", err);
                    Alert.alert(
                      "Error",
                      err?.response?.data?.message ||
                        `Failed to ${id ? "update" : "save"} ${entityName}.`
                    );
                  } finally {
                    formikHelpers.setSubmitting(false);
                  }
                }}
                enableReinitialize
              >
                {(formikProps) => (
                  <>
                    {fields.map((field) => (
                      <View key={field.name} style={styles.inputContainer}>
                        {renderField(field, formikProps)}
                        {field.helper && (
                          <View style={{ marginTop: 6 }}>
                            <Text
                              variant="bodySmall"
                              style={{ color: "#6b6b6b" }}
                            >
                              {field.helper}{" "}
                              {field.helperValue ? (
                                <Text
                                  style={{
                                    color: theme.colors.primary,
                                    fontWeight: "700",
                                  }}
                                >
                                  {field.helperValue}
                                </Text>
                              ) : null}
                            </Text>
                          </View>
                        )}

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

                    {showSCDSelector && !disableSCD && (
                      <View
                        style={[
                          styles.scdContainer,
                          { borderTopColor: "#f0f0f0" },
                        ]}
                      >
                        <Text
                          variant="labelLarge"
                          style={[styles.scdLabel, { color: "#6b6b6b" }]}
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
                  </>
                )}
              </Formik>
            ) : (
              fields.map((field) => (
                <View key={field.name} style={styles.inputContainer}>
                  {renderField(field)}
                  {field.helper && (
                    <View style={{ marginTop: 6 }}>
                      <Text variant="bodySmall" style={{ color: "#6b6b6b" }}>
                        {field.helper}{" "}
                        {field.helperValue ? (
                          <Text
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "700",
                            }}
                          >
                            {field.helperValue}
                          </Text>
                        ) : null}
                      </Text>
                    </View>
                  )}
                  {errors[field.name] && (
                    <HelperText
                      type="error"
                      visible
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

      {/* Sticky Footer with full-width primary action (rounded) */}
      <View
        style={[
          styles.footer,
          { backgroundColor: "transparent", borderTopColor: "#f0f0f0" },
        ]}
      >
        {showCancelButton && (
          <Button
            mode="outlined"
            onPress={() =>
              cancelAction ? cancelAction() : navigation.goBack()
            }
            style={[
              styles.cancelButton,
              { borderColor: "#e6e6e6", backgroundColor: "#ffffff" },
            ]}
            labelStyle={[styles.cancelButtonLabel]}
            compact
            disabled={loading}
            textColor={theme.colors.secondary || "#6b6b6b"}
            buttonColor={"transparent"}
          >
            Cancel
          </Button>
        )}

        <Button
          mode="contained"
          onPress={() => {
            // If Formik is being used, trigger Formik's submitForm(), otherwise use legacy handler
            if (
              formikRef &&
              formikRef.current &&
              typeof formikRef.current.submitForm === "function"
            ) {
              formikRef.current.submitForm();
            } else {
              handleSubmit();
            }
          }}
          style={styles.fullWidthAction}
          contentStyle={styles.fullWidthActionContent}
          labelStyle={styles.fullWidthActionLabel}
          loading={loading || (formikRef?.current?.isSubmitting ?? false)}
          disabled={loading || (formikRef?.current?.isSubmitting ?? false)}
          buttonColor={theme.colors.primary}
          textColor={theme.colors.onPrimary || "#ffffff"}
        >
          {submitLabel ?? (id ? "Update" : "Save")}
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
  fullWidthAction: {
    flex: 1,
    borderRadius: 28,
    marginLeft: 0,
    marginRight: 0,
    marginVertical: 12,
    marginHorizontal: 16,
    minHeight: 56,
    justifyContent: "center",
  },
  fullWidthActionContent: {
    height: 56,
  },
  fullWidthActionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});
