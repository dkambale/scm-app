import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { userDetails } from "../../../utils/apiService";

const columnsConfig = [
  { key: 'name', header: 'Role Name' },

];

const transformRoleData = (role: any) => ({
  ...role,
  roleName: role.roleName,
  
});

export const RoleList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const accountId = await userDetails.getAccountId();
      // const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/roles/getAll/${accountId}`);
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
        title="Roles"
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}

        // editUrl='AddEdit'
        addActionUrl='AddEditRole'
        editUrl="AddEditRole"

        entityName="Role"
        searchPlaceholder="Search roles..."
        transformData={transformRoleData}
        
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default RoleList;
