import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { StudentsScreen } from "../screens/admin/StudentsScreen";
import { TeachersScreen } from "../screens/admin/TeachersScreen";
import { ClassesScreen } from "../screens/admin/ClassesScreen";
import { FeesScreen } from "../screens/admin/FeesScreen";
import { AnnouncementsScreen } from "../screens/common/AnnouncementsScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";

import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import StudentViewComponent from "../screens/admin/students/StudentView";

import { AssignmentsScreen } from "../screens/admin/AssignmentsScreen";
import EditAssignmentScreen from "../screens/admin/assignments/EditAssignment";
import AddAssignmentScreen from "../screens/admin/assignments/AddAssignment";

import { AttendancesScreen } from "../screens/admin/AttendancesScreen";
import AttendanceEditScreen from "../screens/admin/attendance/AddAttendance";

import { TimetablesScreen } from "../screens/admin/TimetablesScreen";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableViewComponent from "../screens/admin/timetables/TimetableView";

import { IconButton, Dialog, Portal, Button } from "react-native-paper";
import i18n from "../../i18n";
import { Text, View } from "react-native";
import {
  makeProtectedScreen,
  permFrom,
  useHasPermission,
} from "./permissionUtils";

const Drawer = createDrawerNavigator();

export function AdminNavigation() {
  const LanguageDrawerLabel: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const languages = [
      { code: "en", label: "English" },
      { code: "mr", label: "मराठी" },
      { code: "hi", label: "हिन्दी" },
      { code: "sp", label: "Español" },
      { code: "fr", label: "Français" },
    ];
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ marginRight: 8 }}>Classes</Text>
        <IconButton
          icon="translate"
          size={20}
          onPress={() => setVisible(true)}
        />
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Change language</Dialog.Title>
            <Dialog.Content>
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  mode={i18n.language === lang.code ? "contained" : "text"}
                  onPress={() => {
                    i18n.changeLanguage(lang.code);
                    setVisible(false);
                  }}
                  style={{ marginBottom: 6 }}
                >
                  {lang.label}
                </Button>
              ))}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  };
  // permission checks (used to hide/show drawer items)
  const canViewStudents = useHasPermission(permFrom("STUDENT", "view"));
  const canViewTeachers = useHasPermission(permFrom("TEACHER", "view"));
  const canViewTimetables = useHasPermission(permFrom("TIMETABLE", "view"));
  return (
    <Drawer.Navigator initialRouteName="Dashboard">
      <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} />
      {canViewStudents && (
        <Drawer.Screen
          name="Students"
          component={makeProtectedScreen(
            StudentsScreen,
            permFrom("STUDENT", "view")
          )}
        />
      )}
      {canViewTeachers && (
        <Drawer.Screen
          name="Teachers"
          component={makeProtectedScreen(
            TeachersScreen,
            permFrom("TEACHER", "view")
          )}
        />
      )}
      <Drawer.Screen
        name="Classes"
        component={ClassesScreen}
        options={{ drawerLabel: () => <LanguageDrawerLabel /> }}
      />
      <Drawer.Screen name="Fees" component={FeesScreen} />
      <Drawer.Screen name="Assignments" component={AssignmentsScreen} />
      <Drawer.Screen name="Attendance" component={AttendancesScreen} />
      <Drawer.Screen name="Announcements" component={AnnouncementsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />

      {canViewTimetables && (
        <Drawer.Screen
          name="Timetables"
          component={makeProtectedScreen(
            TimetablesScreen,
            permFrom("TIMETABLE", "view")
          )}
        />
      )}

      {/* Always register Add/Edit/View routes for timetables but keep them hidden from the drawer
          so navigation to them never fails even if the user doesn't have the drawer entry. The
          visible buttons (FAB / menu) are still gated by permission in the grid. */}
      <Drawer.Screen
        name="AddEditTimetable"
        component={makeProtectedScreen(
          AddEditTimetable,
          permFrom("TIMETABLE", "add")
        )}
        options={{ drawerLabel: () => null, title: "Add/Edit Timetable" }}
      />

      {/* Wrapper for Timetable view route (hidden) */}
      {(() => {
        const TimetableViewScreen = ({ route }: any) => {
          const id = route?.params?.id ?? route?.params?.timetableId ?? "";
          return <TimetableViewComponent id={String(id)} />;
        };
        return (
          <Drawer.Screen
            name="TimetableView"
            component={TimetableViewScreen}
            options={{ drawerLabel: () => null, title: "View Timetable" }}
          />
        );
      })()}
      {/* Student Add/Edit Screens */}
      <Drawer.Screen
        name="AddStudent"
        component={AddEditStudent}
        options={{ drawerLabel: () => null, title: "Add Student" }} // Hide from drawer
      />
      <Drawer.Screen
        name="EditStudent"
        component={AddEditStudent}
        options={{ drawerLabel: () => null, title: "Edit Student" }} // Hide from drawer
      />

      {/* Student View Screen (hidden from drawer) */}
      {/* Wrapper converts navigation route params into the StudentView props */}
      {(() => {
        const StudentViewScreen = ({ route }: any) => {
          const id = route?.params?.id ?? route?.params?.studentId ?? "";
          return <StudentViewComponent id={String(id)} />;
        };
        return (
          <Drawer.Screen
            name="StudentView"
            component={StudentViewScreen}
            options={{ drawerLabel: () => null, title: "View Student" }}
          />
        );
      })()}

      {/* Teacher Add/Edit Screens */}
      <Drawer.Screen
        name="AddTeacher"
        component={AddEditTeacher}
        options={{ drawerLabel: () => null, title: "Add Teacher" }} // Hide from drawer
      />
      <Drawer.Screen
        name="EditTeacher"
        component={AddEditTeacher}
        options={{ drawerLabel: () => null, title: "Edit Teacher" }} // Hide from drawer
      />

      {/* Assignment Edit Screen */}
      <Drawer.Screen
        name="EditAssignment"
        component={EditAssignmentScreen}
        options={{ drawerLabel: () => null, title: "Edit Assignment" }} // Hide from drawer
      />
      <Drawer.Screen
        name="AddAssignment"
        component={AddAssignmentScreen}
        options={{ drawerLabel: () => null, title: "Add Assignment" }} // Hide from drawerLabel
      />
      {/* Attendance Edit Screen */}
      <Drawer.Screen
        name="AddAttendance"
        component={AttendanceEditScreen}
        options={{ drawerLabel: () => null, title: "Add Attendance" }} // Hide from drawerLabel
      />
      <Drawer.Screen
        name="EditAttendance"
        component={AttendanceEditScreen}
        options={{ drawerLabel: () => null, title: "Edit Attendance" }} // Hide from drawerLabel
      />
    </Drawer.Navigator>
  );
}
