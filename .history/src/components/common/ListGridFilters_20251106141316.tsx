import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Text, ActivityIndicator } from 'react-native-paper';

interface Props {
  filters?: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  showSchool?: boolean;
  showClass?: boolean;
  showDivision?: boolean;
  schools?: Array<any>;
  classes?: Array<any>;
  divisions?: Array<any>;
  loading?: boolean;
  disableSCDFilter?: boolean;
}

const ListGridFilters: React.FC<Props> = ({
  filters = {},
  onFiltersChange,
  showSchool = true,
  showClass = true,
  showDivision = true,
  schools = [],
  classes = [],
  divisions = [],
  loading = false,
  disableSCDFilter = false,
}) => {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(filters.schoolId ?? null);
  const [selectedClass, setSelectedClass] = useState<string | null>(filters.classId ?? null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(filters.divisionId ?? null);

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
// src/ui-component/ListGridFilters.jsx
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { useTranslation } from 'react-i18next'; // added

const ListGridFilters = ({
  filters = {},
  onFiltersChange,
  showSchool = true,
  showClass = true,
  showDivision = true,
  showClearAll = true,
  ActiveFiltersDisplay = true,
  // new props to receive SCD lists
  schools = [],
  classes = [],
  divisions = [],
  loading = false,
  disableSCDFilter = false
}) => {
  const { t } = useTranslation('ListGridFilters'); // added

  // Local controlled state synced with incoming filters prop to ensure UI reflects external changes
  const [selectedSchool, setSelectedSchool] = useState(filters.schoolId || '');
  const [selectedClass, setSelectedClass] = useState(filters.classId || '');
  const [selectedDivision, setSelectedDivision] = useState(filters.divisionId || '');

  // keep local state in sync when parent passes new filters (important after container enforcement)
  useEffect(() => {
    setSelectedSchool(filters.schoolId ?? '');
    setSelectedClass(filters.classId ?? '');
    setSelectedDivision(filters.divisionId ?? '');
  }, [filters.schoolId, filters.classId, filters.divisionId]);

  const emitChange = (newValues) => {
    const payload = { ...(filters || {}), ...newValues };
    onFiltersChange(payload);
  };

  const handleSchoolChange = (e) => {
    const { value } = e.target;
    setSelectedSchool(value);
    setSelectedClass('');
    setSelectedDivision('');
    emitChange({ schoolId: value, classId: '', divisionId: '' });
  };

  const handleClassChange = (e) => {
    const { value } = e.target;
    setSelectedClass(value);
    setSelectedDivision('');
    emitChange({ classId: value, divisionId: '' });
  };

  const handleDivisionChange = (e) => {
    const { value } = e.target;
    setSelectedDivision(value);
    emitChange({ divisionId: value });
  };

  const clearAll = () => {
    setSelectedSchool('');
    setSelectedClass('');
    setSelectedDivision('');
    onFiltersChange({ schoolId: '', classId: '', divisionId: '' });
  };

  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
      <Grid container spacing={2}>
        {showSchool && (
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>{t('label.school')}</InputLabel>
              <Select value={selectedSchool} label={t('label.school')} onChange={handleSchoolChange}>
                <MenuItem value="">
                  <em>{t('option.allSchools')}</em>
                </MenuItem>
                {!disableSCDFilter &&
                  Array.isArray(schools) &&
                  schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {showClass && (
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small" disabled={loading || !classes.length}>
              <InputLabel>{t('label.class')}</InputLabel>
              <Select value={selectedClass} label={t('label.class')} onChange={handleClassChange}>
                <MenuItem value="">
                  <em>{t('option.allClasses')}</em>
                </MenuItem>
                {!disableSCDFilter &&
                  classes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {showDivision && (
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small" disabled={loading || !divisions.length}>
              <InputLabel>{t('label.division')}</InputLabel>
              <Select value={selectedDivision} label={t('label.division')} onChange={handleDivisionChange}>
                <MenuItem value="">
                  <em>{t('option.allDivisions')}</em>
                </MenuItem>
                {!disableSCDFilter &&
                  divisions.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {showClearAll &&  (
          <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="outlined" onClick={clearAll}>
              {t('action.clear')}
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

ListGridFilters.propTypes = {
  filters: PropTypes.object,
  onFiltersChange: PropTypes.func.isRequired,
  showSchool: PropTypes.bool,
  showClass: PropTypes.bool,
  showDivision: PropTypes.bool,
  showClearAll: PropTypes.bool,
  ActiveFiltersDisplay: PropTypes.bool,
  schools: PropTypes.array,
  classes: PropTypes.array,
  divisions: PropTypes.array,
  loading: PropTypes.bool,
  disableSCDFilter: PropTypes.bool
};

ListGridFilters.defaultProps = {
  showSchool: true,
  showClass: true,
  showDivision: true,
  showClearAll: true,
  schools: [],
  classes: [],
  divisions: [],
  loading: false
};

export default ListGridFilters;
