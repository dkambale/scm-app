import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar, RadioButton } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const loginSchema = Yup.object().shape({
  userName: Yup.string().required('User Name is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  accountId: Yup.string().required('Account ID is required'),
  type: Yup.mixed<'ADMIN' | 'TEACHER' | 'STUDENT'>().oneOf(['ADMIN', 'TEACHER', 'STUDENT']).required('User Type is required'),
});

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleLogin = async (values: { userName: string; password: string; accountId: string; type: 'ADMIN' | 'TEACHER' | 'STUDENT' }) => {
    setLoading(true);
    setError('');
    try {
      await login(values.userName, values.password, values.accountId, values.type);
    } catch (err) {
      setError('Invalid email or password');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            School Management
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Sign in to continue
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Formik
                initialValues={{ userName: '', password: '', accountId: '', type: 'ADMIN' as 'ADMIN' | 'TEACHER' | 'STUDENT' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View>
                    <TextInput
                      label="User Name"
                      value={values.userName}
                      onChangeText={handleChange('userName')}
                      onBlur={handleBlur('userName')}
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
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      secureTextEntry
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    <TextInput
                      label="Account ID"
                      value={values.accountId}
                      onChangeText={handleChange('accountId')}
                      onBlur={handleBlur('accountId')}
                      autoCapitalize="none"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.accountId && errors.accountId && (
                      <Text style={styles.errorText}>{errors.accountId}</Text>
                    )}

                    <View style={{ marginTop: 8, marginBottom: 8 }}>
                      <Text variant="bodyMedium" style={{ marginBottom: 8 }}>User Type</Text>
                      <RadioButton.Group
                        onValueChange={(value) => (handleChange('type')(value))}
                        value={values.type}
                      >
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="ADMIN" />
                            <Text>Admin</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="TEACHER" />
                            <Text>Teacher</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="STUDENT" />
                            <Text>Student</Text>
                          </View>
                        </View>
                      </RadioButton.Group>
                      {touched.type && errors.type && (
                        <Text style={styles.errorText}>{errors.type as any}</Text>
                      )}
                    </View>

                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      disabled={loading}
                      style={styles.button}
                    >
                      Sign In
                    </Button>
                  </View>
                )}
              </Formik>

            </Card.Content>
          </Card>
        </View>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  demoContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    color: '#666',
    marginBottom: 2,
  },
});
