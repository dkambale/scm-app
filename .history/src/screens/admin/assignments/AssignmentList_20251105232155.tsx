import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { userDetails } from '../../../api';

const columnsConfig = [
  { key: 'name', header: 'name' },
  { key: 'subjectName', header: 'Subject Name' },
  { key: 'status', header: 'Status' },
  { key: 'deadLine', header: 'Deadline' },
  { key: 'className', header: 'Class' },
  { key: 'divisionName', header: 'Division' },
];

const transformAssignmentData = (assignment: any) => ({
  ...assignment,
    name: assignment.name || 'N/A',
//   schoolName,
//   className,
//   divisionName 
});

export const AssignmentList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
          const accountId = userDetai.getAccountId();

      if (accountId) {
        setFetchUrl(`/api/assignments/getAllBy/${accountId}`);
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
        title="Assignments"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddAssignment"
        editUrl="EditAssignment"
        deleteUrl="/api/users/delete"
        entityName="Assignment"
        searchPlaceholder="Search assignments..."
        transformData={transformAssignmentData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AssignmentList;
