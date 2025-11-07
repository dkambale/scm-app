import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'schoolName', header: 'School Name' },
  { key: 'className', header: 'Class Name' },
  { key: 'divisionName', header: 'Devision Name' },
];

const transformTimetableData = (timetable: any) => ({
  ...timetable,
  name: `${timetable.firstName || ''} ${timetable.lastName || ''}`.trim(),
});

export const TimetableList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/timetable/getAllBy/${accountId}`);
      }
    };
    initialize();
  }, []);

  if (!fetchUrl) {
    return null; // Or a loading indicator
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title="Timetables"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddEditTimetable"
        editUrl="AddEditTimetable"
        deleteUrl="/api/users/delete"
        entityName="Timetable"
        searchPlaceholder="Search timetables..."
        transformData={transformTimetableData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TimetableList;
