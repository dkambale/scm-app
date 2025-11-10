import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  makeProtectedScreen,
  permFrom,
  useHasPermission,
} from "./permissionUtils";
import { TeacherDashboardScreen } from "../screens/teacher/TeacherDashboardScreen";
import { AssignmentsScreen } from "../screens/common/AssignmentsScreen";
import { AttendanceScreen } from "../screens/common/AttendanceScreen";
import { AnnouncementsScreen } from "../screens/common/AnnouncementsScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";

const Tab = createBottomTabNavigator();

export const TeacherNavigation: React.FC = () => {
  const canViewDashboard = useHasPermission(permFrom("TEACHER", "view"));
  const canViewAttendance = useHasPermission(permFrom("ATTENDANCE", "view"));
  const canViewAssignments = useHasPermission(permFrom("ASSIGNMENT", "view"));
  const canViewAnnouncements = useHasPermission(
    permFrom("ANNOUNCEMENT", "view")
  );
  const canViewProfile = useHasPermission(permFrom("ROLE", "view"));
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200ee",
        },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#6200ee",
      }}
    >
      {canViewDashboard && (
        <Tab.Screen
          name="Dashboard"
          component={makeProtectedScreen(
            TeacherDashboardScreen,
            permFrom("TEACHER", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>📊</span> }}
        />
      )}

      {canViewAttendance && (
        <Tab.Screen
          name="Attendance"
          component={makeProtectedScreen(
            AttendanceScreen,
            permFrom("ATTENDANCE", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>📅</span> }}
        />
      )}

      {canViewAssignments && (
        <Tab.Screen
          name="Assignments"
          component={makeProtectedScreen(
            AssignmentsScreen,
            permFrom("ASSIGNMENT", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>📚</span> }}
        />
      )}

      {canViewAnnouncements && (
        <Tab.Screen
          name="Announcements"
          component={makeProtectedScreen(
            AnnouncementsScreen,
            permFrom("ANNOUNCEMENT", "view")
          )}
          options={{ tabBarIcon: ({ color }) => <span>📢</span> }}
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
