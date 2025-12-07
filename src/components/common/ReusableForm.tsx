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
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import {
  Button,
  TextInput,
  Card,
  HelperText,
  useTheme,
  Text,
  IconButton, // Added for date icon
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker"; // NEW: Import DatePicker
import api from "../../api";
import { userDetails } from "../../utils/apiService";
import { LoadingSpinner } from "./LoadingSpinner";
import SCDSelectorNative from "./SCDSelector.native";
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
  optionsUrl?: string;
  optionsMethod?: "GET" | "POST";
  optionsLabelKey?: string;
  optionsValueKey?: string;
  inputProps?: any;
  optionsPayload?: any;
}

interface ReusableFormProps {
  entityName?: string;
  fields: FormField[];
  fetchUrl?: string;
  saveUrl?: string;
  updateUrl?: string;
  transformForSubmit?: (data: any, isUpdate?: boolean) => any;
  onSuccess?: (response: any) => void;
  onSuccessUrl?: string;
  cancelButton?: React.ReactNode;
  showCancelButton?: boolean;
  showSCDSelector?: boolean;
  disableSCD?: boolean;

  initialValues?: any;
  validationSchema?: any;
  onSubmit?: (values: any, formikHelpers: any) => Promise<void> | void;
  isEditMode?: boolean;
  cancelAction?: () => void;
  tNamespace?: string;
  submitLabel?: string;
  onSuccessRoute?: { name: string; params?: any };
  renderCustomContent?: (formikProps: any) => React.ReactNode; // NEW: Safe optional prop for Tabs
}

// **UI CONSTANTS**
const FOOTER_HEIGHT = 80;
const SKY_BLUE = "#007AFF";
const TEXT_DARK = "#333333";
const TEXT_MUTED = "#6B7280";
const BACKGROUND_LIGHT = "#F9FAFB";

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
  onSuccessRoute,
  renderCustomContent, // NEW
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const formikRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);
  const [fieldLayouts, setFieldLayouts] = useState<Record<string, number>>({});
  const inputRefs = useRef<Record<string, any>>({});
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(
    Dimensions.get("window").height
  );

  // NEW: State for Date Picker
  const [datePickerState, setDatePickerState] = useState<{
    visible: boolean;
    fieldName: string | null;
  }>({ visible: false, fieldName: null });

  useEffect(() => {
    const onKeyboardShow = (e: any) => {
      const h = e?.endCoordinates?.height || 0;
      setKeyboardHeight(h);
    };
    const onKeyboardHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener("keyboardDidShow", onKeyboardShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onKeyboardHide);

    const dimSub = Dimensions.addEventListener?.("change", ({ window }) => {
      setWindowHeight(window.height);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
      if (dimSub && typeof dimSub.remove === "function") dimSub.remove();
    };
  }, []);

  const [selectModalVisible, setSelectModalVisible] = useState<
    Record<string, boolean>
  >({});
  const [optionsCache, setOptionsCache] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if ((id || isEditMode) && fetchUrl) {
      const loadData = async () => {
        setLoading(true);
        try {
          const response = await api.get(`${fetchUrl}?id=${id}`);
          const data = response.data?.data || response.data || {};

          // If using Formik, update formikRef instead
          if (formikRef.current && initialValues) {
            formikRef.current.setValues({ ...initialValues, ...data });
          } else {
            setFormData(data);
          }
        } catch (err) {
          console.error(err);
          Alert.alert("Error", `Failed to fetch ${entityName} details.`);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [id, fetchUrl, entityName, isEditMode]);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    fields.forEach((field) => {
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
    // FIX: If options are passed directly, do NOT fetch from URL
    if (field.options && field.options.length > 0) {
      return field.options;
    }

    if (!field.optionsUrl) return [];
    const key = field.name;
    if (optionsCache[key]) return optionsCache[key];
    try {
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
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    let data = formData;
    if (transformForSubmit) data = transformForSubmit(data, !!id);

    try {
      let response;
      if (id) {
        if (!updateUrl) throw new Error("updateUrl not provided");
        response = await api.put(updateUrl, { id, ...data });
      } else {
        if (!saveUrl) throw new Error("saveUrl not provided");
        response = await api.post(saveUrl, data);
      }
      Alert.alert(
        "Success",
        `${entityName} ${id ? "updated" : "saved"} successfully!`
      );

      if (onSuccess) onSuccess(response.data);
      if (onSuccessRoute)
        (navigation as any).navigate(
          onSuccessRoute.name,
          onSuccessRoute.params
        );
      else if (onSuccessUrl) navigation.navigate(onSuccessUrl as never);
      else navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${id ? "update" : "save"} ${entityName}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !Object.keys(formData).length) {
    return <LoadingSpinner />;
  }

  const nounLabel = entityName || "Item";
  const formTitle =
    id || isEditMode ? `Edit ${nounLabel}` : `Add New ${nounLabel}`;

  const renderField = (field: FormField, formikHelpers?: any) => {
    const customInputTheme = {
      colors: {
        onSurface: TEXT_DARK,
        text: TEXT_DARK,
        placeholder: TEXT_MUTED,
        primary: SKY_BLUE,
        background: "#ffffff",
      },
    };
    const labelText = field.label || field.labelKey || field.name;

    // --- NEW: DATE PICKER ---
    if (field.type === "date") {
      const dateVal = formikHelpers
        ? formikHelpers.values[field.name]
        : formData[field.name];
      const displayDate = dateVal
        ? new Date(dateVal).toLocaleDateString()
        : field.placeholder || "Select Date";

      const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === "android") {
          setDatePickerState({ visible: false, fieldName: null });
        }
        if (selectedDate) {
          // Format YYYY-MM-DD for backend consistency
          const isoDate = selectedDate.toISOString().split("T")[0];
          if (formikHelpers) formikHelpers.setFieldValue(field.name, isoDate);
          else handleInputChange(field.name, isoDate);
        }
      };

      return (
        <View style={{ marginBottom: 12 }} key={field.name}>
          <Text
            style={{ marginBottom: 6, color: TEXT_DARK, fontWeight: "600" }}
          >
            {labelText}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setDatePickerState({ visible: true, fieldName: field.name })
            }
            style={[
              styles.selectField,
              {
                borderColor: SKY_BLUE,
                borderWidth: 1,
                backgroundColor: BACKGROUND_LIGHT,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <Text style={{ color: dateVal ? TEXT_DARK : TEXT_MUTED }}>
              {displayDate}
            </Text>
            <IconButton
              icon="calendar"
              size={20}
              iconColor={SKY_BLUE}
              style={{ margin: 0 }}
            />
          </TouchableOpacity>

          {datePickerState.visible &&
            datePickerState.fieldName === field.name && (
              <DateTimePicker
                value={dateVal ? new Date(dateVal) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()} // DOB usually isn't in future
              />
            )}
        </View>
      );
    }
    // ------------------------

    if (field.type === "select") {
      const key = field.name;
      const labelKey = field.optionsLabelKey || "name";
      const valueKey = field.optionsValueKey || "id";

      const openPicker = async () => {
        // FIX: Use passed options if available!
        const opts =
          field.options && field.options.length > 0
            ? field.options
            : await fetchOptionsForField(field);

        setOptionsCache((s) => ({ ...s, [key]: opts }));
        setSelectModalVisible((s) => ({ ...s, [key]: true }));
      };

      const closePicker = () =>
        setSelectModalVisible((s) => ({ ...s, [key]: false }));

      return (
        <View style={{ marginBottom: 12 }} key={field.name}>
          <Text
            style={{ marginBottom: 6, color: TEXT_DARK, fontWeight: "600" }}
          >
            {field.label}
          </Text>
          <TouchableOpacity
            onPress={openPicker}
            style={[
              styles.selectField,
              {
                borderColor: SKY_BLUE,
                borderWidth: 1,
                backgroundColor: BACKGROUND_LIGHT,
              },
            ]}
          >
            <Text style={{ color: TEXT_DARK }}>
              {(() => {
                const val = formikHelpers
                  ? formikHelpers.values?.[key]
                  : formData[key];
                const list = optionsCache[key] || field.options || []; // Use passed options as fallback for display

                // Handle object values {id, name} or primitive ID
                let found = null;
                if (typeof val === "object" && val !== null) {
                  return val[labelKey] || val.name || "Selected";
                }
                found = list.find((o) => String(o[valueKey]) === String(val));
                return found
                  ? found[labelKey]
                  : field.placeholder || "Tap to Select...";
              })()}
            </Text>
          </TouchableOpacity>

          {selectModalVisible[key] ? (
            <Modal visible transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <FlatList
                    data={optionsCache[key] || []}
                    keyExtractor={(i, idx) => String(i[valueKey]) + idx}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          const v = item[valueKey]; // Default to ID
                          if (formikHelpers) {
                            // Set only the ID value, not the entire object
                            formikHelpers.setFieldValue(key, v);
                          } else {
                            setFormData((s: any) => ({ ...s, [key]: v }));
                          }
                          closePicker();
                        }}
                        style={styles.modalItem}
                      >
                        <Text style={{ color: TEXT_DARK }}>
                          {item[labelKey]}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    onPress={closePicker}
                    style={styles.modalCloseButton}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: SKY_BLUE,
                        fontWeight: "700",
                      }}
                    >
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

    const handleFocus = (r: any) => {
      // ... (Keyboard fix kept same)
      const y = fieldLayouts[field.name];
      const vh = windowHeight || Dimensions.get("window").height;
      const kh = keyboardHeight || 0;
      const extra = 20;
      const visibleAreaTop = vh - kh - FOOTER_HEIGHT - extra;
      if (typeof y === "number" && y > 0) {
        let target = y - visibleAreaTop;
        if (target < 0) target = 0;
        scrollRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
      }
    };

    return (
      <TextInput
        key={field.name}
        ref={(r: any) => (inputRefs.current[field.name] = r)}
        label={labelText}
        value={
          formikHelpers
            ? formikHelpers.values[field.name] || ""
            : formData[field.name] || ""
        }
        onChangeText={(text) =>
          formikHelpers
            ? formikHelpers.setFieldValue(field.name, text)
            : handleInputChange(field.name, text)
        }
        onFocus={() => handleFocus(inputRefs.current[field.name])}
        onBlur={() =>
          formikHelpers && formikHelpers.setFieldTouched(field.name, true)
        }
        mode="outlined"
        secureTextEntry={isPassword}
        keyboardType={
          isNumber ? "numeric" : isEmail ? "email-address" : "default"
        }
        error={
          formikHelpers
            ? !!(
                formikHelpers.touched[field.name] &&
                formikHelpers.errors[field.name]
              )
            : !!errors[field.name]
        }
        style={[styles.input, { backgroundColor: BACKGROUND_LIGHT }]}
        autoCapitalize={isEmail ? "none" : "sentences"}
        theme={customInputTheme as any}
        multiline={field.multiline}
        outlineStyle={styles.inputOutlineStyle}
        disabled={field.disabled} // Added disabled prop support
        {...(field.inputProps || {})}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: BACKGROUND_LIGHT }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.header,
              {
                borderBottomColor: BACKGROUND_LIGHT,
                backgroundColor: "#ffffff",
              },
              styles.headerShadow,
            ]}
          >
            <Text
              variant="headlineSmall"
              style={{ color: TEXT_DARK, fontWeight: "700" }}
            >
              {formTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: TEXT_MUTED }}>
              {id
                ? "Review and update details"
                : "Fill in the required information"}
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={[styles.scrollContent]}
            keyboardShouldPersistTaps="handled"
          >
            <Card
              style={[styles.card, { backgroundColor: "#ffffff" }]}
              elevation={4}
            >
              <Card.Content>
                {initialValues ? (
                  <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values: any, formikHelpers: any) => {
                      setSubmitting(true);
                      formikHelpers.setSubmitting(true);
                      try {
                        const accountId = await userDetails.getAccountId();
                        const payload = accountId
                          ? { ...values, accountId }
                          : values;
                        let response: any = null;
                        if (externalOnSubmit) {
                          response = await (externalOnSubmit as any)(
                            payload,
                            formikHelpers
                          );
                        } else {
                          // ... default save logic ...
                          if (id) {
                            if (!updateUrl)
                              throw new Error("updateUrl not provided");
                            response = await api.put(updateUrl, {
                              id,
                              ...payload,
                            });
                          } else {
                            if (!saveUrl)
                              throw new Error("saveUrl not provided");
                            response = await api.post(saveUrl, payload);
                          }
                        }
                        if (onSuccess) onSuccess(response?.data ?? response);
                        Alert.alert(
                          "Success",
                          `${entityName} ${
                            id ? "updated" : "saved"
                          } successfully!`,
                          [
                            {
                              text: "OK",
                              onPress: () => {
                                if (onSuccessRoute)
                                  (navigation as any).navigate(
                                    onSuccessRoute.name,
                                    onSuccessRoute.params
                                  );
                                else if (onSuccessUrl)
                                  navigation.navigate(onSuccessUrl as never);
                                else navigation.goBack();
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
                        setSubmitting(false);
                      }
                    }}
                    enableReinitialize
                  >
                    {(formikProps) => (
                      <>
                        {/* Support for Custom Tabs inside Form context */}
                        {renderCustomContent ? (
                          renderCustomContent(formikProps)
                        ) : (
                          <>
                            {fields.map((field) => (
                              <View
                                key={field.name}
                                style={styles.inputContainer}
                                onLayout={(e) => {
                                  const y = e?.nativeEvent?.layout?.y;
                                  setFieldLayouts((s) => ({
                                    ...s,
                                    [field.name]: typeof y === "number" ? y : 0,
                                  }));
                                }}
                              >
                                {renderField(field, formikProps)}
                                {field.helper && (
                                  <View style={{ marginTop: 6 }}>
                                    <Text variant="bodySmall">
                                      {field.helper}
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
                              <View style={styles.scdContainer}>
                                <Text style={styles.scdLabel}>
                                  Assign to School/Class/Division:
                                </Text>
                                <SCDSelectorNative
                                  formik={{
                                    values: formikProps.values,
                                    setFieldValue: (
                                      fieldName: string,
                                      value: any,
                                      label?: string
                                    ) => {
                                      // Handle third argument (label) for school/class/division names
                                      formikProps.setFieldValue(
                                        fieldName,
                                        value
                                      );
                                      if (label) {
                                        if (fieldName === "schoolId") {
                                          formikProps.setFieldValue(
                                            "schoolName",
                                            label
                                          );
                                        } else if (fieldName === "classId") {
                                          formikProps.setFieldValue(
                                            "className",
                                            label
                                          );
                                        } else if (fieldName === "divisionId") {
                                          formikProps.setFieldValue(
                                            "divisionName",
                                            label
                                          );
                                        }
                                      }
                                    },
                                    touched: formikProps.touched,
                                    errors: formikProps.errors || {},
                                  }}
                                />
                              </View>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </Formik>
                ) : (
                  // Legacy non-Formik render (omitted updates for brevity, assumning Formik is used for Student)
                  <Text>
                    Legacy render not supported with new DatePicker updates.
                    Please use initialValues.
                  </Text>
                )}
              </Card.Content>
            </Card>
          </ScrollView>

          {submitting && (
            <View style={styles.submitOverlay}>
              <LoadingSpinner color="#ffffff" />
            </View>
          )}

          <View style={[styles.footer, { backgroundColor: "#ffffff" }]}>
            {showCancelButton && (
              <Button
                mode="text"
                onPress={() =>
                  cancelAction ? cancelAction() : navigation.goBack()
                }
                textColor={SKY_BLUE}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            )}
            <Button
              mode="contained"
              onPress={() =>
                formikRef.current
                  ? formikRef.current.submitForm()
                  : handleSubmit()
              }
              style={styles.fullWidthAction}
              buttonColor={SKY_BLUE}
              loading={submitting || loading}
            >
              {submitLabel ?? (id ? "Update" : "Save")}
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerShadow: { elevation: 1, shadowOpacity: 0.1, shadowRadius: 2 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  card: { borderRadius: 16 },
  inputContainer: { marginBottom: 0, marginTop: 16 },
  input: {},
  inputOutlineStyle: { borderRadius: 12 },
  selectField: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorText: { fontSize: 12, marginTop: -4 },
  scdContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  scdLabel: { marginBottom: 10, fontWeight: "600" },
  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  cancelButton: { flex: 0.5, minHeight: 56, marginRight: 8 },
  fullWidthAction: {
    flex: 1,
    borderRadius: 28,
    minHeight: 56,
    justifyContent: "center",
  },
  submitOverlay: {
    position: "absolute",
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  modalItem: { padding: 16, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  modalCloseButton: {
    padding: 16,
    backgroundColor: BACKGROUND_LIGHT,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
});
