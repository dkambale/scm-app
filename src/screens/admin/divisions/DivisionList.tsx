import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReusableDataGrid } from '../../../components/common/ReusableDataGrid';
import { storage } from '../../../utils/storage';
import { useTranslation } from 'react-i18next';

const columnsConfig = [
  { key: 'name', header: 'Division Name' },
  { key: 'description', header: 'Description' },
];

const transformDivisionData = (division: any) => ({
  ...division,
  name: division.name || 'N/A',
  description: division.description || 'N/A',
});

export const DivisionList: React.FC = () => {
  const [fetchUrl, setFetchUrl] = useState('');
  const { t } = useTranslation('title');

  useEffect(() => {
    const initialize = async () => {
      const raw = await storage.getItem("SCM-AUTH");
      const accountId = raw ? JSON.parse(raw)?.data?.accountId : undefined;
      if (accountId) {
        setFetchUrl(`/api/divisions/getAll/${accountId}`);
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
        title={t('divisions')}
        fetchUrl={fetchUrl}
        columns={columnsConfig}
        isPostRequest={true}
        entityName="DIVISION"
        searchPlaceholder="Search divisions..."
        transformData={transformDivisionData}
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
