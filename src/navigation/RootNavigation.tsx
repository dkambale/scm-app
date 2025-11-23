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
import StudentExamResult from "../screens/admin/exam/StudentExamResult";
import TeacherExamView from "../screens/admin/exam/TeacherExamView";

import { AddEditStudent } from "../screens/admin/students/AddEditStudent";
import StudentViewComponent from "../screens/admin/students/StudentView";

import AddEditDivision from "../screens/admin/divisions/AddEditDivision";
import AddEditInstitute from "../screens/admin/institutes/AddEditInstitute";
import AddEditSchool from "../screens/admin/schools/AddEditSchool";
import AddEditClasses from "../screens/admin/classes/AddEditClasses";
import AddEditSubject from "../screens/admin/subjects/AddEditSubject";
import { AddEditTeacher } from "../screens/admin/teachers/AddEditTeacher";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { SignupScreen } from "../screens/auth/SignupScreen";
import NotificationScreen from "../components/common/NotificationScreen";
import AddEditRole from "../screens/admin/roles/AddEditRole";

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
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6200ee",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 20,
  },
  name: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
  },
  role: {
    color: "#666",
    fontSize: 12,
    fontWeight: "500",
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
    marginHorizontal: 12,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  entryInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f7fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  entryTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  entryLabel: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e8f0fe",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#1976d2",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "600",
    marginTop: -2,
  },
  addButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 20,
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();

  const Drawer = createDrawerNavigator();
  const Stack = createNativeStackNavigator();

  // Permission Checks
  const userType = ((user as any)?.type || (user as any)?.role || "")
    .toString()
    .toUpperCase();
  const canViewTEACHER_DASHBOARD =
    userType === "ADMIN" || userType === "TEACHER";
  const canViewSTUDENT_DASHBOARD = userType === "STUDENT";
  const canViewinstitute = useHasPermission({
    entity: "institute",
    action: "view",
  });
  const canViewSCHOOL = useHasPermission({
    entity: "SCHOOL",
    action: "view",
  });
  const canViewCLASSES = useHasPermission({
    entity: "CLASS",
    action: "view",
  });
  const canViewDIVISION = useHasPermission({
    entity: "DIVISION",
    action: "view",
  });
  const canViewSUBJECT = useHasPermission({
    entity: "SUBJECT",
    action: "view",
  });
  const canViewSTUDENT = useHasPermission({
    entity: "STUDENT",
    action: "view",
  });
  const canViewTEACHER = useHasPermission({
    entity: "TEACHER",
    action: "view",
  });
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
  const canViewROLE = useHasPermission({
    entity: "ROLE",
    action: "view",
  });
  const canViewEXAM_TEACHER_VIEW = useHasPermission({
    entity: "EXAM_TEACHER_VIEW",
    action: "view",
  });

  const visibleEntries = [] as {
    id: string;
    title?: string;
    component: any;
    icon?: string;
  }[];

  if (canViewTEACHER_DASHBOARD)
    visibleEntries.push(entityRegistry.TEACHER_DASHBOARD);
  if (canViewSTUDENT_DASHBOARD)
    visibleEntries.push(entityRegistry.STUDENT_DASHBOARD);
  if (canViewinstitute) visibleEntries.push(entityRegistry.INSTITUTE);
  if (canViewSCHOOL) visibleEntries.push(entityRegistry.SCHOOL);
  if (canViewCLASSES) visibleEntries.push(entityRegistry.CLASSES);
  if (canViewDIVISION) visibleEntries.push(entityRegistry.DIVISION);
  if (canViewSUBJECT) visibleEntries.push(entityRegistry.SUBJECT);
  if (canViewROLE) visibleEntries.push(entityRegistry.ROLE);
  if (canViewSTUDENT) visibleEntries.push(entityRegistry.STUDENT);

  if (canViewTEACHER) visibleEntries.push(entityRegistry.TEACHER);
  if (canViewTIMETABLE) visibleEntries.push(entityRegistry.TIMETABLE);
  if (canViewASSIGNMENT) visibleEntries.push(entityRegistry.ASSIGNMENT);
  if (canViewATTENDANCE) visibleEntries.push(entityRegistry.ATTENDANCE);
  if (canViewFEE_MANAGEMENT) visibleEntries.push(entityRegistry.MYFEE);

  if (canViewEXAM) visibleEntries.push(entityRegistry.EXAM);
  if (canViewEXAM_TEACHER_VIEW)
    visibleEntries.push(entityRegistry.EXAM_TEACHER_VIEW);

  if (canViewPROFILE) visibleEntries.push(entityRegistry.PROFILE);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  // Grouping helpers
  const instituteGroupIds = [
    "INSTITUTE",
    "SCHOOL",
    "CLASSES",
    "DIVISION",
    "SUBJECT",
    "ROLE",
  ];
  const usersGroupIds = ["STUDENT", "TEACHER"];

  if (!user) {
    const AuthStack = createNativeStackNavigator();
    const AuthHost: React.FC = () => (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
        <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
      </AuthStack.Navigator>
    );

    return (
      <NavigationContainer>
        <AuthHost />
      </NavigationContainer>
    );
  }

  const DrawerHost: React.FC = () => (
    <Drawer.Navigator
      initialRouteName={
        visibleEntries.length ? visibleEntries[0].id : undefined
      }
      screenOptions={{
        headerTintColor: theme.colors.primary,
        drawerActiveBackgroundColor: theme.colors.primaryContainer,
        drawerActiveTintColor: theme.colors.primary,
        drawerType: "slide",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {visibleEntries.map((entry: { id: string; component: any }) => (
        <Drawer.Screen
          key={entry.id}
          name={entry.id}
          component={entry.component}
          options={{
             title: entry.title || entry.id,
             // Hiding default drawer item since we render custom list
             drawerItemStyle: { display: 'none' } 
          }}
        />
      ))}
    </Drawer.Navigator>
  );

  const addRouteMap: Record<string, string> = {
    STUDENT: "AddStudent",
    ROLE: "AddEditRole",
    DIVISION: "AddEditDivision",
    INSTITUTE: "AddEditInstitute",
    SCHOOL: "AddEditSchool",
    CLASSES: "AddEditClasses",
    SUBJECT: "AddEditSubject",
    TEACHER: "AddTeacher",
    TIMETABLE: "AddEditTimetable",
    ATTENDANCE: "AddAttendance",
  };

  function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { navigation } = props;

    // Check permissions
    const canAddStudent = useHasPermission({ entity: "STUDENT", action: "add" });
    const canAddROLE = useHasPermission({ entity: "ROLE", action: "add" });
    const canAddInstitute = useHasPermission({ entity: "INSTITUTE", action: "add" });
    const canAddSchool = useHasPermission({ entity: "SCHOOL", action: "add" });
    const canAddDivision = useHasPermission({ entity: "DIVISION", action: "add" });
    const canAddClasses = useHasPermission({ entity: "CLASS", action: "add" });
    const canAddSubject = useHasPermission({ entity: "SUBJECT", action: "add" });
    const canAddTeacher = useHasPermission({ entity: "TEACHER", action: "add" });
    const canAddTimetable = useHasPermission({ entity: "TIMETABLE", action: "add" });
    const canAddAttendance = useHasPermission({ entity: "ATTENDANCE", action: "add" });

    const addPermMap: Record<string, boolean> = {
      STUDENT: Boolean(canAddStudent),
      ROLE: Boolean(canAddROLE),
      INSTITUTE: Boolean(canAddInstitute),
      SCHOOL: Boolean(canAddSchool),
      DIVISION: Boolean(canAddDivision),
      SUBJECT: Boolean(canAddSubject),
      CLASSES: Boolean(canAddClasses),
      TEACHER: Boolean(canAddTeacher),
      TIMETABLE: Boolean(canAddTimetable),
      ATTENDANCE: Boolean(canAddAttendance),
    };

    // Centralized Icon Map using Material Community Icons
    const iconMap: Record<string, string> = {
      // Dashboards
      TEACHER_DASHBOARD: "view-dashboard",
      STUDENT_DASHBOARD: "view-dashboard-outline",

      // Institute
      INSTITUTE: "bank",
      SCHOOL: "office-building",
      CLASSES: "google-classroom", // or "domain"
      DIVISION: "chart-pie",
      SUBJECT: "book-open-page-variant",
      ROLE: "shield-account",

      // Users
      STUDENT: "account-school",
      TEACHER: "human-male-board",

      // Operations
      TIMETABLE: "calendar-clock",
      ASSIGNMENT: "clipboard-text-outline",
      ATTENDANCE: "calendar-check",
      FEE: "cash-multiple",
      MYFEE: "cash-multiple",
      ANNOUNCEMENT: "bullhorn",
      EXAM: "file-certificate-outline",
      EXAM_TEACHER_VIEW: "file-document-edit-outline",
      
      // Misc
      PROFILE: "account-circle-outline",
    };

    const displayName: string = ((user as any)?.name ||
      (user as any)?.firstName ||
      (user as any)?.username ||
      user?.role ||
      "User") as string;
    
    const notificationUnreadCount = 5;

    const renderDrawerItem = (entry: any) => {
      const showAdd = Boolean(addRouteMap[entry.id] && addPermMap[entry.id]);
      const entryIcon = iconMap[entry.id] ?? "circle-small";
      const isFocused = props.state.index === props.state.routes.findIndex(r => r.name === entry.id);

      return (
        <View 
            style={[
                styles.entryRow, 
                isFocused && { backgroundColor: '#f0ebf8' }
            ]} 
            key={entry.id}
        >
          <TouchableOpacity
            style={styles.entryTouchable}
            onPress={() => navigation.navigate(entry.id)}
          >
              <View style={[styles.iconBox, isFocused && { backgroundColor: '#fff' }]}>
                <Avatar.Icon
                  size={24}
                  icon={entryIcon}
                  color={isFocused ? theme.colors.primary : "#555"}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>
              <Text 
                style={[
                    styles.entryLabel, 
                    isFocused && { color: theme.colors.primary, fontWeight: '700' }
                ]}
              >
                {entry.title ?? entry.id}
              </Text>
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
    };

    return (
      <View style={styles.drawerContainer}>
        <LanguageSelector />
        <View style={{ marginBottom: 4 }}>
          <NotificationDrawerItem unreadCount={notificationUnreadCount} />
        </View>
        
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarLabel}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.role}>{(user as any)?.role ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.listContent}
        >
          {/* 1. Institute Group */}
          {visibleEntries.filter((e) => instituteGroupIds.includes(e.id)).length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Administration</Text>
              {visibleEntries
                .filter((entry) => instituteGroupIds.includes(entry.id))
                .map(renderDrawerItem)}
            </>
          )}

          {/* 2. Users Group */}
          {visibleEntries.filter((e) => usersGroupIds.includes(e.id)).length > 0 && (
            <>
              <Text style={styles.sectionHeader}>People</Text>
              {visibleEntries
                .filter((entry) => usersGroupIds.includes(entry.id))
                .map(renderDrawerItem)}
            </>
          )}

          {/* 3. Remaining Entries (Academics/Operations) */}
          {visibleEntries.some((e) => !instituteGroupIds.includes(e.id) && !usersGroupIds.includes(e.id)) && (
             <>
             <Text style={styles.sectionHeader}>Academics & Operations</Text>
             {visibleEntries
                .filter(
                  (e) =>
                    !instituteGroupIds.includes(e.id) &&
                    !usersGroupIds.includes(e.id)
                )
                .map(renderDrawerItem)}
             </>
          )}
        </DrawerContentScrollView>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainDrawer" component={DrawerHost} />

        {/* Global hidden screens */}
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
        <Stack.Screen name="TimetableView">
          {({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.timetableId ?? "";
            return <TimetableView id={String(id)} />;
          }}
        </Stack.Screen>
        <Stack.Screen name="ViewTimetable">
          {({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.timetableId ?? "";
            return <TimetableView id={String(id)} />;
          }}
        </Stack.Screen>
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
          name="AddEditRole"
          component={makeProtectedScreen(AddEditRole, permFrom("ROLE", "add"))}
        />
        <Stack.Screen
          name="EditStudent"
          component={makeProtectedScreen(
            AddEditStudent,
            permFrom("STUDENT", "edit")
          )}
        />
        <Stack.Screen
          name="AddEditDivision"
          component={makeProtectedScreen(
            AddEditDivision,
            permFrom("DIVISION", "add")
          )}
        />
        <Stack.Screen
          name="EditDivision"
          component={makeProtectedScreen(
            AddEditDivision,
            permFrom("DIVISION", "edit")
          )}
        />
        <Stack.Screen
          name="AddEditInstitute"
          component={makeProtectedScreen(
            AddEditInstitute,
            permFrom("INSTITUTE", "add")
          )}
        />
        <Stack.Screen
          name="AddEditSchool"
          component={makeProtectedScreen(
            AddEditSchool,
            permFrom("SCHOOL", "add")
          )}
        />
        <Stack.Screen
          name="AddEditClasses"
          component={makeProtectedScreen(
            AddEditClasses,
            permFrom("CLASS", "add")
          )}
        />
        <Stack.Screen
          name="editSubject"
          component={makeProtectedScreen(
            AddEditSubject,
            permFrom("SUBJECT", "edit")
          )}
        />
        <Stack.Screen
          name="AddEditSubject"
          component={makeProtectedScreen(
            AddEditSubject,
            permFrom("SUBJECT", "add")
          )}
        />
        <Stack.Screen
          name="EditInstitute"
          component={makeProtectedScreen(
            AddEditInstitute,
            permFrom("INSTITUTE", "edit")
          )}
        />
        <Stack.Screen name="StudentView">
          {({ route }: any) => {
            const id = route?.params?.id ?? route?.params?.studentId ?? "";
            return <StudentViewComponent id={String(id)} />;
          }}
        </Stack.Screen>

        <Stack.Screen name="StudentExamResult">
          {({ route }: any) => <StudentExamResult route={route} />}
        </Stack.Screen>
        <Stack.Screen name="TeacherExamView">
          {({ route }: any) => <TeacherExamView route={route} />}
        </Stack.Screen>

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