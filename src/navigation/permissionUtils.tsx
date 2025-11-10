import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

// PermCheck may be a string token (eg 'VIEW_STUDENTS'),
// an array of such tokens, or an object describing entity+action
// e.g. { entity: 'TEACHER', action: 'view' } or an array of those.
type PermObj = { entity: string; action: string };
type PermCheck = string | string[] | PermObj | PermObj[];

// Simple NoAccess screen shown when the user lacks permission
export const NoAccess: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Access denied</Text>
      <Text style={styles.message}>
        You do not have permission to view this screen.
      </Text>
      {onBack && <Button title="Go back" onPress={onBack} />}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  message: { fontSize: 14, color: "#666", marginBottom: 12 },
});

// Helper to create a protected screen component for react-navigation
// usage: component={makeProtectedScreen(MyScreen, 'VIEW_STUDENTS')}
export function makeProtectedScreen(
  Wrapped: React.ComponentType<any>,
  required: PermCheck
): React.ComponentType<any> {
  return function ProtectedScreen(props: any) {
    const { user, loading } = useAuth();
    // While auth state is loading, render nothing (or a small placeholder)
    if (loading) return null;
    const permsRaw = (
      user && Array.isArray((user as any).permissions)
        ? (user as any).permissions
        : []
    ) as any[];

    // use shared permission helper
    if (hasPermission(permsRaw, required)) {
      // forward route/navigation props
      return <Wrapped {...props} />;
    }

    // If not allowed, show NoAccess; provide onBack that navigates back if possible
    const onBack = props?.navigation?.goBack
      ? () => props.navigation.goBack()
      : undefined;
    return <NoAccess onBack={onBack} />;
  };
}

// Convenience function to derive permission token from entity/action like 'STUDENT','view'
export function permFrom(entity: string, action: string) {
  if (!entity || !action) return "";
  const verb = action.trim().toUpperCase();
  // map common verbs to permission verbs
  const verbMap: Record<string, string> = {
    view: "VIEW",
    edit: "EDIT",
    add: "CREATE",
    create: "CREATE",
    delete: "DELETE",
    pay: "PAY",
  } as any;
  const v = verbMap[action.toLowerCase()] || verb;

  // pluralize entity - simple rules for common terms
  const pluralMap: Record<string, string> = {
    CLASS: "CLASSES",
    STUDENT: "STUDENTS",
    TEACHER: "TEACHERS",
    ASSIGNMENT: "ASSIGNMENTS",
    FEE: "FEES",
    ROLE: "ROLES",
    SUBJECT: "SUBJECTS",
    TIMETABLE: "TIMETABLES",
    ATTENDANCE: "ATTENDANCE",
    INSTITUTE: "INSTITUTES",
    SCHOOL: "SCHOOLS",
  };

  const ent = pluralMap[entity.toUpperCase()] || entity.toUpperCase() + "S";
  return `${v}_${ent}`;
}

// Shared permission checking helper that works against the raw permissions array
export function hasPermission(permsRaw: any[], required: PermCheck): boolean {
  // helper: check object-shaped permissions list for entity/action
  const hasEntityAction = (entity: string, action: string) => {
    if (!entity || !action) return false;
    const eUpper = entity.toString().toUpperCase();
    const aLower = action.toString().toLowerCase();

    for (const p of permsRaw) {
      if (!p) continue;
      if (typeof p === "string") {
        const token = p.toUpperCase();
        const actionToken = aLower.toUpperCase();
        if (token.includes(actionToken) && token.includes(eUpper)) return true;
        continue;
      }

      const name = (p.entityName || p.name || "").toString().toUpperCase();
      if (name === eUpper) {
        const actions = p.actions || {};
        if (typeof actions === "object" && actions !== null) {
          if (actions[aLower] === true) return true;
          if (actions.view === true && aLower === "view") return true;
        }
      }
    }
    return false;
  };

  const tokenMatches = (token: string) => {
    if (!token) return false;
    const t = token.toString().trim().toUpperCase();
    const parts = t.split("_");
    if (parts.length >= 2) {
      const actionPart = parts[0];
      const entityPart = parts.slice(1).join("_");
      const actionMap: Record<string, string> = {
        VIEW: "view",
        EDIT: "edit",
        CREATE: "add",
        ADD: "add",
        DELETE: "delete",
        PAY: "pay",
      };
      const action = actionMap[actionPart] || actionPart.toLowerCase();
      if (hasEntityAction(entityPart, action)) return true;
      if (
        entityPart.endsWith("S") &&
        hasEntityAction(entityPart.slice(0, -1), action)
      )
        return true;
    }
    return false;
  };

  const check = (r: PermCheck): boolean => {
    if (!r) return true;
    if (Array.isArray(r)) return r.some((x) => check(x as PermCheck));
    if (typeof r === "object") {
      const obj = r as PermObj;
      return hasEntityAction(obj.entity, obj.action);
    }
    return tokenMatches(r as string);
  };

  return check(required);
}

// Hook for components to check permissions via context
export function useHasPermission(required: PermCheck): boolean {
  const { user, loading } = useAuth();
  if (loading) return false;
  const permsRaw = (
    user && Array.isArray((user as any).permissions)
      ? (user as any).permissions
      : []
  ) as any[];
  return hasPermission(permsRaw, required);
}
