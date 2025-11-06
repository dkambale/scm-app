import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Menu, List } from "react-native-paper";
import { useSCDData } from "../../context/SCDProvider";

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
  // Menu visibility
  const [schoolMenuVisible, setSchoolMenuVisible] = useState(false);
  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [divisionMenuVisible, setDivisionMenuVisible] = useState(false);
  // Android modal fallback state
  const [androidPicker, setAndroidPicker] = useState<
    null | { type: "school" | "class" | "division" }
  >(null);

  useEffect(() => {
    setSelectedSchool(filters.schoolId ?? null);
    setSelectedClass(filters.classId ?? null);
    setSelectedDivision(filters.divisionId ?? null);
  }, [filters.schoolId, filters.classId, filters.divisionId]);

  const emitChange = (newValues: Record<string, any>) => {
    const payload = { ...(filters || {}), ...newValues };
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
    setSelectedSchool(null);
    setSelectedClass(null);
    setSelectedDivision(null);
    emitChange({ schoolId: "", classId: "", divisionId: "" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showSchool && (
          <>
            {Platform.OS === "android" ? (
              <Button
                mode="outlined"
                onPress={() => setAndroidPicker({ type: "school" })}
                style={styles.menuButton}
                disabled={loading}
              >
                {selectedSchool
                  ? (schools.find((s: any) => String(s.id) === String(selectedSchool))
                      ?.name ?? String(selectedSchool))
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
                    style={styles.menuButton}
                    disabled={loading}
                  >
                    {selectedSchool
                      ? schools.find((s) => String(s.id) === String(selectedSchool))
                          ?.name ?? String(selectedSchool)
                      : "All Schools"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectSchool(null)}
                  title="All Schools"
                />
                {!disableSCDFilter &&
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
                style={styles.menuButton}
                disabled={loading || !classes.length}
              >
                {selectedClass
                  ? (classes.find((c: any) => String(c.id) === String(selectedClass))
                      ?.name ?? String(selectedClass))
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
                    style={styles.menuButton}
                    disabled={loading || !classes.length}
                  >
                    {selectedClass
                      ? classes.find((c) => String(c.id) === String(selectedClass))
                          ?.name ?? String(selectedClass)
                      : "All Classes"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectClass(null)}
                  title="All Classes"
                />
                {!disableSCDFilter &&
                  classes.map((c: any) => (
                    <Menu.Item
                      key={c.id}
                      onPress={() => onSelectClass(String(c.id))}
                      title={c.name}
                    />
                  ))}
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
                style={styles.menuButton}
                disabled={loading || !divisions.length}
              >
                {selectedDivision
                  ? (divisions.find((d: any) => String(d.id) === String(selectedDivision))
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
                    style={styles.menuButton}
                    disabled={loading || !divisions.length}
                  >
                    {selectedDivision
                      ? divisions.find(
                          (d) => String(d.id) === String(selectedDivision)
                        )?.name ?? String(selectedDivision)
                      : "All Divisions"}
                  </Button>
                }
              >
                <Menu.Item
                  onPress={() => onSelectDivision(null)}
                  title="All Divisions"
                />
                {!disableSCDFilter &&
                  divisions.map((d: any) => (
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
            <View style={styles.androidModalOverlay}>
              <View style={styles.androidModalContent}>
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

                  {(androidPicker.type === "school" ? schools :
                    androidPicker.type === "class" ? classes : divisions
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
                <Button onPress={() => setAndroidPicker(null)}>
                  Close
                </Button>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
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
  menuButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  clearBtn: {
    marginLeft: "auto",
  },
});

export default ListGridFilters;
