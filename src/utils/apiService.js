import axios from "axios";
import { Alert } from "react-native";
import { storage } from "./storage";

/**
 * Asynchronously retrieves and parses authentication data from storage.
 * Handles parsing errors by clearing storage.
 * @returns {Promise<Object | null>} The parsed auth data or null.
 */
const getAuthData = async () => {
  try {
    const authDataString = await storage.getItem("SCM-AUTH");
    return authDataString ? JSON.parse(authDataString) : null;
  } catch (error) {
    console.error("Failed to parse auth data from storage:", error);
    await storage.removeItem("SCM-AUTH");
    return null;
  }
};

// Axios client configuration
const apiClient = axios.create({
  baseURL: "https://scm-production-8ceb.up.railway.app",
  headers: { "Content-Type": "application/json" },
});

// Axios request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const authData = await getAuthData();
    const token = authData?.accessToken;
    const userId = authData?.data?.id;
    const username = authData?.data?.userName;

    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (userId) {
      if (config.method === "post") {
        config.data = { ...config.data, createdBy: userId, updatedBy: userId };
      } else if (config.method === "put" || config.method === "patch") {
        config.data = { ...config.data, updatedBy: username };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// User detail helpers (async)
export const userDetails = {
  getUser: async () => (await getAuthData())?.data || null,
  getAccountId: async () => {
    const raw = await storage.getItem("SCM-AUTH");
    const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
    return accountId;
  },
  getPermissions: async () =>
    (await getAuthData())?.data?.role?.permissions || [],
  getUserType: async () => (await getAuthData())?.data?.type || "GUEST",
  isLoggedIn: async () => !!(await getAuthData())?.accessToken,
};

export const getUserSchoolClassDivision = async () => {
  const user = await userDetails.getUser();
  if (user?.type === "STUDENT") {
    return {
      schoolId: user.schoolId || null,
      classId: user.classId || null,
      divisionId: user.divisionId || null,
    };
  }
  return { schoolId: null, classId: null, divisionId: null };
};

// Axios response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Alert.alert("Session Expired", "Please log in again.", [
        {
          text: "OK",
          onPress: () => {
            console.log("Redirect to login logic here...");
          },
        },
      ]);
    }
    return Promise.reject(error);
  }
);

export const getTodayBirthdays = async () => {
  const accountId = await userDetails.getAccountId();
  const user = await userDetails.getUser();
  const schoolId = user?.schoolId;

  if (!accountId) {
    console.error("Account ID not available for fetching birthdays.");
    return [];
  }

  let url = `/api/users/birthdays/today/1`;
  if (schoolId) url += `?schoolId=${schoolId}`;

  try {
    const response = await apiClient.get(url);
    return response.data?.content || response.data || [];
  } catch (error) {
    console.error("Failed to fetch today's birthdays:", error);
    return [];
  }
};

export const getDocumentsByAccountAndUser = (accountId, userId) =>
  apiClient.get(`/api/documents/${accountId}/${userId}`);

export const downloadUserDocument = (accountId, userId, documentId) =>
  apiClient.get(
    `/api/documents/download/${accountId}/${userId}/${documentId}`,
    { responseType: "blob" }
  );

export const checkCourseEnrollmentStatus = async (
  accountId,
  courseId,
  studentId
) => {
  try {
    const response = await apiClient.get(
      `/api/lms/courses/${accountId}/${courseId}/enroll/${studentId}/status`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to check enrollment for course ${courseId}:`, error);
    return { enrolled: false };
  }
};

export const checkMultipleCourseEnrollments = async (
  accountId,
  courseIds,
  studentId
) => {
  try {
    const enrollmentChecks = courseIds.map((courseId) =>
      checkCourseEnrollmentStatus(accountId, courseId, studentId)
    );
    const results = await Promise.all(enrollmentChecks);
    return courseIds
      .map((courseId, index) => ({
        courseId,
        enrollmentStatus: results[index],
      }))
      .filter((result) => result.enrollmentStatus.enrolled);
  } catch (error) {
    console.error("Failed to check multiple course enrollments:", error);
    return [];
  }
};

export const api = apiClient;

export default apiClient;
