import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { AdminNavigation } from "./AdminNavigation";
import { TeacherNavigation } from "./TeacherNavigation";
import { StudentNavigation } from "./StudentNavigation";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  // The AuthContext stores the user's `type` as 'ADMIN' | 'TEACHER' | 'STUDENT'.
  // Map that to the lowercase roles expected by the existing navigations.
  const userType =
    (user as any).type || (user as any).roleName || (user as any).role;
  const normalized = String(userType).toUpperCase();
  console.log("User type for navigation:", normalized);
  console.log("Full user object:", user);
  // console.log("user type ")
  return (
    <NavigationContainer>
      {normalized === "ADMIN" && <AdminNavigation />}
      {normalized === "TEACHER" && <TeacherNavigation />}
      {normalized === "STUDENT" && <StudentNavigation />}
    </NavigationContainer>
  );
};
