import React from 'react';
import { View, StyleSheet } from 'react-native';
import ReusableDataGrid from '../../../../components/common/ReusableDataGrid';
import { useTranslation } from 'react-i18next';
import { storage } from '../../../utils/storage';

export const InstituteList: React.FC = () => {
  const { t } = useTranslation('title');
  const [accountId, setAccountId] = React.useState('');

  React.useEffect(() => {
    const getAccountId = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const id = raw ? JSON.parse(raw)?.data?.accountId : '';
      setAccountId(id);
    };
    getAccountId();
  }, []);

  const instituteColumns = [
    { key: 'name', header: 'Institute Name' },
    { key: 'address', header: 'Address' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { 
      key: 'actions', 
      header: 'Actions', 
      isAction: true,
    },
  ];

  if (!accountId) return null;

  return (
    <View style={styles.container}>
      <ReusableDataGrid
        title={t('institutesItem')}
        columns={instituteColumns}
        fetchUrl={`/api/institutes/getAll/${accountId}`}
        deleteUrl="/api/institutes/delete"
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
