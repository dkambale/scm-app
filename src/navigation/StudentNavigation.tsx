import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  makeProtectedScreen,
  permFrom,
  useHasPermission,
} from "./permissionUtils";
import { StudentDashboardScreen } from "../screens/student/StudentDashboardScreen";
import { FeesScreen } from "../screens/student/FeesScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";
import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableViewComponent from "../screens/admin/timetables/TimetableView";

const Tab = createBottomTabNavigator();

export const StudentNavigation: React.FC = () => {
  const canViewDashboard = useHasPermission(permFrom("STUDENT", "view"));
  const canViewTimetable = useHasPermission(permFrom("TIMETABLE", "view"));
  const canViewFees = useHasPermission(permFrom("FEE", "view"));
  const canViewProfile = useHasPermission(permFrom("ROLE", "view"));

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#6200ee",
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      {/* Hidden screens so navigation.navigate('AddStudent') works for students too */}
      <Tab.Screen
        name="AddStudent"
        component={makeProtectedScreen(
          AddEditStudent,
          permFrom("STUDENT", "add")
        )}
        options={{ tabBarButton: () => null, title: "Add Student" }}
      />
      <Tab.Screen
        name="EditStudent"
        component={makeProtectedScreen(
          AddEditStudent,
          permFrom("STUDENT", "edit")
        )}
        options={{ tabBarButton: () => null, title: "Edit Student" }}
      />
      <Tab.Screen
        name="StudentView"
        component={({ route }: any) => {
          const id = route?.params?.id ?? "";
          return <StudentViewComponent id={String(id)} />;
        }}
        options={{ tabBarButton: () => null, title: "View Student" }}
      />

      {/* Timetable hidden routes */}
      <Tab.Screen
        name="AddEditTimetable"
        component={makeProtectedScreen(
          AddEditTimetable,
          permFrom("TIMETABLE", "add")
        )}
        options={{ tabBarButton: () => null, title: "Add/Edit Timetable" }}
      />
      <Tab.Screen
        name="TimetableView"
        component={({ route }: any) => {
          const id = route?.params?.id ?? "";
          return <TimetableViewComponent id={String(id)} />;
        }}
        options={{ tabBarButton: () => null, title: "View Timetable" }}
      />
      {canViewDashboard && (
        <Tab.Screen
          name="Dashboard"
          component={makeProtectedScreen(
            StudentDashboardScreen,
            permFrom("STUDENT", "view")
          )}
          options={{
            tabBarIcon: ({ color }) => <span>📊</span>,
            tabBarLabel: "Home",
          }}
        />
      )}

      {canViewTimetable && (
        <Tab.Screen
          name="Timetable"
          component={makeProtectedScreen(
            (global as any).TimetableScreen ||
              (global as any).Timetable ||
              (global as any).TimetablesScreen,
            permFrom("TIMETABLE", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>📅</span> }}
        />
      )}

      {canViewFees && (
        <Tab.Screen
          name="Fees"
          component={makeProtectedScreen(FeesScreen, permFrom("FEE", "view"))}
          options={{ tabBarIcon: ({ color }) => <span>💰</span> }}
        />
      )}

      {canViewProfile && (
        <Tab.Screen
          name="Profile"
          component={makeProtectedScreen(
            ProfileScreen,
            permFrom("ROLE", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>👤</span> }}
        />
      )}
    </Tab.Navigator>
  );
};
