import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
// //             "id": 1,
//             "name": "Mahatma Gandhi Institute of Technology",
//             "address": "10, University Road, Baner",
//             "mobileNumber": 9876543210,
//             "email": "contact@mgit.edu.in",
//             "faxNumber": "020-25890123",
//             "code": "MGIT-PUN-01",
//             "accountId": 10,
//             "createdBy": "system",
//             "modifiedBy": "system",
//             "addressLine2": "MAGARAPATA",
//             "city": "pune",
//             "state": "Maharashtra",
//             "country": null,
//             "zipCode": "411025"

// add all of this here  in columnsConfig  

const columnsConfig = [
  // { key: 'id', title: 'ID', width: 50 },
  { key: 'name', header: 'Name', width: 200 },
  { key: 'address', header: 'Address', width: 350 },
  { key: 'mobileNumber', header: 'Mobile Number', width: 150 },
  { key: 'email', header: 'Email', width: 200 },
  { key: 'faxNumber', header: 'Fax Number', width: 150 },
  { key: 'code', header: 'Code', width: 100 },
  { key: 'accountId', header: 'Account ID', width: 100 },
  { key: 'createdBy', header: 'Created By', width: 150 },
  { key: 'modifiedBy', header: 'Modified By', width: 150 },
  { key: 'addressLine2', header: 'Address Line 2', width: 200 },
  { key: 'city', header: 'City', width: 100 },
  { key: 'state', header: 'State', width: 100 },
  { key: 'country', header: 'Country', width: 100 },
  { key: 'zipCode', header: 'Zip Code', width: 100 },
];

const transformInstituteData = (institutees: any) => ({
  ...institutees,
 
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
        title="Institute"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        addActionUrl="AddInstitute"
        editUrl="EditInstitute"
        deleteUrl="/api/users/delete"
        entityName="Institute"
        searchPlaceholder="Search institutees..."
        transformData={transformInstituteData}
        enableFilters = {false}
//   showInstituteFilter = {true}
//   showInstituteFilter = {true}
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

export default InstituteList;
