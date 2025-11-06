import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu } from 'react-native-paper';

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
  const [selectedSchool, setSelectedSchool] = useState<string | null>(filters.schoolId ?? null);
  const [selectedClass, setSelectedClass] = useState<string | null>(filters.classId ?? null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(filters.divisionId ?? null);
 const {
    schools = [],
    classes = [],
    divisions = [],
    loading,
  } = useSCDData() || {};
  // Menu visibility
  const [schoolMenuVisible, setSchoolMenuVisible] = useState(false);
  const [classMenuVisible, setClassMenuVisible] = useState(false);
  const [divisionMenuVisible, setDivisionMenuVisible] = useState(false);

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
    emitChange({ schoolId: id ?? '', classId: '', divisionId: '' });
    setClassMenuVisible(false);
    setDivisionMenuVisible(false);
    setSchoolMenuVisible(false);
  };

  const onSelectClass = (id: string | null) => {
    setSelectedClass(id);
    emitChange({ classId: id ?? '', divisionId: '' });
    setClassMenuVisible(false);
  };

  const onSelectDivision = (id: string | null) => {
    setSelectedDivision(id);
    emitChange({ divisionId: id ?? '' });
    setDivisionMenuVisible(false);
  };

  const clearAll = () => {
    setSelectedSchool(null);
    setSelectedClass(null);
    setSelectedDivision(null);
    emitChange({ schoolId: '', classId: '', divisionId: '' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {showSchool && (
          <Menu
            visible={schoolMenuVisible}
            onDismiss={() => setSchoolMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setSchoolMenuVisible(true)} style={styles.menuButton} disabled={loading}>
                {selectedSchool ? (schools.find(s => String(s.id) === String(selectedSchool))?.name ?? String(selectedSchool)) : 'All Schools'}
              </Button>
            }
          >
            <Menu.Item onPress={() => onSelectSchool(null)} title="All Schools" />
            {!disableSCDFilter && schools.map((s) => (
              <Menu.Item key={s.id} onPress={() => onSelectSchool(String(s.id))} title={s.name} />
            ))}
          </Menu>
        )}

        {showClass && (
          <Menu
            visible={classMenuVisible}
            onDismiss={() => setClassMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setClassMenuVisible(true)} style={styles.menuButton} disabled={loading || !classes.length}>
                {selectedClass ? (classes.find(c => String(c.id) === String(selectedClass))?.name ?? String(selectedClass)) : 'All Classes'}
              </Button>
            }
          >
            <Menu.Item onPress={() => onSelectClass(null)} title="All Classes" />
            {!disableSCDFilter && classes.map((c) => (
              <Menu.Item key={c.id} onPress={() => onSelectClass(String(c.id))} title={c.name} />
            ))}
          </Menu>
        )}

        {showDivision && (
          <Menu
            visible={divisionMenuVisible}
            onDismiss={() => setDivisionMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setDivisionMenuVisible(true)} style={styles.menuButton} disabled={loading || !divisions.length}>
                {selectedDivision ? (divisions.find(d => String(d.id) === String(selectedDivision))?.name ?? String(selectedDivision)) : 'All Divisions'}
              </Button>
            }
          >
            <Menu.Item onPress={() => onSelectDivision(null)} title="All Divisions" />
            {!disableSCDFilter && divisions.map((d) => (
              <Menu.Item key={d.id} onPress={() => onSelectDivision(String(d.id))} title={d.name} />
            ))}
          </Menu>
        )}

        <Button mode="text" onPress={clearAll} disabled={loading} style={styles.clearBtn}>
          Clear
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8 as any,
  },
  menuButton: {
    marginRight: 8,
    borderRadius: 8,
  },
  clearBtn: {
    marginLeft: 'auto',
  },
});

export default ListGridFilters;

