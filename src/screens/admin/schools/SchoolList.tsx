import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  { key: 'address', header: 'Address' },
  { key: 'mobileNumber', header: 'Mobile number' },
  { key: 'email', header: 'Emain' },
  { key: 'faxNumber', header: 'Fax number' },
  { key: 'instituteId', header: 'Institute ID' },
  { key: 'code', header: 'code' },
];

const transformSchoolData = (school: any) => ({
  ...school,
 
});

export const SchoolList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/schoolBranches/getAll/${accountId}`);
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
        title="Schools"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddSchool"
        editUrl="EditSchool"
        deleteUrl="/api/users/delete"
        entityName="School"
        searchPlaceholder="Search schools..."
        transformData={transformSchoolData}
        enableFilters = {false}
//   showSchoolFilter = {true}
//   showClassFilter = {true}
//   showDivisionFilter = {true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SchoolList;
