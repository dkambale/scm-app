import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'schoolName', header: 'School' },
  { key: 'capacity', header: 'Capacity' },
];

const transformClassData = (classItem: any) => ({
  ...classItem,
  schoolName: classItem.school?.name || 'N/A',
  description: classItem.description || 'N/A',
  capacity: classItem.capacity || 'N/A',
});

export const ClassList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/schoolClasses/getAll/${accountId}`);
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
        title="Classes"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddClass"
        editUrl="EditClass"
        deleteUrl="/api/schoolClasses/delete"
        entityName="Class"
        searchPlaceholder="Search classes..."
        transformData={transformClassData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ClassList;
