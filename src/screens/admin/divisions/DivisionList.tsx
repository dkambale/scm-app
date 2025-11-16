import React from 'react';
import { View, StyleSheet } from 'react-native';
import ReusableDataGrid from '../../../components/common/ReusableDataGrid';
import { useTranslation } from 'react-i18next';
import { storage } from '../../../utils/storage';

export const DivisionList: React.FC = () => {
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

  const divisionColumns = [
    { key: 'name', header: 'Division Name' },
    { key: 'description', header: 'Description' },
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
        title={t('divisions')}
        columns={divisionColumns}
        fetchUrl={`/api/divisions/getAll/${accountId}`}
        deleteUrl="/api/divisions/delete"
        entityName="DIVISION"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DivisionList;
