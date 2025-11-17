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
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../api";
import { userDetails } from "../../utils/apiService";
import { LoadingSpinner } from "./LoadingSpinner";
import SCDSelectorNative from "./SCDSelector.native"; // Assuming this handles the select/picker logic
import { Formik } from "formik";

// Define the structure for a form field (unchanged)
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
}

// **UI CONSTANTS**
const FOOTER_HEIGHT = 80;
const SKY_BLUE = "#007AFF"; // Amazing Sky Blue/Primary Accent
const TEXT_DARK = "#333333";
const TEXT_MUTED = "#6B7280";
const BACKGROUND_LIGHT = "#F9FAFB"; // Very light off-white background

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
  const [windowHeight, setWindowHeight] = useState<number>(Dimensions.get("window").height);

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
    } finally {
      // no-op
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    setSubmitting(true);
    let data = formData;

    if (transformForSubmit) {
      data = transformForSubmit(data, !!id);
    }

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

      if (onSuccess) {
        onSuccess(response.data);
      }

      if (onSuccessRoute) {
        (navigation as any).navigate(
          onSuccessRoute.name,
          onSuccessRoute.params
        );
      } else if (onSuccessUrl) {
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
      setSubmitting(false);
    }
  };


  if (loading && !Object.keys(formData).length) {
    return <LoadingSpinner />;
  }
  
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
    
    // Custom theme for Paper inputs
    const customInputTheme = {
      colors: {
        onSurface: TEXT_DARK,
        text: TEXT_DARK,
        placeholder: TEXT_MUTED,
        primary: SKY_BLUE, // Use Sky Blue for focus/active state
        background: "#ffffff", // White background inside the input box
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
          <Text style={{ marginBottom: 6, color: TEXT_DARK, fontWeight: '600' }}>{field.label}</Text>
          <TouchableOpacity
            onPress={openPicker}
            style={[
              styles.selectField,
              { borderColor: SKY_BLUE, borderWidth: 2, backgroundColor: BACKGROUND_LIGHT }, // Highlighted border
            ]}
          >
            <Text style={{ color: TEXT_DARK }}>
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
                  : field.placeholder || "Tap to Select...";
              })()}
            </Text>
          </TouchableOpacity>

          {selectModalVisible[key] ? (
            <Modal visible transparent animationType="slide">
              <View
                style={styles.modalOverlay}
              >
                <View
                  style={styles.modalContent}
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
                        style={styles.modalItem}
                      >
                        <Text style={{ color: TEXT_DARK }}>{item[labelKey]}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    onPress={closePicker}
                    style={styles.modalCloseButton}
                  >
                    <Text style={{ textAlign: "center", color: SKY_BLUE, fontWeight: '700' }}>
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
    
    // --- KEYBOARD FIX LOGIC ---
    const handleFocus = (r: any) => {
        const y = fieldLayouts[field.name];
        const vh = windowHeight || Dimensions.get("window").height;
        const kh = keyboardHeight || 0; 
        const extra = 20;

        // The height of the screen *above* the keyboard/footer
        const visibleAreaTop = vh - kh - FOOTER_HEIGHT - extra; 
        
        if (typeof y === "number" && y > 0) {
            let target = y - visibleAreaTop;
            if (target < 0) target = 0; 
            scrollRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
        } else {
            if (r && typeof r.measureInWindow === "function") {
                r.measureInWindow((mx: number, my: number, mw: number, mh: number) => {
                    const pageY = my;
                    const visibleAreaTop = vh - kh - FOOTER_HEIGHT - extra;
                    let target = pageY - visibleAreaTop;
                    if (target < 0) target = 0;
                    scrollRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
                });
            } else {
                scrollRef.current?.scrollTo({ y: 0, animated: true });
            }
        }
    };
    // --- END KEYBOARD FIX LOGIC ---

    // TextInput Component
    const TextInputComponent = (
      <TextInput
        key={field.name}
        ref={(r: any) => (inputRefs.current[field.name] = r)}
        label={labelText}
        value={formikHelpers ? formikHelpers.values[field.name] || "" : formData[field.name] || ""}
        onChangeText={(text) => formikHelpers ? formikHelpers.setFieldValue(field.name, text) : handleInputChange(field.name, text)}
        onFocus={() => handleFocus(inputRefs.current[field.name])}
        onBlur={() => formikHelpers && formikHelpers.setFieldTouched(field.name, true)}
        mode="outlined"
        secureTextEntry={isPassword}
        keyboardType={
          isNumber ? "numeric" : isEmail ? "email-address" : "default"
        }
        error={
          formikHelpers
            ? !!(formikHelpers.touched[field.name] && formikHelpers.errors[field.name])
            : !!errors[field.name]
        }
        style={[styles.input, { backgroundColor: BACKGROUND_LIGHT }]} // Set background for contrast
        autoCapitalize={isEmail ? "none" : "sentences"}
        theme={customInputTheme as any}
        multiline={field.multiline}
        outlineStyle={styles.inputOutlineStyle} // Custom outline style
        {...(field.inputProps || {})}
      />
    );

    return TextInputComponent;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: BACKGROUND_LIGHT }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={0} 
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={{ flex: 1 }}> 
          {/* Header with shadow for separation */}
          <View
            style={[
              styles.header,
              { borderBottomColor: BACKGROUND_LIGHT, backgroundColor: "#ffffff" },
              styles.headerShadow, // Apply subtle shadow
            ]}
          >
            <Text variant="headlineSmall" style={{ color: TEXT_DARK, fontWeight: '700' }}>
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
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
          >
            {/* Card Section: White surface with rounded corners and elevated feel */}
            <Card
              style={[styles.card, { backgroundColor: "#ffffff" }]}
              elevation={4} // Increased elevation for a floating effect
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
                      // ... submission logic (kept simple) ...
                      try {
                        const accountId = await userDetails.getAccountId();
                        const payload = accountId ? { ...values, accountId } : values;
                        let response: any = null;
                        if (externalOnSubmit) {
                          response = await (externalOnSubmit as any)(payload, formikHelpers);
                        } else {
                          if (id) {
                            if (!updateUrl) throw new Error("updateUrl not provided");
                            response = await api.put(updateUrl, { id, ...payload });
                          } else {
                            if (!saveUrl) throw new Error("saveUrl not provided");
                            response = await api.post(saveUrl, payload);
                          }
                        }
                        if (onSuccess) onSuccess(response?.data ?? response);
                        Alert.alert("Success", `${entityName} ${id ? "updated" : "saved"} successfully!`, [{
                          text: "OK",
                          onPress: () => {
                            if (onSuccessRoute) (navigation as any).navigate(onSuccessRoute.name, onSuccessRoute.params);
                            else if (onSuccessUrl) navigation.navigate(onSuccessUrl as never);
                            else navigation.goBack();
                          },
                        },]);
                      } catch (err: any) {
                        console.error("Form submission failed:", err);
                        Alert.alert("Error", err?.response?.data?.message || `Failed to ${id ? "update" : "save"} ${entityName}.`);
                      } finally {
                        formikHelpers.setSubmitting(false);
                        setSubmitting(false);
                      }
                    }}
                    enableReinitialize
                  >
                    {(formikProps) => (
                      <>
                            {fields.map((field) => (
                              <View key={field.name} style={styles.inputContainer} onLayout={(e) => {
                                const y = e?.nativeEvent?.layout?.y;
                                setFieldLayouts((s) => ({ ...s, [field.name]: typeof y === 'number' ? y : 0 }));
                              }}>
                            {renderField(field, formikProps)}
                            {field.helper && (
                              <View style={{ marginTop: 6 }}>
                                <Text
                                  variant="bodySmall"
                                  style={{ color: TEXT_MUTED }}
                                >
                                  {field.helper}{" "}
                                  {field.helperValue ? (
                                    <Text
                                      style={{
                                        color: SKY_BLUE, // Sky Blue for highlight values
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
                              { borderTopColor: BACKGROUND_LIGHT },
                            ]}
                          >
                            <Text
                              variant="labelLarge"
                              style={[styles.scdLabel, { color: TEXT_DARK }]}
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
                  // ... Legacy Form Logic (structure remains the same)
                  fields.map((field) => (
                    <View key={field.name} style={styles.inputContainer} onLayout={(e) => {
                      const y = e?.nativeEvent?.layout?.y;
                      setFieldLayouts((s) => ({ ...s, [field.name]: typeof y === 'number' ? y : 0 }));
                    }}>
                      {renderField(field)}
                      {field.helper && (
                        <View style={{ marginTop: 6 }}>
                          <Text variant="bodySmall" style={{ color: TEXT_MUTED }}>
                            {field.helper}{" "}
                            {field.helperValue ? (
                              <Text
                                style={{
                                  color: SKY_BLUE,
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

          {/* Overlay loader (unchanged) */}
          {submitting ? (
            <View style={styles.submitOverlay} pointerEvents="auto">
              <View style={[styles.submitOverlayInner,]}>
                <LoadingSpinner color="#ffffff" />
                <Text style={{ marginTop: 8, color: "#ffffff", fontWeight: '600' }}>Saving...</Text>
              </View>
            </View>
          ) : null}

          {/* Footer (Sleek, transparent background, pushed up by keyboard) */}
          <View
            style={[
              styles.footer,
              { backgroundColor: "#ffffff", borderTopColor: '#e0e0e0' },
            ]}
          >
            {showCancelButton && (
              <Button
                mode="text" // Use text mode for a cleaner ghost button
                onPress={() =>
                  cancelAction ? cancelAction() : navigation.goBack()
                }
                style={[
                  styles.cancelButton,
                  { borderWidth: 0, backgroundColor: "#ffffff" },
                ]}
                labelStyle={[styles.cancelButtonLabel, {color: SKY_BLUE}]} // Sky Blue text
                compact
                disabled={loading}
                textColor={SKY_BLUE}
              >
                Cancel
              </Button>
            )}

            <Button
              mode="contained"
              onPress={() => {
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
              labelStyle={[styles.fullWidthActionLabel, {color: '#ffffff'}]}
              loading={submitting || loading}
              disabled={submitting || loading}
              buttonColor={SKY_BLUE} // Sky Blue primary action
              textColor={'#ffffff'}
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20, 
  },
  card: {
    borderRadius: 16, // Increased roundness
  },
  inputContainer: {
    marginBottom: 0,
    marginTop: 16,
  },
  input: {
    // Height is often set implicitly by RNP, but custom style for margin/padding if needed
  },
  inputOutlineStyle: {
    borderRadius: 12, // High rounding for the input border
  },
  selectField: {
    padding: 16,
    borderRadius: 12, // High rounding
    borderWidth: 1,
    borderColor: '#E5E7EB', // Lighter default border
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
    // No absolute positioning here (fix for keyboard covering buttons)
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cancelButton: {
    flex: 0.5,
    minHeight: 56, // Match height of primary button
    marginRight: 8,
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  fullWidthAction: {
    flex: 1,
    borderRadius: 28, // Pill shape
    marginVertical: 0,
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
  submitOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  submitOverlayInner: {
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Slide up from the bottom
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#F3F4F6',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: BACKGROUND_LIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  }
});