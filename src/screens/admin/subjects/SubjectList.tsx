import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  { key: 'subjectCode', header: 'Subject Code' },

];

const transformSubjectsData = (subjectses: any) => ({
  ...subjectses,
 
});

export const SubjectsList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/subjects/getAll/${accountId}`);
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
        title="Subjects"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddEditSubject"
        editUrl="AddEditSubject"
        deleteUrl="/api/subjects/delete"
        entityName="Subject"
        searchPlaceholder="Search subjectses..."
        transformData={transformSubjectsData}
        enableFilters = {false}
  // showSchoolFilter = {true}
  // showClassFilter = {false}
  // showSubjectFilter = {false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SubjectsList;
