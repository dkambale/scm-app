import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Button,
  Menu,
  List,
  Text,
  useTheme,
  Surface,
  IconButton,
} from "react-native-paper";
import { useSCDData } from "../../context/SCDProvider";
import { userDetails } from "../../api";

interface Props {
  filters?: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  showSchool?: boolean;
  showClass?: boolean;
  showDivision?: boolean;
  schools?: any[];
  classes?: any[];
  divisions?: any[];
  loading?: boolean;
  disableSCDFilter?: boolean;
}

const ListGridFilters: React.FC<Props> = ({
  filters = {},
  onFiltersChange,
  showSchool = true,
  showClass = true,
  showDivision = true,

  loading = false,
  disableSCDFilter = false,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(
    filters.schoolId ?? null
  );
  const [selectedClass, setSelectedClass] = useState<string | null>(
    filters.classId ?? null
  );
  const [selectedDivision, setSelectedDivision] = useState<string | null>(
    filters.divisionId ?? null
  );
  const { schools = [], classes = [], divisions = [] } = useSCDData() || {};
  const theme = useTheme();
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<any[]>([]);
  const [localDisableSCDFilter, setLocalDisableSCDFilter] =
    useState<boolean>(disableSCDFilter);
  const [localUserType, setLocalUserType] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  // Menu visibility
  const [schoolMenuVisible, setSchoolMenuVisible] = useState(false);
  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [divisionMenuVisible, setDivisionMenuVisible] = useState(false);
  // Android modal fallback state
  const [androidPicker, setAndroidPicker] = useState<null | {
    type: "school" | "class" | "division";
  }>(null);

  useEffect(() => {
    setSelectedSchool(filters.schoolId ?? null);
    setSelectedClass(filters.classId ?? null);
    setSelectedDivision(filters.divisionId ?? null);
  }, [filters.schoolId, filters.classId, filters.divisionId]);

  // Load persisted user and apply role-specific defaults/limitations
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const uType = await userDetails.getUserType();
        const u = await userDetails.getUser();
        if (!mounted) return;
        setLocalUserType(uType || null);
        setLocalUser(u || null);

        // TEACHER: restrict to allocatedClasses (preselect first allocated class)
        if (uType === "TEACHER" && u?.allocatedClasses?.length) {
          // Map allocatedClasses to class-like objects for menus
          const mapped = u.allocatedClasses.map((ac: any) => ({
            id: String(ac.classId ?? ac.id ?? ""),
            name: ac.className ?? `Class ${ac.classId ?? ac.id}`,
            divisionId: ac.divisionId ?? null,
          }));
          setFilteredClasses(mapped);
          // If division info present, map divisions too
          const mappedDivs = mapped
            .filter((m: any) => m.divisionId)
            .map((m: any) => ({
              id: String(m.divisionId),
              name: String(m.divisionId),
            }));
          setFilteredDivisions(mappedDivs);

          // Preselect first allocated class/division and emit change
          const first = mapped[0];
          if (first) {
            setSelectedClass(first.id);
            if (first.divisionId) setSelectedDivision(String(first.divisionId));
            // set the selectedSchool from user but hide the school control
            if (u?.schoolId) setSelectedSchool(String(u.schoolId));
            // Use user's schoolId in the emitted payload
            emitChange({
              schoolId: u?.schoolId ?? "",
              classId: first.id ?? "",
              divisionId: first.divisionId ?? "",
            });
          }
          // For teachers: allow class/division selection from allocatedClasses but hide school selector
          setLocalDisableSCDFilter(false);
        }

        // STUDENT: preselect school/class/division and disable filters
        if (uType === "STUDENT" && u) {
          const sId = u.schoolId ?? "";
          const cId = u.classId ?? "";
          const dId = u.divisionId ?? "";
          setSelectedSchool(sId ? String(sId) : null);
          setSelectedClass(cId ? String(cId) : null);
          setSelectedDivision(dId ? String(dId) : null);
          // Emit payload immediately with user's SCD
          emitChange({ schoolId: sId, classId: cId, divisionId: dId });
          setLocalDisableSCDFilter(true);
        }
      } catch {
        // ignore
      }
    };

    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = async (newValues: Record<string, any>) => {
    // prefer cached localUser/localUserType to avoid repeated reads
    const userType = localUserType ?? (await userDetails.getUserType());
    const user = localUser ?? (await userDetails.getUser());

    let payload = { ...(filters || {}), ...newValues };

    if (userType === "STUDENT") {
      payload = {
        schoolId: user?.schoolId ?? payload.schoolId ?? "",
        classId: user?.classId ?? payload.classId ?? "",
        divisionId: user?.divisionId ?? payload.divisionId ?? "",
      };
    }

    if (userType === "TEACHER") {
      // enforce teacher's school from their profile and allow class/div selection among allocatedClasses
      payload.schoolId = user?.schoolId ?? payload.schoolId ?? "";
    }

    onFiltersChange(payload);
  };

  const onSelectSchool = (id: string | null) => {
    setSelectedSchool(id);
    // reset class/division when school changes
    emitChange({ schoolId: id ?? "", classId: "", divisionId: "" });
    setClassMenuVisible(false);
    setDivisionMenuVisible(false);
    setSchoolMenuVisible(false);
  };

  const onSelectClass = (id: string | null) => {
    setSelectedClass(id);
    emitChange({ classId: id ?? "", divisionId: "" });
    setClassMenuVisible(false);
  };

  const onSelectDivision = (id: string | null) => {
    setSelectedDivision(id);
    emitChange({ divisionId: id ?? "" });
    setDivisionMenuVisible(false);
  };

  const clearAll = () => {
    if (localUserType === "TEACHER" && localUser?.schoolId) {
      // For teachers keep their school visible programmatically
      setSelectedSchool(String(localUser.schoolId));
      setSelectedClass(null);
      setSelectedDivision(null);
      emitChange({
        schoolId: String(localUser.schoolId),
        classId: "",
        divisionId: "",
      });
      return;
    }

    setSelectedSchool(null);
    setSelectedClass(null);
    setSelectedDivision(null);
    emitChange({ schoolId: "", classId: "", divisionId: "" });
  };

  // Effective flags
  const effectiveShowSchool = showSchool && localUserType !== "TEACHER";

  // If the current user is a STUDENT, hide the filters entirely per requirement
  if (localUserType === "STUDENT") {
    return null;
  }

  return (
    <Surface style={[styles.container, { backgroundColor: "#ffffffff" }]}>
      <View style={styles.headerRow}>
        <Text variant="titleSmall" style={{ color: "#111", fontWeight: "700" }}>
          Filters
        </Text>
        <IconButton icon="filter-variant" size={20} onPress={() => {}} />
      </View>
      <View style={styles.row}>
        {effectiveShowSchool && (
          <>
            {Platform.OS === "android" ? (
              <Button
                mode="outlined"
                onPress={() => setAndroidPicker({ type: "school" })}
                style={[
                  styles.menuButton,
                  { borderColor: theme.colors.outline },
                ]}
                contentStyle={styles.menuButtonContent}
                labelStyle={{ color: "#000" }}
                disabled={loading}
              >
                {selectedSchool
                  ? schools.find(
                      (s: any) => String(s.id) === String(selectedSchool)
                    )?.name ?? String(selectedSchool)
                  : "All Schools"}
              </Button>
            ) : (
              <Menu
                visible={schoolMenuVisible}
                onDismiss={() => setSchoolMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setSchoolMenuVisible(true)}
                    style={[
                      styles.menuButton,
                      { borderColor: theme.colors.outline },
                    ]}
                    contentStyle={styles.menuButtonContent}
                    labelStyle={{ color: "#000" }}
                    disabled={loading}
                  >
                    {selectedSchool
                      ? schools.find(
                          (s: any) => String(s.id) === String(selectedSchool)
                        )?.name ?? String(selectedSchool)
                      : "All Schools"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectSchool(null)}
                  title="All Schools"
                />
                {!localDisableSCDFilter &&
                  schools.map((s: any) => (
                    <Menu.Item
                      key={s.id}
                      onPress={() => onSelectSchool(String(s.id))}
                      title={s.name}
                    />
                  ))}
              </Menu>
            )}
          </>
        )}

        {showClass && (
          <>
            {Platform.OS === "android" ? (
              <Button
                mode="outlined"
                onPress={() => setAndroidPicker({ type: "class" })}
                style={[
                  styles.menuButton,
                  { borderColor: theme.colors.outline },
                ]}
                contentStyle={styles.menuButtonContent}
                labelStyle={{ color: "#000" }}
                disabled={
                  loading || !(filteredClasses.length || classes.length)
                }
              >
                {selectedClass
                  ? (filteredClasses.length ? filteredClasses : classes).find(
                      (c: any) => String(c.id) === String(selectedClass)
                    )?.name ?? String(selectedClass)
                  : "All Classes"}
              </Button>
            ) : (
              <Menu
                visible={classMenuVisible}
                onDismiss={() => setClassMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setClassMenuVisible(true)}
                    style={[
                      styles.menuButton,
                      { borderColor: theme.colors.outline },
                    ]}
                    contentStyle={styles.menuButtonContent}
                    labelStyle={{ color: "#000" }}
                    disabled={
                      loading || !(filteredClasses.length || classes.length)
                    }
                  >
                    {selectedClass
                      ? (filteredClasses.length
                          ? filteredClasses
                          : classes
                        ).find(
                          (c: any) => String(c.id) === String(selectedClass)
                        )?.name ?? String(selectedClass)
                      : "All Classes"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectClass(null)}
                  title="All Classes"
                />
                {!localDisableSCDFilter &&
                  // if filteredClasses exist (teacher), use them else use global classes
                  (filteredClasses.length ? filteredClasses : classes).map(
                    (c: any) => (
                      <Menu.Item
                        key={c.id}
                        onPress={() => onSelectClass(String(c.id))}
                        title={c.name}
                      />
                    )
                  )}
              </Menu>
            )}
          </>
        )}

        {showDivision && (
          <>
            {Platform.OS === "android" ? (
              <Button
                mode="outlined"
                onPress={() => setAndroidPicker({ type: "division" })}
                style={[
                  styles.menuButton,
                  { borderColor: theme.colors.outline },
                ]}
                contentStyle={styles.menuButtonContent}
                labelStyle={{ color: "#000" }}
                disabled={
                  loading || !(filteredDivisions.length || divisions.length)
                }
              >
                {selectedDivision
                  ? (filteredDivisions.length
                      ? filteredDivisions
                      : divisions
                    ).find(
                      (d: any) => String(d.id) === String(selectedDivision)
                    )?.name ?? String(selectedDivision)
                  : "All Divisions"}
              </Button>
            ) : (
              <Menu
                visible={divisionMenuVisible}
                onDismiss={() => setDivisionMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setDivisionMenuVisible(true)}
                    style={[
                      styles.menuButton,
                      { borderColor: theme.colors.outline },
                    ]}
                    contentStyle={styles.menuButtonContent}
                    labelStyle={{ color: "#000" }}
                    disabled={
                      loading || !(filteredDivisions.length || divisions.length)
                    }
                  >
                    {selectedDivision
                      ? (filteredDivisions.length
                          ? filteredDivisions
                          : divisions
                        ).find(
                          (d: any) => String(d.id) === String(selectedDivision)
                        )?.name ?? String(selectedDivision)
                      : "All Divisions"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectDivision(null)}
                  title="All Divisions"
                />
                {!localDisableSCDFilter &&
                  // show filtered divisions if present (teacher) else global
                  (filteredDivisions.length
                    ? filteredDivisions
                    : divisions
                  ).map((d: any) => (
                    <Menu.Item
                      key={d.id}
                      onPress={() => onSelectDivision(String(d.id))}
                      title={d.name}
                    />
                  ))}
              </Menu>
            )}
          </>
        )}

        <Button
          mode="text"
          onPress={clearAll}
          disabled={loading}
          style={styles.clearBtn}
          labelStyle={{ color: theme.colors.primary }}
        >
          Clear
        </Button>

        {/* Android modal fallback for selection lists */}
        {Platform.OS === "android" && androidPicker && (
          <Modal
            visible={!!androidPicker}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAndroidPicker(null)}
          >
            <View
              style={[
                styles.androidModalOverlay,
                { backgroundColor: "rgba(0,0,0,0.5)" },
              ]}
            >
              <View
                style={[
                  styles.androidModalContent,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <ScrollView>
                  <TouchableOpacity
                    onPress={() => {
                      if (androidPicker.type === "school") onSelectSchool(null);
                      if (androidPicker.type === "class") onSelectClass(null);
                      if (androidPicker.type === "division")
                        onSelectDivision(null);
                      setAndroidPicker(null);
                    }}
                  >
                    <List.Item title="All" />
                  </TouchableOpacity>

                  {(androidPicker.type === "school"
                    ? schools
                    : androidPicker.type === "class"
                    ? filteredClasses.length
                      ? filteredClasses
                      : classes
                    : filteredDivisions.length
                    ? filteredDivisions
                    : divisions
                  ).map((it: any) => (
                    <TouchableOpacity
                      key={it.id}
                      onPress={() => {
                        if (androidPicker.type === "school")
                          onSelectSchool(String(it.id));
                        if (androidPicker.type === "class")
                          onSelectClass(String(it.id));
                        if (androidPicker.type === "division")
                          onSelectDivision(String(it.id));
                        setAndroidPicker(null);
                      }}
                    >
                      <List.Item title={it.name} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Button onPress={() => setAndroidPicker(null)}>Close</Button>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8 as any,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuButtonContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 42,
  },
  menuButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  clearBtn: {
    marginLeft: "auto",
  },
  androidModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(222, 122, 122, 0.4)",
    justifyContent: "center",
    padding: 20,
  },
  androidModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxHeight: "70%",
    padding: 8,
  },
});

export default ListGridFilters;
