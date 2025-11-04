import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { StudentsScreen } from "../screens/admin/StudentsScreen";
import { TeachersScreen } from "../screens/admin/TeachersScreen";
import { ClassesScreen } from "../screens/admin/ClassesScreen";
import { FeesScreen } from "../screens/admin/FeesScreen";
import { AssignmentsScreen } from "../screens/common/AssignmentsScreen";
import { AttendanceScreen } from "../screens/common/AttendanceScreen";
import { AnnouncementsScreen } from "../screens/common/AnnouncementsScreen";
import { ProfileScreen } from "../screens/common/ProfileScreen";
import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import { IconButton, Dialog, Portal, Button } from "react-native-paper";
import i18n from "../../i18n";
import { Text, View } from "react-native";

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
      <Drawer.Screen name="Attendance" component={AttendanceScreen} />
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
    </Drawer.Navigator>
  );
}
