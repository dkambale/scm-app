import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  // { key: 'instituteId', header: 'institute Id' },

];

const transformDivisionsData = (divisionses: any) => ({
  ...divisionses,
 
});

export const DivisionsList: React.FC = () => {
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
        addActionUrl="AddEditDivision"
        editUrl="AddEditDivision"
        deleteUrl="/api/divisions/delete"
        entityName="Division"
        searchPlaceholder="Search divisionses..."
        transformData={transformDivisionsData}
        enableFilters = {false}
  // showSchoolFilter = {true}
  // showClassFilter = {false}
  // showDivisionFilter = {false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DivisionsList;
