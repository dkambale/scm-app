import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { AdminNavigation } from "./AdminNavigation";
import { TeacherNavigation } from "./TeacherNavigation";
import { StudentNavigation } from "./StudentNavigation";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableViewComponent from "../screens/admin/timetables/TimetableView";
import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import { makeProtectedScreen, permFrom } from "./permissionUtils";

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  const Stack = createNativeStackNavigator();

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
  const userType =
    (user as any).type || (user as any).roleName || (user as any).role;
  const normalized = String(userType).toUpperCase();

  // MainNavigator renders the role-specific navigator inside a Stack so we can
  // register global hidden screens (Add/Edit/View) at the root Stack level. This
  // ensures navigation.navigate('AddEditTimetable') is always handled.
  // const MainNavigator: React.FC = () => {
  //   if (normalized === "ADMIN") return <AdminNavigation />;
  //   if (normalized === "TEACHER") return <TeacherNavigation />;
  //   return <StudentNavigation />;
  // };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="Main" component={MainNavigator} /> */}

        {/* Global hidden screens so navigation.navigate works from any nested navigator */}
        <Stack.Screen
          name="AddEditTimetable"
          component={makeProtectedScreen(
            AddEditTimetable,
            permFrom("TIMETABLE", "add")
          )}
        />
        <Stack.Screen
          name="TimetableView"
          component={({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.timetableId ?? "";
            return <TimetableViewComponent id={String(id)} />;
          }}
        />

        <Stack.Screen
          name="AddStudent"
          component={makeProtectedScreen(
            AddEditStudent,
            permFrom("STUDENT", "add")
          )}
        />
        <Stack.Screen
          name="EditStudent"
          component={makeProtectedScreen(
            AddEditStudent,
            permFrom("STUDENT", "edit")
          )}
        />
        <Stack.Screen
          name="StudentView"
          component={({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.studentId ?? "";
            return <StudentViewComponent id={String(id)} />;
          }}
        />

        <Stack.Screen
          name="AddTeacher"
          component={makeProtectedScreen(
            AddEditTeacher,
            permFrom("TEACHER", "add")
          )}
        />
        <Stack.Screen
          name="EditTeacher"
          component={makeProtectedScreen(
            AddEditTeacher,
            permFrom("TEACHER", "edit")
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
