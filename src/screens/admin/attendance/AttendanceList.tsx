import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'subjectName', header: 'Subject' },
  { key: 'attendanceDate', header: 'Attendance Date' },
  { key: 'className', header: 'Class' },
  { key: 'schoolName', header: 'School' },
  { key: 'divisionName', header: 'Division' },
  // { key: 'schoolName', header: 'School' },
  // { key: 'className', header: 'Class' },
  // { key: 'divisionName', header: 'Division' },
];

const transformAttendanceData = (attendance: any) => ({
  ...attendance,
 
});

export const AttendanceList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/attendance/getAllBy/${accountId}`);
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
        title="Attendances"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddAttendance"
        editUrl="EditAttendance"
        deleteUrl="/api/users/delete"
        entityName="Attendance"
        searchPlaceholder="Search attendances..."
        transformData={transformAttendanceData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AttendanceList;
