import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'subjectName', header: 'Subject' },
  { key: 'classesDate', header: 'Classes Date' },
  { key: 'className', header: 'Class' },
  { key: 'schoolName', header: 'School' },
  { key: 'divisionName', header: 'Division' },

];

const transformClassesData = (classes: any) => ({
  ...classes,
 
});

export const ClassesList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/schoolClasses/getAllBy/${accountId}`);
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
        title="Classess"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddClasses"
        editUrl="EditClasses"
        deleteUrl="/api/schoolClasses/delete"
        entityName="Classes"
        searchPlaceholder="Search classess..."
        transformData={transformClassesData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ClassesList;
