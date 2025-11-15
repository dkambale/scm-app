import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import entityRegistry from "./entityRegistry";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import LanguageSelector from "../components/common/LanguageSelector";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import {
  useHasPermission,
  permFrom,
  makeProtectedScreen,
} from "./permissionUtils";
import NotificationDrawerItem from "../components/common/NotificationDrawerItem";
import { AttendanceEdit } from "../screens/admin/attendance/AddAttendance";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddEditTimetable from "../screens/admin/timetables/AddEditTimetable";
import TimetableView from "../screens/admin/timetables/TimetableView";

import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";

import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SignupScreen } from "../screens/auth/SignupScreen";
import NotificationScreen from "../components/common/NotificationScreen";

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: "#0A0A0A",
    fontWeight: "700",
    fontSize: 18,
  },
  name: {
    color: "#0A0A0A",
    fontWeight: "700",
    fontSize: 16,
  },
  role: {
    color: "#6b6b6b",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
  },
  listContainer: {
    paddingHorizontal: 6,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 6,
  },
  entryInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#f2f8fb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  entryTouchable: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  entryLabel: {
    color: "#0A0A0A",
    fontSize: 15,
    fontWeight: "600",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#0A0A0A",
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "700",
  },
  addButtonPlaceholder: {
    width: 36,
    height: 36,
  },
  listContent: {
    paddingHorizontal: 6,
    paddingBottom: 24,
  },
});

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator();

  // Build top-level drawer entries directly from the entity registry.
  // Show the appropriate dashboard depending on the authenticated user's type.
  // (User is present here because we returned earlier when !user.)
  const userType = ((user as any)?.type || (user as any)?.role || "")
    .toString()
    .toUpperCase();
  const canViewTEACHER_DASHBOARD =
    userType === "ADMIN" || userType === "TEACHER";
  const canViewSTUDENT_DASHBOARD = userType === "STUDENT";
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
  const canViewFEE_MANAGEMENT = useHasPermission({
    entity: "FEE_MANAGEMENT",
    action: "view",
  });
  const canViewPROFILE = useHasPermission({
    entity: "USER_PROFILE",
    action: "view",
  });
  const canViewEXAM = useHasPermission({
    entity: "EXAM",
    action: "view",
  });
  const visibleEntries = [] as { id: string; title?: string; component: any }[];
  if (canViewTEACHER_DASHBOARD)
    visibleEntries.push(entityRegistry.TEACHER_DASHBOARD);
  if (canViewSTUDENT_DASHBOARD)
    visibleEntries.push(entityRegistry.STUDENT_DASHBOARD);

  if (canViewSTUDENT) visibleEntries.push(entityRegistry.STUDENT);
  if (canViewTEACHER) visibleEntries.push(entityRegistry.TEACHER);
  // if (canViewCLASS) visibleEntries.push(entityRegistry.CLASS);
  if (canViewTIMETABLE) visibleEntries.push(entityRegistry.TIMETABLE);
  if (canViewASSIGNMENT) visibleEntries.push(entityRegistry.ASSIGNMENT);
  if (canViewATTENDANCE) visibleEntries.push(entityRegistry.ATTENDANCE);
  // if (canViewFEE) visibleEntries.push(entityRegistry.FEE);
  // if (canViewFEE_MANAGEMENT) visibleEntries.push(entityRegistry.FEE_MANAGEMENT);
  if (canViewFEE_MANAGEMENT) visibleEntries.push(entityRegistry.MYFEE);

  // if (canViewANNOUNCEMENT) visibleEntries.push(entityRegistry.ANNOUNCEMENT);
  if (canViewEXAM) visibleEntries.push(entityRegistry.EXAM);
  if (canViewPROFILE) visibleEntries.push(entityRegistry.PROFILE);
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    const AuthStack = createNativeStackNavigator();
    const AuthHost: React.FC = () => (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Added route for LoginScreen */}
        <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
        {/* Added route for SignupScreen */}
        <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
      </AuthStack.Navigator>
    );

    return (
      <NavigationContainer>
        <AuthHost />
      </NavigationContainer>
    );
  }
  console.log("User Role:", user.role);

  const DrawerHost: React.FC = () => (
    <Drawer.Navigator
      initialRouteName={
        visibleEntries.length ? visibleEntries[0].id : undefined
      }
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {visibleEntries.map((entry: { id: string; component: any }) => (
        <Drawer.Screen
          key={entry.id}
          name={entry.id}
          component={entry.component}
        />
      ))}
    </Drawer.Navigator>
  );

  // Map some common entity ids to their Add-route names. Only entities listed here
  // will get the little + (add) button in the sidebar.
  const addRouteMap: Record<string, string> = {
    STUDENT: "AddStudent",
    TEACHER: "AddTeacher",
    TIMETABLE: "AddEditTimetable",
    ATTENDANCE: "AddAttendance",
  };

  function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { navigation } = props;

    // Hook-based permission checks for Add buttons
    const canAddStudent = useHasPermission({
      entity: "STUDENT",
      action: "add",
    });
    const canAddTeacher = useHasPermission({
      entity: "TEACHER",
      action: "add",
    });
    const canAddTimetable = useHasPermission({
      entity: "TIMETABLE",
      action: "add",
    });
    const canAddAttendance = useHasPermission({
      entity: "ATTENDANCE",
      action: "add",
    });

    const addPermMap: Record<string, boolean> = {
      STUDENT: Boolean(canAddStudent),
      TEACHER: Boolean(canAddTeacher),
      TIMETABLE: Boolean(canAddTimetable),
      ATTENDANCE: Boolean(canAddAttendance),
    };

    // Friendly display name for the profile card — try several common fields on user
    const displayName: string = ((user as any)?.name ||
      (user as any)?.firstName ||
      (user as any)?.username ||
      user?.role ||
      "User") as string;
    const notificationUnreadCount = 5;
    return (
      <View style={styles.drawerContainer}>
        <LanguageSelector />
        <View style={{ marginBottom: 12 }}>
          <NotificationDrawerItem unreadCount={notificationUnreadCount} />
        </View>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLabel}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.role}>{(user as any)?.role ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.listContent}
        >
          {visibleEntries.map((entry) => {
            const showAdd = Boolean(
              addRouteMap[entry.id] && addPermMap[entry.id]
            );
            const iconMap: Record<string, string> = {
              STUDENT: "👩‍🎓",
              TEACHER: "👨‍🏫",
              CLASS: "🏫",
              TIMETABLE: "📅",
              ATTENDANCE: "📝",
              FEE: "💰",
              ANNOUNCEMENT: "📢",
              EXAM: "🧾",
              PROFILE: "👤",
              TEACHER_DASHBOARD: "📊",
              STUDENT_DASHBOARD: "🎓",
            };
            const entryIcon = iconMap[entry.id] ?? "•";

            return (
              <View style={styles.entryRow} key={entry.id}>
                <TouchableOpacity
                  style={styles.entryTouchable}
                  onPress={() => navigation.navigate(entry.id)}
                >
                  <View style={styles.entryInner}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconText}>{entryIcon}</Text>
                    </View>
                    <Text style={styles.entryLabel}>
                      {entry.title ?? entry.id}
                    </Text>
                  </View>
                </TouchableOpacity>

                {showAdd ? (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate(addRouteMap[entry.id])}
                  >
                    <Text style={styles.addButtonText}>+</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.addButtonPlaceholder} />
                )}
              </View>
            );
          })}
        </DrawerContentScrollView>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainDrawer" component={DrawerHost} />

        {/* Global hidden screens (Add/Edit/View) so navigation.navigate(...) always resolves */}
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{ title: "Notifications", headerShown: true }}
        />
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
            return <TimetableView id={String(id)} />;
          }}
        />
        {/* Backward-compatible alias used in some parts of the app */}
        <Stack.Screen
          name="ViewTimetable"
          component={({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.timetableId ?? "";
            return <TimetableView id={String(id)} />;
          }}
        />
        <Stack.Screen
          name="AddAttendance"
          component={makeProtectedScreen(
            AttendanceEdit,
            permFrom("ATTENDANCE", "add")
          )}
        />
        <Stack.Screen
          name="EditAttendance"
          component={makeProtectedScreen(
            AttendanceEdit,
            permFrom("ATTENDANCE", "edit")
          )}
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

        <Stack.Screen
          name="EditAssignment"
          component={makeProtectedScreen(
            AttendanceEdit,
            permFrom("ASSIGNMENT", "edit")
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
