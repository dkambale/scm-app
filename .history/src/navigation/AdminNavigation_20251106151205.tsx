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

import { AssignmentsScreen } from "../screens/admin/AssignmentsScreen";
import EditAssignmentScreen from "../screens/admin/assignments/EditAssignment";
import AddAssignmentScreen from "../screens/admin/assignments/AddAssignment";

import { AttendancesScreen } from "../screens/admin/AttendancesScreen";
import AttendanceEditScreen from "../screens/admin/attendance/AddAttendance";

// import {}
import {  } from "react-native-paper";
import {  } from "react-native";

const Drawer = createDrawerNavigator();

export function AdminNavigation() {
  // LanguageDrawerLabel removed; language selector moved to RootNavigation (LanguageSelector)
  return (
    <Drawer.Navigator initialRouteName="Dashboard">
      <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="Students" component={StudentsScreen} />
      <Drawer.Screen name="Teachers" component={TeachersScreen} />
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
