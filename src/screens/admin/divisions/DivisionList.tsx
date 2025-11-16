import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  { key: 'className', header: 'Class' },
  { key: 'schoolName', header: 'School' },
  { key: 'capacity', header: 'Capacity' },
  { key: 'description', header: 'Description' },
];

const transformDivisionData = (division: any) => ({
  ...division,
  className: division.class?.name || division.className || 'N/A',
  schoolName: division.school?.name || division.schoolName || 'N/A',
  capacity: division.capacity || 'N/A',
  description: division.description || 'N/A',
});

export const DivisionList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/divisions/getAll/${accountId}`);
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
        title="Divisions"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddDivision"
        editUrl="EditDivision"
        deleteUrl="/api/divisions/delete"
        entityName="Division"
        searchPlaceholder="Search divisions..."
        transformData={transformDivisionData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DivisionList;
