import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import entityRegistry from "./entityRegistry";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import LanguageSelector from "../components/common/LanguageSelector";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useHasPermission } from "./permissionUtils";

export const RootNavigation: React.FC = () => {
  const { user, loading } = useAuth();

  const Drawer = createDrawerNavigator();

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

  return (
    <>
      <LanguageSelector />
      <NavigationContainer>
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
      </NavigationContainer>
    </>
  );
};
