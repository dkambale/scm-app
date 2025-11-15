import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, Card, Snackbar } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { apiService } from "../../api/apiService";
import { useAuth } from "../../context/AuthContext"; // ADDED: Import useAuth

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
  const { login } = useAuth(); // ADDED: Get login function from AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (values: SignupValues) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // 1. API call to register the user
      // ensure payload contains email and phoneNumber
      const payload = {
        ...values,
      };
      const response = await apiService.signup(payload);

      // 2. Extract necessary data for automatic login from the successful signup response
      const accountId = response.user?.accountId;
      // API returns 'Admin', 'Teacher', or 'Student', but login function expects uppercase 'ADMIN', 'TEACHER', 'STUDENT'
      const type = response.user?.type?.toUpperCase() as
        | "ADMIN"
        | "TEACHER"
        | "STUDENT";

      if (!accountId || !type) {
        throw new Error(
          "Registration succeeded but response is missing account or user type for auto-login."
        );
      }

      // 3. Automatically log in the user, saving credentials and user details in AuthContext/storage.
      // This state change handles the redirection to the main app (DrawerHost).
      await login(values.userName, values.password, String(accountId), type);

      setSuccess(true);
      setError("Registration successful and signed in!");
      setShowSnackbar(true);

      // NOTE: No manual navigation/timeout needed here. The change in authentication state
      // in AuthContext automatically triggers navigation in RootNavigation.
    } catch (err: any) {
      console.error("[Signup Error]", err.response?.data || err);
      // Adjusted error message handling based on typical API response structure
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your data and try again.";
      setError(errorMessage);
      setSuccess(false);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            KoolERP
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Create your new account
          </Text>

          <Card style={styles.card}>
            <Card.Content>
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
                    <TextInput
                      label="User Name"
                      value={values.userName}
                      onChangeText={handleChange("userName")}
                      onBlur={handleBlur("userName")}
                      autoCapitalize="none"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.userName && errors.userName && (
                      <Text style={styles.errorText}>{errors.userName}</Text>
                    )}

                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      secureTextEntry
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    <TextInput
                      label="First Name"
                      value={values.firstName}
                      onChangeText={handleChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      autoCapitalize="words"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.firstName && errors.firstName && (
                      <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}

                    <TextInput
                      label="Last Name"
                      value={values.lastName}
                      onChangeText={handleChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      autoCapitalize="words"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.lastName && errors.lastName && (
                      <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}

                    <TextInput
                      label="Address"
                      value={values.address}
                      onChangeText={handleChange("address")}
                      onBlur={handleBlur("address")}
                      multiline={true}
                      numberOfLines={3}
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.address && errors.address && (
                      <Text style={styles.errorText}>{errors.address}</Text>
                    )}

                    <TextInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    <TextInput
                      label="Phone Number"
                      value={values.phoneNumber}
                      onChangeText={handleChange("phoneNumber")}
                      onBlur={handleBlur("phoneNumber")}
                      keyboardType="phone-pad"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.phoneNumber && errors.phoneNumber && (
                      <Text style={styles.errorText}>
                        {errors.phoneNumber as any}
                      </Text>
                    )}

                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      disabled={loading}
                      style={styles.button}
                    >
                      Sign Up
                    </Button>
                  </View>
                )}
              </Formik>
            </Card.Content>
          </Card>

          <View style={styles.footerNav}>
            <Text variant="bodyMedium" style={styles.footerText}>
              Already have an account?
            </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate("LoginScreen" as never)}
              compact
              labelStyle={styles.textButtonLabel}
            >
              Sign In
            </Button>
          </View>
        </View>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
          style={{ backgroundColor: success ? "#4CAF50" : "#F44336" }}
        >
          {error}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
    color: "#6200ee",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#666",
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  footerText: {
    color: "#0A0A0A",
    fontSize: 14,
    marginRight: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  footerNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  textButtonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
