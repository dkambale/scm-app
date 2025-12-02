import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  RadioButton,
  useTheme,
  Checkbox,
  HelperText,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

// Define validation schema
const loginSchema = Yup.object().shape({
  userName: Yup.string().max(255).required("User Name is required"),
  password: Yup.string().max(255).required("Password is required"),
  accountId: Yup.string().required("Account ID is required"),
  type: Yup.mixed<"ADMIN" | "TEACHER" | "STUDENT">()
    .oneOf(["ADMIN", "TEACHER", "STUDENT"])
    .required("User Type is required"),
});

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();

  // Logic States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Toggle Password Visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (values: {
    userName: string;
    password: string;
    accountId: string;
    type: "ADMIN" | "TEACHER" | "STUDENT";
  }) => {
    setLoading(true);
    setApiError(""); // Clear previous errors

    try {
      // The login function in AuthContext calls the API.
      // If the server returns a non-success status, AuthContext throws an error.
      await login(
        values.userName,
        values.password,
        values.accountId,
        values.type
      );
      // Navigation is handled automatically by the navigation container watching the 'user' state,
      // or we can explicitly navigate if your flow requires it.
    } catch (err: any) {
      console.error("Login Error:", err);
      // Capture the error message from the server response if available
      const message =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#ffffff" }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.primary }]}
            >
              KoolERP
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Sign in to continue
            </Text>
          </View>

          {/* Main Form Card */}
          <Card style={[styles.card, { backgroundColor: "#ffffff" }]}>
            <Card.Content style={styles.cardContent}>
              <Formik
                initialValues={{
                  userName: "",
                  password: "",
                  accountId: "",
                  type: "ADMIN" as "ADMIN" | "TEACHER" | "STUDENT",
                }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldValue,
                }) => (
                  <View>
                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="User Name"
                        value={values.userName}
                        onChangeText={(text) => {
                          handleChange("userName")(text);
                          if (apiError) setApiError(""); // Clear global error on type
                        }}
                        onBlur={handleBlur("userName")}
                        autoCapitalize="none"
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="account" color="#9e9e9e" />}
                        error={touched.userName && !!errors.userName}
                      />
                      {touched.userName && errors.userName && (
                        <HelperText type="error" visible={true}>
                          {errors.userName}
                        </HelperText>
                      )}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Password"
                        value={values.password}
                        onChangeText={(text) => {
                          handleChange("password")(text);
                          if (apiError) setApiError("");
                        }}
                        onBlur={handleBlur("password")}
                        secureTextEntry={!showPassword}
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="lock" color="#9e9e9e" />}
                        right={
                          <TextInput.Icon
                            icon={showPassword ? "eye" : "eye-off"}
                            onPress={handleClickShowPassword}
                            color="#9e9e9e"
                          />
                        }
                        error={touched.password && !!errors.password}
                      />
                      {touched.password && errors.password && (
                        <HelperText type="error" visible={true}>
                          {errors.password}
                        </HelperText>
                      )}
                    </View>

                    {/* Account ID Input */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Account ID"
                        value={values.accountId}
                        onChangeText={(text) => {
                          handleChange("accountId")(text);
                          if (apiError) setApiError("");
                        }}
                        onBlur={handleBlur("accountId")}
                        autoCapitalize="none"
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="domain" color="#9e9e9e" />}
                        error={touched.accountId && !!errors.accountId}
                      />
                      {touched.accountId && errors.accountId && (
                        <HelperText type="error" visible={true}>
                          {errors.accountId}
                        </HelperText>
                      )}
                    </View>

                    {/* User Type Selection */}
                    <View style={styles.roleContainer}>
                      <Text variant="labelLarge" style={styles.roleLabel}>
                        User Type
                      </Text>
                      <RadioButton.Group
                        onValueChange={(value) => {
                          setFieldValue("type", value);
                          if (apiError) setApiError("");
                        }}
                        value={values.type}
                      >
                        <View style={styles.radioGroup}>
                          {["ADMIN", "TEACHER", "STUDENT"].map((role) => (
                            <TouchableOpacity
                              key={role}
                              style={[
                                styles.radioItem,
                                values.type === role && styles.radioItemActive,
                                {
                                  borderColor:
                                    values.type === role
                                      ? theme.colors.primary
                                      : "transparent",
                                },
                              ]}
                              onPress={() => setFieldValue("type", role)}
                            >
                              <RadioButton.Android
                                value={role}
                                color={theme.colors.primary}
                                uncheckedColor="#9e9e9e"
                              />
                              <Text
                                variant="bodyMedium"
                                style={{
                                  color:
                                    values.type === role
                                      ? theme.colors.primary
                                      : "#555",
                                  fontWeight:
                                    values.type === role ? "700" : "400",
                                }}
                              >
                                {role.charAt(0) +
                                  role.slice(1).toLowerCase()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </RadioButton.Group>
                      {touched.type && errors.type && (
                        <HelperText type="error" visible={true}>
                          {errors.type as any}
                        </HelperText>
                      )}
                    </View>

                    {/* Remember Me & Forgot Password Row */}
                    <View style={styles.optionsRow}>
                      <TouchableOpacity
                        style={styles.rememberMeContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                        activeOpacity={0.7}
                      >
                        <Checkbox.Android
                          status={rememberMe ? "checked" : "unchecked"}
                          onPress={() => setRememberMe(!rememberMe)}
                          color={theme.colors.primary}
                        />
                        <Text variant="bodyMedium" style={{ color: "#555" }}>
                          Remember me
                        </Text>
                      </TouchableOpacity>

                      {/* <TouchableOpacity
                        onPress={() => {
                          // Navigate to ForgotPassword or show modal
                          // navigation.navigate("ForgotPassword" as never);
                          console.log("Forgot Password Clicked");
                        }}
                      >
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.secondary }}
                        >
                          Forgot Password?
                        </Text>
                      </TouchableOpacity> */}
                    </View>

                    {/* API Error Display */}
                    {apiError ? (
                      <View style={styles.errorContainer}>
                        <HelperText
                          type="error"
                          visible={true}
                          style={styles.apiErrorText}
                        >
                          {apiError}
                        </HelperText>
                      </View>
                    ) : null}

                    {/* Submit Button */}
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      disabled={loading}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                      buttonColor={theme.colors.secondary}
                      // change bg color of button in sky blue
                      rippleColor={theme.colors.primary}

                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </View>
                )}
              </Formik>
            </Card.Content>
          </Card>

          {/* Footer / Sign Up Link */}
          <View style={styles.footerContainer}>
            <Text variant="bodyMedium" style={{ color: "#666" }}>
              Don't have an account?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate("SignupScreen" as never)}
              compact
              labelStyle={{ fontWeight: "bold" }}
            >
              Sign Up
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    color: "#666666",
    textAlign: "center",
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 6, // HelperText handles the spacing if error exists
  },
  input: {
    backgroundColor: "#fff",
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: "#e0e0e0",
  },
  roleContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  roleLabel: {
    marginBottom: 8,
    color: "#333",
    fontWeight: "600",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 6,
    borderRadius: 12,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  radioItemActive: {
    backgroundColor: "#fff",
    elevation: 1,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -6, // Align checkbox visually with input start
  },
  errorContainer: {
    marginBottom: 16,
    backgroundColor: "#ffebee",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ef9a9a",
  },
  apiErrorText: {
    fontSize: 13,
    textAlign: "center",
    color: "#c62828", // Darker red for text
  },
                        // change bg color of button in sky blue


  button: {
    borderRadius: 8,
    elevation: 2,
    marginTop: 4,
    backgroundColor: "#03a9f4",
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
});