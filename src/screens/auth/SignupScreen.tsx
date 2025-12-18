import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Card,
  HelperText,
  useTheme,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext";

const signupSchema = Yup.object().shape({
  userName: Yup.string().required("User Name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  address: Yup.string().required("Address is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9()+-\s]{7,20}$/, "Invalid phone number")
    .required("Phone number is required"),
});

interface SignupValues {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  phoneNumber: string;
}

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { login } = useAuth();
  
  // Logic States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Toggle Password Visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (values: SignupValues) => {
    setLoading(true);
    setApiError("");
    
    try {
      // 1. API call to register the user
      const payload = { ...values };
      const response = await apiService.signup(payload);
      
      // 2. Extract necessary data for automatic login
      const accountId = response.user?.accountId;
      const type = response.user?.type?.toUpperCase() as
        | "ADMIN"
        | "TEACHER"
        | "STUDENT";

      if (!accountId || !type) {
        throw new Error(
          "Registration succeeded but response is missing account details for auto-login."
        );
      }

      // 3. Automatically log in the user
      await login(values.userName, values.password, String(accountId), type);
      
      // Navigation is handled automatically by AuthContext state change
    } catch (err: any) {
      console.error("[Signup Error]", err.response?.data || err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your data and try again.";
      setApiError(errorMessage);
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
              Create your new account
            </Text>
          </View>

          {/* Main Form Card */}
          <Card style={[styles.card, { backgroundColor: "#ffffff" }]}>
            <Card.Content style={styles.cardContent}>
              <Formik
                initialValues={{
                  userName: "",
                  password: "",
                  firstName: "",
                  lastName: "",
                  address: "",
                  email: "",
                  phoneNumber: "",
                }}
                validationSchema={signupSchema}
                onSubmit={handleSignup}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View>
                    {/* First Name & Last Name Row */}
                    <View style={styles.row}>
                      <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                        <TextInput
                          label="First Name"
                          value={values.firstName}
                          onChangeText={handleChange("firstName")}
                          onBlur={handleBlur("firstName")}
                          autoCapitalize="words"
                          mode="outlined"
                          style={styles.input}
                          outlineStyle={styles.inputOutline}
                          error={touched.firstName && !!errors.firstName}
                        />
                        {touched.firstName && errors.firstName && (
                          <HelperText type="error" visible={true}>{errors.firstName}</HelperText>
                        )}
                      </View>
                      
                      <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                        <TextInput
                          label="Last Name"
                          value={values.lastName}
                          onChangeText={handleChange("lastName")}
                          onBlur={handleBlur("lastName")}
                          autoCapitalize="words"
                          mode="outlined"
                          style={styles.input}
                          outlineStyle={styles.inputOutline}
                          error={touched.lastName && !!errors.lastName}
                        />
                        {touched.lastName && errors.lastName && (
                          <HelperText type="error" visible={true}>{errors.lastName}</HelperText>
                        )}
                      </View>
                    </View>

                    {/* Username */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="User Name"
                        value={values.userName}
                        onChangeText={(text) => {
                          handleChange("userName")(text);
                          if (apiError) setApiError("");
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
                        <HelperText type="error" visible={true}>{errors.userName}</HelperText>
                      )}
                    </View>

                    {/* Password */}
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
                        <HelperText type="error" visible={true}>{errors.password}</HelperText>
                      )}
                    </View>

                    {/* Email */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="email" color="#9e9e9e" />}
                        error={touched.email && !!errors.email}
                      />
                      {touched.email && errors.email && (
                        <HelperText type="error" visible={true}>{errors.email}</HelperText>
                      )}
                    </View>

                    {/* Phone Number */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Phone Number"
                        value={values.phoneNumber}
                        onChangeText={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        keyboardType="phone-pad"
                        mode="outlined"
                        style={styles.input}
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="phone" color="#9e9e9e" />}
                        error={touched.phoneNumber && !!errors.phoneNumber}
                      />
                      {touched.phoneNumber && errors.phoneNumber && (
                        <HelperText type="error" visible={true}>{errors.phoneNumber}</HelperText>
                      )}
                    </View>

                    {/* Address */}
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Address"
                        value={values.address}
                        onChangeText={handleChange("address")}
                        onBlur={handleBlur("address")}
                        multiline={true}
                        numberOfLines={2}
                        mode="outlined"
                        style={[styles.input, { height: 80 }]} // Slightly taller for address
                        outlineStyle={styles.inputOutline}
                        left={<TextInput.Icon icon="map-marker" color="#9e9e9e" />}
                        error={touched.address && !!errors.address}
                      />
                      {touched.address && errors.address && (
                        <HelperText type="error" visible={true}>{errors.address}</HelperText>
                      )}
                    </View>

                    {/* API Error Display */}
                    {apiError ? (
                      <View style={styles.errorContainer}>
                        <HelperText type="error" visible={true} style={styles.apiErrorText}>
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
                      buttonColor={theme.colors.primary}
                    >
                      {loading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </View>
                )}
              </Formik>
            </Card.Content>
          </Card>

          {/* Footer / Login Link */}
          <View style={styles.footerContainer}>
            <Text variant="bodyMedium" style={{ color: "#666" }}>
              Already have an account?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate("LoginScreen" as never)}
              compact
              labelStyle={{ fontWeight: "bold" }}
            >
              Sign In
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: "#e0e0e0",
  },
  errorContainer: {
    marginBottom: 16,
    marginTop: 8,
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
    color: "#c62828",
  },
  button: {
    borderRadius: 8,
    elevation: 2,
    marginTop: 12,
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
    marginBottom: 20,
  },
});