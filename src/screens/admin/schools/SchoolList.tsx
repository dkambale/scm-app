import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { useTranslation } from 'react-i18next';

const columnsConfig = [
  { key: 'name', header: 'School Name' },
  { key: 'address', header: 'Address' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
];

const transformSchoolData = (school: any) => ({
  ...school,
  name: school.name || 'N/A',
  address: school.address || 'N/A',
  email: school.email || 'N/A',
  phone: school.phone || school.mobile || 'N/A',
});

export const SchoolList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');
  const { t } = useTranslation('title');

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
    return null;
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title={t('schools')}
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        entityName="SCHOOL"
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
