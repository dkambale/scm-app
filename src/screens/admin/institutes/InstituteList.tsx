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
  { key: 'type', header: 'Type' },
];

const transformInstituteData = (institute: any) => ({
  ...institute,
  contactNumber: institute.contactNumber || institute.mobile || institute.phone || 'N/A',
  email: institute.email || 'N/A',
  address: institute.address || 'N/A',
  city: institute.city || 'N/A',
  state: institute.state || 'N/A',
  pincode: institute.pincode || 'N/A',
  type: institute.type || 'N/A',
});

export const InstituteList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/institutes/getAll/${accountId}`);
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
        title="Institutes"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddInstitute"
        editUrl="EditInstitute"
        deleteUrl="/api/institutes/delete"
        entityName="Institute"
        searchPlaceholder="Search institutes..."
        transformData={transformInstituteData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default InstituteList;
