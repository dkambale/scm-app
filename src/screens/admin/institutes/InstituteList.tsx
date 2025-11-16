import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { useTranslation } from 'react-i18next';

const columnsConfig = [
  { key: 'name', header: 'Institute Name' },
  { key: 'address', header: 'Address' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
];

const transformInstituteData = (institute: any) => ({
  ...institute,
  name: institute.name || 'N/A',
  address: institute.address || 'N/A',
  email: institute.email || 'N/A',
  phone: institute.phone || institute.mobile || 'N/A',
});

export const InstituteList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');
  const { t } = useTranslation('title');

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
    return null;
  }

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title={t('institutesItem')}
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        entityName="INSTITUTE"
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
