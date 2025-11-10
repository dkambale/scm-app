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
import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableViewComponent from "../screens/admin/timetables/TimetableView";

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
      {/* Hidden screens so navigation.navigate('AddStudent') works for teachers */}
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

      {/* Teacher add/edit hidden routes */}
      <Tab.Screen
        name="AddTeacher"
        component={makeProtectedScreen(
          AddEditTeacher,
          permFrom("TEACHER", "add")
        )}
        options={{ tabBarButton: () => null, title: "Add Teacher" }}
      />
      <Tab.Screen
        name="EditTeacher"
        component={makeProtectedScreen(
          AddEditTeacher,
          permFrom("TEACHER", "edit")
        )}
        options={{ tabBarButton: () => null, title: "Edit Teacher" }}
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
