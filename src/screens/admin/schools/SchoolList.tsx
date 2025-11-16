import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';

const columnsConfig = [
  { key: 'name', header: 'Name' },
  { key: 'address', header: 'Address' },
  { key: 'city', header: 'City' },
  { key: 'state', header: 'State' },
  { key: 'pincode', header: 'Pincode' },
  { key: 'contactNumber', header: 'Contact' },
  { key: 'email', header: 'Email' },
];

const transformSchoolData = (school: any) => ({
  ...school,
  contactNumber: school.contactNumber || school.mobile || school.phone || 'N/A',
  email: school.email || 'N/A',
  address: school.address || 'N/A',
  city: school.city || 'N/A',
  state: school.state || 'N/A',
  pincode: school.pincode || 'N/A',
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
        deleteUrl="/api/schoolBranches/delete"
        entityName="School"
        searchPlaceholder="Search schools..."
        transformData={transformSchoolData}
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
