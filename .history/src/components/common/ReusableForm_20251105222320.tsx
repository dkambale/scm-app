import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
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

// Define the structure for a form field
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select";
  required?: boolean;
  // For select fields
  options?: { label: string; value: any }[];
  optionsUrl?: string; // URL to fetch options from
}

interface ReusableFormProps {
  entityName: string;
  fields: FormField[];
  fetchUrl?: string; // URL to get entity data for editing, e.g., /api/users/getById
  saveUrl: string; // URL to create a new entity, e.g., /api/users/save
  updateUrl: string; // URL to update an existing entity, e.g., /api/users/update
  transformForSubmit?: (data: any, isUpdate?: boolean) => any; // Function to transform data before submitting
  onSuccess?: (response: any) => void; // Callback on successful submission
  onSuccessUrl?: string; // URL to navigate to on success
  cancelButton?: React.ReactNode; 
  showCancelButton?: boolean; 
  showSCDSelector?: boolean; 
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
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme(); // Initialize theme
  const { id } = (route.params as { id?: string }) || {};

  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Fetch initial data for editing
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

  if (loading && !Object.keys(formData).length) {
    return <LoadingSpinner />;
  }
  
  const formTitle = id ? `Edit ${entityName}` : `Add New ${entityName}`;

  // Helper function to render different input types
  const renderField = (field: FormField) => {
    // If it's a select field, use the custom SCDSelector.native if configured, 
    // otherwise it would need a custom Picker/Select implementation which is complex for RNP,
    // we'll leave it as a placeholder or assume SCDSelector handles it.
    if (field.type === 'select') {
      // In a real app, you would render a custom Picker/Dropdown component here
      // For now, we'll render a disabled text input as a placeholder if not handled by SCDSelector
      return (
        <TextInput
          key={field.name}
          label={field.label} // Keeps the floating label functionality
          placeholder={field.label} // ADDED: Explicit placeholder
          value={formData[field.name] ? String(formData[field.name]) : ""}
          mode="outlined"
          disabled={true}
          style={styles.input}
        />
      );
    }

    const isPassword = field.type === "password";
    const isNumber = field.type === "number";
    const isEmail = field.type === "email";

    return (
      <TextInput
        key={field.name}
        label={field.label} // Keeps the floating label functionality
        placeholder={field.label} // ADDED: Explicit placeholder for visual clarity when empty
        value={formData[field.name] || ""}
        onChangeText={(text) => handleInputChange(field.name, text)}
        mode="outlined"
        secureTextEntry={isPassword}
        keyboardType={isNumber ? "numeric" : isEmail ? "email-address" : "default"}
        error={!!errors[field.name]}
        style={styles.input}
        autoCapitalize={isEmail ? "none" : "sentences"}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* Header Section */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>{formTitle}</Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {id ? "Review and update details" : "Fill in the required information"}
        </Text>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Card.Content>
            {fields.map((field) => (
              <View key={field.name} style={styles.inputContainer}>
                {renderField(field)}
                {errors[field.name] && (
                  <HelperText type="error" visible={!!errors[field.name]} style={styles.errorText}>
                    {errors[field.name]}
                  </HelperText>
                )}
              </View>
            ))}

            {showSCDSelector && (
              <View style={styles.scdContainer}>
                  <Text variant="labelLarge" style={styles.scdLabel}>Assign to School/Class/Division:</Text>
                  <SCDSelectorNative
                      formik={{
                          values: formData,
                          setFieldValue: (field: string, value: any) =>
                              handleInputChange(field, value),
                          touched: {}, // RNP component does not use touched, but required by SCDSelector
                          errors: errors || {},
                      }}
                  />
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Sticky Footer for Actions */}
      <View style={[styles.footer, { backgroundColor: theme.colors.elevation.level2, borderTopColor: theme.colors.outlineVariant }]}>
        {showCancelButton && (
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              labelStyle={{ color: theme.colors.secondary }}
              compact
              disabled={loading}
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
    marginBottom: 0, // Reduced margin, relying on helper text for spacing
    marginTop: 16,
  },
  input: {
    backgroundColor: 'transparent', // Ensure input background blends with card
  },
  errorText: {
    fontSize: 12,
    paddingLeft: 0,
    marginTop: -4, // Adjust vertical position of error message
  },
  scdContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  scdLabel: {
      marginBottom: 10,
      fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    // Add a slight elevation for visibility above content
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 0.5, // Make cancel button smaller
    borderRadius: 8,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ccc', // Use outline color
  },
});