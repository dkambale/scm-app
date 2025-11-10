import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import entityRegistry from "./entityRegistry";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import LanguageSelector from "../components/common/LanguageSelector";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  useHasPermission,
  permFrom,
  makeProtectedScreen,
} from "./permissionUtils";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableViewComponent from "../screens/admin/timetables/TimetableView";
import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator();

  // Build top-level drawer entries directly from the entity registry.
  // For each supported entity we call the permission hook explicitly
  // (to respect the Rules of Hooks) and then show only those entries
  // for which the user has a 'view' permission.
  const canViewSTUDENT = useHasPermission({
    entity: "STUDENT",
    action: "view",
  });
  const canViewTEACHER = useHasPermission({
    entity: "TEACHER",
    action: "view",
  });
  const canViewCLASS = useHasPermission({ entity: "CLASS", action: "view" });
  const canViewTIMETABLE = useHasPermission({
    entity: "TIMETABLE",
    action: "view",
  });
  const canViewASSIGNMENT = useHasPermission({
    entity: "ASSIGNMENT",
    action: "view",
  });
  const canViewATTENDANCE = useHasPermission({
    entity: "ATTENDANCE",
    action: "view",
  });
  const canViewFEE = useHasPermission({ entity: "FEE", action: "view" });
  const canViewFEE_MANAGEMENT = useHasPermission({
    entity: "FEE_MANAGEMENT",
    action: "view",
  });
  const canViewANNOUNCEMENT = useHasPermission({
    entity: "ANNOUNCEMENT",
    action: "view",
  });
  const canViewPROFILE = useHasPermission({
    entity: "USER_PROFILE",
    action: "view",
  });

  const visibleEntries = [] as { id: string; component: any }[];
  if (canViewSTUDENT) visibleEntries.push(entityRegistry.STUDENT);
  if (canViewTEACHER) visibleEntries.push(entityRegistry.TEACHER);
  if (canViewCLASS) visibleEntries.push(entityRegistry.CLASS);
  if (canViewTIMETABLE) visibleEntries.push(entityRegistry.TIMETABLE);
  if (canViewASSIGNMENT) visibleEntries.push(entityRegistry.ASSIGNMENT);
  if (canViewATTENDANCE) visibleEntries.push(entityRegistry.ATTENDANCE);
  if (canViewFEE) visibleEntries.push(entityRegistry.FEE);
  if (canViewFEE_MANAGEMENT) visibleEntries.push(entityRegistry.FEE_MANAGEMENT);
  if (canViewANNOUNCEMENT) visibleEntries.push(entityRegistry.ANNOUNCEMENT);
  if (canViewPROFILE) visibleEntries.push(entityRegistry.PROFILE);

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
  console.log("User Role:", user.role);

  const DrawerHost: React.FC = () => (
    <>
      <LanguageSelector />
      <Drawer.Navigator
        initialRouteName={
          visibleEntries.length ? visibleEntries[0].id : undefined
        }
      >
        {visibleEntries.map((entry: { id: string; component: any }) => (
          <Drawer.Screen
            key={entry.id}
            name={entry.id}
            component={entry.component}
          />
        ))}
      </Drawer.Navigator>
    </>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainDrawer" component={DrawerHost} />

        {/* Global hidden screens (Add/Edit/View) so navigation.navigate(...) always resolves */}
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
