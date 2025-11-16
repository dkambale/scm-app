import React from 'react';
import { View, StyleSheet } from 'react-native';
import ReusableDataGrid from '../../../components/common/ReusableDataGrid';
import { useTranslation } from 'react-i18next';
import { storage } from '../../../utils/storage';

export const ClassList: React.FC = () => {
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

  const classColumns = [
    { key: 'name', header: 'Class Name' },
    { key: 'description', header: 'Description' },
    { key: 'section', header: 'Section' },
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
        title={t('classes.title')}
        columns={classColumns}
        fetchUrl={`/api/schoolClasses/getAll/${accountId}`}
        deleteUrl="/api/schoolClasses/delete"
        entityName="CLASS"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ClassList;
